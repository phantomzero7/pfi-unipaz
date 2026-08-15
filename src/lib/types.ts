export type UserRole = 'estudiante' | 'staff' | 'admin';
export type EventModality = 'presencial' | 'online' | 'hibrido';
export type AttendanceStatus = 'registrado' | 'asistio' | 'incompleto' | 'cancelado' | 'lista_espera';

export interface UserProfile {
  id: string;
  matricula: string;
  nombre: string;
  apellidos: string;
  carrera: string;
  periodo_ingreso: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  qr_secret: string;
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
  horas_pfi: number;
  cupo_maximo: number;  // 0 = ilimitado
  cupo_ocupado?: number;
  enlace_virtual?: string;
  otp_online_code?: string;
  tolerancia_minutos?: number;
  ubicacion?: string;
  creado_por?: string;
  activo: boolean;
  created_at?: string;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  student_id: string;
  status: AttendanceStatus;
  check_in_timestamp?: string | null;
  check_out_timestamp?: string | null;
  horas_acreditadas: number;
  validado_por?: string | null;
  qr_scanned_code?: string;
  notes?: string;
  created_at?: string;
  // Joins
  event?: PFIEvent;
  student?: UserProfile;
}

export type EvaluationScale = 'No Satisfactorio' | 'Satisfactorio' | 'Sobresaliente';

export interface PFIProgressSummary {
  horasTotales: number;
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
