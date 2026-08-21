'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Mail,
  MapPin,
  PenTool,
  Phone,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import {
  formatGradoAcademico,
  getMaxPeriodos,
  getNombrePeriodo,
  isProgramaSemestral,
  OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA,
  OPCIONES_SEXO,
  PROGRAMAS_ACADEMICOS,
  UserProfile,
} from '@/lib/types';

interface ScholarshipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

export const ScholarshipApplicationModal: React.FC<ScholarshipApplicationModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { pfiConfig, submitScholarshipApplication } = usePFI();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  // Form State - Paso 1: Académico y Personal
  const [nombre, setNombre] = useState(student.nombre || '');
  const [apellidos, setApellidos] = useState(student.apellidos || '');
  const [carrera, setCarrera] = useState<string>(student.carrera || PROGRAMAS_ACADEMICOS[0]);
  const [cuatrimestre, setCuatrimestre] = useState(student.cuatrimestre?.toString() || '1');
  const [fechaNacimiento, setFechaNacimiento] = useState('2003-05-14');
  const [sexo, setSexo] = useState<string>('Hombre');
  const [pertenenciaEtnica, setPertenenciaEtnica] = useState<string>(OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA[0]);
  const [estadoCivil, setEstadoCivil] = useState('Soltero/a');
  const [telefono, setTelefono] = useState('(612) 123-4567');
  const [email, setEmail] = useState(student.email || 'estudiante@unipaz.mx');
  const [calle, setCalle] = useState('Av. de los Deportistas');
  const [numExterior, setNumExterior] = useState('145');
  const [numInterior, setNumInterior] = useState('');
  const [colonia, setColonia] = useState('8 de Octubre 1ra Sección');
  const [codigoPostal, setCodigoPostal] = useState('23080');
  const [ciudad, setCiudad] = useState('La Paz');
  const [estado, setEstado] = useState('Baja California Sur');
  const [preparatoriaProcedencia, setPreparatoriaProcedencia] = useState('CBTIS 230 / COBACH 01');
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>(
    'Excelencia Académica (Promedio 9.6 - 10.0)'
  );

  // Form State - Paso 2: Situación Laboral y Estudio Socioeconómico
  const [ingresoMensualFamiliar, setIngresoMensualFamiliar] = useState('$10,000 - $18,000 MXN');
  const [dependientesEconomicos, setDependientesEconomicos] = useState('3 a 4 personas');
  const [tipoVivienda, setTipoVivienda] = useState('Propia');
  const [trabajaActualmente, setTrabajaActualmente] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [puesto, setPuesto] = useState('');
  const [tipoJornada, setTipoJornada] = useState<'Medio Tiempo' | 'Tiempo Completo' | 'Por Honorarios'>('Medio Tiempo');
  const [nombreSuperior, setNombreSuperior] = useState('');
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('');
  const [motivosSolicitud, setMotivosSolicitud] = useState(
    'Solicito la presente beca institucional para continuar mis estudios profesionales con dedicación y excelencia, comprometiéndome a cumplir activamente con las horas formativas del Programa de Formación Integral y mantener mi promedio académico sobresaliente.'
  );

  // Form State - Paso 3: Términos y Firma
  const [declaraVerdad, setDeclaraVerdad] = useState(false);
  const [aceptaAvisoPrivacidad, setAceptaAvisoPrivacidad] = useState(false);
  const [firmaDigitalNombre, setFirmaDigitalNombre] = useState(`${student.nombre} ${student.apellidos}`);

  if (!isOpen) return null;

  // Calcular edad automáticamente
  const calcularEdad = (fecha: string) => {
    if (!fecha) return 20;
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return isNaN(edad) ? 20 : edad;
  };

  const edadCalculada = calcularEdad(fechaNacimiento);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaraVerdad || !aceptaAvisoPrivacidad) {
      alert('Debes aceptar la declaración de veracidad y el aviso de privacidad.');
      return;
    }
    const res = submitScholarshipApplication(student.id, selectedTipoBeca);
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

        {/* Header con Logotipo Institucional */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-orange text-slate-950 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                Convocatoria Institucional de Becas
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200">
                Beca Nueva
              </span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Formato de Solicitud de Beca Académica
            </h3>
          </div>
        </div>

        {/* STEPPER MULTI-PASO */}
        {!isSubmitted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  1
                </span>
                <span className="hidden sm:inline">Académico y Personal</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  2
                </span>
                <span className="hidden sm:inline">Situación y Motivos</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-unipaz-orange' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-unipaz-orange text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  3
                </span>
                <span className="hidden sm:inline">Términos y Firma</span>
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

        {/* CONTENIDO SEGÚN ESTADO O PASO */}
        {isSubmitted ? (
          <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-emerald-900 dark:text-emerald-200">
              ¡Solicitud de Beca Registrada con Éxito!
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto">
              Tu expediente y solicitud de <strong>{selectedTipoBeca}</strong> han sido turnados al Comité de Becas UNIPAZ para dictamen.
            </p>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-white/10 text-left text-xs space-y-1">
              <div><strong>Folio de Solicitud:</strong> <span className="font-mono text-unipaz-orange font-bold">SOL-BECA-{student.matricula}-{new Date().getFullYear()}</span></div>
              <div><strong>Estudiante:</strong> {nombre} {apellidos} ({student.matricula})</div>
              <div><strong>Programa Académico:</strong> {carrera} · {cuatrimestre}° {getNombrePeriodo(carrera)}</div>
              <div><strong>Fecha de Envío:</strong> {new Date().toLocaleDateString('es-MX')}</div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Recibirás la notificación de resolución en tu Dashboard de Estudiante una vez finalizado el periodo de evaluación.
            </p>
            <button
              onClick={onClose}
              className="mt-2 py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all hover:scale-105"
            >
              Aceptar y Volver al Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* PASO 1: INFORMACIÓN ACADÉMICA Y PERSONAL */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 flex items-center justify-between text-amber-900 dark:text-amber-200">
                  <div>
                    <span className="font-black text-xs block">Convocatoria Activa</span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300">
                      Recepción de solicitudes: {pfiConfig.fecha_inicio_solicitud_becas || '01-Sep'} al {pfiConfig.fecha_fin_solicitud_becas || '25-Sep'}
                    </span>
                  </div>
                  <Sparkles className="w-5 h-5 text-unipaz-orange" />
                </div>

                {/* Modalidad de Beca */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Modalidad de Beca / Estímulo a Postular:
                  </label>
                  <select
                    value={selectedTipoBeca}
                    onChange={(e) => setSelectedTipoBeca(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
                  >
                    <optgroup label="Excelencia, Mérito e Investigación">
                      <option value="Excelencia Académica (Promedio 9.6 - 10.0)">Beca de Excelencia Académica (Promedio 9.6 - 10.0)</option>
                      <option value="Mérito Académico">Estímulo al Mérito Académico</option>
                      <option value="Investigación y Publicaciones">Beca de Investigación y Publicaciones</option>
                      <option value="Posgrados e Investigación">Estímulo de Posgrados e Investigación</option>
                    </optgroup>
                    <optgroup label="Socioeconómicas, Familiares y Convenios">
                      <option value="Estudio Socioeconómico (desde 2° Cuatrimestre)">Beca Estudio Socioeconómico (desde 2° Cuatrimestre)</option>
                      <option value="Convenios Institucionales">Beca por Convenios Institucionales / Empresas</option>
                      <option value="Familiar / Hermanos (20%)">Beca Familiar / Hermanos (20%)</option>
                      <option value="Egresados UNIPAZ">Beca Egresados UNIPAZ</option>
                      <option value="Promoción Educativa">Beca de Promoción Educativa</option>
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

                {/* Grid Datos de Identidad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Matrícula:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={student.matricula}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
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

                {/* Programa Académico y Cuatrimestre */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Programa Académico:
                    </label>
                    <select
                      value={carrera}
                      onChange={(e) => setCarrera(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
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
                          {c}° {getNombrePeriodo(carrera)} {c > 10 && !isProgramaSemestral(carrera) ? '(Extensión / Irregular)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha Nacimiento, Sexo y Estado Civil */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Fecha de Nacimiento:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                      />
                      <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold flex items-center whitespace-nowrap">
                        {edadCalculada} años
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Sexo:
                    </label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                    >
                      {OPCIONES_SEXO.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                      Estado Civil:
                    </label>
                    <select
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                    >
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Unión Libre">Unión Libre</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                    </select>
                  </div>
                </div>

                {/* Autoadscripción Étnica y Grupos Prioritarios */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Autoadscripción Étnica y Grupos de Población Prioritaria:
                  </label>
                  <select
                    value={pertenenciaEtnica}
                    onChange={(e) => setPertenenciaEtnica(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
                  >
                    {OPCIONES_PERTENENCIA_ETNICA_PRIORITARIA.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Información con fines de equidad, inclusión e impulso de becas afirmativas UNIPAZ.
                  </span>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Teléfono Celular:
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="(612) 000-0000"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Correo Electrónico:
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Domicilio Actual */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <Home className="w-3.5 h-3.5 text-unipaz-orange" />
                    Domicilio Actual:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Calle"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                      className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Núm. Ext"
                        value={numExterior}
                        onChange={(e) => setNumExterior(e.target.value)}
                        className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Int"
                        value={numInterior}
                        onChange={(e) => setNumInterior(e.target.value)}
                        className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Colonia"
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="C.P."
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Ciudad / Municipio"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>

                {/* Prepa de Procedencia */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Escuela Preparatoria de Procedencia:
                  </label>
                  <input
                    type="text"
                    value={preparatoriaProcedencia}
                    onChange={(e) => setPreparatoriaProcedencia(e.target.value)}
                    placeholder="Nombre del Bachillerato o Preparatoria"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* PASO 2: SITUACIÓN LABORAL Y ESTUDIO SOCIOECONÓMICO */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Estudio Socioeconómico Familiar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                    <Home className="w-4 h-4 text-unipaz-orange" />
                    <div>
                      <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                        Estudio Socioeconómico y Entorno Familiar
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Información socioeconómica para evaluación del Comité de Becas.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                        Ingreso Familiar Mensual:
                      </label>
                      <select
                        value={ingresoMensualFamiliar}
                        onChange={(e) => setIngresoMensualFamiliar(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-semibold"
                      >
                        <option value="Menos de $10,000 MXN">Menos de $10,000 MXN</option>
                        <option value="$10,000 - $18,000 MXN">$10,000 - $18,000 MXN</option>
                        <option value="$18,000 - $30,000 MXN">$18,000 - $30,000 MXN</option>
                        <option value="Más de $30,000 MXN">Más de $30,000 MXN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                        Dependientes Económicos:
                      </label>
                      <select
                        value={dependientesEconomicos}
                        onChange={(e) => setDependientesEconomicos(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-semibold"
                      >
                        <option value="1 a 2 personas">1 a 2 personas</option>
                        <option value="3 a 4 personas">3 a 4 personas</option>
                        <option value="5 o más personas">5 o más personas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                        Tipo de Vivienda:
                      </label>
                      <select
                        value={tipoVivienda}
                        onChange={(e) => setTipoVivienda(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-semibold"
                      >
                        <option value="Propia">Propia</option>
                        <option value="Rentada">Rentada</option>
                        <option value="Prestada / Familiar">Prestada / Familiar</option>
                        <option value="Pagándose">Pagándose</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Switch de Trabajo */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-unipaz-navy dark:text-white block">
                        ¿Trabajas actualmente?
                      </span>
                      <span className="text-[11px] text-slate-500">
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

                  {/* Acordeón de Datos Laborales si trabaja */}
                  {trabajaActualmente && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                            Nombre de la Empresa o Negocio:
                          </label>
                          <input
                            type="text"
                            required={trabajaActualmente}
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                            placeholder="Ej. Comercializadora del Pacífico"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                            Puesto Desempeñado:
                          </label>
                          <input
                            type="text"
                            required={trabajaActualmente}
                            value={puesto}
                            onChange={(e) => setPuesto(e.target.value)}
                            placeholder="Ej. Asistente administrativo"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                          Tipo de Jornada:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(['Medio Tiempo', 'Tiempo Completo', 'Por Honorarios'] as const).map((j) => (
                            <button
                              key={j}
                              type="button"
                              onClick={() => setTipoJornada(j)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                                tipoJornada === j
                                  ? 'bg-unipaz-orange text-white border-unipaz-orange'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {j}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                            Nombre del Superior Inmediato:
                          </label>
                          <input
                            type="text"
                            value={nombreSuperior}
                            onChange={(e) => setNombreSuperior(e.target.value)}
                            placeholder="Jefe directo"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase mb-1">
                            Teléfono de la Empresa:
                          </label>
                          <input
                            type="tel"
                            value={telefonoEmpresa}
                            onChange={(e) => setTelefonoEmpresa(e.target.value)}
                            placeholder="(612) 000-0000"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Motivos de Solicitud */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">
                      Motivos por los cuales solicita la beca:
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {motivosSolicitud.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    value={motivosSolicitud}
                    onChange={(e) => setMotivosSolicitud(e.target.value)}
                    placeholder="Describe detalladamente tu situación académica, personal o económica, y tu compromiso con la comunidad UNIPAZ..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-unipaz-orange"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Consejo: Explica tu motivación vocacional y cómo el apoyo te permitirá culminar tus estudios con excelencia.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 3: TÉRMINOS, AVISO DE PRIVACIDAD Y FIRMA DIGITAL */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Resumen del Convenio */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Términos y Condiciones del Reglamento de Becas
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Al postular a una beca institucional de la Universidad Internacional de La Paz, el estudiante asume el compromiso de:
                  </p>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    <li>Mantener el promedio académico reglamentario (mín. 9.0 para Excelencia / 8.0 para Regular).</li>
                    <li>No reprobar ninguna asignatura ni presentar exámenes extraordinarios.</li>
                    <li>Acumular <strong>mínimo 1,000 puntos formativos cuatrimestrales</strong> en actividades a nombre de UNIPAZ.</li>
                    <li>Cubrir las cuotas de colegiatura complementarias en tiempo y forma.</li>
                  </ul>
                </div>

                {/* Checkboxes Obligatorios */}
                <div className="space-y-2 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-950 dark:text-amber-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={declaraVerdad}
                      onChange={(e) => setDeclaraVerdad(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] font-bold leading-snug">
                      Declaro bajo protesta de decir verdad que toda la información proporcionada en este formato es verídica y autorizo a la institución a verificarla.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaAvisoPrivacidad}
                      onChange={(e) => setAceptaAvisoPrivacidad(e.target.checked)}
                      className="mt-0.5 rounded text-unipaz-orange focus:ring-0"
                    />
                    <span className="text-[11px] leading-snug">
                      He leído y acepto el Aviso de Privacidad y el Reglamento de Becas y Estímulos de la Universidad Internacional de La Paz.
                    </span>
                  </label>
                </div>

                {/* Pad de Firma Digital Electrónica */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-unipaz-orange" />
                      Firma Digital del Aspirante / Sustentante:
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {hasSignature ? '✓ Trazada' : 'Firma Electrónica'}
                    </span>
                  </div>

                  {/* Input de Nombre / Trazador de Firma */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-white/20 text-center space-y-2">
                    <div className="font-serif italic text-base sm:text-lg text-unipaz-navy dark:text-amber-400 select-none py-2 border-b border-slate-200 dark:border-white/10">
                      {firmaDigitalNombre}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Firma Electrónica Certificada vinculada a Matrícula {student.matricula}</span>
                      <span>Fecha: {new Date().toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Nombre completo para ratificar la firma:
                    </label>
                    <input
                      type="text"
                      value={firmaDigitalNombre}
                      onChange={(e) => {
                        setFirmaDigitalNombre(e.target.value);
                        setHasSignature(true);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-unipaz-navy dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN INFERIOR (FOOTER) */}
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
                  onClick={() => {
                    alert('Borrador guardado localmente en esta sesión.');
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Guardar borrador"
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
