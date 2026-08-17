'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  GraduationCap,
  Send,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

interface BecarioReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

export const BecarioReportModal: React.FC<BecarioReportModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { submitBecarioReport, getStudentScholarshipProgress } = usePFI();
  const progress = getStudentScholarshipProgress(student.id);

  const [actividadesDestacadas, setActividadesDestacadas] = useState('');
  const [impactoComunitario, setImpactoComunitario] = useState('');
  const [horasEstudioSemanales, setHorasEstudioSemanales] = useState('15');
  const [autoevaluacion, setAutoevaluacion] = useState('5');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBecarioReport(student.id);
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-unipaz-gold text-slate-950 flex items-center justify-center shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
              Comisión General de Becas y Estímulos
            </span>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Informe Cuatrimestral de Actividades del Becario
            </h3>
          </div>
        </div>

        {isSubmitted || student.informe_becario_entregado ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-base text-emerald-900 dark:text-emerald-200">
              Informe Entregado y Registrado
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tu informe cuatrimestral ha sido registrado con fecha oficial{' '}
              <strong className="font-mono">{student.fecha_informe_becario || new Date().toISOString().split('T')[0]}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              Puntos Formativos Acumulados: <strong className="font-mono text-emerald-600">+{progress.puntosTotales} pts</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Cerrar Formato
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20">
              <div>
                <span className="text-slate-400 text-[10px] block">Becario:</span>
                <strong className="text-unipaz-navy dark:text-white font-bold">{student.nombre} {student.apellidos}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Puntos Acreditados:</span>
                <strong className="text-amber-600 dark:text-amber-400 font-black font-mono">+{progress.puntosTotales} / 1,000 pts ({progress.porcentajeCumplimiento}%)</strong>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                1. Resumen de Actividades Formativas y Comunitarias Realizadas:
              </label>
              <textarea
                rows={3}
                required
                value={actividadesDestacadas}
                onChange={(e) => setActividadesDestacadas(e.target.value)}
                placeholder="Menciona los talleres, conferencias, investigaciones o participaciones como staff en las que colaboraste este periodo..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                2. Aportación o Impacto en la Comunidad Universitaria:
              </label>
              <textarea
                rows={2}
                required
                value={impactoComunitario}
                onChange={(e) => setImpactoComunitario(e.target.value)}
                placeholder="¿Cómo contribuyó tu participación al fortalecimiento de UNIPAZ y de tus compañeros?..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Horas de Estudio Semanales:
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={horasEstudioSemanales}
                  onChange={(e) => setHorasEstudioSemanales(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Autoevaluación de Desempeño:
                </label>
                <select
                  value={autoevaluacion}
                  onChange={(e) => setAutoevaluacion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excelente (100% de Compromiso)</option>
                  <option value="4">⭐⭐⭐⭐ Muy Bueno</option>
                  <option value="3">⭐⭐⭐ Satisfactorio</option>
                  <option value="2">⭐⭐ Regular</option>
                </select>
              </div>
            </div>

            {/* Subida de Evidencia Adicional (Opcional) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-white/20 text-center space-y-1.5 cursor-pointer hover:border-unipaz-orange transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mx-auto" />
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                Adjuntar Evidencias Fotográficas o Constancias Adicionales (PDF/ZIP)
              </span>
              <span className="text-[10px] text-slate-400 block">Máximo 10 MB</span>
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
                className="py-2.5 px-6 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                Registrar Informe de Becario
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
