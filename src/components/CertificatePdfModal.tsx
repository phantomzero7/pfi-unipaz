'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Award, CheckCircle2, Download, ExternalLink, FileText, Loader2, Lock, ShieldCheck, Sparkles, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
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
  const { pfiConfig } = usePFI();
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const canGenerate = progress.horasTotales >= 400;
  const folio = `UNIPAZ-PFI-${new Date().getFullYear()}-${student.matricula}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/validar/${encodeURIComponent(folio)}?student=${encodeURIComponent(student.matricula)}&hours=${progress.horasTotales}`
    : `https://unipaz-pfi.vercel.app/validar/${folio}`;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF5500', '#FFAA00', '#0056B3'],
    });
  };

  const getLogoBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.crossOrigin = 'Anonymous';
      img.src = '/logo-unipaz.png';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
    });
  };

  const generatePDF = async () => {
    if (!canGenerate) {
      alert('Se requiere un mínimo de 400.00 horas acreditadas para generar la constancia oficial de titulación.');
      return;
    }

    try {
      setGenerating(true);
      triggerConfetti();

      // Generar código QR para el PDF
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 150,
        color: { dark: '#002855', light: '#FFFFFF' },
      });

      // Cargar logo en base64
      const logoBase64 = await getLogoBase64();

      // Firmantes configurados institucionalmente
      const firma1 = pfiConfig?.firmas?.general?.firma1 || {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      };
      const firma2 = pfiConfig?.firmas?.general?.firma2 || {
        nombre: 'DR. SECRETARIO ACADÉMICO',
        cargo: 'Dirección de Asuntos Estudiantiles y Titulación',
      };

      // Crear documento jsPDF en orientación Horizontal (Landscape A4: 297 x 210 mm)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Fondo
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, 'F');

      // Marco Institucional Exterior (Azul Marino UNIPAZ)
      doc.setDrawColor(0, 40, 85);
      doc.setLineWidth(2.5);
      doc.rect(10, 10, 277, 190);

      // Marco Interior (Naranja UNIPAZ)
      doc.setDrawColor(255, 85, 0);
      doc.setLineWidth(0.8);
      doc.rect(13, 13, 271, 184);

      // Franja superior Azul Marino
      doc.setFillColor(0, 40, 85);
      doc.rect(14, 14, 269, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ · LA PAZ, B.C.S., MÉXICO', 148.5, 25, { align: 'center' });

      // Logo Institucional en el Certificado
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 20, 36, 24, 24);
      }

      // Encabezado Principal
      doc.setTextColor(0, 40, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CONSTANCIA DE ACREDITACIÓN PFI', 148.5, 46, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 85, 0);
      doc.text('Programa de Formación Integral', 148.5, 53, { align: 'center' });

      // Texto introductorio
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

      // Texto de cumplimiento
      doc.setFontSize(10.5);
      doc.text(
        `Ha cumplido satisfactoriamente con la totalidad de los requisitos formativos y talleres obligatorios, acumulando:`,
        148.5,
        96,
        { align: 'center' }
      );

      // Bloque Destacado de Horas y Escala
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(48, 101, 201, 25, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 85, 0);
      doc.text(`${progress.horasTotales.toFixed(2)} HORAS ACREDITADAS`, 148.5, 112, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(0, 86, 179);
      doc.text(`NIVEL DE EVALUACIÓN: ${progress.escala.toUpperCase()} · ${progress.escalaTexto.toUpperCase()}`, 148.5, 120, { align: 'center' });

      // Desglose de bloques
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Talleres Extracurriculares: ${progress.talleresExtracurriculares.horas.toFixed(2)} hrs  |  Taller de Liderazgo: ${progress.tallerLiderazgo.horas.toFixed(2)} hrs  |  Plan de Vida y Carrera (PVC): ${progress.pvc.horas.toFixed(2)} hrs`,
        148.5,
        133,
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
      doc.text(`La Paz, Baja California Sur, a ${todayDate}.`, 148.5, 142, { align: 'center' });

      // Firmas Oficiales Configurables
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.5);

      // Firma 1
      doc.line(35, 168, 105, 168);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text(firma1.nombre.toUpperCase(), 70, 173, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(firma1.cargo, 70, 177, { align: 'center' });

      // Firma 2
      doc.line(192, 168, 262, 168);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text(firma2.nombre.toUpperCase(), 227, 173, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(firma2.cargo, 227, 177, { align: 'center' });

      // Código QR de validación institucional en el centro inferior
      doc.addImage(qrDataUrl, 'PNG', 134.5, 148, 28, 28);
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Folio Digital: ${folio}`, 148.5, 180, { align: 'center' });
      doc.text('Escanee el QR para validar autenticidad en la plataforma oficial UNIPAZ', 148.5, 183, { align: 'center' });

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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal con Logo */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-1 shadow-md flex-shrink-0 flex items-center justify-center border border-slate-200">
            <Image
              src="/logo-unipaz.png"
              alt="Logo UNIPAZ"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
              Emisión de Constancia Oficial PFI
            </h3>
            <p className="text-xs text-unipaz-orange dark:text-amber-300 font-semibold">
              Universidad Internacional de La Paz · Sistema Oficial de Titulación
            </p>
          </div>
        </div>

        {/* Preview Info Card */}
        <div className="mt-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estudiante:</span>
              <span className="text-sm font-black text-unipaz-navy dark:text-white">
                {student.nombre} {student.apellidos}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Matrícula:</span>
              <span className="text-xs font-mono font-bold text-unipaz-orange">
                {student.matricula}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Carrera:</span>
              <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">
                {student.carrera}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Horas Totales Acumuladas:</span>
              <span className={`text-base font-black ${canGenerate ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {progress.horasTotales.toFixed(2)} hrs {canGenerate ? '(≥ 400h)' : '(< 400h)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nivel de Acreditación:</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30">
                {progress.escalaTexto}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Firmantes Oficiales:</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                {pfiConfig?.firmas?.general?.firma1?.nombre || 'Coordinación PFI'} & {pfiConfig?.firmas?.general?.firma2?.nombre || 'Secretaría Académica'}
              </span>
            </div>
          </div>

          {!canGenerate ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 text-xs text-amber-900 dark:text-amber-200">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                No es posible descargar la constancia debido a que el estudiante cuenta con <strong>{progress.horasTotales.toFixed(2)} hrs</strong>. Se requiere un mínimo de <strong>400.00 hrs</strong> para la emisión oficial.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-xs text-blue-900 dark:text-blue-200">
              <ShieldCheck className="w-5 h-5 text-unipaz-cobalt dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p>
                El documento generado cuenta con el <strong>Logo Oficial Institucional</strong>, Sello Digital y código QR de verificación que enlaza directamente al servidor de UNIPAZ.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {canGenerate ? (
            <button
              onClick={generatePDF}
              disabled={generating}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 text-xs"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando PDF Oficial...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar Constancia Oficial PDF
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold flex items-center justify-center gap-2 text-xs cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Constancia Bloqueada (Requiere ≥ 400.00 hrs)
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
