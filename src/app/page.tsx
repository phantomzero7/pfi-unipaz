'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  FileCheck,
  QrCode,
  ScanLine,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { usePFI } from '@/lib/store';

export default function HomePage() {
  const { currentUser, switchUser, profiles } = usePFI();

  return (
    <div className="space-y-12 py-4 sm:py-8">
      {/* Hero Section Institucional */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001833] via-[#002855] to-[#001226] border border-slate-700/50 p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-unipaz-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-unipaz-cobalt/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-unipaz-orange/20 border border-unipaz-orange/30 text-amber-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-unipaz-orange" />
              Universidad Internacional de La Paz · Ciclo 2026
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Programa de Formación Integral{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-unipaz-orange via-amber-400 to-amber-200">
                (PFI)
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Plataforma universitaria para la gestión de créditos, seguimiento de talleres extracurriculares, Plan de Vida y Carrera (PVC), validación QR de asistencias y emisión digital de constancias de titulación.
            </p>

            {/* Botones de Acción Primaria */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/estudiante"
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
              >
                Portal del Estudiante
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/admin"
                className="py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all hover:border-unipaz-orange/40"
              >
                <Shield className="w-4 h-4 text-unipaz-orange" />
                Portal Staff & Admin
              </Link>

              <Link
                href="/estudiante/eventos"
                className="py-3.5 px-6 rounded-2xl bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-sm border border-white/10 flex items-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                Ver Catálogo de Actividades
              </Link>
            </div>
          </div>

          {/* Logo Hero Highlight */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center">
              <Image
                src="/logo-unipaz.png"
                alt="Logo UNIPAZ"
                fill
                className="object-contain p-2 drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reglas Normativas y Escala Oficial PFI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* No Satisfactorio */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200 dark:border-rose-500/30 p-6 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-500/30">
              ≤ 399 Horas
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">En Proceso</span>
          </div>
          <h3 className="text-lg font-black text-unipaz-navy dark:text-white">No Satisfactorio</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Créditos insuficientes para el trámite de titulación. El estudiante debe continuar acumulando horas en talleres y actividades formativas.
          </p>
        </div>

        {/* Satisfactorio (Espíritu Unipaceño) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/40 p-6 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
              400 - 729 Horas
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Titulación
            </span>
          </div>
          <h3 className="text-lg font-black text-unipaz-navy dark:text-white">Espíritu Unipaceño</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Nivel <strong>Satisfactorio</strong> requerido normativamente para titulación, acreditando PVC completo, Liderazgo y 3 talleres extracurriculares.
          </p>
        </div>

        {/* Sobresaliente */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-amber-200 dark:border-amber-400/40 p-6 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-400/30">
              ≥ 730 Horas
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-300 font-black flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Mención Honorífica
            </span>
          </div>
          <h3 className="text-lg font-black text-unipaz-navy dark:text-white">Nivel Sobresaliente</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Distinción especial al mérito extracurricular por alta participación en investigación, ponencias, clubes y voluntariado comunitario.
          </p>
        </div>
      </section>

      {/* Características Principales del Sistema */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white">
            Módulos y Herramientas del Sistema
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Diseñado para cumplir con el reglamento de acreditación del PFI UNIPAZ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-unipaz-orange/15 text-unipaz-orange flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="font-black text-unipaz-navy dark:text-white text-base">Credencial Digital QR</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cada estudiante posee un código QR dinámico para registro instantáneo de asistencia en eventos y talleres.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ScanLine className="w-5 h-5" />
            </div>
            <h4 className="font-black text-unipaz-navy dark:text-white text-base">Regla del 80% de Permanencia</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El escáner calcula automáticamente la diferencia entre Check-In y Check-Out para validar la permanencia obligatoria.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-black text-unipaz-navy dark:text-white text-base">Plan de Vida y Carrera (PVC)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Módulo especializado para seguimiento secuencial de los bloques PVC I (25h), PVC II (25h) y PVC III (25h).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-950/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-black text-unipaz-navy dark:text-white text-base">Constancias Oficiales PDF</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generación de certificados con Sello Digital institucional y código QR de validación en tiempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Selector Rápido de Usuarios de Prueba */}
      <section className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-white/15 p-6 sm:p-8 space-y-4 shadow-lg shadow-blue-950/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
              Demostración Interactiva: Selecciona un Perfil
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Prueba los diferentes estados de avance y permisos de la plataforma:
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-unipaz-navy dark:text-amber-300 border border-slate-200 dark:border-white/10 self-start sm:self-auto">
            Usuario Activo: {currentUser.nombre} ({currentUser.role})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isCurrent = p.id === currentUser.id;
            return (
              <button
                key={p.id}
                onClick={() => switchUser(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-blue-50/80 dark:bg-unipaz-navy border-unipaz-orange shadow-md'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-white/10 hover:border-unipaz-navy/30 dark:hover:border-white/25'
                }`}
              >
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-300 dark:border-white/20 flex-shrink-0">
                  <Image
                    src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={p.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="truncate flex-1">
                  <div className="text-sm font-black text-unipaz-navy dark:text-white truncate">
                    {p.nombre} {p.apellidos}
                  </div>
                  <div className="text-xs text-unipaz-orange dark:text-amber-300 font-bold truncate">
                    {p.carrera}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {p.matricula} · <span className="capitalize font-bold text-slate-700 dark:text-slate-300">{p.role}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
