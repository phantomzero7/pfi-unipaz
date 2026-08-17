'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  Award,
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

  const isRenovada = scholarshipProgress.puntosTotales >= (student.puntos_beca_meta_cuatrimestral || 1000);

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
      doc.text('DICTAMEN OFICIAL DE EVALUACIÓN Y RENOVACIÓN DE BECA', 105, 47, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`CICLO EVALUATIVO CUATRIMESTRAL ${new Date().getFullYear()}`, 105, 52, { align: 'center' });

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
      doc.text(`Grado: ${student.cuatrimestre ? `${student.cuatrimestre}° Cuatrimestre` : 'Activo'}`, 22, 85);
      doc.text(`Promedio Académico: ${scholarshipProgress.promedioAcademico.toFixed(2)}`, 22, 90);

      // Columna derecha datos beca
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES DEL BENEFICIO:', 115, 64);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tipo de Beca: ${scholarshipProgress.tipoBeca}`, 115, 70);
      doc.text(`Porcentaje Asignado: ${scholarshipProgress.porcentajeBeca}% de Descuento`, 115, 75);
      doc.text(`Meta Cuatrimestral: ${scholarshipProgress.puntosMeta} Puntos`, 115, 80);
      doc.text(`Puntos Obtenidos: ${scholarshipProgress.puntosTotales} Puntos`, 115, 85);
      doc.text(`Estatus: ${scholarshipProgress.estatusTexto}`, 115, 90);

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
      doc.setFillColor(isRenovada ? 236 : 254, isRenovada ? 253 : 242, isRenovada ? 245 : 242);
      doc.rect(18, currentY, 174, 24, 'F');
      doc.setDrawColor(isRenovada ? 16 : 244, isRenovada ? 185 : 63, isRenovada ? 129 : 94);
      doc.rect(18, currentY, 174, 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isRenovada ? 6 : 153, isRenovada ? 95 : 27, isRenovada ? 70 : 27);
      doc.text('RESOLUCIÓN DE LA COMISIÓN DE BECAS:', 22, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        isRenovada
          ? `Habiendo acreditado el mínimo reglamentario de 1,000 puntos cuatrimestrales y manteniendo el promedio académico requerido, SE AUTORIZA Y RATIFICA LA RENOVACIÓN de la ${scholarshipProgress.tipoBeca.toUpperCase()} (${scholarshipProgress.porcentajeBeca}%) para el siguiente ciclo escolar.`
          : `El estudiante cuenta con ${scholarshipProgress.puntosTotales} puntos de los 1,000 requeridos (${scholarshipProgress.porcentajeCumplimiento}%). Debe completar las actividades formativas pendientes antes del cierre de actas para evitar la suspensión del beneficio.`,
        22,
        currentY + 12,
        { maxWidth: 166 }
      );

      // Firmas Oficiales
      currentY += 42;
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
              <h3 className="font-black text-base text-unipaz-navy dark:text-white">
                Dictamen Oficial de Cumplimiento y Renovación de Beca
              </h3>
              <p className="text-xs text-slate-500">
                Folio: <span className="font-mono font-bold text-unipaz-orange">{folio}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={generating}
              className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Descargar Dictamen PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VISTA PREVIA DEL DOCUMENTO OFICIAL */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 space-y-6 relative overflow-hidden text-xs">
          {/* Encabezado */}
          <div className="text-center space-y-1 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="relative w-14 h-14 mx-auto mb-1">
              <Image src="/logo-unipaz.png" alt="UNIPAZ" fill className="object-contain" />
            </div>
            <h2 className="text-lg font-black text-unipaz-navy dark:text-white uppercase">
              Universidad Internacional de La Paz
            </h2>
            <p className="text-[11px] font-bold text-unipaz-orange uppercase">
              Comisión General de Becas, Estímulos y Apoyos Universitarios
            </p>
            <p className="text-[10px] text-slate-500">
              Dirección de Administración, Finanzas y Control Escolar
            </p>
          </div>

          {/* Tarjeta de Datos del Becario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estudiante Becario:</span>
              <div className="font-black text-sm text-unipaz-navy dark:text-white">
                {student.nombre} {student.apellidos}
              </div>
              <div className="text-slate-500 font-mono">
                Matrícula: {student.matricula} · {student.carrera}
              </div>
              <div className="text-slate-500">
                Grado: {student.cuatrimestre ? `${student.cuatrimestre}° Cuatrimestre` : 'Activo'} · Promedio: <strong className="text-unipaz-navy dark:text-white">{scholarshipProgress.promedioAcademico.toFixed(2)}</strong>
              </div>
            </div>

            <div className="space-y-1 md:border-l md:border-slate-200 md:dark:border-white/10 md:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Condiciones de la Beca:</span>
              <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                {scholarshipProgress.tipoBeca} ({scholarshipProgress.porcentajeBeca}% Descuento)
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Meta Cuatrimestral: <strong className="font-mono text-unipaz-orange">{scholarshipProgress.puntosMeta} pts</strong>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Puntos Acumulados: <strong className="font-mono text-emerald-600 dark:text-emerald-400">+{scholarshipProgress.puntosTotales} pts</strong> ({scholarshipProgress.porcentajeCumplimiento}%)
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

          {/* Criterios Normativos de Validación */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">
              Verificación de Requisitos Reglamentarios para Refrendo Cuatrimestral:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className={scholarshipProgress.puntosTotales >= 1000 ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                  {scholarshipProgress.puntosTotales >= 1000 ? '✓' : '○'}
                </span>
                <span>Puntos Cuatrimestrales: <strong>{scholarshipProgress.puntosTotales} / 1,000 pts</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Promedio: <strong>{scholarshipProgress.promedioAcademico.toFixed(2)}</strong> (0 Reprobaciones / 0 Extraordinarios)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Estado Financiero: <strong>Colegiaturas al Corriente</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className={student.informe_becario_entregado ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                  {student.informe_becario_entregado ? '✓' : '○'}
                </span>
                <span>Refrendo Cuatrimestral e Informe: <strong>{student.informe_becario_entregado ? 'Entregado' : 'En proceso'}</strong></span>
              </div>
            </div>
          </div>

          {/* Veredicto de Renovación */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              student.refrendo_beca_aprobado_admin
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : scholarshipProgress.puntosTotales >= 1000
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            {student.refrendo_beca_aprobado_admin ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : scholarshipProgress.puntosTotales >= 1000 ? (
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-black block text-xs uppercase">
                {student.refrendo_beca_aprobado_admin
                  ? 'Dictamen Favorable de Renovación (Aprobado por Administración)'
                  : scholarshipProgress.puntosTotales >= 1000
                  ? 'Puntos Cuatrimestrales Completados (Expediente en Revisión Administrativa)'
                  : 'Proceso de Acumulación de Puntos Cuatrimestrales en Curso'}
              </span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                {student.refrendo_beca_aprobado_admin
                  ? `La Administración ha verificado el cumplimiento total de los requisitos: 1,000 puntos cuatrimestrales, promedio reglamentario sin reprobaciones, pagos en tiempo y forma y entrega de informe. Se ratifica el ${scholarshipProgress.porcentajeBeca}% de descuento en colegiatura para el siguiente ciclo escolar.`
                  : scholarshipProgress.puntosTotales >= 1000
                  ? `El estudiante ha alcanzado los 1,000 puntos cuatrimestrales. Su expediente se encuentra en proceso de revisión por la Administración al término del ciclo para constatar que no existan reprobaciones, adeudos ni sanciones antes de liberar el dictamen definitivo.`
                  : `El estudiante acumula ${scholarshipProgress.puntosTotales} de 1,000 puntos cuatrimestrales requeridos (${scholarshipProgress.porcentajeCumplimiento}%). Le restan ${scholarshipProgress.puntosMeta - scholarshipProgress.puntosTotales} puntos para cumplir con el eje formativo de becas.`}
              </p>
            </div>
          </div>

          {/* Firmas */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-4 text-center text-[10px]">
            <div className="space-y-1">
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Comité de Becas
              </div>
              <div className="text-slate-400">Dra. Paulina Velázquez R.</div>
            </div>
            <div className="space-y-1">
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Dirección de Finanzas
              </div>
              <div className="text-slate-400">Mtro. Ricardo Domínguez V.</div>
            </div>
            <div className="space-y-1">
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Control Escolar
              </div>
              <div className="text-slate-400">Lic. Patricia Morales S.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
