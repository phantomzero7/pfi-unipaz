export type UserRole = 'estudiante' | 'staff' | 'admin';
export type EventModality = 'presencial' | 'online' | 'hibrido';
export type AttendanceStatus = 'registrado' | 'asistio' | 'incompleto' | 'cancelado' | 'lista_espera';
export type ParticipantRole = 'asistente' | 'staff_logistica' | 'ponente' | 'moderador' | 'organizador';
export type StaffApplicationStatus = 'pendiente' | 'aceptado' | 'rechazado';

export interface StaffApplication {
  student_id: string;
  fecha_solicitud: string;
  status: StaffApplicationStatus;
  motivo?: string;
  revisado_por?: string;
  fecha_resolucion?: string;
}

export interface UserProfile {
  id: string;
  matricula: string;
  nombre: string;
  apellidos: string;
  carrera: string;
  periodo_ingreso: string;
  cuatrimestre?: number; // 1 to 9
  email: string;
  role: UserRole;
  es_docente_colaborador?: boolean;
  avatar_url?: string;
  qr_secret: string;
  penalizaciones_acumuladas?: number;
  created_at?: string;
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
