'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AlertCircle, Camera, CheckCircle2, Clock, LogIn, LogOut, QrCode, Search, Sparkles, UserCheck, X } from 'lucide-react';
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
  const { events, profiles, checkInStudent, checkOutStudent, attendances } = usePFI();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultEventId || (events[0]?.id || '')
  );
  const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
  const [manualQuery, setManualQuery] = useState('');
  const [simulationStayMinutes, setSimulationStayMinutes] = useState<number>(240); // default 4 hrs
  const [resultAlert, setResultAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const [useCamera, setUseCamera] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (defaultEventId) {
      setSelectedEventId(defaultEventId);
    }
  }, [defaultEventId]);

  // Manejar escáner de cámara con html5-qrcode
  useEffect(() => {
    if (isOpen && useCamera) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-region',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          handleProcessCode(decodedText);
          scanner.clear();
          setUseCamera(false);
        },
        (error) => {
          // Ignorar errores de frame scanning
        }
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, useCamera]);

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
      // String regular
    }

    if (mode === 'check_in') {
      const res = checkInStudent(currentEvent.id, parsedMatriculaOrId);
      if (res.success) {
        setResultAlert({
          type: 'success',
          title: '¡Check-In Exitoso!',
          message: res.message,
          details: `Estudiante: ${res.student?.nombre} ${res.student?.apellidos} (${res.student?.matricula})`,
        });
      } else {
        setResultAlert({
          type: 'error',
          title: 'Error en Check-In',
          message: res.message,
        });
      }
    } else {
      // Check-Out con simulación de tiempo si es necesario
      const eventStart = new Date();
      // Si simulamos, simulamos que el check in ocurrió hace simulationStayMinutes minutos
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

  // Simular escaneo de un estudiante de prueba
  const handleQuickStudentSelect = (student: UserProfile) => {
    handleProcessCode(student.matricula);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
        {/* Close Button */}
        <button
          onClick={() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-unipaz-cobalt to-unipaz-orange flex items-center justify-center shadow-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Escáner de Asistencias QR
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-unipaz-orange/20 text-unipaz-orange border border-unipaz-orange/30 font-bold">
                Regla 80%
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Validación en tiempo real para Staff y Coordinación PFI UNIPAZ
            </p>
          </div>
        </div>

        {/* Evento y Modo */}
        <div className="mt-5 space-y-4">
          {/* Selector de Evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Evento a Registrar:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-unipaz-orange"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.titulo} ({evt.horas_pfi} hrs · {evt.fecha_evento})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle de Modo: Check-In vs Check-Out */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-white/10">
            <button
              onClick={() => setMode('check_in')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'check_in'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              1. Entrada (Check-In)
            </button>
            <button
              onClick={() => setMode('check_out')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'check_out'
                  ? 'bg-unipaz-orange text-slate-950 shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                  : resultAlert.type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
              }`}
            >
              {resultAlert.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="text-sm font-bold">{resultAlert.title}</h5>
                <p className="text-xs mt-0.5 opacity-90">{resultAlert.message}</p>
                {resultAlert.details && (
                  <p className="text-xs font-semibold mt-1 text-white bg-slate-950/40 px-2 py-1 rounded-md inline-block">
                    {resultAlert.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scanner de Cámara */}
          {useCamera ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
              <div id="qr-reader-region" className="w-full max-w-xs text-slate-900 rounded-xl overflow-hidden" />
              <button
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setUseCamera(false);
                }}
                className="mt-3 text-xs text-slate-400 hover:text-white font-medium"
              >
                Cerrar Cámara
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setUseCamera(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-unipaz-cobalt to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Camera className="w-4 h-4" />
                Activar Cámara para Escanear QR
              </button>
            </div>
          )}

          {/* Ingreso Manual de Matrícula */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              O ingresar Matrícula / Código de estudiante manualmente:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Ej. UP220419 o UP210382"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-unipaz-orange"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
              >
                Validar
              </button>
            </div>
          </form>

          {/* Simulador Rápido de Estudiantes Muestra */}
          <div className="pt-3 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Prueba Rápida con Estudiantes Muestra:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profiles
                .filter((p) => p.role === 'estudiante')
                .map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleQuickStudentSelect(student)}
                    className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-white/10 hover:border-unipaz-orange/40 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-unipaz-orange truncate">
                      {student.nombre} {student.apellidos}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
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
