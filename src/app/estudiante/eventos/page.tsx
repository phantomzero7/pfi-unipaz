'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Filter,
  Globe,
  Layers,
  ListFilter,
  Search,
  Sparkles,
  Tag,
  Users,
  Wrench,
} from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventRegistrationConfirmModal } from '@/components/EventRegistrationConfirmModal';
import { usePFI } from '@/lib/store';
import { EventModality, PFIEvent } from '@/lib/types';

export default function EventosCatalogPage() {
  const { events, attendances, currentUser, registerToEvent, cancelRegistration } = usePFI();
  const [activeTab, setActiveTab] = useState<'actividades' | 'talleres' | 'pvc' | 'mis_eventos'>('actividades');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('todas');
  const [onlyAvailableSpots, setOnlyAvailableSpots] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal para confirmación formal de inscripción
  const [eventToRegister, setEventToRegister] = useState<PFIEvent | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const modalities = [
    { label: 'Todas las Modalidades', value: 'todas' },
    { label: 'Presencial', value: 'presencial' },
    { label: 'En Línea (Virtual)', value: 'online' },
    { label: 'Híbrido', value: 'hibrido' },
  ];

  // Filtrado de eventos con prioridad a actividades activas
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Filtrado por pestaña principal
        if (activeTab === 'actividades') {
          const isTallerOrPVC =
            ev.categoria === 'Taller Extracurricular' ||
            ev.categoria === 'Taller Liderazgo' ||
            ev.categoria === 'PVC';
          if (isTallerOrPVC) return false;
        } else if (activeTab === 'talleres') {
          const isTaller =
            ev.categoria === 'Taller Extracurricular' || ev.categoria === 'Taller Liderazgo';
          if (!isTaller) return false;
        } else if (activeTab === 'pvc') {
          if (ev.categoria !== 'PVC') return false;
        } else if (activeTab === 'mis_eventos') {
          const att = attendances.find(
            (a) => a.event_id === ev.id && a.student_id === currentUser.id
          );
          if (!att || att.status === 'cancelado') return false;
        }

        // Búsqueda por texto
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          ev.titulo.toLowerCase().includes(q) ||
          ev.descripcion.toLowerCase().includes(q) ||
          ev.categoria.toLowerCase().includes(q) ||
          (ev.ubicacion && ev.ubicacion.toLowerCase().includes(q));

        if (!matchesSearch) return false;

        // Modalidad
        if (selectedModality !== 'todas' && ev.modalidad !== selectedModality) {
          return false;
        }

        // Solo disponibles con cupo
        if (onlyAvailableSpots) {
          const isFull = ev.cupo_maximo > 0 && (ev.cupo_ocupado || 0) >= ev.cupo_maximo;
          if (isFull) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // En catálogo, priorizar eventos activos que tengan cupo disponible y fecha próxima
        const aFull = a.cupo_maximo > 0 && (a.cupo_ocupado || 0) >= a.cupo_maximo;
        const bFull = b.cupo_maximo > 0 && (b.cupo_ocupado || 0) >= b.cupo_maximo;
        if (aFull !== bFull) return aFull ? 1 : -1;
        return a.fecha_evento.localeCompare(b.fecha_evento);
      });
  }, [events, attendances, currentUser, activeTab, searchTerm, selectedModality, onlyAvailableSpots]);

  // Contadores por categoría
  const countActividades = events.filter(
    (e) =>
      e.categoria !== 'Taller Extracurricular' &&
      e.categoria !== 'Taller Liderazgo' &&
      e.categoria !== 'PVC'
  ).length;

  const countTalleres = events.filter(
    (e) => e.categoria === 'Taller Extracurricular' || e.categoria === 'Taller Liderazgo'
  ).length;

  const countPVC = events.filter((e) => e.categoria === 'PVC').length;

  const countMisInscritos = attendances.filter(
    (a) => a.student_id === currentUser.id && a.status !== 'cancelado'
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Header Institucional */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
              Oferta Formativa & Extracurricular
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Catálogo de Actividades y Talleres
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            Inscríbete a conferencias magistrales, talleres extracurriculares, Plan de Vida y Carrera (PVC), foros y brigadas para acreditar tus horas y puntos de beca.
          </p>
        </div>

        {/* PESTAÑAS PRINCIPALES POR TIPO DE OFERTA */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('actividades')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              activeTab === 'actividades'
                ? 'bg-unipaz-orange text-white shadow-orange-500/20 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Actividades & Conferencias ({countActividades})
          </button>

          <button
            onClick={() => setActiveTab('talleres')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              activeTab === 'talleres'
                ? 'bg-unipaz-navy text-white dark:bg-blue-600 shadow-blue-500/20 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Talleres Extracurriculares ({countTalleres})
          </button>

          <button
            onClick={() => setActiveTab('pvc')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              activeTab === 'pvc'
                ? 'bg-purple-600 text-white shadow-purple-500/20 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            Plan de Vida y Carrera ({countPVC})
          </button>

          <button
            onClick={() => setActiveTab('mis_eventos')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ml-auto ${
              activeTab === 'mis_eventos'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mis Inscripciones & Realizados ({countMisInscritos})
          </button>
        </div>

        {/* Barra de Filtros Rápida y Limpia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Input de Búsqueda */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de actividad, ponente o tema..."
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange"
            />
          </div>

          {/* Selector de Modalidad */}
          <div className="relative">
            <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-unipaz-orange font-medium"
            >
              {modalities.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Actividades */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
          <h4 className="text-base font-bold text-unipaz-navy dark:text-white">
            {activeTab === 'mis_eventos'
              ? 'Aún no tienes actividades registradas en esta vista'
              : 'No se encontraron actividades con los filtros seleccionados'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'mis_eventos'
              ? 'Explora las pestañas de Actividades, Talleres y PVC para confirmar tu lugar en los eventos disponibles.'
              : 'Prueba ajustando el término de búsqueda o cambiando la modalidad seleccionada.'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedModality('todas');
              setActiveTab('actividades');
            }}
            className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:scale-105 transition-transform"
          >
            Ver Catálogo General
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
                onRegister={() => setEventToRegister(evt)}
                onCancel={() => {
                  const res = cancelRegistration(evt.id);
                  showToast(res.message);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación de Asistencia / Inscripción */}
      {eventToRegister && (
        <EventRegistrationConfirmModal
          isOpen={Boolean(eventToRegister)}
          onClose={() => setEventToRegister(null)}
          event={eventToRegister}
          currentUser={currentUser}
          onConfirm={() => {
            const res = registerToEvent(eventToRegister.id);
            showToast(res.message);
          }}
        />
      )}
    </div>
  );
}

