'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Award, CheckCircle2, Download, ExternalLink, FileText, Loader2, Mic, Printer, QrCode, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { PFIEvent } from '@/lib/types';

interface SpeakerCertificatePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PFIEvent;
}

export const SpeakerCertificatePdfModal: React.FC<SpeakerCertificatePdfModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { pfiConfig } = usePFI();
  const [generating, setGenerating] = useState(false);

  // Datos editables para el ponente
  const [speakerName, setSpeakerName] = useState(event.instructor_titular || 'Dr. Alejandro Morales Ramos');
  const [speakerTitle, setSpeakerTitle] = useState(event.instructor_cargo || 'Especialista Invitado / Conferencista');
  const [roleType, setRoleType] = useState<'Ponente Magistral' | 'Instructor Titular' | 'Facilitador de Taller' | 'Moderador de Panel'>('Ponente Magistral');
  const [curricularHours, setCurricularHours] = useState<number>(event.horas_ponente || 15);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const folio = `REC-PONENTE-${new Date().getFullYear()}-${event.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const verificationHash = `UNIPAZ-PFI-SPEAKER-${Math.abs(
    speakerName.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)
  ).toString(16).toUpperCase()}`;

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF6600', '#FFB81C'],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setGenerating(true);
    triggerConfetti();

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4', // 297mm x 210mm
      });

      // Fondo y bordes elegantes
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, 'F');

      // Marco dorado exterior
      doc.setDrawColor(255, 102, 0); // Naranja UNIPAZ
      doc.setLineWidth(2);
      doc.rect(8, 8, 281, 194);

      // Marco interior azul marino
      doc.setDrawColor(0, 40, 85); // Azul UNIPAZ
      doc.setLineWidth(0.8);
      doc.rect(11, 11, 275, 188);

      // Encabezado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 40, 85);
      doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ', 148.5, 30, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(255, 102, 0);
      doc.text('COORDINACIÓN GENERAL DEL PLAN DE FORMACIÓN INTEGRAL (PFI)', 148.5, 37, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('DIRECCIÓN DE DIFUSIÓN Y EXTENSIÓN UNIVERSITARIA', 148.5, 43, { align: 'center' });

      // Texto OTORGA EL PRESENTE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 40, 85);
      doc.text('OTORGA EL PRESENTE', 148.5, 58, { align: 'center' });

      doc.setFontSize(26);
      doc.setTextColor(255, 102, 0);
      doc.text('RECONOCIMIENTO', 148.5, 70, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text('A:', 148.5, 80, { align: 'center' });

      // Nombre del Ponente
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 40, 85);
      doc.text(speakerName.toUpperCase(), 148.5, 93, { align: 'center' });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(speakerTitle, 148.5, 100, { align: 'center' });

      // Cuerpo del Reconocimiento
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const textBody = `Por su invaluable y destacada contribución como ${roleType.toUpperCase()} en la actividad formativa:`;
      doc.text(textBody, 148.5, 114, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 40, 85);
      doc.text(`"${event.titulo.toUpperCase()}"`, 148.5, 124, { align: 'center', maxWidth: 240 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.text(
        `Llevada a cabo en modalidad ${event.modalidad} el día ${event.fecha_evento}, con un valor curricular de ${curricularHours.toFixed(1)} horas oficiales.`,
        148.5,
        136,
        { align: 'center' }
      );

      // Fecha y lugar
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`La Paz, Baja California Sur, México, a ${todayStr}.`, 148.5, 146, { align: 'center' });

      // Firmas Oficiales
      const firma1 = pfiConfig.firmas.actividades.firma1 || pfiConfig.firmas.general.firma1;
      const firma2 = pfiConfig.firmas.actividades.firma2 || pfiConfig.firmas.general.firma2;

      // Líneas de firma
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(45, 172, 115, 172);
      doc.line(182, 172, 252, 172);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 40, 85);
      doc.text(firma1.nombre, 80, 177, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(firma1.cargo, 80, 182, { align: 'center', maxWidth: 75 });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 40, 85);
      doc.text(firma2.nombre, 217, 177, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(firma2.cargo, 217, 182, { align: 'center', maxWidth: 75 });

      // Folio y Verificación
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`FOLIO: ${folio} | VERIFICACIÓN: ${verificationHash}`, 148.5, 194, { align: 'center' });

      doc.save(`Reconocimiento_Ponente_${speakerName.replace(/\s+/g, '_')}_UNIPAZ.pdf`);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-unipaz-orange" />
            <h3 className="font-black text-sm text-white">
              Emisión de Reconocimiento Oficial a Ponente / Instructor Titular
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={generating}
              className="py-2 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Descargar Diploma en PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel de Configuración de Datos del Ponente */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1">Nombre Completo del Ponente:</label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-unipaz-orange"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Cargo / Institución de Procedencia:</label>
            <input
              type="text"
              value={speakerTitle}
              onChange={(e) => setSpeakerTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-unipaz-orange"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Tipo de Participación:</label>
            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-unipaz-orange"
            >
              <option value="Ponente Magistral">Ponente Magistral</option>
              <option value="Instructor Titular">Instructor Titular</option>
              <option value="Facilitador de Taller">Facilitador de Taller</option>
              <option value="Moderador de Panel">Moderador de Panel</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Valor Curricular (Horas):</label>
            <input
              type="number"
              step="0.5"
              value={curricularHours}
              onChange={(e) => setCurricularHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-unipaz-orange"
            />
          </div>
        </div>

        {/* VISTA PREVIA DEL DIPLOMA (HOJA HORIZONTAL OFICIAL) */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border-4 border-unipaz-orange/40 space-y-6 relative overflow-hidden font-sans text-center">
          {/* Marca de agua */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <div className="relative w-80 h-80">
              <Image src="/logo-unipaz.png" alt="Watermark" fill className="object-contain" />
            </div>
          </div>

          {/* Encabezado */}
          <div className="space-y-1">
            <div className="relative w-16 h-16 mx-auto mb-1">
              <Image src="/logo-unipaz.png" alt="UNIPAZ" fill className="object-contain" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-unipaz-navy uppercase tracking-tight">
              Universidad Internacional de La Paz
            </h2>
            <p className="text-xs font-bold text-unipaz-orange uppercase tracking-wider">
              Coordinación General del Plan de Formación Integral (PFI)
            </p>
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
              Otorga el presente
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-unipaz-orange tracking-tight uppercase">
              Reconocimiento
            </h1>
            <span className="text-xs text-slate-500 block pt-1">a:</span>
          </div>

          {/* Nombre del Ponente */}
          <div className="py-1">
            <div className="text-2xl sm:text-3xl font-black text-unipaz-navy uppercase tracking-tight">
              {speakerName}
            </div>
            <div className="text-xs text-slate-600 font-medium italic mt-0.5">
              {speakerTitle}
            </div>
          </div>

          {/* Cuerpo */}
          <div className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <p>
              Por su destacada participación como <strong>{roleType.toUpperCase()}</strong> en la actividad formativa:
            </p>
            <div className="text-base sm:text-lg font-black text-unipaz-navy uppercase underline decoration-unipaz-orange decoration-2 underline-offset-4">
              "{event.titulo}"
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Impartida en modalidad {event.modalidad} el día {event.fecha_evento}, con un valor curricular de{' '}
              <strong className="text-unipaz-navy">{curricularHours.toFixed(1)} horas oficiales</strong>.
            </p>
          </div>

          <p className="text-[11px] text-slate-500 pt-2">
            La Paz, Baja California Sur, a {todayStr}.
          </p>

          {/* Firmas */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
                Firma Digital Autorizada
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 uppercase text-[11px]">
                {pfiConfig.firmas.actividades.firma1.nombre}
              </div>
              <div className="text-[10px] text-slate-500">{pfiConfig.firmas.actividades.firma1.cargo}</div>
            </div>

            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
                Sello de Extensión Universitaria
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 uppercase text-[11px]">
                {pfiConfig.firmas.actividades.firma2.nombre}
              </div>
              <div className="text-[10px] text-slate-500">{pfiConfig.firmas.actividades.firma2.cargo}</div>
            </div>
          </div>

          {/* Folio */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>FOLIO: {folio}</span>
            <span>VERIFICACIÓN: {verificationHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
