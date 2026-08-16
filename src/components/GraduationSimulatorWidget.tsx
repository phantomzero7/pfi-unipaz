'use client';

import React, { useState } from 'react';
import {
  Award,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Plus,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { PFIProgressSummary } from '@/lib/types';

interface GraduationSimulatorWidgetProps {
  progress: PFIProgressSummary;
}

export const GraduationSimulatorWidget: React.FC<GraduationSimulatorWidgetProps> = ({
  progress,
}) => {
  const [extraSimposios, setExtraSimposios] = useState(0);
  const [extraTalleres, setExtraTalleres] = useState(0);
  const [extraStaff, setExtraStaff] = useState(0);
  const [extraJornadas, setExtraJornadas] = useState(0);
  const [extraInvestigacion, setExtraInvestigacion] = useState(0);

  const baseHours = progress.horasTotales;
  const simulatedExtraHours =
    extraSimposios * 5.56 +
    extraTalleres * 16.67 +
    extraStaff * 10.0 +
    extraJornadas * 5.0 +
    extraInvestigacion * 100.0;

  const totalSimulated = Math.round((baseHours + simulatedExtraHours) * 100) / 100;
  const hoursNeededForGraduation = Math.max(0, 400 - totalSimulated);
  const hoursNeededForSobresaliente = Math.max(0, 730 - totalSimulated);

  const resetSimulation = () => {
    setExtraSimposios(0);
    setExtraTalleres(0);
    setExtraStaff(0);
    setExtraJornadas(0);
    setExtraInvestigacion(0);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-orange-950/20 border border-slate-200/90 dark:border-white/10 p-6 shadow-sm dark:shadow-xl space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-unipaz-orange/15 text-unipaz-orange">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-unipaz-navy dark:text-white">
              Simulador Interactivo de Graduación PFI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proyecta cómo alcanzar tus 400.00 hrs sumando futuras actividades formativas.
            </p>
          </div>
        </div>

        {simulatedExtraHours > 0 && (
          <button
            onClick={resetSimulation}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        )}
      </div>

      {/* Métricas Simuladas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Horas Proyectadas</span>
          <div className="text-xl font-black text-unipaz-orange font-mono">
            {totalSimulated.toFixed(2)} hrs
          </div>
          <span className="text-[10px] text-slate-500">
            (Actuales: {baseHours.toFixed(2)}h + Simuladas: +{simulatedExtraHours.toFixed(2)}h)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Faltante para Titulación (400h)</span>
          <div className={`text-xl font-black font-mono ${hoursNeededForGraduation === 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
            {hoursNeededForGraduation === 0 ? '¡META CUMPLIDA! 🎉' : `${hoursNeededForGraduation.toFixed(2)} hrs`}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalSimulated / 400) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Para Sobresaliente (730h)</span>
          <div className="text-xl font-black text-amber-500 font-mono">
            {hoursNeededForSobresaliente === 0 ? '¡SOBRESALIENTE! 🏆' : `${hoursNeededForSobresaliente.toFixed(2)} hrs`}
          </div>
          <span className="text-[10px] text-slate-500">Mérito de Excelencia PFI UNIPAZ</span>
        </div>
      </div>

      {/* Controles de Simulación de Actividades */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 text-xs">
        {/* Simposios */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <span className="font-bold block text-slate-800 dark:text-white">Simposio / Congreso</span>
            <span className="text-[10px] text-unipaz-orange font-mono font-bold">+5.56 hrs c/u</span>
          </div>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setExtraSimposios(Math.max(0, extraSimposios - 1))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 font-black shadow-sm"
            >
              -
            </button>
            <span className="font-bold font-mono">{extraSimposios}</span>
            <button
              onClick={() => setExtraSimposios(extraSimposios + 1)}
              className="w-6 h-6 rounded-lg bg-unipaz-orange text-white font-black shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Talleres Extracurriculares */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <span className="font-bold block text-slate-800 dark:text-white">Taller Extracurricular</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">+16.67 hrs c/u</span>
          </div>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setExtraTalleres(Math.max(0, extraTalleres - 1))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 font-black shadow-sm"
            >
              -
            </button>
            <span className="font-bold font-mono">{extraTalleres}</span>
            <button
              onClick={() => setExtraTalleres(extraTalleres + 1)}
              className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Staff Logístico */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <span className="font-bold block text-slate-800 dark:text-white">Staff Logístico</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">+10.00 hrs c/u</span>
          </div>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setExtraStaff(Math.max(0, extraStaff - 1))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 font-black shadow-sm"
            >
              -
            </button>
            <span className="font-bold font-mono">{extraStaff}</span>
            <button
              onClick={() => setExtraStaff(extraStaff + 1)}
              className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Jornadas Sociales */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <span className="font-bold block text-slate-800 dark:text-white">Jornada Social / Feria</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">+5.00 hrs c/u</span>
          </div>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setExtraJornadas(Math.max(0, extraJornadas - 1))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 font-black shadow-sm"
            >
              -
            </button>
            <span className="font-bold font-mono">{extraJornadas}</span>
            <button
              onClick={() => setExtraJornadas(extraJornadas + 1)}
              className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Investigación / Artículo */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1">
          <div>
            <span className="font-bold block text-slate-800 dark:text-white">Investigación / Ponencia</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">+100.0 hrs</span>
          </div>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setExtraInvestigacion(Math.max(0, extraInvestigacion - 1))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 font-black shadow-sm"
            >
              -
            </button>
            <span className="font-bold font-mono">{extraInvestigacion}</span>
            <button
              onClick={() => setExtraInvestigacion(extraInvestigacion + 1)}
              className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black shadow-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
