'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Home,
  Send,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

interface SocioeconomicStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

export const SocioeconomicStudyModal: React.FC<SocioeconomicStudyModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { submitSocioeconomicStudy } = usePFI();

  const [ingresoMensualFamiliar, setIngresoMensualFamiliar] = useState('12000');
  const [numHabitantes, setNumHabitantes] = useState('4');
  const [tipoVivienda, setTipoVivienda] = useState('Propia');
  const [dependientesEconomicos, setDependientesEconomicos] = useState('2');
  const [trabajaEstudiante, setTrabajaEstudiante] = useState('no');
  const [gastoColegiaturaAproximado, setGastoColegiaturaAproximado] = useState('3500');
  const [observacionesFamiliares, setObservacionesFamiliares] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSocioeconomicStudy(student.id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-unipaz-navy text-white flex items-center justify-center shadow-md">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
              Departamento de Trabajo Social & Becas
            </span>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Cédula de Estudio Socioeconómico
            </h3>
          </div>
        </div>

        {isSubmitted || student.estudio_socioeconomico_entregado ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-base text-emerald-900 dark:text-emerald-200">
              Cédula Socioeconómica Recibida
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tu información socioeconómica ha sido registrada con fecha oficial{' '}
              <strong className="font-mono">{student.fecha_estudio_socioeconomico || new Date().toISOString().split('T')[0]}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              El área de Trabajo Social integrará este diagnóstico al dictamen de beca cuatrimestral.
            </p>
            <button
              onClick={onClose}
              className="mt-4 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Cerrar Cédula
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">Estudiante Solicitante:</span>
                <strong className="text-unipaz-navy dark:text-white font-bold">{student.nombre} {student.apellidos} ({student.matricula})</strong>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300">
                {student.carrera}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ingreso Mensual Familiar Total ($MXN):
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={ingresoMensualFamiliar}
                  onChange={(e) => setIngresoMensualFamiliar(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Personas que Habitan en el Hogar:
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="15"
                  value={numHabitantes}
                  onChange={(e) => setNumHabitantes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tipo de Vivienda:
                </label>
                <select
                  value={tipoVivienda}
                  onChange={(e) => setTipoVivienda(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                >
                  <option value="Propia">Propia (Pagada)</option>
                  <option value="Hipotecada">Propia (En Pago / Hipoteca)</option>
                  <option value="Rentada">Rentada</option>
                  <option value="Prestada">Prestada / Familiar</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  ¿El Alumno Trabaja Actualmente?
                </label>
                <select
                  value={trabajaEstudiante}
                  onChange={(e) => setTrabajaEstudiante(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                >
                  <option value="no">No, sólo estudia</option>
                  <option value="si_medio_tiempo">Sí, Medio Tiempo</option>
                  <option value="si_tiempo_completo">Sí, Tiempo Completo</option>
                  <option value="freelance">Sí, Empleo Eventual / Negocio Familiar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Situación Familiar o Gastos Extraordinarios (Médicos, etc.):
              </label>
              <textarea
                rows={3}
                value={observacionesFamiliares}
                onChange={(e) => setObservacionesFamiliares(e.target.value)}
                placeholder="Indica si existen gastos médicos crónicos, dependientes especiales o situaciones que afecten la solvencia familiar..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Declaración Bajo Protesta de Decir Verdad */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              🛡️ <strong>Declaración de Veracidad:</strong> Declaro bajo protesta de decir verdad que los datos económicos asentados son fidedignos y autorizo a la Universidad Internacional de La Paz a verificar la documentación correspondiente.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-unipaz-navy hover:bg-blue-900 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Send className="w-4 h-4 text-unipaz-orange" />
                Registrar Estudio Socioeconómico
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
