'use client';

import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Lock,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { usePFI } from '@/lib/store';

export default function PvcTrackingPage() {
  const { events, attendances, currentUser, registerToEvent, cancelRegistration, getStudentProgress } = usePFI();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const progress = getStudentProgress();
  const pvcEvents = events.filter((e) => e.categoria === 'PVC');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pvcModules = [
    {
      id: 'pvc-1',
      title: 'PVC I: Iniciando mis sueños',
      hours: 25.0,
      description: 'Autoexploración vocacional, formulación de metas iniciales y diseño del plan de vida universitario.',
      completed: progress.pvc.pvc1,
      tag: '1° a 3° Semestre',
    },
    {
      id: 'pvc-2',
      title: 'PVC II: Ahí la llevo',
      hours: 25.0,
      description: 'Desarrollo de competencias laborales, autogestión, inteligencia emocional y resiliencia.',
      completed: progress.pvc.pvc2,
      tag: '4° a 6° Semestre',
    },
    {
      id: 'pvc-3',
      title: 'PVC III: Ya casi',
      hours: 25.0,
      description: 'Transición al mercado laboral, ética profesional, marca personal y networking estratégico.',
      completed: progress.pvc.pvc3,
      tag: '7° a 9° Semestre',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-950/5 dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Bloque Obligatorio Institucional
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-unipaz-navy dark:text-white mt-1">
          Plan de Vida y Carrera (PVC)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          El Plan de Vida y Carrera consta de 3 talleres formativos progresivos con valor de <strong>25.00 horas</strong> cada uno (<strong>75.00 horas totales</strong>). Su acreditación es requisito indispensable para la titulación en UNIPAZ.
        </p>

        {/* Barra de Progreso del Bloque PVC */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
              <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Avance del Bloque PVC:
            </span>
            <span className={progress.pvc.cumplido ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-amber-600 dark:text-amber-400 font-black'}>
              {progress.pvc.horas.toFixed(2)} / 75.00 hrs ({progress.pvc.cumplido ? '100% Completado' : `${Math.round((progress.pvc.horas / 75) * 100)}%`})
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-unipaz-orange to-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.pvc.horas / 75) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap de los 3 Módulos PVC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pvcModules.map((m) => (
          <div
            key={m.id}
            className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${
              m.completed
                ? 'bg-white dark:bg-slate-900/80 border-emerald-300 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30 font-bold">
                {m.tag}
              </span>

              {m.completed ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" /> Acreditado
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Clock className="w-4 h-4" /> Pendiente
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-unipaz-navy dark:text-white mt-4">{m.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{m.description}</p>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Valor Curricular:</span>
              <span className="font-mono font-black text-unipaz-navy dark:text-white">+{m.hours.toFixed(2)} hrs</span>
            </div>
          </div>
        ))}
      </div>

      {/* Próximas Fechas y Talleres de PVC Disponibles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Talleres de Plan de Vida y Carrera Disponibles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inscríbete en las sesiones programadas para este periodo:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pvcEvents.map((evt) => {
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
      </section>
    </div>
  );
}
