'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Copy,
  Download,
  Edit2,
  Filter,
  Globe,
  GraduationCap,
  KeyRound,
  Layers,
  MapPin,
  Mic,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { GoogleMeetAttendanceModal } from '@/components/GoogleMeetAttendanceModal';
import { KioskProjectorModal } from '@/components/KioskProjectorModal';
import { SpeakerCertificatePdfModal } from '@/components/SpeakerCertificatePdfModal';
import { exportEventAttendanceToCsv } from '@/lib/export-utils';
import { getRoleBadgeInfo, getStandardScholarshipPoints } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { EventCategory, EventModality, ParticipantRole, PFIEvent, UserProfile } from '@/lib/types';

export default function AdminEventosManagerPage() {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    currentUser,
    profiles,
    assignEventToStudentWithRole,
    manageStaffApplication,
    applyStaffPenalty,
    attendances,
    getStandardHoursForCategory,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PFIEvent | null>(null);
  const [selectedEventForStaffReview, setSelectedEventForStaffReview] = useState<PFIEvent | null>(null);
  const [selectedKioskEvent, setSelectedKioskEvent] = useState<PFIEvent | null>(null);
  const [selectedSpeakerEvent, setSelectedSpeakerEvent] = useState<PFIEvent | null>(null);
  const [selectedCloneEvent, setSelectedCloneEvent] = useState<PFIEvent | null>(null);
  const [selectedMeetEvent, setSelectedMeetEvent] = useState<PFIEvent | null>(null);
  const [cloneMode, setCloneMode] = useState<'simple' | 'recurring'>('simple');
  const [cloneNewDate, setCloneNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recurringFrequency, setRecurringFrequency] = useState<'semanal' | 'quincenal' | 'mensual'>('semanal');
  const [recurringSessionsCount, setRecurringSessionsCount] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de Asignación Obligatoria en el Modal
  const [isObligatoryAssign, setIsObligatoryAssign] = useState(false);
  const [assignedRoleToStudents, setAssignedRoleToStudents] = useState<ParticipantRole>('asistente');
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState<string>('todas');
  const [selectedCuatrimestreFilter, setSelectedCuatrimestreFilter] = useState<string>('todos');
  const [studentSearchFilter, setStudentSearchFilter] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    categoria: EventCategory;
    subcategoria: string;
    modalidad: EventModality;
    fecha_evento: string;
    hora_inicio: string;
    hora_fin: string;
    horas_pfi: number;
    puntos_beca: number;
    puntos_beca_staff: number;
    permite_staff: boolean;
    cupo_staff: number;
    horas_staff: number;
    horas_ponente: number;
    cupo_maximo: number;
    enlace_virtual: string;
    otp_online_code: string;
    ubicacion: string;
    instructor_titular: string;
    instructor_cargo: string;
  }>({
    titulo: '',
    descripcion: '',
    categoria: 'Taller Extracurricular',
    subcategoria: 'Cultura y Deportes',
    modalidad: 'presencial',
    fecha_evento: new Date().toISOString().split('T')[0],
    hora_inicio: '10:00',
    hora_fin: '14:00',
    horas_pfi: 16.67,
    puntos_beca: 200,
    puntos_beca_staff: 100,
    permite_staff: true,
    cupo_staff: 5,
    horas_staff: 10.00,
    horas_ponente: 15.00,
    cupo_maximo: 40,
    enlace_virtual: '',
    otp_online_code: '',
    ubicacion: 'Campus UNIPAZ',
    instructor_titular: '',
    instructor_cargo: '',
  });

  const categories: EventCategory[] = [
    'Taller Extracurricular',
    'Taller Liderazgo',
    'PVC',
    'Investigación',
    'Club Anual',
    'Simposio',
    'Jornada Social',
    'Cine Club',
    'Foro',
    'Campaña',
  ];

  const students = profiles.filter((p) => p.role === 'estudiante');

  // Obtener lista única de licenciaturas disponibles
  const availableDegrees = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.carrera) set.add(s.carrera);
    });
    return Array.from(set);
  }, [students]);

  // Estudiantes filtrados para la selección con checkboxes
  const filteredStudentsForAssign = useMemo(() => {
    return students.filter((std) => {
      if (selectedDegreeFilter !== 'todas' && std.carrera !== selectedDegreeFilter) {
        return false;
      }
      if (selectedCuatrimestreFilter !== 'todos') {
        const targetCuatri = parseInt(selectedCuatrimestreFilter);
        if (std.cuatrimestre !== targetCuatri) {
          return false;
        }
      }
      if (studentSearchFilter.trim()) {
        const q = studentSearchFilter.toLowerCase();
        const matches =
          std.nombre.toLowerCase().includes(q) ||
          std.apellidos.toLowerCase().includes(q) ||
          std.matricula.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [students, selectedDegreeFilter, selectedCuatrimestreFilter, studentSearchFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    const defaultCat: EventCategory = 'Taller Extracurricular';
    setEditingEvent(null);
    setSelectedStudentIds([]);
    setIsObligatoryAssign(false);
    setAssignedRoleToStudents('asistente');
    setSelectedDegreeFilter('todas');
    setSelectedCuatrimestreFilter('todos');
    setStudentSearchFilter('');

    const defaultHrs = getStandardHoursForCategory(defaultCat);
    const defaultPts = getStandardScholarshipPoints(defaultCat);
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: defaultCat,
      subcategoria: 'Desarrollo Integral',
      modalidad: 'presencial',
      fecha_evento: new Date().toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fin: '14:00',
      horas_pfi: defaultHrs,
      puntos_beca: defaultPts,
      puntos_beca_staff: 100,
      permite_staff: true,
      cupo_staff: 5,
      horas_staff: Math.round(defaultHrs * 1.5 * 100) / 100,
      horas_ponente: 15.00,
      cupo_maximo: 40,
      enlace_virtual: '',
      otp_online_code: '',
      ubicacion: 'Campus UNIPAZ',
      instructor_titular: '',
      instructor_cargo: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: PFIEvent) => {
    setEditingEvent(evt);
    setSelectedStudentIds([]);
    setIsObligatoryAssign(false);
    setAssignedRoleToStudents('asistente');
    setSelectedDegreeFilter('todas');
    setSelectedCuatrimestreFilter('todos');
    setStudentSearchFilter('');

    setFormData({
      titulo: evt.titulo,
      descripcion: evt.descripcion,
      categoria: evt.categoria,
      subcategoria: evt.subcategoria || '',
      modalidad: evt.modalidad,
      fecha_evento: evt.fecha_evento,
      hora_inicio: evt.hora_inicio,
      hora_fin: evt.hora_fin,
      horas_pfi: evt.horas_pfi,
      puntos_beca: evt.puntos_beca || getStandardScholarshipPoints(evt.categoria),
      puntos_beca_staff: evt.puntos_beca_staff || 100,
      permite_staff: evt.permite_staff ?? true,
      cupo_staff: evt.cupo_staff ?? 5,
      horas_staff: evt.horas_staff || (evt.horas_pfi * 1.5),
      horas_ponente: evt.horas_ponente || 15.00,
      cupo_maximo: evt.cupo_maximo,
      enlace_virtual: evt.enlace_virtual || '',
      otp_online_code: evt.otp_online_code || '',
      ubicacion: evt.ubicacion || '',
      instructor_titular: evt.instructor_titular || '',
      instructor_cargo: evt.instructor_cargo || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudentsForAssign.map((s) => s.id);
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetEventId = '';

    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
      targetEventId = editingEvent.id;
    } else {
      const res = createEvent({
        ...formData,
        activo: true,
        creado_por: currentUser.id,
      });
      targetEventId = res.event.id;
    }

    // Si se seleccionaron estudiantes para asignación
    if (isObligatoryAssign && selectedStudentIds.length > 0) {
      let assignedCount = 0;
      selectedStudentIds.forEach((sId) => {
        const assignRes = assignEventToStudentWithRole(
          targetEventId,
          sId,
          assignedRoleToStudents
        );
        if (assignRes.success) assignedCount++;
      });

      showToast(
        `✓ Actividad guardada y asignada a ${assignedCount} estudiantes con rol de [${assignedRoleToStudents}].`
      );
    } else {
      showToast(
        editingEvent
          ? '✓ Cambios de la actividad guardados con éxito.'
          : '✓ Nueva actividad publicada en el catálogo.'
      );
    }

    setIsModalOpen(false);
  };

  const handleExecuteClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCloneEvent) return;

    if (cloneMode === 'simple') {
      createEvent({
        titulo: `${selectedCloneEvent.titulo} (Copia)`,
        descripcion: selectedCloneEvent.descripcion,
        categoria: selectedCloneEvent.categoria,
        subcategoria: selectedCloneEvent.subcategoria,
        modalidad: selectedCloneEvent.modalidad,
        fecha_evento: cloneNewDate,
        hora_inicio: selectedCloneEvent.hora_inicio,
        hora_fin: selectedCloneEvent.hora_fin,
        horas_pfi: selectedCloneEvent.horas_pfi,
        permite_staff: selectedCloneEvent.permite_staff,
        cupo_staff: selectedCloneEvent.cupo_staff,
        horas_staff: selectedCloneEvent.horas_staff,
        horas_ponente: selectedCloneEvent.horas_ponente,
        cupo_maximo: selectedCloneEvent.cupo_maximo,
        enlace_virtual: selectedCloneEvent.enlace_virtual,
        otp_online_code: selectedCloneEvent.otp_online_code,
        ubicacion: selectedCloneEvent.ubicacion,
        instructor_titular: selectedCloneEvent.instructor_titular,
        instructor_cargo: selectedCloneEvent.instructor_cargo,
        activo: true,
        creado_por: currentUser.id,
      });

      showToast(`✓ Actividad clonada con éxito para la fecha ${cloneNewDate}.`);
    } else {
      const baseDate = new Date(`${cloneNewDate}T12:00:00`);
      const daysToAdd = recurringFrequency === 'semanal' ? 7 : recurringFrequency === 'quincenal' ? 14 : 30;

      for (let i = 1; i <= recurringSessionsCount; i++) {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + (i - 1) * daysToAdd);
        const dateStr = sessionDate.toISOString().split('T')[0];

        createEvent({
          titulo: `${selectedCloneEvent.titulo} - Sesión ${i}/${recurringSessionsCount}`,
          descripcion: selectedCloneEvent.descripcion,
          categoria: selectedCloneEvent.categoria,
          subcategoria: selectedCloneEvent.subcategoria,
          modalidad: selectedCloneEvent.modalidad,
          fecha_evento: dateStr,
          hora_inicio: selectedCloneEvent.hora_inicio,
          hora_fin: selectedCloneEvent.hora_fin,
          horas_pfi: selectedCloneEvent.horas_pfi,
          permite_staff: selectedCloneEvent.permite_staff,
          cupo_staff: selectedCloneEvent.cupo_staff,
          horas_staff: selectedCloneEvent.horas_staff,
          horas_ponente: selectedCloneEvent.horas_ponente,
          cupo_maximo: selectedCloneEvent.cupo_maximo,
          enlace_virtual: selectedCloneEvent.enlace_virtual,
          otp_online_code: selectedCloneEvent.otp_online_code,
          ubicacion: selectedCloneEvent.ubicacion,
          instructor_titular: selectedCloneEvent.instructor_titular,
          instructor_cargo: selectedCloneEvent.instructor_cargo,
          activo: true,
          creado_por: currentUser.id,
        });
      }

      showToast(`✓ Serie recurrente de ${recurringSessionsCount} sesiones generada exitosamente.`);
    }

    setSelectedCloneEvent(null);
  };

  const filtered = events.filter(
    (e) =>
      e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
            Administración de Actividades PFI
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Gestión de Eventos & Roles de Participación
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Configuración de actividades con roles diferenciados (Oyentes, Staff Logístico y Ponentes), convocatorias y asignación por cohorte.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-3 px-5 rounded-full bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear Nueva Actividad
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar evento por título o categoría..."
          className="w-full bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-white/15 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange shadow-sm"
        />
      </div>

      {/* Tabla de Eventos con Roles y Staff */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm dark:shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold">
              <th className="py-3 px-3">Título de la Actividad</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Modalidad</th>
              <th className="py-3 px-3">Fecha & Horario</th>
              <th className="py-3 px-3">Horas (Oyente / Staff / Ponente)</th>
              <th className="py-3 px-3">Staff Logístico</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((evt) => {
              const pendingStaff = (evt.solicitudes_staff || []).filter((s) => s.status === 'pendiente').length;

              return (
                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-black text-unipaz-navy dark:text-white text-sm">{evt.titulo}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-unipaz-cobalt" />
                      {evt.ubicacion || 'Campus UNIPAZ'}
                      {evt.otp_online_code && (
                        <span className="font-mono text-unipaz-orange dark:text-amber-300 font-bold ml-2">
                          OTP: {evt.otp_online_code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-bold">
                      {evt.categoria}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 capitalize text-slate-600 dark:text-slate-300 font-medium">
                    {evt.modalidad}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                    <div className="font-semibold">{evt.fecha_evento}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {evt.hora_inicio} - {evt.hora_fin}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    <div className="text-unipaz-orange font-bold">+{evt.horas_pfi.toFixed(1)}h (Oyente)</div>
                    <div className="text-purple-600 dark:text-purple-400 font-bold">+{evt.horas_staff || (evt.horas_pfi * 1.5).toFixed(1)}h (Staff)</div>
                    <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      +{evt.puntos_beca || 150} pts Beca
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    {evt.permite_staff ? (
                      <button
                        onClick={() => setSelectedEventForStaffReview(evt)}
                        className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1.5 transition-all"
                      >
                        <Users className="w-3 h-3" />
                        {evt.cupo_staff_ocupado || 0}/{evt.cupo_staff || 5} Staff
                        {pendingStaff > 0 && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${pendingStaff} solicitudes pendientes`} />
                        )}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Sin Staff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSpeakerEvent(evt)}
                        className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 text-amber-700 dark:text-amber-300 transition-colors shadow-sm"
                        title="Emitir Reconocimiento Oficial a Ponente / Instructor"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCloneEvent(evt);
                          setCloneNewDate(evt.fecha_evento);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition-colors shadow-sm"
                        title="Clonar Actividad o Crear Serie Recurrente"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedMeetEvent(evt)}
                        className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/20 hover:bg-teal-100 text-teal-700 dark:text-teal-300 transition-colors shadow-sm"
                        title="Importar y Acreditar Asistencia de Google Meet (CSV)"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedKioskEvent(evt)}
                        className="p-1.5 rounded-lg bg-orange-50 dark:bg-unipaz-orange/20 hover:bg-orange-100 text-unipaz-orange transition-colors shadow-sm"
                        title="Modo Kiosco / Proyectar QR en Pantalla"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportEventAttendanceToCsv(evt, attendances, profiles)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors shadow-sm"
                        title="Descargar Lista de Asistencia (CSV)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                        title="Editar Evento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar el evento "${evt.titulo}"?`)) {
                            deleteEvent(evt.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-colors shadow-sm"
                        title="Eliminar Evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA REVISIÓN DE SOLICITUDES DE STAFF LOGÍSTICO Y PENALIZACIONES */}
      {selectedEventForStaffReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-5 my-8">
            <button
              onClick={() => setSelectedEventForStaffReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                Staff Logístico & Convocatorias
              </span>
              <h3 className="text-lg font-black text-unipaz-navy dark:text-white mt-1">
                {selectedEventForStaffReview.titulo}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revisa postulaciones de estudiantes, confirma su rol de Staff (+{selectedEventForStaffReview.horas_staff || 10}h) o aplica penalizaciones por falta injustificada.
              </p>
            </div>

            {/* Solicitudes de Staff */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                Postulaciones de Estudiantes a Staff:
              </h4>

              {(!selectedEventForStaffReview.solicitudes_staff || selectedEventForStaffReview.solicitudes_staff.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10">
                  No hay solicitudes registradas para este evento aún. Los estudiantes pueden postularse desde su catálogo o puedes invitarlos directamente al editar el evento.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedEventForStaffReview.solicitudes_staff.map((sol) => {
                    const student = profiles.find((p) => p.id === sol.student_id);
                    return (
                      <div
                        key={sol.student_id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-unipaz-navy dark:text-white">
                            {student?.nombre} {student?.apellidos} ({student?.matricula})
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {student?.carrera} · {sol.motivo}
                          </div>
                          <span className={`text-[10px] font-black mt-1 inline-block px-2 py-0.5 rounded-full ${
                            sol.status === 'aceptado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : sol.status === 'rechazado'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          }`}>
                            Estatus: {sol.status.toUpperCase()}
                          </span>
                        </div>

                        {sol.status === 'pendiente' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const res = manageStaffApplication(selectedEventForStaffReview.id, sol.student_id, 'aceptado');
                                showToast(res.message);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] shadow-sm"
                            >
                              Aceptar Staff
                            </button>
                            <button
                              onClick={() => {
                                const res = manageStaffApplication(selectedEventForStaffReview.id, sol.student_id, 'rechazado');
                                showToast(res.message);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-bold text-[11px]"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Participantes confirmados como Staff & Opción de Penalización */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                Staff Confirmado para este Evento:
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attendances
                  .filter((a) => a.event_id === selectedEventForStaffReview.id && a.rol_participacion === 'staff_logistica')
                  .map((att) => {
                    const st = profiles.find((p) => p.id === att.student_id);
                    return (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-unipaz-navy dark:text-white">
                            {st?.nombre} {st?.apellidos} ({st?.matricula})
                          </div>
                          <div className="text-[10px] text-purple-700 dark:text-purple-300">
                            Rol: Staff Logístico Oficial · Estatus: {att.status}
                          </div>
                        </div>

                        {att.status !== 'asistio' && !att.penalizacion_horas && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Aplicar penalización de -5.00 hrs a ${st?.nombre} por falta injustificada al rol de staff?`)) {
                                applyStaffPenalty(att.id, 5.0, 'No asistió a su responsabilidad confirmada como Staff Logístico');
                                showToast(`Penalización de -5.00 hrs aplicada a ${st?.nombre}`);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 text-rose-700 dark:text-rose-200 font-bold text-[10px] flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Penalizar No-Show (-5h)
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEventForStaffReview(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CON ROLES DIFERENCIADOS Y SELECCIÓN OBLIGATORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              {editingEvent ? 'Editar Actividad PFI' : 'Crear Nueva Actividad PFI'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configura los detalles formativos, horas por rol (Oyente / Staff / Ponente) y asigna estudiantes obligatorios.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
              {/* Bloque 1: Información Básica */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título del Evento:</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej. Taller de Oratoria y Debate Forense"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción:</label>
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Objetivos y contenido del taller..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría PFI:</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => {
                        const cat = e.target.value as EventCategory;
                        const standardHrs = getStandardHoursForCategory(cat);
                        const standardPts = getStandardScholarshipPoints(cat);
                        setFormData({
                          ...formData,
                          categoria: cat,
                          horas_pfi: standardHrs,
                          puntos_beca: standardPts,
                          horas_staff: Math.round(standardHrs * 1.5 * 100) / 100,
                        });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c} ({getStandardHoursForCategory(c)} hrs · {getStandardScholarshipPoints(c)} pts beca)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Modalidad:</label>
                    <select
                      value={formData.modalidad}
                      onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as EventModality })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">En Línea (Virtual)</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha del Evento:</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_evento}
                      onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora Inicio:</label>
                    <input
                      type="time"
                      required
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora Término:</label>
                    <input
                      type="time"
                      required
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>
                </div>

                {/* Horas Diferenciadas por Rol */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="font-black text-unipaz-navy dark:text-white text-xs block">
                    Horas Acreditables según Rol de Participación:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-unipaz-orange mb-1">Horas como Oyente:</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.horas_pfi}
                        onChange={(e) => setFormData({ ...formData, horas_pfi: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-unipaz-orange"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Horas Staff Logístico:</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.horas_staff}
                        onChange={(e) => setFormData({ ...formData, horas_staff: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-600 dark:text-amber-400 mb-1">Horas Ponente / Expositor:</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.horas_ponente}
                        onChange={(e) => setFormData({ ...formData, horas_ponente: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Puntos de Beca (Mínimo 50 pts, múltiplos de 10) */}
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-unipaz-orange" />
                      Puntos para Alumnos Becados (Mínimo 50 pts · Múltiplos de 10):
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      Escala: 50, 60, 70, 80, 90, 100 pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-amber-800 dark:text-amber-300 mb-1 text-xs">
                        Puntos de Beca (Oyente / General):
                      </label>
                      <input
                        type="number"
                        min="50"
                        step="10"
                        required
                        value={formData.puntos_beca}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 50;
                          setFormData({
                            ...formData,
                            puntos_beca: Math.max(50, Math.round(val / 10) * 10),
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-unipaz-orange"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-purple-700 dark:text-purple-300 mb-1 text-xs">
                        Puntos Extra para Becados en Staff (Múltiplos de 10):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.puntos_beca_staff}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            puntos_beca_staff: Math.max(0, Math.round(val / 10) * 10),
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cupo Máximo Oyentes:</label>
                    <input
                      type="number"
                      value={formData.cupo_maximo}
                      onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-purple-700 dark:text-purple-300 mb-1">Cupo de Staff:</label>
                    <input
                      type="number"
                      value={formData.cupo_staff}
                      onChange={(e) => setFormData({ ...formData, cupo_staff: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Código OTP (Virtuales):</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.otp_online_code}
                      onChange={(e) => setFormData({ ...formData, otp_online_code: e.target.value.toUpperCase() })}
                      placeholder="Ej. PVC202"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono uppercase font-bold focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación / Aula:</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="Ej. Aula Magna UNIPAZ, Edificio A"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
                  />
                </div>
              </div>

              {/* SECCIÓN DE ASIGNACIÓN DIRECTA CON SELECCIÓN DE ROL */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isObligatoryAssign}
                        onChange={(e) => setIsObligatoryAssign(e.target.checked)}
                        className="w-4 h-4 rounded text-unipaz-orange focus:ring-unipaz-orange"
                      />
                      <span className="text-xs font-black text-unipaz-navy dark:text-white flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-unipaz-orange" />
                        ¿Asignar directamente a estudiantes con un rol específico?
                      </span>
                    </label>

                    {isObligatoryAssign && (
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {selectedStudentIds.length} seleccionados
                      </span>
                    )}
                  </div>
                </div>

                {isObligatoryAssign && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 animate-fadeIn">
                    {/* Selector de Rol a Asignar */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Rol con el que se matricularán los estudiantes seleccionados:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setAssignedRoleToStudents('asistente')}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                            assignedRoleToStudents === 'asistente'
                              ? 'bg-unipaz-orange text-white border-unipaz-orange shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Oyente (+{formData.horas_pfi}h)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignedRoleToStudents('staff_logistica')}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                            assignedRoleToStudents === 'staff_logistica'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Staff Logística (+{formData.horas_staff}h)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignedRoleToStudents('ponente')}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                            assignedRoleToStudents === 'ponente'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Ponente (+{formData.horas_ponente}h)
                        </button>
                      </div>
                    </div>

                    {/* Filtros de Estudiantes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Filtrar por Licenciatura:
                        </label>
                        <select
                          value={selectedDegreeFilter}
                          onChange={(e) => setSelectedDegreeFilter(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-unipaz-orange"
                        >
                          <option value="todas">Todas las Licenciaturas</option>
                          {availableDegrees.map((deg) => (
                            <option key={deg} value={deg}>
                              {deg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Filtrar por Cuatrimestre:
                        </label>
                        <select
                          value={selectedCuatrimestreFilter}
                          onChange={(e) => setSelectedCuatrimestreFilter(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-unipaz-orange"
                        >
                          <option value="todos">Todos los Periodos (Cuatrimestre / Semestre)</option>
                          {Array.from({ length: 16 }, (_, i) => i + 1).map((c) => (
                            <option key={c} value={c}>
                              {c}° Periodo {c > 10 ? '(Extensión / Irregular)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Buscar Estudiante:
                        </label>
                        <input
                          type="text"
                          value={studentSearchFilter}
                          onChange={(e) => setStudentSearchFilter(e.target.value)}
                          placeholder="Nombre o matrícula..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange"
                        />
                      </div>
                    </div>

                    {/* Botones de Selección Rápida */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-[11px]">
                      <span className="text-slate-500 font-semibold">
                        {filteredStudentsForAssign.length} estudiantes encontrados con este filtro
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllFiltered}
                          className="font-bold text-unipaz-orange hover:underline"
                        >
                          Seleccionar Filtrados ({filteredStudentsForAssign.length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                        >
                          Deseleccionar Todos
                        </button>
                      </div>
                    </div>

                    {/* Lista con Checkboxes */}
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                      {filteredStudentsForAssign.map((std) => {
                        const isSelected = selectedStudentIds.includes(std.id);
                        return (
                          <div
                            key={std.id}
                            onClick={() => handleToggleStudent(std.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/40 text-purple-950 dark:text-white'
                                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-unipaz-orange focus:ring-unipaz-orange"
                              />
                              <div>
                                <div className="font-bold text-xs">
                                  {std.nombre} {std.apellidos}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {std.matricula} · {std.carrera} · {std.cuatrimestre ? `${std.cuatrimestre}° Cuatr.` : std.periodo_ingreso}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {std.cuatrimestre ? `${std.cuatrimestre}° C` : 'Activo'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-unipaz-orange text-white font-bold hover:bg-orange-600 shadow-sm"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Publicar y Asignar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODO KIOSCO PROYECTOR */}
      {selectedKioskEvent && (
        <KioskProjectorModal
          isOpen={Boolean(selectedKioskEvent)}
          onClose={() => setSelectedKioskEvent(null)}
          event={selectedKioskEvent}
        />
      )}

      {/* MODAL RECONOCIMIENTO OFICIAL PARA PONENTE / INSTRUCTOR */}
      {selectedSpeakerEvent && (
        <SpeakerCertificatePdfModal
          isOpen={Boolean(selectedSpeakerEvent)}
          onClose={() => setSelectedSpeakerEvent(null)}
          event={selectedSpeakerEvent}
        />
      )}

      {/* MODAL CLONADOR Y GENERADOR DE SERIES RECURRENTES */}
      {selectedCloneEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-black text-sm text-unipaz-navy dark:text-white">
                  Clonación & Serie Recurrente
                </h3>
              </div>
              <button
                onClick={() => setSelectedCloneEvent(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Duplica <strong className="text-unipaz-navy dark:text-white">"{selectedCloneEvent.titulo}"</strong> conservando todas las horas, roles y configuraciones.
            </p>

            <form onSubmit={handleExecuteClone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1.5">Modalidad de Clonación:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCloneMode('simple')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      cloneMode === 'simple'
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Clon Simple (1 Fecha)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCloneMode('recurring')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      cloneMode === 'recurring'
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Serie Recurrente
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  {cloneMode === 'simple' ? 'Nueva Fecha del Evento:' : 'Fecha de Inicio de la Serie:'}
                </label>
                <input
                  type="date"
                  required
                  value={cloneNewDate}
                  onChange={(e) => setCloneNewDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                />
              </div>

              {cloneMode === 'recurring' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30">
                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Frecuencia:</label>
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-semibold text-xs"
                    >
                      <option value="semanal">Semanal (+7 días)</option>
                      <option value="quincenal">Quincenal (+14 días)</option>
                      <option value="mensual">Mensual (+30 días)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[11px]">N° Sesiones:</label>
                    <select
                      value={recurringSessionsCount}
                      onChange={(e) => setRecurringSessionsCount(parseInt(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-semibold text-xs"
                    >
                      <option value={2}>2 sesiones</option>
                      <option value={4}>4 sesiones (1 mes)</option>
                      <option value={6}>6 sesiones</option>
                      <option value={8}>8 sesiones (2 meses)</option>
                      <option value={12}>12 sesiones (3 meses)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCloneEvent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  {cloneMode === 'simple' ? 'Duplicar Actividad' : `Generar ${recurringSessionsCount} Sesiones`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUDITORÍA Y ACREDITACIÓN MASIVA DE GOOGLE MEET */}
      {selectedMeetEvent && (
        <GoogleMeetAttendanceModal
          isOpen={Boolean(selectedMeetEvent)}
          onClose={() => setSelectedMeetEvent(null)}
          event={selectedMeetEvent}
        />
      )}
    </div>
  );
}
