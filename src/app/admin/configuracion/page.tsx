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
  Edit3,
  FileCheck,
  FileText,
  Layers,
  Lock,
  PenTool,
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
import { EventCategory, PFIGlobalSignatures } from '@/lib/types';

export default function AdminConfiguracionPage() {
  const {
    pfiConfig,
    updateGlobalConfig,
    events,
    profiles,
    assignEventToStudent,
    batchAssignPVCByCohort,
  } = usePFI();

  const [localHours, setLocalHours] = useState<Record<EventCategory, number>>({
    ...pfiConfig.categoriaHoras,
  });
  const [minHours, setMinHours] = useState<number>(pfiConfig.horasMinimasTitulacion);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados para Firmantes de Constancias
  const [localSignatures, setLocalSignatures] = useState<PFIGlobalSignatures>({
    ...pfiConfig.firmas,
  });
  const [savedSignaturesSuccess, setSavedSignaturesSuccess] = useState(false);

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

  const handleSaveHoursConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalConfig({
      horasMinimasTitulacion: minHours,
      categoriaHoras: localHours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveSignatures = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalConfig({
      firmas: localSignatures,
    });
    setSavedSignaturesSuccess(true);
    setTimeout(() => setSavedSignaturesSuccess(false), 3000);
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
          Configuración Global PFI & Emisión de Constancias
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Configura quién firma las constancias oficiales (General, PVC, Talleres o Actividades), define los valores de horas oficiales por categoría y asigna actividades por cohorte.
        </p>
      </div>

      {/* SECCIÓN 1: CONFIGURADOR DE FIRMAS INSTITUCIONALES EN CONSTANCIAS */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <PenTool className="w-5 h-5 text-unipaz-orange" />
              1. Firmantes Oficiales de Constancias (General, PVC, Talleres y Actividades)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personaliza los nombres y cargos de las autoridades que aparecerán al pie de cada tipo de constancia PDF:
            </p>
          </div>

          {savedSignaturesSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Firmas actualizadas
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSignatures} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Constancia General de Titulación (400 hrs) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-unipaz-navy text-white text-[10px] font-black">400h</span>
                <h4 className="text-xs font-black text-unipaz-navy dark:text-white">
                  Constancia General de Titulación PFI
                </h4>
              </div>

              {/* Firma 1 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Izquierda (Firma 1):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.general.firma1.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      general: {
                        ...localSignatures.general,
                        firma1: { ...localSignatures.general.firma1, nombre: e.target.value },
                      },
                    })
                  }
                  placeholder="Nombre de la autoridad"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.general.firma1.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      general: {
                        ...localSignatures.general,
                        firma1: { ...localSignatures.general.firma1, cargo: e.target.value },
                      },
                    })
                  }
                  placeholder="Cargo o departamento"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>

              {/* Firma 2 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Derecha (Firma 2):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.general.firma2.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      general: {
                        ...localSignatures.general,
                        firma2: { ...localSignatures.general.firma2, nombre: e.target.value },
                      },
                    })
                  }
                  placeholder="Nombre de la autoridad"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.general.firma2.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      general: {
                        ...localSignatures.general,
                        firma2: { ...localSignatures.general.firma2, cargo: e.target.value },
                      },
                    })
                  }
                  placeholder="Cargo o departamento"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>
            </div>

            {/* 2. Constancias de Plan de Vida y Carrera (PVC) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-black">PVC</span>
                <h4 className="text-xs font-black text-unipaz-navy dark:text-white">
                  Constancias de Plan de Vida y Carrera (PVC I, II, III)
                </h4>
              </div>

              {/* Firma 1 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Izquierda (Firma 1):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.pvc.firma1.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      pvc: {
                        ...localSignatures.pvc,
                        firma1: { ...localSignatures.pvc.firma1, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.pvc.firma1.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      pvc: {
                        ...localSignatures.pvc,
                        firma1: { ...localSignatures.pvc.firma1, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>

              {/* Firma 2 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Derecha (Tutor / Orientador PVC):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.pvc.firma2.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      pvc: {
                        ...localSignatures.pvc,
                        firma2: { ...localSignatures.pvc.firma2, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.pvc.firma2.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      pvc: {
                        ...localSignatures.pvc,
                        firma2: { ...localSignatures.pvc.firma2, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>
            </div>

            {/* 3. Constancias de Talleres Extracurriculares & Liderazgo */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-unipaz-orange text-white text-[10px] font-black">Talleres</span>
                <h4 className="text-xs font-black text-unipaz-navy dark:text-white">
                  Constancias de Talleres Extracurriculares y Liderazgo
                </h4>
              </div>

              {/* Firma 1 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Izquierda (Coordinación PFI):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.talleres.firma1.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      talleres: {
                        ...localSignatures.talleres,
                        firma1: { ...localSignatures.talleres.firma1, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.talleres.firma1.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      talleres: {
                        ...localSignatures.talleres,
                        firma1: { ...localSignatures.talleres.firma1, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>

              {/* Firma 2 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Derecha (Instructor Titular / Facilitador):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.talleres.firma2.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      talleres: {
                        ...localSignatures.talleres,
                        firma2: { ...localSignatures.talleres.firma2, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.talleres.firma2.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      talleres: {
                        ...localSignatures.talleres,
                        firma2: { ...localSignatures.talleres.firma2, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>
            </div>

            {/* 4. Constancias de Actividades Especiales */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black">Actividades</span>
                <h4 className="text-xs font-black text-unipaz-navy dark:text-white">
                  Constancias de Actividades, Simposios y Congresos
                </h4>
              </div>

              {/* Firma 1 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Izquierda (Coordinación PFI):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.actividades.firma1.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      actividades: {
                        ...localSignatures.actividades,
                        firma1: { ...localSignatures.actividades.firma1, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.actividades.firma1.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      actividades: {
                        ...localSignatures.actividades,
                        firma1: { ...localSignatures.actividades.firma1, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>

              {/* Firma 2 */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Firma Derecha (Extensión Universitaria / Eventos):</span>
                <input
                  type="text"
                  required
                  value={localSignatures.actividades.firma2.nombre}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      actividades: {
                        ...localSignatures.actividades,
                        firma2: { ...localSignatures.actividades.firma2, nombre: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-unipaz-orange"
                />
                <input
                  type="text"
                  required
                  value={localSignatures.actividades.firma2.cargo}
                  onChange={(e) =>
                    setLocalSignatures({
                      ...localSignatures,
                      actividades: {
                        ...localSignatures.actividades,
                        firma2: { ...localSignatures.actividades.firma2, cargo: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-unipaz-orange"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-full bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Guardar Firmantes de Constancias
            </button>
          </div>
        </form>
      </section>

      {/* SECCIÓN 2: ASIGNACIÓN PROGRAMADA / AUTOMÁTICA DE PVC POR COHORTE */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              2. Programación y Auto-Asignación de PVC por Cuatrimestre
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

      {/* SECCIÓN 3: ASIGNACIÓN DIRECTA INDIVIDUAL & CASOS ESPECIALES */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-unipaz-orange" />
            3. Asignación Directa a Estudiante & Gestión de Casos Especiales
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

      {/* SECCIÓN 4: CONFIGURADOR GLOBAL DE HORAS PREESTABLECIDAS POR CATEGORÍA */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-unipaz-cobalt" />
              4. Catálogo Oficial de Horas por Categoría PFI
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

        <form onSubmit={handleSaveHoursConfig} className="space-y-4">
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

      {/* SECCIÓN 5: GESTIÓN DE CONVOCATORIAS, INFORMES Y ESTUDIOS DE BECAS (EXCLUSIVO ADMINISTRADOR) */}
      <section className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 dark:from-amber-950/20 dark:via-slate-900/80 dark:to-orange-950/10 border border-amber-300/80 dark:border-amber-500/30 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300/60">
                Control Escolar & Comité de Becas
              </span>
            </div>
            <h2 className="text-xl font-black text-unipaz-navy dark:text-white tracking-tight mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-unipaz-orange" />
              5. Gestión de Convocatorias, Formularios y Dictámenes de Beca
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Controla las fechas del periodo de solicitud de becas, habilita los formatos obligatorios y notifica resoluciones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Periodo de Solicitud */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400">Convocatoria</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    pfiConfig.periodo_solicitud_becas_activo
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {pfiConfig.periodo_solicitud_becas_activo ? '● ACTIVA' : '○ CERRADA'}
                </span>
              </div>
              <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                Periodo de Solicitud de Beca
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permite a los estudiantes postularse a becas y estímulos institucionales desde su portal.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Inicio:</span>
                  <input
                    type="date"
                    value={pfiConfig.fecha_inicio_solicitud_becas || '2026-09-01'}
                    onChange={(e) => updateGlobalConfig({ fecha_inicio_solicitud_becas: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cierre:</span>
                  <input
                    type="date"
                    value={pfiConfig.fecha_fin_solicitud_becas || '2026-09-25'}
                    onChange={(e) => updateGlobalConfig({ fecha_fin_solicitud_becas: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => updateGlobalConfig({ periodo_solicitud_becas_activo: !pfiConfig.periodo_solicitud_becas_activo })}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm ${
                pfiConfig.periodo_solicitud_becas_activo
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {pfiConfig.periodo_solicitud_becas_activo ? 'Cerrar Periodo de Solicitud' : 'Abrir Periodo de Solicitud'}
            </button>
          </div>

          {/* Card 2: Llenado de Informe de Becario */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400">Becarios</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    pfiConfig.informe_becario_habilitado
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {pfiConfig.informe_becario_habilitado ? '● HABILITADO' : '○ INACTIVO'}
                </span>
              </div>
              <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                Informe Cuatrimestral de Becario
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Habilita el botón de llenado del informe formativo en el portal de los alumnos becarios para la renovación de su descuento.
              </p>
            </div>

            <button
              onClick={() => updateGlobalConfig({ informe_becario_habilitado: !pfiConfig.informe_becario_habilitado })}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm ${
                pfiConfig.informe_becario_habilitado
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-unipaz-orange hover:bg-orange-600 text-white'
              }`}
            >
              {pfiConfig.informe_becario_habilitado ? 'Desactivar Formato de Informe' : 'Habilitar Botón de Informe'}
            </button>
          </div>

          {/* Card 3: Estudio Socioeconómico */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400">Trabajo Social</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    pfiConfig.estudio_socioeconomico_habilitado
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {pfiConfig.estudio_socioeconomico_habilitado ? '● HABILITADO' : '○ INACTIVO'}
                </span>
              </div>
              <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                Cédula de Estudio Socioeconómico
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Habilita el formulario digital para captura de ingresos, dependientes económicos y situación familiar de los solicitantes.
              </p>
            </div>

            <button
              onClick={() => updateGlobalConfig({ estudio_socioeconomico_habilitado: !pfiConfig.estudio_socioeconomico_habilitado })}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm ${
                pfiConfig.estudio_socioeconomico_habilitado
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-unipaz-navy hover:bg-blue-900 text-white'
              }`}
            >
              {pfiConfig.estudio_socioeconomico_habilitado ? 'Desactivar Formato Socioeconómico' : 'Habilitar Botón de Estudio'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
