'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
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
  Star,
  Trophy,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { AttendanceJustificationModal } from '@/components/AttendanceJustificationModal';
import { BecarioReportModal } from '@/components/BecarioReportModal';
import { CertificatePdfModal } from '@/components/CertificatePdfModal';
import { EventFeedbackModal } from '@/components/EventFeedbackModal';
import { OfficialClearanceDictamenModal } from '@/components/OfficialClearanceDictamenModal';
import { PrintableIdCardModal } from '@/components/PrintableIdCardModal';
import { QrScannerModal } from '@/components/QrScannerModal';
import { ScholarshipApplicationModal } from '@/components/ScholarshipApplicationModal';
import { ScholarshipProgressWidget } from '@/components/ScholarshipProgressWidget';
import { SocioeconomicStudyModal } from '@/components/SocioeconomicStudyModal';
import { StudentBadgesShowcase } from '@/components/StudentBadgesShowcase';
import { StudentQrCard } from '@/components/StudentQrCard';
import { WorkshopCertificatePdfModal } from '@/components/WorkshopCertificatePdfModal';
import { getActiveStaffEventsForStudent, getAttendanceStatusInfo } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent } from '@/lib/types';

export default function EstudianteDashboard() {
  const {
    currentUser,
    getStudentProgress,
    getStudentScholarshipProgress,
    getStudentAttendances,
    events,
    attendances,
    feedbacks,
    pfiConfig,
  } = usePFI();

  const progress = getStudentProgress();
  const scholarshipProgress = getStudentScholarshipProgress();
  const studentAttendances = getStudentAttendances();

  const [showCertModal, setShowCertModal] = useState(false);
  const [showDictamenModal, setShowDictamenModal] = useState(false);
  const [showPrintableCardModal, setShowPrintableCardModal] = useState(false);
  const [showScholarshipAppModal, setShowScholarshipAppModal] = useState(false);
  const [showBecarioReportModal, setShowBecarioReportModal] = useState(false);
  const [showSocioeconomicModal, setShowSocioeconomicModal] = useState(false);
  const [showStaffScannerModal, setShowStaffScannerModal] = useState(false);

  const [selectedWorkshopAtt, setSelectedWorkshopAtt] = useState<EventAttendance | null>(null);
  const [selectedJustificationAtt, setSelectedJustificationAtt] = useState<EventAttendance | null>(null);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState<PFIEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'realizados' | 'no_realizados' | 'programados'>('realizados');

  // Determinar si es staff temporal activo para un evento hoy
  const activeStaffEvents = getActiveStaffEventsForStudent(currentUser.id, events, attendances);
  const isTemporaryStaffActive = activeStaffEvents.length > 0;

  // Clasificar asistencias
  const classifiedAttendances = studentAttendances.map((att) => ({
    ...att,
    info: getAttendanceStatusInfo(att, att.event),
  }));

  const realizados = classifiedAttendances.filter((a) => a.info.isRealizado);
  const noRealizados = classifiedAttendances.filter((a) => a.info.isNoRealizado);
  const programados = classifiedAttendances.filter((a) => a.info.isProgramado);

  const canDownloadGeneralCert = progress.horasTotales >= 400;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER 1: STAFF LOGÍSTICO TEMPORAL ACTIVO (Permiso de Escáner con Cámara) */}
      {isTemporaryStaffActive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/40 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Camera className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                Rol Temporal de Staff Logístico Asignado
              </span>
              <h3 className="text-sm sm:text-base font-black">
                Pase de Lista Activo: {activeStaffEvents.map((e) => e.titulo).join(', ')}
              </h3>
              <p className="text-xs text-purple-200/80">
                Tu permiso de escáner por cámara está habilitado durante este evento para registrar el Check-In y Check-Out de los asistentes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStaffScannerModal(true)}
            className="py-2.5 px-5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 flex-shrink-0"
          >
            <Camera className="w-4 h-4 text-purple-700" />
            Abrir Escáner de Asistencias
          </button>
        </div>
      )}

      {/* BANNER 2: CONVOCATORIA DE BECAS ABIERTA (Solo si el periodo está activo) */}
      {pfiConfig.periodo_solicitud_becas_activo && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 border border-amber-300 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-unipaz-orange">
                Convocatoria Institucional de Becas y Estímulos
              </span>
              <h4 className="text-xs sm:text-sm font-black text-unipaz-navy dark:text-white">
                Periodo de Solicitud de Beca Abierto (Vigencia hasta el {pfiConfig.fecha_fin_solicitud_becas || '25 de Septiembre'})
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Excelencia Académica (≥9.0), Convenios, Familiares, Deportivas, Inclusión y Apoyo Socioeconómico.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowScholarshipAppModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Postular a Beca
            </button>
          </div>
        </div>
      )}

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
                {currentUser.carrera} · {currentUser.cuatrimestre ? `${currentUser.cuatrimestre}° Cuatrimestre` : currentUser.periodo_ingreso}
              </p>
            </div>
          </div>

          {/* Botones de Acción Documental, Formularios y Titulación */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón Llenar Informe de Becario (Cuando está habilitado) */}
            {currentUser.tiene_beca && pfiConfig.informe_becario_habilitado && (
              <button
                onClick={() => setShowBecarioReportModal(true)}
                className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                title="Llenar Informe Cuatrimestral de Becario"
              >
                <FileText className="w-4 h-4" />
                Informe Becario
              </button>
            )}

            {/* Botón Estudio Socioeconómico (Solo para Beca Nueva o Reincorporación por pérdida de beca) */}
            {pfiConfig.estudio_socioeconomico_habilitado && !currentUser.tiene_beca && (
              <button
                onClick={() => setShowSocioeconomicModal(true)}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Llenar Cédula de Estudio Socioeconómico (Para Beca Nueva o Reincorporación)"
              >
                <FileCheck className="w-4 h-4 text-unipaz-orange" />
                Estudio Socioeconómico
              </button>
            )}

            {canDownloadGeneralCert && (
              <button
                onClick={() => setShowDictamenModal(true)}
                className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105"
                title="Dictamen Oficial de Acreditación Total del PFI"
              >
                <ShieldCheck className="w-4 h-4" />
                Dictamen PFI
              </button>
            )}

            <button
              onClick={() => setShowPrintableCardModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Imprimir Carnet Físico PVC CR-80"
            >
              <CreditCard className="w-4 h-4 text-unipaz-orange" />
              Carnet PVC
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE EVENTOS PENDIENTES DE EVALUACIÓN */}
      {(() => {
        const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));
        const accredited = studentAttendances.filter((a) => a.status === 'asistio');
        const pending = accredited
          .filter((a) => !feedbacks.some((f) => f.event_id === a.event_id && f.student_id === currentUser.id))
          .map((a) => ({
            attendance: a,
            event: eventsMap.get(a.event_id),
          }))
          .filter((item): item is { attendance: EventAttendance; event: PFIEvent } => Boolean(item.event));

        if (pending.length === 0) return null;

        return (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900/80 border border-amber-300 dark:border-amber-500/30 shadow-md space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20">
                  <Star className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200">
                      Encuestas de Calidad
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      {pending.length} Pendiente{pending.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-unipaz-navy dark:text-white mt-0.5">
                    Actividades Pendientes de Evaluación
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
                Tu opinión es confidencial y ayuda a evaluar a los instructores y la calidad de los talleres universitarios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pending.map(({ attendance, event }) => (
                <div
                  key={attendance.id}
                  className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-white/10 flex flex-col justify-between space-y-3 shadow-sm hover:border-amber-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-amber-900 dark:text-amber-300">{event.categoria}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{attendance.horas_acreditadas || event.horas_pfi} hrs ✓
                      </span>
                    </div>
                    <h4 className="font-black text-xs text-unipaz-navy dark:text-white mt-1.5 leading-snug">
                      {event.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {event.fecha_evento} · {event.ubicacion || 'Campus UNIPAZ'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFeedbackEvent(event);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-105"
                  >
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    Evaluar Actividad
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* WIDGET DE GESTIÓN Y CONTROL DE BECA (Solo visible si el alumno cuenta con beca) */}
      {currentUser.tiene_beca && (
        <ScholarshipProgressWidget
          student={currentUser}
          scholarshipProgress={scholarshipProgress}
        />
      )}

      {/* Grid: Credencial QR + Avance Global */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 xl:col-span-5">
          <StudentQrCard
            student={currentUser}
            horasTotales={progress.horasTotales}
            escala={progress.escala}
          />
        </div>

        {/* Resumen Cuantitativo de Horas */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Avance Total Acreditado</span>
                <div className="text-3xl font-black text-unipaz-navy dark:text-white font-mono mt-0.5">
                  +{progress.horasTotales.toFixed(2)}{' '}
                  <span className="text-base font-sans font-bold text-slate-400">/ 400.00 hrs</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  progress.isAcreditado
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300'
                }`}>
                  {progress.escala}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                  Sobresaliente: {progress.porcentajeSobresaliente}% (Meta 730h)
                </span>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-unipaz-cobalt via-unipaz-orange to-amber-400 transition-all duration-700"
                  style={{ width: `${progress.porcentajeMeta}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0.00 hrs</span>
                <span>{progress.porcentajeMeta}% para Titulación</span>
                <span>400.00 hrs</span>
              </div>
            </div>

            {/* Requisitos Obligatorios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Plan de Vida y Carrera</div>
                <div className="font-bold text-slate-800 dark:text-white mt-0.5">
                  {progress.pvc.cumplido ? 'PVC I, II, III ✓' : `${progress.pvc.horas.toFixed(0)}/75 hrs`}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Talleres Extracurriculares</div>
                <div className="font-bold text-slate-800 dark:text-white mt-0.5">
                  {progress.talleresExtracurriculares.completados}/3 Talleres ({progress.talleresExtracurriculares.horas.toFixed(0)}h)
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Taller de Liderazgo</div>
                <div className="font-bold text-slate-800 dark:text-white mt-0.5">
                  {progress.tallerLiderazgo.cumplido ? 'Acreditado (10h) ✓' : 'Pendiente (0/10h)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDALLAS E INSIGNIAS FORMATIVAS */}
      <StudentBadgesShowcase progress={progress} />

      {/* HISTORIAL DE ACTIVIDADES (3 PESTAÑAS: REALIZADOS, NO REALIZADOS Y PROGRAMADOS) */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white">
              Historial de Actividades & Participación PFI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supervisión de eventos acreditados, justificaciones y convocatorias programadas.
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('realizados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'realizados'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Realizados ({realizados.length})
            </button>

            <button
              onClick={() => setActiveTab('no_realizados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'no_realizados'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              No Realizados ({noRealizados.length})
            </button>

            <button
              onClick={() => setActiveTab('programados')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'programados'
                  ? 'bg-white dark:bg-slate-800 text-unipaz-orange shadow-sm'
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

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                      {att.event && (
                        <button
                          onClick={() => setSelectedFeedbackEvent(att.event!)}
                          className="py-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-colors border border-amber-200 dark:border-amber-500/30"
                        >
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Evaluar ⭐
                        </button>
                      )}

                      {att.event && (
                        <button
                          onClick={() => setSelectedWorkshopAtt(att)}
                          className="py-1.5 px-3 rounded-xl bg-unipaz-navy hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm ml-auto"
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
                  Para acreditar horas oficiales, el reglamento PFI de UNIPAZ exige realizar tanto el <strong>Check-In</strong> como el <strong>Check-Out</strong> (mínimo 80% de permanencia). Si tuviste un inconveniente médico, laboral o de escáner, puedes <strong>solicitar justificación con comprobante</strong> directamente aquí.
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

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedJustificationAtt(att)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Solicitar Justificación con Evidencia
                      </button>
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
                    className="p-5 rounded-2xl bg-blue-50/40 dark:bg-slate-950/70 border border-blue-200 dark:border-blue-500/30 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-400/30">
                          {att.info.statusLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          +{att.event?.horas_pfi || 0} hrs al asistir
                        </span>
                      </div>

                      <h3 className="font-black text-unipaz-navy dark:text-white text-sm mt-2">
                        {att.event?.titulo || 'Actividad Formativa'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-unipaz-orange" />
                        {att.event?.fecha_evento} ({att.event?.hora_inicio} - {att.event?.hora_fin} hrs)
                      </p>
                    </div>

                    <div className="pt-3 border-t border-blue-100 dark:border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-unipaz-cobalt" />
                        {att.event?.ubicacion || 'Campus UNIPAZ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DICTAMEN OFICIAL DE TITULACIÓN */}
      {showDictamenModal && (
        <OfficialClearanceDictamenModal
          isOpen={showDictamenModal}
          onClose={() => setShowDictamenModal(false)}
          student={currentUser}
          progress={progress}
        />
      )}

      {/* MODAL CARNET PVC IMPRIMIBLE */}
      {showPrintableCardModal && (
        <PrintableIdCardModal
          isOpen={showPrintableCardModal}
          onClose={() => setShowPrintableCardModal(false)}
          student={currentUser}
        />
      )}

      {/* MODAL CONSTANCIA GENERAL PFI */}
      {showCertModal && (
        <CertificatePdfModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          student={currentUser}
          progress={progress}
        />
      )}

      {/* MODAL CONSTANCIA DE TALLER / EVENTO INDIVIDUAL */}
      {selectedWorkshopAtt && selectedWorkshopAtt.event && (
        <WorkshopCertificatePdfModal
          isOpen={Boolean(selectedWorkshopAtt)}
          onClose={() => setSelectedWorkshopAtt(null)}
          event={selectedWorkshopAtt.event}
          attendance={selectedWorkshopAtt}
          student={currentUser}
        />
      )}

      {/* MODAL DE JUSTIFICACIÓN DE ASISTENCIA */}
      {selectedJustificationAtt && (
        <AttendanceJustificationModal
          isOpen={Boolean(selectedJustificationAtt)}
          onClose={() => setSelectedJustificationAtt(null)}
          attendance={selectedJustificationAtt}
          event={selectedJustificationAtt.event}
        />
      )}

      {/* MODAL DE EVALUACIÓN / FEEDBACK */}
      {selectedFeedbackEvent && (
        <EventFeedbackModal
          isOpen={Boolean(selectedFeedbackEvent)}
          onClose={() => setSelectedFeedbackEvent(null)}
          event={selectedFeedbackEvent}
        />
      )}

      {/* MODAL DE POSTULACIÓN A BECA */}
      {showScholarshipAppModal && (
        <ScholarshipApplicationModal
          isOpen={showScholarshipAppModal}
          onClose={() => setShowScholarshipAppModal(false)}
          student={currentUser}
        />
      )}

      {/* MODAL DE INFORME DE BECARIO */}
      {showBecarioReportModal && (
        <BecarioReportModal
          isOpen={showBecarioReportModal}
          onClose={() => setShowBecarioReportModal(false)}
          student={currentUser}
        />
      )}

      {/* MODAL DE ESTUDIO SOCIOECONÓMICO */}
      {showSocioeconomicModal && (
        <SocioeconomicStudyModal
          isOpen={showSocioeconomicModal}
          onClose={() => setShowSocioeconomicModal(false)}
          student={currentUser}
        />
      )}

      {/* MODAL DE ESCÁNER PARA STAFF TEMPORAL */}
      {showStaffScannerModal && (
        <QrScannerModal
          isOpen={showStaffScannerModal}
          onClose={() => setShowStaffScannerModal(false)}
          defaultEventId={activeStaffEvents[0]?.id}
        />
      )}
    </div>
  );
}
