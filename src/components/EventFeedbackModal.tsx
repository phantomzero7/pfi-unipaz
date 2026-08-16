'use client';

import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Star, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { PFIEvent } from '@/lib/types';

interface EventFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PFIEvent;
}

export const EventFeedbackModal: React.FC<EventFeedbackModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { submitEventFeedback, currentUser } = usePFI();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEventFeedback({
      event_id: event.id,
      student_id: currentUser.id,
      calificacion: rating,
      comentarios: comments,
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-black text-sm text-unipaz-navy dark:text-white">
              Encuesta de Calidad & Satisfacción
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          ¿Cómo fue tu experiencia en <strong>{event.titulo}</strong>? Tu opinión ayuda a la Coordinación del PFI a mejorar la oferta formativa.
        </p>

        {submitted ? (
          <div className="p-6 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ¡Gracias por tus comentarios!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 5 Stars Rating Selector */}
            <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
              <span className="font-bold text-slate-500 text-[11px]">Calificación General:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-amber-500">
                {rating === 5 ? '⭐⭐⭐⭐⭐ ¡Excelente!' : rating === 4 ? '⭐⭐⭐⭐ Muy Bueno' : rating === 3 ? '⭐⭐⭐ Regular' : '⭐⭐ Mejorable'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Comentarios sobre el instructor y contenido (opcional):
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="¿Qué te pareció la dinámica y el contenido del taller?..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
              >
                Omitir
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm hover:from-amber-600 hover:to-orange-600"
              >
                Enviar Evaluación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
