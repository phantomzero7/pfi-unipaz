'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
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
            className={`py-2.5 px-4 rounded-2xl border font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 self-start sm:self-auto ${
              student.refrendo_beca_aprobado_admin
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-unipaz-orange" />
            {student.refrendo_beca_aprobado_admin ? 'Ver Dictamen Aprobado' : 'Estado de Refrendo Cuatrimestral'}
          </button>
        </div>

        {/* ALERTA ESPECIAL PARA BECADOS DEPARTAMENTALES (Biblioteca, INDE, DEDU) */}
        {scholarshipProgress.esBecarioDepartamental && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-950 dark:text-blue-200">
                    Beca de Apoyo Departamental: {scholarshipProgress.departamentoBeca || 'Departamento Asignado'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                    {student.horas_departamentales_semanales || 10} hrs / semana
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {scholarshipProgress.cumplimientoDepartamentalAcreditado
                    ? '✓ Horas de labor departamental concluidas. Los 1,000 puntos cuatrimestrales han sido acreditados a tu expediente.'
                    : 'Horas de apoyo cuatrimestral en curso. Al concluir el periodo y validarse por la jefatura departamental, se otorgarán los 1,000 puntos correspondientes.'}
                </p>
              </div>
            </div>

            {scholarshipProgress.cumplimientoDepartamentalAcreditado ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] flex-shrink-0 flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1,000 Pts Acreditados
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] flex-shrink-0 flex items-center gap-1 shadow-sm">
                <Clock className="w-3.5 h-3.5" /> En Servicio Activo
              </span>
            )}
          </div>
        )}

        {/* Tacómetro / Indicador Circular SVG Interactivo hacia los 1,000 Puntos Cuatrimestrales */}
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
                Puntos Cuatrimestrales
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
                  Puntos Restantes en el Periodo
                </span>
                <span
                  className={`text-base font-black font-mono ${
                    isAcreditadoBeca ? 'text-emerald-600 dark:text-emerald-400' : 'text-unipaz-orange'
                  }`}
                >
                  {isAcreditadoBeca ? '0 pts (Meta Cuatrimestral Lograda)' : `${puntosRestantes} pts`}
                </span>
              </div>
            </div>

            {/* Estado Semafórico con Aclaración Normativa */}
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                student.refrendo_beca_aprobado_admin
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : isAcreditadoBeca
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
                  : puntosTotales >= 500
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {student.refrendo_beca_aprobado_admin ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : isAcreditadoBeca ? (
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : puntosTotales >= 500 ? (
                <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">
                {student.refrendo_beca_aprobado_admin
                  ? `✓ Dictamen de Renovación Cuatrimestral Aprobado por la Administración. Has cumplido los 1,000 puntos, promedio mínimo, pagos al corriente y refrendo de beca.`
                  : isAcreditadoBeca
                  ? `¡Meta de 1,000 puntos cuatrimestrales completada! El cumplimiento de puntos es uno de los requisitos del Reglamento de Becas. La Administración revisará tu expediente (promedio normativo, 0 materias reprobadas ni exámenes extraordinarios, pagos en tiempo y forma, entrega de refrendo de beca y conducta) para emitir la resolución oficial de renovación al cierre del ciclo.`
                  : puntosTotales >= 500
                  ? `Llevas un buen ritmo cuatrimestral. Te restan ${puntosRestantes} puntos para completar la meta formativa del periodo para el refrendo del ${porcentajeBeca}% de descuento.`
                  : `Atención: Acumulas ${puntosTotales} de los 1,000 puntos cuatrimestrales. Inscríbete en talleres extracurriculares, conferencias o como staff para alcanzar la meta antes del término del periodo.`}
              </div>
            </div>

            {/* Checklist Normativo de Renovación Cuatrimestral */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Criterios Reglamentarios para Renovación Cuatrimestral:
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Revisión por Administración
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className={isAcreditadoBeca ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                    {isAcreditadoBeca ? '✓' : '○'}
                  </span>
                  <span>1,000 Puntos Formativos Cuatrimestrales ({puntosTotales}/1,000)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-blue-500 font-bold">ℹ</span>
                  <span>Promedio mín. {student.tipo_beca?.includes('Excelencia') ? '9.0' : '8.0'} (0 Reprobaciones / Extraordinarios)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-blue-500 font-bold">ℹ</span>
                  <span>Colegiaturas y Pagos en Tiempo y Forma</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className={student.informe_becario_entregado ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                    {student.informe_becario_entregado ? '✓' : '○'}
                  </span>
                  <span>Entrega de Solicitud de Refrendo / Informe de Becario</span>
                </div>
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
