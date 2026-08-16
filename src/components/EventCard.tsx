'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  KeyRound,
  MapPin,
  QrCode,
  ScanLine,
  Send,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { QrScannerModal } from './QrScannerModal';
import { getAttendanceStatusInfo, getRoleBadgeInfo } from '@/lib/pfi-rules';
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
  const { validateOnlineOTP, currentUser, applyForStaffRole } = usePFI();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Modal para postularse como Staff
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffMotivation, setStaffMotivation] = useState('');
  const [staffFeedback, setStaffFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Modal escáner para Estudiante Staff
  const [showStaffScannerModal, setShowStaffScannerModal] = useState(false);

  const statusInfo = attendance ? getAttendanceStatusInfo(attendance, event) : null;
  const roleInfo = getRoleBadgeInfo(attendance?.rol_participacion);
  const isRegistered = Boolean(attendance && attendance.status !== 'cancelado');
  const isAcreditado = statusInfo?.isRealizado;
  const isNoRealizado = statusInfo?.isNoRealizado;
  const isStaffConfirmed = attendance?.rol_participacion === 'staff_logistica';
  const isFull = event.cupo_maximo > 0 && (event.cupo_ocupado || 0) >= event.cupo_maximo;

  const staffApplication = (event.solicitudes_staff || []).find((s) => s.student_id === currentUser.id);

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

  const handleStaffApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyForStaffRole(event.id, currentUser.id, staffMotivation);
    setStaffFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setShowStaffModal(false);
        setStaffFeedback(null);
        setStaffMotivation('');
      }, 2500);
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
    <>
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

              {attendance?.rol_participacion && attendance.rol_participacion !== 'asistente' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${roleInfo.badgeClass}`}>
                  {roleInfo.label}
                </span>
              )}
            </div>

            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-unipaz-orange to-amber-500 text-slate-950 font-black text-xs shadow-sm">
              +{event.horas_pfi} hrs Oyente
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

          {/* Opciones de Staff Convocatoria */}
          {event.permite_staff && (
            <div className="mt-3.5 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <span className="font-black text-purple-900 dark:text-purple-200 block text-[11px]">
                    Convocatoria a Staff Logístico (+{event.horas_staff || (event.horas_pfi * 1.5)} hrs)
                  </span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300">
                    Cupos: {event.cupo_staff_ocupado || 0} / {event.cupo_staff || 5} ocupados
                  </span>
                </div>
              </div>

              {!isStaffConfirmed && (
                <button
                  onClick={() => setShowStaffModal(true)}
                  disabled={staffApplication?.status === 'pendiente'}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm transition-all ${
                    staffApplication?.status === 'pendiente'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {staffApplication?.status === 'pendiente' ? '⏳ En Revisión' : 'Postularme'}
                </button>
              )}
            </div>
          )}

          {/* Cupo ocupado */}
          {event.cupo_maximo > 0 && (
            <div className="mt-3.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5" /> Cupo de Oyentes:
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
        <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
          {/* Si es Staff Confirmado: Habilitar Botón de Escanear Asistencias */}
          {isStaffConfirmed && (
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-400/40 text-xs text-purple-950 dark:text-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Staff Logístico Oficial (+{event.horas_staff || 10}h)
                </span>
              </div>
              <button
                onClick={() => setShowStaffScannerModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <ScanLine className="w-4 h-4" />
                Escanear Asistencias del Evento
              </button>
            </div>
          )}

          {isAcreditado ? (
            <div className="w-full flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl px-4 py-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ¡Actividad Acreditada ({roleInfo.label})!
              </span>
              <span className="font-black">
                +{attendance?.horas_acreditadas || event.horas_pfi} hrs
              </span>
            </div>
          ) : isNoRealizado ? (
            <div className="w-full flex items-center justify-between bg-rose-50 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 rounded-2xl px-4 py-2.5 text-rose-800 dark:text-rose-300 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                {statusInfo?.statusLabel}
              </span>
              <span className="font-mono font-black">
                {attendance?.penalizacion_horas ? `-${attendance.penalizacion_horas}h` : '0.00 hrs'}
              </span>
            </div>
          ) : isRegistered ? (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Inscripción Confirmada ({roleInfo.label})
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
              {isFull ? 'Cupo Agotado' : 'Registrarme como Oyente'}
            </button>
          )}
        </div>
      </div>

      {/* Modal para Postularse a Staff Logístico */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-unipaz-navy dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Postulación a Staff Logístico
              </h4>
              <button
                onClick={() => setShowStaffModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Como Staff apoyarás en el registro, control de acceso QR y logística general del evento <strong>{event.titulo}</strong>.
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Beneficios & Compromiso:
              </p>
              <p>• Acredita <strong>+{event.horas_staff || 10.00} hrs PFI</strong>.</p>
              <p className="text-rose-700 dark:text-rose-300 font-semibold">
                • ⚠️ Si tu postulación es aceptada y no asistes, se aplicará una penalización de <strong>-5.00 hrs</strong> en tu expediente.
              </p>
            </div>

            {staffFeedback && (
              <p className={`text-xs font-semibold ${staffFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {staffFeedback.text}
              </p>
            )}

            <form onSubmit={handleStaffApplicationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Motivo o experiencia previa (opcional):</label>
                <textarea
                  rows={2}
                  value={staffMotivation}
                  onChange={(e) => setStaffMotivation(e.target.value)}
                  placeholder="Ej. Tengo experiencia en control de accesos y me interesa apoyar..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                >
                  Enviar Postulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Escáner para Estudiante Staff */}
      {showStaffScannerModal && (
        <QrScannerModal
          isOpen={showStaffScannerModal}
          defaultEventId={event.id}
          onClose={() => setShowStaffScannerModal(false)}
        />
      )}

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
    </>
  );
};
