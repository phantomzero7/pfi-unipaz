'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Globe, KeyRound, MapPin, Sparkles, UserPlus, Users, XCircle } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent } from '@/lib/types';

interface EventCardProps {
  event: PFIEvent;
  attendance?: EventAttendance;
  onRegister?: () => void;
  onCancel?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  attendance,
  onRegister,
  onCancel,
}) => {
  const { validateOnlineOTP, currentUser } = usePFI();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<{ success: boolean; text: string } | null>(null);

  const isRegistered = Boolean(attendance && attendance.status !== 'cancelado');
  const isAcreditado = attendance?.status === 'asistio';
  const isFull = event.cupo_maximo > 0 && (event.cupo_ocupado || 0) >= event.cupo_maximo;

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    const res = validateOnlineOTP(event.id, otpInput, currentUser.id);
    setOtpMessage({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setShowOtpModal(false);
        setOtpMessage(null);
        setOtpInput('');
      }, 1800);
    }
  };

  // Color de etiqueta según categoría
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'PVC':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-400/30';
      case 'Taller Liderazgo':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-400/30';
      case 'Taller Extracurricular':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-400/30';
      case 'Investigación':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-400/30';
      case 'Club Anual':
        return 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-400/30';
      default:
        return 'bg-orange-100 dark:bg-unipaz-orange/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-unipaz-orange/30';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 shadow-lg shadow-blue-950/5 dark:shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-unipaz-orange/40 hover:scale-[1.01]">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-unipaz-cobalt via-unipaz-orange to-unipaz-gold opacity-80" />

      <div>
        {/* Badges superiores: Categoría, Modalidad y Horas */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryColor(event.categoria)}`}>
              {event.categoria}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              {event.modalidad.toUpperCase()}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-unipaz-orange to-amber-500 text-slate-950 font-black text-xs shadow-sm">
            +{event.horas_pfi} hrs PFI
          </div>
        </div>

        {/* Título & Descripción */}
        <h4 className="mt-3.5 text-lg font-black text-unipaz-navy dark:text-white leading-snug">
          {event.titulo}
        </h4>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {event.descripcion}
        </p>

        {/* Metadata: Fecha, Horario y Ubicación */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-unipaz-orange flex-shrink-0" />
            <span className="font-semibold">{event.fecha_evento}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="font-medium">{event.hora_inicio} - {event.hora_fin} hrs</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-unipaz-cobalt flex-shrink-0" />
            <span className="truncate">{event.ubicacion || 'Campus UNIPAZ'}</span>
          </div>
        </div>

        {/* Cupo ocupado */}
        {event.cupo_maximo > 0 && (
          <div className="mt-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" /> Cupo del Evento:
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                {event.cupo_ocupado || 0} / {event.cupo_maximo}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-unipaz-cobalt to-unipaz-orange'
                }`}
                style={{
                  width: `${Math.min(100, (((event.cupo_ocupado || 0) / event.cupo_maximo) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
        {isAcreditado ? (
          <div className="w-full flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl px-4 py-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ¡Actividad Acreditada!
            </span>
            <span className="font-black">
              +{attendance?.horas_acreditadas || event.horas_pfi} hrs
            </span>
          </div>
        ) : isRegistered ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Inscripción Confirmada
              </span>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                >
                  Cancelar cupo
                </button>
              )}
            </div>

            {event.otp_online_code && (
              <button
                onClick={() => setShowOtpModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-amber-300 dark:border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Ingresar Token OTP de Asistencia Virtual
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onRegister}
            disabled={isFull}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              isFull
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-md shadow-orange-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {isFull ? 'Cupo Agotado' : 'Registrarme a esta Actividad'}
          </button>
        )}
      </div>

      {/* Modal de Validación OTP Online */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white">
            <h4 className="font-extrabold text-base text-unipaz-navy dark:text-white">
              Validar Asistencia Virtual
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Ingresa el código OTP de 6 caracteres proporcionado durante la transmisión en vivo del evento.
            </p>

            <form onSubmit={handleOtpSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.toUpperCase())}
                placeholder="Ej. PVC202"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-unipaz-orange focus:outline-none focus:border-unipaz-orange"
              />

              {otpMessage && (
                <p className={`text-xs font-semibold text-center ${otpMessage.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {otpMessage.text}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-unipaz-orange text-white dark:text-slate-950 text-xs font-bold hover:bg-orange-600 shadow-md"
                >
                  Acreditar Horas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
