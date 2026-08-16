'use client';

import React, { useState } from 'react';
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
  Flame,
  HelpCircle,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CertificatePdfModal } from '@/components/CertificatePdfModal';
import { RadialProgress } from '@/components/RadialProgress';
import { StudentQrCard } from '@/components/StudentQrCard';
import { usePFI } from '@/lib/store';

export default function EstudianteDashboardPage() {
  const { currentUser, getStudentProgress, getStudentAttendances } = usePFI();
  const [showCertModal, setShowCertModal] = useState(false);

  const progress = getStudentProgress();
  const attendances = getStudentAttendances();
  const canGenerateCertificate = progress.horasTotales >= 400;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Saludo y Estado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 rounded-3xl shadow-sm dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-unipaz-orange">
              Expediente PFI Estudiantil
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono font-bold">
              {currentUser.matricula}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            ¡Hola, {currentUser.nombre}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            {currentUser.carrera} · Generación {currentUser.periodo_ingreso}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de Constancia Oficial con Validación de 400 Horas */}
          {canGenerateCertificate ? (
            <button
              onClick={() => setShowCertModal(true)}
              className="py-3 px-5 rounded-full bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              Descargar Constancia Oficial PDF
            </button>
          ) : (
            <div
              className="py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-2"
              title="Requiere mínimo 400 horas acumuladas"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Constancia bloqueada ({(400 - progress.horasTotales).toFixed(1)}h restantes)</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Principal: Medidor Central + Tarjeta QR + Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Medidor Radial de Horas */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                Progreso Global PFI
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-unipaz-cobalt/30 text-unipaz-cobalt dark:text-blue-300 border border-blue-200 dark:border-blue-400/20 font-bold">
                  {progress.porcentajeMeta}% de la Meta
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acumulación de horas para requisito normativo de titulación
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs">
              <span className="text-slate-500 dark:text-slate-400">Nivel Actual:</span>
              <div className="font-extrabold text-unipaz-orange dark:text-amber-300">{progress.escala}</div>
            </div>
          </div>

          {/* SVG Radial Meter */}
          <RadialProgress
            currentHours={progress.horasTotales}
            escala={progress.escala}
            escalaTexto={progress.escalaTexto}
            isAcreditado={progress.isAcreditado}
          />

          {/* Estado de Requisitos Obligatorios Resumen */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">Talleres Extracurr.</span>
              <span className={`text-xs font-black ${progress.talleresExtracurriculares.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {progress.talleresExtracurriculares.completados}/3 ({progress.talleresExtracurriculares.horas.toFixed(1)}h)
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">Taller Liderazgo</span>
              <span className={`text-xs font-black ${progress.tallerLiderazgo.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {progress.tallerLiderazgo.completados}/1 ({progress.tallerLiderazgo.horas.toFixed(1)}h)
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">Bloque PVC</span>
              <span className={`text-xs font-black ${progress.pvc.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {progress.pvc.horas.toFixed(1)} / 75h
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Credencial Digital Estudiantil QR */}
        <div className="lg:col-span-5 space-y-6">
          <StudentQrCard
            student={currentUser}
            horasTotales={progress.horasTotales}
            escala={progress.escalaTexto}
          />

          {/* Tips / Callout */}
          <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-slate-900/60 border border-slate-200/90 dark:border-blue-400/20 p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-unipaz-navy dark:text-blue-300">
              <TrendingUp className="w-4 h-4 text-unipaz-orange" />
              ¿Cómo acreditar más horas?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {canGenerateCertificate
                ? '¡Felicidades! Has superado el mínimo de 400 horas obligatorias. Puedes tramitar tu constancia oficial o seguir acumulando hasta 730h para Mención Sobresaliente.'
                : `Necesitas acumular ${(400 - progress.horasTotales).toFixed(1)} horas más para desbloquear la emisión de tu Constancia Oficial de Titulación.`}
            </p>
            <Link
              href="/estudiante/eventos"
              className="inline-flex items-center gap-1 text-xs font-bold text-unipaz-orange dark:text-amber-300 hover:underline mt-2"
            >
              Explorar actividades disponibles <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sección 2: Requisitos Obligatorios Detallados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white tracking-tight">
              Validación de Requisitos Obligatorios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Debes cumplir con estos 3 bloques para completar la acreditación reglamentaria:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Talleres Extracurriculares */}
          <div className={`p-6 rounded-3xl border transition-all ${
            progress.talleresExtracurriculares.cumplido
              ? 'bg-white dark:bg-slate-900/70 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bloque 1 · 50.00 hrs
              </span>
              {progress.talleresExtracurriculares.cumplido ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              )}
            </div>

            <h4 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
              3 Talleres Extracurriculares
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Culturales, deportivos o sociales (16.67 hrs c/u = 50.00 hrs totales).
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Completados:</span>
              <span className="font-bold text-unipaz-navy dark:text-white font-mono">
                {progress.talleresExtracurriculares.completados} de 3 talleres ({progress.talleresExtracurriculares.horas.toFixed(2)}h)
              </span>
            </div>
          </div>

          {/* 2. Taller de Liderazgo */}
          <div className={`p-6 rounded-3xl border transition-all ${
            progress.tallerLiderazgo.cumplido
              ? 'bg-white dark:bg-slate-900/70 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bloque 2 · 10.00 hrs
              </span>
              {progress.tallerLiderazgo.cumplido ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              )}
            </div>

            <h4 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
              1 Taller de Liderazgo Social
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Enfoque en inclusión, perspectiva de género y promoción de derechos.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Completados:</span>
              <span className="font-bold text-unipaz-navy dark:text-white font-mono">
                {progress.tallerLiderazgo.completados} de 1 taller ({progress.tallerLiderazgo.horas.toFixed(2)}h)
              </span>
            </div>
          </div>

          {/* 3. Plan de Vida y Carrera */}
          <div className={`p-6 rounded-3xl border transition-all ${
            progress.pvc.cumplido
              ? 'bg-white dark:bg-slate-900/70 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
              : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bloque 3 · 75.00 hrs
              </span>
              {progress.pvc.cumplido ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              )}
            </div>

            <h4 className="text-base font-black text-unipaz-navy dark:text-white mt-2">
              Plan de Vida y Carrera (PVC)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              PVC I (25h), PVC II (25h) y PVC III (25h) completados secuencialmente.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Módulos:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                <span className={progress.pvc.pvc1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>I</span>·
                <span className={progress.pvc.pvc2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>II</span>·
                <span className={progress.pvc.pvc3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>III</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">({progress.pvc.horas.toFixed(2)}h)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Historial de Asistencias y Actividades Acreditadas */}
      <section className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-unipaz-navy dark:text-white tracking-tight">
              Historial de Actividades Registradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registro cronológico de asistencias, check-ins y horas acreditadas:
            </p>
          </div>
          <Link
            href="/estudiante/eventos"
            className="text-xs font-bold text-unipaz-orange hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {attendances.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
            <p className="text-sm font-medium">Aún no tienes asistencias registradas.</p>
            <Link
              href="/estudiante/eventos"
              className="inline-block py-2 px-4 rounded-full bg-unipaz-orange text-white font-bold text-xs mt-2 shadow-sm"
            >
              Inscribirme a mi primer evento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3">Actividad / Taller</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Modalidad</th>
                  <th className="py-3 px-3">Estatus</th>
                  <th className="py-3 px-3 text-right">Horas Acreditadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {attendances.map((att) => {
                  const ev = att.event;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-black text-unipaz-navy dark:text-white text-sm">
                          {ev?.titulo || 'Actividad Formativa'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {ev?.fecha_evento || 'Fecha registrada'} · {ev?.ubicacion || 'Campus'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold text-[11px]">
                          {ev?.categoria || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 capitalize text-slate-600 dark:text-slate-300 font-medium">
                        {ev?.modalidad || 'presencial'}
                      </td>
                      <td className="py-3.5 px-3">
                        {att.status === 'asistio' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Acreditado
                          </span>
                        ) : att.status === 'registrado' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                            <Clock className="w-3.5 h-3.5" /> Inscrito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> {att.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-sm">
                        {att.horas_acreditadas > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">+{att.horas_acreditadas.toFixed(2)} hrs</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">0.00 hrs</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal para descargar PDF Oficial */}
      {showCertModal && canGenerateCertificate && (
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
