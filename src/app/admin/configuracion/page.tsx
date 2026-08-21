'use client';

import React, { useState } from 'react';
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
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import {
  CATEGORIAS_PFI_OFICIALES,
  EventCategory,
  PFICategoryConfig,
  PFIGlobalSignatures,
  ServicioBecarioDept,
} from '@/lib/types';

export default function AdminConfiguracionPage() {
  const {
    pfiConfig,
    updateGlobalConfig,
    events,
    profiles,
    assignEventToStudent,
    batchAssignPVCByCohort,
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    setCurrentAcademicPeriod,
    addPFICategory,
    updatePFICategory,
    deletePFICategoryWithReassign,
    addServicioBecarioDept,
    updateServicioBecarioDept,
    deleteServicioBecarioDept,
  } = usePFI();

  const [activeTab, setActiveTab] = useState<
    'periodos' | 'categorias' | 'expediente' | 'servicio_becario' | 'firmas' | 'pvc'
  >('periodos');

  // Estados para Periodos Académicos
  const [newPeriodCodigo, setNewPeriodCodigo] = useState('');
  const [newPeriodNombre, setNewPeriodNombre] = useState('');
  const [newPeriodTipo, setNewPeriodTipo] = useState<'cuatrimestral' | 'semestral'>('cuatrimestral');
  const [newPeriodInicio, setNewPeriodInicio] = useState('2026-09-01');
  const [newPeriodFin, setNewPeriodFin] = useState('2026-12-31');
  const [newPeriodDesc, setNewPeriodDesc] = useState('');
  const [periodMsg, setPeriodMsg] = useState<string | null>(null);

  // Estados para Categorías PFI
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PFICategoryConfig | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<PFICategoryConfig, 'id'>>({
    nombre: '',
    descripcion: '',
    horas_default: 5.0,
    color: '#002855',
    icono: 'Sparkles',
    activa: true,
  });

  // Modal de advertencia para eliminar/reasignar categoría
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PFICategoryConfig | null>(null);
  const [reassignCategoryTarget, setReassignCategoryTarget] = useState<string>('Académico');
  const [categoryActionMsg, setCategoryActionMsg] = useState<string | null>(null);

  // Estados para Departamentos de Servicio Becario
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<ServicioBecarioDept | null>(null);
  const [deptForm, setDeptForm] = useState<Omit<ServicioBecarioDept, 'id'>>({
    nombre: '',
    descripcion: '',
    encargado: '',
    cupo_maximo: 8,
    cupo_ocupado: 0,
    activo: true,
  });

  // Estados para Habilitación de Botones en Expediente Estudiantil
  const [savedButtonsSuccess, setSavedButtonsSuccess] = useState(false);

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
  const categoriesList = pfiConfig.categoriasPfiCatalog || CATEGORIAS_PFI_OFICIALES;
  const deptList = pfiConfig.departamentosServicioBecario || [];

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodCodigo.trim() || !newPeriodNombre.trim()) return;
    const res = addAcademicPeriod({
      codigo: newPeriodCodigo.trim(),
      nombre: newPeriodNombre.trim(),
      tipo: newPeriodTipo,
      fecha_inicio: newPeriodInicio,
      fecha_fin: newPeriodFin,
      es_actual: false,
      descripcion: newPeriodDesc.trim() || `Periodo oficial ${newPeriodTipo}`,
    });
    setPeriodMsg(res.message);
    setNewPeriodCodigo('');
    setNewPeriodNombre('');
    setNewPeriodDesc('');
    setTimeout(() => setPeriodMsg(null), 4000);
  };

  // Manejo de Categorías PFI
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nombre.trim()) return;

    if (editingCategory) {
      updatePFICategory(editingCategory.id, categoryForm);
      setCategoryActionMsg(`Categoría "${categoryForm.nombre}" actualizada.`);
    } else {
      addPFICategory(categoryForm);
      setCategoryActionMsg(`Categoría "${categoryForm.nombre}" creada.`);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    setTimeout(() => setCategoryActionMsg(null), 4000);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const res = deletePFICategoryWithReassign(categoryToDelete.id, reassignCategoryTarget);
    setCategoryActionMsg(res.message);
    setShowDeleteCategoryModal(false);
    setCategoryToDelete(null);
    setTimeout(() => setCategoryActionMsg(null), 5000);
  };

  // Manejo de Departamentos
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.nombre.trim()) return;

    if (editingDept) {
      updateServicioBecarioDept(editingDept.id, deptForm);
    } else {
      addServicioBecarioDept(deptForm);
    }

    setShowDeptModal(false);
    setEditingDept(null);
  };

  const handleSaveButtonsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedButtonsSuccess(true);
    setTimeout(() => setSavedButtonsSuccess(false), 3000);
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
      alert(`No se encontró el evento plantilla para PVC Nivel ${level}. Asegúrate de crearlo en la pestaña de Eventos.`);
      return;
    }
    setBatchResult({
      title: `Asignación Masiva: PVC Módulo ${level}`,
      assigned: res.assignedCount,
      skipped: res.skippedAlreadyPassed,
    });
    setTimeout(() => setBatchResult(null), 6000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Parámetros Globales PFI
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Configuración y Parámetros del Sistema
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Periodos vigentes, 8 categorías PFI, botones del expediente, catálogo de servicio becario y firmas oficiales.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('periodos')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'periodos'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Clock className="w-4 h-4" />
          1. Periodos Académicos
        </button>

        <button
          onClick={() => setActiveTab('categorias')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'categorias'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. 8 Categorías PFI Oficiales ({categoriesList.length})
        </button>

        <button
          onClick={() => setActiveTab('expediente')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'expediente'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          3. Botones en Expediente Estudiantil
        </button>

        <button
          onClick={() => setActiveTab('servicio_becario')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'servicio_becario'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          4. Catálogo de Servicio Becario ({deptList.length})
        </button>

        <button
          onClick={() => setActiveTab('firmas')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'firmas'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <PenTool className="w-4 h-4" />
          5. Firmantes Oficiales
        </button>

        <button
          onClick={() => setActiveTab('pvc')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'pvc'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          6. Asignador de Módulos PVC
        </button>
      </div>

      {categoryActionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn">
          {categoryActionMsg}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: PERIODOS ACADÉMICOS                               */}
      {/* ======================================================== */}
      {activeTab === 'periodos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                    Periodos Cuatrimestrales y Semestrales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Marca cuál es el periodo activo. Las estadísticas y filtros se sincronizan automáticamente.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(pfiConfig.periodosAcademicos || []).map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      p.es_actual
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border-unipaz-orange/60 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-unipaz-orange">
                          Periodo {p.codigo}
                        </span>
                        <strong className="text-xs text-unipaz-navy dark:text-white">
                          {p.nombre}
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                          {p.tipo}
                        </span>
                        {p.es_actual && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-bold">
                            ✓ Periodo Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {p.fecha_inicio} a {p.fecha_fin} · {p.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!p.es_actual && (
                        <button
                          onClick={() => setCurrentAcademicPeriod(p.id, p.tipo)}
                          className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Establecer Activo
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar periodo ${p.codigo}?`)) {
                            deleteAcademicPeriod(p.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Eliminar Periodo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulario Crear Periodo */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-unipaz-orange" />
                Registrar Nuevo Periodo
              </h4>

              {periodMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold">
                  {periodMsg}
                </div>
              )}

              <form onSubmit={handleAddPeriod} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Código Oficial:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 188 o 903"
                    value={newPeriodCodigo}
                    onChange={(e) => setNewPeriodCodigo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre / Meses:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Septiembre - Diciembre 2026"
                    value={newPeriodNombre}
                    onChange={(e) => setNewPeriodNombre(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Tipo de Modalidad:</label>
                  <select
                    value={newPeriodTipo}
                    onChange={(e) => setNewPeriodTipo(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="cuatrimestral">Cuatrimestral (Licenciaturas y Posgrados)</option>
                    <option value="semestral">Semestral (Médico Cirujano)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Inicio:</label>
                    <input
                      type="date"
                      value={newPeriodInicio}
                      onChange={(e) => setNewPeriodInicio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Fin:</label>
                    <input
                      type="date"
                      value={newPeriodFin}
                      onChange={(e) => setNewPeriodFin(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs shadow-md transition-all mt-2"
                >
                  Agregar Periodo
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CRUD 8 CATEGORÍAS PFI OFICIALES                   */}
      {/* ======================================================== */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-unipaz-orange" />
                  Catálogo Oficial de Categorías PFI
                </h3>
                <p className="text-xs text-slate-500">
                  Gestión de las 8 categorías formativas normativas. Si modificas o eliminas una categoría existente, el sistema solicitará la reasignación en cascada para proteger las actividades y asistencias de los estudiantes.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({
                    nombre: '',
                    descripcion: '',
                    horas_default: 5.0,
                    color: '#002855',
                    icono: 'Sparkles',
                    activa: true,
                  });
                  setShowCategoryModal(true);
                }}
                className="py-2.5 px-4 rounded-2xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría PFI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesList.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        0{idx + 1} · Categoría PFI
                      </span>
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: cat.color || '#002855' }}
                      />
                    </div>
                    <h4 className="text-sm font-black text-unipaz-navy dark:text-white">
                      {cat.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {cat.descripcion}
                    </p>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold pt-1">
                      Horas Sugeridas: {(cat.horas_default || 5.0).toFixed(1)} hrs
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryForm({
                          nombre: cat.nombre,
                          descripcion: cat.descripcion || '',
                          horas_default: cat.horas_default || 5.0,
                          color: cat.color || '#002855',
                          icono: cat.icono || 'Sparkles',
                          activa: cat.activa ?? cat.activo ?? true,
                        });
                        setShowCategoryModal(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setCategoryToDelete(cat);
                        const otherCat = categoriesList.find((c) => c.id !== cat.id);
                        setReassignCategoryTarget(otherCat?.nombre || 'Académico');
                        setShowDeleteCategoryModal(true);
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Eliminar Categoría con Reasignación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HABILITACIÓN DE BOTONES EN EXPEDIENTE ESTUDIANTIL  */}
      {/* ======================================================== */}
      {activeTab === 'expediente' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-unipaz-orange" />
                Habilitación de Botones y Trámites en el Expediente Estudiantil
              </h3>
              <p className="text-xs text-slate-500">
                Controla qué acciones y botones están disponibles para los estudiantes en sus portales personales.
              </p>
            </div>
            {savedButtonsSuccess && (
              <span className="text-xs font-bold text-emerald-600">✓ Configuración Actualizada</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1: Subida de Informe de Becario */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <strong className="text-xs text-unipaz-navy dark:text-white block">Botón: Subir Informe de Becario</strong>
                <span className="text-[11px] text-slate-500">Permite al estudiante cargar su reporte de actividades cuatrimestral.</span>
              </div>
              <button
                onClick={() => {
                  updateGlobalConfig({
                    habilitar_subida_informe_becario: !pfiConfig.habilitar_subida_informe_becario,
                  });
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all ${
                  pfiConfig.habilitar_subida_informe_becario
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {pfiConfig.habilitar_subida_informe_becario ? 'Habilitado' : 'Deshabilitado'}
              </button>
            </div>

            {/* Toggle 2: Solicitud de Estudio Socioeconómico */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <strong className="text-xs text-unipaz-navy dark:text-white block">Botón: Estudio Socioeconómico</strong>
                <span className="text-[11px] text-slate-500">Habilita el formulario para aspirantes a beca socioeconómica.</span>
              </div>
              <button
                onClick={() => {
                  updateGlobalConfig({
                    habilitar_estudio_socioeconomico: !pfiConfig.habilitar_estudio_socioeconomico,
                  });
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all ${
                  pfiConfig.habilitar_estudio_socioeconomico
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {pfiConfig.habilitar_estudio_socioeconomico ? 'Habilitado' : 'Deshabilitado'}
              </button>
            </div>

            {/* Toggle 3: Postulación a Roles Especiales (Staff / Ponente) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <strong className="text-xs text-unipaz-navy dark:text-white block">Botón: Postularse como Staff / Ponente</strong>
                <span className="text-[11px] text-slate-500">Permite a los estudiantes enviar solicitudes de rol en actividades.</span>
              </div>
              <button
                onClick={() => {
                  updateGlobalConfig({
                    habilitar_postulacion_roles: !pfiConfig.habilitar_postulacion_roles,
                  });
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all ${
                  pfiConfig.habilitar_postulacion_roles !== false
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {pfiConfig.habilitar_postulacion_roles !== false ? 'Habilitado' : 'Deshabilitado'}
              </button>
            </div>

            {/* Toggle 4: Periodo General de Becas Activo */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <strong className="text-xs text-unipaz-navy dark:text-white block">Módulo de Solicitud de Becas</strong>
                <span className="text-[11px] text-slate-500">Muestra u oculta la tarjeta de convocatoria en el dashboard estudiantil.</span>
              </div>
              <button
                onClick={() => {
                  updateGlobalConfig({
                    periodo_solicitud_becas_activo: !pfiConfig.periodo_solicitud_becas_activo,
                  });
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all ${
                  pfiConfig.periodo_solicitud_becas_activo
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {pfiConfig.periodo_solicitud_becas_activo ? 'Habilitado' : 'Deshabilitado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CATÁLOGO DE SERVICIO BECARIO                      */}
      {/* ======================================================== */}
      {activeTab === 'servicio_becario' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Catálogo de Departamentos para Servicio Becario
                </h3>
                <p className="text-xs text-slate-500">
                  Departamentos y áreas universitarias donde los estudiantes becarios pueden realizar su servicio institucional.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingDept(null);
                  setDeptForm({
                    nombre: '',
                    descripcion: '',
                    encargado: '',
                    cupo_maximo: 8,
                    cupo_ocupado: 0,
                    activo: true,
                  });
                  setShowDeptModal(true);
                }}
                className="py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Nuevo Departamento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptList.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
                        Cupo: {d.cupo_ocupado || 0} / {d.cupo_maximo} becarios
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {d.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-unipaz-navy dark:text-white">
                      {d.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {d.descripcion}
                    </p>
                    {d.encargado && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Responsable: <strong>{d.encargado}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => {
                        setEditingDept(d);
                        setDeptForm({
                          nombre: d.nombre,
                          descripcion: d.descripcion,
                          encargado: d.encargado || '',
                          cupo_maximo: d.cupo_maximo,
                          cupo_ocupado: d.cupo_ocupado || 0,
                          activo: d.activo,
                        });
                        setShowDeptModal(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el departamento "${d.nombre}"?`)) {
                          deleteServicioBecarioDept(d.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Eliminar Departamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FIRMANTES OFICIALES                               */}
      {/* ======================================================== */}
      {activeTab === 'firmas' && (
        <form onSubmit={handleSaveSignatures} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-unipaz-orange" />
                Firmantes Oficiales de Constancias PFI y Certificados
              </h3>
              <p className="text-xs text-slate-500">
                Nombres y cargos que se imprimirán en las constancias con valor curricular y códigos de validación QR.
              </p>
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {savedSignaturesSuccess ? '¡Firmas Guardadas!' : 'Guardar Firmas'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
              <span className="font-bold text-xs text-unipaz-navy dark:text-white block">Firmante 1: Extensión y Difusión</span>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  value={localSignatures.extensionNombre}
                  onChange={(e) => setLocalSignatures({ ...localSignatures, extensionNombre: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Cargo Oficial:</label>
                <input
                  type="text"
                  value={localSignatures.extensionCargo}
                  onChange={(e) => setLocalSignatures({ ...localSignatures, extensionCargo: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
              <span className="font-bold text-xs text-unipaz-navy dark:text-white block">Firmante 2: Control Escolar</span>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  value={localSignatures.controlEscolarNombre}
                  onChange={(e) => setLocalSignatures({ ...localSignatures, controlEscolarNombre: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Cargo Oficial:</label>
                <input
                  type="text"
                  value={localSignatures.controlEscolarCargo}
                  onChange={(e) => setLocalSignatures({ ...localSignatures, controlEscolarCargo: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 6: ASIGNADOR DE MÓDULOS PVC                          */}
      {/* ======================================================== */}
      {activeTab === 'pvc' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-unipaz-orange" />
              Asignación Masiva de Módulos PVC por Generación
            </h3>
            <p className="text-xs text-slate-500">
              Acredita automáticamente los módulos obligatorios de Plan de Vida y Carrera (PVC) a las cohortes correspondientes sin duplicar acreditaciones previas.
            </p>

            {batchResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn">
                ✓ {batchResult.title}: {batchResult.assigned} estudiantes acreditados, {batchResult.skipped} omitidos (ya contaban con acreditación).
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleBatchPVC(1)}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-orange-50 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-2 transition-all hover:scale-102 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-unipaz-orange flex items-center justify-center font-black">
                  I
                </div>
                <strong className="text-xs text-unipaz-navy dark:text-white group-hover:text-unipaz-orange">
                  PVC Módulo 1 (25 hrs)
                </strong>
                <span className="text-[10px] text-slate-500">1° a 3° Cuatrimestre</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchPVC(2)}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-2 transition-all hover:scale-102 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                  II
                </div>
                <strong className="text-xs text-unipaz-navy dark:text-white group-hover:text-blue-600">
                  PVC Módulo 2 (25 hrs)
                </strong>
                <span className="text-[10px] text-slate-500">4° a 6° Cuatrimestre</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchPVC(3)}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-2 transition-all hover:scale-102 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                  III
                </div>
                <strong className="text-xs text-unipaz-navy dark:text-white group-hover:text-emerald-600">
                  PVC Módulo 3 (25 hrs)
                </strong>
                <span className="text-[10px] text-slate-500">7° a 9° Cuatrimestre</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CATEGORÍA PFI */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-unipaz-orange text-white">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Catálogo PFI</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  {editingCategory ? 'Editar Categoría PFI' : 'Nueva Categoría PFI'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre de la Categoría:</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                  placeholder="ej. Conciencia Ecológica"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descripción Formativa:</label>
                <textarea
                  rows={2}
                  value={categoryForm.descripcion}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })}
                  placeholder="Alcance y actividades comprendidas..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Horas Sugeridas:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={categoryForm.horas_default}
                    onChange={(e) => setCategoryForm({ ...categoryForm, horas_default: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Color Distintivo:</label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADVERTENCIA REASIGNACIÓN EN CASCADA AL ELIMINAR CATEGORÍA */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-rose-600">Advertencia de Reasignación en Cascada</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Eliminar Categoría: {categoryToDelete.nombre}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Si existen eventos o actividades registradas bajo la categoría <strong>"{categoryToDelete.nombre}"</strong>, debes seleccionar a qué categoría oficial serán reasignadas para evitar inconsistencias en las asistencias y horas PFI de los alumnos.
            </p>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reasignar actividades existentes a:
              </label>
              <select
                value={reassignCategoryTarget}
                onChange={(e) => setReassignCategoryTarget(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-unipaz-navy dark:text-white"
              >
                {categoriesList
                  .filter((c) => c.id !== categoryToDelete.id)
                  .map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowDeleteCategoryModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                Confirmar y Reasignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR DEPARTAMENTO SERVICIO BECARIO */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowDeptModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600">Servicio Becario</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  {editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre del Departamento:</label>
                <input
                  type="text"
                  required
                  value={deptForm.nombre}
                  onChange={(e) => setDeptForm({ ...deptForm, nombre: e.target.value })}
                  placeholder="ej. Centro de Cómputo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descripción / Actividades:</label>
                <textarea
                  rows={2}
                  value={deptForm.descripcion}
                  onChange={(e) => setDeptForm({ ...deptForm, descripcion: e.target.value })}
                  placeholder="Funciones que desarrollarán los becarios..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Responsable / Encargado:</label>
                  <input
                    type="text"
                    value={deptForm.encargado}
                    onChange={(e) => setDeptForm({ ...deptForm, encargado: e.target.value })}
                    placeholder="ej. Mtro. Juan Pérez"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Cupo Máximo:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={deptForm.cupo_maximo}
                    onChange={(e) => setDeptForm({ ...deptForm, cupo_maximo: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md"
                >
                  {editingDept ? 'Guardar Cambios' : 'Crear Departamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
