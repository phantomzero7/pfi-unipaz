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

        {/* Barra de Progreso hacia los 1,000 Puntos */}
        <div className="space-y-3 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/80 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-unipaz-orange" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Meta Cuatrimestral de Renovación:
              </span>
              <strong className="font-mono font-black text-amber-600 dark:text-amber-400">
                1,000 Puntos
              </strong>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-500 text-[11px]">Acumulado:</span>
              <span className="text-base font-black text-unipaz-navy dark:text-white">
                {puntosTotales} <span className="text-xs text-slate-400">/ 1,000 pts</span>
              </span>
              <span className="text-xs font-black text-unipaz-orange">
                ({porcentajeCumplimiento}%)
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/5 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isAcreditadoBeca
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : puntosTotales >= 500
                  ? 'bg-gradient-to-r from-amber-400 to-unipaz-orange'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, porcentajeCumplimiento))}%` }}
            />
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              {isAcreditadoBeca ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ¡Felicidades! Meta alcanzada. Tu beca está lista para renovarse.
                </span>
              ) : puntosTotales >= 500 ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  Llevas buen avance. Te faltan {puntosRestantes} puntos para el 100%.
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alerta: Acumulas menos de 500 pts. Inscríbete a más actividades para asegurar tu beca.
                </span>
              )}
            </div>

            <span className="font-mono text-slate-400 text-[10px] hidden sm:inline">
              Mínimo 50 - Máx 500 pts por evento
            </span>
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
