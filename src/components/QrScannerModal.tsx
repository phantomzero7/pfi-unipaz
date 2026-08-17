'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  FlipHorizontal,
  LogIn,
  LogOut,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { PFIEvent, UserProfile } from '@/lib/types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  defaultEventId,
}) => {
  const { events, profiles, currentUser, canUserScanEvent, checkInStudent, checkOutStudent } = usePFI();

  const scannableEvents = events.filter((e) => canUserScanEvent(e.id, currentUser.id));

  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultEventId || (scannableEvents[0]?.id || events[0]?.id || '')
  );
  const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
  const [manualQuery, setManualQuery] = useState('');
  const [resultAlert, setResultAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  // Estados de Cámara Smartphone
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-modal-scanner-view';

  useEffect(() => {
    if (defaultEventId) {
      setSelectedEventId(defaultEventId);
    } else if (scannableEvents.length > 0 && !scannableEvents.some((e) => e.id === selectedEventId)) {
      setSelectedEventId(scannableEvents[0].id);
    }
  }, [defaultEventId, scannableEvents, selectedEventId]);

  // Cargar lista de cámaras disponibles (Smartphones tienen traseras y frontales)
  useEffect(() => {
    if (isOpen) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameraDevices(devices);
            // Preferir cámara trasera por defecto ("back", "rear", "environment")
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('rear') ||
                d.label.toLowerCase().includes('trasera') ||
                d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        })
        .catch((err) => {
          console.warn('No camera list retrieved:', err);
        });
    }
  }, [isOpen]);

  const startCamera = async (cameraIdToUse?: string) => {
    setCameraError(null);
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const qrCodeScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCodeScanner;

      const cameraConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: 'environment' };

      await qrCodeScanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Feedback táctil en smartphone (vibración)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([80, 40, 80]);
          }
          handleProcessCode(decodedText);
        },
        () => {
          // Frame scanner silencioso
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Por favor verifica que diste permisos de cámara en tu navegador o selecciona otra cámara.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setIsCameraActive(false);
  };

  const handleSwitchCamera = () => {
    if (cameraDevices.length <= 1) return;
    const currentIndex = cameraDevices.findIndex((d) => d.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    const nextCamera = cameraDevices[nextIndex];
    setSelectedCameraId(nextCamera.id);
    if (isCameraActive) {
      startCamera(nextCamera.id);
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleProcessCode = (code: string) => {
    if (!currentEvent) {
      setResultAlert({
        type: 'error',
        title: 'Error',
        message: 'Por favor selecciona un evento válido primero.',
      });
      return;
    }

    let parsedMatriculaOrId = code.trim();
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const json = JSON.parse(code);
        parsedMatriculaOrId = json.matricula || json.id || json.secret || parsedMatriculaOrId;
      }
    } catch (e) {
      // Normal string
    }

    if (mode === 'check_in') {
      const res = checkInStudent(currentEvent.id, parsedMatriculaOrId);
      if (res.success) {
        setResultAlert({
          type: 'success',
          title: '¡Check-In Exitoso!',
          message: res.message,
          details: `Estudiante: ${res.student?.nombre} ${res.student?.apellidos} (${res.student?.matricula}) · Rol: ${res.attendance?.rol_participacion === 'staff_logistica' ? 'Staff Logístico' : 'Oyente'}`,
        });
      } else {
        setResultAlert({
          type: res.fraudWarning ? 'warning' : 'error',
          title: res.fraudWarning ? 'Alerta de Seguridad QR' : 'Error en Check-In',
          message: res.message,
          details: res.fraudWarning,
        });
      }
    } else {
      const simulatedNow = new Date();
      const res = checkOutStudent(currentEvent.id, parsedMatriculaOrId, simulatedNow.toISOString());

      if (res.success) {
        setResultAlert({
          type: res.status === 'asistio' ? 'success' : 'warning',
          title: res.status === 'asistio' ? '¡Check-Out & Horas Acreditadas!' : 'Check-Out (Incompleto)',
          message: res.message,
          details: `Permanencia: ${res.stayMinutes || 0} min (${res.stayPercentage || 0}%) · Horas: +${res.hoursCredited || 0} hrs`,
        });
      } else {
        setResultAlert({
          type: 'error',
          title: 'Error en Check-Out',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 dark:text-white my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-unipaz-navy dark:bg-gradient-to-tr dark:from-unipaz-cobalt dark:to-unipaz-orange flex items-center justify-center shadow-md">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white flex items-center gap-2">
              Escáner QR Móvil UNIPAZ
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-unipaz-orange/15 text-unipaz-orange border border-unipaz-orange/30 font-bold">
                Regla 80%
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compatible con smartphones iOS y Android (cámara trasera y frontal)
            </p>
          </div>
        </div>

        {/* Evento y Modo */}
        <div className="mt-5 space-y-4">
          {/* Selector de Evento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Evento a Registrar:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-unipaz-orange"
            >
              {scannableEvents.length === 0 ? (
                <option value="">No tienes eventos activos con permiso de escaneo</option>
              ) : (
                scannableEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.titulo} ({evt.horas_pfi} hrs · {evt.fecha_evento})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Toggle de Modo: Check-In vs Check-Out */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setMode('check_in')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'check_in'
                  ? 'bg-white dark:bg-emerald-500 text-emerald-800 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
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
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LogOut className="w-4 h-4" />
              2. Salida (Check-Out)
            </button>
          </div>

          {/* Feedback Alert */}
          {resultAlert && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-fadeIn ${
                resultAlert.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : resultAlert.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {resultAlert.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="text-sm font-bold">{resultAlert.title}</h5>
                <p className="text-xs mt-0.5 opacity-90">{resultAlert.message}</p>
                {resultAlert.details && (
                  <p className="text-xs font-semibold mt-1 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-950/40 px-2 py-1 rounded-md inline-block">
                    {resultAlert.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cámara Smartphone y Viewfinder */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div
              id={scannerContainerId}
              className={`w-full max-w-xs mx-auto rounded-2xl overflow-hidden shadow-inner ${
                isCameraActive ? 'block min-h-[260px]' : 'hidden'
              }`}
            />

            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs">
                {cameraError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {!isCameraActive ? (
                <button
                  onClick={() => startCamera(selectedCameraId)}
                  className="w-full py-3 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 dark:bg-unipaz-cobalt text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Encender Cámara en Smartphone
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                  >
                    Detener Cámara
                  </button>

                  {cameraDevices.length > 1 && (
                    <button
                      onClick={handleSwitchCamera}
                      className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Cambiar entre cámara trasera y frontal"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      Alternar Lente
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Ingreso Manual de Matrícula */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              O validar estudiante por Matrícula / Código:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Ej. UP220419"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Validar
              </button>
            </div>
          </form>

          {/* Simulador Rápido de Estudiantes Muestra */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Simulación Rápida (1 Clic):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profiles
                .filter((p) => p.role === 'estudiante')
                .map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleProcessCode(student.matricula)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange/40 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-unipaz-navy dark:text-white group-hover:text-unipaz-orange truncate">
                      {student.nombre} {student.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {student.matricula}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
