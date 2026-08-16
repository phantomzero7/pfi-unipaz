'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileCheck,
  FileText,
  Info,
  Layers,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { CertificatePdfModal } from '@/components/CertificatePdfModal';
import { StudentQrCard } from '@/components/StudentQrCard';
import { WorkshopCertificatePdfModal } from '@/components/WorkshopCertificatePdfModal';
import { getAttendanceStatusInfo } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { EventAttendance } from '@/lib/types';

export default function EstudianteDashboard() {
  const { currentUser, getStudentProgress, getStudentAttendances, events } = usePFI();
  const progress = getStudentProgress();
  const attendances = getStudentAttendances();

  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedWorkshopAtt, setSelectedWorkshopAtt] = useState<EventAttendance | null>(null);
  const [activeTab, setActiveTab] = useState<'realizados' | 'no_realizados' | 'programados'>('realizados');

  // Clasificar asistencias
  const classifiedAttendances = attendances.map((att) => ({
    ...att,
    info: getAttendanceStatusInfo(att, att.event),
  }));

  const realizados = classifiedAttendances.filter((a) => a.info.isRealizado);
  const noRealizados = classifiedAttendances.filter((a) => a.info.isNoRealizado);
  const programados = classifiedAttendances.filter((a) => a.info.isProgramado);

  const canDownloadGeneralCert = progress.horasTotales >= 400;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Institucional */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-unipaz-orange/80 shadow-md flex-shrink-0">
              <Image
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.nombre}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-unipaz-orange">
                  Expediente Estudiantil PFI
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {currentUser.matricula}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
                {currentUser.nombre} {currentUser.apellidos}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                {currentUser.carrera} · Generación {currentUser.periodo_ingreso}
              </p>
            </div>
          </div>

          {/* Botón de Constancia Oficial */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {canDownloadGeneralCert ? (
              <button
                onClick={() => setShowCertModal(true)}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Descargar Constancia Oficial PFI
              </button>
            ) : (
              <button
                onClick={() => setShowCertModal(true)}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition-all"
              >
                <Lock className="w-4 h-4 text-amber-500" />
                Constancia PFI ({progress.horasTotales.toFixed(0)}/400 hrs)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Horas Totales */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Horas Acreditadas:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-unipaz-navy dark:text-white font-mono">
              {progress.horasTotales.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ 400.00 hrs</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress.horasTotales >= 730
                  ? 'bg-amber-500'
                  : progress.horasTotales >= 400
                  ? 'bg-emerald-500'
                  : 'bg-unipaz-orange'
              }`}
              style={{ width: `${progress.porcentajeMeta}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-unipaz-orange dark:text-amber-300">
            {progress.escalaTexto}
          </p>
        </div>

        {/* 3 Talleres Extracurriculares */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">3 Talleres Extracurriculares:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-unipaz-navy dark:text-white">
              {progress.talleresExtracurriculares.completados}/3
            </span>
            <span className="text-xs text-slate-500 font-bold">({progress.talleresExtracurriculares.horas.toFixed(1)}/50h)</span>
          </div>
          <div className={`text-xs font-black flex items-center gap-1 ${progress.talleresExtracurriculares.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {progress.talleresExtracurriculares.cumplido ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Requisito Cumplido
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" /> {3 - progress.talleresExtracurriculares.completados} restantes
              </>
            )}
          </div>
        </div>

        {/* 1 Taller Liderazgo */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Taller Liderazgo Social:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-unipaz-navy dark:text-white">
              {progress.tallerLiderazgo.completados}/1
            </span>
            <span className="text-xs text-slate-500 font-bold">({progress.tallerLiderazgo.horas.toFixed(1)}/10h)</span>
          </div>
          <div className={`text-xs font-black flex items-center gap-1 ${progress.tallerLiderazgo.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {progress.tallerLiderazgo.cumplido ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Requisito Cumplido
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" /> 1 pendiente
              </>
            )}
          </div>
        </div>

        {/* Plan de Vida y Carrera */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Plan de Vida y Carrera (PVC):</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-unipaz-navy dark:text-white">
              {progress.pvc.horas.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ 75.00 hrs</span>
          </div>
          <div className={`text-xs font-black flex items-center gap-1 ${progress.pvc.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
            {progress.pvc.cumplido ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> PVC I, II, III Acreditados
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" /> En Progreso Anual
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN CENTRAL: PESTAÑAS DE EVENTOS REALIZADOS vs NO REALIZADOS vs PROGRAMADOS */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight">
              Historial de Actividades y Talleres
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consulta tus horas generadas, actividades completadas y eventos donde no se registró salida (Check-Out).
            </p>
          </div>

          {/* Segmented Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('realizados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'realizados'
                  ? 'bg-white dark:bg-emerald-500 text-emerald-800 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Realizados ({realizados.length})
            </button>

            <button
              onClick={() => setActiveTab('no_realizados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'no_realizados'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              No Realizados ({noRealizados.length})
            </button>

            <button
              onClick={() => setActiveTab('programados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'programados'
                  ? 'bg-unipaz-navy dark:bg-unipaz-cobalt text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Programados ({programados.length})
            </button>
          </div>
        </div>

        {/* TAB 1: EVENTOS REALIZADOS (ACREDITADOS) */}
        {activeTab === 'realizados' && (
          <div className="space-y-3">
            {realizados.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Aún no tienes actividades acreditadas. Inscríbete a los talleres del catálogo y realiza tu Check-In y Check-Out.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {realizados.map((att) => (
                  <div
                    key={att.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {att.event?.categoria || 'Actividad PFI'}
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                          +{att.horas_acreditadas.toFixed(2)} hrs
                        </span>
                      </div>

                      <h3 className="font-black text-unipaz-navy dark:text-white text-sm mt-2">
                        {att.event?.titulo || 'Actividad Formativa'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-unipaz-cobalt" />
                        {att.event?.fecha_evento} · {att.event?.modalidad}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acreditada
                      </span>

                      {att.event && (
                        <button
                          onClick={() => setSelectedWorkshopAtt(att)}
                          className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          Constancia PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVENTOS NO REALIZADOS (SIN CHECK-OUT / INCOMPLETOS) */}
        {activeTab === 'no_realizados' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">¿Por qué aparecen como No Realizadas estas actividades?</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">
                  Para acreditar horas oficiales, el reglamento PFI de UNIPAZ exige realizar tanto el <strong>Check-In</strong> como el <strong>Check-Out</strong> (mínimo 80% de permanencia). Si no realizaste tu Check-Out o tuviste un inconveniente justificado, acude a la Coordinación PFI para su validación manual.
                </p>
              </div>
            </div>

            {noRealizados.length === 0 ? (
              <div className="py-12 text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ ¡Excelente! No tienes actividades pendientes de Check-Out ni canceladas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {noRealizados.map((att) => (
                  <div
                    key={att.id}
                    className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-[10px] font-bold text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-400/30">
                          {att.info.statusLabel}
                        </span>
                        <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                          0.00 hrs
                        </span>
                      </div>

                      <h3 className="font-black text-unipaz-navy dark:text-white text-sm mt-2">
                        {att.event?.titulo || 'Actividad Formativa'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Fecha del evento: {att.event?.fecha_evento}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-500/20 text-[11px] text-slate-600 dark:text-slate-300">
                      <p className="font-bold text-rose-700 dark:text-rose-300">Motivo de no acreditación:</p>
                      <p className="mt-0.5 leading-tight">{att.info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EVENTOS PROGRAMADOS */}
        {activeTab === 'programados' && (
          <div className="space-y-3">
            {programados.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No tienes actividades programadas actualmente. Consulta el{' '}
                <Link href="/estudiante/eventos" className="text-unipaz-orange font-bold hover:underline">
                  Catálogo de Actividades
                </Link>{' '}
                para inscribirte.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programados.map((att) => (
                  <div
                    key={att.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-400/30">
                        Inscrito / Por Asistir
                      </span>
                      <span className="text-xs font-mono font-bold text-unipaz-orange">
                        +{att.event?.horas_pfi.toFixed(2)}h al acreditar
                      </span>
                    </div>

                    <h3 className="font-black text-unipaz-navy dark:text-white text-sm">
                      {att.event?.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-unipaz-cobalt" />
                      {att.event?.fecha_evento} · {att.event?.hora_inicio} a {att.event?.hora_fin}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Constancia General */}
      {showCertModal && (
        <CertificatePdfModal
          student={currentUser}
          progress={progress}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}

      {/* Modal Constancia Individual de Taller */}
      {selectedWorkshopAtt && selectedWorkshopAtt.event && (
        <WorkshopCertificatePdfModal
          student={currentUser}
          attendance={selectedWorkshopAtt}
          event={selectedWorkshopAtt.event}
          isOpen={!!selectedWorkshopAtt}
          onClose={() => setSelectedWorkshopAtt(null)}
        />
      )}
    </div>
  );
}
