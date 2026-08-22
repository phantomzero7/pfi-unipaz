'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Grid,
  History,
  Layers,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AttendanceJustificationModal } from '@/components/AttendanceJustificationModal';
import { ScholarshipRenewalDictamenModal } from '@/components/ScholarshipRenewalDictamenModal';
import { calculateStudentPFIProgress, calculateStudentScholarshipProgress, getAttendanceStatusInfo } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import {
  exportStudentsToExcel,
  generateStudentsOfficialPdfReport,
} from '@/lib/export-utils';
import {
  AttendanceStatus,
  CATALOGO_BECAS,
  CATALOGO_PROGRAMAS_ACADEMICOS,
  formatGradoAcademico,
  OPCIONES_SEXO,
  PFIEvent,
  UserProfile,
} from '@/lib/types';
import { ArrowDown, ArrowUp, ArrowUpDown, Printer } from 'lucide-react';

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
    studentAuditLogs,
    addStudentExpedienteComment,
    updateStudentStatus,
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'acreditados' | 'riesgo' | 'becados_todos' | 'becados_departamentales' | 'becados_acreditados' | 'becados_riesgo' | 'no_becados'
  >('todos');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [cuatrimestreFilter, setCuatrimestreFilter] = useState<string>('todos');
  const [sexoFilter, setSexoFilter] = useState<string>('todos');
  const [estatusInscripcionFilter, setEstatusInscripcionFilter] = useState<'todos' | 'activos' | 'bajas'>('todos');

  // Ordenamiento interactivo por columnas
  const [sortField, setSortField] = useState<'matricula' | 'nombre' | 'carrera' | 'cuatrimestre' | 'horasTotales' | 'porcentaje_beca' | 'puntosBeca' | 'isAcreditado'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [modalTab, setModalTab] = useState<'actividades' | 'beca' | 'auditoria'>('actividades');
  const [newAuditComment, setNewAuditComment] = useState('');
  const [auditCommentFeedback, setAuditCommentFeedback] = useState<string | null>(null);

  // Estados para gestionar baja / activación del estudiante
  const [statusEstatus, setStatusEstatus] = useState<'activo' | 'baja_temporal' | 'baja_definitiva' | 'egresado'>('activo');
  const [statusMotivo, setStatusMotivo] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showStatusManager, setShowStatusManager] = useState(false);

  // Modal para asignación directa de eventos a este estudiante
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEventId, setAssignEventId] = useState<string>(events[0]?.id || '');
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal para dictamen de beca
  const [showDictamenModal, setShowDictamenModal] = useState(false);

  const students = profiles.filter((p) => p.role === 'estudiante');
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrado y Ordenamiento Dinámico de Estudiantes
  const filteredStudents = useMemo(() => {
    const list = students.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesQuery =
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        s.carrera.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (carreraFilter !== 'todas' && s.carrera !== carreraFilter) return false;
      if (cuatrimestreFilter !== 'todos' && (s.cuatrimestre?.toString() || '1') !== cuatrimestreFilter) return false;
      if (sexoFilter !== 'todos' && (s.sexo || 'Hombre') !== sexoFilter) return false;

      const isInactive = s.activo === false || s.estatus_inscripcion === 'baja_temporal' || s.estatus_inscripcion === 'baja_definitiva';
      if (estatusInscripcionFilter === 'activos' && isInactive) return false;
      if (estatusInscripcionFilter === 'bajas' && !isInactive) return false;

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

    return list.sort((a, b) => {
      const progA = getStudentProgress(a.id);
      const progB = getStudentProgress(b.id);
      const schA = getStudentScholarshipProgress(a.id);
      const schB = getStudentScholarshipProgress(b.id);

      let valA: any = a.nombre;
      let valB: any = b.nombre;

      if (sortField === 'matricula') {
        valA = a.matricula;
        valB = b.matricula;
      } else if (sortField === 'nombre') {
        valA = `${a.nombre} ${a.apellidos}`;
        valB = `${b.nombre} ${b.apellidos}`;
      } else if (sortField === 'carrera') {
        valA = a.carrera;
        valB = b.carrera;
      } else if (sortField === 'cuatrimestre') {
        valA = a.cuatrimestre || 1;
        valB = b.cuatrimestre || 1;
      } else if (sortField === 'horasTotales') {
        valA = progA.horasTotales;
        valB = progB.horasTotales;
      } else if (sortField === 'porcentaje_beca') {
        valA = a.tiene_beca ? (a.porcentaje_beca || 0) : -1;
        valB = b.tiene_beca ? (b.porcentaje_beca || 0) : -1;
      } else if (sortField === 'puntosBeca') {
        valA = schA.puntosTotales;
        valB = schB.puntosTotales;
      } else if (sortField === 'isAcreditado') {
        valA = progA.isAcreditado ? 1 : 0;
        valB = progB.isAcreditado ? 1 : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, searchTerm, filterStatus, carreraFilter, cuatrimestreFilter, sexoFilter, estatusInscripcionFilter, sortField, sortOrder, getStudentProgress, getStudentScholarshipProgress]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportStudentsToExcel(filteredStudents, getStudentProgress, getStudentScholarshipProgress);
    } catch (e: any) {
      alert(`Error al exportar a Excel: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await generateStudentsOfficialPdfReport(
        filteredStudents,
        getStudentProgress,
        getStudentScholarshipProgress,
        {
          carrera: carreraFilter !== 'todas' ? carreraFilter : undefined,
          cuatrimestre: cuatrimestreFilter !== 'todos' ? `${cuatrimestreFilter}°` : undefined,
          sexo: sexoFilter !== 'todos' ? sexoFilter : undefined,
          status: filterStatus !== 'todos' ? filterStatus : undefined,
          totalStudents: filteredStudents.length,
        }
      );
    } catch (e: any) {
      alert(`Error al generar reporte PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Padrón Estudiantil
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Directorio y Expedientes de Estudiantes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervisión integral de horas acumuladas, becas, talleres acreditados y cumplimiento de titulación.
          </p>
        </div>

        {/* Acciones de Exportación y Toggle Vista Mosaico / Lista */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="py-2 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            title="Exportar padrón filtrado a archivo Microsoft Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="py-2 px-3.5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            title="Generar Reporte Oficial en PDF Membretado para Impresión"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Lista"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista en Mosaico"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Mosaico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula, carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div>
            <select
              value={carreraFilter}
              onChange={(e) => setCarreraFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="todas">Todas las Carreras</option>
              {CATALOGO_PROGRAMAS_ACADEMICOS.map((c) => (
                <option key={c.clave} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={cuatrimestreFilter}
              onChange={(e) => setCuatrimestreFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-2 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="todos">Todos los Grados</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num.toString()}>
                  {num}° Cuatri/Sem
                </option>
              ))}
            </select>

            <select
              value={sexoFilter}
              onChange={(e) => setSexoFilter(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-2 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="todos">Todos Sexos</option>
              {OPCIONES_SEXO.map((sx) => (
                <option key={sx} value={sx}>
                  {sx}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de Filtro de Estatus de Inscripción */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
            <span className="px-2.5 text-[11px] font-bold text-slate-500 uppercase">Estatus:</span>
            <button
              onClick={() => setEstatusInscripcionFilter('todos')}
              className={`py-1 px-3 rounded-xl font-bold text-xs transition-all ${
                estatusInscripcionFilter === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setEstatusInscripcionFilter('activos')}
              className={`py-1 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                estatusInscripcionFilter === 'activos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Solo Activos ({students.filter((s) => s.activo !== false && s.estatus_inscripcion !== 'baja_temporal' && s.estatus_inscripcion !== 'baja_definitiva').length})
            </button>
            <button
              onClick={() => setEstatusInscripcionFilter('bajas')}
              className={`py-1 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                estatusInscripcionFilter === 'bajas'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Bajas / Inactivos ({students.filter((s) => s.activo === false || s.estatus_inscripcion === 'baja_temporal' || s.estatus_inscripcion === 'baja_definitiva').length})
            </button>
          </div>
        </div>

        {/* Píldoras de Filtro Modernas */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'todos', label: 'Todos los Requisitos', count: students.length },
            { id: 'acreditados', label: 'Acreditados (≥400 hrs)', count: students.filter((s) => getStudentProgress(s.id).isAcreditado).length },
            { id: 'riesgo', label: 'En Riesgo (<200 hrs en 6°+)', count: students.filter((s) => (s.cuatrimestre || 1) >= 6 && getStudentProgress(s.id).horasTotales < 200).length },
            { id: 'becados_todos', label: 'Becarios Activos', count: students.filter((s) => s.tiene_beca).length },
            { id: 'becados_departamentales', label: 'Servicio Becario', count: students.filter((s) => s.es_becario_departamental).length },
            { id: 'becados_acreditados', label: 'Becarios con 1,000 pts', count: students.filter((s) => s.tiene_beca && getStudentScholarshipProgress(s.id).isAcreditadoBeca).length },
            { id: 'no_becados', label: 'Sin Beca', count: students.filter((s) => !s.tiene_beca).length },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id as any)}
              className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === pill.id
                  ? 'bg-unipaz-navy dark:bg-white text-white dark:text-slate-950 shadow-sm scale-102'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange'
              }`}
            >
              <span>{pill.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                filterStatus === pill.id
                  ? 'bg-unipaz-orange text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTA O MOSAICO */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/10 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p>No se encontraron estudiantes que coincidan con la búsqueda o filtro seleccionado.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA TABLA / LISTA RESPONSIVA (TARJETAS EN MÓVIL, TABLA EN DESKTOP) */
        <div className="space-y-4">
          {/* VISTA MÓVIL Y TABLET (CARDS COMPACTAS SIN SCROLL HORIZONTAL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
            {filteredStudents.map((s) => {
              const prog = getStudentProgress(s.id);
              const sch = getStudentScholarshipProgress(s.id);

              return (
                <div
                  key={`mob-${s.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-unipaz-navy dark:text-white text-xs font-black">
                          {s.nombre} {s.apellidos}
                        </strong>
                        {s.activo === false || s.estatus_inscripcion === 'baja_temporal' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                            Baja Temp.
                          </span>
                        ) : s.estatus_inscripcion === 'baja_definitiva' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                            Baja Def.
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">{s.matricula}</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                        {s.carrera} · {s.cuatrimestre}° Cuatrimestre
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 flex-shrink-0 shadow-xs"
                    >
                      Expediente
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Resumen de Métricas */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-white/5 text-center text-[10px]">
                    <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Horas PFI</span>
                      <strong className="font-mono text-unipaz-orange text-xs">{prog.horasTotales.toFixed(1)}h</strong>
                    </div>

                    <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Beca</span>
                      {s.tiene_beca ? (
                        <strong className="font-mono text-blue-600 text-xs">{s.porcentaje_beca}%</strong>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Sin Beca</span>
                      )}
                    </div>

                    <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Titulación</span>
                      {prog.isAcreditado ? (
                        <strong className="text-emerald-600 text-[10px]">✓ Liberado</strong>
                      ) : (
                        <span className="text-slate-500 text-[10px]">En Proceso</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA DESKTOP (TABLA INTERACTIVA CON ORDENAMIENTO EN ENCABEZADOS) */}
          <div className="hidden md:block p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold select-none">
                    <th
                      onClick={() => handleSort('nombre')}
                      className="py-3 px-3 cursor-pointer hover:text-unipaz-orange transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Estudiante / Matrícula</span>
                        {sortField === 'nombre' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-unipaz-orange" /> : <ArrowDown className="w-3.5 h-3.5 text-unipaz-orange" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('carrera')}
                      className="py-3 px-3 cursor-pointer hover:text-unipaz-orange transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Carrera / Grado</span>
                        {sortField === 'carrera' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-unipaz-orange" /> : <ArrowDown className="w-3.5 h-3.5 text-unipaz-orange" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('horasTotales')}
                      className="py-3 px-3 cursor-pointer hover:text-unipaz-orange transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Horas PFI</span>
                        {sortField === 'horasTotales' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-unipaz-orange" /> : <ArrowDown className="w-3.5 h-3.5 text-unipaz-orange" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('porcentaje_beca')}
                      className="py-3 px-3 cursor-pointer hover:text-unipaz-orange transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Beca & Puntos</span>
                        {sortField === 'porcentaje_beca' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-unipaz-orange" /> : <ArrowDown className="w-3.5 h-3.5 text-unipaz-orange" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('isAcreditado')}
                      className="py-3 px-3 cursor-pointer hover:text-unipaz-orange transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Estatus Titulación</span>
                        {sortField === 'isAcreditado' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-unipaz-orange" /> : <ArrowDown className="w-3.5 h-3.5 text-unipaz-orange" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredStudents.map((s) => {
                    const prog = getStudentProgress(s.id);
                    const sch = getStudentScholarshipProgress(s.id);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-unipaz-navy dark:text-white">{s.nombre} {s.apellidos}</strong>
                            {s.activo === false || s.estatus_inscripcion === 'baja_temporal' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                                Baja Temp.
                              </span>
                            ) : s.estatus_inscripcion === 'baja_definitiva' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                                Baja Def.
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{s.matricula}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          <div>{s.carrera}</div>
                          <span className="text-[10px] text-slate-400">{s.cuatrimestre}° Cuatrimestre</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 dark:text-white">
                              {prog.horasTotales.toFixed(1)}h
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-unipaz-orange rounded-full"
                                style={{ width: `${Math.min(100, (prog.horasTotales / 400) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {s.tiene_beca ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-unipaz-orange">{s.porcentaje_beca}%</span>
                              <div className="text-[10px] font-mono text-slate-500">
                                {sch.puntosTotales} / 1,000 pts
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin beca</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {prog.isAcreditado ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Listo para Titulación
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              En Proceso
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            Ver Expediente
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA MOSAICO (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s) => {
            const prog = getStudentProgress(s.id);
            const sch = getStudentScholarshipProgress(s.id);

            return (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between hover:border-unipaz-orange/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {s.matricula}
                      </span>
                      {s.activo === false || s.estatus_inscripcion === 'baja_temporal' ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                          Baja Temp.
                        </span>
                      ) : s.estatus_inscripcion === 'baja_definitiva' ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                          Baja Def.
                        </span>
                      ) : null}
                    </div>
                    {prog.isAcreditado ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Acreditado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {prog.horasTotales.toFixed(0)} / 400 hrs
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                    {s.nombre} {s.apellidos}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {s.carrera} · {s.cuatrimestre}° Cuatrimestre
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Horas PFI:</span>
                      <strong className="font-mono text-unipaz-orange">{prog.horasTotales.toFixed(1)} hrs</strong>
                    </div>
                    {s.tiene_beca && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Beca ({s.porcentaje_beca}%):</span>
                        <strong className="font-mono text-blue-600">{sch.puntosTotales} / 1,000 pts</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nivel Formativo:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{prog.escala}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(s)}
                  className="w-full py-2.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  Abrir Expediente Completo
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWER / MODAL DE EXPEDIENTE COMPLETO */}
      {selectedStudent && selectedStudentProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado del Estudiante */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-unipaz-navy text-unipaz-orange flex items-center justify-center font-black text-lg flex-shrink-0">
                  {selectedStudent.nombre[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{selectedStudent.matricula}</span>
                    {selectedStudent.activo === false || selectedStudent.estatus_inscripcion === 'baja_temporal' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                        ⚠️ Baja Temporal
                      </span>
                    ) : selectedStudent.estatus_inscripcion === 'baja_definitiva' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                        🚫 Baja Definitiva
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        ✓ Activo Regular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
                    {selectedStudent.nombre} {selectedStudent.apellidos}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedStudent.carrera} · {selectedStudent.cuatrimestre}° Cuatrimestre</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowStatusManager(!showStatusManager);
                    setStatusEstatus(selectedStudent.estatus_inscripcion || (selectedStudent.activo === false ? 'baja_temporal' : 'activo'));
                    setStatusMotivo(selectedStudent.motivo_baja || '');
                  }}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                    showStatusManager
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-unipaz-orange" />
                  Cambiar Estatus / Baja
                </button>
              </div>
            </div>

            {/* Panel Desplegable para Gestionar Estatus / Baja */}
            {showStatusManager && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-unipaz-navy dark:text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-unipaz-orange" />
                    Control de Estatus Escolar y Vigencia de Acceso PFI
                  </h4>
                  <span className="text-[10px] text-slate-500">Inmutable · Registra Auditoría</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Si el estudiante se da de baja durante el cuatrimestre, su cuenta y credencial digital QR se deshabilitarán para evitar asistencias no autorizadas, preservando íntegramente sus horas históricas para reportes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Nuevo Estatus
                    </label>
                    <select
                      value={statusEstatus}
                      onChange={(e) => setStatusEstatus(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="activo">✓ Activo (Inscrito Regular)</option>
                      <option value="baja_temporal">⚠️ Baja Temporal (Cuatrimestre)</option>
                      <option value="baja_definitiva">🚫 Baja Definitiva</option>
                      <option value="egresado">🎓 Egresado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Motivo / Justificación Oficial
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Baja voluntaria temporal ciclo 2026 / Trámite personal..."
                      value={statusMotivo}
                      onChange={(e) => setStatusMotivo(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {statusFeedback && (
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {statusFeedback}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowStatusManager(false)}
                    className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = updateStudentStatus(selectedStudent.id, statusEstatus, statusMotivo);
                      setStatusFeedback(res.message);
                      // Refrescar el estudiante seleccionado localmente
                      setSelectedStudent({
                        ...selectedStudent,
                        activo: statusEstatus === 'activo',
                        estatus_inscripcion: statusEstatus,
                        motivo_baja: statusEstatus === 'activo' ? undefined : statusMotivo,
                      });
                      setTimeout(() => {
                        setStatusFeedback(null);
                        setShowStatusManager(false);
                      }, 2000);
                    }}
                    className="py-1.5 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-unipaz-orange" />
                    Guardar Estatus en Bitácora
                  </button>
                </div>
              </div>
            )}

            {/* Navegación por Pestañas del Expediente */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
              <button
                onClick={() => setModalTab('actividades')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  modalTab === 'actividades'
                    ? 'bg-unipaz-orange text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Horas PFI & Asistencias ({selectedStudentAttendances.length})
              </button>

              <button
                onClick={() => setModalTab('beca')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  modalTab === 'beca'
                    ? 'bg-unipaz-orange text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Beca & Puntos {selectedStudent.tiene_beca ? `(${selectedStudent.porcentaje_beca}%)` : ''}
              </button>

              <button
                onClick={() => setModalTab('auditoria')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  modalTab === 'auditoria'
                    ? 'bg-unipaz-navy text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-unipaz-orange" />
                Bitácora de Auditoría ({studentAuditLogs.filter((l) => l.student_id === selectedStudent.id).length})
              </button>
            </div>

            {/* TAB 1: ACTIVIDADES Y HORAS FORMATIVAS */}
            {modalTab === 'actividades' && (
              <div className="space-y-4">
                {/* Métricas de Avance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Horas Acreditadas</span>
                    <div className="text-2xl font-black text-unipaz-orange font-mono">
                      {selectedStudentProgress.horasTotales.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 400h</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Nivel Formativo</span>
                    <div className="text-xl font-black text-unipaz-navy dark:text-white">
                      {selectedStudentProgress.escala}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Estatus Titulación</span>
                    <div className="text-sm font-bold text-emerald-600">
                      {selectedStudentProgress.isAcreditado ? '✓ Requisitos Cumplidos' : 'En Proceso Formativo'}
                    </div>
                  </div>
                </div>

                {/* Desglose de Asistencias */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-unipaz-navy dark:text-white">
                      Historial de Actividades y Asistencias
                    </h4>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="py-1.5 px-3 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Asignar Actividad Directa
                    </button>
                  </div>

                  {selectedStudentAttendances.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10">
                      No registra asistencias aún. Puedes acreditar una actividad con el botón de arriba.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedStudentAttendances.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <strong className="text-unipaz-navy dark:text-white">{att.event?.titulo || 'Actividad PFI'}</strong>
                            <div className="text-[10px] text-slate-500">
                              {att.event?.categoria} · {att.horas_acreditadas.toFixed(1)} hrs acreditadas · Rol: {att.rol_participacion || 'Asistente'}
                            </div>
                            {att.notes && (
                              <div className="text-[10px] text-slate-400 italic">Nota: {att.notes}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              att.status === 'asistio' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {att.status}
                            </span>

                            {att.status !== 'asistio' && (
                              <button
                                onClick={() => {
                                  validateAttendanceManually(att.id, 'asistio');
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                                title="Acreditar extemporáneamente y registrar en auditoría"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Validar Extemporáneo
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: EXPEDIENTE DE BECA */}
            {modalTab === 'beca' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Condición de Beca</span>
                    <div className="text-lg font-black text-unipaz-navy dark:text-white">
                      {selectedStudent.tiene_beca ? (
                        <span className="text-unipaz-orange">{selectedStudent.porcentaje_beca}% · {selectedStudent.tipo_beca}</span>
                      ) : (
                        <span className="text-slate-400">Sin Beca Activa</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Promedio Académico Registrado: <strong>{selectedStudent.promedio_academico?.toFixed(2) || '9.00'}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Meta Cuatrimestral de Renovación</span>
                    <div className="text-lg font-black font-mono text-emerald-600">
                      {getStudentScholarshipProgress(selectedStudent.id).puntosTotales} / 1,000 pts
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Estatus de Refrendo: <strong>{selectedStudent.estatus_ratificacion_beca || 'Al corriente'}</strong>
                    </div>
                  </div>
                </div>

                {selectedStudent.es_becario_departamental && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-300">
                      Servicio Becario Departamental Asignado
                    </span>
                    <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Departamento: {selectedStudent.departamento_beca} ({selectedStudent.horas_departamentales_semanales || 10} hrs/sem)
                    </div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300">
                      Cumplimiento: {selectedStudent.cumplimiento_departamental_acreditado ? '✓ Acreditado (1,000 pts otorgados)' : 'En proceso cuatrimestral'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BITÁCORA DE AUDITORÍA INMUTABLE */}
            {modalTab === 'auditoria' && (
              <div className="space-y-4">
                {/* Banner de Seguridad Institucional */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[11px]">
                    <strong className="text-white block font-black">
                      Expediente de Auditoría y Trazabilidad Inmutable
                    </strong>
                    <p className="text-slate-300">
                      Toda validación de horas, acreditación extemporánea, resolución de becas, justificaciones médicas y comentarios internos quedan grabados permanentemente con firma digital del responsable. <strong>Esta bitácora es estrictamente interna y confidencial (no visible para el estudiante).</strong>
                    </p>
                  </div>
                </div>

                {/* Formulario para Agregar Nota u Observación de Auditoría */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Agregar Observación o Comentario Oficial al Expediente:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAuditComment}
                      onChange={(e) => setNewAuditComment(e.target.value)}
                      placeholder="ej. Se cotejó comprobante de ingresos original en ventanilla y se autorizó prórroga..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-normal"
                    />
                    <button
                      onClick={() => {
                        if (!newAuditComment.trim()) return;
                        const res = addStudentExpedienteComment(selectedStudent.id, newAuditComment);
                        if (res.success) {
                          setNewAuditComment('');
                          setAuditCommentFeedback('✓ Nota grabada permanentemente en la bitácora de auditoría.');
                          setTimeout(() => setAuditCommentFeedback(null), 4000);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Registrar Nota
                    </button>
                  </div>
                  {auditCommentFeedback && (
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {auditCommentFeedback}
                    </div>
                  )}
                </div>

                {/* Historial Cronológico de Movimientos */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {studentAuditLogs.filter((l) => l.student_id === selectedStudent.id).length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10">
                      No hay registros previos de auditoría para este expediente.
                    </div>
                  ) : (
                    studentAuditLogs
                      .filter((l) => l.student_id === selectedStudent.id)
                      .map((log) => {
                        const getCategoryBadge = (cat: string) => {
                          switch (cat) {
                            case 'validacion_actividad':
                              return { label: 'Validación de Actividad', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' };
                            case 'cambio_beca':
                              return { label: 'Cambio de Beca', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' };
                            case 'solicitud_beca':
                              return { label: 'Solicitud / Dictamen Beca', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' };
                            case 'renovacion_beca':
                              return { label: 'Renovación / Refrendo', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' };
                            case 'justificacion_asistencia':
                              return { label: 'Justificación Médica/Laboral', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300' };
                            case 'comentario_expediente':
                              return { label: 'Nota Interna / Observación', color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200' };
                            case 'sancion_penalizacion':
                              return { label: 'Penalización / Sanción', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300' };
                            default:
                              return { label: 'Movimiento Registrado', color: 'bg-slate-100 text-slate-800 border-slate-300' };
                          }
                        };

                        const badge = getCategoryBadge(log.categoria);
                        const dateFormatted = new Date(log.timestamp).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-2 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{dateFormatted}</span>
                            </div>

                            <div>
                              <strong className="text-unipaz-navy dark:text-white font-bold block">
                                {log.accion}
                              </strong>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                                {log.detalles}
                              </p>
                            </div>

                            {(log.valor_anterior || log.valor_nuevo) && (
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                                {log.valor_anterior && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Antes: {log.valor_anterior}
                                  </span>
                                )}
                                {log.valor_anterior && log.valor_nuevo && <span>➔</span>}
                                {log.valor_nuevo && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                                    Nuevo: {log.valor_nuevo}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                              <span>
                                Responsable: <strong>{log.autor_nombre}</strong> ({log.autor_rol === 'admin' ? 'Administración' : 'Extensión y Difusión'})
                              </span>
                              <span className="font-mono text-slate-400">🔒 ID: {log.id}</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* Pie del Expediente */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
              <span className="text-[11px] text-slate-400">
                Expediente Institucional UNIPAZ · {selectedStudent.matricula}
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DIRECTA DE ACTIVIDAD */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-unipaz-navy dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-unipaz-orange" />
              Asignación Directa de Actividad
            </h3>

            {assignFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${assignFeedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                {assignFeedback.message}
              </div>
            )}

            <form onSubmit={handleExecuteDirectAssign} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Seleccionar Evento / Taller:</label>
                <select
                  value={assignEventId}
                  onChange={(e) => setAssignEventId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.titulo} ({ev.categoria} - {(ev.horas_presenciales || ev.horas_pfi || 5.0).toFixed(1)} hrs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="specialCase"
                  checked={isSpecialCase}
                  onChange={(e) => setIsSpecialCase(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="specialCase" className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                  Caso Especial / Autorización Extraordinaria (Permite duplicar)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  Acreditar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
