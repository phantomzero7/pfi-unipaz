'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CertificatePdfModal } from '@/components/CertificatePdfModal';
import { WorkshopCertificatePdfModal } from '@/components/WorkshopCertificatePdfModal';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent } from '@/lib/types';

export default function ConstanciasEstudiantePage() {
  const { currentUser, getStudentProgress, getStudentAttendances, events } = usePFI();
  const [showGeneralCertModal, setShowGeneralCertModal] = useState(false);
  const [selectedWorkshopCert, setSelectedWorkshopCert] = useState<{
    event: PFIEvent;
    attendance: EventAttendance;
  } | null>(null);

  const progress = getStudentProgress();
  const attendances = getStudentAttendances().filter((a) => a.status === 'asistio');
  const canGenerateCertificate = progress.horasTotales >= 400;
  const missingHours = Math.max(0, 400 - progress.horasTotales);
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
            Documentación y Titulación UNIPAZ
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
          Constancia Oficial y Certificados PFI
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Descarga tu constancia general de acreditación de titulación (a partir de 400h) y las constancias individuales en PDF de cada taller y actividad que hayas acreditado.
        </p>
      </div>

      {/* Alerta si NO cumple las 400 horas mínimas para la constancia general */}
      {!canGenerateCertificate && (
        <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 p-6 shadow-sm space-y-4 text-slate-800 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-amber-950 dark:text-amber-200">
                Constancia General de Titulación Bloqueada (&lt; 400 hrs)
              </h4>
              <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-300/90">
                De acuerdo con el Reglamento de Titulación de UNIPAZ, se requiere acumular un mínimo de <strong>400.00 horas acreditadas</strong> para la emisión de la Constancia General. Actualmente cuentas con <strong>{progress.horasTotales.toFixed(2)} horas</strong> (te faltan <strong>{missingHours.toFixed(2)} horas</strong>).
              </p>
            </div>
          </div>

          {/* Barra de Progreso hacia 400 hrs */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-900 dark:text-amber-300">Avance para Constancia General:</span>
              <span className="font-mono text-amber-950 dark:text-amber-200">
                {progress.horasTotales.toFixed(1)} / 400.0 hrs ({Math.min(100, Math.round((progress.horasTotales / 400) * 100))}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-amber-200 dark:bg-amber-900/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-unipaz-orange transition-all duration-500"
                style={{ width: `${Math.min(100, (progress.horasTotales / 400) * 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/estudiante/eventos"
              className="py-2.5 px-5 rounded-full bg-unipaz-orange text-white text-xs font-bold flex items-center gap-1.5 hover:bg-orange-600 transition-all shadow-sm"
            >
              Inscribirme a actividades para sumar horas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Certificate Card Preview */}
      <div className="rounded-3xl bg-gradient-to-br from-[#001833] via-[#002855] to-[#001226] border border-slate-700/60 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-slate-950 shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Constancia General de Formación Integral (Titulación)
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Folio Único Institucional · Validez Oficial para Titulación
              </p>
            </div>
          </div>

          {canGenerateCertificate ? (
            <button
              onClick={() => setShowGeneralCertModal(true)}
              className="py-3.5 px-6 rounded-full bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Generar y Descargar PDF Oficial
            </button>
          ) : (
            <div className="py-3 px-5 rounded-full bg-slate-800/90 border border-white/10 text-slate-400 font-bold text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Bloqueado (Requiere ≥ 400.00 hrs)
            </div>
          )}
        </div>

        {/* Resumen del Certificado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium">Estudiante Titular:</span>
            <div className="font-black text-white text-sm truncate">
              {currentUser.nombre} {currentUser.apellidos}
            </div>
            <div className="font-mono text-slate-300 font-bold">{currentUser.matricula}</div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium">Total Horas Acreditadas:</span>
            <div className="font-black text-emerald-400 text-base">
              {progress.horasTotales.toFixed(2)} hrs
            </div>
            <div className="text-slate-400 text-[11px]">
              {canGenerateCertificate ? '✓ Requisito cumplido' : `Faltan ${missingHours.toFixed(1)} hrs`}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium">Escala de Evaluación:</span>
            <div className="font-black text-amber-300 text-sm">
              {progress.escala}
            </div>
            <div className="text-slate-400 text-[11px] truncate">
              {progress.escalaTexto}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium">Autenticación Digital:</span>
            <div className="font-bold text-blue-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Sello Criptográfico
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Código QR Institucional
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Talleres y Actividades Acreditadas con Descarga Individual */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
            Constancias Individuales por Taller y Actividad Acreditada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Descarga la constancia individual con valor curricular y sello digital de cada taller completado:
          </p>
        </div>

        {attendances.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
            No tienes actividades acreditadas todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3">Actividad / Taller</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3 text-right">Horas</th>
                  <th className="py-3 px-3 text-right">Constancia Individual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {attendances.map((att) => {
                  const ev = att.event || eventsMap.get(att.event_id);
                  if (!ev) return null;

                  return (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-black text-unipaz-navy dark:text-white">
                        {ev.titulo}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-bold">
                          {ev.categoria}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-medium">
                        {att.check_in_timestamp ? new Date(att.check_in_timestamp).toLocaleDateString() : ev.fecha_evento}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{att.horas_acreditadas.toFixed(2)} hrs
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedWorkshopCert({ event: ev, attendance: att })}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-unipaz-orange hover:text-white dark:hover:bg-unipaz-orange text-unipaz-navy dark:text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-white/10 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal del Certificado General */}
      {showGeneralCertModal && canGenerateCertificate && (
        <CertificatePdfModal
          student={currentUser}
          progress={progress}
          isOpen={showGeneralCertModal}
          onClose={() => setShowGeneralCertModal(false)}
        />
      )}

      {/* Modal del Certificado Individual de Taller */}
      {selectedWorkshopCert && (
        <WorkshopCertificatePdfModal
          student={currentUser}
          event={selectedWorkshopCert.event}
          attendance={selectedWorkshopCert.attendance}
          isOpen={Boolean(selectedWorkshopCert)}
          onClose={() => setSelectedWorkshopCert(null)}
        />
      )}
    </div>
  );
}
