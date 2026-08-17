'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  PenTool,
  Plus,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

interface BecarioReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

interface BitacoraItem {
  id: string;
  fecha: string;
  actividad: string;
  areaResponsable: string;
  rol: 'Edecán' | 'Organizador' | 'Participante' | 'Staff Logístico' | 'Apoyo Administrativo' | 'Otro';
  horas: number;
}

export const BecarioReportModal: React.FC<BecarioReportModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { submitBecarioReport, getStudentScholarshipProgress } = usePFI();
  const progress = getStudentScholarshipProgress(student.id);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // PASO 1: Validación de Datos y Cambios
  const [cambioSituacion, setCambioSituacion] = useState<'no' | 'si'>('no');
  const [descripcionCambios, setDescripcionCambios] = useState('');
  const [trabajaActualmente, setTrabajaActualmente] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [puesto, setPuesto] = useState('');
  const [jornada, setJornada] = useState<'Medio Tiempo' | 'Tiempo Completo' | 'Honorarios'>('Medio Tiempo');
  const [superior, setSuperior] = useState('');
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('');

  // PASO 2: Bitácora de Horas / Contraprestación
  const [bitacora, setBitacora] = useState<BitacoraItem[]>([
    {
      id: '1',
      fecha: '2026-08-25',
      actividad: 'Conferencia Magistral y Foro de Vinculación',
      areaResponsable: 'Dirección de Extensión y Difusión (DEDU)',
      rol: 'Staff Logístico',
      horas: 10,
    },
    {
      id: '2',
      fecha: '2026-09-02',
      actividad: 'Taller de Liderazgo Social y Equidad',
      areaResponsable: 'Coordinación PFI',
      rol: 'Participante',
      horas: 10,
    },
  ]);

  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaActividad, setNuevaActividad] = useState('');
  const [nuevaArea, setNuevaArea] = useState('Dirección de Extensión y Difusión');
  const [nuevoRol, setNuevoRol] = useState<BitacoraItem['rol']>('Staff Logístico');
  const [nuevasHoras, setNuevasHoras] = useState(10);
  const [evidenciaNombre, setEvidenciaNombre] = useState<string | null>(null);

  // PASO 3: Ratificación y Firma
  const [declaraBajoProtesta, setDeclaraBajoProtesta] = useState(false);
  const [firmaDigital, setFirmaDigital] = useState(`${student.nombre} ${student.apellidos}`);

  if (!isOpen) return null;

  const totalHorasBitacora = bitacora.reduce((sum, item) => sum + (item.horas || 0), 0);

  const handleAddBitacora = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaActividad.trim()) return;
    const newItem: BitacoraItem = {
      id: Date.now().toString(),
      fecha: nuevaFecha,
      actividad: nuevaActividad,
      areaResponsable: nuevaArea,
      rol: nuevoRol,
      horas: Number(nuevasHoras) || 5,
    };
    setBitacora((prev) => [...prev, newItem]);
    setNuevaActividad('');
  };

  const handleRemoveBitacora = (id: string) => {
    setBitacora((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaraBajoProtesta) {
      alert('Debes declarar bajo protesta de decir verdad para confirmar el refrendo.');
      return;
    }
    submitBecarioReport(student.id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 my-6 max-h-[94vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con Logotipo */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-orange text-slate-950 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                Comisión General de Becas & Estímulos
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                Refrendo Cuatrimestral
              </span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Informe de Becario y Solicitud de Renovación
            </h3>
          </div>
        </div>

        {/* Alerta de Veracidad Superior */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Aviso Reglamentario:</strong> La omisión, ocultamiento o falsedad de cambios en tu situación socioeconómica o académica es motivo de revocación inmediata de la beca.
          </span>
        </div>

        {/* STEPPER HORIZONTAL */}
        {!isSubmitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  1
                </span>
                <span className="hidden sm:inline">Validación de Datos</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  2
                </span>
                <span className="hidden sm:inline">Bitácora de Horas / Beca</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  3
                </span>
                <span className="hidden sm:inline">Ratificación y Firma</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-unipaz-orange to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ESTADO FINAL DE ÉXITO O FORMULARIO MULTI-PASO */}
        {isSubmitted || student.informe_becario_entregado ? (
          <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-emerald-900 dark:text-emerald-200">
              ¡Informe de Becario y Solicitud de Renovación Entregados!
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto">
              Tu informe cuatrimestral ha sido registrado con fecha oficial{' '}
              <strong className="font-mono">{student.fecha_informe_becario || new Date().toISOString().split('T')[0]}</strong>.
            </p>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-white/10 text-left text-xs space-y-1">
              <div><strong>Beca Actual:</strong> {student.tipo_beca || 'Beca Institucional'} ({student.porcentaje_beca || 50}% Descuento)</div>
              <div><strong>Puntos Cuatrimestrales Registrados:</strong> <span className="font-mono font-bold text-emerald-600">+{progress.puntosTotales} pts</span></div>
              <div><strong>Horas Reportadas en Bitácora:</strong> {totalHorasBitacora} hrs de contraprestación</div>
              <div><strong>Estado de Dictamen:</strong> En revisión por la Administración al cierre del periodo.</div>
            </div>
            <button
              onClick={onClose}
              className="mt-2 py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all hover:scale-105"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* PASO 1: VALIDACIÓN DE DATOS Y CAMBIOS DE PERIODO */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Resumen de Beca Actual */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-unipaz-navy to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-unipaz-orange block">
                      Beneficio a Renovar
                    </span>
                    <h4 className="text-base font-black">
                      {student.tipo_beca || 'Beca de Excelencia Académica'}
                    </h4>
                    <p className="text-xs text-slate-300">
                      Periodo vigente: {new Date().getFullYear()} · Cuatrimestre actual: {student.cuatrimestre || 1}°
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm shadow-sm flex-shrink-0">
                    {student.porcentaje_beca || 50}% Descuento
                  </span>
                </div>

                {/* Card de Datos del Alumno */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                      Datos del Estudiante Registrados en el Sistema:
                    </span>
                    <span className="text-[10px] text-slate-400">Verificados ✓</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nombre:</span>
                      <strong>{student.nombre} {student.apellidos}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Matrícula & Carrera:</span>
                      <strong className="font-mono">{student.matricula} ({student.carrera})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Promedio Actual:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {progress.promedioAcademico.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Pregunta: ¿Ha cambiado tu situación? */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-white block">
                    ¿Ha cambiado tu situación económica, laboral o familiar en este periodo cuatrimestral?
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="cambioSituacion"
                        checked={cambioSituacion === 'no'}
                        onChange={() => setCambioSituacion('no')}
                        className="text-unipaz-orange focus:ring-0"
                      />
                      <span>No, se mantiene igual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="cambioSituacion"
                        checked={cambioSituacion === 'si'}
                        onChange={() => setCambioSituacion('si')}
                        className="text-unipaz-orange focus:ring-0"
                      />
                      <span>Sí, han ocurrido cambios</span>
                    </label>
                  </div>

                  {cambioSituacion === 'si' && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Describe detalladamente los cambios socioeconómicos o familiares para este periodo:
                      </label>
                      <textarea
                        rows={3}
                        required={cambioSituacion === 'si'}
                        value={descripcionCambios}
                        onChange={(e) => setDescripcionCambios(e.target.value)}
                        placeholder="Ej. Cambio de empleo de tutor, disminución de ingresos familiares, etc."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Switch de Situación Laboral */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                        ¿Trabajas actualmente?
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Actualiza tu situación laboral para este periodo de renovación.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrabajaActualmente(!trabajaActualmente)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        trabajaActualmente ? 'bg-unipaz-orange' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          trabajaActualmente ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {trabajaActualmente && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Empresa / Negocio:</label>
                        <input
                          type="text"
                          value={empresa}
                          onChange={(e) => setEmpresa(e.target.value)}
                          placeholder="Nombre de la empresa"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Puesto Desempeñado:</label>
                        <input
                          type="text"
                          value={puesto}
                          onChange={(e) => setPuesto(e.target.value)}
                          placeholder="Cargo laboral"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jefe Inmediato:</label>
                        <input
                          type="text"
                          value={superior}
                          onChange={(e) => setSuperior(e.target.value)}
                          placeholder="Nombre de superior"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono Contacto:</label>
                        <input
                          type="tel"
                          value={telefonoEmpresa}
                          onChange={(e) => setTelefonoEmpresa(e.target.value)}
                          placeholder="(612) 000-0000"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: BITÁCORA DE HORAS / REPORTE DE BECA (CONTRAPRESTACIÓN) */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Resumen Superior de Horas */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                      Horas de Contraprestación Reportadas:
                    </span>
                    <h4 className="text-base font-black text-unipaz-navy dark:text-white">
                      {totalHorasBitacora} Horas Registradas en Bitácora
                    </h4>
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-unipaz-orange text-white">
                    +{progress.puntosTotales} pts PFI
                  </span>
                </div>

                {/* Formulario Rápido para Agregar Actividad a la Bitácora */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-unipaz-orange" />
                    Registrar Nueva Actividad / Servicio Formativo:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Nombre de la actividad o servicio"
                      value={nuevaActividad}
                      onChange={(e) => setNuevaActividad(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Horas"
                      value={nuevasHoras}
                      onChange={(e) => setNuevasHoras(Number(e.target.value))}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Área o Responsable"
                      value={nuevaArea}
                      onChange={(e) => setNuevaArea(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                    />
                    <select
                      value={nuevoRol}
                      onChange={(e) => setNuevoRol(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-bold"
                    >
                      <option value="Staff Logístico">Staff Logístico</option>
                      <option value="Edecán">Edecán</option>
                      <option value="Organizador">Organizador</option>
                      <option value="Participante">Participante</option>
                      <option value="Apoyo Administrativo">Apoyo Administrativo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBitacora}
                    className="w-full py-2 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar a la Bitácora
                  </button>
                </div>

                {/* Tabla Interactiva de la Bitácora */}
                <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Actividad / Servicio</th>
                        <th className="py-2.5 px-3">Área / Rol</th>
                        <th className="py-2.5 px-3 text-right">Horas</th>
                        <th className="py-2.5 px-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {bitacora.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{item.fecha}</td>
                          <td className="py-2.5 px-3 font-bold text-unipaz-navy dark:text-white">{item.actividad}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                              {item.rol}
                            </span>
                            <span className="block text-[10px] text-slate-400 truncate">{item.areaResponsable}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                            +{item.horas}h
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBitacora(item.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* File Uploader Drag-and-Drop */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                  <Upload className="w-6 h-6 text-unipaz-orange mx-auto" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subir Evidencia Fotográfica o Constancia de Participación
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Formatos admitidos: PDF, JPG, PNG (Máx. 5MB)
                  </p>
                  <label className="inline-block py-1.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                    <span>{evidenciaNombre || 'Seleccionar Archivo'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setEvidenciaNombre(file.name);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* PASO 3: RATIFICACIÓN DE CONVENIO Y FIRMA DIGITAL */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Resumen del Convenio */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Ratificación de Compromisos para el Siguiente Periodo
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>
                      Mantener promedio mínimo de <strong>{student.tipo_beca?.includes('Excelencia') ? '9.0' : '8.0'}</strong> sin reprobaciones ni exámenes extraordinarios.
                    </li>
                    <li>
                      Acumular el mínimo reglamentario de <strong>1,000 puntos cuatrimestrales</strong> en el Programa de Formación Integral.
                    </li>
                    <li>
                      Cumplir con las horas de apoyo o servicio asignadas por el área correspondiente.
                    </li>
                    <li>
                      Estar al corriente en los pagos de colegiatura complementaria.
                    </li>
                  </ul>
                </div>

                {/* Checkbox de Veracidad */}
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-amber-950 dark:text-amber-200">
                    <input
                      type="checkbox"
                      required
                      checked={declaraBajoProtesta}
                      onChange={(e) => setDeclaraBajoProtesta(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] leading-snug">
                      Declaro bajo protesta de decir verdad que las actividades reportadas en la bitácora fueron realizadas a satisfacción de las áreas universitarias y que cumplo con los requisitos para renovar mi beneficio.
                    </span>
                  </label>
                </div>

                {/* Pad de Firma Digital */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                      Firma Digital del Becario:
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Firma Electrónica Válida
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-white/20 text-center space-y-2">
                    <div className="font-serif italic text-base sm:text-lg text-unipaz-navy dark:text-amber-400 select-none py-2 border-b border-slate-200 dark:border-white/10">
                      {firmaDigital}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Firma Vinculada a Matrícula {student.matricula}</span>
                      <span>Fecha: {new Date().toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={firmaDigital}
                    onChange={(e) => setFirmaDigital(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* FOOTER MULTI-STEPPER */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Borrador de informe guardado.')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guardar Borrador</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                    className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!declaraBajoProtesta}
                    className={`py-2.5 px-6 rounded-2xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                      declaraBajoProtesta
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20 hover:scale-105'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Confirmar y Enviar Renovación
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
