'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  Calendar,
  Camera,
  ChevronDown,
  Compass,
  FileCheck,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Moon,
  QrCode,
  RotateCcw,
  ScanLine,
  Settings,
  Shield,
  Sun,
  Users,
} from 'lucide-react';
import { getActiveStaffEventsForStudent } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import { NotificationBell } from './NotificationBell';
import { QrScannerModal } from './QrScannerModal';
import { StudentQrCard } from './StudentQrCard';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    profiles,
    events,
    attendances,
    switchUser,
    getStudentProgress,
    resetToDefaultData,
    theme,
    toggleTheme,
  } = usePFI();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQrCardModal, setShowQrCardModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const isAdmin = currentUser.role === 'admin';
  const isExtension = currentUser.role === 'extension' || currentUser.role === 'dedu';
  const isStaffOrAdmin = isAdmin || isExtension || currentUser.role === 'staff';
  const progress = getStudentProgress();

  // Verifica si el estudiante es Staff temporal para un evento activo hoy
  const activeStaffEvents = getActiveStaffEventsForStudent(currentUser.id, events, attendances);
  const isTemporaryStaffActive = activeStaffEvents.length > 0;

  const studentLinks = [
    { href: '/estudiante', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/estudiante/eventos', label: 'Eventos PFI', icon: Calendar },
    { href: '/estudiante/pvc', label: 'PVC y Talleres', icon: Compass },
    { href: '/estudiante/constancias', label: 'Constancias', icon: FileCheck },
  ];

  const extensionLinks = [
    { href: '/admin', label: 'Panel PFI', icon: LayoutDashboard },
    { href: '/admin/eventos', label: 'Eventos y Talleres', icon: Calendar },
    { href: '/admin/estudiantes', label: 'Expedientes & Horas', icon: Users },
    { href: '/admin/informes', label: 'Informes PFI', icon: FileSpreadsheet },
    { href: '/admin/scanner', label: 'Escáner QR', icon: ScanLine },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/becas', label: 'Becas & Becados', icon: Award },
    { href: '/admin/estudiantes', label: 'Estudiantes', icon: Users },
    { href: '/admin/eventos', label: 'Eventos y Talleres', icon: Calendar },
    { href: '/admin/informes', label: 'Informes', icon: FileSpreadsheet },
    { href: '/admin/importar', label: 'Importar', icon: Layers },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  ];

  const currentLinks = isAdmin ? adminLinks : isExtension ? extensionLinks : studentLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-[#0A1526]/85 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Oficial y Nombre Institucional */}
            <Link href={isStaffOrAdmin ? '/admin' : '/estudiante'} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/logo-unipaz.png"
                  alt="UNIPAZ Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-unipaz-navy dark:text-white">
                    UNIPAZ
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-unipaz-orange/10 text-unipaz-orange border border-unipaz-orange/20 tracking-wider">
                    PFI
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline leading-tight">
                  Programa de Formación Integral
                </span>
              </div>
            </Link>

            {/* Pestañas de Navegación Refinadas */}
            <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 shadow-inner">
              {currentLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-white dark:bg-unipaz-cobalt text-unipaz-navy dark:text-white shadow-sm font-black'
                        : 'text-slate-600 dark:text-slate-300 hover:text-unipaz-navy dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40 font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-unipaz-orange dark:text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botón Sol/Luna + Credencial/Escáner + Notificaciones + Perfil */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Campana de Notificaciones */}
              <NotificationBell />

              {/* Botón Sol y Luna */}
              <button
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:scale-105 shadow-sm"
                title={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
                ) : (
                  <Moon className="w-4 h-4 text-unipaz-navy animate-fadeIn" />
                )}
              </button>

              {/* Botón Escáner QR / Mi Credencial en Cabecera (Siempre visible en Móvil, Tablet y Desktop) */}
              {isStaffOrAdmin || isTemporaryStaffActive ? (
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                  title="Abrir Escáner QR de Asistencias"
                >
                  <ScanLine className="w-4 h-4 stroke-[2.5]" />
                  <span className="inline font-black">Escanear QR</span>
                </button>
              ) : (
                /* Botón Mi Credencial QR (para Estudiante) */
                <button
                  onClick={() => setShowQrCardModal(true)}
                  className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-unipaz-navy to-slate-800 hover:from-slate-900 hover:to-slate-800 text-white font-bold text-xs shadow-md border border-slate-700/50 transition-all hover:scale-105 active:scale-95"
                  title="Mostrar mi Credencial QR Oficial"
                >
                  <QrCode className="w-4 h-4 text-unipaz-orange stroke-[2.5]" />
                  <span className="inline font-black">Mi QR</span>
                </button>
              )}

              {/* Selector de Perfil Oficial y Único */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pr-3 rounded-full bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-white/20">
                    <Image
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                      {currentUser.nombre}
                    </div>
                    <div className="text-[9px] font-semibold text-unipaz-orange uppercase leading-none">
                      {currentUser.role === 'admin'
                        ? 'Administración'
                        : currentUser.role === 'extension' || currentUser.role === 'dedu'
                        ? 'Extensión / DEDU'
                        : 'Estudiante'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown de Personas Demo Organizado */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-3.5 shadow-2xl z-50 text-slate-800 dark:text-white animate-fadeIn space-y-2.5">
                    <div className="px-2 py-1.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                          Cambiar de Cuenta / Rol
                        </p>
                        <p className="text-[11px] font-bold text-unipaz-navy dark:text-white">
                          {currentUser.nombre} {currentUser.apellidos}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-unipaz-orange/15 text-unipaz-orange border border-unipaz-orange/30">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {profiles.map((p) => {
                        const isCurrent = p.id === currentUser.id;
                        const roleBadge =
                          p.role === 'admin'
                            ? { label: 'Admin & Becas', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' }
                            : p.role === 'extension' || p.role === 'dedu'
                            ? { label: 'Extensión PFI', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' }
                            : { label: p.tiene_beca ? `Beca ${p.porcentaje_beca}%` : 'Estudiante', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };

                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              switchUser(p.id);
                              setShowProfileDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-left transition-all ${
                              isCurrent
                                ? 'bg-unipaz-navy text-white shadow-md'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/20 flex-shrink-0">
                              <Image
                                src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={p.nombre}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="truncate flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold truncate">
                                  {p.nombre} {p.apellidos}
                                </span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${roleBadge.color}`}>
                                  {roleBadge.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                                {p.matricula} · {p.carrera ? p.carrera.split(' ')[0] : ''}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          resetToDefaultData();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restablecer Datos Demo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE NAVEGACIÓN FIJA INFERIOR PARA MÓVIL Y TABLET CON BOTÓN CENTRAL DESTACADO DE ESCÁNER / CREDENCIAL QR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A1526]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 px-3 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-around relative">
          {/* Lado Izquierdo: 2 Enlaces */}
          {currentLinks.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl transition-all ${
                  isActive ? 'text-unipaz-orange font-black' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-unipaz-orange scale-110' : 'text-slate-400'}`} />
                <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}

          {/* BOTÓN CENTRAL HERO: ESCANEAR QR / MI CREDENCIAL (FÁCIL Y SÚPER VISIBLE) */}
          <div className="relative -top-5 flex flex-col items-center">
            {isStaffOrAdmin || isTemporaryStaffActive ? (
              <button
                onClick={() => setShowScannerModal(true)}
                className="group flex flex-col items-center focus:outline-none"
                title="Abrir Escáner QR de Asistencias"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-unipaz-orange via-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-xl shadow-orange-500/40 ring-4 ring-white dark:ring-[#0A1526] group-active:scale-90 transition-all hover:scale-105 animate-pulse">
                  <ScanLine className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-unipaz-orange dark:text-amber-400 tracking-tight mt-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-xs border border-orange-200 dark:border-orange-500/20">
                  Escanear QR
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowQrCardModal(true)}
                className="group flex flex-col items-center focus:outline-none"
                title="Mostrar mi Credencial QR Oficial"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-unipaz-navy via-indigo-950 to-unipaz-cobalt text-white flex items-center justify-center shadow-xl shadow-blue-900/40 ring-4 ring-white dark:ring-[#0A1526] group-active:scale-90 transition-all hover:scale-105">
                  <QrCode className="w-6 h-6 text-unipaz-orange stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-unipaz-navy dark:text-white tracking-tight mt-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-xs border border-slate-200 dark:border-white/10">
                  Mi QR
                </span>
              </button>
            )}
          </div>

          {/* Lado Derecho: Siguientes 2 Enlaces */}
          {currentLinks.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl transition-all ${
                  isActive ? 'text-unipaz-orange font-black' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-unipaz-orange scale-110' : 'text-slate-400'}`} />
                <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modal Credencial QR del Estudiante */}
      {showQrCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md">
            <StudentQrCard
              student={currentUser}
              horasTotales={progress.horasTotales}
              escala={progress.escalaTexto}
            />
            <button
              onClick={() => setShowQrCardModal(false)}
              className="mt-4 w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Cerrar Credencial
            </button>
          </div>
        </div>
      )}

      {/* Modal Escáner QR de Asistencias */}
      {showScannerModal && (
        <QrScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} />
      )}
    </>
  );
};
