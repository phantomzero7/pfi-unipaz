'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_ATTENDANCES, MOCK_EVENTS, MOCK_PROFILES } from './mock-data';
import { calculateStudentPFIProgress, PFI_RULES, validateStayDuration } from './pfi-rules';
import {
  AttendanceStatus,
  EventAttendance,
  EventCategory,
  PFIEvent,
  PFIGlobalConfig,
  PFIProgressSummary,
  UserProfile,
  UserRole,
} from './types';

export const DEFAULT_PFI_CONFIG: PFIGlobalConfig = {
  horasMinimasTitulacion: 400.0,
  horasSobresaliente: 730.0,
  maxTalleresExtracurriculares: 3,
  maxTalleresLiderazgo: 1,
  categoriaHoras: {
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
  },
  reglasCohortePVC: {
    pvc1Cuatrimestres: [1, 2, 3],
    pvc2Cuatrimestres: [4, 5, 6],
    pvc3Cuatrimestres: [7, 8, 9],
  },
};

interface PFIContextType {
  currentUser: UserProfile;
  profiles: UserProfile[];
  events: PFIEvent[];
  attendances: EventAttendance[];
  pfiConfig: PFIGlobalConfig;
  switchUser: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  
  // Event Actions
  registerToEvent: (eventId: string, studentId?: string) => { success: boolean; message: string };
  cancelRegistration: (eventId: string, studentId?: string) => { success: boolean; message: string };
  createEvent: (eventData: Omit<PFIEvent, 'id'>) => { success: boolean; event: PFIEvent };
  updateEvent: (eventId: string, data: Partial<PFIEvent>) => void;
  deleteEvent: (eventId: string) => void;
  
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

  // Attendance & QR Scanner Actions
  checkInStudent: (eventId: string, studentQuery: string, customTime?: string) => {
    success: boolean;
    message: string;
    student?: UserProfile;
    attendance?: EventAttendance;
  };
  checkOutStudent: (eventId: string, studentQuery: string, customTime?: string) => {
    success: boolean;
    message: string;
    student?: UserProfile;
    stayMinutes?: number;
    stayPercentage?: number;
    hoursCredited?: number;
    status?: AttendanceStatus;
  };
  validateOnlineOTP: (eventId: string, otpCode: string, studentId?: string) => {
    success: boolean;
    message: string;
    hoursCredited?: number;
  };
  validateAttendanceManually: (attendanceId: string, status: AttendanceStatus, customHours?: number) => void;
  
  // Student Progress
  getStudentProgress: (studentId?: string) => PFIProgressSummary;
  getStudentAttendances: (studentId?: string) => EventAttendance[];
  getEventById: (eventId: string) => PFIEvent | undefined;
  getStudentById: (studentId: string) => UserProfile | undefined;
  getStudentByQuery: (query: string) => UserProfile | undefined;
  
  // Theme Toggle
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Stats
  resetToDefaultData: () => void;
}

const PFIContext = createContext<PFIContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILES: 'unipaz_pfi_profiles_v1',
  EVENTS: 'unipaz_pfi_events_v1',
  ATTENDANCES: 'unipaz_pfi_attendances_v1',
  CURRENT_USER_ID: 'unipaz_pfi_active_user_id_v1',
  CONFIG: 'unipaz_pfi_config_v1',
};

export const PFIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [events, setEvents] = useState<PFIEvent[]>(MOCK_EVENTS);
  const [attendances, setAttendances] = useState<EventAttendance[]>(MOCK_ATTENDANCES);
  const [pfiConfig, setPfiConfig] = useState<PFIGlobalConfig>(DEFAULT_PFI_CONFIG);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-student-01');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar de LocalStorage al iniciar
  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const savedAttendances = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const savedTheme = localStorage.getItem('unipaz_pfi_theme') as 'light' | 'dark' | null;

      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedAttendances) setAttendances(JSON.parse(savedAttendances));
      if (savedUserId) setCurrentUserId(savedUserId);
      if (savedConfig) setPfiConfig(JSON.parse(savedConfig));

      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.remove('dark');
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
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(pfiConfig));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }, [profiles, events, attendances, currentUserId, pfiConfig, isLoaded]);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0] || MOCK_PROFILES[0];

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId);
    if (found) {
      setCurrentUserId(userId);
    }
  };

  const setUserRole = (role: UserRole) => {
    const target = profiles.find((p) => p.role === role);
    if (target) {
      setCurrentUserId(target.id);
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

  // ASIGNACIÓN DIRECTA DE ACTIVIDADES A ESTUDIANTE
  const assignEventToStudent = (eventId: string, studentId: string, isSpecialCase = false) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const targetStudent = profiles.find((p) => p.id === studentId);

    if (!targetEvent || !targetStudent) {
      return { success: false, message: 'Evento o Estudiante no encontrado.' };
    }

    // Verificar si ya tiene asistencia o si ya cursó este PVC
    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === studentId);
    if (existing) {
      if (existing.status === 'asistio' && !isSpecialCase) {
        return {
          success: false,
          message: `El estudiante ${targetStudent.nombre} ya tiene acreditada esta actividad (${existing.horas_acreditadas}h). No requiere asignarse de nuevo.`,
          alreadyPassed: true,
        };
      }
      if (existing.status === 'registrado') {
        return {
          success: false,
          message: `El estudiante ya se encuentra registrado activamente en este evento.`,
        };
      }
    }

    // Si es un PVC, revisar si ya acreditó otro evento del mismo nivel PVC
    if (targetEvent.categoria === 'PVC' && !isSpecialCase) {
      const studentProgress = getStudentProgress(studentId);
      const titleUpper = targetEvent.titulo.toUpperCase();
      if ((titleUpper.includes('PVC I') || titleUpper.includes('INICIANDO MIS SUEÑOS')) && studentProgress.pvc.pvc1) {
        return {
          success: false,
          message: `El estudiante ${targetStudent.nombre} ya acreditó PVC I con anterioridad. No se vuelve a asignar salvo caso especial.`,
          alreadyPassed: true,
        };
      }
      if ((titleUpper.includes('PVC II') || titleUpper.includes('AHÍ LA LLEVO')) && studentProgress.pvc.pvc2) {
        return {
          success: false,
          message: `El estudiante ${targetStudent.nombre} ya acreditó PVC II con anterioridad. No se vuelve a asignar salvo caso especial.`,
          alreadyPassed: true,
        };
      }
      if ((titleUpper.includes('PVC III') || titleUpper.includes('YA CASI')) && studentProgress.pvc.pvc3) {
        return {
          success: false,
          message: `El estudiante ${targetStudent.nombre} ya acreditó PVC III con anterioridad. No se vuelve a asignar salvo caso especial.`,
          alreadyPassed: true,
        };
      }
    }

    const newAttendance: EventAttendance = {
      id: `att-dir-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_id: eventId,
      student_id: studentId,
      status: 'registrado',
      horas_acreditadas: 0,
      es_asignacion_directa: true,
      es_caso_especial: isSpecialCase,
      notes: isSpecialCase ? 'Asignación directa (Caso Especial / Recursamiento)' : 'Asignación directa por cohorte institucional',
      created_at: new Date().toISOString(),
    };

    setAttendances((prev) => [...prev, newAttendance]);
    return {
      success: true,
      message: `Actividad "${targetEvent.titulo}" asignada directamente a ${targetStudent.nombre} ${targetStudent.apellidos}.`,
    };
  };

  // ASIGNACIÓN MASIVA DE PVC POR COHORTE / CUATRIMESTRE
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

      // Revisar si ya está registrado
      const alreadyRegistered = attendances.some(
        (a) => a.event_id === targetEvent.id && a.student_id === student.id
      );

      if (!alreadyRegistered) {
        newAttendances.push({
          id: `att-batch-${Date.now()}-${student.id.substr(0, 4)}-${Math.random().toString(36).substr(2, 3)}`,
          event_id: targetEvent.id,
          student_id: student.id,
          status: 'registrado',
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

  const registerToEvent = (eventId: string, studentId?: string) => {
    const sId = studentId || currentUser.id;
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);
    if (existing && existing.status !== 'cancelado') {
      return { success: false, message: 'Ya te encuentras inscrito en este evento.' };
    }

    const currentOccupied = attendances.filter(
      (a) => a.event_id === eventId && a.status !== 'cancelado'
    ).length;

    if (event.cupo_maximo > 0 && currentOccupied >= event.cupo_maximo) {
      return { success: false, message: 'El cupo para este evento está agotado.' };
    }

    if (existing && existing.status === 'cancelado') {
      setAttendances((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? { ...a, status: 'registrado', created_at: new Date().toISOString() }
            : a
        )
      );
    } else {
      const newAttendance: EventAttendance = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        event_id: eventId,
        student_id: sId,
        status: 'registrado',
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

  const cancelRegistration = (eventId: string, studentId?: string) => {
    const sId = studentId || currentUser.id;
    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);

    if (!existing) {
      return { success: false, message: 'No estás registrado en este evento.' };
    }

    if (existing.status === 'asistio') {
      return { success: false, message: 'No puedes cancelar una actividad ya acreditada.' };
    }

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
  };

  const createEvent = (eventData: Omit<PFIEvent, 'id'>) => {
    const standardHours = getStandardHoursForCategory(eventData.categoria);
    const newEvent: PFIEvent = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}`,
      horas_pfi: eventData.horas_pfi || standardHours,
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

  const checkInStudent = (eventId: string, studentQuery: string, customTime?: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return {
        success: false,
        message: `Estudiante no encontrado con la clave o QR: "${studentQuery}".`,
      };
    }

    const checkInTime = customTime || new Date().toISOString();
    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    if (existing) {
      if (existing.status === 'asistio') {
        return {
          success: false,
          message: `El estudiante ${student.nombre} ${student.apellidos} ya tiene acreditada esta actividad.`,
          student,
          attendance: existing,
        };
      }

      const updated: EventAttendance = {
        ...existing,
        status: 'registrado',
        check_in_timestamp: checkInTime,
        validado_por: currentUser.id,
      };

      setAttendances((prev) => prev.map((a) => (a.id === existing.id ? updated : a)));
      return {
        success: true,
        message: `Check-In registrado para ${student.nombre} ${student.apellidos} (${student.matricula}).`,
        student,
        attendance: updated,
      };
    }

    const newAttendance: EventAttendance = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_id: eventId,
      student_id: student.id,
      status: 'registrado',
      check_in_timestamp: checkInTime,
      horas_acreditadas: 0,
      validado_por: currentUser.id,
      created_at: new Date().toISOString(),
    };

    setAttendances((prev) => [...prev, newAttendance]);
    return {
      success: true,
      message: `Check-In directo registrado para ${student.nombre} ${student.apellidos} (${student.matricula}).`,
      student,
      attendance: newAttendance,
    };
  };

  const checkOutStudent = (eventId: string, studentQuery: string, customTime?: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return { success: false, message: `Estudiante no encontrado ("${studentQuery}").` };
    }

    const att = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    if (!att || !att.check_in_timestamp) {
      return {
        success: false,
        message: `El estudiante ${student.nombre} ${student.apellidos} no cuenta con registro de Check-In para este evento.`,
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
    const result = validateStayDuration(
      att.check_in_timestamp,
      checkOutTime,
      event.hora_inicio,
      event.hora_fin,
      event.horas_pfi
    );

    const updated: EventAttendance = {
      ...att,
      check_out_timestamp: checkOutTime,
      status: result.status,
      horas_acreditadas: result.horasAcreditadas,
      validado_por: currentUser.id,
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
      return { success: false, message: 'Código OTP incorrecto o caducado.' };
    }

    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === sId);
    const now = new Date().toISOString();

    if (existing) {
      setAttendances((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                status: 'asistio',
                check_in_timestamp: existing.check_in_timestamp || now,
                check_out_timestamp: now,
                horas_acreditadas: event.horas_pfi,
                notes: 'Validado mediante código OTP en sesión virtual',
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
        check_in_timestamp: now,
        check_out_timestamp: now,
        horas_acreditadas: event.horas_pfi,
        notes: 'Validado mediante código OTP en sesión virtual',
        created_at: now,
      };
      setAttendances((prev) => [...prev, newAttendance]);
    }

    return {
      success: true,
      message: `¡Código OTP verificado! Se acreditaron +${event.horas_pfi.toFixed(2)} hrs PFI.`,
      hoursCredited: event.horas_pfi,
    };
  };

  const validateAttendanceManually = (
    attendanceId: string,
    status: AttendanceStatus,
    customHours?: number
  ) => {
    setAttendances((prev) =>
      prev.map((a) => {
        if (a.id !== attendanceId) return a;
        const ev = events.find((e) => e.id === a.event_id);
        const hours = customHours !== undefined ? customHours : status === 'asistio' ? (ev?.horas_pfi || 0) : 0;
        return {
          ...a,
          status,
          horas_acreditadas: hours,
          validado_por: currentUser.id,
          notes: 'Validado manualmente por Administrador / Staff',
        };
      })
    );
  };

  const resetToDefaultData = () => {
    setProfiles(MOCK_PROFILES);
    setEvents(MOCK_EVENTS);
    setAttendances(MOCK_ATTENDANCES);
    setPfiConfig(DEFAULT_PFI_CONFIG);
    setCurrentUserId('usr-student-01');
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  };

  return (
    <PFIContext.Provider
      value={{
        currentUser,
        profiles,
        events,
        attendances,
        pfiConfig,
        switchUser,
        setUserRole,
        registerToEvent,
        cancelRegistration,
        createEvent,
        updateEvent,
        deleteEvent,
        updateGlobalConfig,
        getStandardHoursForCategory,
        assignEventToStudent,
        batchAssignPVCByCohort,
        checkInStudent,
        checkOutStudent,
        validateOnlineOTP,
        validateAttendanceManually,
        getStudentProgress,
        getStudentAttendances,
        getEventById,
        getStudentById,
        getStudentByQuery,
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
