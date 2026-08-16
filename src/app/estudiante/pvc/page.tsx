'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileCheck,
  Flame,
  Info,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { WorkshopCertificatePdfModal } from '@/components/WorkshopCertificatePdfModal';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent } from '@/lib/types';

export default function PvcAndTalleresPage() {
  const { events, attendances, currentUser, getStudentProgress } = usePFI();
  const [selectedCertEvent, setSelectedCertEvent] = useState<{
    event: PFIEvent;
    attendance: EventAttendance;
  } | null>(null);

  const progress = getStudentProgress();
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  // Obtener asistencias del estudiante
  const studentAtts = attendances.filter((a) => a.student_id === currentUser.id);

  // Módulos PVC
  const pvcModules = [
    {
      id: 'pvc-1',
      title: 'PVC I: Iniciando mis sueños',
      hours: 25.0,
      description: 'Autoexploración vocacional, formulación de metas iniciales y diseño del plan de vida universitario.',
      completed: progress.pvc.pvc1,
      tag: '1° a 3° Semestre',
      event: events.find((e) => e.titulo.toUpperCase().includes('PVC I') || e.titulo.toUpperCase().includes('INICIANDO MIS SUEÑOS')),
    },
    {
      id: 'pvc-2',
      title: 'PVC II: Ahí la llevo',
      hours: 25.0,
      description: 'Desarrollo de competencias laborales, autogestión, inteligencia emocional y resiliencia.',
      completed: progress.pvc.pvc2,
      tag: '4° a 6° Semestre',
      event: events.find((e) => e.titulo.toUpperCase().includes('PVC II') || e.titulo.toUpperCase().includes('AHÍ LA LLEVO')),
    },
    {
      id: 'pvc-3',
      title: 'PVC III: Ya casi',
      hours: 25.0,
      description: 'Transición al mercado laboral, ética profesional, marca personal y networking estratégico.',
      completed: progress.pvc.pvc3,
      tag: '7° a 9° Semestre',
      event: events.find((e) => e.titulo.toUpperCase().includes('PVC III') || e.titulo.toUpperCase().includes('YA CASI')),
    },
  ];

  // Talleres Extracurriculares asistidos
  const attendedExtraTalleres = studentAtts
    .filter((a) => {
      const ev = a.event || eventsMap.get(a.event_id);
      return ev?.categoria === 'Taller Extracurricular' && a.status === 'asistio';
    })
    .map((a) => ({
      attendance: a,
      event: a.event || eventsMap.get(a.event_id)!,
    }))
    .filter((x) => x.event);

  // Taller de Liderazgo asistido
  const attendedLiderazgo = studentAtts
    .filter((a) => {
      const ev = a.event || eventsMap.get(a.event_id);
      return ev?.categoria === 'Taller Liderazgo' && a.status === 'asistio';
    })
    .map((a) => ({
      attendance: a,
      event: a.event || eventsMap.get(a.event_id)!,
    }))
    .filter((x) => x.event);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
            Requisitos Formativos Obligatorios UNIPAZ
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
          Plan de Vida y Carrera (PVC) & Talleres Obligatorios
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Para titularte en UNIPAZ debes acreditar los 3 módulos secuenciales de <strong>Plan de Vida y Carrera (75h)</strong>, <strong>3 Talleres Extracurriculares (50h)</strong> y <strong>1 Taller de Liderazgo Social (10h)</strong>. Puedes continuar cursando talleres adicionales por interés formativo, aunque hayan completado su cupo de horas reglamentarias.
        </p>

        {/* Resumen Global de Avance de Requisitos */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs flex items-center gap-1">
              <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Plan de Vida y Carrera:
            </span>
            <div className="text-base font-black text-unipaz-navy dark:text-white">
              {progress.pvc.horas.toFixed(1)} / 75.0 hrs
            </div>
            <div className={`text-[11px] font-bold ${progress.pvc.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {progress.pvc.cumplido ? '✓ PVC I, II, III Acreditados' : 'En proceso formativo'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-unipaz-orange" />
              Talleres Extracurriculares:
            </span>
            <div className="text-base font-black text-unipaz-navy dark:text-white">
              {progress.talleresExtracurriculares.completados}/3 ({progress.talleresExtracurriculares.horas.toFixed(1)}h de 50h)
            </div>
            <div className={`text-[11px] font-bold ${progress.talleresExtracurriculares.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {progress.talleresExtracurriculares.cumplido ? '✓ Requisito de 3 Talleres Cumplido' : `Faltan ${3 - progress.talleresExtracurriculares.completados} taller(es)`}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Taller de Liderazgo:
            </span>
            <div className="text-base font-black text-unipaz-navy dark:text-white">
              {progress.tallerLiderazgo.completados}/1 ({progress.tallerLiderazgo.horas.toFixed(1)}h de 10h)
            </div>
            <div className={`text-[11px] font-bold ${progress.tallerLiderazgo.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {progress.tallerLiderazgo.cumplido ? '✓ Taller de Liderazgo Cumplido' : 'Pendiente de cursar'}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: LOS 3 MÓDULOS DE PLAN DE VIDA Y CARRERA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              1. Módulos de Plan de Vida y Carrera (PVC)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              3 etapas obligatorias impartidas por el área de Orientación y Tutoría (25 hrs cada módulo):
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pvcModules.map((m) => {
            const att = m.event ? studentAtts.find((a) => a.event_id === m.event?.id && a.status === 'asistio') : undefined;

            return (
              <div
                key={m.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  m.completed
                    ? 'bg-white dark:bg-slate-900/80 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'
                }`}
              >
                <div>
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

                  <h3 className="text-base font-black text-unipaz-navy dark:text-white mt-4">{m.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{m.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Valor Curricular:</span>
                    <span className="font-mono font-black text-unipaz-navy dark:text-white">+{m.hours.toFixed(2)} hrs</span>
                  </div>

                  {/* Botón de Constancia de Taller si está Acreditado */}
                  {m.completed && m.event && (
                    <button
                      onClick={() => {
                        setSelectedCertEvent({
                          event: m.event!,
                          attendance: att || {
                            id: `att-pvc-${m.id}`,
                            student_id: currentUser.id,
                            event_id: m.event!.id,
                            status: 'asistio',
                            rol_participacion: 'asistente',
                            horas_acreditadas: 25.0,
                          },
                        });
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-unipaz-navy dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-white/10"
                    >
                      <Award className="w-3.5 h-3.5 text-unipaz-orange" />
                      Descargar Constancia PVC en PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 2: TALLERES EXTRACURRICULARES (3 OBLIGATORIOS · 50 HRS MÁX) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-unipaz-orange" />
                2. Talleres Extracurriculares (Deportivos, Culturales y Sociales)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/10">
                {progress.talleresExtracurriculares.completados} de 3 Acreditados
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requisito de 3 talleres (16.67 hrs c/u = 50.00 hrs totales).
            </p>
          </div>

          <Link
            href="/estudiante/eventos"
            className="py-2.5 px-4 rounded-full bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Inscribirme a Talleres
          </Link>
        </div>

        {/* Nota Normativa sobre límite de talleres */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-unipaz-cobalt dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Reglamento PFI:</strong> Los primeros 3 talleres extracurriculares acreditan un total de <strong>50.00 horas reglamentarias</strong>. Si cursas talleres adicionales, se registrarán en tu expediente y podrás obtener sus constancias individuales de participación, pero ya no sumarán horas adicionales al total de titulación.
          </p>
        </div>

        {/* Lista de Talleres Acreditados por el Estudiante */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Tus Talleres Extracurriculares Cursados y Constancias:
          </h4>

          {attendedExtraTalleres.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Aún no has acreditado talleres extracurriculares.
              </p>
              <Link
                href="/estudiante/eventos"
                className="inline-block text-xs font-bold text-unipaz-orange hover:underline"
              >
                Ver talleres disponibles en el catálogo →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendedExtraTalleres.map(({ event: ev, attendance: att }, idx) => {
                const isWithinCap = idx < 3;

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-3 hover:border-unipaz-orange/40 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30">
                          {isWithinCap ? `Taller Oficial #${idx + 1}` : `Taller Adicional #${idx + 1}`}
                        </span>
                        <span className="font-mono text-xs font-black text-unipaz-navy dark:text-white">
                          {isWithinCap ? '+16.67 hrs PFI' : '+0.00 hrs extra'}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-unipaz-navy dark:text-white mt-2">
                        {ev.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ev.fecha_evento} · {ev.modalidad} · {ev.ubicacion || 'Campus'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCertEvent({ event: ev, attendance: att })}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-unipaz-navy dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-white/10 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-unipaz-orange" />
                      Descargar Constancia de este Taller en PDF
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: TALLER DE LIDERAZGO SOCIAL (1 OBLIGATORIO · 10 HRS MÁX) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                3. Taller de Liderazgo Social y Equidad
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/10">
                {progress.tallerLiderazgo.completados}/1 Acreditado
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requisito de 1 taller con valor de 10.00 horas reglamentarias (perspectiva de género, inclusión y derechos).
            </p>
          </div>
        </div>

        {attendedLiderazgo.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Aún no has cursado tu taller de liderazgo obligatorio.
            </p>
            <Link
              href="/estudiante/eventos"
              className="inline-block text-xs font-bold text-unipaz-orange hover:underline"
            >
              Inscribirme al próximo taller de liderazgo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendedLiderazgo.map(({ event: ev, attendance: att }) => (
              <div
                key={att.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30">
                      ✓ Acreditado
                    </span>
                    <span className="font-mono text-xs font-black text-unipaz-navy dark:text-white">
                      +10.00 hrs PFI
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-unipaz-navy dark:text-white mt-2">
                    {ev.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {ev.fecha_evento} · {ev.ubicacion || 'Campus UNIPAZ'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCertEvent({ event: ev, attendance: att })}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-unipaz-navy dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-white/10 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-unipaz-orange" />
                  Descargar Constancia de Liderazgo en PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Constancia Individual de Taller */}
      {selectedCertEvent && (
        <WorkshopCertificatePdfModal
          student={currentUser}
          event={selectedCertEvent.event}
          attendance={selectedCertEvent.attendance}
          isOpen={Boolean(selectedCertEvent)}
          onClose={() => setSelectedCertEvent(null)}
        />
      )}
    </div>
  );
}
