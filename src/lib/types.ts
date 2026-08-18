export type UserRole = 'estudiante' | 'staff' | 'dedu' | 'admin';
export type EventModality = 'presencial' | 'online' | 'hibrido';
export type AttendanceStatus = 'registrado' | 'asistio' | 'incompleto' | 'cancelado' | 'lista_espera';
export type ParticipantRole = 'asistente' | 'staff_logistica' | 'ponente' | 'moderador' | 'organizador';
export type StaffApplicationStatus = 'pendiente' | 'aceptado' | 'rechazado';
export type JustificationStatus = 'pendiente' | 'aprobada' | 'rechazada';

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
  fecha_informe_becario?: string;
  fecha_estudio_socioeconomico?: string;
  
  created_at?: string;
}

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

export type EventCategory = 
  | 'Taller Extracurricular' // Culturales / Deportivos / Sociales (16.67h c/u)
  | 'Taller Liderazgo'      // Liderazgo y Promoción Social (10.00h)
  | 'PVC'                   // Plan de Vida y Carrera I, II, III (25.00h c/u)
  | 'Investigación'         // Artículos, Ponencias, Proyectos (100.00h)
  | 'Club Anual'            // Clubes de lectura, debate, altruistas (33.34h)
  | 'Simposio'              // Simposios y Congresos (5.56h)
  | 'Jornada Social'        // Jornadas Sociales, Ferias (5.00h)
  | 'Cine Club'             // Cine club, café literario, donación (2.50h)
  | 'Foro'                  // Foros, conferencias, salud (2.00h)
  | 'Campaña';              // Campañas de vacunación, colectas (1.00h)

export interface SignatureConfig {
  nombre: string;
  cargo: string;
}

export interface PFIGlobalSignatures {
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

  // Control de Convocatorias y Formularios de Beca (Solo Admin)
  periodo_solicitud_becas_activo: boolean;
  fecha_inicio_solicitud_becas?: string;
  fecha_fin_solicitud_becas?: string;
  informe_becario_habilitado: boolean;
  estudio_socioeconomico_habilitado: boolean;
  
  categoriaHoras: Record<EventCategory, number>;
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
  hora_inicio: string;  // HH:MM
  hora_fin: string;     // HH:MM
  horas_pfi: number;     // Horas como oyente/asistente
  
  // Puntos de Beca (50 - 500 pts)
  puntos_beca?: number;       // Puntos otorgados a estudiantes becados (ej. 50 a 500 pts)
  puntos_beca_staff?: number; // Puntos extra para staff becado
  
  // Roles diferenciados y Staff Logístico
  permite_staff?: boolean;
  cupo_staff?: number;
  cupo_staff_ocupado?: number;
  horas_staff?: number;       // Horas acreditadas para Staff Logístico (ej. 8.00h)
  horas_ponente?: number;     // Horas acreditadas para Ponente/Conferencista (ej. 15.00h)
  solicitudes_staff?: StaffApplication[];
  
  cupo_maximo: number;  // 0 = ilimitado
  cupo_ocupado?: number;
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

