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
   1. PLANTILLAS DE DESCARGA OFICIALES (CSV & EXCEL)
   ========================================================================= */

/**
 * 🎓 PLANTILLA 1: Padrón General de Estudiantes & Becas
 */
export function downloadStudentsTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Matricula',
    'Nombre',
    'Apellido Paterno',
    'Apellido Materno',
    'Programa Academico',
    'Cuatrimestre o Semestre',
    'Periodo Ingreso',
    'Email',
    'Sexo',
    'Tiene Beca (SI/NO)',
    'Promedio Academico',
  ];

  const sampleRows = [
    [
      '2023-0101',
      'Carlos Eduardo',
      'Valenzuela',
      'Arce',
      'LICENCIATURA EN DERECHO',
      '4',
      '2023-1',
      'carlos.valenzuela@unipaz.edu.mx',
      'Hombre',
      'SI',
      '9.6',
    ],
    [
      '2023-0102',
      'Mariana Sofía',
      'Navarro',
      'Castro',
      'LICENCIATURA EN ENFERMERÍA',
      '6',
      '2023-1',
      'mariana.navarro@unipaz.edu.mx',
      'Mujer',
      'SI',
      '8.9',
    ],
    [
      '2024-0205',
      'Alejandro',
      'Mendoza',
      'Cárdenas',
      'LICENCIATURA EN MÉDICO CIRUJANO',
      '2',
      '2024-1',
      'alejandro.mendoza@unipaz.edu.mx',
      'Hombre',
      'NO',
      '8.5',
    ],
    [
      '2022-0310',
      'Brenda Paulina',
      'Flores',
      'Guzmán',
      'LICENCIATURA EN PSICOLOGÍA',
      '8',
      '2022-2',
      'brenda.flores@unipaz.edu.mx',
      'Mujer',
      'SI',
      '9.8',
    ],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_estudiantes_unipaz.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Padrón Estudiantes');
    XLSX.writeFile(wb, `plantilla_estudiantes_unipaz.xlsx`);
  }
}

/**
 * 📅 PLANTILLA 2: Catálogo de Actividades Formativas Realizadas
 */
export function downloadEventsTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Numero de Actividad',
    'Nombre de la Actividad',
    'Categoria',
    'Fecha Inicio (YYYY-MM-DD)',
    'Fecha Fin (YYYY-MM-DD)',
    'Responsable de la Actividad',
    'Horas PFI',
    'Puntos Beca',
    'Lugar o Modalidad',
  ];

  const sampleRows = [
    [
      '1',
      'Simposio Nacional de Derecho Constitucional y Amparo',
      'Simposio',
      '2026-09-15',
      '2026-09-15',
      'Dr. Roberto Silva Morales',
      '5.56',
      '80',
      'Auditorio Rectoría UNIPAZ',
    ],
    [
      '2',
      'Taller Extracurricular: Liderazgo y Oratoria Ejecutiva',
      'Taller Extracurricular',
      '2026-09-20',
      '2026-09-20',
      'Mtra. Claudia Elena Ramos',
      '16.67',
      '90',
      'Aula Magna B',
    ],
    [
      '3',
      'Jornada de Divulgación e Investigación Científica INDE',
      'Investigación',
      '2026-09-28',
      '2026-09-28',
      'Dirección de Investigación INDE',
      '100.00',
      '100',
      'Virtual Google Meet',
    ],
    [
      '4',
      'Programa de Voluntariado Comunitario (PVC I)',
      'PVC',
      '2026-10-05',
      '2026-10-08',
      'Coordinación de Formación Integral',
      '25.00',
      '100',
      'Comunidades y Sedes Externas',
    ],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_actividades_pfi.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo Actividades');
    XLSX.writeFile(wb, `plantilla_actividades_pfi.xlsx`);
  }
}

/**
 * 📊 PLANTILLA 3: Registro de Participaciones / Asistencias con Horas PFI y Becas
 */
export function downloadAttendancesTemplate(format: 'csv' | 'xlsx' = 'xlsx') {
  const headers = [
    'Matricula',
    'Numero de Actividad',
    'Estatus (asistio/incompleto/cancelado)',
    'Rol (asistente/staff_logistica/ponente)',
    'Horas PFI (Opcional - vacio toma estándar)',
    'Puntos Beca (Opcional - vacio toma estándar)',
    'Observaciones',
  ];

  const sampleRows = [
    ['2023-0101', '1', 'asistio', 'asistente', '', '', 'Asistencia completa y acreditada'],
    ['2023-0102', '1', 'asistio', 'staff_logistica', '10.00', '120', 'Coordinación de registro de acceso'],
    ['2024-0205', '2', 'asistio', 'asistente', '', '', 'Taller aprobado'],
    ['2022-0310', '4', 'asistio', 'asistente', '25.00', '100', 'PVC completado satisfactoriamente'],
  ];

  if (format === 'csv') {
    const csv = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantilla_asistencias_pfi_becas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pases de Lista');
    XLSX.writeFile(wb, `plantilla_asistencias_pfi_becas.xlsx`);
  }
}

/* =========================================================================
   2. PARSERS INTELIGENTES CON VALIDACIÓN RELACIONAL (3NF)
   ========================================================================= */

/**
 * Parsea y valida el archivo de Estudiantes
 */
export async function parseStudentsFile(file: File): Promise<ParseValidationResult<Partial<UserProfile>>> {
  const rows = await readDataFromFile(file);
  const valid: Partial<UserProfile>[] = [];
  const invalid: ParseValidationResult<Partial<UserProfile>>['invalid'] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const normalized: Record<string, any> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });

    const matricula = String(normalized.matricula || normalized.id || '').trim();
    const nombre = String(normalized.nombre || normalized.nombres || '').trim();

    // Soporte para Apellido Paterno + Materno o Apellidos en un solo campo
    const paterno = String(normalized.apellidopaterno || normalized.paterno || '').trim();
    const materno = String(normalized.apellidomaterno || normalized.materno || '').trim();
    let apellidos = String(normalized.apellidos || '').trim();
    if (!apellidos && (paterno || materno)) {
      apellidos = `${paterno} ${materno}`.trim();
    }

    const carreraRaw = String(normalized.programaacademico || normalized.carrera || normalized.programa || '').trim();
    const cuatrimestreRaw = normalized.cuatrimestreosemestre || normalized.cuatrimestre || normalized.semestre || normalized.grado || 1;
    const periodoIngreso = String(normalized.periodoingreso || normalized.cohorte || '2026-1').trim();
    const email = String(normalized.email || normalized.correo || '').trim() || `${matricula.toLowerCase()}@unipaz.edu.mx`;
    const sexo = String(normalized.sexo || 'Prefiero no decirlo').trim();
    const tieneBecaRaw = String(normalized.tienebecasino || normalized.tienebeca || normalized.beca || '').toUpperCase().trim();
    const promedioRaw = Number(normalized.promedioacademico || normalized.promedio || 9.0);

    const errors: string[] = [];

    if (!matricula) errors.push('La matrícula es obligatoria.');
    if (!nombre) errors.push('El nombre es obligatorio.');

    // Búsqueda inteligente de Programa Académico
    let programaAcademico = carreraRaw;
    if (!programaAcademico) {
      programaAcademico = 'LICENCIATURA EN ADMINISTRACIÓN';
    } else {
      const match = PROGRAMAS_ACADEMICOS.find((p) => p.toLowerCase().includes(programaAcademico.toLowerCase()));
      if (match) programaAcademico = match;
    }

    const cuatrimestre = Number(cuatrimestreRaw) || 1;
    const tieneBeca = tieneBecaRaw === 'SI' || tieneBecaRaw === 'SÍ' || tieneBecaRaw === 'TRUE' || tieneBecaRaw === '1';

    // Determinar modalidad de beca sugerida por promedio
    let tipoBeca: string | undefined = undefined;
    let porcentajeBeca: number | undefined = undefined;
    if (tieneBeca) {
      if (promedioRaw >= 9.6) {
        tipoBeca = 'Excelencia Académica (Promedio 9.6 - 10.0)';
        porcentajeBeca = 50;
      } else if (promedioRaw >= 9.0) {
        tipoBeca = 'Mérito Académico';
        porcentajeBeca = 40;
      } else {
        tipoBeca = 'Estudio Socioeconómico (desde 2° Cuatrimestre)';
        porcentajeBeca = 30;
      }
    }

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
        tipo_beca: tipoBeca as any,
        porcentaje_beca: porcentajeBeca,
        promedio_academico: promedioRaw,
        puntos_beca_meta_cuatrimestral: tieneBeca ? 1000 : undefined,
        qr_secret: `SEC-UNIPAZ-${matricula}`,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}

/**
 * Parsea y valida el archivo de Actividades Formativas
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

  // Tabulador Oficial UNIPAZ
  const TABULADOR_DEFAULT: Record<EventCategory, number> = {
    'Investigación': 100.00,
    'Club Anual': 33.34,
    'PVC': 25.00,
    'Taller Extracurricular': 16.67,
    'Taller Liderazgo': 10.00,
    'Simposio': 5.56,
    'Jornada Social': 5.00,
    'Cine Club': 2.50,
    'Foro': 2.00,
    'Campaña': 1.00,
  };

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const normalized: Record<string, any> = {};

    Object.entries(row).forEach(([k, v]) => {
      normalized[normalizeKey(k)] = v;
    });

    const numeroActividad = String(
      normalized.numerodeactividad || normalized.numero || normalized.codigo || normalized.id || index + 1
    ).trim();
    const codigo = numeroActividad.startsWith('EVT-') ? numeroActividad : `EVT-${numeroActividad}`;
    const titulo = String(
      normalized.nombredelaactividad || normalized.nombreactividad || normalized.titulo || normalized.nombre || ''
    ).trim();
    const categoriaRaw = String(normalized.categoria || normalized.tipo || '').trim();
    const fechaInicio = String(normalized.fechainicio || normalized.fechainicioyyyymmdd || normalized.fecha || '').trim();
    const fechaFin = String(normalized.fechafin || normalized.fechafinyyyymmdd || fechaInicio).trim();
    const responsable = String(normalized.responsabledelaactividad || normalized.responsable || normalized.instructor || '').trim();
    const horasPfiRaw = normalized.horaspfi !== '' ? Number(normalized.horaspfi) : null;
    const puntosBecaRaw = normalized.puntosbeca !== '' ? Number(normalized.puntosbeca) : null;
    const lugarOModalidad = String(normalized.lugaromodalidad || normalized.lugar || normalized.modalidad || 'Campus Central UNIPAZ').trim();

    const errors: string[] = [];

    if (!titulo) errors.push('El nombre de la actividad es obligatorio.');
    if (!fechaInicio) errors.push('La fecha de la actividad es obligatoria.');

    // Inferir o validar categoría
    let categoria: EventCategory = 'Taller Extracurricular';
    if (categoriaRaw) {
      const match = CATEGORIAS_VALIDAS.find((c) => c.toLowerCase() === categoriaRaw.toLowerCase());
      if (match) categoria = match;
    } else {
      // Inferencia por palabra clave en título
      const t = titulo.toLowerCase();
      if (t.includes('pvc') || t.includes('voluntariado')) categoria = 'PVC';
      else if (t.includes('investiga') || t.includes('inde') || t.includes('coloquio')) categoria = 'Investigación';
      else if (t.includes('liderazgo')) categoria = 'Taller Liderazgo';
      else if (t.includes('simposio')) categoria = 'Simposio';
      else if (t.includes('cine')) categoria = 'Cine Club';
      else if (t.includes('foro')) categoria = 'Foro';
      else if (t.includes('campaña') || t.includes('campana')) categoria = 'Campaña';
      else if (t.includes('jornada') || t.includes('social')) categoria = 'Jornada Social';
      else if (t.includes('club')) categoria = 'Club Anual';
    }

    // Modalidad
    let modalidad: EventModality = 'presencial';
    const lm = lugarOModalidad.toLowerCase();
    if (lm.includes('virt') || lm.includes('online') || lm.includes('meet') || lm.includes('zoom')) {
      modalidad = 'online';
    } else if (lm.includes('hibr')) {
      modalidad = 'hibrido';
    }

    const horasPFI = horasPfiRaw !== null && !isNaN(horasPfiRaw) && horasPfiRaw > 0 ? horasPfiRaw : TABULADOR_DEFAULT[categoria] || 2.0;
    const puntosBeca = puntosBecaRaw !== null && !isNaN(puntosBecaRaw) && puntosBecaRaw > 0 ? puntosBecaRaw : categoria === 'PVC' || categoria === 'Investigación' ? 100 : 80;

    if (errors.length > 0) {
      invalid.push({ row: rowNum, raw: row, errors });
    } else {
      valid.push({
        id: codigo,
        titulo,
        categoria,
        descripcion: `Actividad institucional a cargo de ${responsable || 'Coordinación PFI'}.`,
        fecha_evento: fechaInicio,
        hora_inicio: '10:00',
        hora_fin: '14:00',
        ubicacion: lugarOModalidad,
        modalidad,
        cupo_maximo: 60,
        horas_pfi: horasPFI,
        puntos_beca: puntosBeca,
        puntos_beca_staff: Math.min(150, puntosBeca + 40),
        instructor_titular: responsable,
        activo: true,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}

/**
 * Parsea y valida el archivo de Asistencias (Relación Estudiante <-> Actividad)
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

    const matriculaRaw = String(normalized.matricula || normalized.matriculaestudiante || normalized.id || '').trim();
    const numActividadRaw = String(
      normalized.numerodeactividad || normalized.numeroactividad || normalized.actividad || normalized.evento || ''
    ).trim();
    const statusRaw = String(normalized.estatus || normalized.estatusasistencia || normalized.status || 'asistio').toLowerCase().trim();
    const rolRaw = String(normalized.rol || normalized.rolparticipacion || 'asistente').toLowerCase().trim();
    const horasPfiRaw = normalized.horaspfi !== '' && normalized.horaspfi !== undefined ? Number(normalized.horaspfi) : null;
    const puntosBecaRaw = normalized.puntosbeca !== '' && normalized.puntosbeca !== undefined ? Number(normalized.puntosbeca) : null;
    const observaciones = String(normalized.observaciones || '').trim();

    const errors: string[] = [];

    // Buscar estudiante
    const student = existingStudents.find(
      (s) => s.matricula.toLowerCase() === matriculaRaw.toLowerCase() || s.id.toLowerCase() === matriculaRaw.toLowerCase()
    );
    if (!student) {
      errors.push(`Estudiante con matrícula "${matriculaRaw}" no encontrado en el sistema.`);
    }

    // Buscar evento por número de actividad, código EVT- o coincidencia en título
    const event = existingEvents.find(
      (e) =>
        e.id.toLowerCase() === numActividadRaw.toLowerCase() ||
        e.id.toLowerCase() === `evt-${numActividadRaw}`.toLowerCase() ||
        e.id.toLowerCase() === `evt-${numActividadRaw.replace(/[^0-9]/g, '')}`.toLowerCase() ||
        e.titulo.toLowerCase().includes(numActividadRaw.toLowerCase())
    );
    if (!event) {
      errors.push(`Actividad con número o código "${numActividadRaw}" no encontrada en el catálogo.`);
    }

    // Normalizar estatus
    let status: AttendanceStatus = 'asistio';
    if (statusRaw.includes('incomp') || statusRaw.includes('retard')) status = 'incompleto';
    else if (statusRaw.includes('cancel') || statusRaw.includes('no_asis') || statusRaw.includes('falta')) status = 'cancelado';
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
      const horasCalculadas = horasPfiRaw !== null && !isNaN(horasPfiRaw) && horasPfiRaw > 0 ? horasPfiRaw : event.horas_pfi || 2.0;
      const puntosCalculados = puntosBecaRaw !== null && !isNaN(puntosBecaRaw) && puntosBecaRaw > 0
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
        horas_acreditadas: horasCalculadas,
        puntos_beca_acreditados: puntosCalculados,
        penalizacion_horas_pfi: 0,
        penalizacion_puntos_beca: 0,
        validado_por: event.instructor_titular || 'Coordinación PFI',
        observaciones: observaciones || undefined,
      });
    }
  });

  return { total: rows.length, valid, invalid };
}
