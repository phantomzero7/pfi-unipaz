'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileCheck,
  Layers,
  LayoutDashboard,
  Moon,
  QrCode,
  RotateCcw,
  ScanLine,
  Shield,
  Sun,
  User,
  Users,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { QrScannerModal } from './QrScannerModal';
import { StudentQrCard } from './StudentQrCard';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, profiles, switchUser, getStudentProgress, resetToDefaultData, theme, toggleTheme } = usePFI();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQrCardModal, setShowQrCardModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const isStaffOrAdmin = currentUser.role === 'staff' || currentUser.role === 'admin';
  const progress = getStudentProgress();

  const studentLinks = [
    { href: '/estudiante', label: 'Mi Dashboard', icon: LayoutDashboard },
    { href: '/estudiante/eventos', label: 'Catálogo de Actividades', icon: Calendar },
    { href: '/estudiante/pvc', label: 'Plan de Vida y Carrera', icon: Compass },
    { href: '/estudiante/constancias', label: 'Mis Constancias', icon: FileCheck },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Panel General', icon: LayoutDashboard },
    { href: '/admin/scanner', label: 'Escáner QR Asistencias', icon: ScanLine },
    { href: '/admin/eventos', label: 'Gestión de Eventos', icon: Calendar },
    { href: '/admin/estudiantes', label: 'Directorio Estudiantil', icon: Users },
  ];

  const currentLinks = isStaffOrAdmin ? adminLinks : studentLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Oficial y Nombre Institucional */}
            <Link href={isStaffOrAdmin ? '/admin' : '/estudiante'} className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo-unipaz.png"
                  alt="UNIPAZ - Universidad Internacional de La Paz"
                  fill
                  priority
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-lg text-unipaz-navy dark:text-white">
                    UNIPAZ
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-unipaz-orange/15 text-unipaz-orange border border-unipaz-orange/30 uppercase tracking-wider">
                    PFI
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium hidden sm:inline leading-tight">
                  Programa de Formación Integral
                </span>
              </div>
            </Link>

            {/* Links de Navegación Principal */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10">
              {currentLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-unipaz-navy dark:bg-gradient-to-r dark:from-unipaz-cobalt dark:to-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-unipaz-navy dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Acciones Rápidas, Toggle Claro/Oscuro y Perfil */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Toggle Claro / Oscuro */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Cambiar a Modo Claro Institucional' : 'Cambiar a Modo Oscuro'}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-amber-300 transition-all hover:scale-105 shadow-sm"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-unipaz-navy" />
                )}
              </button>

              {/* Botón Escáner QR (para Staff/Admin) */}
              {isStaffOrAdmin ? (
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105"
                >
                  <ScanLine className="w-4 h-4" />
                  Escanear QR
                </button>
              ) : (
                /* Botón Mi Credencial QR (para Estudiante) */
                <button
                  onClick={() => setShowQrCardModal(true)}
                  className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:text-unipaz-navy dark:hover:text-white font-bold text-xs shadow-sm transition-all hover:border-unipaz-orange/40"
                >
                  <QrCode className="w-4 h-4 text-unipaz-orange" />
                  Mi Credencial QR
                </button>
              )}

              {/* Selector de Perfil / Demo Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/10 transition-all shadow-sm"
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-300 dark:border-white/20">
                    <Image
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                      {currentUser.nombre}
                    </div>
                    <div className="text-[10px] text-unipaz-orange dark:text-amber-300 font-bold uppercase">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Dropdown de Personas Demo */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-3 shadow-2xl z-50 text-slate-800 dark:text-white animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-[10px] uppercase font-extrabold text-unipaz-navy dark:text-slate-400 tracking-wider">
                        Selector de Usuario Demo:
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Alterna instantáneamente entre roles para probar todas las funciones:
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {profiles.map((p) => {
                        const isCurrent = p.id === currentUser.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              switchUser(p.id);
                              setShowProfileDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                              isCurrent
                                ? 'bg-unipaz-navy text-white font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-300 dark:border-white/20 flex-shrink-0">
                              <Image
                                src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={p.nombre}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="truncate flex-1">
                              <div className="text-xs leading-tight truncate">
                                {p.nombre} {p.apellidos}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {p.matricula} · <span className="capitalize">{p.role}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          resetToDefaultData();
                          setShowProfileDropdown(false);
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors p-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar datos muestra
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 py-2.5 px-2">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-all ${
                  isActive ? 'text-unipaz-orange' : 'text-slate-500 dark:text-slate-400 hover:text-unipaz-navy dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

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
