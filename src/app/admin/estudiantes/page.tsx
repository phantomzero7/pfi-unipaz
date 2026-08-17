'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileCheck,
  FileText,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AttendanceJustificationModal } from '@/components/AttendanceJustificationModal';
import { ScholarshipRenewalDictamenModal } from '@/components/ScholarshipRenewalDictamenModal';
import { exportStudentsToCsv, exportStudentsToExcel } from '@/lib/export-utils';
import { calculateStudentPFIProgress, calculateStudentScholarshipProgress, getAttendanceStatusInfo } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { AttendanceStatus, PFIEvent, UserProfile } from '@/lib/types';

export default function AdminEstudiantesDirectoryPage() {
  const {
    profiles,
    events,
    attendances,
    justifications,
    reviewJustification,
    validateAttendanceManually,
    assignEventToStudent,
    getStudentProgress,
    getStudentScholarshipProgress,
    assignScholarshipToStudent,
    revokeScholarship,
    currentUser,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'acreditados' | 'riesgo' | 'becados_todos' | 'becados_acreditados' | 'becados_riesgo' | 'no_becados'
  >('todos');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Modal para asignación directa de eventos a este estudiante
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEventId, setAssignEventId] = useState<string>(events[0]?.id || '');
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal para asignación / gestión de becas
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [showDictamenModal, setShowDictamenModal] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState<{
    tipo_beca: string;
    porcentaje: number;
    promedio: number;
  }>({
    tipo_beca: 'Excelencia Académica',
    porcentaje: 50,
    promedio: 9.5,
  });

  const students = profiles.filter((p) => p.role === 'estudiante');
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  const pendingJustifications = justifications.filter((j) => j.status === 'pendiente');

  // Filtrado de estudiantes
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesQuery =
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        s.carrera.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      const prog = getStudentProgress(s.id);
      const sch = getStudentScholarshipProgress(s.id);
      const cuatri = s.cuatrimestre || 1;
      const isRiesgo = cuatri >= 6 && prog.horasTotales < 200;

      if (filterStatus === 'acreditados') return prog.isAcreditado;
      if (filterStatus === 'riesgo') return isRiesgo;
      if (filterStatus === 'becados_todos') return s.tiene_beca;
      if (filterStatus === 'becados_acreditados') return s.tiene_beca && sch.isAcreditadoBeca;
      if (filterStatus === 'becados_riesgo') return s.tiene_beca && !sch.isAcreditadoBeca;
      if (filterStatus === 'no_becados') return !s.tiene_beca;
      return true;
    });
  }, [students, searchTerm, filterStatus, getStudentProgress, getStudentScholarshipProgress]);

  const selectedStudentProgress = selectedStudent
    ? calculateStudentPFIProgress(
        attendances.filter((a) => a.student_id === selectedStudent.id),
        eventsMap
      )
    : null;

  const selectedStudentAttendances = selectedStudent
    ? attendances
        .filter((a) => a.student_id === selectedStudent.id)
        .map((att) => {
          const ev = eventsMap.get(att.event_id);
          return {
            ...att,
            event: ev,
            info: getAttendanceStatusInfo(att, ev),
          };
        })
    : [];

  const handleExecuteDirectAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const res = assignEventToStudent(assignEventId, selectedStudent.id, isSpecialCase);
    setAssignFeedback(res);
    setTimeout(() => setAssignFeedback(null), 4000);
    if (res.success) {
      setTimeout(() => setShowAssignModal(false), 1200);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
              Control Escolar y Titulación PFI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Directorio Estudiantil & Auditoría de Créditos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Gestión de expedientes, resolución de justificaciones médicas/laborales y detección temprana de rezago académico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportStudentsToExcel(students, getStudentProgress, getStudentScholarshipProgress)}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            title="Descargar libro nativo de Microsoft Excel (.xlsx)"
          >
            <Download className="w-4 h-4" />
            Descargar Excel (.xlsx)
          </button>
          <button
            onClick={() => exportStudentsToCsv(students, getStudentProgress)}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Exportar archivo CSV estándar UTF-8"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            CSV
          </button>
        </div>
      </div>

      {/* BANDEJA DE JUSTIFICACIONES PENDIENTES */}
      {pendingJustifications.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-sm text-amber-900 dark:text-amber-200">
                Bandeja de Justificaciones Médicas / Laborales Pendientes ({pendingJustifications.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              Requieren revisión de Coordinación
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingJustifications.map((just) => {
              const student = profiles.find((p) => p.id === just.student_id);
              const event = events.find((e) => e.id === just.event_id);

              return (
                <div
                  key={just.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-white/10 space-y-3 text-xs shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-unipaz-navy dark:text-white">
                        {student?.nombre} {student?.apellidos} ({student?.matricula})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(just.fecha_solicitud).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-unipaz-orange font-bold mt-0.5">
                      Actividad: {event?.titulo} (+{event?.horas_pfi}h)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 italic">
                      "{just.motivo}"
                    </p>
                    {just.archivo_nombre && (
                      <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Comprobante: {just.archivo_nombre}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => reviewJustification(just.id, 'aprobada')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                    >
                      Aprobar (+{event?.horas_pfi || 10}h)
                    </button>
                    <button
                      onClick={() => reviewJustification(just.id, 'rechazada', 'Evidencia insuficiente o fuera de plazo.')}
                      className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-bold text-[11px] transition-all"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, matrícula o carrera..."
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-white/15 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange shadow-sm"
          />
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex flex-wrap items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold gap-1 shadow-sm">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'todos'
                ? 'bg-slate-100 dark:bg-slate-800 text-unipaz-navy dark:text-white font-black'
                : 'text-slate-500'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('acreditados')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'acreditados'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black'
                : 'text-slate-500'
            }`}
          >
            Acreditados (≥400h)
          </button>
          <button
            onClick={() => setFilterStatus('riesgo')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'riesgo'
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-black'
                : 'text-slate-500'
            }`}
          >
            En Rezago PFI
          </button>
          <button
            onClick={() => setFilterStatus('becados_todos')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              filterStatus === 'becados_todos'
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-black'
                : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Becarios UNIPAZ
          </button>
          <button
            onClick={() => setFilterStatus('becados_acreditados')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'becados_acreditados'
                ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-900 dark:text-teal-200 font-black'
                : 'text-slate-500'
            }`}
          >
            Beca Renovada (≥1,000 pts)
          </button>
          <button
            onClick={() => setFilterStatus('becados_riesgo')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'becados_riesgo'
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-black'
                : 'text-slate-500'
            }`}
          >
            Beca en Riesgo (&lt;1,000 pts)
          </button>
        </div>
      </div>

      {/* Grid de Estudiantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((std) => {
          const prog = getStudentProgress(std.id);
          const sch = getStudentScholarshipProgress(std.id);
          const cuatri = std.cuatrimestre || 1;
          const isRiesgo = cuatri >= 6 && prog.horasTotales < 200;

          return (
            <div
              key={std.id}
              onClick={() => setSelectedStudent(std)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] shadow-sm ${
                isRiesgo
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40'
                  : prog.isAcreditado
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                  : std.tiene_beca
                  ? 'bg-gradient-to-br from-amber-500/5 to-white dark:from-amber-950/20 dark:to-slate-900/60 border-amber-300/60 dark:border-amber-500/30'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-unipaz-orange/40'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {std.matricula}
                  </span>

                  <div className="flex items-center gap-1">
                    {std.tiene_beca && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300/80 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        Beca {std.porcentaje_beca}%
                      </span>
                    )}

                    {isRiesgo ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300">
                        ⚠️ Rezago PFI
                      </span>
                    ) : prog.isAcreditado ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                        ✓ Acreditado
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                    <Image
                      src={std.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={std.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-unipaz-navy dark:text-white leading-tight">
                      {std.nombre} {std.apellidos}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {std.carrera}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Grado:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {std.cuatrimestre ? `${std.cuatrimestre}° Cuatrimestre` : std.periodo_ingreso}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Horas PFI:</span>
                    <span className="font-mono font-black text-unipaz-orange text-xs">
                      +{prog.horasTotales.toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                {/* Sub-fila de Beca si aplica */}
                {std.tiene_beca && (
                  <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-800 dark:text-amber-300 text-[10px] font-sans font-semibold">
                      Puntos Beca:
                    </span>
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      {sch.puntosTotales} / 1,000 pts ({sch.porcentajeCumplimiento}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-unipaz-cobalt font-bold">
                <span>Auditar expediente</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL AUDITORÍA DE EXPEDIENTE ESTUDIANTIL */}
      {selectedStudent && selectedStudentProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Estudiante */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-unipaz-orange shadow-md flex-shrink-0">
                  <Image
                    src={selectedStudent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={selectedStudent.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-unipaz-orange">
                      {selectedStudent.matricula}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                      {selectedStudent.cuatrimestre ? `${selectedStudent.cuatrimestre}° Cuatrimestre` : selectedStudent.periodo_ingreso}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-unipaz-navy dark:text-white mt-0.5">
                    {selectedStudent.nombre} {selectedStudent.apellidos}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.carrera} · {selectedStudent.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-unipaz-orange text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4" />
                  Asignar Actividad
                </button>
              </div>
            </div>

            {/* SECCIÓN DE GESTIÓN DE BECA DEL ALUMNO */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="font-black text-xs text-amber-900 dark:text-amber-200">
                      Estatus de Beca Institucional
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {selectedStudent.tiene_beca
                        ? `${selectedStudent.tipo_beca} (${selectedStudent.porcentaje_beca}% de Descuento)`
                        : 'El estudiante no cuenta con beca asignada actualmente.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedStudent.tiene_beca ? (
                    <>
                      <button
                        onClick={() => setShowDictamenModal(true)}
                        className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Dictamen de Beca PDF
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Deseas dar de baja la beca de ${selectedStudent.nombre}?`)) {
                            revokeScholarship(selectedStudent.id);
                            setSelectedStudent((prev) => (prev ? { ...prev, tiene_beca: false } : null));
                          }
                        }}
                        className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-bold text-[11px]"
                      >
                        Revocar Beca
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowScholarshipModal(true)}
                      className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Asignar Beca
                    </button>
                  )}
                </div>
              </div>

              {selectedStudent.tiene_beca && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/80 dark:border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Puntos Acumulados:</span>
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      +{getStudentScholarshipProgress(selectedStudent.id).puntosTotales} / 1,000 pts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Cumplimiento:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {getStudentScholarshipProgress(selectedStudent.id).porcentajeCumplimiento}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Promedio Escolar:</span>
                    <span className="font-bold text-unipaz-navy dark:text-white">
                      {(selectedStudent.promedio_academico || 9.0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de Requisitos PFI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Horas Totales</span>
                <span className="font-mono font-black text-unipaz-orange text-base mt-0.5 block">
                  +{selectedStudentProgress.horasTotales.toFixed(2)}h
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Plan de Vida</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5 block">
                  {selectedStudentProgress.pvc.cumplido ? 'PVC I, II, III ✓' : `${selectedStudentProgress.pvc.horas.toFixed(0)}/75 hrs`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Talleres Extracurr.</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5 block">
                  {selectedStudentProgress.talleresExtracurriculares.completados}/3 Talleres
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Liderazgo Social</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5 block">
                  {selectedStudentProgress.tallerLiderazgo.cumplido ? 'Acreditado ✓' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Listado de Asistencias y Auditoría Manual */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                Auditoría de Asistencias & Modificación de Check-Out:
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedStudentAttendances.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="font-bold text-unipaz-navy dark:text-white">
                        {att.event?.titulo || 'Actividad Formativa'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {att.event?.fecha_evento} · {att.info.statusLabel} · +{att.horas_acreditadas} hrs
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {att.status !== 'asistio' ? (
                        <button
                          onClick={() => validateAttendanceManually(att.id, 'asistio')}
                          className="py-1 px-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm hover:bg-emerald-600"
                        >
                          Validar y Acreditar (+{att.event?.horas_pfi || 10}h)
                        </button>
                      ) : (
                        <button
                          onClick={() => validateAttendanceManually(att.id, 'incompleto', 0)}
                          className="py-1 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] hover:bg-rose-100 hover:text-rose-600"
                        >
                          Marcar No Realizada (0h)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DIRECTA DE ACTIVIDAD */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-unipaz-navy dark:text-white">
                Asignar Actividad a {selectedStudent.nombre}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignFeedback && (
              <p className={`text-xs font-bold ${assignFeedback.success ? 'text-emerald-600' : 'text-amber-600'}`}>
                {assignFeedback.message}
              </p>
            )}

            <form onSubmit={handleExecuteDirectAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Seleccionar Actividad:</label>
                <select
                  value={assignEventId}
                  onChange={(e) => setAssignEventId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.titulo} (+{e.horas_pfi}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-unipaz-orange text-white font-bold"
                >
                  Inscribir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DE BECA INSTITUCIONAL */}
      {showScholarshipModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-unipaz-navy dark:text-white">
                  Asignar Beca Institucional
                </h3>
              </div>
              <button
                onClick={() => setShowScholarshipModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Asignación oficial para: <strong className="text-unipaz-navy dark:text-white">{selectedStudent.nombre} {selectedStudent.apellidos}</strong> ({selectedStudent.matricula})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                assignScholarshipToStudent(
                  selectedStudent.id,
                  scholarshipForm.tipo_beca as any,
                  scholarshipForm.porcentaje,
                  scholarshipForm.promedio,
                  1000
                );
                setSelectedStudent((prev) =>
                  prev
                    ? {
                        ...prev,
                        tiene_beca: true,
                        tipo_beca: scholarshipForm.tipo_beca as any,
                        porcentaje_beca: scholarshipForm.porcentaje,
                        promedio_academico: scholarshipForm.promedio,
                        puntos_beca_meta_cuatrimestral: 1000,
                      }
                    : null
                );
                setShowScholarshipModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold mb-1">Tipo de Beca / Estímulo:</label>
                <select
                  value={scholarshipForm.tipo_beca}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, tipo_beca: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                >
                  <optgroup label="Excelencia, Mérito e Investigación">
                    <option value="Excelencia Académica (Promedio 9.6 - 10.0)">Beca de Excelencia Académica (9.6 - 10.0)</option>
                    <option value="Mérito Académico">Estímulo al Mérito Académico</option>
                    <option value="Investigación y Publicaciones">Beca de Investigación y Publicaciones</option>
                    <option value="Posgrados e Investigación">Estímulo de Posgrados e Investigación</option>
                  </optgroup>
                  <optgroup label="Socioeconómicas, Familiares y Convenios">
                    <option value="Estudio Socioeconómico (desde 2° Cuatrimestre)">Beca Estudio Socioeconómico (desde 2° Cuatrimestre)</option>
                    <option value="Convenios Institucionales">Beca por Convenios Institucionales / Empresas</option>
                    <option value="Familiar / Hermanos (20%)">Beca Familiar / Hermanos (20%)</option>
                    <option value="Egresados UNIPAZ">Beca Egresados UNIPAZ</option>
                    <option value="Promoción Educativa">Beca de Promoción Educativa</option>
                  </optgroup>
                  <optgroup label="Deportivas, Culturales y Talento">
                    <option value="Deportiva (Garzas UNIPAZ)">Beca Deportiva (Garzas UNIPAZ)</option>
                    <option value="Cultural y Artística">Beca Cultural y Artística</option>
                    <option value="Talento y Liderazgo">Beca de Talento y Liderazgo Social</option>
                  </optgroup>
                  <optgroup label="Estímulos de Inclusión y Responsabilidad Social">
                    <option value="Madres Solteras / Jefas de Familia">Estímulo Madres Solteras / Jefas de Familia</option>
                    <option value="Inclusión y Discapacidad">Estímulo de Inclusión y Personas con Discapacidad</option>
                    <option value="Intercultural / Pueblos Originarios">Estímulo Intercultural / Pueblos Originarios</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">% de Descuento:</label>
                  <select
                    value={scholarshipForm.porcentaje}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, porcentaje: parseInt(e.target.value) || 50 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    <option value="20">20% Descuento (Hermanos / Convenio)</option>
                    <option value="25">25% Descuento</option>
                    <option value="30">30% Descuento</option>
                    <option value="40">40% Descuento</option>
                    <option value="50">50% Descuento</option>
                    <option value="60">60% Descuento</option>
                    <option value="75">75% Descuento</option>
                    <option value="80">80% Descuento</option>
                    <option value="100">100% Descuento Total (Exención)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Promedio Actual:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="7.0"
                    max="10.0"
                    value={scholarshipForm.promedio}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, promedio: parseFloat(e.target.value) || 9.0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                📌 <strong>Regla Institucional:</strong> El estudiante estará obligado a generar un mínimo de <strong>1,000 puntos cuatrimestrales</strong> en actividades formativas para refrendar el beneficio.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScholarshipModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DICTAMEN OFICIAL DE BECA */}
      {showDictamenModal && selectedStudent && selectedStudent.tiene_beca && (
        <ScholarshipRenewalDictamenModal
          isOpen={showDictamenModal}
          onClose={() => setShowDictamenModal(false)}
          student={selectedStudent}
          scholarshipProgress={getStudentScholarshipProgress(selectedStudent.id)}
        />
      )}
    </div>
  );
}
