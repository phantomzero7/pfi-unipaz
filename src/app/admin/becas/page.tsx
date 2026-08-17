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

  const [activeTab, setActiveTab] = useState<'control' | 'solicitudes' | 'departamentales' | 'reglamento'>('control');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDictamen, setSelectedStudentForDictamen] = useState<UserProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State para Fechas de Convocatoria
  const [fechaInicio, setFechaInicio] = useState(pfiConfig.fecha_inicio_solicitud_becas || '2026-09-01');
  const [fechaFin, setFechaFin] = useState(pfiConfig.fecha_fin_solicitud_becas || '2026-09-25');

  // Form State para Asignación de Beca Regular
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>('Excelencia Académica (Promedio 9.6 - 10.0)');
  const [selectedPorcentaje, setSelectedPorcentaje] = useState<number>(50);
  const [promedioAsignado, setPromedioAsignado] = useState<number>(9.5);
  const [asignacionMsg, setAsignacionMsg] = useState<string | null>(null);

  // Form State para Asignación de Beca Departamental (Biblioteca, INDE, DEDU)
  const [deptStudentId, setDeptStudentId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Biblioteca');
  const [deptPorcentaje, setDeptPorcentaje] = useState<number>(50);
  const [deptHorasSemanales, setDeptHorasSemanales] = useState<number>(10);
  const [deptPromedio, setDeptPromedio] = useState<number>(9.2);
  const [deptMsg, setDeptMsg] = useState<string | null>(null);

  // Modal de Dictamen / Refrendo
  const [selectedStudentForResolution, setSelectedStudentForResolution] = useState<UserProfile | null>(null);
  const [resolutionData, setResolutionData] = useState({
    aprobado: true,
    tipo_beca: 'Excelencia Académica (Promedio 9.6 - 10.0)',
    porcentaje: 50,
    observaciones: '',
  });

  const students = useMemo(() => profiles.filter((p) => p.role === 'estudiante'), [profiles]);
  const becarios = useMemo(() => students.filter((s) => s.tiene_beca), [students]);
  const becariosDept = useMemo(() => students.filter((s) => s.es_becario_departamental), [students]);
  const solicitudesPendientes = useMemo(() => students.filter((s) => s.solicitud_beca_status === 'enviada' || s.solicitud_beca_status === 'en_evaluacion'), [students]);
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
      alert('Selecciona un estudiante.');
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
    setTimeout(() => setDeptMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header & Sub-Navigation Tabs */}
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
            Convocatorias, habilitación de refrendos, asignación de becas departamentales y dictámenes oficiales cuatrimestrales.
          </p>
        </div>

        {/* Acceso Rápido a Configuración General PFI */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/configuracion"
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configurador General PFI</span>
          </Link>
        </div>
      </div>

      {/* KPI CARDS DE BECAS */}
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
            <span className="text-[11px] font-black uppercase tracking-wider">Apoyo Departamental</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{becariosDept.length}</div>
          <p className="text-[11px] text-slate-400">
            Biblioteca, INDE y DEDU (1,000 pts cuatrimestrales)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Solicitudes Nuevas</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{solicitudesPendientes.length}</div>
          <p className="text-[11px] text-slate-400">
            {pfiConfig.periodo_solicitud_becas_activo ? 'Convocatoria Abierta' : 'Convocatoria Cerrada'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Meta Obligatoria</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">1,000</div>
          <p className="text-[11px] text-slate-400">
            Puntos cuatrimestrales por becario
          </p>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN INTERNA */}
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
          Convocatorias & Botones
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
          Directorio de Becarios ({becarios.length})
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

      {/* CONTENIDO DE PESTAÑA 1: CONVOCATORIAS Y BOTONES */}
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

            {/* Control de Botones de Alumnos */}
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

          {/* ASIGNACIÓN DE BECA REGULAR A ESTUDIANTE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-unipaz-orange" />
              <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                Asignación / Modificación Directa de Beca Institucional
              </h3>
            </div>
            <form onSubmit={handleAssignRegularBeca} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Seleccionar Estudiante:
                  </label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    <option value="">-- Seleccionar Alumno --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} {s.apellidos} ({s.matricula}) - {s.carrera} {s.tiene_beca ? `[Becado ${s.porcentaje_beca}%]` : '[Sin Beca]'}
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
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Porcentaje:
                  </label>
                  <select
                    value={selectedPorcentaje}
                    onChange={(e) => setSelectedPorcentaje(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
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
                  Asignar / Actualizar Beca
                </button>
                {asignacionMsg && (
                  <span className="font-bold text-emerald-600 text-xs animate-fadeIn">
                    ✓ {asignacionMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 2: DIRECTORIO DE BECARIOS */}
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
                    <th className="py-3 px-4 text-center">Refrendo Admin</th>
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
                          <div className="text-[10px] font-mono text-slate-400 font-bold">
                            {b.matricula} · Prom: {b.promedio_academico || 9.0}
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
                          {b.refrendo_beca_aprobado_admin ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                              ✓ Aprobado Oficial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                              En Evaluación
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudentForDictamen(b)}
                            className="py-1 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                          >
                            Ver Dictamen
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

      {/* CONTENIDO DE PESTAÑA 3: BECAS DEPARTAMENTALES */}
      {activeTab === 'departamentales' && (
        <div className="space-y-6">
          {/* Asignador Departamental */}
          <div className="p-6 rounded-3xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-black text-unipaz-navy dark:text-white">
                  Creación y Asignación de Becarios Departamentales
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Asigna estudiantes a Biblioteca, INDE o DEDU. Al concluir el cuatrimestre se les liberan los <strong>1,000 puntos automáticos</strong>.
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
                    <option value="Biblioteca">Biblioteca</option>
                    <option value="INDE (Instituto de Investigación e Innovación)">INDE (Investigación)</option>
                    <option value="DEDU (Dirección de Extensión y Difusión)">DEDU (Difusión)</option>
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

          {/* Lista de Becarios Departamentales */}
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

      {/* CONTENIDO DE PESTAÑA 4: REGLAMENTO Y POLÍTICAS */}
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
                El mínimo por actividad son <strong>50 puntos</strong> y se asignan en <strong>múltiplos de 10</strong> (50, 60, 70, 80, 90, 100 pts). No hay límite máximo de acumulación.
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
