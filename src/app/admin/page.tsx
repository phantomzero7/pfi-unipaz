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
  FileCheck,
  GraduationCap,
  Layers,
  Plus,
  QrCode,
  ScanLine,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { QrScannerModal } from '@/components/QrScannerModal';
import { usePFI } from '@/lib/store';
import { calculateStudentPFIProgress } from '@/lib/pfi-rules';
import { PFIEvent } from '@/lib/types';

export default function AdminDashboardPage() {
  const { profiles, events, attendances, currentUser } = usePFI();
  const [showScanner, setShowScanner] = useState(false);

  const students = profiles.filter((p) => p.role === 'estudiante');
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  // Calcular métricas institucionales
  let totalHoursAccredited = 0;
  let studentsAcreditados = 0;
  let studentsSobresaliente = 0;

  const studentProgressList = students.map((std) => {
    const studentAtts = attendances.filter((a) => a.student_id === std.id);
    const prog = calculateStudentPFIProgress(studentAtts, eventsMap);
    totalHoursAccredited += prog.horasTotales;
    if (prog.isAcreditado) studentsAcreditados++;
    if (prog.escala === 'Sobresaliente') studentsSobresaliente++;
    return {
      student: std,
      progress: prog,
    };
  });

  const avgHours = students.length > 0 ? (totalHoursAccredited / students.length).toFixed(1) : '0';
  const accreditationRate = students.length > 0 ? Math.round((studentsAcreditados / students.length) * 100) : 0;

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
            Supervisión de acreditaciones, regla de permanencia (80%), control de asistencias QR y eventos.
          </p>
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
            <span>Eventos Activos</span>
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{events.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Talleres, PVC, Foros y Congresos</p>
        </div>
      </div>

      {/* Grid: Lista de Estudiantes & Expedientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Tabla de Estudiantes */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
                Avance PFI por Estudiante
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoreo de horas, obligatorios y estatus para titulación:
              </p>
            </div>
            <Link
              href="/admin/estudiantes"
              className="text-xs font-bold text-unipaz-orange hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3">Estudiante</th>
                  <th className="py-3 px-3">Programa Académico</th>
                  <th className="py-3 px-3">Progreso Horas</th>
                  <th className="py-3 px-3">Nivel PFI</th>
                  <th className="py-3 px-3 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {studentProgressList.map(({ student, progress }) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-black text-unipaz-navy dark:text-white">
                        {student.nombre} {student.apellidos}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                        {student.matricula}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px] font-medium">
                      {student.carrera}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progress.horasTotales >= 730
                                ? 'bg-amber-500 dark:bg-amber-400'
                                : progress.horasTotales >= 400
                                ? 'bg-emerald-500 dark:bg-emerald-400'
                                : 'bg-unipaz-orange'
                            }`}
                            style={{ width: `${Math.min(100, (progress.horasTotales / 730) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 dark:text-white text-[11px]">
                          {progress.horasTotales.toFixed(0)}h
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          progress.escala === 'Sobresaliente'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-400/30'
                            : progress.escala === 'Satisfactorio'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-400/30'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-400/30'
                        }`}
                      >
                        {progress.escala}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {progress.isAcreditado ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acreditado
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-medium">En Proceso</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Accesos Directos & Reglas */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 p-6 space-y-4 shadow-lg shadow-blue-950/5">
            <h4 className="text-base font-black text-unipaz-navy dark:text-white">
              Herramientas de Control Staff
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/scanner"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ScanLine className="w-4 h-4 text-unipaz-orange" />
                  <span className="font-bold">Escáner Check-In / Check-Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-unipaz-navy dark:group-hover:text-white" />
              </Link>

              <Link
                href="/admin/eventos"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">Administrador de Talleres</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-unipaz-navy dark:group-hover:text-white" />
              </Link>

              <Link
                href="/admin/estudiantes"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-unipaz-cobalt" />
                  <span className="font-bold">Auditoría de Expedientes</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-unipaz-navy dark:group-hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-white/10 p-6 space-y-3 text-xs shadow-lg shadow-blue-950/5">
            <h4 className="text-sm font-black text-unipaz-navy dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-unipaz-orange" />
              Regla del 80% de Permanencia
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              El sistema valida automáticamente que el estudiante permanezca al menos el 80% de la duración nominal del evento para conceder las horas PFI correspondientes.
            </p>
          </div>
        </div>
      </div>

      {/* Modal del Escáner QR */}
      {showScanner && (
        <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
