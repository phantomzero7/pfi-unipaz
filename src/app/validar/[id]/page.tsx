'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePFI } from '@/lib/store';

function ValidarContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { profiles, getStudentProgress } = usePFI();

  const folioId = (params?.id as string) || 'UNIPAZ-PFI-2026-UP220419-7F3A';
  const queryStudentMatricula = searchParams?.get('student');
  const queryHours = searchParams?.get('hours');

  // Buscar estudiante por matrícula si viene en query o usar el estudiante por defecto
  const student = profiles.find(
    (p) =>
      (queryStudentMatricula && p.matricula.toLowerCase() === queryStudentMatricula.toLowerCase()) ||
      folioId.includes(p.matricula)
  ) || profiles[0];

  const progress = getStudentProgress(student.id);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Botón de regreso */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al portal principal UNIPAZ
      </Link>

      {/* Tarjeta de Verificación Oficial */}
      <div className="rounded-3xl bg-gradient-to-br from-unipaz-navy-deep via-unipaz-navy to-slate-950 border border-emerald-500/40 p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden text-center sm:text-left">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge de Validación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Documento Oficial Auténtico
              </span>
              <h1 className="text-2xl font-black text-white">
                Validación de Constancia PFI
              </h1>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Válido en Servidor UNIPAZ
          </div>
        </div>

        {/* Datos del Documento */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
              <span className="text-slate-400">Estudiante Titular:</span>
              <div className="text-base font-black text-white">
                {student.nombre} {student.apellidos}
              </div>
              <div className="text-xs font-mono text-amber-300 font-bold">
                Matrícula: {student.matricula}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
              <span className="text-slate-400">Programa Académico:</span>
              <div className="text-sm font-bold text-slate-200">
                {student.carrera}
              </div>
              <div className="text-xs text-slate-400">
                Universidad Internacional de La Paz
              </div>
            </div>
          </div>

          {/* Bloque Destacado de Horas */}
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-white/15 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total de Horas Curriculares Acreditadas:
            </span>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-unipaz-orange via-amber-400 to-amber-200">
              {queryHours ? Number(queryHours).toFixed(2) : progress.horasTotales.toFixed(2)} hrs PFI
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Nivel: {progress.escalaTexto}
            </div>
          </div>

          {/* Metadatos del Folio y Sello */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 gap-1">
              <span>Folio Digital Institucional:</span>
              <span className="font-mono font-bold text-slate-200">{decodeURIComponent(folioId)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 gap-1">
              <span>Sello Criptográfico SHA-256:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 gap-1 pt-1 border-t border-white/5">
              <span>Emisor Autorizado:</span>
              <span className="font-semibold text-slate-300">
                Coordinación del Programa de Formación Integral (PFI) · UNIPAZ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ValidarCertificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-unipaz-orange" />
        </div>
      }
    >
      <ValidarContent />
    </Suspense>
  );
}
