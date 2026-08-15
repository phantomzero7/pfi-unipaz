'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, BookOpen, Calendar, CheckCircle2, ChevronDown, Compass, FileCheck, Layers, LayoutDashboard, QrCode, RotateCcw, ScanLine, Shield, User, Users } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { QrScannerModal } from './QrScannerModal';
import { StudentQrCard } from './StudentQrCard';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, profiles, switchUser, getStudentProgress, resetToDefaultData } = usePFI();
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
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo y Nombre Institucional */}
            <Link href={isStaffOrAdmin ? '/admin' : '/estudiante'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-unipaz-orange via-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all">
                <span className="text-xl">U</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-base text-white">
                    UNIPAZ
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-unipaz-orange/20 text-unipaz-orange border border-unipaz-orange/30 uppercase tracking-widest">
                    PFI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Programa de Formación Integral
                </span>
              </div>
            </Link>

            {/* Links de Navegación Principal */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10">
              {currentLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-unipaz-cobalt to-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & Profile Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                  className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white font-bold text-xs shadow-md transition-all hover:border-unipaz-orange/40"
                >
                  <QrCode className="w-4 h-4 text-unipaz-orange" />
                  Mi Credencial QR
                </button>
              )}

              {/* Selector de Perfil / Demo Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20">
                    <Image
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {currentUser.nombre}
                    </div>
                    <div className="text-[10px] text-amber-300 font-semibold uppercase">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown de Personas Demo */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/15 rounded-3xl p-3 shadow-2xl z-50 text-white animate-fadeIn">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Selector de Usuario Demo:
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
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
                                ? 'bg-unipaz-cobalt text-white font-bold'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
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
                              <div className="text-[10px] text-slate-400 truncate">
                                {p.matricula} · <span className="capitalize">{p.role}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          resetToDefaultData();
                          setShowProfileDropdown(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors p-1"
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
        <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-slate-950/90 py-2.5 px-2">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-all ${
                  isActive ? 'text-unipaz-orange' : 'text-slate-400 hover:text-white'
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
