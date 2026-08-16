'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Award, CheckCircle2, Download, ExternalLink, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { EventAttendance, PFIEvent, UserProfile } from '@/lib/types';

interface WorkshopCertificatePdfModalProps {
  student: UserProfile;
  attendance: EventAttendance;
  event: PFIEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkshopCertificatePdfModal: React.FC<WorkshopCertificatePdfModalProps> = ({
  student,
  attendance,
  event,
  isOpen,
  onClose,
}) => {
  const { pfiConfig } = usePFI();
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const folio = `UNIPAZ-TALLER-${new Date().getFullYear()}-${event.id.toUpperCase().replace('EVT-', '')}-${student.matricula}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/validar/${encodeURIComponent(folio)}?student=${encodeURIComponent(student.matricula)}&event=${encodeURIComponent(event.titulo)}`
    : `https://unipaz-pfi.vercel.app/validar/${folio}`;

  // Determinar firmantes según categoría del evento
  const getSignaturesForEvent = () => {
    const isPvc = event.categoria === 'PVC';
    const isTaller = event.categoria === 'Taller Extracurricular' || event.categoria === 'Taller Liderazgo';

    if (isPvc) {
      return {
        firma1: pfiConfig?.firmas?.pvc?.firma1 || {
          nombre: 'MTRO. ROBERTO OJEDA LUCERO',
          cargo: 'Coordinador General del PFI UNIPAZ',
        },
        firma2: pfiConfig?.firmas?.pvc?.firma2 || {
          nombre: 'LIC. ORIENTADOR VOCACIONAL Y TUTORÍA',
          cargo: 'Coordinación de Plan de Vida y Carrera',
        },
      };
    }

    if (isTaller) {
      return {
        firma1: pfiConfig?.firmas?.talleres?.firma1 || {
          nombre: 'MTRO. ROBERTO OJEDA LUCERO',
          cargo: 'Coordinador General del PFI UNIPAZ',
        },
        firma2: event.instructor_titular
          ? {
              nombre: event.instructor_titular,
              cargo: event.instructor_cargo || 'Instructor Titular del Taller',
            }
          : pfiConfig?.firmas?.talleres?.firma2 || {
              nombre: 'INSTRUCTOR TITULAR DEL TALLER',
              cargo: 'Facilitador de Formación Extracurricular',
            },
      };
    }

    // Actividades generales (Simposios, Investigación, Jornadas, etc.)
    return {
      firma1: pfiConfig?.firmas?.actividades?.firma1 || {
        nombre: 'MTRO. ROBERTO OJEDA LUCERO',
        cargo: 'Coordinador General del PFI UNIPAZ',
      },
      firma2: pfiConfig?.firmas?.actividades?.firma2 || {
        nombre: 'RESPONSABLE DE EXTENSIÓN Y EVENTOS',
        cargo: 'Dirección de Difusión y Vida Universitaria',
      },
    };
  };

  const currentSignatures = getSignaturesForEvent();

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
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
    try {
      setGenerating(true);
      triggerConfetti();

      // Generar código QR para el PDF
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 140,
        color: { dark: '#002855', light: '#FFFFFF' },
      });

      // Cargar logo en base64
      const logoBase64 = await getLogoBase64();

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

      // Logo Institucional
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 20, 36, 24, 24);
      }

      // Encabezado Principal
      doc.setTextColor(0, 40, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CONSTANCIA DE PARTICIPACIÓN EN ACTIVIDAD FORMATIVA', 148.5, 46, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 85, 0);
      doc.text(event.categoria.toUpperCase(), 148.5, 53, { align: 'center' });

      // Texto introductorio
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 64, 67);
      doc.text('La Coordinación del Programa de Formación Integral (PFI) otorga la presente constancia a:', 148.5, 66, { align: 'center' });

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

      // Texto de participación en el taller
      doc.setFontSize(11);
      doc.text(
        `Por haber participado y acreditado satisfactoriamente la actividad formativa:`,
        148.5,
        96,
        { align: 'center' }
      );

      // Título del Taller Destacado
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(35, 101, 227, 24, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 40, 85);
      doc.text(event.titulo.toUpperCase(), 148.5, 112, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(255, 85, 0);
      doc.text(`VALOR CURRICULAR PFI: ${event.horas_pfi.toFixed(2)} HORAS FORMATIVAS`, 148.5, 120, { align: 'center' });

      // Fecha y lugar
      const eventDate = new Date(event.fecha_evento).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(`Impartido en Campus UNIPAZ el ${eventDate} · Modalidad: ${event.modalidad.toUpperCase()}`, 148.5, 134, { align: 'center' });

      // Firmas Oficiales Configurables
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.5);

      // Firma 1
      doc.line(35, 168, 105, 168);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text(currentSignatures.firma1.nombre.toUpperCase(), 70, 173, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(currentSignatures.firma1.cargo, 70, 177, { align: 'center' });

      // Firma 2
      doc.line(192, 168, 262, 168);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text(currentSignatures.firma2.nombre.toUpperCase(), 227, 173, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(currentSignatures.firma2.cargo, 227, 177, { align: 'center' });

      // Código QR de validación institucional
      doc.addImage(qrDataUrl, 'PNG', 134.5, 148, 28, 28);
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Folio Actividad: ${folio}`, 148.5, 180, { align: 'center' });
      doc.text('Escanee el QR para validar autenticidad en la plataforma oficial UNIPAZ', 148.5, 183, { align: 'center' });

      // Guardar PDF
      const cleanTitle = event.titulo.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      doc.save(`Constancia_${cleanTitle}_${student.matricula}.pdf`);
    } catch (e) {
      console.error('Error generating workshop certificate:', e);
      alert('Hubo un error al generar la constancia del taller.');
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

        {/* Header Modal */}
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
              Constancia de Actividad Acreditada
            </h3>
            <p className="text-xs text-unipaz-orange dark:text-amber-300 font-semibold">
              Universidad Internacional de La Paz · Formación Integral
            </p>
          </div>
        </div>

        {/* Preview Info Card */}
        <div className="mt-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Taller / Actividad:</span>
              <span className="text-sm font-black text-unipaz-navy dark:text-white truncate max-w-[280px]">
                {event.titulo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estudiante:</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {student.nombre} {student.apellidos} ({student.matricula})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Categoría:</span>
              <span className="text-xs font-bold text-unipaz-orange">
                {event.categoria}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valor Formativo:</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                +{event.horas_pfi.toFixed(2)} hrs acreditadas
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Firmantes Oficiales:</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[280px]">
                {currentSignatures.firma1.nombre} & {currentSignatures.firma2.nombre}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-5 h-5 text-unipaz-cobalt dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              Esta constancia avala formalmente tu participación y acreditación en este taller institucional de UNIPAZ con las firmas oficiales de las autoridades correspondientes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={generatePDF}
            disabled={generating}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 text-xs"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando PDF del Taller...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar Constancia en PDF
              </>
            )}
          </button>

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
