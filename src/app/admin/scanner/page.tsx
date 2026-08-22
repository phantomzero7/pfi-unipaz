'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  FlipHorizontal,
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

  // Estados de Cámara Smartphone
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-admin-scanner-view';

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

  // Detectar cámaras de smartphone y auto-iniciar cámara trasera
  useEffect(() => {
    let isMounted = true;

    // Iniciar de forma automática tras el montaje del DOM
    const autoStartTimer = setTimeout(() => {
      if (isMounted) {
        startCamera();
      }
    }, 250);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isMounted && devices && devices.length > 0) {
          setCameraDevices(devices);
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('trasera') ||
              d.label.toLowerCase().includes('environment')
          );
          if (backCam) {
            setSelectedCameraId(backCam.id);
          } else {
            setSelectedCameraId(devices[0].id);
          }
        }
      })
      .catch((err) => console.warn('Could not enumerate cameras:', err));

    return () => {
      isMounted = false;
      clearTimeout(autoStartTimer);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear());
          }
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startCamera = async (cameraIdToUse?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);
    try {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch (e) {
          // ignore
        }
      }

      const container = document.getElementById(scannerContainerId);
      if (!container) {
        setIsStartingCamera(false);
        return;
      }

      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      const cameraConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: 'environment' };

      await qrScanner.start(
        cameraConfig,
        {
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.75);
            return { width: Math.max(edge, 220), height: Math.max(edge, 220) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([80, 40, 80]);
          }
          handleProcessCode(decodedText);
        },
        () => {}
      );

      setIsCameraActive(true);
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Error starting camera, trying fallback:', err);
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            { fps: 20, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
            (decodedText) => handleProcessCode(decodedText),
            () => {}
          );
          setIsCameraActive(true);
          setIsStartingCamera(false);
          return;
        }
      } catch (fallbackErr) {
        console.error('All camera attempts failed:', fallbackErr);
      }

      setCameraError(
        'No se pudo acceder automáticamente a la cámara. Por favor autoriza los permisos de cámara en tu smartphone o pulsa "Alternar Lente".'
      );
      setIsCameraActive(false);
      setIsStartingCamera(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  const handleSwitchCamera = async () => {
    if (cameraDevices.length <= 1) {
      await startCamera();
      return;
    }
    const currentIndex = cameraDevices.findIndex((d) => d.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    const nextCamera = cameraDevices[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await startCamera(nextCamera.id);
  };

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
          details: `Estudiante: ${res.student?.nombre} ${res.student?.apellidos} (${res.student?.matricula}) · Rol: ${res.attendance?.rol_participacion === 'staff_logistica' ? 'Staff Logístico' : 'Oyente'}`,
        });
      } else {
        setScanResult({
          type: res.fraudWarning ? 'warning' : 'error',
          title: res.fraudWarning ? 'Alerta de Seguridad QR' : 'Fallo de Check-In',
          message: res.message,
          details: res.fraudWarning,
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
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Módulo de Control de Asistencia en Tiempo Real
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
          Escáner QR Móvil de Check-In y Check-Out
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Valida la presencia de los estudiantes escaneando su credencial con smartphones iOS o Android. Aplica automáticamente la <strong>Regla del 80% de permanencia mínima</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Escáner y Controles */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
          {/* Selector de Evento Activo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Seleccionar Evento a Auditar:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-unipaz-orange font-semibold"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.titulo} ({evt.horas_pfi} hrs · {evt.fecha_evento} · {evt.modalidad})
                </option>
              ))}
            </select>
          </div>

          {/* Pestañas Segmented Switch: Entrada vs Salida */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setMode('check_in')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'check_in'
                  ? 'bg-white dark:bg-emerald-500 text-emerald-800 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              1. Entrada (Check-In)
            </button>

            <button
              onClick={() => setMode('check_out')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'check_out'
                  ? 'bg-unipaz-orange text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                <h5 className="text-sm font-bold">{scanResult.title}</h5>
                <p className="text-xs mt-0.5 font-medium">{scanResult.message}</p>
                {scanResult.details && (
                  <p className="text-xs font-bold mt-1 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-950/50 px-2.5 py-1 rounded-md inline-block border border-slate-200 dark:border-transparent">
                    {scanResult.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cámara Scanner Smartphone */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden shadow-inner bg-slate-950 min-h-[260px] flex items-center justify-center">
              <div
                id={scannerContainerId}
                className="w-full h-full min-h-[260px]"
              />

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-950 text-white">
                  {isStartingCamera ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-2 border-unipaz-orange border-t-transparent animate-spin" />
                      <span className="text-xs font-bold text-slate-300">Conectando con la cámara...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span className="text-xs text-slate-400 font-medium">Cámara en espera</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs">
                {cameraError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {!isCameraActive ? (
                <button
                  onClick={() => startCamera(selectedCameraId)}
                  disabled={isStartingCamera}
                  className="w-full py-3.5 px-6 rounded-2xl bg-unipaz-navy dark:bg-unipaz-cobalt hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  {isStartingCamera ? 'Iniciando Cámara...' : 'Reintentar Encendido de Cámara'}
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                  >
                    Detener Cámara
                  </button>

                  <button
                    onClick={handleSwitchCamera}
                    className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    title="Alternar entre cámara trasera y frontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    Alternar Lente
                  </button>
                </>
              )}
            </div>
          </div>

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
                className="px-5 py-2.5 bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Procesar
              </button>
            </div>
          </form>

          {/* Quick Click Simulators */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
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
                    <div className="text-xs font-bold text-unipaz-navy dark:text-white group-hover:text-unipaz-orange truncate">
                      {std.nombre} {std.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {std.matricula}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Lista de Asistentes al Evento */}
        <div className="lg:col-span-5 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-unipaz-navy dark:text-white flex items-center gap-2">
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
                    <div className="font-bold text-unipaz-navy dark:text-white">
                      {att.student?.nombre} {att.student?.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
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
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-400/30">
                        +{att.horas_acreditadas} hrs
                      </span>
                    ) : att.status === 'registrado' && att.check_in_timestamp ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
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
