'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bus,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  Home,
  Info,
  MapPin,
  Navigation,
  PenTool,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Tv,
  Upload,
  User,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

interface SocioeconomicStudyModalProps {
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

export const SocioeconomicStudyModal: React.FC<SocioeconomicStudyModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { submitSocioeconomicStudy } = usePFI();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // PASO 1: Datos Generales y Domicilios
  const [tipoTramite, setTipoTramite] = useState<'Beca Nueva (Aspirante)' | 'Reincorporación / Pérdida Previa de Beca' | 'Aumento de Porcentaje'>('Beca Nueva (Aspirante)');
  const [curp, setCurp] = useState('VAAC030514HBSLR09');
  const [rfc, setRfc] = useState('VAAC030514AB1');
  const [lugarNacimiento, setLugarNacimiento] = useState('La Paz, Baja California Sur');
  const [numHijos, setNumHijos] = useState(0);
  const [zonaDomicilio, setZonaDomicilio] = useState<'Urbano' | 'Semiurbano' | 'Rural'>('Urbano');
  const [esForaneo, setEsForaneo] = useState(false);
  const [domicilioLocal, setDomicilioLocal] = useState('');

  // PASO 2: Composición Familiar y Salud
  const [miembros, setMiembros] = useState<MiembroHogar[]>([
    {
      id: '1',
      nombre: 'Juan Carlos Valenzuela',
      parentesco: 'Padre',
      edad: 48,
      estadoCivil: 'Casado/a',
      escolaridad: 'Preparatoria / Bachillerato',
      ocupacion: 'Empleado Privado / Administrativo',
      tipoEmpleo: 'Asalariado',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 11000,
    },
    {
      id: '2',
      nombre: 'María Elena Arce',
      parentesco: 'Madre',
      edad: 46,
      estadoCivil: 'Casada',
      escolaridad: 'Licenciatura',
      ocupacion: 'Docente / Comercio Independiente',
      tipoEmpleo: 'Independiente / No asalariado',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 8500,
    },
    {
      id: '3',
      nombre: 'Sofía Valenzuela Arce',
      parentesco: 'Hermano/a',
      edad: 15,
      estadoCivil: 'Soltera',
      escolaridad: 'Secundaria',
      ocupacion: 'Estudiante',
      tipoEmpleo: 'Hogar / Sin empleo',
      prestacionesMedicas: 'IMSS',
      ingresoMensual: 0,
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoParentesco, setNuevoParentesco] = useState('Hermano/a');
  const [nuevaEdad, setNuevaEdad] = useState(18);
  const [nuevaOcupacion, setNuevaOcupacion] = useState('Estudiante');
  const [nuevoIngreso, setNuevoIngreso] = useState(0);

  const [tieneOtraBeca, setTieneOtraBeca] = useState<'no' | 'si'>('no');
  const [padeceEnfermedadCronica, setPadeceEnfermedadCronica] = useState<'no' | 'si'>('no');

  // PASO 3: Balance Económico Familiar (Calculadora Dinámica UX)
  const [ingresoPadre, setIngresoPadre] = useState(11000);
  const [ingresoMadre, setIngresoMadre] = useState(8500);
  const [ingresoAspirante, setIngresoAspirante] = useState(0);
  const [ingresoOtros, setIngresoOtros] = useState(0);

  const [egresoAlimentacion, setEgresoAlimentacion] = useState(6000);
  const [egresoRenta, setEgresoRenta] = useState(3500);
  const [egresoLuzAgua, setEgresoLuzAgua] = useState(1200);
  const [egresoInternet, setEgresoInternet] = useState(700);
  const [egresoGas, setEgresoGas] = useState(400);
  const [egresoMedicos, setEgresoMedicos] = useState(800);
  const [egresoTransporte, setEgresoTransporte] = useState(1800);
  const [egresoEducacion, setEgresoEducacion] = useState(2500);

  const totalIngresos = useMemo(
    () => Number(ingresoPadre) + Number(ingresoMadre) + Number(ingresoAspirante) + Number(ingresoOtros),
    [ingresoPadre, ingresoMadre, ingresoAspirante, ingresoOtros]
  );

  const totalEgresos = useMemo(
    () =>
      Number(egresoAlimentacion) +
      Number(egresoRenta) +
      Number(egresoLuzAgua) +
      Number(egresoInternet) +
      Number(egresoGas) +
      Number(egresoMedicos) +
      Number(egresoTransporte) +
      Number(egresoEducacion),
    [
      egresoAlimentacion,
      egresoRenta,
      egresoLuzAgua,
      egresoInternet,
      egresoGas,
      egresoMedicos,
      egresoTransporte,
      egresoEducacion,
    ]
  );

  const balanceNeto = totalIngresos - totalEgresos;

  // PASO 4: Vivienda y Traslado
  const [tipoVivienda, setTipoVivienda] = useState('Propia (Pagada)');
  const [numCuartos, setNumCuartos] = useState(4);
  const [tieneComputadora, setTieneComputadora] = useState(true);
  const [tieneInternet, setTieneInternet] = useState(true);
  const [tieneAutomovil, setTieneAutomovil] = useState(true);
  const [medioTransporte, setMedioTransporte] = useState('Autobús / Camión');
  const [tiempoTrasladoMinutos, setTiempoTrasladoMinutos] = useState(35);

  // PASO 5: Croquis, Documentación y Firma
  const [referenciasUbicacion, setReferenciasUbicacion] = useState(
    'Casa de 1 planta color beige, portón negro, entre Calle Abasolo y Calle Colima, frente a parque público.'
  );
  const [archivosCargados, setArchivosCargados] = useState<{
    ine: boolean;
    ingresos: boolean;
    domicilio: boolean;
    carta: boolean;
  }>({
    ine: true,
    ingresos: true,
    domicilio: true,
    carta: true,
  });
  const [declaraBajoProtesta, setDeclaraBajoProtesta] = useState(false);
  const [firmaDigital, setFirmaDigital] = useState(`${student.nombre} ${student.apellidos}`);

  if (!isOpen) return null;

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
    if (!declaraBajoProtesta) {
      alert('Debes declarar bajo protesta de decir verdad.');
      return;
    }
    submitSocioeconomicStudy(student.id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 my-6 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con Logotipo Institucional */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-unipaz-navy text-white flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                Departamento de Trabajo Social & Becas
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                Cédula Integral
              </span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Cédula de Estudio Socioeconómico Integral
            </h3>
          </div>
        </div>

        {/* STEPPER DE 5 PASOS */}
        {!isSubmitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              {[
                { step: 1, label: 'Generales' },
                { step: 2, label: 'Familia' },
                { step: 3, label: 'Balance' },
                { step: 4, label: 'Vivienda' },
                { step: 5, label: 'Croquis y Firma' },
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.step as any)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      currentStep >= s.step ? 'text-unipaz-orange' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        currentStep === s.step
                          ? 'bg-unipaz-orange text-white shadow-sm'
                          : currentStep > s.step
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                  {idx < 4 && <div className="h-0.5 flex-1 mx-1.5 bg-slate-200 dark:bg-slate-800" />}
                </React.Fragment>
              ))}
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-unipaz-orange to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ESTADO FINAL O FORMULARIO MULTI-PASO */}
        {isSubmitted || student.estudio_socioeconomico_entregado ? (
          <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-emerald-900 dark:text-emerald-200">
              ¡Cédula de Estudio Socioeconómico Registrada!
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto">
              El diagnóstico socioeconómico ha sido registrado con fecha oficial{' '}
              <strong className="font-mono">{student.fecha_estudio_socioeconomico || new Date().toISOString().split('T')[0]}</strong>.
            </p>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-white/10 text-left text-xs space-y-1">
              <div><strong>Aspirante:</strong> {student.nombre} {student.apellidos} ({student.matricula})</div>
              <div><strong>Ingreso Mensual Familiar:</strong> ${totalIngresos.toLocaleString()} MXN</div>
              <div><strong>Gastos Mensuales Familiares:</strong> ${totalEgresos.toLocaleString()} MXN</div>
              <div><strong>Balance Neto Familiar:</strong> <span className="font-mono font-bold text-emerald-600">${balanceNeto.toLocaleString()} MXN</span></div>
              <div><strong>Estado:</strong> Integrado al expediente del Comité de Becas.</div>
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
            {/* PASO 1: DATOS GENERALES Y DOMICILIOS */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Aviso Normativo sobre Aplicación del Estudio */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Criterio Normativo:</strong> Este estudio socioeconómico es aplicable para <strong>estudiantes de nuevo ingreso / primer trámite</strong> o <strong>alumnos que hayan perdido su beneficio</strong> y solicitan reincorporación. Para el refrendo cuatrimestral ordinario, únicamente se presenta el Informe de Becario.
                  </span>
                </div>

                {/* Tipo de Trámite */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Tipo de Trámite Socioeconómico:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Beca Nueva (Aspirante)', 'Reincorporación / Pérdida Previa de Beca', 'Aumento de Porcentaje'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipoTramite(t)}
                        className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                          tipoTramite === t
                            ? 'bg-unipaz-navy text-white dark:bg-blue-600 border-transparent shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CURP, RFC, Lugar Nacimiento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      CURP:
                    </label>
                    <input
                      type="text"
                      required
                      value={curp}
                      onChange={(e) => setCurp(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      RFC (con Homoclave):
                    </label>
                    <input
                      type="text"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Lugar de Nacimiento:
                    </label>
                    <input
                      type="text"
                      value={lugarNacimiento}
                      onChange={(e) => setLugarNacimiento(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Tipo de Zona del Domicilio */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Clasificación de Zona Habitacional:
                  </label>
                  <div className="flex gap-2">
                    {(['Urbano', 'Semiurbano', 'Rural'] as const).map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZonaDomicilio(z)}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          zonaDomicilio === z
                            ? 'bg-unipaz-orange text-white border-unipaz-orange shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Alumno Foráneo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-unipaz-navy dark:text-white block">
                        ¿Eres estudiante foráneo?
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Procedes de otro municipio o estado (Los Cabos, Comondú, Loreto, etc.)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEsForaneo(!esForaneo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        esForaneo ? 'bg-unipaz-orange' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          esForaneo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {esForaneo && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Domicilio temporal donde habitas en La Paz:
                      </label>
                      <input
                        type="text"
                        value={domicilioLocal}
                        onChange={(e) => setDomicilioLocal(e.target.value)}
                        placeholder="Calle, Número, Colonia en La Paz"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: COMPOSICIÓN FAMILIAR Y SALUD */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Formulario Agregar Familiar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-unipaz-orange" />
                    Agregar Familiar / Dependiente que Habita en el Hogar:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                    />
                    <select
                      value={nuevoParentesco}
                      onChange={(e) => setNuevoParentesco(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Tutor/a">Tutor/a</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Edad"
                      value={nuevaEdad}
                      onChange={(e) => setNuevaEdad(Number(e.target.value))}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Ocupación (ej. Empleado, Comerciante, Estudiante)"
                      value={nuevaOcupacion}
                      onChange={(e) => setNuevaOcupacion(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Ingreso mensual ($)"
                      value={nuevoIngreso}
                      onChange={(e) => setNuevoIngreso(Number(e.target.value))}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMiembro}
                    className="w-full py-2 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Familiar al Desglose
                  </button>
                </div>

                {/* Tabla de Miembros del Hogar */}
                <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Familiar</th>
                        <th className="py-2.5 px-3">Parentesco</th>
                        <th className="py-2.5 px-3">Ocupación</th>
                        <th className="py-2.5 px-3 text-right">Ingreso</th>
                        <th className="py-2.5 px-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {miembros.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-bold text-unipaz-navy dark:text-white">
                            {m.nombre} <span className="text-[10px] text-slate-400 font-normal">({m.edad} años)</span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.parentesco}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.ocupacion}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            ${m.ingresoMensual.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMiembro(m.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PASO 3: BALANCE ECONÓMICO FAMILIAR (CALCULADORA DINÁMICA UX) */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* WIDGET CALCULADORA A 2 COLUMNAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Columna A: Ingresos */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-500/20 pb-2">
                      <span className="font-black text-xs text-emerald-900 dark:text-emerald-200 uppercase">
                        Ingresos Mensuales ($MXN)
                      </span>
                      <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                        ${totalIngresos.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Aporte Padre:</label>
                      <input
                        type="number"
                        value={ingresoPadre}
                        onChange={(e) => setIngresoPadre(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Aporte Madre:</label>
                      <input
                        type="number"
                        value={ingresoMadre}
                        onChange={(e) => setIngresoMadre(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Ingreso Propio del Alumno:</label>
                      <input
                        type="number"
                        value={ingresoAspirante}
                        onChange={(e) => setIngresoAspirante(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Otros Apoyos / Familiares:</label>
                      <input
                        type="number"
                        value={ingresoOtros}
                        onChange={(e) => setIngresoOtros(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Columna B: Egresos */}
                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-500/20 pb-2">
                      <span className="font-black text-xs text-rose-900 dark:text-rose-200 uppercase">
                        Gastos Mensuales ($MXN)
                      </span>
                      <span className="font-mono font-black text-sm text-rose-700 dark:text-rose-300">
                        ${totalEgresos.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Alimentación:</label>
                        <input
                          type="number"
                          value={egresoAlimentacion}
                          onChange={(e) => setEgresoAlimentacion(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Renta / Casa:</label>
                        <input
                          type="number"
                          value={egresoRenta}
                          onChange={(e) => setEgresoRenta(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Luz / Agua:</label>
                        <input
                          type="number"
                          value={egresoLuzAgua}
                          onChange={(e) => setEgresoLuzAgua(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Transporte:</label>
                        <input
                          type="number"
                          value={egresoTransporte}
                          onChange={(e) => setEgresoTransporte(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Educación:</label>
                        <input
                          type="number"
                          value={egresoEducacion}
                          onChange={(e) => setEgresoEducacion(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Médicos / Gas:</label>
                        <input
                          type="number"
                          value={egresoMedicos}
                          onChange={(e) => setEgresoMedicos(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-xl p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget de Balance Neto */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    balanceNeto >= 0
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/30 text-blue-950 dark:text-blue-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-6 h-6 text-unipaz-orange" />
                    <div>
                      <span className="font-bold text-xs block">Balance Neto Mensual Familiar:</span>
                      <span className="text-[10px] opacity-80">
                        {balanceNeto >= 0
                          ? 'Ingresos suficientes para cubrir el presupuesto familiar básico.'
                          : 'Los egresos superan los ingresos mensuales declarados.'}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-black font-mono">
                    ${balanceNeto.toLocaleString()} MXN
                  </span>
                </div>
              </div>
            )}

            {/* PASO 4: VIVIENDA Y TRASLADO */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Tipo de Vivienda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Situación de la Vivienda:
                    </label>
                    <select
                      value={tipoVivienda}
                      onChange={(e) => setTipoVivienda(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                    >
                      <option value="Propia (Pagada)">Propia (Pagada / Escriturada)</option>
                      <option value="Hipotecada (En Pago)">Propia (En Pago / Hipoteca)</option>
                      <option value="Rentada">Rentada</option>
                      <option value="Prestada / Familiar">Prestada por Familiares</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Número de Cuartos / Habitaciones:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={numCuartos}
                      onChange={(e) => setNumCuartos(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Inventario de Servicios en el Hogar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block">
                    Servicios e Inventario del Hogar:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTieneComputadora(!tieneComputadora)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        tieneComputadora
                          ? 'bg-unipaz-orange/10 border-unipaz-orange text-unipaz-orange font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-400'
                      }`}
                    >
                      <Tv className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px]">Computadora</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTieneInternet(!tieneInternet)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        tieneInternet
                          ? 'bg-unipaz-orange/10 border-unipaz-orange text-unipaz-orange font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-400'
                      }`}
                    >
                      <Wifi className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px]">Internet Fijo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTieneAutomovil(!tieneAutomovil)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        tieneAutomovil
                          ? 'bg-unipaz-orange/10 border-unipaz-orange text-unipaz-orange font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-400'
                      }`}
                    >
                      <Car className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px]">Automóvil</span>
                    </button>
                  </div>
                </div>

                {/* Movilidad al Campus */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block">
                    Medio de Transporte y Tiempo de Traslado al Campus UNIPAZ:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Transporte Principal:
                      </label>
                      <select
                        value={medioTransporte}
                        onChange={(e) => setMedioTransporte(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                      >
                        <option value="Autobús / Camión">Autobús / Camión Urbano</option>
                        <option value="Automóvil Propio">Automóvil Propio</option>
                        <option value="Motocicleta">Motocicleta</option>
                        <option value="Bicicleta">Bicicleta</option>
                        <option value="Taxi / Uber / Didi">Taxi / App de Transporte</option>
                        <option value="Caminando">Caminando</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Tiempo Estimado (Minutos):
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={tiempoTrasladoMinutos}
                        onChange={(e) => setTiempoTrasladoMinutos(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 5: CROQUIS / UBICACIÓN, DOCUMENTOS Y FIRMA */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Referencias Geográficas de Ubicación */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-unipaz-orange" />
                    Croquis / Referencias de Localización del Domicilio:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={referenciasUbicacion}
                    onChange={(e) => setReferenciasUbicacion(e.target.value)}
                    placeholder="Describe fachadas, calles colindantes, color de portón o puntos de referencia para visita domiciliaria..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                  />
                </div>

                {/* Dropzone de Requisitos y Documentos */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block">
                    Expediente Digital de Documentos Requeridos:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                      <span>1. Carta Solicitud a Rectoría</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                      <span>2. Identificación Oficial INE</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                      <span>3. Comprobante de Ingresos</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                      <span>4. Comprobante de Domicilio</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Checkbox de Veracidad y Firma */}
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
                      Declaro bajo protesta de decir verdad que los datos económicos, composición familiar y patrimonio manifestados en esta cédula son verídicos y autorizo al Departamento de Trabajo Social a realizar visita domiciliaria de verificación.
                    </span>
                  </label>
                </div>

                {/* Pad de Firma Digital */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                    Firma Electrónica del Solicitante:
                  </label>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-white/20 text-center">
                    <span className="font-serif italic text-base sm:text-lg text-unipaz-navy dark:text-amber-400">
                      {firmaDigital}
                    </span>
                  </div>
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
                  onClick={() => alert('Cédula socioeconómica guardada temporalmente.')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guardar Borrador</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                    className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
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
                    Enviar Estudio Socioeconómico
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
