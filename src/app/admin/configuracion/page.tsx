'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventCategory } from '@/lib/types';

export default function AdminConfiguracionPage() {
  const {
    pfiConfig,
    updateGlobalConfig,
    events,
    profiles,
    assignEventToStudent,
    batchAssignPVCByCohort,
    getStudentProgress,
  } = usePFI();

  const [localHours, setLocalHours] = useState<Record<EventCategory, number>>({
    ...pfiConfig.categoriaHoras,
  });
  const [minHours, setMinHours] = useState<number>(pfiConfig.horasMinimasTitulacion);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados para Asignación Directa Individual
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    profiles.find((p) => p.role === 'estudiante')?.id || ''
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isSpecialCase, setIsSpecialCase] = useState<boolean>(false);
  const [directAssignResult, setDirectAssignResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Estados para Asignación Masiva
  const [batchResult, setBatchResult] = useState<{
    title: string;
    assigned: number;
    skipped: number;
  } | null>(null);

  const students = profiles.filter((p) => p.role === 'estudiante');

  const categories: { key: EventCategory; label: string; desc: string }[] = [
    { key: 'PVC', label: 'Plan de Vida y Carrera (PVC I, II, III)', desc: 'Módulos obligatorios (25.00 hrs c/u = 75.00 hrs totales)' },
    { key: 'Taller Extracurricular', label: 'Talleres Extracurriculares', desc: 'Deportivos, culturales y sociales (16.67 hrs c/u = 50.00 hrs máx)' },
    { key: 'Taller Liderazgo', label: 'Taller de Liderazgo Social', desc: 'Inclusión, equidad y derechos (10.00 hrs máx)' },
    { key: 'Investigación', label: 'Investigación y Ponencias', desc: 'Artículos científicos y proyectos arbitrados (100.00 hrs)' },
    { key: 'Club Anual', label: 'Clubes Universitarios Anuales', desc: 'Debate, lectura y actividades anuales (33.34 hrs)' },
    { key: 'Simposio', label: 'Simposios y Congresos', desc: 'Congresos académicos y foros magistrales (5.56 hrs)' },
    { key: 'Jornada Social', label: 'Jornadas Sociales y Ferias', desc: 'Brigadas comunitarias y de salud (5.00 hrs)' },
    { key: 'Cine Club', label: 'Cine Club / Café Literario', desc: 'Círculos de lectura y cine debate (2.50 hrs)' },
    { key: 'Foro', label: 'Foros y Conferencias', desc: 'Pláticas de bienestar y salud (2.00 hrs)' },
    { key: 'Campaña', label: 'Campañas de Voluntariado', desc: 'Colectas, reforestación y desfiles (1.00 hr)' },
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalConfig({
      horasMinimasTitulacion: minHours,
      categoriaHoras: localHours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDirectAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const res = assignEventToStudent(selectedEventId, selectedStudentId, isSpecialCase);
    setDirectAssignResult(res);
    setTimeout(() => setDirectAssignResult(null), 5000);
  };

  const handleBatchPVC = (level: 1 | 2 | 3) => {
    const res = batchAssignPVCByCohort(level);
    if (!res.targetEvent) {
      alert(`No se encontró el evento correspondiente a PVC ${level}.`);
      return;
    }
    setBatchResult({
      title: `PVC ${level}: ${res.targetEvent.titulo}`,
      assigned: res.assignedCount,
      skipped: res.skippedAlreadyPassed,
    });
    setTimeout(() => setBatchResult(null), 6000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
            Administración Central PFI
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
          Configurador Global PFI & Asignación de Cohortes
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Define los valores de horas oficiales por categoría, asigna automáticamente los módulos obligatorios de Plan de Vida y Carrera por cuatrimestre y gestiona casos especiales.
        </p>
      </div>

      {/* SECCIÓN 1: ASIGNACIÓN PROGRAMADA / AUTOMÁTICA DE PVC POR COHORTE */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              1. Programación y Auto-Asignación de PVC por Cuatrimestre
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Los módulos de PVC se asignan según la etapa formativa del estudiante. Si un estudiante ya lo acreditó, el sistema omite la duplicación automáticamente.
            </p>
          </div>
        </div>

        {/* Notificación de Asignación Masiva */}
        {batchResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs font-semibold">
              <p className="font-black text-sm">{batchResult.title}</p>
              <p>
                ✓ Asignado a <strong>{batchResult.assigned} estudiantes</strong>.
                {batchResult.skipped > 0 && ` · (${batchResult.skipped} estudiantes omitidos porque ya lo tenían acreditado).`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PVC 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30">
                1° a 3° Cuatrimestre (1er Año)
              </span>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
                PVC I: Iniciando mis sueños
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Asignación obligatoria a estudiantes de nuevo ingreso. Una vez cursado y acreditado no se vuelve a generar.
              </p>
            </div>

            <button
              onClick={() => handleBatchPVC(1)}
              className="w-full py-2.5 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-Asignar PVC I a Generación
            </button>
          </div>

          {/* PVC 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30">
                4° a 6° Cuatrimestre (2do Año)
              </span>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
                PVC II: Ahí la llevo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Habilidades profesionales intermedias y autogestión.
              </p>
            </div>

            <button
              onClick={() => handleBatchPVC(2)}
              className="w-full py-2.5 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-Asignar PVC II a Generación
            </button>
          </div>

          {/* PVC 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-400/30">
                7° a 9° Cuatrimestre (3er Año / Egreso)
              </span>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
                PVC III: Ya casi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Inserción laboral, ética profesional y proyecto de titulación.
              </p>
            </div>

            <button
              onClick={() => handleBatchPVC(3)}
              className="w-full py-2.5 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-Asignar PVC III a Generación
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: ASIGNACIÓN DIRECTA INDIVIDUAL & CASOS ESPECIALES */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-unipaz-orange" />
            2. Asignación Directa a Estudiante & Gestión de Casos Especiales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Asigna manualmente una actividad formativa o autoriza el recursamiento de un PVC como caso especial:
          </p>
        </div>

        {directAssignResult && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
              directAssignResult.success
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            {directAssignResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <p>{directAssignResult.message}</p>
          </div>
        )}

        <form onSubmit={handleDirectAssign} className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
          <div className="sm:col-span-4">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Seleccionar Estudiante:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-unipaz-orange"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.apellidos} ({s.matricula}) - {s.carrera}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Actividad / Taller a Asignar:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-unipaz-orange"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.titulo} ({ev.categoria} · {ev.horas_pfi}h)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isSpecialCase}
                onChange={(e) => setIsSpecialCase(e.target.checked)}
                className="w-4 h-4 rounded text-unipaz-orange focus:ring-unipaz-orange"
              />
              Autorizar Caso Especial (Recursamiento)
            </label>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-unipaz-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-all text-xs"
            >
              Asignar Actividad Directa
            </button>
          </div>
        </form>
      </section>

      {/* SECCIÓN 3: CONFIGURADOR GLOBAL DE HORAS PREESTABLECIDAS POR CATEGORÍA */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-unipaz-cobalt" />
              3. Catálogo Oficial de Horas por Categoría PFI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Al dar de alta nuevos eventos, el sistema fija automáticamente las horas reglamentarias según este catálogo.
            </p>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Parámetros guardados
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div
                key={c.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-unipaz-navy dark:text-white">{c.label}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{c.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={localHours[c.key] ?? 10}
                    onChange={(e) =>
                      setLocalHours({
                        ...localHours,
                        [c.key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono font-bold text-unipaz-orange focus:outline-none focus:border-unipaz-orange"
                  />
                  <span className="text-xs font-bold text-slate-500">hrs</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-full bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración Global de Horas
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
