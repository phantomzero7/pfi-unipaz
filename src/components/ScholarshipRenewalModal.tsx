'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  PenTool,
  Plus,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import {
  formatGradoAcademico,
  getMaxPeriodos,
  getNombrePeriodo,
  MODALIDADES_BECA_DEFAULT,
  OPCIONES_SEXO,
  PROGRAMAS_ACADEMICOS,
  UserProfile,
  validarCondicionesEspecialesBeca,
} from '@/lib/types';

interface ScholarshipRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

interface MiembroHogar {
  id: string;
  nombre: string;
  parentesco: string;
  edad: number;
  estadoCivil: string;
  escolaridad: string;
  ocupacion: string;
  tipoEmpleo: 'Asalariado' | 'Independiente / No asalariado' | 'Hogar / Sin empleo';
  prestacionesMedicas: 'IMSS' | 'ISSSTE' | 'ISSSPE' | 'Privado' | 'Ninguna';
  ingresoMensual: number;
}

export const ScholarshipRenewalModal: React.FC<ScholarshipRenewalModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { submitScholarshipRenewal } = usePFI();

  const [solicitaAumento, setSolicitaAumento] = useState(false);
  const [porcentajeDeseado, setPorcentajeDeseado] = useState<number>(
    Math.min(80, (student.porcentaje_beca || 25) + 15)
  );
  const [motivoAumento, setMotivoAumento] = useState('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Validación de condiciones especiales por carrera
  const validacionCarrera = useMemo(
    () =>
      validarCondicionesEspecialesBeca(
        student.carrera || '',
        student.tipo_beca || '',
        solicitaAumento ? porcentajeDeseado : student.porcentaje_beca
      ),
    [student.carrera, student.tipo_beca, solicitaAumento, porcentajeDeseado, student.porcentaje_beca]
  );

  // ==========================================
  // ESTUDIO SOCIOECONÓMICO PRE-LLENADO (SI PIDE AUMENTO)
  // ==========================================
  const [miembros, setMiembros] = useState<MiembroHogar[]>([
    {
      id: '1',
      nombre: 'Carlos Higuera',
      parentesco: 'Padre',
      edad: 52,
      estadoCivil: 'Casado/a',
      escolaridad: 'Preparatoria / Bachillerato',
      ocupacion: 'Empleado de Servicios / Comercio',
      tipoEmpleo: 'Asalariado',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 9800,
    },
    {
      id: '2',
      nombre: 'Rosa Lucero',
      parentesco: 'Madre',
      edad: 49,
      estadoCivil: 'Casada',
      escolaridad: 'Secundaria',
      ocupacion: 'Hogar / Venta Independiente',
      tipoEmpleo: 'Independiente / No asalariado',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 4500,
    },
    {
      id: '3',
      nombre: 'Mateo Higuera Lucero',
      parentesco: 'Hermano/a',
      edad: 14,
      estadoCivil: 'Soltero/a',
      escolaridad: 'Secundaria',
      ocupacion: 'Estudiante',
      tipoEmpleo: 'Hogar / Sin empleo',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 0,
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoParentesco, setNuevoParentesco] = useState('Hermano/a');
  const [nuevaEdad, setNuevaEdad] = useState(16);
  const [nuevaOcupacion, setNuevaOcupacion] = useState('Estudiante');
  const [nuevoIngreso, setNuevoIngreso] = useState(0);

  const [trabajaActualmente, setTrabajaActualmente] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [puesto, setPuesto] = useState('');

  // Balance Económico
  const [ingresoPadre, setIngresoPadre] = useState(9800);
  const [ingresoMadre, setIngresoMadre] = useState(4500);
  const [ingresoAspirante, setIngresoAspirante] = useState(0);
  const [ingresoOtros, setIngresoOtros] = useState(0);

  const [egresoAlimentacion, setEgresoAlimentacion] = useState(5500);
  const [egresoRenta, setEgresoRenta] = useState(3000);
  const [egresoLuzAgua, setEgresoLuzAgua] = useState(1100);
  const [egresoTransporte, setEgresoTransporte] = useState(1500);

  const totalIngresos = useMemo(
    () => Number(ingresoPadre) + Number(ingresoMadre) + Number(ingresoAspirante) + Number(ingresoOtros),
    [ingresoPadre, ingresoMadre, ingresoAspirante, ingresoOtros]
  );

  const totalEgresos = useMemo(
    () =>
      Number(egresoAlimentacion) +
      Number(egresoRenta) +
      Number(egresoLuzAgua) +
      Number(egresoTransporte),
    [egresoAlimentacion, egresoRenta, egresoLuzAgua, egresoTransporte]
  );

  const balanceNeto = totalIngresos - totalEgresos;

  const [tipoVivienda, setTipoVivienda] = useState('Propia (Pagada)');
  const [medioTransporte, setMedioTransporte] = useState('Transporte Público (Camión / Calafia)');
  const [tiempoTrasladoMinutos, setTiempoTrasladoMinutos] = useState(40);

  const [declaraVerdad, setDeclaraVerdad] = useState(false);
  const [firmaDigitalNombre, setFirmaDigitalNombre] = useState(`${student.nombre} ${student.apellidos}`);

  if (!isOpen) return null;

  const totalSteps = solicitaAumento ? 3 : 1;

  const handleAddMiembro = () => {
    if (!nuevoNombre.trim()) return;
    const newItem: MiembroHogar = {
      id: Date.now().toString(),
      nombre: nuevoNombre,
      parentesco: nuevoParentesco,
      edad: Number(nuevaEdad) || 18,
      estadoCivil: 'Soltero/a',
      escolaridad: 'Preparatoria',
      ocupacion: nuevaOcupacion,
      tipoEmpleo: nuevoIngreso > 0 ? 'Asalariado' : 'Hogar / Sin empleo',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: Number(nuevoIngreso) || 0,
    };
    setMiembros((prev) => [...prev, newItem]);
    setNuevoNombre('');
    setNuevoIngreso(0);
  };

  const handleRemoveMiembro = (id: string) => {
    setMiembros((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solicitaAumento && !motivoAumento.trim()) {
      alert('Por favor escribe los motivos y justificación para solicitar el aumento de porcentaje de beca.');
      return;
    }
    if (!declaraVerdad) {
      alert('Debes confirmar la declaratoria de ratificación y veracidad.');
      return;
    }

    const res = submitScholarshipRenewal(student.id, {
      solicitaAumento,
      porcentajeDeseado: solicitaAumento ? porcentajeDeseado : student.porcentaje_beca,
      motivoAumento: solicitaAumento ? motivoAumento : undefined,
      estudioActualizado: solicitaAumento,
    });

    setFeedbackMsg(res.message);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 my-6 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Ratificación de Beca Institucional
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Periodo Activo
              </span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Renovación de Beca Cuatrimestral
            </h3>
          </div>
        </div>

        {/* Resumen del Estatus Actual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Beca Asignada</span>
            <strong className="text-unipaz-navy dark:text-white text-xs">{student.tipo_beca || 'Institucional'}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Descuento Vigente</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-black">
              {student.porcentaje_beca || 25}% Descuento
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumplimiento PFI</span>
            <strong className="text-unipaz-orange font-mono text-xs">1,000 / 1,000 pts · 0 Reprobadas</strong>
          </div>
        </div>

        {/* Advertencias de Carrera si aplican */}
        {validacionCarrera.advertencia && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 flex-shrink-0 text-unipaz-orange mt-0.5" />
            <span>{validacionCarrera.advertencia}</span>
          </div>
        )}

        {/* Stepper si solicita aumento */}
        {solicitaAumento && !isSubmitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-unipaz-orange">Paso {currentStep} de 3</span>
              <span className="text-slate-500">
                {currentStep === 1 && '1. Solicitud de Aumento & Justificación'}
                {currentStep === 2 && '2. Cédula Socioeconómica Pre-llenada'}
                {currentStep === 3 && '3. Balance de Ingresos & Ratificación'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    currentStep === s
                      ? 'bg-unipaz-orange shadow-sm'
                      : currentStep > s
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO DEL FORMULARIO O CONFIRMACIÓN */}
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              {solicitaAumento ? '¡Solicitud de Aumento Enviada!' : '¡Beca Renovada con Éxito!'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {feedbackMsg}
            </p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PASO 1 (O VISTA SIMPLE DE RENOVACIÓN) */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* CASILLA PRINCIPAL: SOLICITAR AUMENTO */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-400/30 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={solicitaAumento}
                      onChange={(e) => setSolicitaAumento(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-unipaz-orange focus:ring-0"
                    />
                    <div>
                      <span className="font-black text-xs text-unipaz-navy dark:text-amber-300 block flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-unipaz-orange" />
                        ¿Deseas solicitar un aumento en tu porcentaje de beca?
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        Si tu situación económica familiar cambió o requieres un mayor descuento, activa esta casilla para exponer tus motivos y actualizar tu estudio socioeconómico.
                      </p>
                    </div>
                  </label>

                  {/* Sección que se despliega si activa el aumento */}
                  {solicitaAumento && (
                    <div className="pt-3 border-t border-amber-400/20 space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                          Porcentaje de Beca Solicitado:
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={student.porcentaje_beca || 20}
                            max={validacionCarrera.porcentajeMaximoPermitido || 80}
                            step={5}
                            value={porcentajeDeseado}
                            onChange={(e) => setPorcentajeDeseado(Number(e.target.value))}
                            className="flex-1 accent-unipaz-orange"
                          />
                          <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-unipaz-navy text-white min-w-[70px] text-center">
                            {porcentajeDeseado}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Descuento actual: {student.porcentaje_beca}% → Solicitando incremento a: {porcentajeDeseado}%
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                          * Motivos por los que requieres el aumento de beca (Exposición libre):
                        </label>
                        <textarea
                          rows={3}
                          required={solicitaAumento}
                          value={motivoAumento}
                          onChange={(e) => setMotivoAumento(e.target.value)}
                          placeholder="Explica detalladamente las razones socioeconómicas, académicas o familiares por las cuales solicitas este incremento..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-unipaz-orange"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Si NO solicita aumento, muestra la ratificación ordinaria */}
                {!solicitaAumento && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Renovación Ordinaria sin Modificación Socioeconómica
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Al ratificar tu beca conservas tu {student.porcentaje_beca}% de descuento institucional. No es necesario volver a llenar el estudio socioeconómico.
                    </p>
                  </div>
                )}

                {/* Declaratoria y Firma Digital (Si no pide aumento) */}
                {!solicitaAumento && (
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        required
                        checked={declaraVerdad}
                        onChange={(e) => setDeclaraVerdad(e.target.checked)}
                        className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                      />
                      <span className="text-[11px] leading-snug">
                        Confirmo que continúo cumpliendo los requisitos del Reglamento de Becas UNIPAZ (0 materias reprobadas, 1,000 puntos PFI y colegiaturas al corriente).
                      </span>
                    </label>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                        Firma Electrónica del Alumno:
                      </label>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/20 text-center font-serif italic text-sm text-unipaz-navy dark:text-amber-400">
                        {firmaDigitalNombre}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: CÉDULA SOCIOECONÓMICA PRE-LLENADA (SOLO SI PIDE AUMENTO) */}
            {solicitaAumento && currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-unipaz-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-unipaz-orange" />
                      Cédula Familiar Pre-llenada (Actualiza si hubo cambios)
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Puedes modificar los datos de tus dependientes e ingresos si cambiaron este ciclo.
                    </span>
                  </div>
                </div>

                {/* Tabla de Integrantes */}
                <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Parentesco</th>
                        <th className="p-2">Ocupación</th>
                        <th className="p-2 text-right">Ingreso Mensual</th>
                        <th className="p-2 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {miembros.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2 font-bold">{m.nombre}</td>
                          <td className="p-2 text-slate-500">{m.parentesco}</td>
                          <td className="p-2">{m.ocupacion}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-600">
                            ${m.ingresoMensual.toLocaleString('es-MX')} MXN
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMiembro(m.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Agregar Familiar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    + Registrar Nuevo Integrante en el Hogar
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    />
                    <select
                      value={nuevoParentesco}
                      onChange={(e) => setNuevoParentesco(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Cónyuge">Cónyuge</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Ingreso $"
                      value={nuevoIngreso || ''}
                      onChange={(e) => setNuevoIngreso(Number(e.target.value))}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddMiembro}
                      className="py-2 px-3 rounded-xl bg-unipaz-navy text-white font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-unipaz-orange" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: BALANCE ECONÓMICO Y RATIFICACIÓN CON AUMENTO */}
            {solicitaAumento && currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400 block uppercase">
                      Ingresos Familiares ($/mes)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500">Ingreso Padre:</label>
                        <input
                          type="number"
                          value={ingresoPadre}
                          onChange={(e) => setIngresoPadre(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Ingreso Madre:</label>
                        <input
                          type="number"
                          value={ingresoMadre}
                          onChange={(e) => setIngresoMadre(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                    <span className="font-bold text-xs text-rose-800 dark:text-rose-400 block uppercase">
                      Gastos Básicos ($/mes)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500">Alimentación:</label>
                        <input
                          type="number"
                          value={egresoAlimentacion}
                          onChange={(e) => setEgresoAlimentacion(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Renta / Vivienda:</label>
                        <input
                          type="number"
                          value={egresoRenta}
                          onChange={(e) => setEgresoRenta(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Neto */}
                <div className="p-3 rounded-2xl bg-unipaz-navy text-white flex items-center justify-between text-xs font-mono font-bold">
                  <span>Balance Familiar Neto:</span>
                  <span className={balanceNeto >= 0 ? 'text-amber-300' : 'text-rose-400'}>
                    ${balanceNeto.toLocaleString('es-MX')} MXN
                  </span>
                </div>

                {/* Declaratoria y Firma Digital */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={declaraVerdad}
                      onChange={(e) => setDeclaraVerdad(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] leading-snug">
                      Declaro bajo protesta de decir verdad que los datos actualizados de mi estudio socioeconómico y justificación de aumento son verídicos.
                    </span>
                  </label>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                      Firma Electrónica del Alumno:
                    </label>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/20 text-center font-serif italic text-sm text-unipaz-navy dark:text-amber-400">
                      {firmaDigitalNombre}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              {solicitaAumento && currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {solicitaAumento && currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !motivoAumento.trim()) {
                        alert('Escribe los motivos del aumento para continuar.');
                        return;
                      }
                      setCurrentStep((prev) => prev + 1);
                    }}
                    className="py-2.5 px-5 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    Siguiente: Cédula
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!declaraVerdad}
                    className={`py-2.5 px-6 rounded-2xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                      declaraVerdad
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20 hover:scale-105'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {solicitaAumento
                      ? `Enviar Solicitud de Aumento al ${porcentajeDeseado}%`
                      : `Ratificar Renovación (${student.porcentaje_beca || 25}%)`}
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
