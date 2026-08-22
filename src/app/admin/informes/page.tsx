'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { exportStudentsToCsv, exportStudentsToExcel } from '@/lib/export-utils';
import { usePFI } from '@/lib/store';
import { UserProfile } from '@/lib/types';

export default function AdminInformesPage() {
  const {
    profiles,
    events,
    attendances,
    pfiConfig,
    getStudentProgress,
    getStudentScholarshipProgress,
  } = usePFI();

  const [reportType, setReportType] = useState<
    'padron_general' | 'becarios' | 'riesgo' | 'titulacion' | 'servicio_becario' | 'asistencias'
  >('padron_general');

  const [selectedCarrera, setSelectedCarrera] = useState<string>('todas');
  const [selectedCuatri, setSelectedCuatri] = useState<string>('todos');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('todos');
  const [selectedSexo, setSelectedSexo] = useState<string>('todos');
  const [selectedEstatus, setSelectedEstatus] = useState<'activos' | 'todos' | 'bajas'>('activos');
  const [searchTerm, setSearchTerm] = useState('');

  const students = useMemo(() => profiles.filter((p) => p.role === 'estudiante'), [profiles]);

  // Lista única de carreras
  const carrerasList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.carrera) set.add(s.carrera);
    });
    return Array.from(set);
  }, [students]);

  // Periodo activo
  const activePeriod = useMemo(() => {
    return pfiConfig.periodosAcademicos?.find((p) => p.es_actual) || { codigo: '187', nombre: 'Mayo - Agosto 2026' };
  }, [pfiConfig.periodosAcademicos]);

  // Dataset filtrado dinámicamente según el reporte seleccionado
  const reportData = useMemo(() => {
    return students.filter((s) => {
      // Filtros básicos
      if (selectedCarrera !== 'todas' && s.carrera !== selectedCarrera) return false;
      if (selectedCuatri !== 'todos' && String(s.cuatrimestre) !== selectedCuatri) return false;
      if (selectedSexo !== 'todos' && (s.sexo || 'Hombre') !== selectedSexo) return false;

      const isInactive = s.activo === false || s.estatus_inscripcion === 'baja_temporal' || s.estatus_inscripcion === 'baja_definitiva';
      if (selectedEstatus === 'activos' && isInactive) return false;
      if (selectedEstatus === 'bajas' && !isInactive) return false;

      const q = searchTerm.toLowerCase();
      const matchSearch =
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        s.carrera.toLowerCase().includes(q);

      if (!matchSearch) return false;

      const prog = getStudentProgress(s.id);
      const sch = getStudentScholarshipProgress(s.id);
      const cuatri = s.cuatrimestre || 1;

      if (reportType === 'padron_general') return true;
      if (reportType === 'becarios') return s.tiene_beca;
      if (reportType === 'riesgo') return cuatri >= 6 && prog.horasTotales < 200;
      if (reportType === 'titulacion') return prog.isAcreditado;
      if (reportType === 'servicio_becario') return s.tiene_beca && s.es_becario_departamental;
      if (reportType === 'asistencias') return attendances.some((a) => a.student_id === s.id);

      return true;
    });
  }, [
    students,
    reportType,
    selectedCarrera,
    selectedCuatri,
    selectedSexo,
    selectedEstatus,
    searchTerm,
    getStudentProgress,
    getStudentScholarshipProgress,
    attendances,
  ]);

  // Exportación a Excel (.xlsx)
  const handleExportExcel = async () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    await exportStudentsToExcel(reportData, getStudentProgress, getStudentScholarshipProgress);
  };

  // Exportación a PDF Oficial Institucional
  const handleExportPdf = () => {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Marco y membrete
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setDrawColor(0, 40, 85);
    doc.setLineWidth(1);
    doc.rect(10, 10, 277, 190);
    doc.setDrawColor(255, 102, 0);
    doc.setLineWidth(0.4);
    doc.rect(12, 12, 273, 186);

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 40, 85);
    doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ', 148.5, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(255, 102, 0);
    doc.text('DIRECCIÓN DE EXTENSIÓN Y DIFUSIÓN UNIVERSITARIA · PROGRAMA FORMATIVO INTEGRAL', 148.5, 27, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 40, 85);

    const reportTitles: Record<string, string> = {
      padron_general: 'PADRÓN GENERAL DE ESTUDIANTES Y REGISTRO DE HORAS PFI',
      becarios: 'PADRÓN OFICIAL DE ESTUDIANTES BECARIOS Y PUNTOS FORMATIVOS',
      riesgo: 'INFORME DE ESTUDIANTES EN ALERTA DE REZAGO FORMATIVO (<200 HRS)',
      titulacion: 'PADRÓN DE ESTUDIANTES LIBERADOS PARA TRÁMITE DE TITULACIÓN (≥400 HRS)',
      servicio_becario: 'PADRÓN DE SERVICIO BECARIO DEPARTAMENTAL INSTITUCIONAL',
      asistencias: 'REPORTE CONSOLIDADO DE PARTICIPACIÓN EN ACTIVIDADES PFI',
    };

    doc.text(reportTitles[reportType] || 'INFORME INSTITUCIONAL PFI', 148.5, 34, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Periodo Oficial: ${activePeriod.codigo} (${activePeriod.nombre}) · Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')} · Total Registros: ${reportData.length}`, 148.5, 39, { align: 'center' });

    // Tabla de Datos
    doc.setFillColor(0, 40, 85);
    doc.rect(16, 44, 265, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    doc.text('MATRÍCULA', 20, 49);
    doc.text('NOMBRE DEL ESTUDIANTE', 50, 49);
    doc.text('PROGRAMA ACADÉMICO', 120, 49);
    doc.text('GRADO', 180, 49);
    doc.text('HORAS PFI', 205, 49);
    doc.text('BECA / %', 230, 49);
    doc.text('ESTATUS', 260, 49);

    let y = 57;
    const maxPerPage = 18;
    const items = reportData.slice(0, maxPerPage);

    items.forEach((std, i) => {
      const prog = getStudentProgress(std.id);
      const sch = getStudentScholarshipProgress(std.id);

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(16, y - 4, 265, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);

      doc.text(std.matricula, 20, y);
      doc.text(`${std.nombre} ${std.apellidos}`.slice(0, 38), 50, y);
      doc.text(std.carrera.slice(0, 32), 120, y);
      doc.text(`${std.cuatrimestre || 1}° Cuatri`, 180, y);
      doc.text(`${prog.horasTotales.toFixed(1)} hrs`, 205, y);
      doc.text(std.tiene_beca ? `${std.porcentaje_beca}% (${sch.puntosTotales} pts)` : 'Sin beca', 230, y);
      doc.text(prog.isAcreditado ? 'ACREDITADO' : 'EN PROCESO', 260, y);

      y += 6.5;
    });

    // Firmas
    const fY = 180;
    doc.setDrawColor(150, 150, 150);
    doc.line(30, fY, 100, fY);
    doc.line(120, fY, 190, fY);
    doc.line(205, fY, 275, fY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0, 40, 85);
    doc.text('Dra. Paulina Velázquez R.', 65, fY + 4, { align: 'center' });
    doc.text('Mtro. Ricardo Domínguez V.', 155, fY + 4, { align: 'center' });
    doc.text('Lic. Patricia Morales S.', 240, fY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('Dirección de Extensión Universitaria', 65, fY + 7.5, { align: 'center' });
    doc.text('Comité General de Becas', 155, fY + 7.5, { align: 'center' });
    doc.text('Dirección de Control Escolar', 240, fY + 7.5, { align: 'center' });

    doc.save(`Informe_UNIPAZ_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Centro de Analíticas e Informes
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Creador de Informes y Listas Dinámicas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Genera padrones oficiales, listas de becarios y reportes de acreditación exportables en PDF formal y Excel (.xlsx).
          </p>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleExportExcel}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Descargar Excel (.xlsx)
          </button>

          <button
            onClick={handleExportPdf}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            Descargar PDF Oficial
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Informe */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'padron_general', label: 'Padrón General PFI', icon: Users, desc: 'Horas y estatus de todos' },
          { id: 'becarios', label: 'Padrón de Becarios', icon: Award, desc: '1,000 pts y ratificación' },
          { id: 'riesgo', label: 'Alerta de Rezago', icon: TrendingDown, desc: '<200h en 6° cuatri+' },
          { id: 'titulacion', label: 'Listos Titulación', icon: GraduationCap, desc: '≥400h con PVC' },
          { id: 'servicio_becario', label: 'Servicio Becario', icon: Building2, desc: 'Departamentos y cupos' },
          { id: 'asistencias', label: 'Participación Actividades', icon: Calendar, desc: 'Historial de eventos' },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = reportType === rep.id;

          return (
            <button
              key={rep.id}
              onClick={() => setReportType(rep.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-unipaz-navy dark:bg-white text-white dark:text-slate-950 border-unipaz-navy dark:border-white shadow-md scale-102'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-unipaz-orange text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isSelected
                  ? 'bg-unipaz-orange text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs block leading-tight">{rep.label}</strong>
                <span className={`text-[10px] block opacity-80 ${isSelected ? 'text-slate-200 dark:text-slate-700' : 'text-slate-400'}`}>
                  {rep.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtros Dinámicos */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-xs">
          <Filter className="w-4 h-4 text-unipaz-orange" />
          Filtros Dinámicos del Reporte ({reportData.length} resultados)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Estatus de Matrícula:</label>
            <select
              value={selectedEstatus}
              onChange={(e) => setSelectedEstatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="activos">✓ Solo Activos (Ciclo Actual)</option>
              <option value="todos">Todos (Histórico + Bajas)</option>
              <option value="bajas">⚠️ Solo Bajas Cuatrimestrales</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Programa / Carrera:</label>
            <select
              value={selectedCarrera}
              onChange={(e) => setSelectedCarrera(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="todas">Todas las carreras</option>
              {carrerasList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Cuatrimestre / Grado:</label>
            <select
              value={selectedCuatri}
              onChange={(e) => setSelectedCuatri(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="todos">Todos los cuatrimestres</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={String(n)}>{n}° Cuatri/Sem</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Desglose por Sexo:</label>
            <select
              value={selectedSexo}
              onChange={(e) => setSelectedSexo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="todos">Todos los sexos</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro / No especificado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Buscar por Nombre o Matrícula:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Escribe para filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vista Previa de la Tabla Dinámica */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-unipaz-navy dark:text-white">
              Vista Previa de la Lista Dinámica ({reportData.length} registros)
            </h3>
            <p className="text-xs text-slate-500">
              Datos listos para exportar con membrete institucional oficial y firmas.
            </p>
          </div>
        </div>

        {reportData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-white/10">
            No hay registros que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-4">
            {/* VISTA MÓVIL Y TABLET (CARDS COMPACTAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
              {reportData.map((std) => {
                const prog = getStudentProgress(std.id);
                const sch = getStudentScholarshipProgress(std.id);

                return (
                  <div
                    key={`mob-rep-${std.id}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-unipaz-navy dark:text-white text-xs font-black block">
                          {std.nombre} {std.apellidos}
                        </strong>
                        <span className="text-[10px] font-mono text-slate-400 block">{std.matricula} · {std.sexo || 'Hombre'}</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                          {std.carrera} · {std.cuatrimestre || 1}° Cuatri
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                        prog.escala === 'Sobresaliente'
                          ? 'bg-amber-100 text-amber-800'
                          : prog.escala === 'Satisfactorio'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prog.escala}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-white/5 text-[10px] text-center">
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Horas PFI</span>
                        <strong className="font-mono text-unipaz-orange text-xs">{prog.horasTotales.toFixed(1)}h</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Beca</span>
                        {std.tiene_beca ? (
                          <strong className="font-mono text-blue-600 text-xs">{std.porcentaje_beca}%</strong>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Sin Beca</span>
                        )}
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Titulación</span>
                        {prog.isAcreditado ? (
                          <strong className="text-emerald-600 text-[10px]">✓ Liberado</strong>
                        ) : (
                          <span className="text-slate-500 text-[10px]">En Proceso</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISTA DESKTOP (TABLA) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold">
                    <th className="py-3 px-3">Estudiante</th>
                    <th className="py-3 px-3">Sexo</th>
                    <th className="py-3 px-3">Carrera</th>
                    <th className="py-3 px-3">Grado</th>
                    <th className="py-3 px-3">Horas PFI</th>
                    <th className="py-3 px-3">Beca / Puntos</th>
                    <th className="py-3 px-3">Nivel Formativo</th>
                    <th className="py-3 px-3 text-right">Estatus Titulación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {reportData.map((std) => {
                    const prog = getStudentProgress(std.id);
                    const sch = getStudentScholarshipProgress(std.id);

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <strong className="text-unipaz-navy dark:text-white">{std.nombre} {std.apellidos}</strong>
                          <div className="text-[10px] font-mono text-slate-400">{std.matricula}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{std.sexo || 'Hombre'}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">{std.carrera}</td>
                        <td className="py-3 px-3">{std.cuatrimestre || 1}° Cuatri</td>
                        <td className="py-3 px-3 font-mono font-bold text-unipaz-orange">
                          {prog.horasTotales.toFixed(1)} hrs
                        </td>
                        <td className="py-3 px-3">
                          {std.tiene_beca ? (
                            <div>
                              <span className="font-bold text-blue-600">{std.porcentaje_beca}%</span>
                              <div className="text-[10px] text-slate-400">{sch.puntosTotales} / 1,000 pts</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin Beca</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prog.escala === 'Sobresaliente'
                              ? 'bg-amber-100 text-amber-800'
                              : prog.escala === 'Satisfactorio'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {prog.escala}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {prog.isAcreditado ? (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Liberado (≥400h)
                            </span>
                          ) : (
                            <span className="text-slate-400">En Proceso</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
