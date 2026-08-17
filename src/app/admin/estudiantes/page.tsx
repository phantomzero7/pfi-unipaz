'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Building2,
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
import { AttendanceStatus, formatGradoAcademico, PFIEvent, UserProfile } from '@/lib/types';

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
    assignDepartmentalScholarship,
    accreditDepartmentalService,
    revokeScholarship,
    notifyScholarshipResolution,
    currentUser,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'acreditados' | 'riesgo' | 'becados_todos' | 'becados_departamentales' | 'becados_acreditados' | 'becados_riesgo' | 'no_becados'
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
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [scholarshipCategory, setScholarshipCategory] = useState<'regular' | 'departamental'>('regular');
  const [departmentBeca, setDepartmentBeca] = useState<string>('Biblioteca');
  const [horasDepartamentales, setHorasDepartamentales] = useState<number>(10);

  const [resolutionData, setResolutionData] = useState<{
    aprobado: boolean;
    tipo_beca: string;
    porcentaje: number;
    observaciones: string;
  }>({
    aprobado: true,
    tipo_beca: 'Excelencia Académica (Promedio 9.6 - 10.0)',
    porcentaje: 50,
    observaciones: 'Cumple con el promedio mínimo requerido y expediente normativo.',
  });

  const [scholarshipForm, setScholarshipForm] = useState<{
    tipo_beca: string;
    porcentaje: number;
    promedio: number;
  }>({
    tipo_beca: 'Excelencia Académica (Promedio 9.6 - 10.0)',
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
      if (filterStatus === 'becados_departamentales') return s.tiene_beca && s.es_becario_departamental;
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
            placeholder="Buscar por nombre, matrícula o programa académico..."
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
            onClick={() => setFilterStatus('becados_departamentales')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              filterStatus === 'becados_departamentales'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 font-black'
                : 'text-slate-500'
            }`}
          >
            <Building2 className="w-3 h-3 text-blue-500" />
            Departamentales (Biblioteca, INDE, DEDU)
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
                  : std.es_becario_departamental
                  ? 'bg-gradient-to-br from-blue-500/5 to-white dark:from-blue-950/20 dark:to-slate-900/60 border-blue-300/60 dark:border-blue-500/30'
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
                    {std.es_becario_departamental ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 border border-blue-300 flex items-center gap-0.5">
                        <Building2 className="w-2.5 h-2.5 text-blue-600" />
                        {std.departamento_beca?.split(' ')[0] || 'Depto'} ({std.porcentaje_beca}%)
                      </span>
                    ) : std.tiene_beca ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300/80 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        Beca {std.porcentaje_beca}%
                      </span>
                    ) : null}

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
                      {formatGradoAcademico(std)}
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
                      {formatGradoAcademico(selectedStudent)}
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

              {/* DETALLE ESPECIAL DE BECA DEPARTAMENTAL (Biblioteca, INDE, DEDU) */}
              {selectedStudent.tiene_beca && selectedStudent.es_becario_departamental && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600 text-white flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-950 dark:text-blue-200">
                          Beca Departamental: {selectedStudent.departamento_beca}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                          {selectedStudent.horas_departamentales_semanales || 10} hrs / semana
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {selectedStudent.cumplimiento_departamental_acreditado
                          ? `✓ Servicio cuatrimestral completado y validado (${selectedStudent.fecha_acreditacion_departamental || 'Acreditado'}). 1,000 puntos cuatrimestrales asignados.`
                          : 'Horas de servicio en curso. Al validar el cumplimiento al término del periodo se otorgarán los 1,000 puntos cuatrimestrales.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nuevoEstado = !selectedStudent.cumplimiento_departamental_acreditado;
                      accreditDepartmentalService(selectedStudent.id, nuevoEstado);
                      setSelectedStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              cumplimiento_departamental_acreditado: nuevoEstado,
                              puntos_departamentales_otorgados: nuevoEstado ? 1000 : 0,
                              fecha_acreditacion_departamental: nuevoEstado ? new Date().toISOString().split('T')[0] : undefined,
                            }
                          : null
                      );
                    }}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 ${
                      selectedStudent.cumplimiento_departamental_acreditado
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:scale-105'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedStudent.cumplimiento_departamental_acreditado
                      ? 'Revocar 1,000 Pts Departamentales'
                      : '✓ Acreditar 1,000 Pts (Término)'}
                  </button>
                </div>
              )}

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

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {att.status === 'registrado' && (
                        <button
                          onClick={() => validateAttendanceManually(att.id, 'asistio')}
                          className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          Registrar Salida Manual
                        </button>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'asistio' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR BECA AL ESTUDIANTE (REGULAR O DEPARTAMENTAL) */}
      {showScholarshipModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 text-xs">
            <button
              onClick={() => setShowScholarshipModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Comité de Becas & Control Escolar</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Asignar Beca a {selectedStudent.nombre} {selectedStudent.apellidos}
                </h3>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (scholarshipCategory === 'departamental') {
                  assignDepartmentalScholarship(
                    selectedStudent.id,
                    departmentBeca,
                    scholarshipForm.porcentaje,
                    horasDepartamentales,
                    scholarshipForm.promedio
                  );
                  setSelectedStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          tiene_beca: true,
                          tipo_beca: `Apoyo Departamental - ${departmentBeca}`,
                          porcentaje_beca: scholarshipForm.porcentaje,
                          promedio_academico: scholarshipForm.promedio,
                          es_becario_departamental: true,
                          departamento_beca: departmentBeca,
                          horas_departamentales_semanales: horasDepartamentales,
                          cumplimiento_departamental_acreditado: false,
                        }
                      : null
                  );
                } else {
                  assignScholarshipToStudent(
                    selectedStudent.id,
                    scholarshipForm.tipo_beca,
                    scholarshipForm.porcentaje,
                    scholarshipForm.promedio
                  );
                  setSelectedStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          tiene_beca: true,
                          tipo_beca: scholarshipForm.tipo_beca as any,
                          porcentaje_beca: scholarshipForm.porcentaje,
                          promedio_academico: scholarshipForm.promedio,
                          es_becario_departamental: false,
                        }
                      : null
                  );
                }
                setShowScholarshipModal(false);
              }}
              className="space-y-4"
            >
              {/* Selector de Tipo: Regular vs Departamental */}
              <div>
                <label className="block font-bold mb-1.5 uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-400">
                  Tipo de Modalidad de Beca:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScholarshipCategory('regular')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                      scholarshipCategory === 'regular'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-600'
                    }`}
                  >
                    🎓 Beca Regular / Convocatoria
                  </button>
                  <button
                    type="button"
                    onClick={() => setScholarshipCategory('departamental')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                      scholarshipCategory === 'departamental'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-600'
                    }`}
                  >
                    🏢 Apoyo Departamental (1,000 pts)
                  </button>
                </div>
              </div>

              {scholarshipCategory === 'departamental' ? (
                /* Formulario para Beca Departamental (Biblioteca, INDE, DEDU, etc.) */
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 space-y-3">
                  <div>
                    <label className="block font-bold mb-1 text-blue-950 dark:text-blue-200">
                      Departamento Universitario Asignado:
                    </label>
                    <select
                      value={departmentBeca}
                      onChange={(e) => setDepartmentBeca(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-blue-300 dark:border-white/15 rounded-xl p-2.5 font-bold text-xs text-blue-900 dark:text-blue-100"
                    >
                      <option value="Biblioteca">📚 Biblioteca Universitaria (Atención y Acervo)</option>
                      <option value="INDE (Instituto de Investigación e Innovación)">🔬 INDE (Instituto de Investigación e Innovación para el Desarrollo)</option>
                      <option value="DEDU (Dirección de Extensión y Difusión)">📢 DEDU (Dirección de Extensión y Difusión Universitaria)</option>
                      <option value="Servicios Escolares">📝 Servicios Escolares y Archivo</option>
                      <option value="Laboratorios de Cómputo">💻 Laboratorios y Soporte Tecnológico</option>
                      <option value="Deportes y Actividades Físicas">⚽ Coordinación de Deportes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-blue-950 dark:text-blue-200">
                      Horas de Servicio Departamental Semanales:
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={horasDepartamentales}
                      onChange={(e) => setHorasDepartamentales(parseInt(e.target.value) || 10)}
                      className="w-full bg-white dark:bg-slate-950 border border-blue-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      * Al término del cuatrimestre, la jefatura valida el cumplimiento y se liberan los <strong>1,000 puntos automáticos</strong>.
                    </span>
                  </div>
                </div>
              ) : (
                /* Formulario Beca Regular */
                <div>
                  <label className="block font-bold mb-1">Modalidad de Beca Institucional:</label>
                  <select
                    value={scholarshipForm.tipo_beca}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, tipo_beca: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    <optgroup label="Excelencia, Mérito e Investigación">
                      <option value="Excelencia Académica (Promedio 9.6 - 10.0)">Excelencia Académica (Promedio 9.6 - 10.0)</option>
                      <option value="Mérito Académico">Estímulo al Mérito Académico</option>
                      <option value="Investigación y Publicaciones">Investigación y Publicaciones</option>
                      <option value="Posgrados e Investigación">Posgrados e Investigación</option>
                    </optgroup>
                    <optgroup label="Socioeconómicas, Familiares y Convenios">
                      <option value="Estudio Socioeconómico (desde 2° Cuatrimestre)">Estudio Socioeconómico (desde 2° Cuatrimestre)</option>
                      <option value="Convenios Institucionales">Convenios Institucionales</option>
                      <option value="Familiar / Hermanos (20%)">Familiar / Hermanos (20%)</option>
                      <option value="Egresados UNIPAZ">Egresados UNIPAZ</option>
                      <option value="Promoción Educativa">Promoción Educativa</option>
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">% de Descuento:</label>
                  <select
                    value={scholarshipForm.porcentaje}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, porcentaje: parseInt(e.target.value) || 50 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                  >
                    <option value="20">20% Descuento</option>
                    <option value="25">25% Descuento</option>
                    <option value="30">30% Descuento</option>
                    <option value="40">40% Descuento</option>
                    <option value="50">50% Descuento</option>
                    <option value="60">60% Descuento</option>
                    <option value="75">75% Descuento</option>
                    <option value="80">80% Descuento</option>
                    <option value="100">100% Descuento Total</option>
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
                📌 <strong>Regla Institucional:</strong> Meta de renovación obligatoria de <strong>1,000 puntos cuatrimestrales</strong> (acumulables por actividades formativas o por labor departamental cumplida).
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

      {/* MODAL NOTIFICAR RESOLUCIÓN DE BECA */}
      {showResolutionModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowResolutionModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Comité de Becas UNIPAZ</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Notificar Resolución de Beca a {selectedStudent.nombre}
                </h3>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                notifyScholarshipResolution(
                  selectedStudent.id,
                  resolutionData.aprobado,
                  resolutionData.tipo_beca,
                  resolutionData.porcentaje,
                  resolutionData.observaciones
                );
                setShowResolutionModal(false);
                setSelectedStudent((prev) =>
                  prev
                    ? {
                        ...prev,
                        tiene_beca: resolutionData.aprobado,
                        tipo_beca: resolutionData.aprobado ? (resolutionData.tipo_beca as any) : undefined,
                        porcentaje_beca: resolutionData.aprobado ? resolutionData.porcentaje : undefined,
                        solicitud_beca_status: resolutionData.aprobado ? 'aprobada' : 'rechazada',
                      }
                    : null
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-bold mb-1">Sentido del Dictamen:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionData({ ...resolutionData, aprobado: true })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      resolutionData.aprobado
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-600'
                    }`}
                  >
                    ✓ Aprobada / Favorable
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionData({ ...resolutionData, aprobado: false })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      !resolutionData.aprobado
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-600'
                    }`}
                  >
                    ✕ Rechazada / No Procede
                  </button>
                </div>
              </div>

              {/* Verificación de 5 Criterios Normativos Cuatrimestrales */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Verificación de Requisitos Normativos Cuatrimestrales:
                </span>
                <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-unipaz-orange focus:ring-0" />
                    <span>✓ Acumulación de 1,000 puntos formativos cuatrimestrales</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-unipaz-orange focus:ring-0" />
                    <span>✓ Promedio mínimo ({selectedStudent.promedio_academico || 9.0}) y 0 materias reprobadas / extraordinarios</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-unipaz-orange focus:ring-0" />
                    <span>✓ Colegiaturas y pagos cubiertos en tiempo y forma (sin adeudos)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-unipaz-orange focus:ring-0" />
                    <span>✓ Solicitud de refrendo cuatrimestral e informe de becario entregados</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-unipaz-orange focus:ring-0" />
                    <span>✓ Sin sanciones académicas ni disciplinarias en el periodo</span>
                  </label>
                </div>
              </div>

              {resolutionData.aprobado && (
                <>
                  <div>
                    <label className="block font-bold mb-1">Tipo de Beca Asignada:</label>
                    <select
                      value={resolutionData.tipo_beca}
                      onChange={(e) => setResolutionData({ ...resolutionData, tipo_beca: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                    >
                      <option value="Excelencia Académica (Promedio 9.6 - 10.0)">Excelencia Académica (9.6 - 10.0)</option>
                      <option value="Mérito Académico">Mérito Académico</option>
                      <option value="Estudio Socioeconómico (desde 2° Cuatrimestre)">Estudio Socioeconómico</option>
                      <option value="Convenios Institucionales">Convenios Institucionales</option>
                      <option value="Familiar / Hermanos (20%)">Familiar / Hermanos (20%)</option>
                      <option value="Deportiva (Garzas UNIPAZ)">Deportiva (Garzas)</option>
                      <option value="Cultural y Artística">Cultural y Artística</option>
                      <option value="Madres Solteras / Jefas de Familia">Madres Solteras</option>
                      <option value="Inclusión y Discapacidad">Inclusión y Discapacidad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Porcentaje de Descuento:</label>
                    <select
                      value={resolutionData.porcentaje}
                      onChange={(e) => setResolutionData({ ...resolutionData, porcentaje: parseInt(e.target.value) || 50 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                    >
                      <option value="20">20% Descuento</option>
                      <option value="25">25% Descuento</option>
                      <option value="30">30% Descuento</option>
                      <option value="40">40% Descuento</option>
                      <option value="50">50% Descuento</option>
                      <option value="60">60% Descuento</option>
                      <option value="75">75% Descuento</option>
                      <option value="80">80% Descuento</option>
                      <option value="100">100% Descuento Total</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold mb-1">Observaciones o Fundamento del Comité:</label>
                <textarea
                  rows={3}
                  value={resolutionData.observaciones}
                  onChange={(e) => setResolutionData({ ...resolutionData, observaciones: e.target.value })}
                  placeholder="Fundamento, promedio validado o condiciones de permanencia..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolutionModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Notificar Dictamen al Estudiante
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
