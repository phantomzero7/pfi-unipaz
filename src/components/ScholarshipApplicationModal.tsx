'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  Car,
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
  Mail,
  MapPin,
  Navigation,
  PenTool,
  Phone,
  Plus,
  RotateCcw,
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
import {
  formatGradoAcademico,
  getMaxPeriodos,
  getNombrePeriodo,
  isProgramaSemestral,
  MODALIDADES_BECA_DEFAULT,
  OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA,
  OPCIONES_SEXO,
  PROGRAMAS_ACADEMICOS,
  UserProfile,
  validarCondicionesEspecialesBeca,
} from '@/lib/types';

interface ScholarshipApplicationModalProps {
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

export const ScholarshipApplicationModal: React.FC<ScholarshipApplicationModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { pfiConfig, submitScholarshipApplication, submitSocioeconomicStudy } = usePFI();

  const modalidadesCatalog = useMemo(
    () => pfiConfig.modalidadesBecaCatalog || MODALIDADES_BECA_DEFAULT,
    [pfiConfig.modalidadesBecaCatalog]
  );

  // Modalidad seleccionada (Default: Beca de Continuidad Escolar o Excelencia Académica)
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>(
    'Beca de Continuidad Escolar (Estudio Socioeconómico)'
  );

  // Switch opcional para adjuntar estudio socioeconómico voluntario en modalidades de mérito
  const [solicitaEstudioVoluntario, setSolicitaEstudioVoluntario] = useState(false);

  // Config de la modalidad seleccionada
  const selectedModalidadConfig = useMemo(
    () => modalidadesCatalog.find((m) => m.nombre === selectedTipoBeca) || modalidadesCatalog[0],
    [modalidadesCatalog, selectedTipoBeca]
  );

  // Validación de condiciones especiales por carrera
  const validacionCarrera = useMemo(
    () =>
      validarCondicionesEspecialesBeca(
        student.carrera || '',
        selectedTipoBeca
      ),
    [student.carrera, selectedTipoBeca]
  );

  // Condición: ¿Aparece la sección de Estudio Socioeconómico?
  const requiereEstudioSocioeconomico = Boolean(
    selectedModalidadConfig?.requiere_estudio_socioeconomico || solicitaEstudioVoluntario
  );

  const totalSteps = requiereEstudioSocioeconomico ? 5 : 3;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // ==========================================
  // PASO 1: DATOS PERSONALES Y ACADÉMICOS
  // ==========================================
  const [nombre, setNombre] = useState(student.nombre || '');
  const [apellidos, setApellidos] = useState(student.apellidos || '');
  const [carrera, setCarrera] = useState<string>(student.carrera || PROGRAMAS_ACADEMICOS[0]);
  const [cuatrimestre, setCuatrimestre] = useState(student.cuatrimestre?.toString() || '1');
  const [fechaNacimiento, setFechaNacimiento] = useState('2003-05-14');
  const [sexo, setSexo] = useState<string>(student.sexo || 'Mujer');
  const [pertenenciaEtnica, setPertenenciaEtnica] = useState<string>(OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA[0]);
  const [estadoCivil, setEstadoCivil] = useState('Soltero/a');
  const [curp, setCurp] = useState('HIGL030514MBSLR09');
  const [rfc, setRfc] = useState('HIGL030514AB1');
  const [telefono, setTelefono] = useState('(612) 123-4567');
  const [email, setEmail] = useState(student.email || 'estudiante@unipaz.mx');
  
  const [calle, setCalle] = useState('Av. de los Deportistas');
  const [numExterior, setNumExterior] = useState('145');
  const [numInterior, setNumInterior] = useState('');
  const [colonia, setColonia] = useState('8 de Octubre 1ra Sección');
  const [codigoPostal, setCodigoPostal] = useState('23080');
  const [ciudad, setCiudad] = useState('La Paz');
  const [preparatoriaProcedencia, setPreparatoriaProcedencia] = useState('CBTIS 230 / COBACH 01');

  // ==========================================
  // PASO 2 / SECCIÓN ESTUDIO SOCIOECONÓMICO: COMPOSICIÓN FAMILIAR
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

  // ==========================================
  // PASO 3: BALANCE ECONÓMICO FAMILIAR
  // ==========================================
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
    [
      egresoAlimentacion,
      egresoRenta,
      egresoLuzAgua,
      egresoTransporte,
    ]
  );

  const balanceNeto = totalIngresos - totalEgresos;

  // ==========================================
  // PASO 4: VIVIENDA, BIENES Y TRASLADO
  // ==========================================
  const [tipoVivienda, setTipoVivienda] = useState('Propia (Pagada)');
  const [medioTransporte, setMedioTransporte] = useState('Transporte Público (Camión / Calafia)');
  const [tiempoTrasladoMinutos, setTiempoTrasladoMinutos] = useState(40);
  const [referenciasUbicacion, setReferenciasUbicacion] = useState(
    'Casa de una planta color azul claro, cerca de la cancha deportiva de la 8 de Octubre, entre Calle 1 y Calle 2.'
  );

  // ==========================================
  // ÚLTIMO PASO: JUSTIFICACIÓN, DOCUMENTOS Y FIRMA
  // ==========================================
  const [motivosSolicitud, setMotivosSolicitud] = useState(
    'Solicito el apoyo de la beca institucional UNIPAZ para continuar de manera ininterrumpida mis estudios universitarios, comprometiéndome a mantener un desempeño académico sobresaliente y cumplir cabalmente con mis horas de formación integral (PFI).'
  );
  const [declaraVerdad, setDeclaraVerdad] = useState(false);
  const [aceptaAvisoPrivacidad, setAceptaAvisoPrivacidad] = useState(false);
  const [firmaDigitalNombre, setFirmaDigitalNombre] = useState(`${student.nombre} ${student.apellidos}`);

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
    if (!declaraVerdad || !aceptaAvisoPrivacidad) {
      alert('Debes aceptar la declaración de veracidad y el aviso de privacidad.');
      return;
    }
    const res = submitScholarshipApplication(student.id, selectedTipoBeca);
    if (requiereEstudioSocioeconomico) {
      submitSocioeconomicStudy(student.id);
    }
    setFeedbackMsg(res.message);
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-orange text-slate-950 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                Convocatoria Institucional de Becas UNIPAZ
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200">
                {requiereEstudioSocioeconomico ? 'Con Cédula Socioeconómica' : 'Evaluación por Mérito'}
              </span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Formato Oficial de Solicitud de Beca
            </h3>
          </div>
        </div>

        {/* STEPPER DINÁMICO */}
        {!isSubmitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-unipaz-orange">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-slate-500">
                {requiereEstudioSocioeconomico ? (
                  <>
                    {currentStep === 1 && '1. Datos Generales & Modalidad'}
                    {currentStep === 2 && '2. Composición Familiar & Empleo'}
                    {currentStep === 3 && '3. Balance Económico Familiar'}
                    {currentStep === 4 && '4. Vivienda, Bienes & Traslado'}
                    {currentStep === 5 && '5. Justificación, Documentos & Firma'}
                  </>
                ) : (
                  <>
                    {currentStep === 1 && '1. Datos Generales & Modalidad'}
                    {currentStep === 2 && '2. Situación Laboral & Justificación'}
                    {currentStep === 3 && '3. Documentos, Veracidad & Firma'}
                  </>
                )}
              </span>
            </div>
            <div className={`grid gap-1.5 ${requiereEstudioSocioeconomico ? 'grid-cols-5' : 'grid-cols-3'}`}>
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === step
                      ? 'bg-unipaz-orange shadow-sm'
                      : currentStep > step
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* FORMULARIO O CONFIRMACIÓN */}
        {isSubmitted ? (
          <div className="text-center py-10 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              ¡Solicitud de Beca Registrada con Éxito!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {feedbackMsg ||
                'Tu solicitud oficial ha sido remitida formalmente al Comité de Becas UNIPAZ para su dictamen y asignación de porcentaje correspondiente.'}
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ========================================== */}
            {/* PASO 1: DATOS PERSONALES Y MODALIDAD */}
            {/* ========================================== */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Selector de Modalidad Institucional */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-black text-xs text-unipaz-navy dark:text-amber-300 uppercase tracking-wider">
                      Modalidad de Beca Solicitada:
                    </label>
                    {selectedModalidadConfig?.requiere_estudio_socioeconomico ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300">
                        Requiere Estudio Socioeconómico
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300">
                        Dictamen por Mérito / Convenio
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedTipoBeca}
                    onChange={(e) => {
                      setSelectedTipoBeca(e.target.value);
                      setCurrentStep(1); // Reiniciar al paso 1 por cambio de modalidad
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
                  >
                    <option value="Beca de Continuidad Escolar (Estudio Socioeconómico)">
                      1. Beca de Continuidad Escolar (Estudio Socioeconómico 20% - 30%)
                    </option>
                    <option value="Beca de Excelencia Académica">
                      2. Beca de Excelencia Académica (Promedio 9.0 a 10.0 · 50% - 80%)
                    </option>
                    <option value="Beca por Convenios">
                      3. Beca por Convenios (Empresas / Instituciones · 25% - 30%)
                    </option>
                    <option value="Beca Familiar">
                      4. Beca Familiar (Hermanos inscritos · 25%)
                    </option>
                    <option value="Beca Egresado UNIPAZ">
                      5. Beca Egresado UNIPAZ (Egresados o familiares · 25%)
                    </option>
                    <option value="Beca de Promoción">
                      6. Beca de Promoción (Campañas educativas y ferias · 30%)
                    </option>
                    <option value="Beca Grupo Violeta">
                      7. Beca Grupo Violeta (Instituto de Justicia para Mujeres · 50% Trabajo Social)
                    </option>
                    <option value="Beca Colaborador UNIPAZ">
                      8. Beca Colaborador UNIPAZ (Personal UNIPAZ en Posgrados · 25% - 50%)
                    </option>
                  </select>

                  {/* Banner de Validación de Condiciones Especiales por Carrera */}
                  {validacionCarrera.motivoBloqueo && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span className="font-bold">{validacionCarrera.motivoBloqueo}</span>
                    </div>
                  )}

                  {validacionCarrera.advertencia && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{validacionCarrera.advertencia}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedModalidadConfig?.descripcion ||
                      'Selecciona la modalidad para la que cumples los requisitos de la convocatoria.'}
                  </p>

                  {/* Switch para incluir estudio socioeconómico si la modalidad no lo exige obligatoriamente */}
                  {!selectedModalidadConfig?.requiere_estudio_socioeconomico && (
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">
                        ¿Deseas adjuntar Estudio Socioeconómico completo para mayor consideración del Comité?
                      </span>
                      <button
                        type="button"
                        onClick={() => setSolicitaEstudioVoluntario(!solicitaEstudioVoluntario)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          solicitaEstudioVoluntario ? 'bg-unipaz-orange' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            solicitaEstudioVoluntario ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Nombre y Apellidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Nombre(s):
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Apellidos:
                    </label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Programa Académico y Periodo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Programa Académico / Carrera:
                    </label>
                    <select
                      value={carrera}
                      onChange={(e) => setCarrera(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <optgroup label="Licenciaturas">
                        {PROGRAMAS_ACADEMICOS.filter((p) => p.startsWith('LICENCIATURA')).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Maestrías y Posgrados">
                        {PROGRAMAS_ACADEMICOS.filter((p) => p.startsWith('MAESTRÍA')).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      {getNombrePeriodo(carrera)}:
                    </label>
                    <select
                      value={cuatrimestre}
                      onChange={(e) => setCuatrimestre(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold font-mono"
                    >
                      {Array.from({ length: getMaxPeriodos(carrera) }, (_, i) => i + 1).map((c) => (
                        <option key={c} value={c}>
                          {c}° {getNombrePeriodo(carrera)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PASOS CUANDO SE REQUIERE ESTUDIO SOCIOECONÓMICO (PASOS 2, 3, 4) */}
            {/* ========================================================= */}
            {requiereEstudioSocioeconomico && currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-unipaz-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-unipaz-orange" />
                      Cédula de Información Socioeconómica · Composición Familiar
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Registra a las personas que habitan y dependen de la misma economía.
                    </span>
                  </div>
                </div>

                {/* Tabla de Integrantes */}
                <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Nombre</th>
                        <th className="p-2.5">Parentesco</th>
                        <th className="p-2.5">Edad</th>
                        <th className="p-2.5">Ocupación</th>
                        <th className="p-2.5 text-right">Ingreso Mensual</th>
                        <th className="p-2.5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {miembros.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold">{m.nombre}</td>
                          <td className="p-2.5 text-slate-500">{m.parentesco}</td>
                          <td className="p-2.5 font-mono">{m.edad} años</td>
                          <td className="p-2.5">{m.ocupacion}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                            ${m.ingresoMensual.toLocaleString('es-MX')} MXN
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMiembro(m.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Formulario para Agregar Familiar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    + Agregar Familiar al Estudio
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    />
                    <select
                      value={nuevoParentesco}
                      onChange={(e) => setNuevoParentesco(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-semibold"
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
                      className="py-2 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-unipaz-orange" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {requiereEstudioSocioeconomico && currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ingresos Mensuales */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <h4 className="font-black text-xs text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Ingresos Mensuales del Hogar
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500">Ingreso Padre / Tutor:</label>
                        <input
                          type="number"
                          value={ingresoPadre}
                          onChange={(e) => setIngresoPadre(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Ingreso Madre / Tutora:</label>
                        <input
                          type="number"
                          value={ingresoMadre}
                          onChange={(e) => setIngresoMadre(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Ingreso Solicitante:</label>
                        <input
                          type="number"
                          value={ingresoAspirante}
                          onChange={(e) => setIngresoAspirante(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Egresos Mensuales */}
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                    <h4 className="font-black text-xs text-rose-800 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Egresos Mensuales del Hogar
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500">Alimentación:</label>
                        <input
                          type="number"
                          value={egresoAlimentacion}
                          onChange={(e) => setEgresoAlimentacion(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Renta / Casa:</label>
                        <input
                          type="number"
                          value={egresoRenta}
                          onChange={(e) => setEgresoRenta(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Luz y Agua:</label>
                        <input
                          type="number"
                          value={egresoLuzAgua}
                          onChange={(e) => setEgresoLuzAgua(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Transporte:</label>
                        <input
                          type="number"
                          value={egresoTransporte}
                          onChange={(e) => setEgresoTransporte(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculadora en Vivo */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-unipaz-navy to-slate-900 text-white space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span>Total Ingresos Familiares:</span>
                    <strong className="font-mono text-emerald-400">${totalIngresos.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Total Gastos del Hogar:</span>
                    <strong className="font-mono text-rose-400">${totalEgresos.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between font-black text-sm">
                    <span>Balance Económico Neto:</span>
                    <span className={`font-mono ${balanceNeto >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                      ${balanceNeto.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              </div>
            )}

            {requiereEstudioSocioeconomico && currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Tipo de Vivienda:
                    </label>
                    <select
                      value={tipoVivienda}
                      onChange={(e) => setTipoVivienda(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="Propia (Pagada)">Propia (Pagada)</option>
                      <option value="Propia (Pagándose / Hipoteca)">Propia (Pagándose / Hipoteca)</option>
                      <option value="Rentada">Rentada</option>
                      <option value="Prestada / Familiar">Prestada / Familiar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Medio de Transporte:
                    </label>
                    <select
                      value={medioTransporte}
                      onChange={(e) => setMedioTransporte(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="Transporte Público (Camión / Calafia)">Transporte Público (Camión / Calafia)</option>
                      <option value="Automóvil Propio / Familiar">Automóvil Propio / Familiar</option>
                      <option value="A Pie / Bicicleta">A Pie / Bicicleta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Tiempo Traslado a UNIPAZ:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tiempoTrasladoMinutos}
                        onChange={(e) => setTiempoTrasladoMinutos(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs"
                      />
                      <span className="text-xs text-slate-500 font-bold">min</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Referencias para Visita Domiciliaria (Trabajo Social):
                  </label>
                  <textarea
                    rows={3}
                    value={referenciasUbicacion}
                    onChange={(e) => setReferenciasUbicacion(e.target.value)}
                    placeholder="Color de fachada, portón, entre qué calles o puntos de referencia..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PASO 2 EN MODALIDADES SIN ESTUDIO OBLIGATORIO (ÁGIL) */}
            {/* ========================================================= */}
            {!requiereEstudioSocioeconomico && currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Switch de Trabajo */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                        ¿Trabajas actualmente?
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Indica si realizas alguna actividad económica remunerada.
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
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-one-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Empresa o Negocio:
                        </label>
                        <input
                          type="text"
                          value={empresa}
                          onChange={(e) => setEmpresa(e.target.value)}
                          placeholder="Nombre de la empresa"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Puesto y Horario:
                        </label>
                        <input
                          type="text"
                          value={puesto}
                          onChange={(e) => setPuesto(e.target.value)}
                          placeholder="Ej. Asistente / Turno Vespertino"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Motivos de Solicitud */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">
                      Motivos y Justificación Académica / Representativa:
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {motivosSolicitud.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={motivosSolicitud}
                    onChange={(e) => setMotivosSolicitud(e.target.value)}
                    placeholder="Describe detalladamente tu compromiso académico, trayectoria o representación UNIPAZ..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-unipaz-orange"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* ÚLTIMO PASO: JUSTIFICACIÓN, DOCUMENTOS Y FIRMA */}
            {/* ========================================================= */}
            {((requiereEstudioSocioeconomico && currentStep === 5) ||
              (!requiereEstudioSocioeconomico && currentStep === 3)) && (
              <div className="space-y-4 animate-fadeIn">
                {requiereEstudioSocioeconomico && (
                  <div>
                    <label className="block text-xs font-black text-unipaz-navy dark:text-white uppercase mb-1">
                      Motivos y Justificación Detallada de la Solicitud:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={motivosSolicitud}
                      onChange={(e) => setMotivosSolicitud(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-2xl p-3 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-unipaz-orange"
                    />
                  </div>
                )}

                {/* Checklist Documental */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="font-bold text-xs text-unipaz-navy dark:text-white block uppercase tracking-wider">
                    Expediente Digital de Documentos Soporte (Adjuntos para Revisión)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span>1. Identificación Oficial INE</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span>2. Comprobante de Domicilio</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span>3. Kárdex / Historial Académico</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    {requiereEstudioSocioeconomico ? (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span>4. Comprobante de Ingresos</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span>4. Comprobante de Mérito / Convenio</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Veracidad y Firma */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-amber-950 dark:text-amber-200">
                    <input
                      type="checkbox"
                      required
                      checked={declaraVerdad}
                      onChange={(e) => setDeclaraVerdad(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] leading-snug">
                      Declaro bajo protesta de decir verdad que toda la información aquí consignada es verídica y autorizo al Comité de Becas de UNIPAZ a verificarla.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-amber-950 dark:text-amber-200">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaAvisoPrivacidad}
                      onChange={(e) => setAceptaAvisoPrivacidad(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] leading-snug">
                      He leído y acepto el Aviso de Privacidad Institucional para el resguardo y tratamiento de mis datos personales de becas.
                    </span>
                  </label>
                </div>

                {/* Firma Digital */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                    Firma Electrónica del Solicitante:
                  </label>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/20 text-center">
                    <span className="font-serif italic text-base text-unipaz-navy dark:text-amber-400">
                      {firmaDigitalNombre}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NAVEGACIÓN Y ACCIONES */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
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
                  onClick={() => alert('Borrador de solicitud guardado.')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guardar Borrador</span>
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="py-2.5 px-5 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    Siguiente Paso
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!declaraVerdad || !aceptaAvisoPrivacidad}
                    className={`py-2.5 px-6 rounded-2xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                      declaraVerdad && aceptaAvisoPrivacidad
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20 hover:scale-105'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Solicitud al Comité
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
