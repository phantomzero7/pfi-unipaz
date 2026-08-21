'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { CreditCard, Download, Lock, Printer, ShieldCheck, X } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface PrintableIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
}

export const PrintableIdCardModal: React.FC<PrintableIdCardModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      id: student.id,
      matricula: student.matricula,
      nombre: `${student.nombre} ${student.apellidos}`,
      secret: student.qr_secret,
      unipaz: 'PFI-2026',
    });

    QRCode.toDataURL(payload, {
      width: 250,
      margin: 1,
      color: {
        dark: '#002855',
        light: '#FFFFFF',
      },
    }).then(setQrUrl);
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-unipaz-orange" />
            <h3 className="font-black text-sm text-white">
              Credencial Oficial Imprimible (Formato Estándar CR-80 PVC)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Carnet
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Formato con dimensiones estándar de tarjeta plástica institucional (85.6 mm × 53.98 mm). Listo para impresión o plastificado.
        </p>

        {/* CONTENEDOR DE LA TARJETA (FRENTE Y VUELTA) */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800 p-6">
          {/* FRENTE */}
          <div
            className="w-[325px] h-[205px] rounded-2xl bg-gradient-to-br from-[#001833] via-[#002855] to-[#0A1526] text-white p-4 shadow-2xl border border-white/20 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-unipaz-orange/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center">
                  <Image src="/logo-unipaz.png" alt="UNIPAZ" fill className="object-contain" />
                </div>
                <div>
                  <div className="font-black text-[10px] uppercase tracking-wider">UNIPAZ</div>
                  <div className="text-[8px] text-amber-300 font-bold uppercase">Credencial Digital PFI</div>
                </div>
              </div>
              <div className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                OFICIAL
              </div>
            </div>

            {/* Content */}
            <div className="flex items-center gap-3">
              <div className={`relative w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center ${
                student.avatar_url && !student.avatar_url.includes('logo-unipaz')
                  ? 'border-2 border-unipaz-orange bg-slate-800'
                  : 'border-2 border-white/30 bg-white p-1'
              }`}>
                <Image
                  src={student.avatar_url && !student.avatar_url.includes('logo-unipaz') ? student.avatar_url : '/logo-unipaz.png'}
                  alt={student.nombre}
                  fill
                  className={student.avatar_url && !student.avatar_url.includes('logo-unipaz') ? 'object-cover' : 'object-contain p-0.5'}
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-black text-xs text-white leading-tight truncate">
                  {student.nombre} {student.apellidos}
                </div>
                <div className="text-[9px] text-amber-200 truncate">{student.carrera}</div>
                <div className="text-[9px] font-mono text-slate-300 font-bold">
                  MATRÍCULA: {student.matricula}
                </div>
                <div className="text-[8px] text-slate-400">
                  COHORTE: {student.cuatrimestre ? `${student.cuatrimestre}° Cuatrimestre` : student.periodo_ingreso}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-white/10 pt-1">
              <span>VIGENCIA: 2026</span>
              <span className="font-mono text-amber-400">UNIPAZ PFI</span>
            </div>
          </div>

          {/* REVERSO (QR CODE + REGLAS) */}
          <div
            className="w-[325px] h-[205px] rounded-2xl bg-white text-slate-900 p-4 shadow-2xl border border-slate-300 relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-[9px] font-black text-unipaz-navy uppercase">
              <span>Control de Asistencia PFI</span>
              <span className="text-unipaz-orange font-mono">CR-80</span>
            </div>

            <div className="flex items-center gap-3">
              {qrUrl ? (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image src={qrUrl} alt="QR" fill className="object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
              )}
              <div className="text-[8px] text-slate-600 leading-tight space-y-1">
                <p>• Esta credencial es personal e intransferible.</p>
                <p>• Obligatoria para Check-In y Check-Out en eventos formativos UNIPAZ.</p>
                <p>• En caso de extravío, notificar a Coordinación PFI.</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[8px] text-slate-500 font-mono">
              <span>ID: {student.id}</span>
              <span className="font-bold text-unipaz-navy">www.unipaz.edu.mx</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
