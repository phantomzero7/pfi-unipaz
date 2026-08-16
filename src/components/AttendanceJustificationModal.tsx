'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent } from '@/lib/types';

interface AttendanceJustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: EventAttendance;
  event?: PFIEvent;
}

export const AttendanceJustificationModal: React.FC<AttendanceJustificationModalProps> = ({
  isOpen,
  onClose,
  attendance,
  event,
}) => {
  const { submitJustification, currentUser } = usePFI();
  const [motivo, setMotivo] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;

    setIsSubmitting(true);
    const res = submitJustification({
      attendance_id: attendance.id,
      student_id: currentUser.id,
      event_id: attendance.event_id,
      motivo,
      archivo_nombre: fileName || 'comprobante_adjunto.pdf',
    });

    setFeedback({ success: res.success, text: res.message });
    setIsSubmitting(false);

    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-unipaz-orange" />
            <h3 className="font-black text-sm text-unipaz-navy dark:text-white">
              Solicitud de Justificación de Horas PFI
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs space-y-1">
          <span className="font-bold text-unipaz-navy dark:text-white block truncate">
            {event?.titulo || 'Actividad Formativa'}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
            Fecha: {event?.fecha_evento} · Horas en juego: +{attendance.horas_acreditadas || event?.horas_pfi || 0} hrs
          </span>
        </div>

        {feedback && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.success ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Motivo o Causa (Médica, Laboral, Fuerza Mayor o Error en Escáner):
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalla qué sucedió y por qué solicitas la justificación de asistencia..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-unipaz-orange"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adjuntar Comprobante o Evidencia (PDF, PNG, JPG):
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 text-center cursor-pointer hover:border-unipaz-orange transition-colors">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="font-bold text-xs text-unipaz-orange block">
                {fileName ? `Archivo: ${fileName}` : 'Haz clic para seleccionar archivo'}
              </span>
              <span className="text-[10px] text-slate-400">Receta médica, carta laboral o foto</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold shadow-sm"
            >
              Enviar a Coordinación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
