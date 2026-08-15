'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  History,
  LogIn,
  LogOut,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { AttendanceStatus, PFIEvent, UserProfile } from '@/lib/types';

export default function AdminScannerPage() {
  const { events, profiles, checkInStudent, checkOutStudent, attendances } = usePFI();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
  const [manualQuery, setManualQuery] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Attendances del evento actual
  const eventAttendances = attendances
    .filter((a) => a.event_id === currentEvent?.id)
    .map((att) => ({
      ...att,
      student: profiles.find((p) => p.id === att.student_id),
    }));

  useEffect(() => {
    if (useCamera) {
      const scanner = new Html5QrcodeScanner(
        'qr-scanner-fullscreen',
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          handleProcessCode(decodedText);
          scanner.clear();
          setUseCamera(false);
        },
        () => {}
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [useCamera]);

  const handleProcessCode = (code: string) => {
    if (!currentEvent) return;

    let parsed = code.trim();
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const json = JSON.parse(code);
        parsed = json.matricula || json.id || json.secret || parsed;
      }
    } catch (e) {
      // Normal string
    }

    if (mode === 'check_in') {
      const res = checkInStudent(currentEvent.id, parsed);
      if (res.success) {
        setScanResult({
          type: 'success',
          title: '¡Check-In Registrado!',
          message: res.message,
          details: `Estudiante: ${res.student?.nombre} ${res.student?.apellidos} (${res.student?.matricula})`,
        });
      } else {
        setScanResult({
          type: 'error',
          title: 'Fallo de Check-In',
          message: res.message,
        });
      }
    } else {
      const res = checkOutStudent(currentEvent.id, parsed);
      if (res.success) {
        setScanResult({
          type: res.status === 'asistio' ? 'success' : 'warning',
          title: res.status === 'asistio' ? '¡Check-Out & Horas Validadas!' : 'Check-Out Incompleto',
          message: res.message,
          details: `Permanencia: ${res.stayMinutes || 0} min (${res.stayPercentage || 0}%) · Horas: +${res.hoursCredited || 0} hrs`,
        });
      } else {
        setScanResult({
          type: 'error',
          title: 'Fallo de Check-Out',
          message: res.message,
        });
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    handleProcessCode(manualQuery);
    setManualQuery('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-950/5 dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Módulo de Control de Asistencia en Tiempo Real
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-unipaz-navy dark:text-white mt-1">
          Escáner QR de Check-In y Check-Out
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Valida la presencia de los estudiantes mediante su código QR institucional. El sistema aplica automáticamente la <strong>Regla del 80% de permanencia mínima</strong> para acreditar las horas oficiales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Escáner y Controles */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-lg shadow-blue-950/5 dark:shadow-2xl space-y-6">
          {/* Selector de Evento Activo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Seleccionar Evento a Auditar:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-unipaz-orange font-bold"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.titulo} ({evt.horas_pfi} hrs · {evt.fecha_evento} · {evt.modalidad})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle de Modo: Entrada vs Salida */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setMode('check_in')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                mode === 'check_in'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              1. Entrada (Check-In)
            </button>

            <button
              onClick={() => setMode('check_out')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                mode === 'check_out'
                  ? 'bg-unipaz-orange text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogOut className="w-4 h-4" />
              2. Salida (Check-Out)
            </button>
          </div>

          {/* Resultado del Escaneo */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-fadeIn ${
                scanResult.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : scanResult.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {scanResult.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="text-sm font-black">{scanResult.title}</h5>
                <p className="text-xs mt-0.5 font-medium">{scanResult.message}</p>
                {scanResult.details && (
                  <p className="text-xs font-bold mt-1 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-950/50 px-2.5 py-1 rounded-md inline-block border border-slate-200 dark:border-transparent">
                    {scanResult.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cámara Scanner */}
          {useCamera ? (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center">
              <div id="qr-scanner-fullscreen" className="w-full max-w-xs text-slate-900 rounded-xl overflow-hidden" />
              <button
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setUseCamera(false);
                }}
                className="mt-3 text-xs text-slate-500 dark:text-slate-400 hover:text-unipaz-navy dark:hover:text-white font-bold"
              >
                Desactivar Cámara
              </button>
            </div>
          ) : (
            <button
              onClick={() => setUseCamera(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-unipaz-cobalt to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Camera className="w-5 h-5" />
              Abrir Cámara para Escaneo en Vivo
            </button>
          )}

          {/* Entrada Manual */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              O validar estudiante por Matrícula / Clave:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Ej. UP220419"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-unipaz-orange hover:bg-orange-600 text-white dark:text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                Procesar
              </button>
            </div>
          </form>

          {/* Quick Click Simulators */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Simulación Rápida (Clic para escanear):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profiles
                .filter((p) => p.role === 'estudiante')
                .map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handleProcessCode(std.matricula)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange/40 text-left transition-all group shadow-sm"
                  >
                    <div className="text-xs font-black text-unipaz-navy dark:text-white group-hover:text-unipaz-orange truncate">
                      {std.nombre} {std.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {std.matricula}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Lista de Asistentes al Evento */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-unipaz-orange" />
                Asistencias de este Evento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {eventAttendances.length} registros para este evento
              </p>
            </div>
          </div>

          {eventAttendances.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay asistencias registradas para este evento aún.
            </div>
          ) : (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {eventAttendances.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-black text-unipaz-navy dark:text-white">
                      {att.student?.nombre} {att.student?.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {att.student?.matricula}
                    </div>
                    {att.notes && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-300/80 mt-0.5 truncate max-w-[200px] font-medium">
                        {att.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {att.status === 'asistio' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-400/30">
                        +{att.horas_acreditadas} hrs
                      </span>
                    ) : att.status === 'registrado' && att.check_in_timestamp ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        En curso (In)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                        {att.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
