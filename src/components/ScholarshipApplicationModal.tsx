'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  HelpCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

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
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>(
    'Excelencia Académica (Promedio 9.6 - 10.0)'
  );
  const [promedio, setPromedio] = useState<number>(student.promedio_academico || 9.5);
  const [motivo, setMotivo] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitScholarshipApplication(student.id, selectedTipoBeca);
    setFeedbackMsg(res.message);
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-orange text-slate-950 flex items-center justify-center shadow-md shadow-orange-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
              Convocatoria Oficial UNIPAZ / IESPAC
            </span>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Solicitud de Beca o Estímulo Institucional
            </h3>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-base text-emerald-900 dark:text-emerald-200">
              ¡Solicitud Registrada con Éxito!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {feedbackMsg}
            </p>
            <p className="text-[11px] text-slate-500">
              El Comité de Becas evaluará tu expediente y promedio escolar. Recibirás la notificación de resolución en tu panel de estudiante.
            </p>
            <button
              onClick={onClose}
              className="mt-4 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Periodo de Vigencia */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-500/30 flex items-center justify-between text-amber-900 dark:text-amber-200">
              <div>
                <span className="font-black text-[11px] block">Periodo de Recepción Abierto</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300">
                  Vigencia: {pfiConfig.fecha_inicio_solicitud_becas || '01-Sep'} al {pfiConfig.fecha_fin_solicitud_becas || '25-Sep'}
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-unipaz-orange" />
            </div>

            {/* Datos del Solicitante */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
              <div>
                <span className="text-slate-400 text-[10px] block">Estudiante:</span>
                <strong className="text-unipaz-navy dark:text-white font-bold">{student.nombre} {student.apellidos}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Matrícula & Carrera:</span>
                <strong className="text-unipaz-navy dark:text-white font-bold font-mono">{student.matricula} ({student.cuatrimestre || 1}° Cuatri)</strong>
              </div>
            </div>

            {/* Tipo de Beca Solicitada */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Modalidad de Beca / Estímulo a Postular:
              </label>
              <select
                value={selectedTipoBeca}
                onChange={(e) => setSelectedTipoBeca(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
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

            {/* Promedio Actual */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Promedio Académico Reportado:
              </label>
              <input
                type="number"
                step="0.01"
                min="7.0"
                max="10.0"
                value={promedio}
                onChange={(e) => setPromedio(parseFloat(e.target.value) || 9.0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-bold font-mono text-xs text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                * Sujeto a cotejo oficial contra el kardex emitido por Servicios Escolares.
              </span>
            </div>

            {/* Exposición de Motivos */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Exposición de Motivos y Compromiso Formativo:
              </label>
              <textarea
                rows={3}
                required
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe brevemente tus logros académicos, situación socioeconómica o participación deportiva/cultural..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Aceptación del Compromiso de los 1,000 Puntos */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-[11px] space-y-1.5">
              <span className="font-black text-unipaz-navy dark:text-white block">
                ⚖️ Compromiso del Becario UNIPAZ:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Al postularme, acepto la obligación reglamentaria de acumular un mínimo de <strong>1,000 puntos cuatrimestrales</strong> en actividades formativas a nombre de UNIPAZ, mantener cero reprobaciones en ordinario y cumplir con los roles de Staff asignados.
              </p>
            </div>

            {/* Botones de Acción */}
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
                className="py-2.5 px-6 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                Enviar Solicitud al Comité
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
