'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_ATTENDANCES, MOCK_AUDIT_LOGS, MOCK_EVENTS, MOCK_PROFILES } from './mock-data';
import {
  calculateStudentPFIProgress,
  calculateStudentScholarshipProgress,
  getStandardScholarshipPoints,
  PFI_RULES,
  validateStayDuration,
} from './pfi-rules';
import {
  AppNotification,
  AttendanceJustification,
  AttendanceStatus,
  CATEGORIAS_PFI_OFICIALES,
  EventAttendance,
  EventCategory,
  EventDayConfig,
  EventFeedback,
  JustificationStatus,
  ModalidadBecaConfig,
  MODALIDADES_BECA_DEFAULT,
  ParticipantRole,
  PFICategoryConfig,
  PFIEvent,
  PFIGlobalConfig,
  PFIGlobalSignatures,
  PFIProgressSummary,
  RoleApplication,
  ScholarshipAuditLog,
  ScholarshipProgressSummary,
  ServicioBecarioDept,
  StaffApplication,
  StudentAuditEntry,
  UserProfile,
  UserRole,
} from './types';

export const DEFAULT_PFI_CONFIG: PFIGlobalConfig = {
  horasMinimasTitulacion: 400.0,
  horasSobresaliente: 730.0,
  maxTalleresExtracurriculares: 3,
  maxTalleresLiderazgo: 1,
  penalizacionNoShowStaff: 5.0,
  puntosBecaMinimosCuatrimestre: 1000,
  
  // Periodos Académicos
  periodosAcademicos: [
    {
      id: 'per-187',
      codigo: '187',
      nombre: 'Mayo - Agosto 2026',
      tipo: 'cuatrimestral',
      fecha_inicio: '2026-05-01',
      fecha_fin: '2026-08-31',
      es_actual: true,
      descripcion: 'Periodo cuatrimestral ordinario vigente para Licenciaturas y Posgrados UNIPAZ',
    },
    {
      id: 'per-902',
      codigo: '902',
      nombre: 'Febrero - Julio 2026',
      tipo: 'semestral',
      fecha_inicio: '2026-02-01',
      fecha_fin: '2026-07-31',
      es_actual: true,
      descripcion: 'Periodo semestral ordinario vigente para Licenciatura en Médico Cirujano',
    },
    {
      id: 'per-188',
      codigo: '188',
      nombre: 'Septiembre - Diciembre 2026',
      tipo: 'cuatrimestral',
      fecha_inicio: '2026-09-01',
      fecha_fin: '2026-12-31',
      es_actual: false,
      descripcion: 'Próximo periodo cuatrimestral a ratificar',
    },
    {
      id: 'per-903',
      codigo: '903',
      nombre: 'Agosto 2026 - Enero 2027',
      tipo: 'semestral',
      fecha_inicio: '2026-08-01',
      fecha_fin: '2027-01-31',
      es_actual: false,
      descripcion: 'Próximo periodo semestral para Médico Cirujano',
    },
  ],
  periodoCuatrimestralActualId: 'per-187',
  periodoSemestralActualId: 'per-902',

  // Convocatorias y Fechas Oficiales
  periodo_solicitud_becas_activo: true,
  fecha_inicio_solicitud_becas: '2026-09-01',
  fecha_fin_solicitud_becas: '2026-09-25',
  fecha_publicacion_resolucion_becas: '2026-09-30',
  fecha_inicio_ratificacion_becas: '2026-08-15',
  fecha_fin_ratificacion_becas: '2026-08-30',
  fecha_publicacion_dictamen_ratificacion: '2026-09-05',
  
  informe_becario_habilitado: true,
  estudio_socioeconomico_habilitado: true,
  habilitar_subida_reportes: true,
  habilitar_descarga_solicitud: true,

  // Catálogos Gestionables
  departamentosServicioBecario: [
    { id: 'dept-1', nombre: 'Biblioteca', descripcion: 'Atención y catalogación de acervo bibliográfico', cupo_maximo: 8, cupo_ocupado: 3, activo: true },
    { id: 'dept-2', nombre: 'INDE (Instituto de Investigación e Innovación)', descripcion: 'Apoyo a proyectos de investigación y estadística', cupo_maximo: 6, cupo_ocupado: 2, activo: true },
    { id: 'dept-3', nombre: 'DEDU (Dirección de Extensión y Difusión)', descripcion: 'Logística de eventos y difusión universitaria', cupo_maximo: 10, cupo_ocupado: 5, activo: true },
    { id: 'dept-4', nombre: 'Servicios Escolares y Archivo', descripcion: 'Control escolar, recepción y digitalización de expedientes', cupo_maximo: 5, cupo_ocupado: 1, activo: true },
    { id: 'dept-5', nombre: 'Laboratorios y Soporte Tecnológico', descripcion: 'Mantenimiento preventivo de cómputo y aulas', cupo_maximo: 6, cupo_ocupado: 2, activo: true },
    { id: 'dept-6', nombre: 'Coordinación de Deportes', descripcion: 'Organización de ligas y torneos universitarios', cupo_maximo: 6, cupo_ocupado: 1, activo: true },
  ],
  modalidadesBecaCatalog: MODALIDADES_BECA_DEFAULT,
  categoriasPfiCatalog: CATEGORIAS_PFI_OFICIALES,

  categoriaHoras: {
    'Académico': 4.00,
    'Social': 5.00,
    'Cultural': 16.67,
    'Deportivo': 16.67,
    'Investigación': 100.00,
    'Apoyo Universitario': 8.00,
    'Conciencia Ecológica': 4.00,
    'Bienestar y Salud Pública': 5.00,
    'Club Anual': 33.34,
    'PVC': 25.00,
    'Taller Extracurricular': 16.67,
    'Taller Liderazgo': 10.00,
    'Simposio': 5.56,
    'Jornada Social': 5.00,
    'Cine Club': 2.50,
    'Foro': 2.00,
    'Campaña': 1.00,
  },
  reglasCohortePVC: {
    pvc1Cuatrimestres: [1, 2, 3],
    pvc2Cuatrimestres: [4, 5, 6],
    pvc3Cuatrimestres: [7, 8, 9],
  },
  firmas: {
    general: {
      firma1: {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      },
      firma2: {
        nombre: 'DR. SECRETARIO ACADÉMICO',
        cargo: 'Dirección de Asuntos Estudiantiles y Titulación',
      },
    },
    pvc: {
      firma1: {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      },
      firma2: {
        nombre: 'LIC. ORIENTADOR VOCACIONAL Y TUTORÍA',
        cargo: 'Coordinación de Plan de Vida y Carrera',
      },
    },
    talleres: {
      firma1: {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      },
      firma2: {
        nombre: 'INSTRUCTOR TITULAR DEL TALLER',
        cargo: 'Facilitador de Formación Extracurricular',
      },
    },
    actividades: {
      firma1: {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      },
      firma2: {
        nombre: 'RESPONSABLE DE EXTENSIÓN Y EVENTOS',
        cargo: 'Dirección de Difusión y Vida Universitaria',
      },
    },
  },
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    user_id: 'usr-student-01',
    titulo: '¡Bienvenido al Ciclo PFI 2026!',
    mensaje: 'Consulta el nuevo catálogo de talleres extracurriculares y simposios disponibles.',
    tipo: 'info',
    leido: false,
    fecha: new Date().toISOString(),
  },
  {
    id: 'notif-02',
    user_id: 'all',
    titulo: 'Convocatorias de Staff Logístico Abiertas',
    mensaje: 'Ya puedes postularte como Staff en actividades para obtener +10.0 hrs de acreditación.',
    tipo: 'success',
    leido: false,
    fecha: new Date().toISOString(),
  },
];

interface PFIContextType {
  currentUser: UserProfile;
  profiles: UserProfile[];
  events: PFIEvent[];
  attendances: EventAttendance[];
  justifications: AttendanceJustification[];
  notifications: AppNotification[];
  feedbacks: EventFeedback[];
  pfiConfig: PFIGlobalConfig;
  switchUser: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  toggleDocenteStaffRole: (userId: string) => void;
  
  // Event Actions & Waitlist
  registerToEvent: (eventId: string, studentId?: string, role?: ParticipantRole) => { success: boolean; message: string; waitlist?: boolean };
  cancelRegistration: (eventId: string, studentId?: string) => { success: boolean; message: string };
  createEvent: (eventData: Omit<PFIEvent, 'id'>) => { success: boolean; event: PFIEvent };
  updateEvent: (eventId: string, data: Partial<PFIEvent>) => void;
  deleteEvent: (eventId: string) => void;
  
  // Staff Logístico & Convocatorias
  applyForStaffRole: (eventId: string, studentId?: string, motivo?: string) => { success: boolean; message: string };
  manageStaffApplication: (eventId: string, studentId: string, decision: 'aceptado' | 'rechazado') => { success: boolean; message: string };
  applyStaffPenalty: (attendanceId: string, penalizacionHoras: number, motivo: string) => void;
  assignEventToStudentWithRole: (eventId: string, studentId: string, role: ParticipantRole, customHours?: number) => { success: boolean; message: string };
  
  // Justificaciones Médicas & Laborales
  submitJustification: (data: Omit<AttendanceJustification, 'id' | 'status' | 'fecha_solicitud'>) => { success: boolean; message: string };
  reviewJustification: (justificationId: string, decision: JustificationStatus, observaciones?: string) => { success: boolean; message: string };
  
  // Encuestas de Satisfacción
  submitEventFeedback: (feedback: Omit<EventFeedback, 'id' | 'fecha'>) => void;
  
  // Notificaciones
  addNotification: (notif: Omit<AppNotification, 'id' | 'fecha' | 'leido'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Global Config & Direct Assignment
  updateGlobalConfig: (newConfig: Partial<PFIGlobalConfig>) => void;
  getStandardHoursForCategory: (category: EventCategory) => number;
  assignEventToStudent: (eventId: string, studentId: string, isSpecialCase?: boolean) => {
    success: boolean;
    message: string;
    alreadyPassed?: boolean;
  };
  batchAssignPVCByCohort: (pvcLevel: 1 | 2 | 3) => {
    assignedCount: number;
    skippedAlreadyPassed: number;
    targetEvent: PFIEvent | null;
  };

  // Attendance & QR Scanner Actions (con Anti-Fraude y Soporte Offline)
  checkInStudent: (eventId: string, studentQuery: string, customTime?: string, scannerUserId?: string) => {
    success: boolean;
    message: string;
    student?: UserProfile;
    attendance?: EventAttendance;
    fraudWarning?: string;
  };
  checkOutStudent: (eventId: string, studentQuery: string, customTime?: string, scannerUserId?: string) => {
    success: boolean;
    message: string;
    student?: UserProfile;
    stayMinutes?: number;
    stayPercentage?: number;
    hoursCredited?: number;
    status?: AttendanceStatus;
    fraudWarning?: string;
  };
  validateOnlineOTP: (eventId: string, otpCode: string, studentId?: string) => {
    success: boolean;
    message: string;
    hoursCredited?: number;
  };
  validateAttendanceManually: (attendanceId: string, status: AttendanceStatus, customHours?: number, role?: ParticipantRole) => void;
  bulkAccreditFromMeet: (
    eventId: string,
    records: Array<{
      studentId: string;
      durationMinutes: number;
      attendancePercent: number;
      accredit: boolean;
      meetEmail: string;
      meetName: string;
    }>
  ) => { success: boolean; message: string; accreditedCount: number; rejectedCount: number };
  
  // Student Progress & Scholarships
  getStudentProgress: (studentId?: string) => PFIProgressSummary;
  getStudentScholarshipProgress: (studentId?: string) => ScholarshipProgressSummary;
  assignScholarshipToStudent: (
    studentId: string,
    tipoBeca: UserProfile['tipo_beca'],
    porcentaje: number,
    promedio?: number,
    meta?: number
  ) => { success: boolean; message: string };
  assignDepartmentalScholarship: (
    studentId: string,
    departamento: string,
    porcentaje: number,
    horasSemanales?: number,
    promedio?: number
  ) => { success: boolean; message: string };
  accreditDepartmentalService: (
    studentId: string,
    acreditar?: boolean,
    motivo?: string
  ) => { success: boolean; message: string };
  revokeScholarship: (studentId: string) => { success: boolean; message: string };
  applyScholarshipPenalty: (attendanceId: string, puntosPenalizacion: number, motivo: string) => void;
  
  // Periodos Académicos Cuatrimestrales y Semestrales
  addAcademicPeriod: (period: Omit<import('./types').AcademicPeriod, 'id'>) => { success: boolean; message: string };
  updateAcademicPeriod: (id: string, data: Partial<import('./types').AcademicPeriod>) => { success: boolean; message: string };
  deleteAcademicPeriod: (id: string) => { success: boolean; message: string };
  setCurrentAcademicPeriod: (id: string, tipo: 'cuatrimestral' | 'semestral') => void;
  getActivePeriodForStudent: (carreraOrPrograma?: string) => import('./types').AcademicPeriod | undefined;

  // Convocatorias, Formularios y Dictámenes de Beca (Admin y Estudiante)
  toggleScholarshipApplicationPeriod: (active: boolean, fechaInicio?: string, fechaFin?: string) => void;
  toggleBecarioReport: (enabled: boolean) => void;
  toggleSocioeconomicStudy: (enabled: boolean) => void;
  submitScholarshipApplication: (studentId: string, tipoBeca: string) => { success: boolean; message: string };
  submitScholarshipRenewal: (
    studentId: string,
    params: {
      solicitaAumento?: boolean;
      porcentajeDeseado?: number;
      motivoAumento?: string;
      estudioActualizado?: boolean;
    }
  ) => { success: boolean; message: string };
  submitBecarioReport: (studentId: string) => { success: boolean; message: string };
  submitSocioeconomicStudy: (studentId: string) => { success: boolean; message: string };
  notifyScholarshipResolution: (
    studentId: string,
    resolution: boolean | 'aprobada' | 'condicionada' | 'rechazada',
    tipoBeca?: string,
    porcentaje?: number,
    observaciones?: string,
    condiciones?: string
  ) => { success: boolean; message: string };

  getStudentAttendances: (studentId?: string) => EventAttendance[];
  getEventById: (eventId: string) => PFIEvent | undefined;
  getStudentById: (studentId: string) => UserProfile | undefined;
  getStudentByQuery: (query: string) => UserProfile | undefined;
  
  // Permiso de escaneo para estudiante staff y DEDU
  canUserScanEvent: (eventId: string, userId?: string) => boolean;

  // Carga Masiva de Datos e Importaciones
  batchImportStudents: (studentsData: Partial<UserProfile>[]) => { added: number; updated: number; message: string };
  batchImportEvents: (eventsData: Partial<PFIEvent>[]) => { added: number; updated: number; message: string };
  batchImportAttendances: (records: import('./import-utils').ParsedAttendanceRecord[]) => { imported: number; updated: number; message: string };
  
  // Theme Toggle
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Bitácora de Auditoría de Becas y Expediente Estudiantil
  scholarshipAuditLogs: ScholarshipAuditLog[];
  addScholarshipAuditLog: (log: Omit<ScholarshipAuditLog, 'id' | 'fecha_registro'>) => void;
  studentAuditLogs: StudentAuditEntry[];
  logStudentAuditEvent: (
    entry: Omit<StudentAuditEntry, 'id' | 'timestamp' | 'autor_id' | 'autor_nombre' | 'autor_rol'> & {
      student_id: string;
      autor_id?: string;
      autor_nombre?: string;
      autor_rol?: UserRole;
    }
  ) => void;
  addStudentExpedienteComment: (studentId: string, comment: string) => { success: boolean; message: string };
  updateStudentStatus: (
    studentId: string,
    estatus: 'activo' | 'baja_temporal' | 'baja_definitiva' | 'egresado',
    motivo?: string
  ) => { success: boolean; message: string };
  updateScholarshipDates: (dates: {
    fecha_inicio_solicitud?: string;
    fecha_fin_solicitud?: string;
    fecha_publicacion_resolucion?: string;
    fecha_inicio_ratificacion?: string;
    fecha_fin_ratificacion?: string;
    fecha_publicacion_dictamen?: string;
    activo?: boolean;
  }) => void;
  batchSendScholarshipNotifications: (studentIds: string[]) => { sentCount: number; message: string };

  // CRUD Categorías PFI
  addPFICategory: (category: Omit<PFICategoryConfig, 'id'>) => { success: boolean; message: string };
  updatePFICategory: (id: string, data: Partial<PFICategoryConfig>) => { success: boolean; message: string };
  deletePFICategoryWithReassign: (id: string, reassignCategoryName: string) => { success: boolean; message: string; reassignedEvents: number };

  // CRUD Modalidades de Beca
  addModalidadBeca: (modalidad: Omit<ModalidadBecaConfig, 'id'>) => { success: boolean; message: string };
  updateModalidadBeca: (id: string, data: Partial<ModalidadBecaConfig>) => { success: boolean; message: string };
  deleteModalidadBeca: (id: string) => { success: boolean; message: string };

  // CRUD Departamentos Servicio Becario
  addServicioBecarioDept: (dept: Omit<ServicioBecarioDept, 'id'>) => { success: boolean; message: string };
  updateServicioBecarioDept: (id: string, data: Partial<ServicioBecarioDept>) => { success: boolean; message: string };
  deleteServicioBecarioDept: (id: string) => { success: boolean; message: string };

  // Postulaciones de Roles en Eventos (Staff / Ponente)
  submitRoleApplication: (eventId: string, studentId: string, role: 'staff_logistica' | 'ponente', motivo?: string) => { success: boolean; message: string };
  reviewRoleApplication: (eventId: string, applicationId: string, decision: 'aprobada' | 'rechazada') => { success: boolean; message: string };

  // Stats
  resetToDefaultData: () => void;
}

const PFIContext = createContext<PFIContextType | undefined>(undefined);

const INITIAL_SCHOLARSHIP_AUDIT_LOGS: ScholarshipAuditLog[] = [
  {
    id: 'log-001',
    student_id: 'usr-student-01',
    periodo_codigo: '186',
    periodo_nombre: 'Enero - Abril 2026',
    fecha_registro: '2026-04-28T14:30:00Z',
    autor_nombre: 'Comité de Becas UNIPAZ',
    resolucion: 'aprobada',
    tipo_beca: 'Excelencia Académica (Promedio 9.6 - 10.0)',
    porcentaje_beca: 50,
    promedio_evaluado: 9.8,
    criterios: {
      sin_reprobadas: true,
      pagos_al_corriente: true,
      solicitud_a_tiempo: true,
      sin_sanciones: true,
      esta_inscrito_proximo_ciclo: true,
      cumple_puntos_1000: true,
      carga_materias: 'normal',
    },
    comentarios_comite: 'Expediente impecable, promedio 9.80 y 1,250 puntos formativos alcanzados en el cuatrimestre.',
    notificacion_enviada: true,
    fecha_notificacion: '2026-04-29T09:00:00Z',
  },
  {
    id: 'log-002',
    student_id: 'usr-student-03',
    periodo_codigo: '186',
    periodo_nombre: 'Enero - Abril 2026',
    fecha_registro: '2026-04-28T16:15:00Z',
    autor_nombre: 'Comité de Becas UNIPAZ',
    resolucion: 'condicionada',
    tipo_beca: 'Estudio Socioeconómico',
    porcentaje_beca: 30,
    promedio_evaluado: 8.4,
    criterios: {
      sin_reprobadas: true,
      pagos_al_corriente: false,
      solicitud_a_tiempo: true,
      sin_sanciones: true,
      esta_inscrito_proximo_ciclo: true,
      cumple_puntos_1000: true,
      carga_materias: 'normal',
    },
    condicion_acordada: 'Regularización de pagos de colegiatura pendientes antes de la siguiente reinscripción.',
    comentarios_comite: 'Se otorga prórroga de regularización financiera autorizada en acta de sesión 186/C-4.',
    notificacion_enviada: true,
    fecha_notificacion: '2026-04-29T09:00:00Z',
  },
];

const STORAGE_KEYS = {
  PROFILES: 'unipaz_pfi_profiles_v3',
  EVENTS: 'unipaz_pfi_events_v3',
  ATTENDANCES: 'unipaz_pfi_attendances_v3',
  JUSTIFICATIONS: 'unipaz_pfi_justifications_v3',
  NOTIFICATIONS: 'unipaz_pfi_notifications_v3',
  FEEDBACKS: 'unipaz_pfi_feedbacks_v3',
  CURRENT_USER_ID: 'unipaz_pfi_active_user_id_v3',
  CONFIG: 'unipaz_pfi_config_v3',
  SCHOLARSHIP_LOGS: 'unipaz_pfi_scholarship_logs_v3',
  STUDENT_AUDIT_LOGS: 'unipaz_pfi_student_audit_logs_v3',
};

export const PFIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [events, setEvents] = useState<PFIEvent[]>(MOCK_EVENTS);
  const [attendances, setAttendances] = useState<EventAttendance[]>(MOCK_ATTENDANCES);
  const [justifications, setJustifications] = useState<AttendanceJustification[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [feedbacks, setFeedbacks] = useState<EventFeedback[]>([]);
  const [pfiConfig, setPfiConfig] = useState<PFIGlobalConfig>(DEFAULT_PFI_CONFIG);
  const [scholarshipAuditLogs, setScholarshipAuditLogs] = useState<ScholarshipAuditLog[]>(INITIAL_SCHOLARSHIP_AUDIT_LOGS);
  const [studentAuditLogs, setStudentAuditLogs] = useState<StudentAuditEntry[]>(MOCK_AUDIT_LOGS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-student-01');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  const [scannedTokensCache, setScannedTokensCache] = useState<Map<string, number>>(new Map());

  // Cargar de LocalStorage al iniciar
  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const savedAttendances = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
      const savedJustifications = localStorage.getItem(STORAGE_KEYS.JUSTIFICATIONS);
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedFeedbacks = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.SCHOLARSHIP_LOGS);
      const savedStudentLogs = localStorage.getItem(STORAGE_KEYS.STUDENT_AUDIT_LOGS);
      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const savedTheme = localStorage.getItem('unipaz_pfi_theme') as 'light' | 'dark' | null;

      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedAttendances) setAttendances(JSON.parse(savedAttendances));
      if (savedJustifications) setJustifications(JSON.parse(savedJustifications));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedFeedbacks) setFeedbacks(JSON.parse(savedFeedbacks));
      if (savedLogs) setScholarshipAuditLogs(JSON.parse(savedLogs));
      if (savedStudentLogs) setStudentAuditLogs(JSON.parse(savedStudentLogs));
      if (savedUserId) setCurrentUserId(savedUserId);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setPfiConfig({
          ...DEFAULT_PFI_CONFIG,
          ...parsedConfig,
          firmas: {
            ...DEFAULT_PFI_CONFIG.firmas,
            ...(parsedConfig.firmas || {}),
          },
        });
      }

      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    localStorage.setItem('unipaz_pfi_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('unipaz_pfi_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Guardar en LocalStorage al haber cambios
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(attendances));
      localStorage.setItem(STORAGE_KEYS.JUSTIFICATIONS, JSON.stringify(justifications));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(pfiConfig));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }, [profiles, events, attendances, justifications, notifications, feedbacks, currentUserId, pfiConfig, isLoaded]);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0] || MOCK_PROFILES[0];

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId);
    if (found) {
      setCurrentUserId(userId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isTargetStudent = found.role === 'estudiante';
        const isTargetStaffOrAdmin = found.role === 'admin' || found.role === 'extension' || found.role === 'dedu' || found.role === 'staff';

        if (isTargetStudent && (pathname.startsWith('/admin') || pathname === '/')) {
          window.location.href = '/estudiante';
        } else if (isTargetStaffOrAdmin && (pathname.startsWith('/estudiante') || pathname === '/')) {
          window.location.href = '/admin';
        } else if ((found.role === 'extension' || found.role === 'dedu') && pathname.startsWith('/admin/becas')) {
          window.location.href = '/admin/eventos';
        } else {
          window.location.reload();
        }
      }
    }
  };

  const setUserRole = (role: UserRole) => {
    const target = profiles.find((p) => p.role === role);
    if (target) {
      switchUser(target.id);
    }
  };

  const toggleDocenteStaffRole = (userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, es_docente_colaborador: !p.es_docente_colaborador } : p))
    );
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'fecha' | 'leido'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      fecha: new Date().toISOString(),
      leido: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const submitEventFeedback = (fb: Omit<EventFeedback, 'id' | 'fecha'>) => {
    const newFb: EventFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      fecha: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newFb, ...prev]);
  };

  // MÓDULO DE JUSTIFICACIONES MÉDICAS / LABORALES
  const submitJustification = (data: Omit<AttendanceJustification, 'id' | 'status' | 'fecha_solicitud'>) => {
    const newJust: AttendanceJustification = {
      ...data,
      id: `just-${Date.now()}`,
      status: 'pendiente',
      fecha_solicitud: new Date().toISOString(),
    };

    setJustifications((prev) => [newJust, ...prev]);

    addNotification({
      user_id: 'usr-staff-01',
      titulo: 'Nueva Solicitud de Justificación PFI',
      mensaje: `Un estudiante ha subido evidencia para justificar su inasistencia o falta de check-out.`,
      tipo: 'warning',
    });

    return {
      success: true,
      message: 'Solicitud y comprobante enviados a Coordinación PFI para su revisión.',
    };
  };

  const reviewJustification = (
    justificationId: string,
    decision: JustificationStatus,
    observaciones?: string
  ) => {
    const just = justifications.find((j) => j.id === justificationId);
    if (!just) return { success: false, message: 'Justificación no encontrada.' };

    const event = events.find((e) => e.id === just.event_id);
    const nominalHours = event?.horas_pfi || 10.0;

    setJustifications((prev) =>
      prev.map((j) =>
        j.id === justificationId
          ? {
              ...j,
              status: decision,
              observaciones_admin: observaciones,
              revisado_por: currentUser.id,
              fecha_resolucion: new Date().toISOString(),
            }
          : j
      )
    );

    if (decision === 'aprobada') {
      setAttendances((prev) =>
        prev.map((a) =>
          a.id === just.attendance_id
            ? {
                ...a,
                status: 'asistio',
                horas_acreditadas: nominalHours,
                notes: `Acreditado por Justificación Médica/Laboral Aprobada: ${just.motivo}`,
                validado_por: currentUser.id,
              }
            : a
        )
      );

      addNotification({
        user_id: just.student_id,
        titulo: '✓ Justificación Aprobada por Coordinación',
        mensaje: `Se acreditaron +${nominalHours.toFixed(2)} hrs PFI correspondientes a "${event?.titulo}".`,
        tipo: 'success',
      });

      logStudentAuditEvent({
        student_id: just.student_id,
        categoria: 'justificacion_asistencia',
        accion: `Aprobación de Justificación Médica/Laboral: ${event?.titulo || just.event_id}`,
        detalles: `Motivo expuesto: ${just.motivo}. Acreditación formal de +${nominalHours.toFixed(1)} hrs PFI. Observaciones resolutorias: ${observaciones || 'Aprobada'}.`,
        valor_anterior: 'Inasistencia / No Acreditado',
        valor_nuevo: `Justificada (+${nominalHours.toFixed(1)} hrs PFI)`,
        metadata: { justification_id: just.id, event_id: just.event_id },
      });

      return { success: true, message: `Justificación aprobada y +${nominalHours} hrs acreditadas al alumno.` };
    } else {
      addNotification({
        user_id: just.student_id,
        titulo: '❌ Justificación Rechazada',
        mensaje: `Tu solicitud para "${event?.titulo}" no fue aprobada: ${observaciones || 'Evidencia no concluyente'}.`,
        tipo: 'error',
      });

      logStudentAuditEvent({
        student_id: just.student_id,
        categoria: 'justificacion_asistencia',
        accion: `Rechazo de Justificación: ${event?.titulo || just.event_id}`,
        detalles: `Motivo expuesto: ${just.motivo}. Causa del rechazo: ${observaciones || 'Evidencia no concluyente'}.`,
        valor_anterior: 'En Revisión',
        valor_nuevo: 'Rechazada',
        metadata: { justification_id: just.id, event_id: just.event_id },
      });

      return { success: true, message: 'Justificación marcada como rechazada.' };
    }
  };

  const updateGlobalConfig = (newConfig: Partial<PFIGlobalConfig>) => {
    setPfiConfig((prev) => ({
      ...prev,
      ...newConfig,
      categoriaHoras: {
        ...prev.categoriaHoras,
        ...(newConfig.categoriaHoras || {}),
      },
      firmas: {
        ...prev.firmas,
        ...(newConfig.firmas || {}),
      },
    }));
  };

  const getStandardHoursForCategory = (category: EventCategory): number => {
    return pfiConfig.categoriaHoras[category] ?? 10.0;
  };

  const getStudentById = (studentId: string) => {
    return profiles.find((p) => p.id === studentId);
  };

  const getStudentByQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    return profiles.find(
      (p) =>
        p.id.toLowerCase() === q ||
        p.matricula.toLowerCase() === q ||
        p.email.toLowerCase() === q ||
        p.qr_secret.toLowerCase() === q ||
        `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q)
    );
  };

  const getEventById = (eventId: string) => {
    return events.find((e) => e.id === eventId);
  };

  const getStudentAttendances = (studentId?: string) => {
    const targetId = studentId || currentUser.id;
    const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

    return attendances
      .filter((a) => a.student_id === targetId)
      .map((att) => ({
        ...att,
        event: eventsMap.get(att.event_id),
      }));
  };

  const getStudentProgress = (studentId?: string) => {
    const targetId = studentId || currentUser.id;
    const studentAtts = attendances.filter((a) => a.student_id === targetId);
    const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

    return calculateStudentPFIProgress(studentAtts, eventsMap);
  };

  const applyForStaffRole = (eventId: string, studentId?: string, motivo?: string) => {
    const sId = studentId || currentUser.id;
    const event = events.find((e) => e.id === eventId);
    const student = profiles.find((p) => p.id === sId);

    if (!event || !student) return { success: false, message: 'Evento o Estudiante no encontrado.' };
    if (!event.permite_staff) {
      return { success: false, message: 'Este evento no tiene abierta convocatoria para Staff Logístico.' };
    }

    const currentStaffCount = event.cupo_staff_ocupado || 0;
    const maxStaff = event.cupo_staff || 5;

    if (currentStaffCount >= maxStaff) {
      return { success: false, message: 'El cupo de Staff Logístico para este evento ya está cubierto.' };
    }

    const existingApplication = (event.solicitudes_staff || []).find((s) => s.student_id === sId);
    if (existingApplication && existingApplication.status === 'aceptado') {
      return { success: false, message: 'Ya eres Staff confirmado para este evento.' };
    }

    const newApplication: StaffApplication = {
      student_id: sId,
      fecha_solicitud: new Date().toISOString(),
      status: 'pendiente',
      motivo: motivo || 'Postulación voluntaria a staff de logística y apoyo',
    };

    const updatedSolicitudes = [
      ...(event.solicitudes_staff || []).filter((s) => s.student_id !== sId),
      newApplication,
    ];

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, solicitudes_staff: updatedSolicitudes } : e))
    );

    addNotification({
      user_id: 'usr-staff-01',
      titulo: 'Nueva Postulación a Staff Logístico',
      mensaje: `${student.nombre} ${student.apellidos} se ha postulado para Staff en "${event.titulo}".`,
      tipo: 'info',
    });

    return {
      success: true,
      message: `¡Postulación enviada! La Coordinación PFI revisará tu solicitud de Staff para "${event.titulo}".`,
    };
  };

  const manageStaffApplication = (eventId: string, studentId: string, decision: 'aceptado' | 'rechazado') => {
    const event = events.find((e) => e.id === eventId);
    const student = profiles.find((p) => p.id === studentId);
    if (!event || !student) return { success: false, message: 'Evento o Estudiante no encontrado.' };

    const updatedSolicitudes = (event.solicitudes_staff || []).map((s) =>
      s.student_id === studentId
        ? {
            ...s,
            status: decision,
            revisado_por: currentUser.id,
            fecha_resolucion: new Date().toISOString(),
          }
        : s
    );

    const staffHours = event.horas_staff || (event.horas_pfi * 1.5) || 8.0;

    if (decision === 'aceptado') {
      const existingAtt = attendances.find((a) => a.event_id === eventId && a.student_id === studentId);
      if (existingAtt) {
        setAttendances((prev) =>
          prev.map((a) =>
            a.id === existingAtt.id
              ? {
                  ...a,
                  rol_participacion: 'staff_logistica',
                  status: 'registrado',
                  notes: `Staff Logístico Oficial aceptado (+${staffHours}h)`,
                }
              : a
          )
        );
      } else {
        const newAtt: EventAttendance = {
          id: `att-staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          event_id: eventId,
          student_id: studentId,
          status: 'registrado',
          rol_participacion: 'staff_logistica',
          horas_acreditadas: 0,
          notes: `Staff Logístico Oficial aceptado (+${staffHours}h)`,
          created_at: new Date().toISOString(),
        };
        setAttendances((prev) => [...prev, newAtt]);
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                cupo_staff_ocupado: (e.cupo_staff_ocupado || 0) + 1,
                solicitudes_staff: updatedSolicitudes,
              }
            : e
        )
      );

      addNotification({
        user_id: studentId,
        titulo: '🎉 ¡Aceptado como Staff Logístico Oficial!',
        mensaje: `Has sido confirmado como Staff para "${event.titulo}". Acreditarás +${staffHours} hrs al concluir el evento.`,
        tipo: 'success',
      });

      return {
        success: true,
        message: `Estudiante ${student.nombre} ${student.apellidos} aceptado como Staff Logístico (+${staffHours}h).`,
      };
    } else {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, solicitudes_staff: updatedSolicitudes } : e))
      );
      return {
        success: true,
        message: `Solicitud de staff rechazada para ${student.nombre} ${student.apellidos}.`,
      };
    }
  };

  const applyStaffPenalty = (attendanceId: string, penalizacionHoras: number, motivo: string) => {
    const att = attendances.find((a) => a.id === attendanceId);

    setAttendances((prev) =>
      prev.map((a) =>
        a.id === attendanceId
          ? {
              ...a,
              status: 'incompleto',
              horas_acreditadas: 0,
              penalizacion_horas: penalizacionHoras,
              motivo_penalizacion: motivo,
              notes: `PENALIZACIÓN STAFF: ${motivo} (-${penalizacionHoras} hrs)`,
            }
          : a
      )
    );

    if (att) {
      addNotification({
        user_id: att.student_id,
        titulo: '⚠️ Sanción por Falta a Rol de Staff',
        mensaje: `Se aplicó una penalización de -${penalizacionHoras} hrs en tu expediente por: ${motivo}.`,
        tipo: 'error',
      });
    }
  };

  const assignEventToStudentWithRole = (
    eventId: string,
    studentId: string,
    role: ParticipantRole,
    customHours?: number
  ) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const targetStudent = profiles.find((p) => p.id === studentId);
    if (!targetEvent || !targetStudent) return { success: false, message: 'No encontrado.' };

    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === studentId);
    if (existing) {
      setAttendances((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                rol_participacion: role,
                status: 'registrado',
                notes: `Asignación directa con rol: ${role}`,
              }
            : a
        )
      );
    } else {
      const newAtt: EventAttendance = {
        id: `att-role-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        event_id: eventId,
        student_id: studentId,
        status: 'registrado',
        rol_participacion: role,
        horas_acreditadas: 0,
        es_asignacion_directa: true,
        notes: `Asignación directa con rol: ${role}`,
        created_at: new Date().toISOString(),
      };
      setAttendances((prev) => [...prev, newAtt]);
    }

    addNotification({
      user_id: studentId,
      titulo: '🎓 Asignación de Actividad Formativa',
      mensaje: `Coordinación te ha inscrito a "${targetEvent.titulo}" con rol de [${role}].`,
      tipo: 'info',
    });

    return {
      success: true,
      message: `Asignado como ${role} a ${targetStudent.nombre} ${targetStudent.apellidos}.`,
    };
  };

  const assignEventToStudent = (eventId: string, studentId: string, isSpecialCase = false) => {
    return assignEventToStudentWithRole(eventId, studentId, 'asistente');
  };

  const batchAssignPVCByCohort = (pvcLevel: 1 | 2 | 3) => {
    const targetEvent = events.find((e) => {
      const t = e.titulo.toUpperCase();
      if (pvcLevel === 1) return t.includes('PVC I') || t.includes('INICIANDO MIS SUEÑOS');
      if (pvcLevel === 2) return t.includes('PVC II') || t.includes('AHÍ LA LLEVO');
      if (pvcLevel === 3) return t.includes('PVC III') || t.includes('YA CASI');
      return false;
    });

    if (!targetEvent) {
      return { assignedCount: 0, skippedAlreadyPassed: 0, targetEvent: null };
    }

    const students = profiles.filter((p) => p.role === 'estudiante');
    let assignedCount = 0;
    let skippedAlreadyPassed = 0;
    const newAttendances: EventAttendance[] = [];

    for (const student of students) {
      const studentProgress = getStudentProgress(student.id);
      let alreadyPassed = false;
      if (pvcLevel === 1 && studentProgress.pvc.pvc1) alreadyPassed = true;
      if (pvcLevel === 2 && studentProgress.pvc.pvc2) alreadyPassed = true;
      if (pvcLevel === 3 && studentProgress.pvc.pvc3) alreadyPassed = true;

      if (alreadyPassed) {
        skippedAlreadyPassed++;
        continue;
      }

      const alreadyRegistered = attendances.some(
        (a) => a.event_id === targetEvent.id && a.student_id === student.id
      );

      if (!alreadyRegistered) {
        newAttendances.push({
          id: `att-batch-${Date.now()}-${student.id.substr(0, 4)}-${Math.random().toString(36).substr(2, 3)}`,
          event_id: targetEvent.id,
          student_id: student.id,
          status: 'registrado',
          rol_participacion: 'asistente',
          horas_acreditadas: 0,
          es_asignacion_directa: true,
          notes: `Asignación programada por cohorte PVC ${pvcLevel}`,
          created_at: new Date().toISOString(),
        });
        assignedCount++;
      }
    }

    if (newAttendances.length > 0) {
      setAttendances((prev) => [...prev, ...newAttendances]);
    }

    return { assignedCount, skippedAlreadyPassed, targetEvent };
  };

  // REGISTRO A EVENTO CON SOPORTE DE LISTA DE ESPERA (WAITLIST)
  const registerToEvent = (eventId: string, studentId?: string, role: ParticipantRole = 'asistente') => {
    const sId = studentId || currentUser.id;
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);
    if (existing && existing.status === 'registrado') {
      return { success: false, message: 'Ya te encuentras inscrito en este evento.' };
    }

    const currentOccupied = attendances.filter(
      (a) => a.event_id === eventId && a.status === 'registrado'
    ).length;

    const isFull = event.cupo_maximo > 0 && currentOccupied >= event.cupo_maximo;

    if (isFull) {
      const waitlistAtt: EventAttendance = {
        id: `att-wait-${Date.now()}`,
        event_id: eventId,
        student_id: sId,
        status: 'lista_espera',
        rol_participacion: role,
        horas_acreditadas: 0,
        notes: 'En lista de espera por cupo lleno',
        created_at: new Date().toISOString(),
      };
      setAttendances((prev) => [...prev, waitlistAtt]);
      return {
        success: true,
        waitlist: true,
        message: `El cupo principal está lleno. Te has registrado en la Lista de Espera de "${event.titulo}". Si un lugar se libera, serás promovido automáticamente.`,
      };
    }

    if (existing && (existing.status === 'cancelado' || existing.status === 'lista_espera')) {
      setAttendances((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? { ...a, status: 'registrado', rol_participacion: role, created_at: new Date().toISOString() }
            : a
        )
      );
    } else {
      const newAttendance: EventAttendance = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        event_id: eventId,
        student_id: sId,
        status: 'registrado',
        rol_participacion: role,
        horas_acreditadas: 0,
        created_at: new Date().toISOString(),
      };
      setAttendances((prev) => [...prev, newAttendance]);
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, cupo_ocupado: (e.cupo_ocupado || 0) + 1 } : e
      )
    );

    return { success: true, message: `Inscripción exitosa a "${event.titulo}".` };
  };

  // CANCELACIÓN DE REGISTRO CON REGLA DE 10 MINUTOS Y PROMOCIÓN DE LISTA DE ESPERA
  const cancelRegistration = (eventId: string, studentId?: string) => {
    const sId = studentId || currentUser.id;
    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);

    if (!existing) {
      return { success: false, message: 'No estás registrado en este evento.' };
    }

    if (existing.status === 'asistio') {
      return { success: false, message: 'No puedes cancelar una actividad ya acreditada.' };
    }

    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      const eventDateTime = new Date(`${ev.fecha_evento}T${ev.hora_inicio || '00:00'}`).getTime();
      const now = Date.now();
      const diffMinutes = (eventDateTime - now) / (1000 * 60);

      // Si el evento ya concluyó o faltan menos de 10 minutos:
      if (!isNaN(diffMinutes) && diffMinutes < 10) {
        return {
          success: false,
          message: 'Solo puedes cancelar tu inscripción hasta 10 minutos antes del inicio del evento. Tu lugar ha quedado en firme y se registrará inasistencia si no completas tu Check-in y Check-out.',
        };
      }
    }

    // Buscar si hay alguien en lista de espera para promoverlo
    const nextInWaitlist = attendances.find(
      (a) => a.event_id === eventId && a.status === 'lista_espera' && a.student_id !== sId
    );

    if (nextInWaitlist) {
      setAttendances((prev) =>
        prev.map((a) => {
          if (a.id === existing.id) return { ...a, status: 'cancelado' };
          if (a.id === nextInWaitlist.id) return { ...a, status: 'registrado', notes: 'Promovido de Lista de Espera a Inscrito Oficial' };
          return a;
        })
      );

      const promotedStudent = profiles.find((p) => p.id === nextInWaitlist.student_id);
      const ev = events.find((e) => e.id === eventId);

      addNotification({
        user_id: nextInWaitlist.student_id,
        titulo: '🎉 ¡Lugar Liberado en Evento!',
        mensaje: `Has subido de la Lista de Espera a Inscrito Oficial en "${ev?.titulo}".`,
        tipo: 'success',
      });

      return {
        success: true,
        message: `Inscripción cancelada. Se promovió automáticamente a ${promotedStudent?.nombre || 'el siguiente alumno'} de la lista de espera.`,
      };
    } else {
      setAttendances((prev) =>
        prev.map((a) => (a.id === existing.id ? { ...a, status: 'cancelado' } : a))
      );

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, cupo_ocupado: Math.max(0, (e.cupo_ocupado || 1) - 1) }
            : e
        )
      );

      return { success: true, message: 'Inscripción cancelada.' };
    }
  };

  const createEvent = (eventData: Omit<PFIEvent, 'id'>) => {
    const standardHours = getStandardHoursForCategory(eventData.categoria);
    const newEvent: PFIEvent = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}`,
      horas_pfi: eventData.horas_pfi || standardHours,
      horas_staff: eventData.horas_staff || (eventData.horas_pfi ? eventData.horas_pfi * 1.5 : 8.0),
      horas_ponente: eventData.horas_ponente || 15.0,
      permite_staff: eventData.permite_staff ?? true,
      cupo_staff: eventData.cupo_staff ?? 5,
      cupo_staff_ocupado: 0,
      cupo_ocupado: 0,
      activo: true,
      created_at: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    return { success: true, event: newEvent };
  };

  const updateEvent = (eventId: string, data: Partial<PFIEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...data } : e)));
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setAttendances((prev) => prev.filter((a) => a.event_id !== eventId));
  };

  const checkInStudent = (
    eventId: string,
    studentQuery: string,
    customTime?: string,
    scannerUserId?: string
  ) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return {
        success: false,
        message: `Estudiante no encontrado con el código o QR proporcionado ("${studentQuery}").`,
      };
    }

    if (student.activo === false || student.estatus_inscripcion === 'baja_temporal' || student.estatus_inscripcion === 'baja_definitiva') {
      return {
        success: false,
        message: `⚠️ Acceso Denegado: El alumno ${student.nombre} ${student.apellidos} (${student.matricula}) se encuentra en estatus de ${student.estatus_inscripcion === 'baja_definitiva' ? 'BAJA DEFINITIVA' : 'BAJA TEMPORAL'}. Su credencial digital e inscripciones están inhabilitadas.`,
        student,
      };
    }

    const scannerId = scannerUserId || currentUser.id;
    const tokenHash = `${eventId}-${student.id}-checkin`;
    const lastScan = scannedTokensCache.get(tokenHash);
    if (lastScan && Date.now() - lastScan < 25000) {
      return {
        success: false,
        message: '⚠️ Alerta de Seguridad: Este código QR ya fue escaneado hace unos segundos. Evite duplicar el escaneo o usar capturas de pantalla.',
        fraudWarning: 'Escaneo duplicado inmediato detectado.',
      };
    }

    setScannedTokensCache((prev) => new Map(prev).set(tokenHash, Date.now()));

    const checkInTime = customTime || new Date().toISOString();
    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    if (existing) {
      if (existing.status === 'asistio') {
        return {
          success: false,
          message: `El estudiante ${student.nombre} ${student.apellidos} ya tiene acreditada esta actividad (+${existing.horas_acreditadas} hrs).`,
          student,
          attendance: existing,
        };
      }

      if (existing.check_in_timestamp) {
        return {
          success: false,
          message: `El estudiante ${student.nombre} ${student.apellidos} ya cuenta con Check-In registrado a las ${new Date(existing.check_in_timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs. Debe realizar Check-Out al finalizar.`,
          student,
          attendance: existing,
        };
      }

      const updated: EventAttendance = {
        ...existing,
        status: 'registrado',
        check_in_timestamp: checkInTime,
        validado_por: scannerId,
        qr_token_hash: tokenHash,
      };

      setAttendances((prev) => prev.map((a) => (a.id === existing.id ? updated : a)));
      return {
        success: true,
        message: `✓ Check-In confirmado para ${student.nombre} ${student.apellidos} (${existing.rol_participacion === 'staff_logistica' ? 'Staff Logístico' : 'Oyente'}).`,
        student,
        attendance: updated,
      };
    }

    const newAttendance: EventAttendance = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_id: eventId,
      student_id: student.id,
      status: 'registrado',
      rol_participacion: 'asistente',
      check_in_timestamp: checkInTime,
      horas_acreditadas: 0,
      validado_por: scannerId,
      qr_token_hash: tokenHash,
      created_at: new Date().toISOString(),
    };

    setAttendances((prev) => [...prev, newAttendance]);
    return {
      success: true,
      message: `✓ Check-In directo registrado para ${student.nombre} ${student.apellidos} (${student.matricula}).`,
      student,
      attendance: newAttendance,
    };
  };

  const checkOutStudent = (
    eventId: string,
    studentQuery: string,
    customTime?: string,
    scannerUserId?: string
  ) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return { success: false, message: `Estudiante no encontrado ("${studentQuery}").` };
    }

    const scannerId = scannerUserId || currentUser.id;
    const att = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    if (!att || !att.check_in_timestamp) {
      return {
        success: false,
        message: `El estudiante ${student.nombre} ${student.apellidos} no cuenta con registro de Check-In previo para este evento.`,
        student,
      };
    }

    if (att.status === 'asistio') {
      return {
        success: true,
        message: `El estudiante ya cuenta con horas acreditadas (+${att.horas_acreditadas} hrs).`,
        student,
        hoursCredited: att.horas_acreditadas,
        status: 'asistio' as AttendanceStatus,
      };
    }

    const checkOutTime = customTime || new Date().toISOString();
    const nominalHours = att.rol_participacion === 'staff_logistica'
      ? (event.horas_staff || event.horas_pfi * 1.5 || 8.0)
      : att.rol_participacion === 'ponente'
      ? (event.horas_ponente || 15.0)
      : event.horas_pfi;

    const result = validateStayDuration(
      att.check_in_timestamp,
      checkOutTime,
      event.hora_inicio,
      event.hora_fin,
      nominalHours
    );

    const nominalScholarshipPoints = event.puntos_beca || getStandardScholarshipPoints(event.categoria, att.rol_participacion);
    const pointsCredited = result.status === 'asistio' ? nominalScholarshipPoints : 0;

    const updated: EventAttendance = {
      ...att,
      check_out_timestamp: checkOutTime,
      status: result.status,
      horas_acreditadas: result.horasAcreditadas,
      puntos_beca_acreditados: pointsCredited,
      validado_por: scannerId,
      notes: result.mensaje,
    };

    setAttendances((prev) => prev.map((a) => (a.id === att.id ? updated : a)));

    return {
      success: true,
      message: result.mensaje,
      student,
      stayMinutes: result.permanenciaMinutos,
      stayPercentage: result.porcentajePermanencia,
      hoursCredited: result.horasAcreditadas,
      status: result.status,
    };
  };

  const validateOnlineOTP = (eventId: string, otpCode: string, studentId?: string) => {
    const sId = studentId || currentUser.id;
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    if (!event.otp_online_code) {
      return { success: false, message: 'Este evento no requiere código OTP.' };
    }

    if (event.otp_online_code.trim().toUpperCase() !== otpCode.trim().toUpperCase()) {
      return { success: false, message: 'Código OTP incorrecto o expirado.' };
    }

    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);
    const nominalScholarshipPoints = event.puntos_beca || getStandardScholarshipPoints(event.categoria, 'asistente');

    if (existing) {
      if (existing.status === 'asistio') {
        return { success: true, message: 'Ya tenías acreditada esta actividad virtual.', hoursCredited: existing.horas_acreditadas };
      }

      setAttendances((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                status: 'asistio',
                horas_acreditadas: event.horas_pfi,
                puntos_beca_acreditados: nominalScholarshipPoints,
                notes: 'Acreditado mediante Token OTP Virtual en Vivo',
              }
            : a
        )
      );
    } else {
      const newAttendance: EventAttendance = {
        id: `att-otp-${Date.now()}`,
        event_id: eventId,
        student_id: sId,
        status: 'asistio',
        rol_participacion: 'asistente',
        horas_acreditadas: event.horas_pfi,
        puntos_beca_acreditados: nominalScholarshipPoints,
        notes: 'Acreditado mediante Token OTP Virtual en Vivo',
        created_at: new Date().toISOString(),
      };
      setAttendances((prev) => [...prev, newAttendance]);
    }

    return {
      success: true,
      message: `¡Código OTP verificado! Se acreditaron +${event.horas_pfi.toFixed(2)} hrs PFI y +${nominalScholarshipPoints} Puntos Beca.`,
      hoursCredited: event.horas_pfi,
    };
  };

  const validateAttendanceManually = (
    attendanceId: string,
    status: AttendanceStatus,
    customHours?: number,
    role?: ParticipantRole
  ) => {
    const existing = attendances.find((a) => a.id === attendanceId);
    if (!existing) return;

    const ev = events.find((e) => e.id === existing.event_id);
    const assignedRole = role || existing.rol_participacion || 'asistente';
    const nominalHrs = assignedRole === 'staff_logistica'
      ? (ev?.horas_staff || (ev?.horas_pfi || 10) * 1.5)
      : assignedRole === 'ponente'
      ? (ev?.horas_ponente || 15.0)
      : (ev?.horas_pfi || 0);

    const nominalPoints = ev?.puntos_beca || getStandardScholarshipPoints(ev?.categoria || 'Taller Extracurricular', assignedRole);
    const hours = customHours !== undefined ? customHours : status === 'asistio' ? nominalHrs : 0;
    const points = status === 'asistio' ? nominalPoints : 0;

    setAttendances((prev) =>
      prev.map((a) => {
        if (a.id !== attendanceId) return a;
        return {
          ...a,
          status,
          rol_participacion: assignedRole,
          horas_acreditadas: hours,
          puntos_beca_acreditados: points,
          validado_por: currentUser.id,
          notes: 'Validado manualmente por Coordinación PFI / Admin',
        };
      })
    );

    logStudentAuditEvent({
      student_id: existing.student_id,
      categoria: 'validacion_actividad',
      accion: `Validación Extemporánea de Actividad: ${ev?.titulo || 'Actividad PFI'}`,
      detalles: `Estatus: ${status}, Horas Acreditadas: ${hours.toFixed(1)} hrs, Puntos Beca: ${points} pts, Rol: ${assignedRole}. Registrado por autoridad competente.`,
      valor_anterior: `${existing.status} (${existing.horas_acreditadas?.toFixed(1) || '0.0'} hrs)`,
      valor_nuevo: `${status} (${hours.toFixed(1)} hrs)`,
      metadata: { event_id: existing.event_id, attendance_id: existing.id },
    });
  };

  const assignScholarshipToStudent = (
    studentId: string,
    tipoBeca: UserProfile['tipo_beca'],
    porcentaje: number,
    promedio?: number,
    meta?: number
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const prevBeca = student.tiene_beca ? `${student.porcentaje_beca}% (${student.tipo_beca})` : 'Sin Beca';
    const newBeca = `${porcentaje}% (${tipoBeca || 'Excelencia Académica'})`;

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              tiene_beca: true,
              tipo_beca: tipoBeca || 'Excelencia Académica',
              porcentaje_beca: porcentaje,
              promedio_academico: promedio || p.promedio_academico || 9.0,
              puntos_beca_meta_cuatrimestral: meta || 1000,
            }
          : p
      )
    );

    logStudentAuditEvent({
      student_id: studentId,
      categoria: 'cambio_beca',
      accion: `Asignación / Modificación de Beca Institucional`,
      detalles: `Modalidad: ${tipoBeca || 'Excelencia Académica'}, Porcentaje de descuento: ${porcentaje}%, Promedio: ${promedio || student.promedio_academico || 9.0}, Meta cuatrimestral: ${meta || 1000} pts.`,
      valor_anterior: prevBeca,
      valor_nuevo: newBeca,
    });

    addNotification({
      user_id: studentId,
      titulo: '🎓 Asignación de Beca Institucional',
      mensaje: `Se ha asignado ${tipoBeca} (${porcentaje}%) a tu expediente. Tu meta cuatrimestral de renovación es de ${meta || 1000} puntos.`,
      tipo: 'success',
    });

    return {
      success: true,
      message: `Beca asignada exitosamente a ${student.nombre} ${student.apellidos}.`,
    };
  };

  const assignDepartmentalScholarship = (
    studentId: string,
    departamento: string,
    porcentaje: number,
    horasSemanales: number = 10,
    promedio?: number
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const tipoBeca = `Apoyo Departamental - ${departamento}`;

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              tiene_beca: true,
              tipo_beca: tipoBeca,
              porcentaje_beca: porcentaje,
              promedio_academico: promedio || p.promedio_academico || 9.0,
              puntos_beca_meta_cuatrimestral: 1000,
              es_becario_departamental: true,
              departamento_beca: departamento,
              horas_departamentales_semanales: horasSemanales,
              cumplimiento_departamental_acreditado: false,
              puntos_departamentales_otorgados: 1000,
            }
          : p
      )
    );

    addNotification({
      user_id: studentId,
      titulo: '🏢 Asignación de Beca Departamental',
      mensaje: `Has sido asignado como becario en el departamento de ${departamento} (${horasSemanales} hrs/semana). Al término del cuatrimestre se te otorgarán los 1,000 puntos cuatrimestrales.`,
      tipo: 'success',
    });

    return {
      success: true,
      message: `Beca departamental en ${departamento} asignada con éxito a ${student.nombre} ${student.apellidos}.`,
    };
  };

  const accreditDepartmentalService = (
    studentId: string,
    acreditar: boolean = true,
    motivo?: string
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              cumplimiento_departamental_acreditado: acreditar,
              fecha_acreditacion_departamental: acreditar ? new Date().toISOString().split('T')[0] : undefined,
              puntos_departamentales_otorgados: acreditar ? 1000 : 0,
            }
          : p
      )
    );

    if (acreditar) {
      addNotification({
        user_id: studentId,
        titulo: '🎉 1,000 Puntos Acreditados por Labor Departamental',
        mensaje: `La jefatura de ${student.departamento_beca || 'tu departamento'} ha validado satisfactoriamente tus horas de servicio. Se han otorgado los 1,000 puntos cuatrimestrales de beca.`,
        tipo: 'success',
      });
    }

    return {
      success: true,
      message: acreditar
        ? `Se han acreditado los 1,000 puntos departamentales a ${student.nombre} ${student.apellidos}.`
        : `Se ha revocado la acreditación departamental de ${student.nombre} ${student.apellidos}.`,
    };
  };

  const revokeScholarship = (studentId: string) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              tiene_beca: false,
              es_becario_departamental: false,
              departamento_beca: undefined,
              cumplimiento_departamental_acreditado: false,
            }
          : p
      )
    );

    addNotification({
      user_id: studentId,
      titulo: 'Notificación de Beca Institucional',
      mensaje: 'Tu estatus de beca ha sido modificado por el Comité de Becas.',
      tipo: 'info',
    });

    return {
      success: true,
      message: `Beca revocada para ${student.nombre} ${student.apellidos}.`,
    };
  };

  const applyScholarshipPenalty = (
    attendanceId: string,
    puntosPenalizacion: number,
    motivo: string
  ) => {
    setAttendances((prev) =>
      prev.map((a) =>
        a.id === attendanceId
          ? {
              ...a,
              penalizacion_puntos_beca: (a.penalizacion_puntos_beca || 0) + puntosPenalizacion,
              notes: `${a.notes || ''} [Penalización Beca: -${puntosPenalizacion} pts (${motivo})]`,
            }
          : a
      )
    );
  };

  const getStudentScholarshipProgress = (studentId?: string): ScholarshipProgressSummary => {
    const targetStudentId = studentId || currentUser.id;
    const student = profiles.find((p) => p.id === targetStudentId) || currentUser;
    const studentAtts = attendances.filter((a) => a.student_id === targetStudentId);
    const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

    return calculateStudentScholarshipProgress(student, studentAtts, eventsMap);
  };

  const bulkAccreditFromMeet = (
    eventId: string,
    records: Array<{
      studentId: string;
      durationMinutes: number;
      attendancePercent: number;
      accredit: boolean;
      meetEmail: string;
      meetName: string;
    }>
  ) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.', accreditedCount: 0, rejectedCount: 0 };

    let accreditedCount = 0;
    let rejectedCount = 0;
    const nominalScholarshipPoints = event.puntos_beca || getStandardScholarshipPoints(event.categoria, 'asistente');

    setAttendances((prev) => {
      let updatedList = [...prev];

      records.forEach((rec) => {
        const student = profiles.find((p) => p.id === rec.studentId);
        if (!student) return;

        const existing = updatedList.find((a) => a.event_id === eventId && a.student_id === rec.studentId);

        if (rec.accredit) {
          accreditedCount++;
          if (existing) {
            updatedList = updatedList.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    status: 'asistio' as AttendanceStatus,
                    horas_acreditadas: event.horas_pfi,
                    puntos_beca_acreditados: nominalScholarshipPoints,
                    check_in_timestamp: `${event.fecha_evento}T${event.hora_inicio}:00`,
                    check_out_timestamp: `${event.fecha_evento}T${event.hora_fin}:00`,
                    validado_por: currentUser.id,
                    notes: `Acreditado vía reporte Google Meet (${rec.durationMinutes} min / ${rec.attendancePercent}% permanencia).`,
                  }
                : a
            );
          } else {
            const newAtt: EventAttendance = {
              id: `att-meet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              event_id: eventId,
              student_id: rec.studentId,
              status: 'asistio' as AttendanceStatus,
              rol_participacion: 'asistente',
              horas_acreditadas: event.horas_pfi,
              puntos_beca_acreditados: nominalScholarshipPoints,
              check_in_timestamp: `${event.fecha_evento}T${event.hora_inicio}:00`,
              check_out_timestamp: `${event.fecha_evento}T${event.hora_fin}:00`,
              validado_por: currentUser.id,
              notes: `Acreditado vía reporte Google Meet (${rec.durationMinutes} min / ${rec.attendancePercent}% permanencia).`,
              created_at: new Date().toISOString(),
            };
            updatedList.push(newAtt);
          }

          addNotification({
            user_id: rec.studentId,
            titulo: '🎉 Horas PFI y Puntos Beca Acreditados',
            mensaje: `Se han acreditado +${event.horas_pfi} hrs y +${nominalScholarshipPoints} puntos beca de "${event.titulo}" vía Google Meet.`,
            tipo: 'success',
          });
        } else {
          rejectedCount++;
          if (existing) {
            updatedList = updatedList.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    status: 'incompleto' as AttendanceStatus,
                    horas_acreditadas: 0,
                    puntos_beca_acreditados: 0,
                    notes: `Rechazado: permanencia insuficiente en Meet (${rec.durationMinutes} min / ${rec.attendancePercent}%).`,
                  }
                : a
            );
          }
        }
      });

      return updatedList;
    });

    return {
      success: true,
      message: `Procesamiento completado: ${accreditedCount} alumnos acreditados (+${event.horas_pfi}h) y ${rejectedCount} no acreditados por permanencia insuficiente.`,
      accreditedCount,
      rejectedCount,
    };
  };

  const canUserScanEvent = (eventId: string, userId?: string): boolean => {
    const targetUserId = userId || currentUser.id;
    const user = profiles.find((p) => p.id === targetUserId) || currentUser;

    // Administradores y Dirección DEDU tienen acceso total y permanente para escanear
    if (user.role === 'admin' || user.role === 'dedu') return true;

    // Docente colaborador con rol activo
    if (user.es_docente_colaborador) return true;

    // Estudiante Staff Temporal: Únicamente si el evento está activo y tiene rol asignado de staff_logistica
    const event = events.find((e) => e.id === eventId);
    if (!event || !event.activo) return false;

    const staffAtt = attendances.find(
      (a) =>
        a.event_id === eventId &&
        a.student_id === targetUserId &&
        a.rol_participacion === 'staff_logistica' &&
        (a.status === 'registrado' || a.status === 'asistio')
    );

    return !!staffAtt;
  };

  const toggleScholarshipApplicationPeriod = (active: boolean, fechaInicio?: string, fechaFin?: string) => {
    setPfiConfig((prev) => ({
      ...prev,
      periodo_solicitud_becas_activo: active,
      fecha_inicio_solicitud_becas: fechaInicio || prev.fecha_inicio_solicitud_becas,
      fecha_fin_solicitud_becas: fechaFin || prev.fecha_fin_solicitud_becas,
    }));
  };

  const toggleBecarioReport = (enabled: boolean) => {
    setPfiConfig((prev) => ({ ...prev, informe_becario_habilitado: enabled }));
  };

  const toggleSocioeconomicStudy = (enabled: boolean) => {
    setPfiConfig((prev) => ({ ...prev, estudio_socioeconomico_habilitado: enabled }));
  };

  const submitScholarshipApplication = (studentId: string, tipoBeca: string) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              solicitud_beca_status: 'enviada',
              tipo_beca_solicitada: tipoBeca,
            }
          : p
      )
    );

    addNotification({
      user_id: 'admin',
      titulo: '📩 Nueva Solicitud de Beca Recibida',
      mensaje: `${student.nombre} ${student.apellidos} (${student.matricula}) ha postulado para ${tipoBeca}.`,
      tipo: 'info',
    });

    return {
      success: true,
      message: 'Tu solicitud de beca ha sido enviada con éxito al Comité de Becas UNIPAZ.',
    };
  };

  const submitBecarioReport = (studentId: string) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              informe_becario_entregado: true,
              fecha_informe_becario: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );

    return {
      success: true,
      message: 'Informe Cuatrimestral de Becario entregado satisfactoriamente.',
    };
  };

  const submitSocioeconomicStudy = (studentId: string) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              estudio_socioeconomico_entregado: true,
              fecha_estudio_socioeconomico: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );

    return {
      success: true,
      message: 'Formato de Estudio Socioeconómico registrado para dictamen del Comité de Becas.',
    };
  };

  const submitScholarshipRenewal = (
    studentId: string,
    params: {
      solicitaAumento?: boolean;
      porcentajeDeseado?: number;
      motivoAumento?: string;
      estudioActualizado?: boolean;
    }
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const hoy = new Date().toISOString().split('T')[0];

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              solicitud_beca_status: params.solicitaAumento ? 'enviada' : 'en_evaluacion',
              solicita_aumento_porcentaje: params.solicitaAumento || false,
              porcentaje_beca_solicitado: params.porcentajeDeseado,
              motivo_aumento_beca: params.motivoAumento || '',
              fecha_solicitud_aumento: params.solicitaAumento ? hoy : undefined,
              estudio_socioeconomico_entregado: params.estudioActualizado
                ? true
                : p.estudio_socioeconomico_entregado,
              fecha_estudio_socioeconomico: params.estudioActualizado
                ? hoy
                : p.fecha_estudio_socioeconomico,
            }
          : p
      )
    );

    logStudentAuditEvent({
      student_id: studentId,
      categoria: 'renovacion_beca',
      accion: params.solicitaAumento ? 'Solicitud de Incremento de Beca' : 'Ratificación Ordinaria de Beca',
      detalles: params.solicitaAumento
        ? `Solicitud de renovación con petición de aumento al ${params.porcentajeDeseado}% (Motivo: ${params.motivoAumento || 'No especificado'})`
        : `Ratificación y renovación ordinaria de beca (${student.porcentaje_beca}% ${student.tipo_beca || 'Institucional'})`,
      valor_anterior: `${student.porcentaje_beca}%`,
      valor_nuevo: params.solicitaAumento ? `${params.porcentajeDeseado}%` : `${student.porcentaje_beca}%`,
    });

    addNotification({
      user_id: 'admin',
      titulo: params.solicitaAumento
        ? '📈 Solicitud de Aumento de Beca'
        : '🔄 Renovación de Beca Ratificada',
      mensaje: `${student.nombre} ${student.apellidos} (${student.matricula}) ha solicitado ${
        params.solicitaAumento
          ? `un incremento al ${params.porcentajeDeseado}% de beca.`
          : `la ratificación de su beca del ${student.porcentaje_beca}%.`
      }`,
      tipo: 'info',
    });

    return {
      success: true,
      message: params.solicitaAumento
        ? 'Tu solicitud de renovación con petición de aumento y estudio socioeconómico ha sido enviada al Comité de Becas.'
        : 'Tu renovación de beca cuatrimestral ha sido registrada y ratificada satisfactoriamente.',
    };
  };

  // Periodos Académicos Cuatrimestrales y Semestrales
  const addAcademicPeriod = (period: Omit<import('./types').AcademicPeriod, 'id'>) => {
    const newId = `per-${period.codigo || Date.now()}`;
    const newPeriod: import('./types').AcademicPeriod = {
      id: newId,
      ...period,
    };

    setPfiConfig((prev) => {
      const list = prev.periodosAcademicos || [];
      return {
        ...prev,
        periodosAcademicos: [...list, newPeriod],
      };
    });

    return { success: true, message: `Periodo ${period.codigo} (${period.nombre}) agregado exitosamente.` };
  };

  const updateAcademicPeriod = (id: string, data: Partial<import('./types').AcademicPeriod>) => {
    setPfiConfig((prev) => {
      const list = prev.periodosAcademicos || [];
      return {
        ...prev,
        periodosAcademicos: list.map((p) => (p.id === id ? { ...p, ...data } : p)),
      };
    });
    return { success: true, message: 'Periodo académico actualizado.' };
  };

  const deleteAcademicPeriod = (id: string) => {
    setPfiConfig((prev) => {
      const list = prev.periodosAcademicos || [];
      return {
        ...prev,
        periodosAcademicos: list.filter((p) => p.id !== id),
      };
    });
    return { success: true, message: 'Periodo académico eliminado.' };
  };

  const setCurrentAcademicPeriod = (id: string, tipo: 'cuatrimestral' | 'semestral') => {
    setPfiConfig((prev) => {
      const list = (prev.periodosAcademicos || []).map((p) => {
        if (p.tipo === tipo) {
          return { ...p, es_actual: p.id === id };
        }
        return p;
      });

      return {
        ...prev,
        periodosAcademicos: list,
        ...(tipo === 'cuatrimestral'
          ? { periodoCuatrimestralActualId: id }
          : { periodoSemestralActualId: id }),
      };
    });
  };

  const getActivePeriodForStudent = (carreraOrPrograma?: string): import('./types').AcademicPeriod | undefined => {
    const isSem = carreraOrPrograma
      ? carreraOrPrograma.toUpperCase().includes('MÉDICO CIRUJANO') || carreraOrPrograma.toUpperCase().includes('MEDICO CIRUJANO')
      : false;
    const targetType = isSem ? 'semestral' : 'cuatrimestral';
    const list = pfiConfig.periodosAcademicos || [];
    return list.find((p) => p.tipo === targetType && p.es_actual) || list.find((p) => p.tipo === targetType);
  };

  const notifyScholarshipResolution = (
    studentId: string,
    resolution: boolean | 'aprobada' | 'condicionada' | 'rechazada',
    tipoBeca?: string,
    porcentaje?: number,
    observaciones?: string,
    condiciones?: string
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const resKey = typeof resolution === 'boolean' ? (resolution ? 'aprobada' : 'rechazada') : resolution;
    const bType = tipoBeca || student.tipo_beca || 'Excelencia Académica (Promedio 9.6 - 10.0)';
    const bPct = porcentaje !== undefined ? porcentaje : student.porcentaje_beca || 50;

    if (resKey === 'aprobada') {
      const eraCondicionada = student.estatus_ratificacion_beca === 'condicionada' || student.refrendo_beca_condicionado_admin || student.habia_tenido_beca_condicionada;

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === studentId
            ? {
                ...p,
                tiene_beca: true,
                tipo_beca: bType,
                porcentaje_beca: bPct,
                solicitud_beca_status: 'aprobada',
                estatus_ratificacion_beca: 'ratificada',
                refrendo_beca_aprobado_admin: true,
                refrendo_beca_condicionado_admin: false,
                condiciones_ratificacion_beca: undefined,
                habia_tenido_beca_condicionada: false,
                visto_bueno_reincidencia_comite: false,
                fecha_resolucion_refrendo: todayStr,
                resolucion_refrendo_observaciones: observaciones || (eraCondicionada ? 'Estatus condicionado superado con éxito. Beca ratificada regular.' : 'Requisitos normativos verificados y ratificados con éxito por el Comité de Becas.'),
                cumple_cero_reprobaciones: true,
                cumple_pagos_al_corriente: true,
                cumple_sin_sanciones: true,
                esta_inscrito_proximo_ciclo: true,
              }
            : p
        )
      );

      addNotification({
        user_id: studentId,
        titulo: '🎉 ¡Resolución Favorable: Beca Ratificada Oficialmente!',
        mensaje: eraCondicionada
          ? `El Comité de Becas constató tu cumplimiento cabal de todos los requisitos reglamentarios, superando tu condición previa. Tu beca (${bType} al ${bPct}%) ha sido ratificada formalmente en estatus APROBADA.`
          : `El Comité de Becas UNIPAZ ha ratificado tu beca: ${bType} con ${bPct}% de descuento para el siguiente ciclo. Se verificó tu cumplimiento de 1,000 puntos cuatrimestrales, promedio sin reprobaciones y pagos al corriente.`,
        tipo: 'success',
      });

      return {
        success: true,
        message: `Beca ratificada en estatus APROBADA para ${student.nombre} ${student.apellidos}.`,
      };
    } else if (resKey === 'condicionada') {
      const condTexto = condiciones || observaciones || 'Beca ratificada en condición especial por dictamen del Comité de Becas (entrega extemporánea / pagos tardíos / regularización de créditos).';

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === studentId
            ? {
                ...p,
                tiene_beca: true,
                tipo_beca: bType,
                porcentaje_beca: bPct,
                solicitud_beca_status: 'condicionada',
                estatus_ratificacion_beca: 'condicionada',
                refrendo_beca_aprobado_admin: true,
                refrendo_beca_condicionado_admin: true,
                habia_tenido_beca_condicionada: true,
                condiciones_ratificacion_beca: condTexto,
                fecha_resolucion_refrendo: todayStr,
                resolucion_refrendo_observaciones: condTexto,
              }
            : p
        )
      );

      addNotification({
        user_id: studentId,
        titulo: '⚠️ Dictamen: Beca Condicionada para el Próximo Periodo',
        mensaje: `El Comité de Becas ha acordado otorgarte la beca (${bType} al ${bPct}%) de forma CONDICIONADA. Motivo / Compromiso: ${condTexto}. Deberás regularizarte en el ciclo por venir para evitar la cancelación.`,
        tipo: 'warning',
      });

      return {
        success: true,
        message: `Beca CONDICIONADA registrada para ${student.nombre} ${student.apellidos}.`,
      };
    } else {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === studentId
            ? {
                ...p,
                tiene_beca: false,
                solicitud_beca_status: 'rechazada',
                estatus_ratificacion_beca: 'suspendida',
                refrendo_beca_aprobado_admin: false,
                refrendo_beca_condicionado_admin: false,
                motivo_rechazo_beca: observaciones || 'No cumple con los requisitos normativos (Baja por reprobación ordinaria/extraordinario o falta de renovación).',
                fecha_resolucion_refrendo: todayStr,
                resolucion_refrendo_observaciones: observaciones || 'Baja de beca por incumplimiento reglamentario.',
              }
            : p
        )
      );

      addNotification({
        user_id: studentId,
        titulo: 'Notificación de Dictamen de Beca',
        mensaje: `El Comité de Becas ha emitido una resolución no aprobatoria sobre tu refrendo de beca. ${observaciones ? `Motivo: ${observaciones}` : 'Acude a la Coordinación para cualquier orientación.'}`,
        tipo: 'error',
      });

      logStudentAuditEvent({
        student_id: studentId,
        categoria: 'renovacion_beca',
        accion: `Dictamen de Ratificación / Renovación de Beca: ${resKey.toUpperCase()}`,
        detalles: `Resolución: ${resKey.toUpperCase()}. Modalidad: ${bType} (${bPct}%). Observaciones/Condiciones: ${observaciones || condiciones || 'Criterios reglamentarios evaluados por el Comité de Becas'}.`,
        valor_anterior: student.tiene_beca ? `${student.porcentaje_beca}% (${student.tipo_beca})` : 'Sin Beca',
        valor_nuevo: resKey === 'rechazada' ? 'Beca Suspendida / No Ratificada' : `${bPct}% (${bType}) [${resKey}]`,
      });

      return {
        success: true,
        message: `Resolución no favorable / Baja registrada para ${student.nombre} ${student.apellidos}.`,
      };
    }
  };

  const batchImportStudents = (studentsData: Partial<UserProfile>[]) => {
    let added = 0;
    let updated = 0;

    setProfiles((prev) => {
      const next = [...prev];
      studentsData.forEach((st) => {
        if (!st.matricula) return;
        const existingIdx = next.findIndex(
          (p) => p.matricula.toLowerCase() === st.matricula?.toLowerCase() || (st.id && p.id === st.id)
        );

        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            ...st,
            role: 'estudiante',
          };
          updated++;
        } else {
          const newStudent: UserProfile = {
            id: st.id || `usr-${st.matricula.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
            matricula: st.matricula,
            nombre: st.nombre || 'Estudiante',
            apellidos: st.apellidos || '',
            carrera: st.carrera || 'LICENCIATURA EN ADMINISTRACIÓN',
            programa_academico: st.carrera || 'LICENCIATURA EN ADMINISTRACIÓN',
            periodo_ingreso: st.periodo_ingreso || '2026-1',
            cuatrimestre: st.cuatrimestre || 1,
            email: st.email || `${st.matricula.toLowerCase()}@unipaz.edu.mx`,
            role: 'estudiante',
            sexo: st.sexo || 'Prefiero no decirlo',
            qr_secret: `SEC-UNIPAZ-${st.matricula}`,
            tiene_beca: !!st.tiene_beca,
            tipo_beca: st.tipo_beca,
            porcentaje_beca: st.porcentaje_beca,
            promedio_academico: st.promedio_academico || 9.0,
            puntos_beca_meta_cuatrimestral: st.puntos_beca_meta_cuatrimestral || 1000,
            es_becario_departamental: !!st.es_becario_departamental,
            departamento_beca: st.departamento_beca,
            horas_departamentales_semanales: st.horas_departamentales_semanales,
            cumplimiento_departamental_acreditado: false,
          };
          next.push(newStudent);
          added++;
        }
      });
      return next;
    });

    return {
      added,
      updated,
      message: `Proceso completado: ${added} estudiantes agregados, ${updated} actualizados.`,
    };
  };

  const batchImportEvents = (eventsData: Partial<PFIEvent>[]) => {
    let added = 0;
    let updated = 0;

    setEvents((prev) => {
      const next = [...prev];
      eventsData.forEach((ev) => {
        if (!ev.titulo) return;
        const existingIdx = next.findIndex(
          (e) => (ev.id && e.id === ev.id) || e.titulo.toLowerCase() === ev.titulo?.toLowerCase()
        );

        const defaultHours = ev.categoria ? getStandardHoursForCategory(ev.categoria) : 2.0;

        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            ...ev,
            horas_pfi: ev.horas_pfi !== undefined ? ev.horas_pfi : next[existingIdx].horas_pfi,
          };
          updated++;
        } else {
          const newEvent: PFIEvent = {
            id: ev.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            titulo: ev.titulo,
            categoria: ev.categoria || 'Taller Extracurricular',
            descripcion: ev.descripcion || '',
            fecha_evento: ev.fecha_evento || new Date().toISOString().split('T')[0],
            hora_inicio: ev.hora_inicio || '10:00',
            hora_fin: ev.hora_fin || '12:00',
            ubicacion: ev.ubicacion || 'Campus Central UNIPAZ',
            modalidad: ev.modalidad || 'presencial',
            cupo_maximo: ev.cupo_maximo || 50,
            horas_pfi: ev.horas_pfi !== undefined ? ev.horas_pfi : defaultHours,
            puntos_beca: ev.puntos_beca || 50,
            puntos_beca_staff: ev.puntos_beca_staff || 80,
            enlace_virtual: ev.enlace_virtual,
            activo: true,
          };
          next.push(newEvent);
          added++;
        }
      });
      return next;
    });

    return {
      added,
      updated,
      message: `Proceso completado: ${added} eventos agregados al catálogo, ${updated} actualizados.`,
    };
  };

  const batchImportAttendances = (records: import('./import-utils').ParsedAttendanceRecord[]) => {
    let imported = 0;
    let updated = 0;

    setAttendances((prev) => {
      const next = [...prev];
      records.forEach((rec) => {
        const existingIdx = next.findIndex(
          (a) => a.student_id === rec.student_id && a.event_id === rec.event_id
        );

        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            status: rec.status,
            rol_participacion: rec.rol_participacion,
            horas_acreditadas: rec.horas_acreditadas,
            puntos_beca_acreditados: rec.puntos_beca_acreditados,
            penalizacion_horas: rec.penalizacion_horas_pfi,
            penalizacion_puntos_beca: rec.penalizacion_puntos_beca,
            validado_por: rec.validado_por,
            notes: rec.observaciones,
            created_at: new Date().toISOString(),
          };
          updated++;
        } else {
          const newAtt: EventAttendance = {
            id: `att-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            event_id: rec.event_id,
            student_id: rec.student_id,
            status: rec.status,
            rol_participacion: rec.rol_participacion,
            horas_acreditadas: rec.horas_acreditadas,
            puntos_beca_acreditados: rec.puntos_beca_acreditados,
            penalizacion_horas: rec.penalizacion_horas_pfi,
            penalizacion_puntos_beca: rec.penalizacion_puntos_beca,
            validado_por: rec.validado_por,
            notes: rec.observaciones,
            created_at: new Date().toISOString(),
          };
          next.push(newAtt);
          imported++;
        }
      });
      return next;
    });

    return {
      imported,
      updated,
      message: `Proceso completado: ${imported} asistencias registradas, ${updated} actualizadas con sus horas PFI y puntos de beca.`,
    };
  };

  const addScholarshipAuditLog = (log: Omit<ScholarshipAuditLog, 'id' | 'fecha_registro'>) => {
    const newLog: ScholarshipAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fecha_registro: new Date().toISOString(),
    };
    setScholarshipAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem(STORAGE_KEYS.SCHOLARSHIP_LOGS, JSON.stringify(updated));
      return updated;
    });
  };

  const logStudentAuditEvent = (
    entry: Omit<StudentAuditEntry, 'id' | 'timestamp' | 'autor_id' | 'autor_nombre' | 'autor_rol'> & {
      student_id: string;
      autor_id?: string;
      autor_nombre?: string;
      autor_rol?: UserRole;
    }
  ) => {
    const activeAdmin = profiles.find((p) => p.id === currentUserId) || currentUser;
    const newLog: StudentAuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      student_id: entry.student_id,
      autor_id: entry.autor_id || activeAdmin.id,
      autor_nombre: entry.autor_nombre || `${activeAdmin.nombre} ${activeAdmin.apellidos}`,
      autor_rol: entry.autor_rol || activeAdmin.role || 'admin',
      categoria: entry.categoria,
      accion: entry.accion,
      detalles: entry.detalles,
      valor_anterior: entry.valor_anterior,
      valor_nuevo: entry.valor_nuevo,
      metadata: entry.metadata,
    };

    setStudentAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem(STORAGE_KEYS.STUDENT_AUDIT_LOGS, JSON.stringify(updated));
      return updated;
    });
  };

  const addStudentExpedienteComment = (studentId: string, comment: string) => {
    if (!comment.trim()) return { success: false, message: 'El comentario u observación no puede estar vacío.' };
    logStudentAuditEvent({
      student_id: studentId,
      categoria: 'comentario_expediente',
      accion: 'Observación y Nota Interna en Expediente',
      detalles: comment.trim(),
      valor_nuevo: 'Nota Registrada',
    });
    return { success: true, message: 'Nota de auditoría guardada permanentemente en el expediente.' };
  };

  const updateStudentStatus = (
    studentId: string,
    estatus: 'activo' | 'baja_temporal' | 'baja_definitiva' | 'egresado',
    motivo?: string
  ) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const isActivo = estatus === 'activo';
    const prevEstatus = student.estatus_inscripcion || (student.activo === false ? 'baja_temporal' : 'activo');

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              activo: isActivo,
              estatus_inscripcion: estatus,
              motivo_baja: isActivo ? undefined : (motivo || 'Baja cuatrimestral registrada'),
              fecha_baja: isActivo ? undefined : new Date().toISOString(),
            }
          : p
      )
    );

    logStudentAuditEvent({
      student_id: studentId,
      categoria: 'comentario_expediente',
      accion: `Actualización de Estatus de Inscripción: ${estatus.toUpperCase()}`,
      detalles: `El estatus del alumno pasó de "${prevEstatus}" a "${estatus}". Motivo/Observaciones: ${motivo || (isActivo ? 'Reactivación de expediente' : 'Baja durante el ciclo activo')}.`,
      valor_anterior: prevEstatus,
      valor_nuevo: estatus,
    });

    return {
      success: true,
      message: `Estatus de ${student.nombre} ${student.apellidos} actualizado a ${estatus.toUpperCase()}.`,
    };
  };

  const updateScholarshipDates = (dates: {
    fecha_inicio_solicitud?: string;
    fecha_fin_solicitud?: string;
    fecha_publicacion_resolucion?: string;
    fecha_inicio_ratificacion?: string;
    fecha_fin_ratificacion?: string;
    fecha_publicacion_dictamen?: string;
    activo?: boolean;
  }) => {
    setPfiConfig((prev) => {
      const updated: PFIGlobalConfig = {
        ...prev,
        periodo_solicitud_becas_activo: dates.activo !== undefined ? dates.activo : prev.periodo_solicitud_becas_activo,
        fecha_inicio_solicitud_becas: dates.fecha_inicio_solicitud !== undefined ? dates.fecha_inicio_solicitud : prev.fecha_inicio_solicitud_becas,
        fecha_fin_solicitud_becas: dates.fecha_fin_solicitud !== undefined ? dates.fecha_fin_solicitud : prev.fecha_fin_solicitud_becas,
        fecha_publicacion_resolucion_becas: dates.fecha_publicacion_resolucion !== undefined ? dates.fecha_publicacion_resolucion : prev.fecha_publicacion_resolucion_becas,
        fecha_inicio_ratificacion_becas: dates.fecha_inicio_ratificacion !== undefined ? dates.fecha_inicio_ratificacion : prev.fecha_inicio_ratificacion_becas,
        fecha_fin_ratificacion_becas: dates.fecha_fin_ratificacion !== undefined ? dates.fecha_fin_ratificacion : prev.fecha_fin_ratificacion_becas,
        fecha_publicacion_dictamen_ratificacion: dates.fecha_publicacion_dictamen !== undefined ? dates.fecha_publicacion_dictamen : prev.fecha_publicacion_dictamen_ratificacion,
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
  };

  const batchSendScholarshipNotifications = (studentIds: string[]) => {
    let sentCount = 0;
    profiles.forEach((student) => {
      if (studentIds.includes(student.id) && student.estatus_ratificacion_beca) {
        sentCount++;
        addNotification({
          user_id: student.id,
          titulo: student.estatus_ratificacion_beca === 'ratificada' 
            ? '🎉 ¡Resolución Oficial de Beca Ratificada!' 
            : student.estatus_ratificacion_beca === 'condicionada'
            ? '⚠️ Dictamen Oficial: Beca Condicionada'
            : 'Resolución Oficial de Beca emitida',
          mensaje: student.resolucion_refrendo_observaciones || 'Se ha publicado tu dictamen oficial de beca para el siguiente ciclo. Consulta tu expediente para más detalles.',
          tipo: student.estatus_ratificacion_beca === 'ratificada' ? 'success' : 'warning',
        });
      }
    });
    return { sentCount, message: `Se enviaron ${sentCount} dictámenes y notificaciones oficiales con éxito.` };
  };

  // CRUD Categorías PFI
  const addPFICategory = (category: Omit<PFICategoryConfig, 'id'>) => {
    const newCat: PFICategoryConfig = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setPfiConfig((prev) => {
      const current = prev.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES;
      const updated = {
        ...prev,
        categoriasPfiCatalog: [...current, newCat],
        categoriaHoras: {
          ...prev.categoriaHoras,
          [newCat.nombre]: 5.0,
        },
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: `Categoría "${category.nombre}" creada correctamente.` };
  };

  const updatePFICategory = (id: string, data: Partial<PFICategoryConfig>) => {
    setPfiConfig((prev) => {
      const current = prev.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES;
      const updatedList = current.map((c) => (c.id === id ? { ...c, ...data } : c));
      const updated = { ...prev, categoriasPfiCatalog: updatedList };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Categoría actualizada correctamente.' };
  };

  const deletePFICategoryWithReassign = (id: string, reassignCategoryName: string) => {
    const catToDelete = (pfiConfig.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES).find((c) => c.id === id);
    if (!catToDelete) return { success: false, message: 'Categoría no encontrada.', reassignedEvents: 0 };

    let count = 0;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.categoria === catToDelete.nombre) {
          count++;
          return { ...e, categoria: reassignCategoryName as EventCategory };
        }
        return e;
      })
    );

    setPfiConfig((prev) => {
      const current = prev.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES;
      const updated = {
        ...prev,
        categoriasPfiCatalog: current.filter((c) => c.id !== id),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });

    return { success: true, message: `Categoría eliminada. Se reasignaron ${count} actividades a "${reassignCategoryName}".`, reassignedEvents: count };
  };

  // CRUD Modalidades de Beca
  const addModalidadBeca = (modalidad: Omit<ModalidadBecaConfig, 'id'>) => {
    const newMod: ModalidadBecaConfig = {
      ...modalidad,
      id: `mod-${Date.now()}`,
    };
    setPfiConfig((prev) => {
      const current = prev.modalidadesBecaCatalog || MODALIDADES_BECA_DEFAULT;
      const updated = {
        ...prev,
        modalidadesBecaCatalog: [...current, newMod],
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: `Modalidad de beca "${modalidad.nombre}" registrada.` };
  };

  const updateModalidadBeca = (id: string, data: Partial<ModalidadBecaConfig>) => {
    setPfiConfig((prev) => {
      const current = prev.modalidadesBecaCatalog || MODALIDADES_BECA_DEFAULT;
      const updated = {
        ...prev,
        modalidadesBecaCatalog: current.map((m) => (m.id === id ? { ...m, ...data } : m)),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Modalidad de beca actualizada.' };
  };

  const deleteModalidadBeca = (id: string) => {
    setPfiConfig((prev) => {
      const current = prev.modalidadesBecaCatalog || MODALIDADES_BECA_DEFAULT;
      const updated = {
        ...prev,
        modalidadesBecaCatalog: current.filter((m) => m.id !== id),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Modalidad de beca eliminada.' };
  };

  // CRUD Departamentos Servicio Becario
  const addServicioBecarioDept = (dept: Omit<ServicioBecarioDept, 'id'>) => {
    const newDept: ServicioBecarioDept = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setPfiConfig((prev) => {
      const current = prev.departamentosServicioBecario || [];
      const updated = {
        ...prev,
        departamentosServicioBecario: [...current, newDept],
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: `Departamento "${dept.nombre}" agregado.` };
  };

  const updateServicioBecarioDept = (id: string, data: Partial<ServicioBecarioDept>) => {
    setPfiConfig((prev) => {
      const current = prev.departamentosServicioBecario || [];
      const updated = {
        ...prev,
        departamentosServicioBecario: current.map((d) => (d.id === id ? { ...d, ...data } : d)),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Departamento actualizado.' };
  };

  const deleteServicioBecarioDept = (id: string) => {
    setPfiConfig((prev) => {
      const current = prev.departamentosServicioBecario || [];
      const updated = {
        ...prev,
        departamentosServicioBecario: current.filter((d) => d.id !== id),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'Departamento eliminado.' };
  };

  // Postulaciones de Roles en Eventos (Staff / Ponente)
  const submitRoleApplication = (eventId: string, studentId: string, role: 'staff_logistica' | 'ponente', motivo?: string) => {
    const student = profiles.find((p) => p.id === studentId);
    if (!student) return { success: false, message: 'Estudiante no encontrado.' };

    const newApp: RoleApplication = {
      id: `role-app-${Date.now()}`,
      event_id: eventId,
      student_id: studentId,
      student_nombre: `${student.nombre} ${student.apellidos}`,
      student_matricula: student.matricula,
      student_carrera: student.carrera,
      tiene_beca: student.tiene_beca,
      rol_solicitado: role,
      motivo: motivo || 'Interés de participación y acreditación formativa',
      status: 'pendiente',
      fecha_solicitud: new Date().toISOString(),
    };

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const currentApps = e.solicitudes_roles || [];
          return {
            ...e,
            solicitudes_roles: [...currentApps, newApp],
          };
        }
        return e;
      })
    );

    return { success: true, message: `Tu solicitud para participar como ${role === 'staff_logistica' ? 'Staff Logístico' : 'Ponente'} ha sido enviada al Comité para revisión.` };
  };

  const reviewRoleApplication = (eventId: string, applicationId: string, decision: 'aprobada' | 'rechazada') => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return { success: false, message: 'Evento no encontrado.' };

    let targetStudentId = '';
    let targetRole: 'staff_logistica' | 'ponente' = 'staff_logistica';

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedApps = (e.solicitudes_roles || []).map((app) => {
            if (app.id === applicationId) {
              targetStudentId = app.student_id;
              targetRole = app.rol_solicitado;
              return {
                ...app,
                status: decision,
                fecha_resolucion: new Date().toISOString(),
                revisado_por: currentUser.nombre,
              };
            }
            return app;
          });
          return { ...e, solicitudes_roles: updatedApps };
        }
        return e;
      })
    );

    if (decision === 'aprobada' && targetStudentId) {
      assignEventToStudentWithRole(eventId, targetStudentId, targetRole);
      addNotification({
        user_id: targetStudentId,
        titulo: `¡Postulación Aprobada: ${targetRole === 'staff_logistica' ? 'Staff Logístico' : 'Ponente'}!`,
        mensaje: `Has sido asignado oficialmente como ${targetRole === 'staff_logistica' ? 'Staff Logístico' : 'Ponente'} para el evento "${ev.titulo}".`,
        tipo: 'success',
      });
    } else if (decision === 'rechazada' && targetStudentId) {
      addNotification({
        user_id: targetStudentId,
        titulo: 'Postulación no aceptada para rol especial',
        mensaje: `Tu postulación para participar como ${targetRole === 'staff_logistica' ? 'Staff' : 'Ponente'} en "${ev.titulo}" no fue aprobada por cupo límite. Puedes asistir como oyente regular.`,
        tipo: 'info',
      });
    }

    return { success: true, message: `Postulación ${decision === 'aprobada' ? 'APROBADA' : 'RECHAZADA'} con éxito.` };
  };

  const resetToDefaultData = () => {
    setProfiles(MOCK_PROFILES);
    setEvents(MOCK_EVENTS);
    setAttendances(MOCK_ATTENDANCES);
    setPfiConfig(DEFAULT_PFI_CONFIG);
    setScholarshipAuditLogs(INITIAL_SCHOLARSHIP_AUDIT_LOGS);
    setStudentAuditLogs(MOCK_AUDIT_LOGS);
    setCurrentUserId('usr-student-01');
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCES);
    localStorage.removeItem(STORAGE_KEYS.JUSTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACKS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.SCHOLARSHIP_LOGS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_AUDIT_LOGS);

    if (typeof window !== 'undefined') {
      window.location.href = '/estudiante';
    }
  };

  return (
    <PFIContext.Provider
      value={{
        currentUser,
        profiles,
        events,
        attendances,
        justifications,
        notifications,
        feedbacks,
        pfiConfig,
        scholarshipAuditLogs,
        addScholarshipAuditLog,
        studentAuditLogs,
        logStudentAuditEvent,
        addStudentExpedienteComment,
        updateStudentStatus,
        updateScholarshipDates,
        batchSendScholarshipNotifications,
        addPFICategory,
        updatePFICategory,
        deletePFICategoryWithReassign,
        addModalidadBeca,
        updateModalidadBeca,
        deleteModalidadBeca,
        addServicioBecarioDept,
        updateServicioBecarioDept,
        deleteServicioBecarioDept,
        submitRoleApplication,
        reviewRoleApplication,
        switchUser,
        setUserRole,
        toggleDocenteStaffRole,
        registerToEvent,
        cancelRegistration,
        createEvent,
        updateEvent,
        deleteEvent,
        applyForStaffRole,
        manageStaffApplication,
        applyStaffPenalty,
        assignEventToStudentWithRole,
        submitJustification,
        reviewJustification,
        submitEventFeedback,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        updateGlobalConfig,
        getStandardHoursForCategory,
        assignEventToStudent,
        batchAssignPVCByCohort,
        checkInStudent,
        checkOutStudent,
        validateOnlineOTP,
        validateAttendanceManually,
        bulkAccreditFromMeet,
        assignScholarshipToStudent,
        assignDepartmentalScholarship,
        accreditDepartmentalService,
        revokeScholarship,
        applyScholarshipPenalty,
        toggleScholarshipApplicationPeriod,
        toggleBecarioReport,
        toggleSocioeconomicStudy,
        submitScholarshipApplication,
        submitScholarshipRenewal,
        submitBecarioReport,
        submitSocioeconomicStudy,
        notifyScholarshipResolution,
        addAcademicPeriod,
        updateAcademicPeriod,
        deleteAcademicPeriod,
        setCurrentAcademicPeriod,
        getActivePeriodForStudent,
        getStudentProgress,
        getStudentScholarshipProgress,
        getStudentAttendances,
        getEventById,
        getStudentById,
        getStudentByQuery,
        canUserScanEvent,
        batchImportStudents,
        batchImportEvents,
        batchImportAttendances,
        theme,
        toggleTheme,
        setTheme,
        resetToDefaultData,
      }}
    >
      {children}
    </PFIContext.Provider>
  );
};

export const usePFI = () => {
  const context = useContext(PFIContext);
  if (!context) {
    throw new Error('usePFI debe utilizarse dentro de un PFIProvider');
  }
  return context;
};
