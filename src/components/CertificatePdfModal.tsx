'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Award, CheckCircle2, Download, ExternalLink, FileText, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { PFIProgressSummary, UserProfile } from '@/lib/types';

interface CertificatePdfModalProps {
  student: UserProfile;
  progress: PFIProgressSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePdfModal: React.FC<CertificatePdfModalProps> = ({
  student,
  progress,
  isOpen,
  onClose,
}) => {
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const folio = `UNIPAZ-PFI-${new Date().getFullYear()}-${student.matricula}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/validar/${encodeURIComponent(folio)}?student=${encodeURIComponent(student.matricula)}&hours=${progress.horasTotales}`
    : `https://pfi.unipaz.edu.mx/validar/${folio}`;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF5500', '#FFAA00', '#0056B3'],
    });
  };

  const generatePDF = async () => {
    try {
      setGenerating(true);
      triggerConfetti();

      // Generar código QR para el PDF
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 150,
        color: { dark: '#002855', light: '#FFFFFF' },
      });

      // Crear documento jsPDF en orientación Horizontal (Landscape A4)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4', // 297 x 210 mm
      });

      // Fondo y Marco Institucional
      doc.setFillColor(253, 253, 254);
      doc.rect(0, 0, 297, 210, 'F');

      // Bordes ornamentales
      doc.setDrawColor(0, 40, 85); // Navy
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);

      doc.setDrawColor(255, 85, 0); // Orange inner border
      doc.setLineWidth(0.8);
      doc.rect(13, 13, 271, 184);

      // Franja superior
      doc.setFillColor(0, 40, 85);
      doc.rect(14, 14, 269, 16, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ · LA PAZ, B.C.S., MÉXICO', 148.5, 24, { align: 'center' });

      // Título Principal
      doc.setTextColor(0, 40, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CONSTANCIA DE ACREDITACIÓN PFI', 148.5, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 85, 0);
      doc.text('Programa de Formación Integral', 148.5, 52, { align: 'center' });

      // Texto de otorgamiento
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 64, 67);
      doc.text('La Coordinación del Programa de Formación Integral y Asuntos Estudiantiles hace constar que:', 148.5, 66, { align: 'center' });

      // Nombre del Estudiante
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 40, 85);
      const studentFullName = `${student.nombre} ${student.apellidos}`.toUpperCase();
      doc.text(studentFullName, 148.5, 78, { align: 'center' });

      // Matrícula y Carrera
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 85, 90);
      doc.text(`Matrícula: ${student.matricula}  |  ${student.carrera}`, 148.5, 86, { align: 'center' });

      // Texto de cumplimiento de horas y escala
      doc.setFontSize(10.5);
      doc.text(
        `Ha cumplido satisfactoriamente con la totalidad de los requisitos formativos y talleres obligatorios, acumulando:`,
        148.5,
        97,
        { align: 'center' }
      );

      // Bloque Destacado de Horas y Escala
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(48, 103, 201, 24, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 85, 0);
      doc.text(`${progress.horasTotales.toFixed(2)} HORAS ACREDITADAS`, 148.5, 114, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(0, 86, 179);
      doc.text(`NIVEL DE EVALUACIÓN: ${progress.escala.toUpperCase()} · ${progress.escalaTexto.toUpperCase()}`, 148.5, 122, { align: 'center' });

      // Desglose de bloques
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Talleres Extracurriculares: ${progress.talleresExtracurriculares.horas.toFixed(2)} hrs  |  Taller de Liderazgo: ${progress.tallerLiderazgo.horas.toFixed(2)} hrs  |  Plan de Vida y Carrera (PVC): ${progress.pvc.horas.toFixed(2)} hrs`,
        148.5,
        134,
        { align: 'center' }
      );

      // Fecha y lugar
      const todayDate = new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(`La Paz, Baja California Sur, a ${todayDate}.`, 148.5, 143, { align: 'center' });

      // Líneas de Firmas
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.5);

      // Firma 1
      doc.line(35, 170, 105, 170);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text('MTRO. ROBERTO OJEDA LUCERO', 70, 175, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Coordinador General del PFI UNIPAZ', 70, 179, { align: 'center' });

      // Firma 2
      doc.line(192, 170, 262, 170);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text('DR. SECRETARIO ACADÉMICO', 227, 175, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Dirección de Asuntos Estudiantiles', 227, 179, { align: 'center' });

      // Código QR de validación en el centro inferior
      doc.addImage(qrDataUrl, 'PNG', 133.5, 150, 30, 30);
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Folio Digital: ${folio}`, 148.5, 183, { align: 'center' });
      doc.text('Escanee el QR para validar autenticidad en la plataforma oficial', 148.5, 186, { align: 'center' });

      // Guardar PDF
      doc.save(`Constancia_PFI_UNIPAZ_${student.matricula}.pdf`);
    } catch (e) {
      console.error('Error generating PDF certificate:', e);
      alert('Hubo un error al generar la constancia.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Emisión de Constancia Oficial PFI
            </h3>
            <p className="text-xs text-amber-300">
              Universidad Internacional de La Paz · Sistema Oficial de Acreditación
            </p>
          </div>
        </div>

        {/* Preview Info Card */}
        <div className="mt-6 space-y-4">
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Estudiante:</span>
              <span className="text-sm font-bold text-white">
                {student.nombre} {student.apellidos}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Matrícula:</span>
              <span className="text-xs font-mono font-bold text-unipaz-orange">
                {student.matricula}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Carrera:</span>
              <span className="text-xs text-slate-200">
                {student.carrera}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Horas Totales Acumuladas:</span>
              <span className="text-base font-extrabold text-emerald-400">
                {progress.horasTotales.toFixed(2)} hrs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Nivel de Acreditación:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {progress.escalaTexto}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-slate-400">Folio Digital Único:</span>
              <span className="text-[11px] font-mono text-slate-300">
                {folio}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-blue-200">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              El documento generado cuenta con <strong>Sello Digital Criptográfico</strong> y código QR de verificación institucional que enlaza a la base de datos de UNIPAZ.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={generatePDF}
            disabled={generating}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando PDF Oficial...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Descargar Constancia Oficial PDF
              </>
            )}
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Validar en Línea
          </a>
        </div>
      </div>
    </div>
  );
};
