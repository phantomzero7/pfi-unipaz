'use client';

import React from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { PFIEvent, UserProfile } from '@/lib/types';

interface EventRegistrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: PFIEvent;
  currentUser: UserProfile;
}

export const EventRegistrationConfirmModal: React.FC<EventRegistrationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
  currentUser,
}) => {
  if (!isOpen) return null;

  const isOnline = event.modalidad === 'online';
  const isHybrid = event.modalidad === 'hibrido';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-unipaz-orange to-amber-500 text-slate-950 shadow-md shadow-orange-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
              Inscripción de Actividad Universitaria
            </span>
            <h3 className="text-lg font-black text-unipaz-navy dark:text-white leading-tight">
              Confirmar Asistencia
            </h3>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-unipaz-navy/10 dark:bg-white/10 text-unipaz-navy dark:text-white">
              {event.categoria}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              +{event.horas_pfi} hrs PFI
            </span>
            {currentUser.tiene_beca && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                +{event.puntos_beca || 50} pts Beca
              </span>
            )}
          </div>

          <h4 className="text-base font-black text-unipaz-navy dark:text-white">
            {event.titulo}
          </h4>

          {event.descripcion && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {event.descripcion}
            </p>
          )}

          {/* Logistics Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-unipaz-orange flex-shrink-0" />
              <span><strong>Fecha:</strong> {event.fecha_evento}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span><strong>Horario:</strong> {event.hora_inicio} - {event.hora_fin} hrs</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span><strong>Modalidad:</strong> {event.modalidad.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">
                <strong>Ubicación:</strong> {event.ubicacion || (isOnline ? 'Google Meet / Plataforma Virtual' : 'Campus UNIPAZ')}
              </span>
            </div>
          </div>
        </div>

        {/* Logistics Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-black">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Políticas de Asistencia y Cancelación:
          </div>
          <ul className="text-[11px] text-amber-800 dark:text-amber-300 space-y-1 list-disc pl-4">
            <li>Tu inscripción quedará registrada como <strong>CONFIRMADA</strong>.</li>
            <li>
              Podrás cancelar tu lugar <strong>hasta 10 minutos antes</strong> del inicio del evento.
            </li>
            <li>
              Posterior a ese plazo, tu cupo queda en firme y la inasistencia sin Check-in/Check-out será computada como falta en tu historial formativo.
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all"
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Inscripción
          </button>
        </div>
      </div>
    </div>
  );
};
