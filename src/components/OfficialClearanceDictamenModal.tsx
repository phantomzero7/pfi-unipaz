'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, Download, FileText, Printer, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { PFIProgressSummary, UserProfile } from '@/lib/types';

interface OfficialClearanceDictamenModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
  progress: PFIProgressSummary;
}

export const OfficialClearanceDictamenModal: React.FC<OfficialClearanceDictamenModalProps> = ({
  isOpen,
  onClose,
  student,
  progress,
}) => {
  const { pfiConfig, attendances, events } = usePFI();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const folio = `DICT-PFI-${student.matricula}-${new Date().getFullYear()}`;
  const verificationHash = `UNIPAZ-PFI-VALID-${student.matricula}-${Math.abs(
    student.matricula.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)
  ).toString(16).toUpperCase()}`;

  const studentAttendances = attendances.filter(
    (a) => a.student_id === student.id && a.status === 'asistio'
  );

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 my-8 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm text-white">
              Dictamen Oficial de Liberación de Horas PFI para Titulación
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HOJA OFICIAL MEMBRETADA (DOCUMENTO IMPRIMIBLE) */}
        <div
          ref={printRef}
          id="print-dictamen-area"
          className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 space-y-6 relative overflow-hidden font-sans"
          style={{ minHeight: '1050px' }}
        >
          {/* Sello de Agua Institucional de Fondo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <div className="relative w-96 h-96">
              <Image src="/logo-unipaz.png" alt="Watermark" fill className="object-contain" />
            </div>
          </div>

          {/* Encabezado Oficial UNIPAZ */}
          <div className="flex items-center justify-between border-b-2 border-unipaz-navy pb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image src="/logo-unipaz.png" alt="Logo UNIPAZ" fill className="object-contain" />
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight text-unipaz-navy uppercase">
                  Universidad Internacional de La Paz
                </h1>
                <p className="text-xs font-bold text-unipaz-orange uppercase tracking-wider">
                  Programa de Formación Integral
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Dirección de Extensión y Difusión Universitaria
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Folio de Dictamen:</div>
              <div className="text-xs font-mono font-black text-unipaz-navy">{folio}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">La Paz, B.C.S., a {todayStr}</div>
            </div>
          </div>

          {/* Título Central */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-unipaz-navy tracking-tight uppercase underline decoration-unipaz-orange decoration-2 underline-offset-4">
              Dictamen de Acreditación Total del PFI
            </h2>
            <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto">
              Para fines de trámite de titulación profesional conforme al Reglamento General del Programa de Formación Integral.
            </p>
          </div>

          {/* Datos del Egresado / Estudiante */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Nombre del Sustentante:</span>
              <span className="font-black text-unipaz-navy text-sm">{student.nombre} {student.apellidos}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Matrícula:</span>
              <span className="font-mono font-bold text-unipaz-navy">{student.matricula}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Programa Académico:</span>
              <span className="font-bold text-slate-800">{student.carrera}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Cohorte / Ingreso:</span>
              <span className="font-semibold text-slate-800">{student.periodo_ingreso}</span>
            </div>
          </div>

          {/* Certificación y Declaración */}
          <div className="text-xs text-slate-800 leading-relaxed text-justify space-y-2">
            <p>
              Por medio del presente documento, la <strong>Dirección de Extensión y Difusión Universitaria</strong> de la <strong>Universidad Internacional de La Paz</strong>, a través del <strong>Programa de Formación Integral</strong>, hace constar que el(la) estudiante arriba citado(a) ha cumplido satisfactoriamente con la totalidad de los requisitos formativos, horas y créditos establecidos en el modelo institucional para la obtención del grado académico.
            </p>
          </div>

          {/* Resumen Cuantitativo de Horas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Horas Mínimas Reglamentarias</span>
              <span className="font-mono font-black text-slate-700 text-base">400.00 hrs</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Horas Totales Acreditadas</span>
              <span className="font-mono font-black text-emerald-700 text-lg">+{progress.horasTotales.toFixed(2)} hrs</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Escala de Evaluación Oficial</span>
              <span className="font-black text-amber-700 text-sm">{progress.escala.toUpperCase()}</span>
            </div>
          </div>

          {/* Desglose de Obligatorios */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-unipaz-navy uppercase tracking-wider">
              Desglose de Requisitos Obligatorios Cumplidos:
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Eje Formativo</th>
                  <th className="py-2 px-3">Requisito Oficial</th>
                  <th className="py-2 px-3">Completado</th>
                  <th className="py-2 px-3 text-right">Horas Acreditadas</th>
                  <th className="py-2 px-3 text-center">Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold">Plan de Vida y Carrera (PVC I, II, III)</td>
                  <td className="py-2 px-3 text-slate-600">3 Módulos (75.00 hrs)</td>
                  <td className="py-2 px-3 font-bold text-emerald-700">PVC I, II y III Aprobados</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">75.00 hrs</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600">CUMPLIDO ✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Talleres Extracurriculares</td>
                  <td className="py-2 px-3 text-slate-600">3 Talleres (50.00 hrs)</td>
                  <td className="py-2 px-3 font-bold text-emerald-700">{progress.talleresExtracurriculares.completados} Talleres Realizados</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{progress.talleresExtracurriculares.horas.toFixed(2)} hrs</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600">CUMPLIDO ✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Taller de Liderazgo Social</td>
                  <td className="py-2 px-3 text-slate-600">1 Taller (10.00 hrs)</td>
                  <td className="py-2 px-3 font-bold text-emerald-700">{progress.tallerLiderazgo.completados} Taller Realizado</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{progress.tallerLiderazgo.horas.toFixed(2)} hrs</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600">CUMPLIDO ✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Actividades Complementarias, Staff y Ponencias</td>
                  <td className="py-2 px-3 text-slate-600">Variable (265.00 hrs mínimas)</td>
                  <td className="py-2 px-3 text-slate-600">{studentAttendances.length} Actividades Aprobadas</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    {(progress.horasTotales - 135.0).toFixed(2)} hrs
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600">CUMPLIDO ✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Firmas Oficiales */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="h-14 flex items-end justify-center font-serif italic text-slate-400 text-sm">
                Firma Digital Certificada
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 uppercase">
                {pfiConfig.firmas.general.firma1.nombre}
              </div>
              <div className="text-[10px] text-slate-500">{pfiConfig.firmas.general.firma1.cargo}</div>
            </div>

            <div className="space-y-1">
              <div className="h-14 flex items-end justify-center font-serif italic text-slate-400 text-sm">
                Sello de Dirección Académica
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 uppercase">
                {pfiConfig.firmas.general.firma2.nombre}
              </div>
              <div className="text-[10px] text-slate-500">{pfiConfig.firmas.general.firma2.cargo}</div>
            </div>
          </div>

          {/* Código QR y Cadena de Seguridad */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
            <div className="space-y-0.5">
              <div>Cadena de Seguridad Digital: <code className="font-mono text-slate-800">{verificationHash}</code></div>
              <div>Validación en línea disponible en: <span className="font-mono text-unipaz-orange">unipaz-pfi.vercel.app/validar/{student.matricula}</span></div>
            </div>
            <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-1 font-mono text-[9px] text-slate-700">
              <QrCode className="w-3.5 h-3.5 text-unipaz-navy" />
              <span>SELLO DIGITAL UNIPAZ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
