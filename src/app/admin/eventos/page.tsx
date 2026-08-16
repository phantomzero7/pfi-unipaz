'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Edit2,
  Globe,
  KeyRound,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventCategory, EventModality, PFIEvent } from '@/lib/types';

export default function AdminEventosManagerPage() {
  const { events, createEvent, updateEvent, deleteEvent, currentUser, getStandardHoursForCategory } = usePFI();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PFIEvent | null>(null);

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

  const handleOpenCreate = () => {
    const defaultCat: EventCategory = 'Taller Extracurricular';
    setEditingEvent(null);
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
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: PFIEvent) => {
    setEditingEvent(evt);
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
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      createEvent({
        ...formData,
        activo: true,
        creado_por: currentUser.id,
      });
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
            Alta de talleres extracurriculares, sesiones de PVC, simposios y control de cupos con horas preestablecidas por categoría.
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

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8">
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
              Configura los detalles formativos, horas asignadas y cupos.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
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
                  rows={3}
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
                  {editingEvent ? 'Guardar Cambios' : 'Publicar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
