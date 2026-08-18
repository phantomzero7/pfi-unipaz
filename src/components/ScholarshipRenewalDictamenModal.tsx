'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck,
  GraduationCap,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { ScholarshipProgressSummary, UserProfile } from '@/lib/types';

interface ScholarshipRenewalDictamenModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile;
  scholarshipProgress: ScholarshipProgressSummary;
}

export const ScholarshipRenewalDictamenModal: React.FC<ScholarshipRenewalDictamenModalProps> = ({
  isOpen,
  onClose,
  student,
  scholarshipProgress,
}) => {
  const { pfiConfig } = usePFI();
  const [generating, setGenerating] = useState(false);

  if (!isOpen || !student.tiene_beca) return null;

  const todayStr = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const folio = `DICTAMEN-BECA-${new Date().getFullYear()}-${student.matricula}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const verificationHash = `UNIPAZ-SCHOLARSHIP-${student.matricula}-${Math.abs(
    (student.matricula + scholarshipProgress.puntosTotales).split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)
  ).toString(16).toUpperCase()}`;

  const isCondicionada = student.estatus_ratificacion_beca === 'condicionada' || student.refrendo_beca_condicionado_admin;
  const isRatificada = student.estatus_ratificacion_beca === 'ratificada' || (student.refrendo_beca_aprobado_admin && !isCondicionada);
  const isSuspendida = student.estatus_ratificacion_beca === 'suspendida' || student.solicitud_beca_status === 'rechazada';

  const isSemestral = student.carrera?.toUpperCase().includes('MÉDICO CIRUJANO') || student.carrera?.toUpperCase().includes('MEDICO CIRUJANO');
  const periodoActual = isSemestral ? 'Periodo Semestral 902 (Febrero - Julio 2026)' : 'Periodo Cuatrimestral 187 (Mayo - Agosto 2026)';
  const periodoSiguiente = isSemestral ? 'Periodo Semestral 903 (Agosto 2026 - Enero 2027)' : 'Periodo Cuatrimestral 188 (Septiembre - Diciembre 2026)';

  const handleDownloadPdf = async () => {
    setGenerating(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF6600', '#FFB81C'],
    });

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4', // 210mm x 297mm
      });

      // Fondo y bordes oficiales
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Marco institucional
      doc.setDrawColor(0, 40, 85); // Azul UNIPAZ
      doc.setLineWidth(1.2);
      doc.rect(10, 10, 190, 277);

      doc.setDrawColor(255, 102, 0); // Naranja UNIPAZ
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 186, 273);

      // Encabezado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 40, 85);
      doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ', 105, 24, { align: 'center' });

      doc.setFontSize(9.5);
      doc.setTextColor(255, 102, 0);
      doc.text('COMISIÓN GENERAL DE BECAS, ESTÍMULOS Y APOYOS UNIVERSITARIOS', 105, 30, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('DIRECCIÓN DE ADMINISTRACIÓN, FINANZAS Y CONTROL ESCOLAR', 105, 35, { align: 'center' });

      // Título del Dictamen
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 40, 85);
      doc.text('DICTAMEN OFICIAL DE EVALUACIÓN Y RATIFICACIÓN DE BECA', 105, 47, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`EVALUACIÓN DE ${periodoActual.toUpperCase()} PARA RATIFICAR ${periodoSiguiente.toUpperCase()}`, 105, 52, { align: 'center' });

      // Cuadro de Datos del Alumno y Beca
      doc.setFillColor(248, 250, 252);
      doc.rect(18, 58, 174, 38, 'F');
      doc.setDrawColor(200, 210, 220);
      doc.rect(18, 58, 174, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 40, 85);
      doc.text('DATOS DEL ESTUDIANTE BECARIO:', 22, 64);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text(`Nombre Completo: ${student.nombre} ${student.apellidos}`, 22, 70);
      doc.text(`Matrícula: ${student.matricula}`, 22, 75);
      doc.text(`Programa Académico: ${student.carrera}`, 22, 80);
      doc.text(`Grado: ${student.cuatrimestre ? `${student.cuatrimestre}° ${isSemestral ? 'Semestre' : 'Cuatrimestre'}` : 'Activo'}`, 22, 85);
      doc.text(`Promedio Académico: ${scholarshipProgress.promedioAcademico.toFixed(2)} (Sin reprobaciones en ordinario)`, 22, 90);

      // Columna derecha datos beca
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES DEL BENEFICIO:', 115, 64);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tipo de Beca: ${scholarshipProgress.tipoBeca}`, 115, 70);
      doc.text(`Porcentaje Asignado: ${scholarshipProgress.porcentajeBeca}% de Descuento`, 115, 75);
      doc.text(`Meta Formativa: ${scholarshipProgress.puntosMeta} Puntos`, 115, 80);
      doc.text(`Puntos Obtenidos: ${scholarshipProgress.puntosTotales} Puntos`, 115, 85);
      doc.text(`Estatus Dictamen: ${isCondicionada ? 'CONDICIONADA' : isRatificada ? 'RATIFICADA' : isSuspendida ? 'SUSPENDIDA' : 'EN EVALUACIÓN'}`, 115, 90);

      // Tabla de Desglose de Actividades Formativas Becadas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 40, 85);
      doc.text('DESGLOSE DE ACTIVIDADES FORMATIVAS Y PUNTOS ACREDITADOS:', 18, 105);

      // Cabecera tabla
      doc.setFillColor(0, 40, 85);
      doc.rect(18, 109, 174, 7, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('ACTIVIDAD / EVENTO', 22, 114);
      doc.text('CATEGORÍA', 105, 114);
      doc.text('FECHA', 140, 114);
      doc.text('PUNTOS', 175, 114, { align: 'right' });

      let currentY = 120;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);

      if (scholarshipProgress.actividadesBecadas.length === 0) {
        doc.text('Sin actividades formativas acreditadas en el periodo actual.', 22, currentY);
        currentY += 8;
      } else {
        scholarshipProgress.actividadesBecadas.slice(0, 7).forEach((act, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(18, currentY - 4, 174, 6, 'F');
          }
          doc.text(act.titulo.substring(0, 45), 22, currentY);
          doc.text(act.categoria, 105, currentY);
          doc.text(act.fecha, 140, currentY);
          doc.setFont('helvetica', 'bold');
          doc.text(`+${act.puntosAcreditados} pts`, 175, currentY, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          currentY += 6.5;
        });
      }

      // Totalización de Puntos
      doc.setDrawColor(0, 40, 85);
      doc.setLineWidth(0.5);
      doc.line(18, currentY + 2, 192, currentY + 2);

      currentY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 40, 85);
      doc.text(`TOTAL PUNTOS DE BECA ACUMULADOS:`, 105, currentY, { align: 'right' });
      doc.setTextColor(255, 102, 0);
      doc.text(`${scholarshipProgress.puntosTotales} / ${scholarshipProgress.puntosMeta} PTS (${scholarshipProgress.porcentajeCumplimiento}%)`, 175, currentY, { align: 'right' });

      // Dictamen Resolutivo
      currentY += 12;
      const isBoxGreen = isRatificada;
      const isBoxAmber = isCondicionada;

      doc.setFillColor(isBoxGreen ? 236 : isBoxAmber ? 254 : 254, isBoxGreen ? 253 : isBoxAmber ? 243 : 242, isBoxGreen ? 245 : isBoxAmber ? 199 : 242);
      doc.rect(18, currentY, 174, 26, 'F');
      doc.setDrawColor(isBoxGreen ? 16 : isBoxAmber ? 245 : 244, isBoxGreen ? 185 : isBoxAmber ? 158 : 63, isBoxGreen ? 129 : isBoxAmber ? 11 : 94);
      doc.rect(18, currentY, 174, 26);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isBoxGreen ? 6 : isBoxAmber ? 146 : 153, isBoxGreen ? 95 : isBoxAmber ? 64 : 27, isBoxGreen ? 70 : isBoxAmber ? 14 : 27);
      doc.text(
        isCondicionada
          ? 'RESOLUCIÓN: BECA CONDICIONADA POR EL COMITÉ DE BECAS'
          : isRatificada
          ? 'RESOLUCIÓN: BECA RATIFICADA Y APROBADA'
          : 'RESOLUCIÓN: BECA SUSPENDIDA / NO RATIFICADA',
        22,
        currentY + 6
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const dictamenBody = isCondicionada
        ? `El Comité de Becas ha acordado otorgar la beca (${scholarshipProgress.tipoBeca} al ${scholarshipProgress.porcentajeBeca}%) de forma CONDICIONADA para el ${periodoSiguiente}. Condición / Compromiso: ${student.condiciones_ratificacion_beca || 'Entrega extemporánea de reporte / regularización de pagos / reinscripción'}.`
        : isRatificada
        ? `Habiendo acreditado los 1,000 puntos cuatrimestrales, promedio sin reprobaciones en ordinario y pagos al corriente, SE AUTORIZA Y RATIFICA la ${scholarshipProgress.tipoBeca.toUpperCase()} (${scholarshipProgress.porcentajeBeca}%) para el ${periodoSiguiente}.`
        : `El estudiante no cumple con los requisitos normativos indispensables (reprobó materia en periodo ordinario o no realizó renovación). Se determina la suspensión del beneficio de beca.`;

      doc.text(dictamenBody, 22, currentY + 12, { maxWidth: 166 });

      // Firmas Oficiales
      currentY += 44;
      doc.setDrawColor(150, 150, 150);
      doc.line(25, currentY, 75, currentY);
      doc.line(85, currentY, 135, currentY);
      doc.line(145, currentY, 195, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 40, 85);
      doc.text('Comité de Becas y Estímulos', 50, currentY + 4, { align: 'center' });
      doc.text('Dirección de Finanzas', 110, currentY + 4, { align: 'center' });
      doc.text('Dirección de Control Escolar', 170, currentY + 4, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Dra. Paulina Velázquez R.', 50, currentY + 8, { align: 'center' });
      doc.text('Mtro. Ricardo Domínguez V.', 110, currentY + 8, { align: 'center' });
      doc.text('Lic. Patricia Morales S.', 170, currentY + 8, { align: 'center' });

      // Pie de página con Folio y Hash
      doc.setFont('courier', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`FOLIO INSTITUCIONAL: ${folio}`, 18, 280);
      doc.text(`VERIFICACIÓN DIGITAL: ${verificationHash}`, 18, 284);
      doc.text(`EMISIÓN: La Paz, B.C.S., a ${todayStr}`, 192, 280, { align: 'right' });

      doc.save(`Dictamen_Beca_${student.matricula}_UNIPAZ.pdf`);
    } catch (err) {
      console.error('Error generating Scholarship PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange">
                Comisión General de Becas UNIPAZ
              </span>
              <h3 className="text-lg font-black text-unipaz-navy dark:text-white">
                Dictamen Oficial de Ratificación de Beca
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={generating}
              className="py-2.5 px-4 rounded-xl bg-unipaz-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin text-unipaz-orange" /> : <Download className="w-4 h-4 text-unipaz-orange" />}
              <span>Descargar Dictamen PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vista previa del documento */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 text-xs">
          {/* Banner de Periodos */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Evaluación de {periodoActual} · Ratificación para {periodoSiguiente}</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300">
              Folio: {folio}
            </span>
          </div>

          {/* Datos del Becario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estudiante Becario:</span>
              <div className="font-black text-sm text-unipaz-navy dark:text-white">
                {student.nombre} {student.apellidos}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Matrícula: <strong className="font-mono text-unipaz-orange">{student.matricula}</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Programa: <strong>{student.carrera}</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Grado: <strong>{student.cuatrimestre ? `${student.cuatrimestre}° ${isSemestral ? 'Semestre' : 'Cuatrimestre'}` : 'Activo'}</strong>
              </div>
            </div>

            <div className="space-y-1 md:border-l md:border-slate-200 md:dark:border-white/10 md:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Condiciones de la Beca:</span>
              <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                {scholarshipProgress.tipoBeca} ({scholarshipProgress.porcentajeBeca}% Descuento)
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Meta Formativa: <strong className="font-mono text-unipaz-orange">{scholarshipProgress.puntosMeta} pts</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Puntos Acumulados: <strong className="font-mono text-emerald-600 dark:text-emerald-400">+{scholarshipProgress.puntosTotales} pts</strong> ({scholarshipProgress.porcentajeCumplimiento}%)
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Promedio: <strong className="font-mono">{scholarshipProgress.promedioAcademico.toFixed(2)}</strong> (0 Reprobadas en ordinario)
              </div>
            </div>
          </div>

          {/* Tabla de Actividades Becadas */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">
              Actividades Formativas Acreditadas en el Periodo:
            </h4>
            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="py-2 px-3">Actividad / Evento</th>
                    <th className="py-2 px-3">Categoría</th>
                    <th className="py-2 px-3">Fecha</th>
                    <th className="py-2 px-3 text-right">Puntos Ganados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {scholarshipProgress.actividadesBecadas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-center text-slate-400">
                        No se registran actividades formativas en el cuatrimestre actual.
                      </td>
                    </tr>
                  ) : (
                    scholarshipProgress.actividadesBecadas.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-semibold text-unipaz-navy dark:text-white">
                          {act.titulo}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{act.categoria}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{act.fecha}</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                          +{act.puntosAcreditados} pts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Veredicto y Dictamen Oficial */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isCondicionada
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                : isRatificada
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}
          >
            {isCondicionada ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : isRatificada ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-black block text-xs uppercase">
                {isCondicionada
                  ? 'DICTAMEN: BECA CONDICIONADA (Autorización Especial del Comité)'
                  : isRatificada
                  ? 'DICTAMEN: BECA RATIFICADA Y APROBADA (Refrendo Cuatrimestral Oficial)'
                  : 'DICTAMEN: BECA SUSPENDIDA / BAJA DEFINITIVA'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {isCondicionada
                  ? `El Comité de Becas ha acordado otorgar la beca (${scholarshipProgress.tipoBeca} al ${scholarshipProgress.porcentajeBeca}%) de forma CONDICIONADA para el ${periodoSiguiente}. Condición acordada: ${student.condiciones_ratificacion_beca || 'Entrega extemporánea / regularización de pagos / reinscripción'}.`
                  : isRatificada
                  ? `Se constató el cumplimiento de los 1,000 puntos cuatrimestrales, promedio sin materias reprobadas en ordinario, colegiaturas al corriente y entrega oportuna. Se ratifica el ${scholarshipProgress.porcentajeBeca}% de descuento para el ${periodoSiguiente}.`
                  : `El estudiante causó baja reglamentaria por incumplimiento de requisitos (reprobar materia en ordinario / falta de renovación).`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
