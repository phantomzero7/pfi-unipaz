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
  } = usePFI();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'acreditados' | 'riesgo' | 'becados_todos' | 'becados_departamentales' | 'becados_acreditados' | 'becados_riesgo' | 'no_becados'
  >('todos');
  const [carreraFilter, setCarreraFilter] = useState<string>('todas');
  const [cuatrimestreFilter, setCuatrimestreFilter] = useState<string>('todos');
  const [sexoFilter, setSexoFilter] = useState<string>('todos');

  // Ordenamiento interactivo por columnas
  const [sortField, setSortField] = useState<'matricula' | 'nombre' | 'carrera' | 'cuatrimestre' | 'horasTotales' | 'porcentaje_beca' | 'puntosBeca' | 'isAcreditado'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

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
  }, [students, searchTerm, filterStatus, carreraFilter, cuatrimestreFilter, sexoFilter, sortField, sortOrder, getStudentProgress, getStudentScholarshipProgress]);

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

        {/* Píldoras de Filtro Modernas */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'todos', label: 'Todos los Estudiantes', count: students.length },
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
        /* VISTA TABLA INTERACTIVA CON ORDENAMIENTO EN ENCABEZADOS */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
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
                        <strong className="text-unipaz-navy dark:text-white">{s.nombre} {s.apellidos}</strong>
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
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {s.matricula}
                    </span>
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
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-unipaz-navy text-unipaz-orange flex items-center justify-center font-black text-lg">
                {selectedStudent.nombre[0]}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{selectedStudent.matricula}</span>
                <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
                  {selectedStudent.nombre} {selectedStudent.apellidos}
                </h3>
                <p className="text-xs text-slate-500">{selectedStudent.carrera} · {selectedStudent.cuatrimestre}° Cuatrimestre</p>
              </div>
            </div>

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

            {/* Desglose de Asistencias a Actividades */}
            <div className="space-y-2 pt-2">
              <h4 className="font-black text-xs text-unipaz-navy dark:text-white">
                Historial de Actividades y Asistencias ({selectedStudentAttendances.length})
              </h4>

              {selectedStudentAttendances.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10">
                  No registra asistencias aún.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedStudentAttendances.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-unipaz-navy dark:text-white">{att.event?.titulo || 'Actividad PFI'}</strong>
                        <div className="text-[10px] text-slate-500">
                          {att.event?.categoria} · {att.horas_acreditadas.toFixed(1)} hrs acreditadas
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones del Expediente */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setShowAssignModal(true)}
                className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Asignar Actividad Directa
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
