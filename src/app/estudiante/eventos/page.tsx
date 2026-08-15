'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Filter,
  Globe,
  Layers,
  Search,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { usePFI } from '@/lib/store';
import { EventCategory, EventModality } from '@/lib/types';

export default function EventosCatalogPage() {
  const { events, attendances, currentUser, registerToEvent, cancelRegistration } = usePFI();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedModality, setSelectedModality] = useState<string>('todas');
  const [filterState, setFilterState] = useState<'todos' | 'inscritos' | 'acreditados'>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories: { label: string; value: string }[] = [
    { label: 'Todas las Categorías', value: 'todas' },
    { label: 'Plan de Vida y Carrera (PVC)', value: 'PVC' },
    { label: 'Talleres Extracurriculares', value: 'Taller Extracurricular' },
    { label: 'Taller Liderazgo y Equidad', value: 'Taller Liderazgo' },
    { label: 'Investigación / Ponencias', value: 'Investigación' },
    { label: 'Clubes Anuales', value: 'Club Anual' },
    { label: 'Simposios y Congresos', value: 'Simposio' },
    { label: 'Jornadas Sociales', value: 'Jornada Social' },
    { label: 'Cine Club / Café Literario', value: 'Cine Club' },
    { label: 'Foros y Conferencias', value: 'Foro' },
    { label: 'Campañas y Colectas', value: 'Campaña' },
  ];

  const modalities = [
    { label: 'Todas', value: 'todas' },
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea (Virtual)', value: 'online' },
    { label: 'Híbrido', value: 'hibrido' },
  ];

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Búsqueda por texto
      const matchesSearch =
        ev.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.ubicacion && ev.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Categoría
      if (selectedCategory !== 'todas' && ev.categoria !== selectedCategory) {
        return false;
      }

      // Modalidad
      if (selectedModality !== 'todas' && ev.modalidad !== selectedModality) {
        return false;
      }

      // Estatus del estudiante
      const att = attendances.find((a) => a.event_id === ev.id && a.student_id === currentUser.id);
      if (filterState === 'inscritos' && (!att || att.status === 'cancelado')) {
        return false;
      }
      if (filterState === 'acreditados' && att?.status !== 'asistio') {
        return false;
      }

      return true;
    });
  }, [events, attendances, currentUser, searchTerm, selectedCategory, selectedModality, filterState]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
            Oferta Extracurricular UNIPAZ
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
          Catálogo de Actividades y Talleres PFI
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          Explora e inscríbete a conferencias, talleres extracurriculares, Plan de Vida y Carrera, brigadas sociales y clubes universitarios para acumular horas de titulación.
        </p>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Input de Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título o tema..."
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-unipaz-orange"
            />
          </div>

          {/* Selector de Categoría */}
          <div className="relative">
            <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-unipaz-orange"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Modalidad */}
          <div className="relative">
            <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-unipaz-orange"
            >
              {modalities.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Mis Inscripciones */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterState('todos')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'todos' ? 'bg-unipaz-orange text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              Todos ({events.length})
            </button>
            <button
              onClick={() => setFilterState('inscritos')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'inscritos' ? 'bg-unipaz-orange text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              Mis Cupos
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Actividades */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-white/10 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-600" />
          <h4 className="text-base font-bold text-white">
            No se encontraron actividades con los filtros seleccionados
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda o cambiando la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todas');
              setSelectedModality('todas');
              setFilterState('todos');
            }}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const att = attendances.find(
              (a) => a.event_id === evt.id && a.student_id === currentUser.id
            );
            return (
              <EventCard
                key={evt.id}
                event={evt}
                attendance={att}
                onRegister={() => {
                  const res = registerToEvent(evt.id);
                  showToast(res.message);
                }}
                onCancel={() => {
                  const res = cancelRegistration(evt.id);
                  showToast(res.message);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
