'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { AlertTriangle, Award, CheckCircle, Copy, Lock, QrCode, ShieldAlert, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface StudentQrCardProps {
  student: UserProfile;
  horasTotales?: number;
  escala?: string;
}

export const StudentQrCard: React.FC<StudentQrCardProps> = ({
  student,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState<string>('');

  const isInactive =
    student.activo === false ||
    student.estatus_inscripcion === 'baja_temporal' ||
    student.estatus_inscripcion === 'baja_definitiva';

  // Reloj de seguridad en vivo (Anti-Foto / Anti-Screenshot)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveSeconds(
        now.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isInactive) {
      setQrDataUrl('');
      return;
    }

    // Generamos un QR con los datos del estudiante y el secreto criptográfico
    const payload = JSON.stringify({
      id: student.id,
      matricula: student.matricula,
      nombre: `${student.nombre} ${student.apellidos}`,
      secret: student.qr_secret,
      unipaz: 'PFI-2026',
      ts: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#002855',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [student, isInactive]);

  const copyMatricula = () => {
    navigator.clipboard.writeText(student.matricula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCustomPhoto = student.avatar_url && student.avatar_url.trim() !== '' && !student.avatar_url.includes('logo-unipaz');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl text-white backdrop-blur-xl transition-all ${
        isInactive
          ? 'border-rose-500/40 bg-gradient-to-br from-[#200A0A] via-[#330000] to-[#0A0505]'
          : 'border-white/20 bg-gradient-to-br from-[#001833] via-[#002855] to-[#0A1526]'
      }`}
    >
      {/* Decorative Glows */}
      <div className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isInactive ? 'bg-rose-600/20' : 'bg-unipaz-orange/20'}`} />
      <div className={`absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isInactive ? 'bg-rose-900/30' : 'bg-unipaz-cobalt/30'}`} />

      {/* Header Oficial con el Logo Institucional UNIPAZ */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white p-1 shadow-md flex-shrink-0 flex items-center justify-center">
            <Image
              src="/logo-unipaz.png"
              alt="Logo UNIPAZ"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <h3 className="font-black tracking-wider text-xs uppercase text-white">
              UNIPAZ
            </h3>
            <p className="text-[10px] text-amber-300 font-bold tracking-wider uppercase">
              Credencial Digital Estudiantil
            </p>
          </div>
        </div>

        {isInactive ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/50 text-rose-300 text-[11px] font-black uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Inactiva / Baja
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Vigente · Oficial
          </div>
        )}
      </div>

      {/* Cuerpo: Foto/Logo + Datos + QR */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Info del Estudiante */}
        <div className="sm:col-span-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center ${
              hasCustomPhoto ? 'border-2 border-unipaz-orange bg-slate-800' : 'border-2 border-white/30 bg-white p-1.5'
            }`}>
              <Image
                src={hasCustomPhoto ? student.avatar_url! : '/logo-unipaz.png'}
                alt={student.nombre}
                fill
                className={hasCustomPhoto ? 'object-cover' : 'object-contain p-1'}
              />
            </div>
            <div>
              <h4 className="text-base font-black leading-tight text-white">
                {student.nombre} {student.apellidos}
              </h4>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                {student.carrera}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/10 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Matrícula:</span>
              <button
                onClick={copyMatricula}
                className="font-mono font-bold text-white hover:text-unipaz-orange flex items-center gap-1 transition-colors"
                title="Copiar Matrícula"
              >
                {student.matricula}
                {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Generación / Grado:</span>
              <span className="font-semibold text-slate-200">
                {student.cuatrimestre ? `${student.cuatrimestre}° Cuatrimestre` : student.periodo_ingreso}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Estatus Institucional:</span>
              <span className={`font-bold ${isInactive ? 'text-rose-400' : 'text-emerald-400'}`}>
                {student.estatus_inscripcion === 'baja_temporal'
                  ? 'Baja Temporal'
                  : student.estatus_inscripcion === 'baja_definitiva'
                  ? 'Baja Definitiva'
                  : 'Inscrito Regular'}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Interactivo con Sello Dinámico Anti-Foto */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-slate-900 shadow-inner relative min-h-[160px]">
          {isInactive ? (
            <div className="p-3 text-center space-y-1">
              <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
              <strong className="text-[11px] font-black text-rose-900 uppercase block leading-tight">
                Credencial Suspendida
              </strong>
              <p className="text-[10px] text-slate-600 leading-tight">
                Código QR inhabilitado por baja académica.
              </p>
            </div>
          ) : qrDataUrl ? (
            <>
              <div className="relative w-32 h-32">
                <Image
                  src={qrDataUrl}
                  alt="QR Estudiante"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Sello de Seguridad Dinámico Anti-Screenshot */}
              <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>EN VIVO: {liveSeconds}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                Sello Dinámico UNIPAZ
              </span>
            </>
          ) : (
            <div className="w-32 h-32 flex items-center justify-center text-slate-400 animate-pulse">
              <QrCode className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-amber-400" />
          Token: <code className="font-mono text-slate-300">{student.qr_secret ? `${student.qr_secret.substring(0, 12)}...` : 'N/A'}</code>
        </span>
        <span className={isInactive ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
          {isInactive ? 'Inhabilitado' : 'Válido Ciclo 2026'}
        </span>
      </div>
    </motion.div>
  );
};
