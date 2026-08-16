'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Compass,
  Edit2,
  Filter,
  Globe,
  GraduationCap,
  KeyRound,
  Layers,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Square,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventCategory, EventModality, PFIEvent, UserProfile } from '@/lib/types';

export default function AdminEventosManagerPage() {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    currentUser,
    profiles,
    assignEventToStudent,
    getStandardHoursForCategory,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PFIEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de Asignación Obligatoria en el Modal
  const [isObligatoryAssign, setIsObligatoryAssign] = useState(false);
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
    setSelectedDegreeFilter('todas');
    setSelectedCuatrimestreFilter('todos');
    setStudentSearchFilter('');

    setFormData({
      titulo: '',
      descripcion: '',
      categoria: defaultCat,
      subcategoria: 'Desarrollo Integral',
      modalidad: 'presencial',
      fecha_evento: new Date().toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fin: '14:00',
      horas_pfi: getStandardHoursForCategory(defaultCat),
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

    // Si se seleccionaron estudiantes para asignación obligatoria
    if (isObligatoryAssign && selectedStudentIds.length > 0) {
      let assignedCount = 0;
      selectedStudentIds.forEach((sId) => {
        const assignRes = assignEventToStudent(targetEventId, sId, false);
        if (assignRes.success) assignedCount++;
      });

      showToast(
        `✓ Actividad guardada y asignada obligatoriamente a ${assignedCount} estudiantes.`
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
            Gestión y Creación de Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Alta de actividades, configuración de horas y asignación obligatoria a grupos por carrera y cuatrimestre.
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

      {/* Tabla de Eventos */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm dark:shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold">
              <th className="py-3 px-3">Título de la Actividad</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Modalidad</th>
              <th className="py-3 px-3">Fecha & Horario</th>
              <th className="py-3 px-3">Cupo</th>
              <th className="py-3 px-3">Horas PFI</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((evt) => (
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
                <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                  {evt.cupo_maximo > 0 ? (
                    <span className="font-mono font-bold">
                      {evt.cupo_ocupado || 0} / {evt.cupo_maximo}
                    </span>
                  ) : (
                    <span className="text-slate-400">Ilimitado</span>
                  )}
                </td>
                <td className="py-3.5 px-3 font-mono font-black text-unipaz-orange">
                  +{evt.horas_pfi.toFixed(2)}h
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
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
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR CON ASIGNACIÓN OBLIGATORIA POR CARRERA Y CUATRIMESTRE */}
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
              Configura los detalles formativos, horas y selecciona estudiantes obligatorios por licenciatura y cuatrimestre.
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
                        setFormData({ ...formData, categoria: cat, horas_pfi: standardHrs });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c} ({getStandardHoursForCategory(c)} hrs)
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora Inicio:</label>
                    <input
                      type="time"
                      required
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora Fin:</label>
                    <input
                      type="time"
                      required
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Horas PFI Oficiales:</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.horas_pfi}
                      onChange={(e) => setFormData({ ...formData, horas_pfi: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cupo Máximo (0=Ilimitado):</label>
                    <input
                      type="number"
                      value={formData.cupo_maximo}
                      onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-unipaz-orange"
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

              {/* SECCIÓN NOVEDOSA: ASIGNACIÓN OBLIGATORIA A ESTUDIANTES POR LICENCIATURA Y CUATRIMESTRE */}
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
                        ¿Asignar como actividad obligatoria a estudiantes?
                      </span>
                    </label>

                    {isObligatoryAssign && (
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {selectedStudentIds.length} seleccionados
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    Filtra la lista de estudiantes por Licenciatura y por Cuatrimestre para inscribirlos directamente al momento de guardar.
                  </p>
                </div>

                {isObligatoryAssign && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 animate-fadeIn">
                    {/* Filtros de Estudiantes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {/* Filtro Licenciatura */}
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

                      {/* Filtro Cuatrimestre */}
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Filtrar por Cuatrimestre:
                        </label>
                        <select
                          value={selectedCuatrimestreFilter}
                          onChange={(e) => setSelectedCuatrimestreFilter(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-unipaz-orange"
                        >
                          <option value="todos">Todos los Cuatrimestres</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                            <option key={c} value={c}>
                              {c}° Cuatrimestre
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Búsqueda por Nombre */}
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
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
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
                                onChange={() => {}} // Manejado por onClick del contenedor
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
    </div>
  );
}
