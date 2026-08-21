export type UserRole = 'estudiante' | 'extension' | 'dedu' | 'admin' | 'staff';
export type EventModality = 'presencial' | 'online' | 'hibrido';
export type AttendanceStatus = 'registrado' | 'asistio' | 'incompleto' | 'cancelado' | 'lista_espera';
export type ParticipantRole = 'asistente' | 'staff_logistica' | 'ponente' | 'moderador' | 'organizador';
export type StaffApplicationStatus = 'pendiente' | 'aceptado' | 'rechazado';
export type JustificationStatus = 'pendiente' | 'aprobada' | 'rechazada';

export type AuditLogCategory =
  | 'validacion_actividad'
  | 'ajuste_horas_pfi'
  | 'cambio_beca'
  | 'solicitud_beca'
  | 'renovacion_beca'
  | 'justificacion_asistencia'
  | 'comentario_expediente'
  | 'sancion_penalizacion';

export interface StudentAuditEntry {
  id: string;
  student_id: string;
  timestamp: string;
  autor_id: string;
  autor_nombre: string;
  autor_rol: UserRole;
  categoria: AuditLogCategory;
  accion: string;
  detalles: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  metadata?: Record<string, any>;
}

export interface StaffApplication {
  student_id: string;
  fecha_solicitud: string;
  status: StaffApplicationStatus;
  motivo?: string;
  revisado_por?: string;
  fecha_resolucion?: string;
}

export interface AttendanceJustification {
  id: string;
  attendance_id: string;
  student_id: string;
  event_id: string;
  motivo: string;
  archivo_nombre?: string;
  archivo_url?: string;
  fecha_solicitud: string;
  status: JustificationStatus;
  observaciones_admin?: string;
  revisado_por?: string;
  fecha_resolucion?: string;
}

export interface EventFeedback {
  id: string;
  event_id: string;
  student_id: string;
  calificacion: number; // 1 to 5
  comentarios?: string;
  fecha: string;
}

export interface AppNotification {
  id: string;
  user_id: string; // ID del estudiante o 'all'
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leido: boolean;
  fecha: string;
  enlace?: string;
}

export interface Badge {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  obtenida: boolean;
  fecha_obtenida?: string;
}

export interface CatalogoBeca {
  clave: string;
  porcentaje: number;
  descripcion: string;
}

export const CATALOGO_BECAS: CatalogoBeca[] = [
  { clave: 'T1', porcentaje: 20, descripcion: 'Beca 20%' },
  { clave: 'BA', porcentaje: 25, descripcion: 'Beca 25%' },
  { clave: 'BB', porcentaje: 30, descripcion: 'Beca 30%' },
  { clave: 'BU', porcentaje: 50, descripcion: 'Beca Especial Grupo Violeta' },
  { clave: 'B2', porcentaje: 50, descripcion: 'Beca 50%' },
  { clave: 'BG', porcentaje: 60, descripcion: 'Beca 60%' },
  { clave: '8B', porcentaje: 80, descripcion: 'Beca 80%' },
  { clave: 'B1', porcentaje: 100, descripcion: 'Beca 100%' },
];

export interface CatalogoProgramaAcademico {
  clave: string;
  nombre: string;
}

export const CATALOGO_PROGRAMAS_ACADEMICOS: CatalogoProgramaAcademico[] = [
  { clave: 'AD', nombre: 'LICENCIATURA EN ADMINISTRACIÓN' },
  { clave: 'AH', nombre: 'LICENCIATURA EN ADMINISTRACIÓN DE HOTELES Y RESTAURANTES' },
  { clave: 'NI', nombre: 'LICENCIATURA EN ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES' },
  { clave: 'CO', nombre: 'LICENCIATURA EN COMUNICACIÓN' },
  { clave: 'CT', nombre: 'LICENCIATURA EN CONTADURÍA PÚBLICA' },
  { clave: 'DE', nombre: 'LICENCIATURA EN DERECHO' },
  { clave: 'TU', nombre: 'LICENCIATURA EN DESARROLLO TURÍSTICO' },
  { clave: 'DG', nombre: 'LICENCIATURA EN DISEÑO GRÁFICO' },
  { clave: 'MK', nombre: 'LICENCIATURA EN MERCADOTECNIA INTERNACIONAL' },
  { clave: 'PS', nombre: 'LICENCIATURA EN PSICOLOGÍA' },
  { clave: 'TS', nombre: 'LICENCIATURA EN TRABAJO SOCIAL' },
  { clave: 'LM', nombre: 'LICENCIATURA EN MÉDICO CIRUJANO' },
  { clave: 'EN', nombre: 'LICENCIATURA EN ENFERMERÍA' },
  { clave: 'MD', nombre: 'MAESTRÍA  ADMINISTRACIÓN' },
  { clave: 'PA', nombre: 'MAESTRÍA  ADMINISTRACIÓN PÚBLICA' },
  { clave: 'ME', nombre: 'MAESTRÍA  EDUCACIÓN' },
  { clave: 'MT', nombre: 'MAESTRÍA EN TERAPIA SISTÉMICA FAMILIAR Y DE PAREJA CON PERSPECTIVA DE GÉNERO' },
  { clave: 'MI', nombre: 'MAESTRÍA INCLUSIÓN SOCIAL, GÉNERO Y DERECHOS HUMANOS' },
];

export const PROGRAMAS_ACADEMICOS = [
  'LICENCIATURA EN ADMINISTRACIÓN',
  'LICENCIATURA EN ADMINISTRACIÓN DE HOTELES Y RESTAURANTES',
  'LICENCIATURA EN ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
  'LICENCIATURA EN COMUNICACIÓN',
  'LICENCIATURA EN CONTADURÍA PÚBLICA',
  'LICENCIATURA EN DERECHO',
  'LICENCIATURA EN DESARROLLO TURÍSTICO',
  'LICENCIATURA EN DISEÑO GRÁFICO',
  'LICENCIATURA EN MERCADOTECNIA INTERNACIONAL',
  'LICENCIATURA EN PSICOLOGÍA',
  'LICENCIATURA EN TRABAJO SOCIAL',
  'LICENCIATURA EN MÉDICO CIRUJANO',
  'LICENCIATURA EN ENFERMERÍA',
  'MAESTRÍA  ADMINISTRACIÓN',
  'MAESTRÍA  ADMINISTRACIÓN PÚBLICA',
  'MAESTRÍA  EDUCACIÓN',
  'MAESTRÍA EN TERAPIA SISTÉMICA FAMILIAR Y DE PAREJA CON PERSPECTIVA DE GÉNERO',
  'MAESTRÍA INCLUSIÓN SOCIAL, GÉNERO Y DERECHOS HUMANOS',
] as const;

export type ProgramaAcademico = typeof PROGRAMAS_ACADEMICOS[number] | string;

export function getProgramaByClave(clave: string): CatalogoProgramaAcademico | undefined {
  if (!clave) return undefined;
  return CATALOGO_PROGRAMAS_ACADEMICOS.find(p => p.clave.toUpperCase() === clave.trim().toUpperCase());
}

export function getBecaByClave(clave: string): CatalogoBeca | undefined {
  if (!clave) return undefined;
  return CATALOGO_BECAS.find(b => b.clave.toUpperCase() === clave.trim().toUpperCase());
}

export const OPCIONES_SEXO = [
  'Hombre',
  'Mujer',
  'Otro',
  'Prefiero no decirlo',
] as const;

export const OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA = [
  'Ninguno / Población General',
  'Comunidad / Pueblo Indígena (Pueblos Originarios)',
  'Comunidad Afromexicana / Afrodescendiente',
  'Persona con Discapacidad',
  'Comunidad LGBTIQ+',
  'Población Migrante / En situación de movilidad',
  'Otro',
] as const;

export const isProgramaSemestral = (carreraOrPrograma?: string): boolean => {
  if (!carreraOrPrograma) return false;
  const upper = carreraOrPrograma.toUpperCase();
  return upper.includes('MÉDICO CIRUJANO') || upper.includes('MEDICO CIRUJANO');
};

export const getMaxPeriodos = (carreraOrPrograma?: string): number => {
  return isProgramaSemestral(carreraOrPrograma) ? 12 : 16;
};

export const getNombrePeriodo = (carreraOrPrograma?: string): 'Semestre' | 'Cuatrimestre' => {
  return isProgramaSemestral(carreraOrPrograma) ? 'Semestre' : 'Cuatrimestre';
};

export const formatGradoAcademico = (student?: { carrera?: string; cuatrimestre?: number; periodo_ingreso?: string }): string => {
  if (!student) return 'Activo';
  const num = student.cuatrimestre || 1;
  const periodo = getNombrePeriodo(student.carrera);
  return `${num}° ${periodo}`;
};

export interface UserProfile {
  id: string;
  matricula: string;
  nombre: string;
  apellidos: string;
  carrera: string; // Programa Académico
  programa_academico?: string;
  periodo_ingreso: string;
  cuatrimestre?: number; // 1 to 16 para programas cuatrimestrales (estudiantes regulares e irregulares), 1 to 12 para Médico Cirujano (semestral)
  email: string;
  role: UserRole;
  sexo?: string;
  pertenencia_etnica_prioritaria?: string;
  es_docente_colaborador?: boolean;
  avatar_url?: string;
  qr_secret: string;
  penalizaciones_acumuladas?: number;
  
  // Módulo de Becas y Estímulos UNIPAZ / IESPAC
  tiene_beca?: boolean;
  tipo_beca?:
    | 'Excelencia Académica (Promedio 9.6 - 10.0)'
    | 'Mérito Académico'
    | 'Estudio Socioeconómico (desde 2° Cuatrimestre)'
    | 'Convenios Institucionales'
    | 'Familiar / Hermanos (20%)'
    | 'Egresados UNIPAZ'
    | 'Promoción Educativa'
    | 'Deportiva (Garzas UNIPAZ)'
    | 'Cultural y Artística'
    | 'Investigación y Publicaciones'
    | 'Madres Solteras / Jefas de Familia'
    | 'Inclusión y Discapacidad'
    | 'Intercultural / Pueblos Originarios'
    | 'Talento y Liderazgo'
    | 'Posgrados e Investigación'
    | 'Apoyo Departamental - Biblioteca'
    | 'Apoyo Departamental - INDE'
    | 'Apoyo Departamental - DEDU'
    | string;
  porcentaje_beca?: number; // 20, 25, 30, 40, 50, 60, 75, 80, 100%
  puntos_beca_meta_cuatrimestral?: number; // Mínimo 1000 pts
  puntos_beca_penalizaciones?: number;
  promedio_academico?: number; // e.g. 9.5
  
  // Becarios Departamentales (Biblioteca, INDE, DEDU)
  es_becario_departamental?: boolean;
  departamento_beca?: 'Biblioteca' | 'INDE (Instituto de Investigación e Innovación)' | 'DEDU (Dirección de Extensión y Difusión)' | string;
  horas_departamentales_semanales?: number;
  cumplimiento_departamental_acreditado?: boolean;
  fecha_acreditacion_departamental?: string;
  puntos_departamentales_otorgados?: number; // 1,000 pts al término
  
  // Formatos y Solicitudes de Becario / Refrendo Cuatrimestral
  solicitud_beca_status?: 'ninguna' | 'enviada' | 'en_evaluacion' | 'aprobada' | 'condicionada' | 'rechazada';
  estatus_ratificacion_beca?: 'ratificada' | 'condicionada' | 'suspendida' | 'pendiente';
  condiciones_ratificacion_beca?: string; // Motivo o condición acordada por el Comité
  motivo_rechazo_beca?: string;
  tipo_beca_solicitada?: string;
  refrendo_beca_aprobado_admin?: boolean;
  refrendo_beca_condicionado_admin?: boolean;
  fecha_resolucion_refrendo?: string;
  resolucion_refrendo_observaciones?: string;
  cumple_cero_reprobaciones?: boolean;
  cumple_pagos_al_corriente?: boolean;
  cumple_sin_sanciones?: boolean;
  esta_inscrito_proximo_ciclo?: boolean;
  carga_materias_actual?: 'normal' | 'minima'; // Carga normal vs mínima (mitad de materias/colegiatura)
  proxima_carga_materias?: 'normal' | 'minima'; // Proyección para el periodo por venir
  reprobo_materia_ordinario?: boolean;
  presento_extraordinario?: boolean;
  habia_tenido_beca_condicionada?: boolean; // Historial previo de condición
  visto_bueno_reincidencia_comite?: boolean; // Excepción autorizada por Comité
  informe_becario_entregado?: boolean;
  estudio_socioeconomico_entregado?: boolean;
  situacion_laboral_solicitante?: string;
  motivos_solicitud_beca?: string;
  fecha_informe_becario?: string;
  fecha_estudio_socioeconomico?: string;
  
  // Estatus de Inscripción y Baja
  activo?: boolean; // Default: true
  estatus_inscripcion?: 'activo' | 'baja_temporal' | 'baja_definitiva' | 'egresado';
  motivo_baja?: string;
  fecha_baja?: string;
  
  created_at?: string;
}

export type EstatusInscripcion = 'activo' | 'baja_temporal' | 'baja_definitiva' | 'egresado';

export interface AcademicPeriod {
  id: string;
  codigo: string; // ej. "187", "902", "188", "903"
  nombre: string; // ej. "Mayo - Agosto 2026", "Febrero - Julio 2026"
  tipo: 'cuatrimestral' | 'semestral';
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  es_actual?: boolean;
  descripcion?: string;
}

export interface PFICategoryConfig {
  id: string;
  nombre: string;
  descripcion?: string;
  horas_default?: number;
  color?: string;
  icono?: string;
  activo?: boolean;
  activa?: boolean;
}

export const CATEGORIAS_PFI_OFICIALES: PFICategoryConfig[] = [
  { id: 'cat-acad', nombre: 'Académico', descripcion: 'Congresos, simposios, conferencias y foros académicos.', color: '#002855', activo: true },
  { id: 'cat-soc', nombre: 'Social', descripcion: 'Jornadas de servicio a la comunidad, voluntariado y promoción social.', color: '#FF6600', activo: true },
  { id: 'cat-cult', nombre: 'Cultural', descripcion: 'Talleres de arte, danza, teatro, música y cine club.', color: '#8B5CF6', activo: true },
  { id: 'cat-dep', nombre: 'Deportivo', descripcion: 'Torneos, disciplinas deportivas universitarias y activación física.', color: '#10B981', activo: true },
  { id: 'cat-inv', nombre: 'Investigación', descripcion: 'Publicaciones científicas, ponencias de investigación y coloquios.', color: '#3B82F6', activo: true },
  { id: 'cat-apoyo', nombre: 'Apoyo Universitario', descripcion: 'Logística institucional, staff de apoyo y comités universitarios.', color: '#F59E0B', activo: true },
  { id: 'cat-eco', nombre: 'Conciencia Ecológica', descripcion: 'Campañas de reforestación, reciclaje y cuidado del medio ambiente.', color: '#059669', activo: true },
  { id: 'cat-salud', nombre: 'Bienestar y Salud Pública', descripcion: 'Ferias de la salud, jornadas médicas, vacunación y bienestar integral.', color: '#EC4899', activo: true },
];

export type EventCategory = 
  | 'Académico'
  | 'Social'
  | 'Cultural'
  | 'Deportivo'
  | 'Investigación'
  | 'Apoyo Universitario'
  | 'Conciencia Ecológica'
  | 'Bienestar y Salud Pública'
  | 'Taller Extracurricular'
  | 'Taller Liderazgo'
  | 'PVC'
  | 'Club Anual'
  | 'Simposio'
  | 'Jornada Social'
  | 'Cine Club'
  | string;

export type ActivityType =
  | 'Taller'
  | 'Conferencia'
  | 'Seminario'
  | 'Voluntariado'
  | 'Concurso'
  | 'Visita Guiada'
  | 'Panel'
  | 'Foro'
  | 'Campaña'
  | string;

export interface ModalidadBecaConfig {
  id: string;
  nombre: string;
  descripcion: string;
  descuento_min: number;
  descuento_max: number;
  porcentajes_aplicables?: number[];
  promedio_minimo?: number;
  requiere_estudio_socioeconomico?: boolean;
  carrera_exclusiva?: string;
  solo_posgrados?: boolean;
  activa: boolean;
}

export const MODALIDADES_BECA_DEFAULT: ModalidadBecaConfig[] = [
  {
    id: 'mod-1',
    nombre: 'Beca Egresado UNIPAZ',
    descripcion: 'Dirigida a egresados o estudiantes cuyos padres, madres o hermanos(as) son egresados de la Universidad, sin importar si dependen económicamente de ellos.',
    descuento_min: 25,
    descuento_max: 25,
    porcentajes_aplicables: [25],
    promedio_minimo: 8.0,
    activa: true,
  },
  {
    id: 'mod-2',
    nombre: 'Beca Familiar',
    descripcion: 'Disponible para estudiantes que tienen hermanos(as) inscritos actualmente en UNIPAZ.',
    descuento_min: 25,
    descuento_max: 25,
    porcentajes_aplicables: [25],
    promedio_minimo: 8.0,
    activa: true,
  },
  {
    id: 'mod-3',
    nombre: 'Beca por Convenios',
    descripcion: 'El/la estudiante trabaja en alguna de estas instituciones u organizaciones, o el padre/madre trabajan en instituciones públicas o privadas con convenios de colaboración.',
    descuento_min: 25,
    descuento_max: 30,
    porcentajes_aplicables: [25, 30],
    promedio_minimo: 8.0,
    activa: true,
  },
  {
    id: 'mod-4',
    nombre: 'Beca de Excelencia Académica',
    descripcion: 'Dirigida a estudiantes recién egresados de preparatoria con desempeño académico sobresaliente, que sean postulados por su institución de procedencia mediante convenio con UNIPAZ. Promedio general de 9.0 a 10.0. Requiere historial académico y la solicitud de beca emitida por la preparatoria correspondiente.',
    descuento_min: 50,
    descuento_max: 80,
    porcentajes_aplicables: [50, 60, 70, 80],
    promedio_minimo: 9.0,
    activa: true,
  },
  {
    id: 'mod-5',
    nombre: 'Beca de Promoción',
    descripcion: 'Se concede a través de campañas educativas en escuelas y ferias, mediante el llenado de un formato de solicitud.',
    descuento_min: 30,
    descuento_max: 30,
    porcentajes_aplicables: [30],
    promedio_minimo: 8.0,
    activa: true,
  },
  {
    id: 'mod-6',
    nombre: 'Beca de Continuidad Escolar (Estudio Socioeconómico)',
    descripcion: 'Disponible para estudiantes que hayan concluido al menos el primer cuatrimestre, con promedio mínimo de 8.0. La asignación se realiza tras un análisis socioeconómico y revisión del comité de becas.',
    descuento_min: 20,
    descuento_max: 30,
    porcentajes_aplicables: [20, 25, 30],
    promedio_minimo: 8.0,
    requiere_estudio_socioeconomico: true,
    activa: true,
  },
  {
    id: 'mod-7',
    nombre: 'Beca Grupo Violeta',
    descripcion: 'Beca por Convenio con el Instituto de Justicia para Mujeres de La Paz, B. C. S. y aplica para la licenciatura de trabajo social solamente.',
    descuento_min: 50,
    descuento_max: 50,
    porcentajes_aplicables: [50],
    promedio_minimo: 8.0,
    carrera_exclusiva: 'LICENCIATURA EN TRABAJO SOCIAL',
    activa: true,
  },
  {
    id: 'mod-8',
    nombre: 'Beca Colaborador UNIPAZ',
    descripcion: 'El personal directivo y administrativo de la Universidad Internacional de La Paz podrá acceder a una beca del 25% en colegiaturas de posgrado. Antigüedad mínima de un año en la institución.',
    descuento_min: 25,
    descuento_max: 50,
    porcentajes_aplicables: [25, 30, 40, 50],
    promedio_minimo: 8.0,
    solo_posgrados: true,
    activa: true,
  },
];

export function validarCondicionesEspecialesBeca(
  carrera: string,
  modalidadNombre: string,
  porcentajeSolicitado?: number
): {
  permiteBeca: boolean;
  motivoBloqueo?: string;
  porcentajeMaximoPermitido?: number;
  esExcepcional?: boolean;
  advertencia?: string;
} {
  const cNorm = (carrera || '').toUpperCase();

  // 1. Licenciatura en Médico Cirujano - No aplica Beca
  if (cNorm.includes('MÉDICO CIRUJANO') || cNorm.includes('MEDICO CIRUJANO')) {
    return {
      permiteBeca: false,
      motivoBloqueo: 'La Licenciatura en Médico Cirujano no aplica para programa de becas institucionales.',
      porcentajeMaximoPermitido: 0,
    };
  }

  // 2. Beca Grupo Violeta - Aplica solo para Trabajo Social
  if (modalidadNombre.includes('Grupo Violeta')) {
    if (!cNorm.includes('TRABAJO SOCIAL')) {
      return {
        permiteBeca: false,
        motivoBloqueo: 'La Beca Grupo Violeta aplica exclusivamente para la Licenciatura en Trabajo Social.',
        porcentajeMaximoPermitido: 0,
      };
    }
  }

  // 3. Beca Colaborador UNIPAZ - Solo Posgrados / Maestrías
  if (modalidadNombre.includes('Colaborador UNIPAZ')) {
    if (!cNorm.includes('MAESTRÍA') && !cNorm.includes('MAESTRIA') && !cNorm.includes('POSGRADO')) {
      return {
        permiteBeca: false,
        motivoBloqueo: 'La Beca Colaborador UNIPAZ aplica exclusivamente para programas de Posgrado y Maestría.',
        porcentajeMaximoPermitido: 0,
      };
    }
  }

  // 4. Licenciatura en Enfermería - Máximo 30% salvo caso excepcional
  if (cNorm.includes('ENFERMERÍA') || cNorm.includes('ENFERMERIA')) {
    const esMayorA30 = (porcentajeSolicitado || 0) > 30;
    return {
      permiteBeca: true,
      porcentajeMaximoPermitido: 30,
      esExcepcional: esMayorA30,
      advertencia: esMayorA30
        ? 'En Licenciatura en Enfermería el descuento máximo institucional es de 30%. Porcentajes mayores requieren autorización excepcional directa del Comité.'
        : 'Licenciatura en Enfermería: Descuento regular aplicable hasta un máximo del 30%.',
    };
  }

  // Todas las demás licenciaturas: 20% - 80%
  return {
    permiteBeca: true,
    porcentajeMaximoPermitido: 80,
  };
}

export interface ServicioBecarioDept {
  id: string;
  nombre: string;
  descripcion?: string;
  responsable?: string;
  encargado?: string;
  cupo_maximo?: number;
  cupo_ocupado?: number;
  activo: boolean;
}

export interface ScholarshipAuditLog {
  id: string;
  student_id: string;
  periodo_codigo: string;
  periodo_nombre: string;
  fecha_registro: string;
  autor_nombre: string;
  autor_email?: string;
  resolucion: 'aprobada' | 'condicionada' | 'rechazada';
  tipo_beca: string;
  porcentaje_beca: number;
  promedio_evaluado: number;
  criterios: {
    sin_reprobadas: boolean;
    pagos_al_corriente: boolean;
    solicitud_a_tiempo: boolean;
    sin_sanciones: boolean;
    esta_inscrito_proximo_ciclo: boolean;
    cumple_puntos_1000: boolean;
    carga_materias: 'normal' | 'minima';
    visto_bueno_reincidencia?: boolean;
  };
  condicion_acordada?: string;
  comentarios_comite: string;
  notificacion_enviada: boolean;
  fecha_notificacion?: string;
}

export interface EventDayConfig {
  id?: string;
  dia_numero?: number;
  titulo_dia?: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  porcentaje_permanencia_minimo?: number;
  porcentaje_minimo?: number;
  check_in_abierto?: boolean;
  check_out_abierto?: boolean;
}

export interface RoleApplication {
  id: string;
  event_id: string;
  student_id: string;
  student_nombre?: string;
  student_matricula?: string;
  student_carrera?: string;
  tiene_beca?: boolean;
  rol_solicitado: 'staff_logistica' | 'ponente';
  motivo?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  fecha_resolucion?: string;
  revisado_por?: string;
}

export interface SignatureConfig {
  nombre: string;
  cargo: string;
}

export interface PFIGlobalSignatures {
  extensionNombre?: string;
  extensionCargo?: string;
  controlEscolarNombre?: string;
  controlEscolarCargo?: string;
  general: {
    firma1: SignatureConfig;
    firma2: SignatureConfig;
  };
  pvc: {
    firma1: SignatureConfig;
    firma2: SignatureConfig;
  };
  talleres: {
    firma1: SignatureConfig;
    firma2: SignatureConfig;
  };
  actividades: {
    firma1: SignatureConfig;
    firma2: SignatureConfig;
  };
}

export interface PFIGlobalConfig {
  horasMinimasTitulacion: number; // 400
  horasSobresaliente: number; // 730
  maxTalleresExtracurriculares: number; // 3
  maxTalleresLiderazgo: number; // 1
  penalizacionNoShowStaff: number; // Horas descontadas si falta staff (ej. -5.0h)
  puntosBecaMinimosCuatrimestre: number; // 1000
  
  // Periodos Académicos Cuatrimestrales y Semestrales
  periodosAcademicos?: AcademicPeriod[];
  periodoCuatrimestralActualId?: string;
  periodoSemestralActualId?: string;

  // Fechas Oficiales de Convocatoria de Nuevas Solicitudes de Beca
  periodo_solicitud_becas_activo: boolean;
  fecha_inicio_solicitud_becas?: string;
  fecha_fin_solicitud_becas?: string;
  fecha_publicacion_resolucion_becas?: string;

  // Fechas Oficiales de Periodo de Renovación / Ratificación de Becas
  fecha_inicio_ratificacion_becas?: string;
  fecha_fin_ratificacion_becas?: string;
  fecha_publicacion_dictamen_ratificacion?: string;

  // Habilitación de Formularios y Botones del Expediente Estudiantil
  informe_becario_habilitado: boolean;
  estudio_socioeconomico_habilitado: boolean;
  habilitar_subida_informe_becario?: boolean;
  habilitar_estudio_socioeconomico?: boolean;
  habilitar_subida_reportes?: boolean;
  habilitar_descarga_solicitud?: boolean;
  habilitar_postulacion_roles?: boolean;
  
  // Catálogos Gestionables
  departamentosServicioBecario?: ServicioBecarioDept[];
  modalidadesBecaCatalog?: ModalidadBecaConfig[];
  categoriasPfiCatalog?: PFICategoryConfig[];

  categoriaHoras: Record<string, number>;
  reglasCohortePVC: {
    pvc1Cuatrimestres: number[]; // [1, 2, 3]
    pvc2Cuatrimestres: number[]; // [4, 5, 6]
    pvc3Cuatrimestres: number[]; // [7, 8, 9]
  };
  firmas: PFIGlobalSignatures;
}

export interface PFIEvent {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: EventCategory;
  subcategoria?: string;
  modalidad: EventModality;
  fecha_evento: string; // YYYY-MM-DD
  fecha_fin_evento?: string; // YYYY-MM-DD
  es_multidia?: boolean;
  dias_evento?: EventDayConfig[];
  hora_inicio: string;  // HH:MM
  hora_fin: string;     // HH:MM
  horas_pfi: number;    // Default / Oyente
  horas_presenciales?: number;

  // Horas Acreditables según Rol de Participación
  horas_oyente?: number;
  horas_staff?: number;
  horas_ponente?: number;
  
  // Puntos de Beca según Rol (50 - 500 pts)
  puntos_beca?: number; // Oyente default
  puntos_beca_oyente?: number;
  puntos_beca_staff?: number;
  puntos_beca_ponente?: number;
  
  // Roles diferenciados y Cupos
  permite_staff?: boolean;
  cupo_staff?: number;
  cupo_staff_ocupado?: number;
  permite_ponentes?: boolean;
  cupo_ponentes?: number;
  cupo_ponentes_ocupado?: number;
  
  solicitudes_staff?: StaffApplication[];
  solicitudes_roles?: RoleApplication[];
  
  cupo_maximo: number;  // 0 = ilimitado
  cupo_ocupado?: number;
  porcentaje_permanencia_minimo?: number; // ej. 80%
  porcentaje_minimo_permanencia?: number;
  enlace_virtual?: string;
  otp_online_code?: string;
  tolerancia_minutos?: number;
  ubicacion?: string;
  creado_por?: string;
  instructor_titular?: string;
  instructor_cargo?: string;
  activo: boolean;
  archivado?: boolean;
  cuatrimestre_objetivo?: number;
  created_at?: string;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  student_id: string;
  status: AttendanceStatus;
  rol_participacion?: ParticipantRole; // 'asistente' | 'staff_logistica' | 'ponente' | etc.
  check_in_timestamp?: string | null;
  check_out_timestamp?: string | null;
  horas_acreditadas: number;
  penalizacion_horas?: number;
  motivo_penalizacion?: string;
  
  // Acreditación de Beca
  puntos_beca_acreditados?: number;
  penalizacion_puntos_beca?: number;
  
  validado_por?: string | null; // ID del admin, docente o estudiante staff que escaneó
  qr_scanned_code?: string;
  qr_token_hash?: string;
  notes?: string;
  es_asignacion_directa?: boolean;
  es_caso_especial?: boolean;
  created_at?: string;
  // Joins
  event?: PFIEvent;
  student?: UserProfile;
}

export type EvaluationScale = 'No Satisfactorio' | 'Satisfactorio' | 'Sobresaliente';

export interface PFIProgressSummary {
  horasTotales: number;
  horasBrutas: number;
  horasPenalizaciones: number;
  escala: EvaluationScale;
  escalaTexto: string;
  porcentajeMeta: number; // vs 400h
  porcentajeSobresaliente: number; // vs 730h
  isAcreditado: boolean; // >= 400h y cumple obligatorios
  
  // Requisitos obligatorios
  talleresExtracurriculares: {
    horas: number;
    completados: number;
    requeridos: number; // 3
    metaHoras: number; // 50.00h
    cumplido: boolean;
  };
  tallerLiderazgo: {
    horas: number;
    completados: number;
    requeridos: number; // 1
    metaHoras: number; // 10.00h
    cumplido: boolean;
  };
  pvc: {
    pvc1: boolean;
    pvc2: boolean;
    pvc3: boolean;
    horas: number;
    metaHoras: number; // 75.00h
    cumplido: boolean;
  };
  
  // Desglose por roles
  desglosePorRoles: {
    asistenteHoras: number;
    staffHoras: number;
    ponenteHoras: number;
    participacionesStaff: number;
  };
  
  // Desglose por categorías
  desglosePorCategoria: Record<string, { horas: number; cantidad: number }>;
}

export interface CertificateData {
  folio: string;
  estudiante: UserProfile;
  horasTotales: number;
  escala: EvaluationScale;
  fechaEmision: string;
  hashVerificacion: string;
  talleresExtracurricularesHoras: number;
  tallerLiderazgoHoras: number;
  pvcHoras: number;
  otrasHoras: number;
}

export type ScholarshipStatus = 'cumplido' | 'en_progreso' | 'en_riesgo' | 'no_acreditado';

export interface ScholarshipProgressSummary {
  tieneBeca: boolean;
  tipoBeca: string;
  porcentajeBeca: number;
  promedioAcademico: number;
  puntosTotales: number;
  puntosBrutos: number;
  puntosPenalizaciones: number;
  puntosMeta: number; // 1000 pts
  porcentajeCumplimiento: number;
  estatus: ScholarshipStatus;
  estatusTexto: string;
  isAcreditadoBeca: boolean;
  esBecarioDepartamental?: boolean;
  departamentoBeca?: string;
  cumplimientoDepartamentalAcreditado?: boolean;
  puntosDepartamentales?: number;
  actividadesBecadas: Array<{
    id: string;
    eventId: string;
    titulo: string;
    categoria: string;
    fecha: string;
    puntosAcreditados: number;
    rol: ParticipantRole;
  }>;
}

export interface ScholarshipRenewalDictamenData {
  folio: string;
  estudiante: UserProfile;
  tipoBeca: string;
  porcentajeBeca: number;
  promedioAcademico: number;
  cuatrimestre: number;
  puntosTotales: number;
  puntosMeta: number;
  porcentajeCumplimiento: number;
  fechaEmision: string;
  hashVerificacion: string;
  estatusRatificacion?: 'ratificada' | 'condicionada' | 'suspendida';
  condiciones?: string;
  periodoAcademico?: string;
  actividades: Array<{
    titulo: string;
    categoria: string;
    fecha: string;
    puntos: number;
    rol: string;
  }>;
}

