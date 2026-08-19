'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  downloadAttendancesTemplate,
  downloadEventsTemplate,
  downloadStudentsTemplate,
  parseAttendancesFile,
  parseEventsFile,
  parseStudentsFile,
  ParseValidationResult,
} from '@/lib/import-utils';
import { usePFI } from '@/lib/store';
import {
  CATALOGO_BECAS,
  CATALOGO_PROGRAMAS_ACADEMICOS,
  PFIEvent,
  UserProfile,
} from '@/lib/types';

export default function AdminImportarPage() {
  const {
    profiles,
    events,
    attendances,
    batchImportStudents,
    batchImportEvents,
    batchImportAttendances,
  } = usePFI();

  const [activeTab, setActiveTab] = useState<'estudiantes' | 'eventos' | 'asistencias'>('estudiantes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<ParseValidationResult<any> | null>(null);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  const students = profiles.filter((p) => p.role === 'estudiante');

  const handleTabSwitch = (tab: 'estudiantes' | 'eventos' | 'asistencias') => {
    setActiveTab(tab);
    setSelectedFile(null);
    setPreviewResult(null);
    setFeedback(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setFeedback(null);

    try {
      if (activeTab === 'estudiantes') {
        const res = await parseStudentsFile(file);
        setPreviewResult(res);
      } else if (activeTab === 'eventos') {
        const res = await parseEventsFile(file);
        setPreviewResult(res);
      } else {
        const res = await parseAttendancesFile(file, students, events);
        setPreviewResult(res);
      }
    } catch (err: any) {
      alert(`Error al procesar archivo: ${err.message || 'Formato no soportado'}`);
      setPreviewResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessImport = () => {
    if (!previewResult || previewResult.valid.length === 0) {
      alert('No hay registros válidos para procesar.');
      return;
    }

    setIsProcessing(true);

    try {
      if (activeTab === 'estudiantes') {
        const res = batchImportStudents(previewResult.valid);
        setFeedback({
          success: true,
          title: '¡Carga Masiva de Alumnos y Becas Exitosa!',
          message: res.message,
        });
      } else if (activeTab === 'eventos') {
        const res = batchImportEvents(previewResult.valid);
        setFeedback({
          success: true,
          title: '¡Catálogo de Eventos Formativos Importado!',
          message: res.message,
        });
      } else {
        const res = batchImportAttendances(previewResult.valid);
        setFeedback({
          success: true,
          title: '¡Horas PFI y Puntos de Beca Acreditados!',
          message: res.message,
        });
      }
      setPreviewResult(null);
      setSelectedFile(null);
    } catch (err: any) {
      setFeedback({
        success: false,
        title: 'Error al importar datos',
        message: err.message || 'Ocurrió un error inesperado al guardar.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Administración Central UNIPAZ
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">Excel / CSV Batch Processing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Descarga de Plantillas & Carga Masiva de Datos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Importa nóminas completas de estudiantes con becas, actualiza el catálogo de actividades formativas y acredita horas PFI y puntos de beca en lote.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/configuracion"
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configurador PFI</span>
          </Link>
          <Link
            href="/admin/becas"
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-unipaz-orange text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-unipaz-orange" />
            <span>Gestión de Becas</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Padrón de Estudiantes</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{students.length}</div>
          <p className="text-[11px] text-slate-400">
            {students.filter((s) => s.tiene_beca).length} becarios registrados
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Catálogo de Actividades</span>
            <Calendar className="w-5 h-5 text-unipaz-orange" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{events.length}</div>
          <p className="text-[11px] text-slate-400">
            Talleres, simposios y foros disponibles
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Asistencias & Acreditaciones</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{attendances.length}</div>
          <p className="text-[11px] text-slate-400">
            Pases de lista y registros con horas/puntos
          </p>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-5 rounded-3xl border text-xs animate-fadeIn flex items-start gap-3 shadow-md ${
            feedback.success
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="font-black text-sm">{feedback.title}</h4>
            <p className="text-xs opacity-90">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* TABS DE SELECCIÓN */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => handleTabSwitch('estudiantes')}
          className={`py-2.5 px-5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'estudiantes'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          1. Estudiantes & Becas
        </button>

        <button
          onClick={() => handleTabSwitch('eventos')}
          className={`py-2.5 px-5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'eventos'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Calendar className="w-4 h-4" />
          2. Catálogo de Eventos Formativos
        </button>

        <button
          onClick={() => handleTabSwitch('asistencias')}
          className={`py-2.5 px-5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'asistencias'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          3. Horas PFI & Puntos de Beca
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: DESCARGA DE PLANTILLA Y EXPLICACIÓN */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
              <Download className="w-5 h-5 text-unipaz-orange" />
              Descargar Plantilla Oficial
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Descarga la hoja de cálculo con el formato predeterminado, nombres de columna y ejemplos validados para capturar tus datos sin errores.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400 font-mono">
              <div className="font-sans font-bold text-unipaz-navy dark:text-white text-xs">
                Campos incluidos:
              </div>
              {activeTab === 'estudiantes' && (
                <div>
                  • Matrícula, Nombre, Apellido Paterno, Apellido Materno, Programa Académico, Cuatrimestre o Semestre, Periodo Ingreso, Email, Sexo, Tiene Beca (SI/NO), Promedio Académico.
                </div>
              )}
              {activeTab === 'eventos' && (
                <div>
                  • Número de Actividad, Nombre de la Actividad, Categoría, Fecha Inicio, Fecha Fin, Responsable de la Actividad, Horas PFI, Puntos Beca, Lugar o Modalidad.
                </div>
              )}
              {activeTab === 'asistencias' && (
                <div>
                  • Matrícula, Número de Actividad, Estatus (asistió/incompleto/cancelado), Rol (asistente/staff), Horas PFI, Puntos Beca, Observaciones.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'estudiantes') downloadStudentsTemplate('xlsx');
                else if (activeTab === 'eventos') downloadEventsTemplate('xlsx');
                else downloadAttendancesTemplate('xlsx');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Descargar Plantilla Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'estudiantes') downloadStudentsTemplate('csv');
                else if (activeTab === 'eventos') downloadEventsTemplate('csv');
                else downloadAttendancesTemplate('csv');
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              Descargar Formato CSV
            </button>
          </div>
        </div>

        {/* COLUMNA 2: DROPZONE DE CARGA Y PARSEO */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
            <Upload className="w-5 h-5 text-unipaz-orange" />
            Cargar Archivo Diligenciado
          </div>

          <label className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-unipaz-orange rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 group text-center min-h-[180px]">
            <Upload className="w-12 h-12 text-slate-400 group-hover:text-unipaz-orange transition-colors mb-3" />
            <span className="text-xs font-black text-unipaz-navy dark:text-white">
              {selectedFile ? selectedFile.name : 'Haz clic o arrastra tu archivo Excel / CSV aquí'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Detección automática de encabezados y mapeo inteligente de datos.
            </span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {isProcessing && (
            <div className="text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-unipaz-orange" />
              Procesando y validando filas del archivo...
            </div>
          )}
        </div>
      </div>

      {/* PREVISUALIZACIÓN DE FILAS Y BOTÓN DE INYECCIÓN */}
      {previewResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                Previsualización de Datos ({previewResult.total} filas leídas)
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                ✓ {previewResult.valid.length} Válidas
              </span>
              {previewResult.invalid.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-black">
                  ✕ {previewResult.invalid.length} con Errores
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isProcessing || previewResult.valid.length === 0}
              onClick={handleProcessImport}
              className="py-3 px-8 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-unipaz-orange" />
              {isProcessing ? 'Guardando...' : `Confirmar e Importar ${previewResult.valid.length} Registros`}
            </button>
          </div>

          {/* Errores */}
          {previewResult.invalid.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/30 space-y-2 text-xs text-rose-900 dark:text-rose-200 max-h-40 overflow-y-auto">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Filas con errores de validación (se omitirán al importar):
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                {previewResult.invalid.map((inv, i) => (
                  <li key={i}>
                    <strong>Fila {inv.row}:</strong> {inv.errors.join(' | ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabla de Muestra */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto text-xs">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 sticky top-0">
                <tr>
                  {activeTab === 'estudiantes' && (
                    <>
                      <th className="py-2.5 px-3">Matrícula</th>
                      <th className="py-2.5 px-3">Nombre Completo</th>
                      <th className="py-2.5 px-3">Programa Académico</th>
                      <th className="py-2.5 px-3">Grado</th>
                      <th className="py-2.5 px-3">Beca</th>
                      <th className="py-2.5 px-3">Labor Depto.</th>
                    </>
                  )}
                  {activeTab === 'eventos' && (
                    <>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Título</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Fecha & Horario</th>
                      <th className="py-2.5 px-3">Horas PFI</th>
                      <th className="py-2.5 px-3">Puntos Beca</th>
                    </>
                  )}
                  {activeTab === 'asistencias' && (
                    <>
                      <th className="py-2.5 px-3">Estudiante</th>
                      <th className="py-2.5 px-3">Evento</th>
                      <th className="py-2.5 px-3">Estatus</th>
                      <th className="py-2.5 px-3">Rol</th>
                      <th className="py-2.5 px-3">Horas PFI Acreditadas</th>
                      <th className="py-2.5 px-3">Puntos Beca</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {previewResult.valid.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {activeTab === 'estudiantes' && (
                      <>
                        <td className="py-2.5 px-3 font-mono font-bold text-unipaz-orange">{row.matricula}</td>
                        <td className="py-2.5 px-3 font-bold">{row.nombre} {row.apellidos}</td>
                        <td className="py-2.5 px-3 truncate max-w-[200px]">{row.carrera}</td>
                        <td className="py-2.5 px-3">{row.cuatrimestre}° Cuatr.</td>
                        <td className="py-2.5 px-3">
                          {row.tiene_beca ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-black text-[10px]">
                              {row.porcentaje_beca}% Descuento
                            </span>
                          ) : (
                            <span className="text-slate-400">Sin Beca</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.es_becario_departamental ? (
                            <span className="text-blue-600 font-bold">{row.departamento_beca} ({row.horas_departamentales_semanales || 10}h/sem)</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </>
                    )}
                    {activeTab === 'eventos' && (
                      <>
                        <td className="py-2.5 px-3 font-mono font-bold text-unipaz-orange">{row.id}</td>
                        <td className="py-2.5 px-3 font-bold truncate max-w-[220px]">{row.titulo}</td>
                        <td className="py-2.5 px-3">{row.categoria}</td>
                        <td className="py-2.5 px-3 font-mono">{row.fecha_evento} ({row.hora_inicio} - {row.hora_fin})</td>
                        <td className="py-2.5 px-3 font-bold text-unipaz-navy dark:text-blue-400">+{row.horas_pfi || 0} hrs</td>
                        <td className="py-2.5 px-3 font-bold text-amber-600">+{row.puntos_beca || 50} pts</td>
                      </>
                    )}
                    {activeTab === 'asistencias' && (
                      <>
                        <td className="py-2.5 px-3 font-bold">{row.nombre_estudiante} ({row.matricula})</td>
                        <td className="py-2.5 px-3 truncate max-w-[200px]">{row.titulo_evento}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">{row.status}</td>
                        <td className="py-2.5 px-3">{row.rol_participacion}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-unipaz-orange">+{row.horas_acreditadas} hrs</td>
                        <td className="py-2.5 px-3 font-mono font-black text-amber-600">+{row.puntos_beca_acreditados} pts</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GUÍA DE REFERENCIA: CATÁLOGOS OFICIALES PARA IMPORTACIÓN */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
          <BookOpen className="w-5 h-5 text-unipaz-orange" />
          <span>Guía Rápida de Claves Oficiales Reconocidas por el Importador</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Catálogo de Becas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
            <span className="font-black text-xs text-unipaz-navy dark:text-white block">
              🎟️ Claves de Beca (Columna "Tiene Beca" o "Clave Beca"):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
              {CATALOGO_BECAS.map((b) => (
                <div key={b.clave} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  <strong className="text-unipaz-orange">{b.clave}</strong>: {b.porcentaje}%
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * El importador también acepta valores como "SI", "SÍ", "20%", "50%", etc.
            </p>
          </div>

          {/* Catálogo de Programas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
            <span className="font-black text-xs text-unipaz-navy dark:text-white block">
              🏛️ Claves de Programas Académicos (Columna "Programa Académico"):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
              {CATALOGO_PROGRAMAS_ACADEMICOS.slice(0, 9).map((p) => (
                <div key={p.clave} className="p-1 rounded bg-slate-100 dark:bg-slate-900 truncate">
                  <strong className="text-blue-600">{p.clave}</strong>: {p.nombre.replace('LICENCIATURA EN ', 'LIC. ')}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * Puedes colocar la clave corta (ej. <strong>AD</strong>, <strong>LM</strong>, <strong>TS</strong>) o el nombre completo del programa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
