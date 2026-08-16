'use client';

import React from 'react';
import { Award, CheckCircle2, Flame, Lock, ShieldCheck, Sparkles, Star, Trophy, Users } from 'lucide-react';
import { Badge, PFIProgressSummary } from '@/lib/types';

interface StudentBadgesShowcaseProps {
  progress: PFIProgressSummary;
}

export const StudentBadgesShowcase: React.FC<StudentBadgesShowcaseProps> = ({
  progress,
}) => {
  const badges: Badge[] = [
    {
      id: 'badge-400',
      titulo: 'Espíritu Unipaceño',
      descripcion: 'Alcanzar las 400.00 hrs reglamentarias de titulación.',
      icono: '🏆',
      obtenida: progress.horasTotales >= 400,
    },
    {
      id: 'badge-730',
      titulo: 'Mérito Sobresaliente',
      descripcion: 'Superar las 730.00 hrs de excelencia formativa PFI.',
      icono: '⭐',
      obtenida: progress.horasTotales >= 730,
    },
    {
      id: 'badge-pvc',
      titulo: 'Trilogía PVC Completa',
      descripcion: 'Aprobar satisfactoriamente PVC I, PVC II y PVC III.',
      icono: '🎯',
      obtenida: progress.pvc.cumplido,
    },
    {
      id: 'badge-staff',
      titulo: 'Staff Logístico Estrella',
      descripcion: 'Apoyar activamente en la coordinación y logística de eventos.',
      icono: '📦',
      obtenida: progress.desglosePorRoles.participacionesStaff >= 1,
    },
    {
      id: 'badge-talleres',
      titulo: 'Maestría Extracurricular',
      descripcion: 'Completar los 3 talleres obligatorios de cultura y deporte.',
      icono: '🎨',
      obtenida: progress.talleresExtracurriculares.cumplido,
    },
    {
      id: 'badge-liderazgo',
      titulo: 'Líder Social UNIPAZ',
      descripcion: 'Acreditar el Taller de Liderazgo y Promoción Social.',
      icono: '🤝',
      obtenida: progress.tallerLiderazgo.cumplido,
    },
  ];

  const earnedCount = badges.filter((b) => b.obtenida).length;

  return (
    <div className="rounded-3xl bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm dark:shadow-xl space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-unipaz-orange" />
          <h3 className="font-black text-base text-unipaz-navy dark:text-white">
            Medallas e Insignias Formativas ({earnedCount}/{badges.length})
          </h3>
        </div>
        <span className="text-xs font-bold text-unipaz-orange bg-orange-100 dark:bg-unipaz-orange/20 px-3 py-1 rounded-full">
          {earnedCount === badges.length ? '¡Colección Completa!' : `${badges.length - earnedCount} por desbloquear`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center justify-between transition-all ${
              badge.obtenida
                ? 'bg-gradient-to-b from-amber-50 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-900 border-amber-300 dark:border-amber-400/40 shadow-sm scale-[1.02]'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 opacity-50 grayscale'
            }`}
          >
            <div className="text-3xl my-1 relative">
              {badge.icono}
              {badge.obtenida ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 bg-white rounded-full absolute -top-1 -right-1 shadow-sm" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400 bg-slate-200 rounded-full p-0.5 absolute -top-1 -right-1" />
              )}
            </div>

            <div className="space-y-0.5 mt-1">
              <span className="font-black text-xs text-unipaz-navy dark:text-white block leading-tight">
                {badge.titulo}
              </span>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                {badge.descripcion}
              </p>
            </div>

            <span
              className={`text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                badge.obtenida
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {badge.obtenida ? 'Desbloqueada' : 'Bloqueada'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
