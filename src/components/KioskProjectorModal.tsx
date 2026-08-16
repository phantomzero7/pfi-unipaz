'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Calendar, Clock, MapPin, Maximize2, Minimize2, QrCode, Sparkles, Users, X } from 'lucide-react';
import { PFIEvent } from '@/lib/types';

interface KioskProjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PFIEvent;
}

export const KioskProjectorModal: React.FC<KioskProjectorModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [liveTime, setLiveTime] = useState<string>('');
  const [counter, setCounter] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    return () => clearInterval(clockInterval);
  }, [isOpen]);

  // Generador de QR dinámico que rota cada 15 segundos
  useEffect(() => {
    if (!isOpen) return;

    const generateDynamicQR = () => {
      const payload = JSON.stringify({
        event_id: event.id,
        titulo: event.titulo,
        timestamp: Date.now(),
        unipaz: 'KIOSK-AUDITORIO-2026',
      });

      QRCode.toDataURL(payload, {
        width: 450,
        margin: 1.5,
        color: {
          dark: '#001833',
          light: '#FFFFFF',
        },
      }).then(setQrUrl);
      setCounter(15);
    };

    generateDynamicQR();
    const rotInterval = setInterval(generateDynamicQR, 15000);
    const counterInterval = setInterval(() => {
      setCounter((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);

    return () => {
      clearInterval(rotInterval);
      clearInterval(counterInterval);
    };
  }, [isOpen, event]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#001428] text-white animate-fadeIn overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-white p-1 shadow-md">
            <Image src="/logo-unipaz.png" alt="UNIPAZ" fill className="object-contain" />
          </div>
          <div>
            <h2 className="font-black text-base tracking-tight text-white uppercase">
              Universidad Internacional de La Paz · Modo Kiosco
            </h2>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              Control de Asistencia Digital en Vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-xl font-black text-unipaz-orange">{liveTime}</div>
            <div className="text-[10px] text-slate-400 font-mono">Hora Oficial B.C.S.</div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body: Event Info + Giant Dynamic QR */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 sm:p-16 gap-12 max-w-7xl mx-auto w-full">
        {/* Info Column */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unipaz-orange/20 border border-unipaz-orange/40 text-unipaz-orange font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            {event.categoria} · {event.modalidad.toUpperCase()}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            {event.titulo}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {event.descripcion}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Calendar className="w-5 h-5 text-unipaz-orange" />
              <span>{event.fecha_evento}</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{event.hora_inicio} - {event.hora_fin} hrs</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 sm:col-span-2">
              <MapPin className="w-5 h-5 text-unipaz-cobalt" />
              <span>{event.ubicacion || 'Campus UNIPAZ'}</span>
            </div>
          </div>
        </div>

        {/* Giant Dynamic QR Card */}
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border-4 border-unipaz-orange relative">
          <span className="text-xs font-black uppercase tracking-wider text-unipaz-navy mb-3">
            Escanea con la cámara de tu smartphone
          </span>

          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            {qrUrl ? (
              <Image src={qrUrl} alt="QR Kiosco" fill className="object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-pulse">
                <QrCode className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Código de seguridad rotativo: {counter}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
