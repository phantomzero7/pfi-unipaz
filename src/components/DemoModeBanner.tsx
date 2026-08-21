'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  GraduationCap,
  Layers,
  RefreshCw,
  Shield,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { usePFI } from '@/lib/store';

export const DemoModeBanner: React.FC = () => {
  const {
    currentUser,
    switchUser,
    resetToDefaultData,
  } = usePFI();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Lista curada de perfiles demo
  const demoPersonas = [
    {
      id: 'usr-student-01',
      name: 'Sofía Méndez',
      roleTitle: 'Estudiante Becaria (50%)',
      subtext: 'Derecho 3° Cuatri · Promedio 9.65 · Renovación Beca',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
      icon: Award,
      role: 'estudiante',
    },
    {
      id: 'usr-student-02',
      name: 'Carlos Valenzuela',
      roleTitle: 'Estudiante Beca Deportiva (75%)',
      subtext: 'Negocios 7° Cuatri · Garzas UNIPAZ · 280h PFI',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700',
      icon: GraduationCap,
      role: 'estudiante',
    },
    {
      id: 'usr-student-03',
      name: 'Mariana Castro',
      roleTitle: 'Estudiante Regular (Sin Beca)',
      subtext: 'Psicología 2° Cuatri · Convocatoria Beca Nueva',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700',
      icon: User,
      role: 'estudiante',
    },
    {
      id: 'usr-dedu-01',
      name: 'Lic. Paulina García',
      roleTitle: 'Extensión y Difusión (DEDU)',
      subtext: 'Control Total PFI · Eventos, Talleres y Asistencias',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
      icon: Layers,
      role: 'extension',
    },
    {
      id: 'usr-staff-01',
      name: 'Mtro. Roberto Ojeda',
      roleTitle: 'Administración General & Becas',
      subtext: 'Control Total · PFI + Becas + Presupuestos + Auditoría',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
      icon: Shield,
      role: 'admin',
    },
  ];

  const currentRoleLabel =
    currentUser.role === 'admin'
      ? 'Administración General'
      : currentUser.role === 'extension' || currentUser.role === 'dedu'
      ? 'Extensión y Difusión'
      : 'Estudiante';

  const handleReset = () => {
    resetToDefaultData();
    setShowConfirmReset(false);
    setIsExpanded(false);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs font-sans shadow-md relative z-50">
      {/* Barra Principal Compacta */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[10px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Modo Demo Activo
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-xs">
            <span>Usuario Actual:</span>
            <strong className="text-white font-bold">{currentUser.nombre} {currentUser.apellidos}</strong>
            <span className="px-2 py-0.5 rounded-md bg-unipaz-orange/20 text-unipaz-orange font-mono font-bold text-[10px] border border-unipaz-orange/40">
              {currentRoleLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botones de cambio rápido */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {demoPersonas.map((p) => {
              const isSelected = currentUser.id === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-unipaz-orange text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title={`${p.name} - ${p.roleTitle}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 border border-slate-700 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-unipaz-orange" />
            <span>Cambiar Rol / Perfil</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Panel Desplegable con Todos los Perfiles y Opciones */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-5 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-unipaz-orange" />
                  Selector de Cuentas Demo por Rol Institucional
                </h4>
                <p className="text-[11px] text-slate-400">
                  Selecciona cualquiera de las cuentas de prueba para evaluar los permisos, vistas y flujos del sistema. Los cambios se guardan localmente simulando la persistencia de Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-700/60 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restablecer Datos Demo
                </button>
              </div>
            </div>

            {/* Grid de Personas Demo */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {demoPersonas.map((p) => {
                const isSelected = currentUser.id === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      setIsExpanded(false);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-unipaz-orange/15 border-unipaz-orange ring-2 ring-unipaz-orange/30'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${p.badgeColor}`}>
                          {p.role}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-unipaz-orange" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Icon className="w-4 h-4 text-unipaz-orange shrink-0" />
                        <strong className="text-white font-black text-xs leading-tight line-clamp-1">{p.name}</strong>
                      </div>
                      <div className="text-[11px] font-bold text-slate-300">{p.roleTitle}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {p.subtext}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Aviso de Preparación para Supabase */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-slate-200">Integración con Base de Datos:</strong> El sistema almacena estados y auditoría inmutable en el navegador. Al conectar las variables <code className="text-emerald-300">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="text-emerald-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, el cambio a Supabase Auth y PostgreSQL es 100% transparente.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn text-slate-800 dark:text-slate-100">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-black text-unipaz-navy dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-unipaz-orange" />
              ¿Restablecer Datos Demo?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Se restaurarán todos los perfiles de prueba, asistencias, eventos, solicitudes de beca y bitácora de auditoría a sus valores iniciales oficiales de fábrica.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                Restablecer Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
