'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Plus,
  QrCode,
  ScanLine,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { QrScannerModal } from '@/components/QrScannerModal';
import { usePFI } from '@/lib/store';
import { calculateStudentPFIProgress, calculateStudentScholarshipProgress } from '@/lib/pfi-rules';
import { PFIEvent } from '@/lib/types';

export default function AdminDashboardPage() {
  const { profiles, events, attendances, currentUser, pfiConfig, getStudentScholarshipProgress } = usePFI();
  const [showScanner, setShowScanner] = useState(false);

  const students = profiles.filter((p) => p.role === 'estudiante');
  const becados = students.filter((p) => p.tiene_beca);
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  // Periodos vigentes
  const activeCuatri =
    pfiConfig.periodosAcademicos?.find((p) => p.tipo === 'cuatrimestral' && p.es_actual) ||
    pfiConfig.periodosAcademicos?.find((p) => p.tipo === 'cuatrimestral') || {
      codigo: '187',
      nombre: 'Mayo - Agosto 2026',
    };

  const activeSemestral =
    pfiConfig.periodosAcademicos?.find((p) => p.tipo === 'semestral' && p.es_actual) ||
    pfiConfig.periodosAcademicos?.find((p) => p.tipo === 'semestral') || {
      codigo: '902',
      nombre: 'Febrero - Julio 2026',
    };

  // Calcular métricas institucionales
  let totalHoursAccredited = 0;
  let studentsAcreditados = 0;
  let studentsSobresaliente = 0;
  let becadosCumplidos = 0;

  const studentProgressList = students.map((std) => {
    const studentAtts = attendances.filter((a) => a.student_id === std.id);
    const prog = calculateStudentPFIProgress(studentAtts, eventsMap);
    totalHoursAccredited += prog.horasTotales;
    if (prog.isAcreditado) studentsAcreditados++;
    if (prog.escala === 'Sobresaliente') studentsSobresaliente++;

    if (std.tiene_beca) {
      const sch = getStudentScholarshipProgress(std.id);
      if (sch.isAcreditadoBeca) becadosCumplidos++;
    }

    return {
      student: std,
      progress: prog,
    };
  });

  const avgHours = students.length > 0 ? (totalHoursAccredited / students.length).toFixed(1) : '0';
  const accreditationRate = students.length > 0 ? Math.round((studentsAcreditados / students.length) * 100) : 0;
  const becasRate = becados.length > 0 ? Math.round((becadosCumplidos / becados.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-950/5 dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-unipaz-orange">
              Panel de Control PFI · UNIPAZ
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-unipaz-cobalt dark:text-blue-300 border border-blue-200 dark:border-blue-400/30 font-bold uppercase">
              {currentUser.role}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-unipaz-navy dark:text-white mt-1">
            Gestión y Analíticas Institucionales
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Supervisión de acreditaciones, regla de permanencia (80%), control de asistencias QR, becas y eventos.
          </p>

          {/* Periodos Activos */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200/70 dark:border-white/10 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-unipaz-orange" />
              <span className="text-slate-500">Cuatrimestral Vigente:</span>
              <strong className="text-unipaz-navy dark:text-white">Periodo {activeCuatri.codigo} ({activeCuatri.nombre})</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">Semestral Vigente:</span>
              <strong className="text-unipaz-navy dark:text-white">Periodo {activeSemestral.codigo} ({activeSemestral.nombre})</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowScanner(true)}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
          >
            <ScanLine className="w-4 h-4" />
            Lanzar Escáner QR
          </button>

          <Link
            href="/admin/eventos"
            className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-2 border border-slate-300 dark:border-white/10 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-unipaz-orange" />
            Crear Evento
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Estudiantes Registrados</span>
            <Users className="w-4 h-4 text-unipaz-cobalt" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{students.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total en matrícula activa</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Horas Totales PFI</span>
            <Award className="w-4 h-4 text-unipaz-orange" />
          </div>
          <div className="text-3xl font-black text-unipaz-orange dark:text-amber-400">
            {totalHoursAccredited.toFixed(0)} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">hrs</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Promedio: {avgHours} hrs / estudiante</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Acreditados (≥ 400 hrs)</span>
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{accreditationRate}%</div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
            {studentsAcreditados} de {students.length} listos para titulación
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Becarios con 1,000 pts</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{becasRate}%</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{becadosCumplidos} de {becados.length} becarios acreditados</p>
        </div>
      </div>

      {/* Grid de Acceso Rápido a Módulos Administrativos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link
          href="/admin/becas"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-orange-50/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-unipaz-orange flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-unipaz-orange">
            Gestión de Becas
          </span>
        </Link>

        <Link
          href="/admin/estudiantes"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-blue-600">
            Directorio Alumnos
          </span>
        </Link>

        <Link
          href="/admin/eventos"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-purple-50/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-purple-600">
            Eventos y Talleres
          </span>
        </Link>

        <Link
          href="/admin/informes"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-indigo-600">
            Informes y Listas
          </span>
        </Link>

        <Link
          href="/admin/importar"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-emerald-600">
            Carga Masiva 3NF
          </span>
        </Link>

        <Link
          href="/admin/configuracion"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 shadow-sm transition-all hover:scale-102 flex flex-col items-center text-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-slate-900">
            Configuración PFI
          </span>
        </Link>
      </div>

      {/* Reglas & Supervisión Operativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
          <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
            <Shield className="w-5 h-5 text-unipaz-orange" />
            <span>Regla del 80% de Permanencia</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            El sistema valida automáticamente que el estudiante registre Check-In y Check-Out cumpliendo al menos el 80% de la duración nominal de cada día para conceder las horas PFI correspondientes.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
          <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Puntos de Beca (Meta 1,000 pts)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Los estudiantes becarios acumulan 1,000 puntos cuatrimestrales a través de eventos y talleres formativos, o mediante el Servicio Becario departamental para mantener su porcentaje de descuento.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
          <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Requisitos para Titulación</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Para la liberación de constancia de egreso y titulación, se requieren mínimo 400 horas PFI (730 horas para mención Sobresaliente), 3 talleres extracurriculares, 1 de liderazgo y los 3 módulos PVC.
          </p>
        </div>
      </div>

      {/* Modal del Escáner QR */}
      {showScanner && (
        <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
