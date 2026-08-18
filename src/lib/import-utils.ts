import * as XLSX from 'xlsx';
import {
  AttendanceStatus,
  EventCategory,
  EventModality,
  ParticipantRole,
  PFIEvent,
  PROGRAMAS_ACADEMICOS,
  UserProfile,
} from './types';

export interface ParseValidationResult<T> {
  total: number;
  valid: T[];
  invalid: {
    row: number;
    raw: Record<string, any>;
    errors: string[];
  }[];
}

export interface ParsedAttendanceRecord {
  student_id: string;
  matricula: string;
  nombre_estudiante: string;
  event_id: string;
  titulo_evento: string;
  status: AttendanceStatus;
  rol_participacion: ParticipantRole;
  horas_acreditadas: number;
  puntos_beca_acreditados: number;
  penalizacion_horas_pfi: number;
  penalizacion_puntos_beca: number;
  validado_por: string;
  observaciones?: string;
}

/**
 * Normaliza nombres de encabezados eliminando tildes, espacios y convirtiendo a minúsculas
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Lee un archivo (CSV o Excel) y devuelve un array de objetos
 */
export async function readDataFromFile(file: File): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
}

/* =========================================================================
   1. PLANTILLAS DE DESCARGA (CSV & EXCEL)
   ========================================================================= */

/**
 * Descarga plantilla para Estudiantes y Becas
 */
export function downloadStudentsTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Matricula',
    'Nombre',
    'Apellidos',
    'Programa Academico',
    'Cuatrimestre o Semestre',
    'Periodo Ingreso',
    'Email',
    'Sexo',
    'Tiene Beca (SI/NO)',
    'Tipo de Beca',
    'Porcentaje Beca',
    'Promedio Academico',
    'Puntos Beca Meta',
    'Es Becario Departamental (SI/NO)',
    'Departamento Beca',
    'Horas Departamentales Semanales',
  ];

  const sampleRows = [
    [
      '2023-0101',
      'Carlos Eduardo',
      'Valenzuela Arce',
      'LICENCIATURA EN DERECHO',
      '4',
      '2023-1',
      'carlos.valenzuela@unipaz.edu.mx',
      'Hombre',
      'SI',
      'Excelencia Académica (Promedio 9.6 - 10.0)',
      '50',
      '9.6',
      '1000',
      'NO',
      '',
      '',
    ],
    [
      '2023-0102',
      'Mariana Sofía',
      'Navarro Castro',
      'LICENCIATURA EN ENFERMERÍA',
      '6',
      '2023-1',
      'mariana.navarro@unipaz.edu.mx',
      'Mujer',
      'SI',
      'Estudio Socioeconómico (desde 2° Cuatrimestre)',
      '30',
      '8.9',
      '1000',
      'SI',
      'Biblioteca',
      '10',
    ],
    [
      '2024-0205',
      'Alejandro',
      'Mendoza Cárdenas',
      'LICENCIATURA EN MÉDICO CIRUJANO',
      '2',
      '2024-1',
      'alejandro.mendoza@unipaz.edu.mx',
      'Hombre',
      'NO',
      '',
      '',
      '8.5',
      '',
      'NO',
      '',
      '',
    ],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_carga_estudiantes_unipaz.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    // Set auto column width
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Estudiantes');
    XLSX.writeFile(wb, `plantilla_carga_estudiantes_unipaz.xlsx`);
  }
}

/**
 * Descarga plantilla para Eventos y Talleres Formativos
 */
export function downloadEventsTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Codigo o ID',
    'Titulo Evento',
    'Categoria',
    'Descripcion',
    'Fecha (YYYY-MM-DD)',
    'Hora Inicio (HH:MM)',
    'Hora Fin (HH:MM)',
    'Lugar',
    'Modalidad (presencial/virtual/hibrida)',
    'Cupo Maximo',
    'Horas PFI Acreditables',
    'Puntos Beca Asistente',
    'Puntos Beca Staff',
    'Requiere Evidencia (SI/NO)',
    'Link Virtual (opcional)',
  ];

  const sampleRows = [
    [
      'EVT-SIMP-01',
      'Simposio Nacional de Derecho Constitucional y Amparo 2026',
      'Simposio',
      'Magno foro sobre las reformas en materia de derechos fundamentales.',
      '2026-09-15',
      '09:00',
      '14:00',
      'Auditorio Rectoría UNIPAZ',
      'presencial',
      '150',
      '5.56',
      '80',
      '120',
      'NO',
      '',
    ],
    [
      'EVT-TALL-02',
      'Taller Extracurricular: Liderazgo y Oratoria Ejecutiva',
      'Taller Extracurricular',
      'Taller práctico de técnicas de comunicación y expresión verbal.',
      '2026-09-20',
      '16:00',
      '19:00',
      'Aula Magna B',
      'presencial',
      '40',
      '16.67',
      '90',
      '100',
      'SI',
      '',
    ],
    [
      'EVT-INV-03',
      'Jornada de Divulgación e Investigación Científica INDE',
      'Investigación',
      'Presentación de avances de investigación y ponencias estudiantiles.',
      '2026-09-28',
      '10:00',
      '13:00',
      'Sala Virtual Zoom',
      'virtual',
      '200',
      '100.00',
      '100',
      '150',
      'SI',
      'https://meet.google.com/unipaz-inde-2026',
    ],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_carga_eventos_pfi.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Eventos');
    XLSX.writeFile(wb, `plantilla_carga_eventos_pfi.xlsx`);
  }
}

/**
 * Descarga plantilla para Asistencias y Acreditación Masiva de Horas / Puntos
 */
export function downloadAttendancesTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Matricula Estudiante',
    'ID o Titulo Evento',
    'Estatus Asistencia (asistio/incompleto/registrado/cancelado)',
    'Rol (asistente/staff_logistica)',
    'Horas PFI Acreditadas (Opcional - vacio toma estándar)',
    'Puntos Beca Acreditados (Opcional - vacio toma estándar)',
    'Penalizacion Horas PFI',
    'Penalizacion Puntos Beca',
    'Validado Por (Nombre o Departamento)',
    'Observaciones',
  ];

  const sampleRows = [
    [
      '2023-0101',
      'EVT-SIMP-01',
      'asistio',
      'asistente',
      '5.56',
      '80',
      '0',
      '0',
      'Coordinación PFI DEDU',
      'Asistencia completa y participación activa',
    ],
    [
      '2023-0102',
      'EVT-SIMP-01',
      'asistio',
      'staff_logistica',
      '10.00',
      '120',
      '0',
      '0',
      'Jefatura de Staff UNIPAZ',
      'Coordinación de acceso y escaneo de QR',
    ],
    [
      '2024-0205',
      'EVT-TALL-02',
      'asistio',
      'asistente',
      '16.67',
      '90',
      '0',
      '0',
      'Instructor del Taller',
      'Taller acreditado con entrega de proyecto final',
    ],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_carga_asistencias_pfi_becas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Asistencias y Horas');
    XLSX.writeFile(wb, `plantilla_carga_asistencias_pfi_becas.xlsx`);
  }
}

/* =========================================================================
   2. PARSERS INTELIGENTES CON VALIDACIÓN
   ========================================================================= */

/**
 * Parsea y valida el archivo de Estudiantes y Becas
 */
export async function parseStudentsFile(file: File): Promise<ParseValidationResult<Partial<UserProfile>>> {
  const rows = await readDataFromFile(file);
  const valid: Partial<UserProfile>[] = [];
  const invalid: ParseValidationResult<Partial<UserProfile>>['invalid'] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Considerando fila 1 como cabecera
    const normalized: Record<string, any> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });

    const matricula = String(normalized.matricula || normalized.id || '').trim();
    const nombre = String(normalized.nombre || normalized.nombres || '').trim();
    const apellidos = String(normalized.apellidos || normalized.apellido || '').trim();
    const carreraRaw = String(normalized.programaacademico || normalized.carrera || normalized.programa || '').trim();
    const cuatrimestreRaw = normalized.cuatrimestreosemestre || normalized.cuatrimestre || normalized.semestre || normalized.grado || 1;
    const periodoIngreso = String(normalized.periodoingreso || normalized.cohorte || '2026-1').trim();
    const email = String(normalized.email || normalized.correo || '').trim() || `${matricula.toLowerCase()}@unipaz.edu.mx`;
    const sexo = String(normalized.sexo || 'Prefiero no decirlo').trim();
    const tieneBecaRaw = String(normalized.tienebecasino || normalized.tienebeca || normalized.beca || '').toUpperCase().trim();
    const tipoBeca = String(normalized.tipodebeca || normalized.tipobeca || '').trim();
    const porcentajeBecaRaw = Number(normalized.porcentajebeca || normalized.descuento || 0);
    const promedioRaw = Number(normalized.promedioacademico || normalized.promedio || 9.0);
    const metaBecaRaw = Number(normalized.puntosbecameta || 1000);
    const esBecarioDeptRaw = String(normalized.esbecariodepartamentalsino || normalized.esbecariodepartamental || '').toUpperCase().trim();
    const departamentoBeca = String(normalized.departamentobeca || normalized.departamento || '').trim();
    const horasDeptRaw = Number(normalized.horasdepartamentalessemanales || normalized.horasdepartamentales || 10);

    const errors: string[] = [];

    if (!matricula) errors.push('La matrícula es obligatoria.');
    if (!nombre) errors.push('El nombre es obligatorio.');

    // Búsqueda difusa o asignación de Programa Académico
    let programaAcademico = carreraRaw;
    if (!programaAcademico) {
      programaAcademico = 'LICENCIATURA EN ADMINISTRACIÓN';
    } else {
      const match = PROGRAMAS_ACADEMICOS.find((p) => p.toLowerCase().includes(programaAcademico.toLowerCase()));
      if (match) programaAcademico = match;
    }

    const cuatrimestre = Number(cuatrimestreRaw) || 1;
    const tieneBeca = tieneBecaRaw === 'SI' || tieneBecaRaw === 'SÍ' || tieneBecaRaw === 'TRUE' || tieneBecaRaw === '1';
    const esBecarioDept = esBecarioDeptRaw === 'SI' || esBecarioDeptRaw === 'SÍ' || esBecarioDeptRaw === 'TRUE' || esBecarioDeptRaw === '1';

    if (errors.length > 0) {
      invalid.push({ row: rowNum, raw: row, errors });
    } else {
      valid.push({
        id: `usr-${matricula.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
        matricula,
        nombre,
        apellidos,
        carrera: programaAcademico,
        programa_academico: programaAcademico,
        cuatrimestre,
        periodo_ingreso: periodoIngreso,
        email,
        sexo,
        role: 'estudiante',
        tiene_beca: tieneBeca,
        tipo_beca: tieneBeca ? (tipoBeca as any || 'Excelencia Académica (Promedio 9.6 - 10.0)') : undefined,
        porcentaje_beca: tieneBeca ? (porcentajeBecaRaw || 50) : undefined,
        promedio_academico: promedioRaw,
        puntos_beca_meta_cuatrimestral: tieneBeca ? metaBecaRaw : undefined,
        es_becario_departamental: esBecarioDept,
        departamento_beca: esBecarioDept ? (departamentoBeca || 'Biblioteca') : undefined,
        horas_departamentales_semanales: esBecarioDept ? horasDeptRaw : undefined,
        qr_secret: `SEC-UNIPAZ-${matricula}`,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}

/**
 * Parsea y valida el archivo de Eventos y Talleres Formativos
 */
export async function parseEventsFile(file: File): Promise<ParseValidationResult<Partial<PFIEvent>>> {
  const rows = await readDataFromFile(file);
  const valid: Partial<PFIEvent>[] = [];
  const invalid: ParseValidationResult<Partial<PFIEvent>>['invalid'] = [];

  const CATEGORIAS_VALIDAS: EventCategory[] = [
    'PVC',
    'Taller Extracurricular',
    'Taller Liderazgo',
    'Investigación',
    'Club Anual',
    'Simposio',
    'Jornada Social',
    'Cine Club',
    'Foro',
    'Campaña',
  ];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const normalized: Record<string, any> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });

    const codigo = String(normalized.codigooidevento || normalized.codigo || normalized.id || `EVT-${Date.now()}-${index}`).trim();
    const titulo = String(normalized.tituloevento || normalized.titulo || normalized.nombre || '').trim();
    const categoriaRaw = String(normalized.categoria || normalized.tipo || 'Taller Extracurricular').trim();
    const descripcion = String(normalized.descripcion || '').trim();
    const fecha = String(normalized.fechayyyymmdd || normalized.fecha || new Date().toISOString().split('T')[0]).trim();
    const horaInicio = String(normalized.horainiciohhmm || normalized.horainicio || '10:00').trim();
    const horaFin = String(normalized.horafinhhmm || normalized.horafin || '12:00').trim();
    const lugar = String(normalized.lugar || normalized.ubicacion || 'Campus Central UNIPAZ').trim();
    const modalidadRaw = String(normalized.modalidad || 'presencial').toLowerCase().trim();
    const cupoMaximo = Number(normalized.cupomaximo || normalized.cupo || 50);
    const horasPFIRaw = Number(normalized.horaspfiacreditables || normalized.horaspfi || 0);
    const puntosBecaAsistente = Number(normalized.puntosbecaasistente || normalized.puntosbeca || 50);
    const puntosBecaStaff = Number(normalized.puntosbecastaff || 80);
    const requiereEvidenciaRaw = String(normalized.requiereevidenciasino || normalized.requiereevidencia || '').toUpperCase().trim();
    const linkVirtual = String(normalized.linkvirtual || normalized.link || '').trim();

    const errors: string[] = [];

    if (!titulo) errors.push('El título del evento es obligatorio.');
    if (!fecha) errors.push('La fecha del evento es obligatoria.');

    // Validar categoría
    let categoria: EventCategory = 'Taller Extracurricular';
    const catMatch = CATEGORIAS_VALIDAS.find((c) => c.toLowerCase() === categoriaRaw.toLowerCase());
    if (catMatch) {
      categoria = catMatch;
    } else {
      errors.push(`Categoría inválida ("${categoriaRaw}"). Opciones: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }

    let modalidad: EventModality = 'presencial';
    if (modalidadRaw.includes('virt') || modalidadRaw.includes('onlin')) modalidad = 'online';
    else if (modalidadRaw.includes('hibr') || modalidadRaw.includes('híbr')) modalidad = 'hibrido';

    const requiereEvidencia = requiereEvidenciaRaw === 'SI' || requiereEvidenciaRaw === 'SÍ' || requiereEvidenciaRaw === 'TRUE';

    if (errors.length > 0) {
      invalid.push({ row: rowNum, raw: row, errors });
    } else {
      valid.push({
        id: codigo,
        titulo,
        categoria,
        descripcion,
        fecha_evento: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        ubicacion: lugar,
        modalidad,
        cupo_maximo: cupoMaximo,
        horas_pfi: horasPFIRaw || 2.0,
        puntos_beca: puntosBecaAsistente,
        puntos_beca_staff: puntosBecaStaff,
        enlace_virtual: linkVirtual || undefined,
        activo: true,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}

/**
 * Parsea y valida el archivo de Asistencias y Acreditaciones Masivas de Horas / Puntos
 */
export async function parseAttendancesFile(
  file: File,
  existingStudents: UserProfile[],
  existingEvents: PFIEvent[]
): Promise<ParseValidationResult<ParsedAttendanceRecord>> {
  const rows = await readDataFromFile(file);
  const valid: ParsedAttendanceRecord[] = [];
  const invalid: ParseValidationResult<ParsedAttendanceRecord>['invalid'] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const normalized: Record<string, any> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });

    const matriculaRaw = String(normalized.matriculaestudiante || normalized.matricula || normalized.id || '').trim();
    const eventoQuery = String(normalized.idotituloevento || normalized.evento || normalized.codigoevento || '').trim();
    const statusRaw = String(normalized.estatusasistencia || normalized.estatus || normalized.status || 'asistio').toLowerCase().trim();
    const rolRaw = String(normalized.rol || normalized.rolparticipacion || 'asistente').toLowerCase().trim();
    const horasPfiRaw = normalized.horaspfiacreditadas !== '' ? Number(normalized.horaspfiacreditadas) : null;
    const puntosBecaRaw = normalized.puntosbecaacreditados !== '' ? Number(normalized.puntosbecaacreditados) : null;
    const penHoras = Number(normalized.penalizacionhoraspfi || 0);
    const penPuntos = Number(normalized.penalizacionpuntosbeca || 0);
    const validadoPor = String(normalized.validadopor || 'Coordinación PFI / DEDU').trim();
    const observaciones = String(normalized.observaciones || '').trim();

    const errors: string[] = [];

    // Buscar estudiante por matrícula
    const student = existingStudents.find(
      (s) => s.matricula.toLowerCase() === matriculaRaw.toLowerCase() || s.id.toLowerCase() === matriculaRaw.toLowerCase()
    );
    if (!student) {
      errors.push(`Estudiante con matrícula "${matriculaRaw}" no encontrado en el sistema.`);
    }

    // Buscar evento por ID o por coincidencia en título
    const event = existingEvents.find(
      (e) => e.id.toLowerCase() === eventoQuery.toLowerCase() || e.titulo.toLowerCase().includes(eventoQuery.toLowerCase())
    );
    if (!event) {
      errors.push(`Evento con ID o Título "${eventoQuery}" no encontrado en el catálogo.`);
    }

    // Normalizar estatus
    let status: AttendanceStatus = 'asistio';
    if (statusRaw.includes('incomp') || statusRaw.includes('retard')) status = 'incompleto';
    else if (statusRaw.includes('cancel') || statusRaw.includes('no_asistio') || statusRaw.includes('falta')) status = 'cancelado';
    else if (statusRaw.includes('espera') || statusRaw.includes('wait')) status = 'lista_espera';
    else if (statusRaw.includes('regis')) status = 'registrado';

    // Normalizar rol
    let rol: ParticipantRole = 'asistente';
    if (rolRaw.includes('staff')) rol = 'staff_logistica';
    else if (rolRaw.includes('ponent') || rolRaw.includes('conferenc')) rol = 'ponente';
    else if (rolRaw.includes('moder')) rol = 'moderador';
    else if (rolRaw.includes('organiz')) rol = 'organizador';

    if (errors.length > 0) {
      invalid.push({ row: rowNum, raw: row, errors });
    } else if (student && event) {
      // Calcular horas automáticas si no fueron provistas
      let horasCalculadas = horasPfiRaw !== null && !isNaN(horasPfiRaw) ? horasPfiRaw : event.horas_pfi || 0;
      let puntosCalculados = puntosBecaRaw !== null && !isNaN(puntosBecaRaw)
        ? puntosBecaRaw
        : rol === 'staff_logistica' && event.puntos_beca_staff
        ? event.puntos_beca_staff
        : event.puntos_beca || 50;

      valid.push({
        student_id: student.id,
        matricula: student.matricula,
        nombre_estudiante: `${student.nombre} ${student.apellidos}`,
        event_id: event.id,
        titulo_evento: event.titulo,
        status,
        rol_participacion: rol,
        horas_acreditadas: Math.max(0, horasCalculadas - penHoras),
        puntos_beca_acreditados: Math.max(0, puntosCalculados - penPuntos),
        penalizacion_horas_pfi: penHoras,
        penalizacion_puntos_beca: penPuntos,
        validado_por: validadoPor,
        observaciones: observaciones || undefined,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}
