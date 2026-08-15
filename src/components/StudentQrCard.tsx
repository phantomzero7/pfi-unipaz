'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Copy, QrCode, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface StudentQrCardProps {
  student: UserProfile;
  horasTotales?: number;
  escala?: string;
}

export const StudentQrCard: React.FC<StudentQrCardProps> = ({
  student,
  horasTotales = 0,
  escala = 'En Proceso',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generamos un QR con el código secreto o matrícula del estudiante
    const payload = JSON.stringify({
      id: student.id,
      matricula: student.matricula,
      nombre: `${student.nombre} ${student.apellidos}`,
      secret: student.qr_secret,
      unipaz: 'PFI-2026',
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
  }, [student]);

  const copyMatricula = () => {
    navigator.clipboard.writeText(student.matricula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-unipaz-navy-deep via-unipaz-navy to-slate-950 p-6 shadow-2xl text-white backdrop-blur-xl"
    >
      {/* Decorative Glows */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-unipaz-orange/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-unipaz-cobalt/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Institucional de la Credencial */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-unipaz-orange to-amber-400 flex items-center justify-center font-black text-slate-950 shadow-md">
            U
          </div>
          <div>
            <h3 className="font-extrabold tracking-wider text-xs uppercase text-slate-200">
              UNIPAZ
            </h3>
            <p className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase">
              Credencial Digital PFI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Oficial
        </div>
      </div>

      {/* Cuerpo: Foto + Datos + QR */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Info del Estudiante */}
        <div className="sm:col-span-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-unipaz-orange shadow-lg flex-shrink-0">
              <Image
                src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={student.nombre}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-base font-bold leading-tight text-white">
                {student.nombre} {student.apellidos}
              </h4>
              <p className="text-xs text-amber-200/90 font-medium">
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
              <span className="text-slate-400">Generación:</span>
              <span className="font-semibold text-slate-200">{student.periodo_ingreso}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Horas PFI:</span>
              <span className="font-bold text-unipaz-orange">{horasTotales.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        {/* QR Code Interactivo */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-slate-900 shadow-inner">
          {qrDataUrl ? (
            <div className="relative w-32 h-32">
              <Image
                src={qrDataUrl}
                alt="QR Estudiante"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 flex items-center justify-center text-slate-400 animate-pulse">
              <QrCode className="w-8 h-8" />
            </div>
          )}
          <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase mt-1">
            Escanear para Check-In
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span>ID: <code className="font-mono text-slate-300">{student.id}</code></span>
        <span className="text-amber-400/90 font-medium">Válido Ciclo 2026-2</span>
      </div>
    </motion.div>
  );
};
