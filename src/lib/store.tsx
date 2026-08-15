'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_ATTENDANCES, MOCK_EVENTS, MOCK_PROFILES } from './mock-data';
import { calculateStudentPFIProgress, validateStayDuration } from './pfi-rules';
import { AttendanceStatus, EventAttendance, PFIEvent, PFIProgressSummary, UserProfile, UserRole } from './types';

interface PFIContextType {
  currentUser: UserProfile;
  profiles: UserProfile[];
  events: PFIEvent[];
  attendances: EventAttendance[];
  switchUser: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  
  // Event Actions
  registerToEvent: (eventId: string, studentId?: string) => { success: boolean; message: string };
  cancelRegistration: (eventId: string, studentId?: string) => { success: boolean; message: string };
  createEvent: (eventData: Omit<PFIEvent, 'id'>) => { success: boolean; event: PFIEvent };
  updateEvent: (eventId: string, data: Partial<PFIEvent>) => void;
  deleteEvent: (eventId: string) => void;
  
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
};

export const PFIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [events, setEvents] = useState<PFIEvent[]>(MOCK_EVENTS);
  const [attendances, setAttendances] = useState<EventAttendance[]>(MOCK_ATTENDANCES);
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
      const savedTheme = localStorage.getItem('unipaz_pfi_theme') as 'light' | 'dark' | null;

      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedAttendances) setAttendances(JSON.parse(savedAttendances));
      if (savedUserId) setCurrentUserId(savedUserId);
      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Default a light institucional
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
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }, [profiles, events, attendances, currentUserId, isLoaded]);

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
    return attendances
      .filter((a) => a.student_id === targetId)
      .map((att) => ({
        ...att,
        event: events.find((e) => e.id === att.event_id),
      }));
  };

  const getStudentProgress = (studentId?: string) => {
    const targetId = studentId || currentUser.id;
    const studentAtts = attendances.filter((a) => a.student_id === targetId);
    const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));
    return calculateStudentPFIProgress(studentAtts, eventsMap);
  };

  // Registrar cupo a evento
  const registerToEvent = (eventId: string, studentId?: string) => {
    const targetStudentId = studentId || currentUser.id;
    const event = getEventById(eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === targetStudentId
    );

    if (existing) {
      if (existing.status === 'cancelado') {
        setAttendances((prev) =>
          prev.map((a) => (a.id === existing.id ? { ...a, status: 'registrado' } : a))
        );
        return { success: true, message: '¡Inscripción reactivada con éxito!' };
      }
      return { success: false, message: 'Ya te encuentras registrado a esta actividad.' };
    }

    // Validar cupo
    if (event.cupo_maximo > 0 && (event.cupo_ocupado || 0) >= event.cupo_maximo) {
      return { success: false, message: 'El cupo para este evento está agotado.' };
    }

    const newAttendance: EventAttendance = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      event_id: eventId,
      student_id: targetStudentId,
      status: 'registrado',
      horas_acreditadas: 0,
      created_at: new Date().toISOString(),
    };

    setAttendances((prev) => [newAttendance, ...prev]);

    // Incrementar cupo
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, cupo_ocupado: (e.cupo_ocupado || 0) + 1 } : e
      )
    );

    return { success: true, message: `¡Registro confirmado para ${event.titulo}!` };
  };

  // Cancelar registro
  const cancelRegistration = (eventId: string, studentId?: string) => {
    const targetStudentId = studentId || currentUser.id;
    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === targetStudentId
    );

    if (!existing) return { success: false, message: 'No tienes un registro activo.' };

    if (existing.status === 'asistio') {
      return { success: false, message: 'No puedes cancelar un evento ya acreditado.' };
    }

    setAttendances((prev) =>
      prev.map((a) => (a.id === existing.id ? { ...a, status: 'cancelado' } : a))
    );

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId && (e.cupo_ocupado || 0) > 0
          ? { ...e, cupo_ocupado: (e.cupo_ocupado || 1) - 1 }
          : e
      )
    );

    return { success: true, message: 'Registro cancelado correctamente.' };
  };

  // Crear evento
  const createEvent = (eventData: Omit<PFIEvent, 'id'>) => {
    const newEvent: PFIEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
      cupo_ocupado: 0,
    };

    setEvents((prev) => [newEvent, ...prev]);
    return { success: true, event: newEvent };
  };

  // Actualizar evento
  const updateEvent = (eventId: string, data: Partial<PFIEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...data } : e)));
  };

  // Eliminar evento
  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Escáner QR: Check-In
  const checkInStudent = (eventId: string, studentQuery: string, customTime?: string) => {
    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return { success: false, message: 'Estudiante no encontrado con esa matrícula, QR o correo.' };
    }

    const event = getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Evento no encontrado.' };
    }

    const checkInIso = customTime || new Date().toISOString();
    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    let updatedAtt: EventAttendance;

    if (existing) {
      if (existing.check_in_timestamp && existing.status !== 'cancelado') {
        return {
          success: true,
          message: `El estudiante ${student.nombre} ${student.apellidos} ya tenía Check-In registrado a las ${new Date(existing.check_in_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          student,
          attendance: existing,
        };
      }

      updatedAtt = {
        ...existing,
        status: 'registrado',
        check_in_timestamp: checkInIso,
        validado_por: currentUser.id,
      };

      setAttendances((prev) => prev.map((a) => (a.id === existing.id ? updatedAtt : a)));
    } else {
      updatedAtt = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        event_id: eventId,
        student_id: student.id,
        status: 'registrado',
        check_in_timestamp: checkInIso,
        horas_acreditadas: 0,
        validado_por: currentUser.id,
        created_at: new Date().toISOString(),
      };

      setAttendances((prev) => [updatedAtt, ...prev]);
    }

    return {
      success: true,
      message: `¡Check-In registrado exitosamente para ${student.nombre} ${student.apellidos} (${student.matricula})!`,
      student,
      attendance: updatedAtt,
    };
  };

  // Escáner QR: Check-Out y Cálculo Automático de 80% de Permanencia
  const checkOutStudent = (eventId: string, studentQuery: string, customTime?: string) => {
    const student = getStudentByQuery(studentQuery);
    if (!student) {
      return { success: false, message: 'Estudiante no encontrado.' };
    }

    const event = getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Evento no encontrado.' };
    }

    const existing = attendances.find(
      (a) => a.event_id === eventId && a.student_id === student.id
    );

    if (!existing || !existing.check_in_timestamp) {
      return {
        success: false,
        message: `El estudiante ${student.nombre} ${student.apellidos} no cuenta con Check-In previo en este evento.`,
        student,
      };
    }

    const checkOutIso = customTime || new Date().toISOString();

    // Validar permanencia con la regla del 80%
    const validation = validateStayDuration(
      existing.check_in_timestamp,
      checkOutIso,
      event.hora_inicio,
      event.hora_fin,
      event.horas_pfi
    );

    const updatedAtt: EventAttendance = {
      ...existing,
      check_out_timestamp: checkOutIso,
      status: validation.status,
      horas_acreditadas: validation.horasAcreditadas,
      validado_por: currentUser.id,
      notes: validation.mensaje,
    };

    setAttendances((prev) => prev.map((a) => (a.id === existing.id ? updatedAtt : a)));

    return {
      success: true,
      message: validation.mensaje,
      student,
      stayMinutes: validation.permanenciaMinutos,
      stayPercentage: validation.porcentajePermanencia,
      hoursCredited: validation.horasAcreditadas,
      status: validation.status,
    };
  };

  // Validación de OTP dinámico para eventos Online
  const validateOnlineOTP = (eventId: string, otpCode: string, studentId?: string) => {
    const targetStudentId = studentId || currentUser.id;
    const event = getEventById(eventId);
    if (!event) return { success: false, message: 'Evento no encontrado.' };

    if (!event.otp_online_code) {
      return { success: false, message: 'Este evento no requiere código OTP o ya expiró.' };
    }

    if (event.otp_online_code.trim().toUpperCase() !== otpCode.trim().toUpperCase()) {
      return { success: false, message: 'Código OTP incorrecto. Verifica el token proporcionado por el instructor.' };
    }

    const now = new Date().toISOString();
    const existing = attendances.find((a) => a.event_id === eventId && a.student_id === targetStudentId);

    if (existing && existing.status === 'asistio') {
      return { success: false, message: 'Ya has acreditado este evento previamente.' };
    }

    const newAttendance: EventAttendance = {
      id: existing ? existing.id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      event_id: eventId,
      student_id: targetStudentId,
      status: 'asistio',
      check_in_timestamp: now,
      check_out_timestamp: now,
      horas_acreditadas: event.horas_pfi,
      validado_por: 'ONLINE_OTP_AUTO_VALIDATION',
      notes: `Acreditado vía Token OTP Virtual (${otpCode.toUpperCase()})`,
    };

    if (existing) {
      setAttendances((prev) => prev.map((a) => (a.id === existing.id ? newAttendance : a)));
    } else {
      setAttendances((prev) => [newAttendance, ...prev]);
    }

    return {
      success: true,
      message: `¡Código OTP validado con éxito! Se han acreditado ${event.horas_pfi} hrs PFI a tu expediente.`,
      hoursCredited: event.horas_pfi,
    };
  };

  // Validación manual por Administrador / Staff
  const validateAttendanceManually = (attendanceId: string, status: AttendanceStatus, customHours?: number) => {
    setAttendances((prev) =>
      prev.map((a) => {
        if (a.id !== attendanceId) return a;
        const ev = events.find((e) => e.id === a.event_id);
        const credited = customHours !== undefined ? customHours : (status === 'asistio' ? (ev?.horas_pfi || 0) : 0);
        return {
          ...a,
          status,
          horas_acreditadas: credited,
          validado_por: currentUser.id,
        };
      })
    );
  };

  // Restaurar datos de prueba originales
  const resetToDefaultData = () => {
    setProfiles(MOCK_PROFILES);
    setEvents(MOCK_EVENTS);
    setAttendances(MOCK_ATTENDANCES);
    setCurrentUserId('usr-student-01');
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  };

  return (
    <PFIContext.Provider
      value={{
        currentUser,
        profiles,
        events,
        attendances,
        switchUser,
        setUserRole,
        registerToEvent,
        cancelRegistration,
        createEvent,
        updateEvent,
        deleteEvent,
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
    throw new Error('usePFI must be used within a PFIProvider');
  }
  return context;
};
