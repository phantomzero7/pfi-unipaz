'use client';

import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CertificatePdfModal } from '@/components/CertificatePdfModal';
import { usePFI } from '@/lib/store';

export default function ConstanciasEstudiantePage() {
  const { currentUser, getStudentProgress, getStudentAttendances } = usePFI();
  const [showCertModal, setShowCertModal] = useState(false);

  const progress = getStudentProgress();
  const attendances = getStudentAttendances().filter((a) => a.status === 'asistio');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Documentación y Titulación UNIPAZ
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
          Constancia Oficial y Certificados PFI
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          Descarga tu constancia oficial de acreditación del Programa de Formación Integral con Sello Digital Criptográfico y código QR de validación institucional.
        </p>
      </div>

      {/* Main Certificate Card Preview */}
      <div className="rounded-3xl bg-gradient-to-br from-unipaz-navy-deep via-unipaz-navy to-slate-950 border border-white/15 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-slate-950 shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Constancia General de Formación Integral
              </h3>
              <p className="text-xs text-amber-300">
                Folio Único Institucional · Validez Oficial para Titulación
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCertModal(true)}
            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Generar y Descargar PDF Oficial
          </button>
        </div>

        {/* Resumen del Certificado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Estudiante Titular:</span>
            <div className="font-bold text-white text-sm truncate">
              {currentUser.nombre} {currentUser.apellidos}
            </div>
            <div className="font-mono text-slate-300">{currentUser.matricula}</div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Total Horas Acreditadas:</span>
            <div className="font-extrabold text-emerald-400 text-base">
              {progress.horasTotales.toFixed(2)} hrs
            </div>
            <div className="text-slate-400 text-[11px]">
              {progress.isAcreditado ? '✓ Cumple mínimo' : 'En proceso'}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Escala de Evaluación:</span>
            <div className="font-bold text-amber-300 text-sm">
              {progress.escala}
            </div>
            <div className="text-slate-400 text-[11px] truncate">
              {progress.escalaTexto}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Autenticación Digital:</span>
            <div className="font-bold text-blue-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Sello Criptográfico
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Código QR de Verificación
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Actividades Acreditadas */}
      <section className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white">
          Desglose de Actividades Oficialmente Validadas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-3">Actividad</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Fecha de Acreditación</th>
                <th className="py-3 px-3 text-right">Horas Otorgadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendances.map((att) => (
                <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    {att.event?.titulo || 'Actividad Formativa'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10 text-[11px]">
                      {att.event?.categoria || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {att.check_in_timestamp ? new Date(att.check_in_timestamp).toLocaleDateString() : 'Acreditado'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    +{att.horas_acreditadas.toFixed(2)} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal del Certificado */}
      {showCertModal && (
        <CertificatePdfModal
          student={currentUser}
          progress={progress}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
