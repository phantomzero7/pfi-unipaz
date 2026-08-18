'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Edit3,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  PenTool,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { ScholarshipRenewalDictamenModal } from '@/components/ScholarshipRenewalDictamenModal';
import { calculateStudentScholarshipProgress } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { formatGradoAcademico, PROGRAMAS_ACADEMICOS, UserProfile } from '@/lib/types';

export default function AdminBecasConfigPage() {
  const {
    pfiConfig,
    updateGlobalConfig,
    profiles,
    events,
    attendances,
    getStudentScholarshipProgress,
    assignScholarshipToStudent,
    assignDepartmentalScholarship,
    accreditDepartmentalService,
    revokeScholarship,
    notifyScholarshipResolution,
    toggleScholarshipApplicationPeriod,
    toggleBecarioReport,
    toggleSocioeconomicStudy,
  } = usePFI();

  const [activeTab, setActiveTab] = useState<'control' | 'solicitudes' | 'departamentales' | 'modalidades' | 'reglamento'>('control');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDictamen, setSelectedStudentForDictamen] = useState<UserProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State para Fechas de Convocatoria
  const [fechaInicio, setFechaInicio] = useState(pfiConfig.fecha_inicio_solicitud_becas || '2026-09-01');
  const [fechaFin, setFechaFin] = useState(pfiConfig.fecha_fin_solicitud_becas || '2026-09-25');

  // Catálogo Dinámico de Modalidades de Beca
  const [modalidadesBeca, setModalidadesBeca] = useState<string[]>([
    'Excelencia Académica (Promedio 9.6 - 10.0)',
    'Mérito Académico',
    'Estudio Socioeconómico (desde 2° Cuatrimestre)',
    'Convenios Institucionales',
    'Familiar / Hermanos (20%)',
    'Egresados UNIPAZ',
    'Promoción Educativa',
    'Deportiva (Garzas UNIPAZ)',
    'Cultural y Artística',
    'Investigación y Publicaciones',
    'Madres Solteras / Jefas de Familia',
    'Inclusión y Discapacidad',
    'Intercultural / Pueblos Originarios',
  ]);
  const [nuevaModalidad, setNuevaModalidad] = useState('');

  // Catálogo Dinámico de Departamentos para Becas Departamentales
  const [departamentosDisponibles, setDepartamentosDisponibles] = useState<string[]>([
    'Biblioteca',
    'INDE (Instituto de Investigación e Innovación)',
    'DEDU (Dirección de Extensión y Difusión)',
    'Laboratorios de Cómputo e Informática',
    'Clínica Universitaria de Salud',
    'Vinculación y Bolsa de Trabajo',
  ]);
  const [nuevoDepartamento, setNuevoDepartamento] = useState('');

  // Form State para Asignación de Beca Regular (SOLO ALUMNOS SIN BECA)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>('Excelencia Académica (Promedio 9.6 - 10.0)');
  const [selectedPorcentaje, setSelectedPorcentaje] = useState<number>(50);
  const [promedioAsignado, setPromedioAsignado] = useState<number>(9.5);
  const [asignacionMsg, setAsignacionMsg] = useState<string | null>(null);

  // Form State para Asignación de Beca Departamental
  const [deptStudentId, setDeptStudentId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Biblioteca');
  const [deptPorcentaje, setDeptPorcentaje] = useState<number>(50);
  const [deptHorasSemanales, setDeptHorasSemanales] = useState<number>(10);
  const [deptPromedio, setDeptPromedio] = useState<number>(9.2);
  const [deptMsg, setDeptMsg] = useState<string | null>(null);

  // MODAL DE EVALUACIÓN Y RATIFICACIÓN NORMATIVA DE BECA
  const [evaluatingStudent, setEvaluatingStudent] = useState<UserProfile | null>(null);
  const [evalData, setEvalData] = useState({
    pagos_al_corriente: true,
    sin_reprobadas: true,
    solicitud_a_tiempo: true,
    sin_sanciones: true,
    esta_inscrito_proximo_ciclo: true,
    proxima_carga_materias: 'normal' as 'normal' | 'minima',
    cumple_puntos_1000: true,
    visto_bueno_reincidencia: false,
    motivo_visto_bueno: '',
    condiciones: '',
    tipo_beca: '',
    porcentaje_beca: 50,
    promedio_academico: 9.0,
    observaciones: '',
  });

  const students = useMemo(() => profiles.filter((p) => p.role === 'estudiante'), [profiles]);
  const studentsSinBeca = useMemo(() => students.filter((s) => !s.tiene_beca), [students]);
  const becarios = useMemo(() => students.filter((s) => s.tiene_beca), [students]);
  const becariosDept = useMemo(() => students.filter((s) => s.es_becario_departamental), [students]);
  const solicitudesPendientes = useMemo(
    () => students.filter((s) => s.solicitud_beca_status === 'enviada' || s.solicitud_beca_status === 'en_evaluacion'),
    [students]
  );
  const eventsMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const filteredBecarios = useMemo(() => {
    return becarios.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        (s.tipo_beca && s.tipo_beca.toLowerCase().includes(q)) ||
        s.carrera.toLowerCase().includes(q)
      );
    });
  }, [becarios, searchTerm]);

  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    toggleScholarshipApplicationPeriod(pfiConfig.periodo_solicitud_becas_activo ?? true, fechaInicio, fechaFin);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAssignRegularBeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Selecciona un estudiante sin beca.');
      return;
    }
    const res = assignScholarshipToStudent(
      selectedStudentId,
      selectedTipoBeca as any,
      selectedPorcentaje,
      promedioAsignado,
      1000
    );
    setAsignacionMsg(res.message);
    setSelectedStudentId('');
    setTimeout(() => setAsignacionMsg(null), 4000);
  };

  const handleAssignDeptBeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptStudentId) {
      alert('Selecciona un estudiante.');
      return;
    }
    const res = assignDepartmentalScholarship(
      deptStudentId,
      selectedDept,
      deptPorcentaje,
      deptHorasSemanales,
      deptPromedio
    );
    setDeptMsg(res.message);
    setDeptStudentId('');
    setTimeout(() => setDeptMsg(null), 4000);
  };

  const handleAddModalidad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaModalidad.trim()) return;
    if (modalidadesBeca.includes(nuevaModalidad.trim())) {
      alert('Esta modalidad ya existe.');
      return;
    }
    setModalidadesBeca((prev) => [...prev, nuevaModalidad.trim()]);
    setNuevaModalidad('');
  };

  const handleRemoveModalidad = (mod: string) => {
    setModalidadesBeca((prev) => prev.filter((m) => m !== mod));
  };

  const handleAddDepartamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDepartamento.trim()) return;
    if (departamentosDisponibles.includes(nuevoDepartamento.trim())) {
      alert('Este departamento ya existe.');
      return;
    }
    setDepartamentosDisponibles((prev) => [...prev, nuevoDepartamento.trim()]);
    setNuevoDepartamento('');
  };

  const handleRemoveDepartamento = (dept: string) => {
    setDepartamentosDisponibles((prev) => prev.filter((d) => d !== dept));
  };

  const openEvaluationModal = (student: UserProfile) => {
    setEvaluatingStudent(student);
    const prog = getStudentScholarshipProgress(student.id);
    const isCond = student.estatus_ratificacion_beca === 'condicionada' || student.refrendo_beca_condicionado_admin || student.habia_tenido_beca_condicionada;
    
    setEvalData({
      pagos_al_corriente: student.cumple_pagos_al_corriente !== undefined ? student.cumple_pagos_al_corriente : true,
      sin_reprobadas: student.cumple_cero_reprobaciones !== undefined ? student.cumple_cero_reprobaciones : true,
      solicitud_a_tiempo: student.informe_becario_entregado !== undefined ? student.informe_becario_entregado : true,
      sin_sanciones: student.cumple_sin_sanciones !== undefined ? student.cumple_sin_sanciones : true,
      esta_inscrito_proximo_ciclo: student.esta_inscrito_proximo_ciclo !== undefined ? student.esta_inscrito_proximo_ciclo : true,
      proxima_carga_materias: (student.proxima_carga_materias || student.carga_materias_actual || 'normal') as 'normal' | 'minima',
      cumple_puntos_1000: prog.puntosTotales >= 1000,
      visto_bueno_reincidencia: student.visto_bueno_reincidencia_comite || false,
      motivo_visto_bueno: '',
      condiciones: student.condiciones_ratificacion_beca || (isCond ? student.resolucion_refrendo_observaciones || '' : ''),
      tipo_beca: student.tipo_beca || modalidadesBeca[0],
      porcentaje_beca: student.porcentaje_beca || 50,
      promedio_academico: student.promedio_academico || 9.0,
      observaciones: student.resolucion_refrendo_observaciones || '',
    });
  };

  const handleSaveEvaluation = (resolution: 'aprobada' | 'condicionada' | 'rechazada') => {
    if (!evaluatingStudent) return;

    // 1. Carga Mínima de Materias: Exclusión directa de beca institucional
    if ((resolution === 'aprobada' || resolution === 'condicionada') && evalData.proxima_carga_materias === 'minima') {
      alert('🚫 NO APLICA BECA INSTITUCIONAL: El estudiante llevará Carga Mínima de materias en el ciclo por venir y pagará la mitad de colegiatura correspondiente. Por reglamento institucional, no es acreedor a beca ni ratificación.');
      return;
    }

    // 2. Reprobación en ordinario siempre es baja definitiva
    if ((resolution === 'aprobada' || resolution === 'condicionada') && !evalData.sin_reprobadas) {
      alert('⚠️ BAJA DIRECTA REGLAMENTARIA: No es posible ratificar ni condicionar la beca si el alumno reprobó una materia en ordinario (incluso si aprobó examen extraordinario). Debe dictaminarse como Rechazar / Baja de Beca.');
      return;
    }

    const hadPreviousCondition = Boolean(
      evaluatingStudent.estatus_ratificacion_beca === 'condicionada' ||
      evaluatingStudent.refrendo_beca_condicionado_admin ||
      evaluatingStudent.habia_tenido_beca_condicionada
    );

    const cumpleTodo = Boolean(
      evalData.sin_reprobadas &&
      evalData.pagos_al_corriente &&
      evalData.solicitud_a_tiempo &&
      evalData.sin_sanciones &&
      evalData.esta_inscrito_proximo_ciclo &&
      evalData.proxima_carga_materias === 'normal' &&
      evalData.cumple_puntos_1000
    );

    // 3. Control de Reincidencia: si ya era condicionada y volvió a incumplir
    if (hadPreviousCondition && !cumpleTodo) {
      if ((resolution === 'condicionada' || resolution === 'aprobada') && !evalData.visto_bueno_reincidencia) {
        alert('⚠️ CANCELACIÓN POR REINCIDENCIA: El estudiante ya contaba con estatus de Beca Condicionada en el ciclo previo y ha vuelto a presentar incumplimientos. Por normativa institucional, la reincidencia conlleva a la CANCELACIÓN DE LA BECA, a menos que el Comité de Becas active el Visto Bueno Extraordinario.');
        return;
      }
    }

    let finalCond = evalData.condiciones.trim();
    if (resolution === 'condicionada' && !finalCond) {
      if (!evalData.pagos_al_corriente) finalCond = 'Regularización de pagos tardíos de colegiatura.';
      else if (!evalData.solicitud_a_tiempo) finalCond = 'Entrega extemporánea de informe de becario autorizada por el Comité.';
      else if (!evalData.esta_inscrito_proximo_ciclo) finalCond = 'Condicionada a completar la reinscripción al próximo periodo.';
      else if (!evalData.cumple_puntos_1000) finalCond = 'Autorización especial de puntos formativos cuatrimestrales.';
      else finalCond = 'Beca otorgada bajo acuerdo y condición especial del Comité de Becas.';
    }

    if (evalData.visto_bueno_reincidencia && evalData.motivo_visto_bueno.trim()) {
      finalCond = `${finalCond ? `${finalCond} - ` : ''}Visto Bueno Extraordinario Comité: ${evalData.motivo_visto_bueno.trim()}`;
    }

    notifyScholarshipResolution(
      evaluatingStudent.id,
      resolution,
      evalData.tipo_beca as any,
      evalData.porcentaje_beca,
      evalData.observaciones || (
        resolution === 'aprobada'
          ? (hadPreviousCondition && cumpleTodo
              ? 'Estatus condicionado superado con éxito. Beca ratificada regular en estatus APROBADA.'
              : 'Beca ratificada satisfactoriamente.')
          : resolution === 'condicionada'
          ? `Beca condicionada: ${finalCond}`
          : 'Baja reglamentaria.'
      ),
      finalCond
    );

    alert(
      resolution === 'aprobada'
        ? (hadPreviousCondition && cumpleTodo
            ? `🎉 ¡Beca ratificada y APROBADA en VERDE para ${evaluatingStudent.nombre}! (Condición previa superada exitosamente)`
            : `✓ Beca ratificada para ${evaluatingStudent.nombre}`)
        : resolution === 'condicionada'
        ? `⚠️ Beca CONDICIONADA registrada para ${evaluatingStudent.nombre} ${evalData.visto_bueno_reincidencia ? '(Con Visto Bueno por Reincidencia)' : ''}`
        : `✕ Baja de beca registrada para ${evaluatingStudent.nombre}`
    );
    setEvaluatingStudent(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Comisión General de Becas y Estímulos
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Gestión y Configuración del Sistema de Becas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convocatorias, auditoría de requisitos, ratificación de becas y asignaciones departamentales.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/importar"
            className="py-2.5 px-4 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-unipaz-orange" />
            <span>Carga Masiva (Excel / CSV)</span>
          </Link>
          <Link
            href="/admin/configuracion"
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configurador General PFI</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-unipaz-orange text-slate-950 shadow-md shadow-orange-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider">Becarios Activos</span>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black">{becarios.length}</div>
          <p className="text-[11px] font-medium opacity-90">
            {((becarios.length / (students.length || 1)) * 100).toFixed(1)}% de la matrícula total
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Sin Beca (Aspirantes)</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{studentsSinBeca.length}</div>
          <p className="text-[11px] text-slate-400">Disponibles para asignación</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Apoyo Departamental</span>
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{becariosDept.length}</div>
          <p className="text-[11px] text-slate-400">Biblioteca, INDE, DEDU y más</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Meta Obligatoria</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">1,000</div>
          <p className="text-[11px] text-slate-400">Puntos cuatrimestrales por becario</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('control')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'control'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <ToggleRight className="w-4 h-4" />
          Convocatorias & Asignación
        </button>

        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'solicitudes'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Directorio de Becarios & Ratificación ({becarios.length})
        </button>

        <button
          onClick={() => setActiveTab('departamentales')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'departamentales'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Becas Departamentales ({becariosDept.length})
        </button>

        <button
          onClick={() => setActiveTab('modalidades')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'modalidades'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Award className="w-4 h-4" />
          Modalidades de Becas ({modalidadesBeca.length})
        </button>

        <button
          onClick={() => setActiveTab('reglamento')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'reglamento'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Políticas y Reglamento
        </button>
      </div>

      {/* TAB 1: CONVOCATORIAS & ASIGNACIÓN */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control de Convocatoria */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-unipaz-orange" />
                  <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                    Periodo de Solicitud de Becas
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toggleScholarshipApplicationPeriod(
                      !pfiConfig.periodo_solicitud_becas_activo,
                      fechaInicio,
                      fechaFin
                    )
                  }
                  className={`py-1 px-3 rounded-full text-xs font-black transition-all ${
                    pfiConfig.periodo_solicitud_becas_activo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  {pfiConfig.periodo_solicitud_becas_activo ? '✓ Abierto' : '✕ Cerrado'}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Cuando está abierto, los aspirantes ven el banner de postulación a becas en su portal.
              </p>

              <form onSubmit={handleSaveDates} className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Fecha de Inicio:
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Fecha de Cierre:
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Vigencia de Convocatoria
                </button>
                {savedSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 text-center block animate-fadeIn">
                    ✓ Vigencia guardada correctamente
                  </span>
                )}
              </form>
            </div>

            {/* Control de Botones */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ToggleRight className="w-5 h-5 text-unipaz-orange" />
                <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                  Habilitación de Botones en el Expediente Estudiantil
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Controla qué formatos pueden ver y completar los estudiantes según el momento del ciclo cuatrimestral.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Switch Informe de Becario */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-unipaz-navy dark:text-white">
                        Botón "Informe Becario"
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Para refrendo cuatrimestral de becarios activos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBecarioReport(!pfiConfig.informe_becario_habilitado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pfiConfig.informe_becario_habilitado ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pfiConfig.informe_becario_habilitado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Estado: {pfiConfig.informe_becario_habilitado ? 'VISIBLE PARA BECARIOS' : 'OCULTO'}
                  </div>
                </div>

                {/* Switch Estudio Socioeconómico */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-unipaz-navy dark:text-white">
                        Botón "Estudio Socioeconómico"
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Para alumnos sin beca o en reincorporación por pérdida de beca.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSocioeconomicStudy(!pfiConfig.estudio_socioeconomico_habilitado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pfiConfig.estudio_socioeconomico_habilitado ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pfiConfig.estudio_socioeconomico_habilitado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Estado: {pfiConfig.estudio_socioeconomico_habilitado ? 'VISIBLE PARA ASPIRANTES' : 'OCULTO'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ASIGNACIÓN DIRECTA (SOLO ESTUDIANTES SIN BECA) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-unipaz-orange" />
                <div>
                  <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                    Asignación Directa de Beca Institucional
                  </h3>
                  <p className="text-xs text-slate-500">
                    Listado filtrado únicamente con estudiantes <strong>sin beca activa</strong> ({studentsSinBeca.length} candidatos).
                  </p>
                </div>
              </div>
            </div>

            {studentsSinBeca.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 font-medium">
                No hay estudiantes sin beca disponibles para asignación directa.
              </div>
            ) : (
              <form onSubmit={handleAssignRegularBeca} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Seleccionar Alumno Sin Beca:
                    </label>
                    <select
                      required
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">-- Seleccionar Alumno ({studentsSinBeca.length} disponibles) --</option>
                      {studentsSinBeca.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} {s.apellidos} ({s.matricula}) - {s.carrera} [{formatGradoAcademico(s)}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Modalidad de Beca:
                    </label>
                    <select
                      value={selectedTipoBeca}
                      onChange={(e) => setSelectedTipoBeca(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                    >
                      {modalidadesBeca.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Porcentaje:
                    </label>
                    <select
                      value={selectedPorcentaje}
                      onChange={(e) => setSelectedPorcentaje(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs text-slate-900 dark:text-white"
                    >
                      <option value="20">20%</option>
                      <option value="25">25%</option>
                      <option value="30">30%</option>
                      <option value="40">40%</option>
                      <option value="50">50%</option>
                      <option value="60">60%</option>
                      <option value="75">75%</option>
                      <option value="80">80%</option>
                      <option value="100">100%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Asignar Beca a Estudiante
                  </button>
                  {asignacionMsg && (
                    <span className="font-bold text-emerald-600 text-xs animate-fadeIn">
                      ✓ {asignacionMsg}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORIO DE BECARIOS & EVALUACIÓN */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar becario por nombre, matrícula o programa académico..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 self-center">
              Total Becados: {filteredBecarios.length}
            </span>
          </div>

          <div className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Programa Académico & Grado</th>
                    <th className="py-3 px-4">Beca / Descuento</th>
                    <th className="py-3 px-4 text-center">Puntos Cuatrimestrales</th>
                    <th className="py-3 px-4 text-center">Estatus Ratificación</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredBecarios.map((b) => {
                    const prog = calculateStudentScholarshipProgress(b, attendances, eventsMap);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-unipaz-navy dark:text-white">
                            {b.nombre} {b.apellidos}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                            <span>{b.matricula} · Prom: {b.promedio_academico || 9.0}</span>
                            {(b.proxima_carga_materias === 'minima' || b.carga_materias_actual === 'minima') && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-black text-[9px] uppercase">
                                🚫 Carga Mínima
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <div className="font-medium truncate max-w-[200px]">{b.carrera}</div>
                          <div className="text-[10px] text-slate-400">{formatGradoAcademico(b)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-black text-[11px] block w-fit">
                            {b.porcentaje_beca}% Descuento
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5 max-w-[180px]">
                            {b.tipo_beca}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-black text-xs text-unipaz-orange">
                            +{prog.puntosTotales} / 1,000 pts
                          </span>
                          <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="h-full bg-unipaz-orange rounded-full"
                              style={{ width: `${Math.min(100, prog.porcentajeCumplimiento)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {b.estatus_ratificacion_beca === 'ratificada' || (b.refrendo_beca_aprobado_admin && !b.refrendo_beca_condicionado_admin) ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Ratificada
                            </span>
                          ) : b.estatus_ratificacion_beca === 'condicionada' || b.refrendo_beca_condicionado_admin ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-black inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Condicionada
                            </span>
                          ) : b.estatus_ratificacion_beca === 'suspendida' || b.solicitud_beca_status === 'rechazada' || !b.tiene_beca ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[10px] font-black inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Baja / Suspendida
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                              ⏳ Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEvaluationModal(b)}
                            className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-sm"
                          >
                            Evaluar / Ratificar
                          </button>
                          <button
                            onClick={() => setSelectedStudentForDictamen(b)}
                            className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                          >
                            Dictamen PDF
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
      )}

      {/* TAB 3: BECAS DEPARTAMENTALES */}
      {activeTab === 'departamentales' && (
        <div className="space-y-6">
          {/* Gestor de Departamentos */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                  Catálogo de Departamentos Asignados
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Agrega o administra los departamentos universitarios donde los alumnos becarios pueden prestar labor cuatrimestral.
            </p>

            <form onSubmit={handleAddDepartamento} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Nombre del nuevo departamento (ej. Clínica Universitaria, Laboratorios)..."
                value={nuevoDepartamento}
                onChange={(e) => setNuevoDepartamento(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Departamento
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {departamentosDisponibles.map((dept) => (
                <span
                  key={dept}
                  className="py-1 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-white/10"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {dept}
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartamento(dept)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    title="Eliminar departamento"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Asignador Departamental */}
          <div className="p-6 rounded-3xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                  Creación y Asignación de Becarios Departamentales
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Al concluir el cuatrimestre y validar sus horas, se les liberan los <strong>1,000 puntos automáticos</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignDeptBeca} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estudiante:
                  </label>
                  <select
                    required
                    value={deptStudentId}
                    onChange={(e) => setDeptStudentId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="">-- Seleccionar Estudiante --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} {s.apellidos} ({s.matricula}) - {s.carrera}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento Asignado:
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  >
                    {departamentosDisponibles.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horas Semanales de Labor:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={deptHorasSemanales}
                    onChange={(e) => setDeptHorasSemanales(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Asignar a Departamento
                </button>
                {deptMsg && (
                  <span className="font-bold text-emerald-600 text-xs animate-fadeIn">
                    ✓ {deptMsg}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Tabla Departamental */}
          <div className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Becario</th>
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Horas Semanales</th>
                  <th className="py-3 px-4 text-center">Estado del Servicio</th>
                  <th className="py-3 px-4 text-right">Acción de Liberación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {becariosDept.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-unipaz-navy dark:text-white">
                        {b.nombre} {b.apellidos}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{b.matricula} · {b.carrera}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                      {b.departamento_beca}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {b.horas_departamentales_semanales || 10} hrs/sem
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.cumplimiento_departamental_acreditado ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          ✓ 1,000 Puntos Acreditados
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                          En Servicio Cuatrimestral
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          accreditDepartmentalService(
                            b.id,
                            !b.cumplimiento_departamental_acreditado,
                            'Validado por la Jefatura Departamental'
                          )
                        }
                        className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-colors ${
                          b.cumplimiento_departamental_acreditado
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {b.cumplimiento_departamental_acreditado ? 'Revocar Acreditación' : 'Liberar 1,000 Pts'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MODALIDADES DE BECA */}
      {activeTab === 'modalidades' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-unipaz-orange" />
              <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                Catálogo de Modalidades de Becas UNIPAZ
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agrega, edita o elimina modalidades de beca. Los cambios se sincronizan en los formularios de postulación y asignación.
            </p>
          </div>

          <form onSubmit={handleAddModalidad} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Nombre de la nueva modalidad de beca..."
              value={nuevaModalidad}
              onChange={(e) => setNuevaModalidad(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Modalidad
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {modalidadesBeca.map((mod) => (
              <div
                key={mod}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Award className="w-4 h-4 text-unipaz-orange flex-shrink-0" />
                  <span>{mod}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveModalidad(mod)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Eliminar modalidad"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REGLAMENTO */}
      {activeTab === 'reglamento' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
            <BookOpen className="w-5 h-5 text-unipaz-orange" />
            Normativa Institucional para Becarios UNIPAZ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
              <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                1. Regla de Puntos Cuatrimestrales
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Todo alumno con beca debe acumular obligatoriamente un mínimo de <strong>1,000 puntos cuatrimestrales</strong> en actividades formativas a nombre de UNIPAZ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
              <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                2. Escala de Puntos por Actividad
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                El mínimo por actividad son <strong>50 puntos</strong> y se asignan en <strong>múltiplos de 10</strong> (50, 60, 70, 80, 90, 100 pts).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
              <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                3. Promedio Académico y Cero Reprobaciones
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Beca de Excelencia: Promedio $\ge 9.0$. Beca Regular o Convenio: Promedio $\ge 8.0$. Es requisito indispensable no haber reprobado ninguna materia ni presentado extraordinarios.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
              <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                4. Refrendo Cuatrimestral vs Estudio Socioeconómico
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Para el refrendo ordinario continuo, el alumno becado únicamente entrega su <strong>Informe de Becario</strong>. El Estudio Socioeconómico solo es requerido para nueva postulación o recuperación por pérdida previa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EVALUACIÓN Y RATIFICACIÓN NORMATIVA DE BECA */}
      {evaluatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEvaluatingStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-unipaz-orange text-slate-950 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                  Comité de Becas · Auditoría Reglamentaria
                </span>
                <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
                  Ratificación de Beca: {evaluatingStudent.nombre} {evaluatingStudent.apellidos}
                </h3>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 mt-0.5">
                  <span>{evaluatingStudent.matricula}</span>
                  <span>·</span>
                  <span>{evaluatingStudent.carrera}</span>
                  <span>·</span>
                  <span className="font-bold text-unipaz-navy dark:text-slate-200">{formatGradoAcademico(evaluatingStudent)}</span>
                </div>
              </div>
            </div>

            {/* Banner de Periodo Académico */}
            <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {evaluatingStudent.carrera?.toUpperCase().includes('MÉDICO CIRUJANO') || evaluatingStudent.carrera?.toUpperCase().includes('MEDICO CIRUJANO')
                    ? 'Programa Semestral: Evaluando ciclo 902 (Febrero-Julio) para ratificar ciclo 903'
                    : 'Programa Cuatrimestral: Evaluando ciclo 187 (Mayo-Agosto) para ratificar ciclo 188'}
                </span>
              </div>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                Promedio: {evaluatingStudent.promedio_academico || 9.0}
              </span>
            </div>

            {/* CONTROL DE ANTECEDENTE CONDICIONADO / REINCIDENCIA */}
            {(evaluatingStudent.estatus_ratificacion_beca === 'condicionada' || evaluatingStudent.refrendo_beca_condicionado_admin || evaluatingStudent.habia_tenido_beca_condicionada) && (
              evalData.sin_reprobadas && evalData.pagos_al_corriente && evalData.solicitud_a_tiempo && evalData.sin_sanciones && evalData.esta_inscrito_proximo_ciclo && evalData.cumple_puntos_1000 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>🌟 Regularización Completa de Beca</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-6">
                    El estudiante superó su condición previa al cumplir con el <strong>100% de los requisitos reglamentarios</strong> en este periodo. Al hacer clic en <strong>"Ratificar y Aprobar"</strong>, su estatus cambiará formalmente a <strong>APROBADA (limpia en verde)</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-900 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>⚠️ Alerta Normativa de Reincidencia en Beca Condicionada</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    El alumno ya contaba con estatus de <strong>Beca Condicionada</strong> el periodo previo y ha vuelto a presentar incumplimiento parcial. Por normativa institucional, la reincidencia amerita la <strong>CANCELACIÓN / BAJA DE LA BECA</strong>, salvo que el Comité emita un <strong>Visto Bueno Extraordinario</strong>.
                  </p>

                  {/* Switch de Visto Bueno Extraordinario del Comité */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                        ¿Otorgar Visto Bueno Extraordinario del Comité de Becas?
                      </span>
                      <button
                        type="button"
                        onClick={() => setEvalData((p) => ({ ...p, visto_bueno_reincidencia: !p.visto_bueno_reincidencia }))}
                        className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                          evalData.visto_bueno_reincidencia
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {evalData.visto_bueno_reincidencia ? '✓ Visto Bueno Autorizado' : '✕ Sin Visto Bueno (Baja)'}
                      </button>
                    </div>

                    {evalData.visto_bueno_reincidencia && (
                      <input
                        type="text"
                        placeholder="Justificación o número de acuerdo extraordinario del Comité..."
                        value={evalData.motivo_visto_bueno}
                        onChange={(e) => setEvalData((p) => ({ ...p, motivo_visto_bueno: e.target.value }))}
                        className="w-full bg-amber-50/50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/30 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              )
            )}

            {/* ALERTA DE BAJA DIRECTA SI REPROBÓ MATERIAS */}
            {!evalData.sin_reprobadas && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-2 font-black text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>⚠️ Criterio No Negociable de Baja Reglamentaria</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-6">
                  El reglamento de becas UNIPAZ estipula que haber reprobado una materia en periodo ordinario amerita la <strong>baja directa de la beca</strong>, aun si el alumno aprobó la materia posteriormente mediante examen extraordinario.
                </p>
              </div>
            )}

            {/* ALERTA DE EXCLUSIÓN POR CARGA MÍNIMA */}
            {evalData.proxima_carga_materias === 'minima' && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/40 text-purple-950 dark:text-purple-200 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-2 font-black text-xs text-purple-900 dark:text-purple-300">
                  <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>🚫 Exclusión Normativa: Carga Mínima de Materias</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-6">
                  Al cursar la mitad de materias, el estudiante cubre el 50% de la colegiatura normal. Por reglamento institucional, los alumnos con <strong>Carga Mínima</strong> no pueden ser acreedores a becas ni refrendos mientras mantengan dicho esquema.
                </p>
              </div>
            )}

            {/* Checklist de Criterios Normativos */}
            <div className="space-y-2.5">
              <span className="font-black text-xs text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                Verificación de Criterios del Comité:
              </span>

              {/* 1. Cero Reprobadas (Baja Directa si falla) */}
              <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                evalData.sin_reprobadas
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30'
              }`}>
                <div>
                  <h4 className="font-bold text-xs">1. Historial de Acreditación (Cero Reprobadas)</h4>
                  <p className="text-[11px] text-slate-500">Sin materias reprobadas en ordinario ni extraordinarios.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, sin_reprobadas: !p.sin_reprobadas }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.sin_reprobadas
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-600 text-white shadow-sm'
                  }`}
                >
                  {evalData.sin_reprobadas ? '✓ Sin Reprobadas' : '🔴 Reprobó Materia (Baja Directa)'}
                </button>
              </div>

              {/* 2. Carga Académica de Materias (Normal vs Mínima) */}
              <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                evalData.proxima_carga_materias === 'normal'
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10'
                  : 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-500/30'
              }`}>
                <div>
                  <h4 className="font-bold text-xs">2. Carga Académica para el Próximo Ciclo</h4>
                  <p className="text-[11px] text-slate-500">Carga completa de materias vs Carga Mínima (50% colegiatura - No Aplica Beca).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, proxima_carga_materias: p.proxima_carga_materias === 'normal' ? 'minima' : 'normal' }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.proxima_carga_materias === 'normal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-purple-600 text-white shadow-sm'
                  }`}
                >
                  {evalData.proxima_carga_materias === 'normal' ? '✓ Carga Regular (Aplica Beca)' : '🚫 Carga Mínima (No Aplica Beca)'}
                </button>
              </div>

              {/* 3. Pagos de Colegiatura e Inscripción */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">3. Pagos de Colegiatura e Inscripción</h4>
                  <p className="text-[11px] text-slate-500">Pagos al corriente en tiempo o con autorización de tolerancia.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, pagos_al_corriente: !p.pagos_al_corriente }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.pagos_al_corriente
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.pagos_al_corriente ? '✓ Al Corriente' : '🟡 Pagos Tardíos (Condicionante)'}
                </button>
              </div>

              {/* 4. Entrega de Informe de Becario */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">4. Entrega de Informe de Becario</h4>
                  <p className="text-[11px] text-slate-500">Entregó su informe cuatrimestral dentro del plazo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, solicitud_a_tiempo: !p.solicitud_a_tiempo }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.solicitud_a_tiempo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.solicitud_a_tiempo ? '✓ En Tiempo' : '🟡 Fuera de Tiempo (Condicionante)'}
                </button>
              </div>

              {/* 5. Inscripción al Periodo por Venir */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">5. Inscripción para el Próximo Periodo</h4>
                  <p className="text-[11px] text-slate-500">Las becas se ratifican para el cuatrimestre por venir.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, esta_inscrito_proximo_ciclo: !p.esta_inscrito_proximo_ciclo }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.esta_inscrito_proximo_ciclo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.esta_inscrito_proximo_ciclo ? '✓ Inscrito al Siguiente Ciclo' : '🟡 Pendiente Reinscripción (Condicionante)'}
                </button>
              </div>

              {/* 6. Historial Disciplinario */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">6. Historial Disciplinario</h4>
                  <p className="text-[11px] text-slate-500">Sin sanciones graves ni actas administrativas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, sin_sanciones: !p.sin_sanciones }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.sin_sanciones
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  {evalData.sin_sanciones ? '✓ Expediente Limpio' : '✕ Con Sanción'}
                </button>
              </div>
            </div>

            {/* Modificación de Modalidad y Porcentaje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Modalidad de Beca:
                </label>
                <select
                  value={evalData.tipo_beca}
                  onChange={(e) => setEvalData((p) => ({ ...p, tipo_beca: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {modalidadesBeca.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Porcentaje de Descuento:
                </label>
                <select
                  value={evalData.porcentaje_beca}
                  onChange={(e) => setEvalData((p) => ({ ...p, porcentaje_beca: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs text-slate-900 dark:text-white"
                >
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                  <option value="30">30%</option>
                  <option value="40">40%</option>
                  <option value="50">50%</option>
                  <option value="60">60%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                  <option value="100">100%</option>
                </select>
              </div>
            </div>

            {/* Campo de Condiciones para Beca Condicionada */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-1.5">
              <label className="block font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Condición / Compromiso del Alumno (Para "Beca Condicionada"):
              </label>
              <input
                type="text"
                value={evalData.condiciones}
                onChange={(e) => setEvalData((p) => ({ ...p, condiciones: e.target.value }))}
                placeholder="ej. Entregó informe fuera de tiempo / Pagos tardíos / Pendiente inscripción..."
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 rounded-xl p-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                Observaciones Generales del Dictamen:
              </label>
              <textarea
                rows={2}
                value={evalData.observaciones}
                onChange={(e) => setEvalData((p) => ({ ...p, observaciones: e.target.value }))}
                placeholder="Notas adicionales para el expediente..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* ACCIONES FINALES: 3 RESOLUCIONES NORMATIVAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
              {/* Botón 1: Rechazar / Baja */}
              <button
                type="button"
                onClick={() => handleSaveEvaluation('rechazada')}
                className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102"
              >
                <XCircle className="w-4 h-4" />
                {evalData.proxima_carga_materias === 'minima' ? 'No Aplica (Carga Mínima)' : 'Rechazar / Baja de Beca'}
              </button>

              {/* Botón 2: Beca Condicionada (Amarillo) */}
              <button
                type="button"
                onClick={() => handleSaveEvaluation('condicionada')}
                disabled={evalData.proxima_carga_materias === 'minima'}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                  evalData.proxima_carga_materias !== 'minima'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-102'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title={evalData.proxima_carga_materias === 'minima' ? 'No aplica beca por carga mínima' : 'Beca Condicionada'}
              >
                <AlertTriangle className="w-4 h-4" />
                Beca Condicionada
              </button>

              {/* Botón 3: Ratificar y Aprobar Beca (Verde) */}
              <button
                type="button"
                onClick={() => handleSaveEvaluation('aprobada')}
                disabled={!evalData.sin_reprobadas || evalData.proxima_carga_materias === 'minima'}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                  evalData.sin_reprobadas && evalData.proxima_carga_materias !== 'minima'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-102'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title={
                  evalData.proxima_carga_materias === 'minima'
                    ? 'No aplica beca por cursar carga mínima de materias'
                    : !evalData.sin_reprobadas
                    ? 'No permitido por reglamento si reprobó materias'
                    : 'Ratificar beca'
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                Ratificar y Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Dictamen Oficial */}
      {selectedStudentForDictamen && (
        <ScholarshipRenewalDictamenModal
          isOpen={true}
          onClose={() => setSelectedStudentForDictamen(null)}
          student={selectedStudentForDictamen}
          scholarshipProgress={getStudentScholarshipProgress(selectedStudentForDictamen.id)}
        />
      )}
    </div>
  );
}
