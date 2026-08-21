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
  Upload,
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
import {
  CATEGORIAS_PFI_OFICIALES,
  EventCategory,
  EventDayConfig,
  EventModality,
  ParticipantRole,
  PFIEvent,
  RoleApplication,
  UserProfile,
} from '@/lib/types';

export default function AdminEventosManagerPage() {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    currentUser,
    profiles,
    assignEventToStudentWithRole,
    reviewRoleApplication,
    attendances,
    pfiConfig,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PFIEvent | null>(null);
  const [selectedEventForRoleReview, setSelectedEventForRoleReview] = useState<PFIEvent | null>(null);
  const [selectedKioskEvent, setSelectedKioskEvent] = useState<PFIEvent | null>(null);
  const [selectedSpeakerEvent, setSelectedSpeakerEvent] = useState<PFIEvent | null>(null);
  const [selectedMeetEvent, setSelectedMeetEvent] = useState<PFIEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de Asignación Masiva / Obligatoria en el Modal
  const [isObligatoryAssign, setIsObligatoryAssign] = useState(false);
  const [assignedRoleToStudents, setAssignedRoleToStudents] = useState<ParticipantRole>('asistente');
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState<string>('todas');
  const [selectedCuatrimestreFilter, setSelectedCuatrimestreFilter] = useState<string>('todos');
  const [selectedBecaFilter, setSelectedBecaFilter] = useState<'todos' | 'si' | 'no'>('todos');
  const [studentSearchFilter, setStudentSearchFilter] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Form states para Crear / Editar Evento
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    categoria: EventCategory;
    modalidad: EventModality;
    fecha_evento: string;
    hora_inicio: string;
    hora_fin: string;
    ubicacion: string;
    horas_asistente: number;
    puntos_beca_asistente: number;
    horas_staff: number;
    puntos_beca_staff: number;
    horas_ponente: number;
    puntos_beca_ponente: number;
    cupo_maximo: number;
    cupo_staff: number;
    cupo_ponentes: number;
    permite_staff: boolean;
    es_multidia: boolean;
    porcentaje_minimo_permanencia: number;
    dias_evento: EventDayConfig[];
    enlace_virtual: string;
    otp_online_code: string;
    instructor_titular: string;
    instructor_cargo: string;
  }>({
    titulo: '',
    descripcion: '',
    categoria: 'Académico' as any,
    modalidad: 'presencial',
    fecha_evento: new Date().toISOString().split('T')[0],
    hora_inicio: '10:00',
    hora_fin: '14:00',
    ubicacion: 'Campus UNIPAZ',
    horas_asistente: 5.0,
    puntos_beca_asistente: 200,
    horas_staff: 10.0,
    puntos_beca_staff: 300,
    horas_ponente: 15.0,
    puntos_beca_ponente: 400,
    cupo_maximo: 50,
    cupo_staff: 5,
    cupo_ponentes: 2,
    permite_staff: true,
    es_multidia: false,
    porcentaje_minimo_permanencia: 80,
    dias_evento: [
      {
        dia_numero: 1,
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '10:00',
        hora_fin: '14:00',
        titulo_dia: 'Día 1 · Sesión Inaugural',
        porcentaje_minimo: 80,
      },
    ],
    enlace_virtual: '',
    otp_online_code: '',
    instructor_titular: '',
    instructor_cargo: '',
  });

  const categoriesCatalog = pfiConfig.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES;
  const students = profiles.filter((p) => p.role === 'estudiante');

  // Licenciaturas disponibles
  const availableDegrees = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.carrera) set.add(s.carrera);
    });
    return Array.from(set);
  }, [students]);

  // Estudiantes filtrados para la selección en modal
  const filteredStudentsForAssign = useMemo(() => {
    return students.filter((s) => {
      const matchDegree = selectedDegreeFilter === 'todas' || s.carrera === selectedDegreeFilter;
      const matchCuatri = selectedCuatrimestreFilter === 'todos' || String(s.cuatrimestre) === selectedCuatrimestreFilter;
      const matchBeca =
        selectedBecaFilter === 'todos' ||
        (selectedBecaFilter === 'si' && s.tiene_beca) ||
        (selectedBecaFilter === 'no' && !s.tiene_beca);

      const q = studentSearchFilter.toLowerCase();
      const matchSearch =
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q);

      return matchDegree && matchCuatri && matchBeca && matchSearch;
    });
  }, [students, selectedDegreeFilter, selectedCuatrimestreFilter, selectedBecaFilter, studentSearchFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchQuery =
        e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.ubicacion && e.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategoryFilter === 'todas' || e.categoria === selectedCategoryFilter;
      return matchQuery && matchCat;
    });
  }, [events, searchTerm, selectedCategoryFilter]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: (categoriesCatalog[0]?.nombre as any) || 'Académico',
      modalidad: 'presencial',
      fecha_evento: new Date().toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fin: '14:00',
      ubicacion: 'Campus UNIPAZ',
      horas_asistente: 5.0,
      puntos_beca_asistente: 200,
      horas_staff: 10.0,
      puntos_beca_staff: 300,
      horas_ponente: 15.0,
      puntos_beca_ponente: 400,
      cupo_maximo: 50,
      cupo_staff: 5,
      cupo_ponentes: 2,
      permite_staff: true,
      es_multidia: false,
      porcentaje_minimo_permanencia: 80,
      dias_evento: [
        {
          dia_numero: 1,
          fecha: new Date().toISOString().split('T')[0],
          hora_inicio: '10:00',
          hora_fin: '14:00',
          titulo_dia: 'Día 1 · Sesión Inaugural',
          porcentaje_minimo: 80,
        },
      ],
      enlace_virtual: '',
      otp_online_code: '',
      instructor_titular: '',
      instructor_cargo: '',
    });
    setSelectedStudentIds([]);
    setIsObligatoryAssign(false);
    setIsModalOpen(true);
  };

  const openEditModal = (ev: PFIEvent) => {
    setEditingEvent(ev);
    setFormData({
      titulo: ev.titulo,
      descripcion: ev.descripcion || '',
      categoria: ev.categoria,
      modalidad: ev.modalidad,
      fecha_evento: ev.fecha_evento,
      hora_inicio: ev.hora_inicio,
      hora_fin: ev.hora_fin,
      ubicacion: ev.ubicacion || 'Campus UNIPAZ',
      horas_asistente: ev.horas_presenciales || 5.0,
      puntos_beca_asistente: ev.puntos_beca || 200,
      horas_staff: ev.horas_staff || 10.0,
      puntos_beca_staff: ev.puntos_beca_staff || 300,
      horas_ponente: ev.horas_ponente || 15.0,
      puntos_beca_ponente: ev.puntos_beca_ponente || 400,
      cupo_maximo: ev.cupo_maximo,
      cupo_staff: ev.cupo_staff || 5,
      cupo_ponentes: ev.cupo_ponentes || 2,
      permite_staff: ev.permite_staff !== false,
      es_multidia: ev.es_multidia || false,
      porcentaje_minimo_permanencia: ev.porcentaje_minimo_permanencia || 80,
      dias_evento: ev.dias_evento || [
        {
          dia_numero: 1,
          fecha: ev.fecha_evento,
          hora_inicio: ev.hora_inicio,
          hora_fin: ev.hora_fin,
          titulo_dia: 'Día 1 · Sesión Inaugural',
          porcentaje_minimo: 80,
        },
      ],
      enlace_virtual: ev.enlace_virtual || '',
      otp_online_code: ev.otp_online_code || '',
      instructor_titular: ev.instructor_titular || '',
      instructor_cargo: ev.instructor_cargo || '',
    });
    setIsObligatoryAssign(false);
    setSelectedStudentIds([]);
    setIsModalOpen(true);
  };

  const handleAddDay = () => {
    const nextNum = formData.dias_evento.length + 1;
    setFormData({
      ...formData,
      dias_evento: [
        ...formData.dias_evento,
        {
          dia_numero: nextNum,
          fecha: new Date().toISOString().split('T')[0],
          hora_inicio: '10:00',
          hora_fin: '14:00',
          titulo_dia: `Día ${nextNum}`,
          porcentaje_minimo: 80,
        },
      ],
    });
  };

  const handleRemoveDay = (index: number) => {
    if (formData.dias_evento.length <= 1) return;
    setFormData({
      ...formData,
      dias_evento: formData.dias_evento.filter((_, i) => i !== index),
    });
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        modalidad: formData.modalidad,
        fecha_evento: formData.fecha_evento,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        horas_presenciales: formData.horas_asistente,
        puntos_beca: formData.puntos_beca_asistente,
        horas_staff: formData.horas_staff,
        puntos_beca_staff: formData.puntos_beca_staff,
        horas_ponente: formData.horas_ponente,
        puntos_beca_ponente: formData.puntos_beca_ponente,
        cupo_maximo: formData.cupo_maximo,
        cupo_staff: formData.cupo_staff,
        cupo_ponentes: formData.cupo_ponentes,
        permite_staff: formData.permite_staff,
        es_multidia: formData.es_multidia,
        porcentaje_minimo_permanencia: formData.porcentaje_minimo_permanencia,
        dias_evento: formData.dias_evento,
        ubicacion: formData.ubicacion,
        enlace_virtual: formData.enlace_virtual,
        otp_online_code: formData.otp_online_code,
        instructor_titular: formData.instructor_titular,
        instructor_cargo: formData.instructor_cargo,
      });

      if (isObligatoryAssign && selectedStudentIds.length > 0) {
        selectedStudentIds.forEach((id) => {
          assignEventToStudentWithRole(editingEvent.id, id, assignedRoleToStudents);
        });
      }

      setToastMessage(`✓ Actividad "${formData.titulo}" actualizada con éxito.`);
    } else {
      const res = createEvent({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        modalidad: formData.modalidad,
        fecha_evento: formData.fecha_evento,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        horas_pfi: formData.horas_asistente,
        horas_presenciales: formData.horas_asistente,
        puntos_beca: formData.puntos_beca_asistente,
        horas_staff: formData.horas_staff,
        puntos_beca_staff: formData.puntos_beca_staff,
        horas_ponente: formData.horas_ponente,
        puntos_beca_ponente: formData.puntos_beca_ponente,
        cupo_maximo: formData.cupo_maximo,
        cupo_staff: formData.cupo_staff,
        cupo_ponentes: formData.cupo_ponentes,
        permite_staff: formData.permite_staff,
        es_multidia: formData.es_multidia,
        porcentaje_minimo_permanencia: formData.porcentaje_minimo_permanencia,
        dias_evento: formData.dias_evento,
        ubicacion: formData.ubicacion,
        enlace_virtual: formData.enlace_virtual,
        otp_online_code: formData.otp_online_code,
        instructor_titular: formData.instructor_titular,
        instructor_cargo: formData.instructor_cargo,
        creado_por: currentUser.id,
        activo: true,
      });

      if (res.success && isObligatoryAssign && selectedStudentIds.length > 0) {
        selectedStudentIds.forEach((id) => {
          assignEventToStudentWithRole(res.event.id, id, assignedRoleToStudents);
        });
      }

      setToastMessage(`✓ Actividad "${formData.titulo}" creada correctamente.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Catálogo Formativo PFI
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Gestión y Programación de Eventos y Talleres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Programación de actividades multi-día, horas por rol (oyente, staff, ponente) y postulaciones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad / Taller
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Barra de Búsqueda y Filtros de Categoría */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar evento por título, ubicación o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Píldoras de Categoría */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategoryFilter('todas')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
              selectedCategoryFilter === 'todas'
                ? 'bg-unipaz-navy dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
            }`}
          >
            Todas las Categorías ({events.length})
          </button>
          {categoriesCatalog.map((cat) => {
            const count = events.filter((e) => e.categoria === cat.nombre).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.nombre)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategoryFilter === cat.nombre
                    ? 'bg-unipaz-orange text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange'
                }`}
              >
                <span>{cat.nombre}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const pendingApps = (ev.solicitudes_roles || []).filter((a) => a.status === 'pendiente');

          return (
            <div
              key={ev.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between hover:border-unipaz-orange/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
                    {ev.categoria}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                    {ev.modalidad}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-unipaz-navy dark:text-white group-hover:text-unipaz-orange transition-colors">
                    {ev.titulo}
                  </h3>
                  {ev.descripcion && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {ev.descripcion}
                    </p>
                  )}
                </div>

                {/* Fechas & Multidía */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-unipaz-orange" />
                    <span>{ev.fecha_evento}</span>
                    <span className="text-slate-400">· {ev.hora_inicio} - {ev.hora_fin}</span>
                  </div>
                  {ev.es_multidia && (
                    <div className="text-[11px] font-bold text-blue-600">
                      📅 Evento de Múltiples Días ({ev.dias_evento?.length || 1} sesiones con Check-In individual)
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ev.ubicacion}</span>
                  </div>
                </div>

                {/* Horas y Puntos Fijos por Rol */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Oyente / Asistente:</span>
                    <strong className="font-mono text-emerald-600">{ev.horas_presenciales?.toFixed(1)} hrs · {ev.puntos_beca || 200} pts</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Staff Logístico:</span>
                    <strong className="font-mono text-amber-600">{ev.horas_staff?.toFixed(1) || '10.0'} hrs · {ev.puntos_beca_staff || 300} pts</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ponente / Expositor:</span>
                    <strong className="font-mono text-blue-600">{ev.horas_ponente?.toFixed(1) || '15.0'} hrs · {ev.puntos_beca_ponente || 400} pts</strong>
                  </div>
                </div>

                {/* Postulaciones Pendientes */}
                {pendingApps.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <span className="font-bold text-xs">🟡 {pendingApps.length} postulación(es) de rol pendiente(s)</span>
                    <button
                      onClick={() => setSelectedEventForRoleReview(ev)}
                      className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px]"
                    >
                      Revisar
                    </button>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedKioskEvent(ev)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Proyectar QR en Kiosco / Pantalla"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedSpeakerEvent(ev)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Emitir Constancia de Ponente"
                  >
                    <Mic className="w-4 h-4 text-unipaz-orange" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(ev)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la actividad "${ev.titulo}"?`)) {
                        deleteEvent(ev.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Eliminar Evento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODAL CREAR / EDITAR ACTIVIDAD CON HORAS POR ROL        */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-unipaz-orange text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Administración de Eventos</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  {editingEvent ? 'Editar Actividad Formativa' : 'Nueva Actividad / Taller Formativo'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Título de la Actividad (Obligatorio):</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="ej. Taller de Emprendimiento e Innovación"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Categoría PFI:</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-unipaz-navy dark:text-white"
                  >
                    {categoriesCatalog.map((c) => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descripción (Opcional):</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles, objetivos o temario del taller..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Modalidad:</label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="presencial">Presencial (Campus UNIPAZ)</option>
                    <option value="virtual">Virtual (Meet / Zoom)</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Ubicación / Auditorio:</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="ej. Auditorio Principal o Sala Audiovisual"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* SECCIÓN MULTIDÍA */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isMultidia"
                      checked={formData.es_multidia}
                      onChange={(e) => setFormData({ ...formData, es_multidia: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isMultidia" className="font-black text-xs text-unipaz-navy dark:text-white cursor-pointer">
                      Actividad de Múltiples Días (Sesiones con Check-In / Check-Out individual)
                    </label>
                  </div>

                  {formData.es_multidia && (
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="py-1 px-3 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Día
                    </button>
                  )}
                </div>

                {!formData.es_multidia ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Fecha del Evento:</label>
                      <input
                        type="date"
                        value={formData.fecha_evento}
                        onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Hora Inicio:</label>
                      <input
                        type="time"
                        value={formData.hora_inicio}
                        onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Hora Fin:</label>
                      <input
                        type="time"
                        value={formData.hora_fin}
                        onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.dias_evento.map((dia, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <input
                          type="text"
                          value={dia.titulo_dia}
                          onChange={(e) => {
                            const updated = [...formData.dias_evento];
                            updated[idx].titulo_dia = e.target.value;
                            setFormData({ ...formData, dias_evento: updated });
                          }}
                          placeholder={`Día ${idx + 1}`}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-xs font-bold"
                        />
                        <input
                          type="date"
                          value={dia.fecha}
                          onChange={(e) => {
                            const updated = [...formData.dias_evento];
                            updated[idx].fecha = e.target.value;
                            setFormData({ ...formData, dias_evento: updated });
                          }}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-1.5 font-mono text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={dia.hora_inicio}
                            onChange={(e) => {
                              const updated = [...formData.dias_evento];
                              updated[idx].hora_inicio = e.target.value;
                              setFormData({ ...formData, dias_evento: updated });
                            }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-1.5 font-mono text-[11px] w-full"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={dia.hora_fin}
                            onChange={(e) => {
                              const updated = [...formData.dias_evento];
                              updated[idx].hora_fin = e.target.value;
                              setFormData({ ...formData, dias_evento: updated });
                            }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-1.5 font-mono text-[11px] w-full"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">Mín {dia.porcentaje_minimo || 80}%</span>
                          {formData.dias_evento.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDay(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HORAS Y PUNTOS POR ROL */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                  Horas PFI y Puntos de Beca Fijos por Rol de Participación
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Asistente */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
                    <strong className="text-emerald-700 dark:text-emerald-300 block">1. Asistente / Oyente</strong>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Horas PFI:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.horas_asistente}
                        onChange={(e) => setFormData({ ...formData, horas_asistente: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Puntos Beca:</label>
                      <input
                        type="number"
                        value={formData.puntos_beca_asistente}
                        onChange={(e) => setFormData({ ...formData, puntos_beca_asistente: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Cupo Asistentes:</label>
                      <input
                        type="number"
                        value={formData.cupo_maximo}
                        onChange={(e) => setFormData({ ...formData, cupo_maximo: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Staff Logístico */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
                    <strong className="text-amber-700 dark:text-amber-300 block">2. Staff Logístico</strong>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Horas PFI:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.horas_staff}
                        onChange={(e) => setFormData({ ...formData, horas_staff: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Puntos Beca:</label>
                      <input
                        type="number"
                        value={formData.puntos_beca_staff}
                        onChange={(e) => setFormData({ ...formData, puntos_beca_staff: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Cupo Staff:</label>
                      <input
                        type="number"
                        value={formData.cupo_staff}
                        onChange={(e) => setFormData({ ...formData, cupo_staff: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Ponente / Expositor */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
                    <strong className="text-blue-700 dark:text-blue-300 block">3. Ponente / Expositor</strong>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Horas PFI:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.horas_ponente}
                        onChange={(e) => setFormData({ ...formData, horas_ponente: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Puntos Beca:</label>
                      <input
                        type="number"
                        value={formData.puntos_beca_ponente}
                        onChange={(e) => setFormData({ ...formData, puntos_beca_ponente: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Cupo Ponentes:</label>
                      <input
                        type="number"
                        value={formData.cupo_ponentes}
                        onChange={(e) => setFormData({ ...formData, cupo_ponentes: Number(e.target.value) })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ASIGNACIÓN DIRECTA DE ESTUDIANTES AL CREAR */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="obligatory"
                    checked={isObligatoryAssign}
                    onChange={(e) => setIsObligatoryAssign(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="obligatory" className="font-bold text-xs text-unipaz-navy dark:text-white cursor-pointer">
                    Asignar directamente a un grupo de estudiantes
                  </label>
                </div>

                {isObligatoryAssign && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={selectedDegreeFilter}
                        onChange={(e) => setSelectedDegreeFilter(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 text-[11px]"
                      >
                        <option value="todas">Todas las carreras</option>
                        {availableDegrees.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={selectedCuatrimestreFilter}
                        onChange={(e) => setSelectedCuatrimestreFilter(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 text-[11px]"
                      >
                        <option value="todos">Todos los cuatrimestres</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                          <option key={c} value={String(c)}>{c}° Cuatrimestre</option>
                        ))}
                      </select>

                      <select
                        value={selectedBecaFilter}
                        onChange={(e) => setSelectedBecaFilter(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-lg p-1.5 text-[11px]"
                      >
                        <option value="todos">Tiene Beca: TODOS</option>
                        <option value="si">Tiene Beca: SÍ</option>
                        <option value="no">Tiene Beca: NO</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">
                        {filteredStudentsForAssign.length} estudiantes disponibles · {selectedStudentIds.length} seleccionados
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedStudentIds.length === filteredStudentsForAssign.length) {
                            setSelectedStudentIds([]);
                          } else {
                            setSelectedStudentIds(filteredStudentsForAssign.map((s) => s.id));
                          }
                        }}
                        className="font-bold text-unipaz-orange hover:underline"
                      >
                        {selectedStudentIds.length === filteredStudentsForAssign.length ? 'Deseleccionar' : 'Seleccionar Todos'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Publicar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BANDEJA DE POSTULACIONES DE ROLES (STAFF / PONENTE) */}
      {selectedEventForRoleReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEventForRoleReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Comité PFI</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Postulaciones de Roles · {selectedEventForRoleReview.titulo}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {(selectedEventForRoleReview.solicitudes_roles || []).map((app) => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-unipaz-navy dark:text-white text-xs">{app.student_nombre}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{app.student_matricula}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        app.rol_solicitado === 'staff_logistica' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.rol_solicitado === 'staff_logistica' ? 'Staff' : 'Ponente'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Motivo: {app.motivo}</p>
                  </div>

                  {app.status === 'pendiente' ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => reviewRoleApplication(selectedEventForRoleReview.id, app.id, 'rechazada')}
                        className="py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => reviewRoleApplication(selectedEventForRoleReview.id, app.id, 'aprobada')}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs"
                      >
                        Aprobar
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      app.status === 'aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Kiosco / Proyector */}
      {selectedKioskEvent && (
        <KioskProjectorModal
          isOpen={true}
          onClose={() => setSelectedKioskEvent(null)}
          event={selectedKioskEvent}
        />
      )}

      {/* Modal Constancia de Ponente */}
      {selectedSpeakerEvent && (
        <SpeakerCertificatePdfModal
          isOpen={true}
          onClose={() => setSelectedSpeakerEvent(null)}
          event={selectedSpeakerEvent}
        />
      )}
    </div>
  );
}
