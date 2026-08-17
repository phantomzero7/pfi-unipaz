'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  GraduationCap,
  Percent,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ScholarshipRenewalDictamenModal } from './ScholarshipRenewalDictamenModal';
import { ScholarshipProgressSummary, UserProfile } from '@/lib/types';

interface ScholarshipProgressWidgetProps {
  student: UserProfile;
  scholarshipProgress: ScholarshipProgressSummary;
}

export const ScholarshipProgressWidget: React.FC<ScholarshipProgressWidgetProps> = ({
  student,
  scholarshipProgress,
}) => {
  const [showDictamenModal, setShowDictamenModal] = useState(false);

  if (!student.tiene_beca) return null;

  const {
    tipoBeca,
    porcentajeBeca,
    promedioAcademico,
    puntosTotales,
    puntosMeta,
    porcentajeCumplimiento,
    estatus,
    estatusTexto,
    isAcreditadoBeca,
    actividadesBecadas,
  } = scholarshipProgress;

  const puntosRestantes = Math.max(0, puntosMeta - puntosTotales);

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 dark:from-amber-950/30 dark:via-slate-900/80 dark:to-orange-950/20 border border-amber-300/80 dark:border-amber-500/30 p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
        {/* Accent top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-unipaz-orange to-unipaz-gold" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-orange text-slate-950 shadow-md shadow-orange-500/20">
              <GraduationCap className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300/60">
                  Estudiante Becario UNIPAZ
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  {porcentajeBeca}% Descuento
                </span>
                {promedioAcademico > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    Promedio: {promedioAcademico.toFixed(2)}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-unipaz-navy dark:text-white mt-1">
                {tipoBeca}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowDictamenModal(true)}
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 self-start sm:self-auto"
          >
            <FileCheck className="w-4 h-4 text-unipaz-orange" />
            Ver Dictamen de Beca
          </button>
        </div>

        {/* Tacómetro / Indicador Circular SVG Interactivo hacia los 1,000 Puntos */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/80 dark:border-white/10 shadow-unipaz-soft flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Tacómetro SVG Radial */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Círculo de fondo (Track) */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800/80"
              />
              {/* Arco de Progreso con Gradiente */}
              <circle
                cx="80"
                cy="80"
                r="64"
                strokeWidth="12"
                strokeDasharray={402.12}
                strokeDashoffset={402.12 - (402.12 * Math.min(100, porcentajeCumplimiento)) / 100}
                strokeLinecap="round"
                fill="transparent"
                stroke={
                  isAcreditadoBeca
                    ? '#10B981'
                    : puntosTotales >= 500
                    ? '#FF5500'
                    : '#EF4444'
                }
                className="transition-all duration-1000 ease-out drop-shadow-unipaz-halo-gold"
              />
            </svg>

            {/* Centro del Tacómetro */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Acumulado
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-unipaz-navy dark:text-white font-mono tracking-tight">
                  {puntosTotales}
                </span>
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-full mt-0.5 ${
                  isAcreditadoBeca
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : puntosTotales >= 500
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                }`}
              >
                {porcentajeCumplimiento}% de la Meta
              </span>
            </div>
          </div>

          {/* Información y Desglose Estratégico */}
          <div className="flex-1 space-y-4 text-xs w-full">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-slate-400 text-[11px] uppercase font-bold block">
                  Meta Cuatrimestral Obligatoria
                </span>
                <span className="text-base font-black text-unipaz-navy dark:text-white font-mono">
                  1,000 Puntos Formativos
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[11px] uppercase font-bold block">
                  Puntos Restantes
                </span>
                <span
                  className={`text-base font-black font-mono ${
                    isAcreditadoBeca ? 'text-emerald-600 dark:text-emerald-400' : 'text-unipaz-orange'
                  }`}
                >
                  {isAcreditadoBeca ? '¡0 pts (Completado!)' : `${puntosRestantes} pts`}
                </span>
              </div>
            </div>

            {/* Estado Semafórico */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                isAcreditadoBeca
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : puntosTotales >= 500
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {isAcreditadoBeca ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : puntosTotales >= 500 ? (
                <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div className="text-[11px] leading-relaxed">
                {isAcreditadoBeca
                  ? '¡Excelente! Has alcanzado los 1,000 puntos reglamentarios. Tu dictamen oficial de renovación está listo para ser descargado y entregado al Comité de Becas.'
                  : puntosTotales >= 500
                  ? `Llevas un buen ritmo cuatrimestral. Te restan ${puntosRestantes} puntos para garantizar el refrendo del ${porcentajeBeca}% de descuento en tu colegiatura.`
                  : `Atención: Acumulas menos de 500 puntos. Inscríbete en simposios, talleres extracurriculares o como staff logístico para alcanzar la meta antes del cierre de actas.`}
              </div>
            </div>

            {/* Rangos de Puntos por Actividad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                <span className="text-slate-400 block">Investigación</span>
                <strong className="text-unipaz-navy dark:text-white font-mono font-bold">+500 pts</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                <span className="text-slate-400 block">Club Anual</span>
                <strong className="text-unipaz-navy dark:text-white font-mono font-bold">+300 pts</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                <span className="text-slate-400 block">PVC / Talleres</span>
                <strong className="text-unipaz-navy dark:text-white font-mono font-bold">+200-250 pts</strong>
              </div>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20">
                <span className="text-purple-700 dark:text-purple-300 block">Staff Logístico</span>
                <strong className="text-purple-800 dark:text-purple-300 font-mono font-bold">+100 pts Extra</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Actividades Becadas Recientes */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Historial de Puntos Acreditados ({actividadesBecadas.length}):
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total: +{puntosTotales} pts
            </span>
          </div>

          {actividadesBecadas.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500">
              Aún no tienes actividades formativas con puntos acreditados este cuatrimestre. ¡Inscríbete a talleres, simposios o staff para comenzar a sumar!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {actividadesBecadas.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-unipaz-navy dark:text-white block truncate">
                      {act.titulo}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {act.fecha} · {act.categoria}
                    </span>
                  </div>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs flex-shrink-0 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    +{act.puntosAcreditados} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dictamen */}
      {showDictamenModal && (
        <ScholarshipRenewalDictamenModal
          isOpen={showDictamenModal}
          onClose={() => setShowDictamenModal(false)}
          student={student}
          scholarshipProgress={scholarshipProgress}
        />
      )}
    </>
  );
};
