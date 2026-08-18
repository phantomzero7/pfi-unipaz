'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Users,
  X,
  XCircle,
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
import { PFIEvent, UserProfile } from '@/lib/types';

export type ImportType = 'estudiantes' | 'eventos' | 'asistencias';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ImportType;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'estudiantes',
}) => {
  const {
    profiles,
    events,
    batchImportStudents,
    batchImportEvents,
    batchImportAttendances,
  } = usePFI();

  const [activeType, setActiveType] = useState<ImportType>(defaultType);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<ParseValidationResult<any> | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setImportFeedback(null);

    try {
      if (activeType === 'estudiantes') {
        const res = await parseStudentsFile(file);
        setPreviewResult(res);
      } else if (activeType === 'eventos') {
        const res = await parseEventsFile(file);
        setPreviewResult(res);
      } else {
        const existingStudents = profiles.filter((p) => p.role === 'estudiante');
        const res = await parseAttendancesFile(file, existingStudents, events);
        setPreviewResult(res);
      }
    } catch (err: any) {
      alert(`Error al procesar archivo: ${err.message || 'Formato no soportado'}`);
      setPreviewResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = () => {
    if (!previewResult || previewResult.valid.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    setIsProcessing(true);

    try {
      if (activeType === 'estudiantes') {
        const res = batchImportStudents(previewResult.valid);
        setImportFeedback({
          success: true,
          message: '¡Carga Masiva de Estudiantes Exitosa!',
          details: res.message,
        });
      } else if (activeType === 'eventos') {
        const res = batchImportEvents(previewResult.valid);
        setImportFeedback({
          success: true,
          message: '¡Catálogo de Eventos Actualizado con Éxito!',
          details: res.message,
        });
      } else {
        const res = batchImportAttendances(previewResult.valid);
        setImportFeedback({
          success: true,
          message: '¡Horas PFI y Puntos de Beca Acreditados!',
          details: res.message,
        });
      }
      setPreviewResult(null);
      setSelectedFile(null);
    } catch (err: any) {
      setImportFeedback({
        success: false,
        message: 'Error al importar datos al sistema',
        details: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (type: ImportType) => {
    setActiveType(type);
    setSelectedFile(null);
    setPreviewResult(null);
    setImportFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 my-6 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-unipaz-navy to-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-unipaz-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
                Herramienta de Carga Masiva
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">CSV / Excel (.xlsx)</span>
            </div>
            <h3 className="text-xl font-black text-unipaz-navy dark:text-white mt-0.5">
              Carga Masiva de Datos & Plantillas Oficiales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Importa o actualiza estudiantes con becas, catálogo de actividades formativas y pases de lista masivos.
            </p>
          </div>
        </div>

        {/* Selector de Tipo de Carga Masiva */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('estudiantes')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeType === 'estudiantes'
                ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-unipaz-orange" />
            <span>Estudiantes & Becas</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('eventos')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeType === 'eventos'
                ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Eventos & Talleres</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('asistencias')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeType === 'asistencias'
                ? 'bg-white dark:bg-slate-900 text-unipaz-navy dark:text-white shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Horas PFI & Puntos de Beca</span>
          </button>
        </div>

        {/* FEEDBACK DE IMPORTACIÓN */}
        {importFeedback && (
          <div
            className={`p-4 rounded-2xl border text-xs animate-fadeIn flex items-start gap-3 ${
              importFeedback.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}
          >
            {importFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-black text-sm">{importFeedback.message}</div>
              {importFeedback.details && <div className="mt-1 opacity-90">{importFeedback.details}</div>}
            </div>
          </div>
        )}

        {/* PASO 1: DESCARGA DE PLANTILLA OFICIAL */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Paso 1: Descargar Formato Oficial
              </span>
              <h4 className="text-sm font-black text-unipaz-navy dark:text-white mt-0.5">
                {activeType === 'estudiantes' && 'Plantilla de Padrón Estudiantil con Becas'}
                {activeType === 'eventos' && 'Plantilla de Catálogo de Eventos con Horas & Puntos'}
                {activeType === 'asistencias' && 'Plantilla de Asistencias y Acreditación de Horas/Puntos'}
              </h4>
              <p className="text-xs text-slate-500">
                Usa este formato predeterminado con encabezados y ejemplos listos para capturar datos masivamente.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeType === 'estudiantes') downloadStudentsTemplate('xlsx');
                  else if (activeType === 'eventos') downloadEventsTemplate('xlsx');
                  else downloadAttendancesTemplate('xlsx');
                }}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeType === 'estudiantes') downloadStudentsTemplate('csv');
                  else if (activeType === 'eventos') downloadEventsTemplate('csv');
                  else downloadAttendancesTemplate('csv');
                }}
                className="py-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 hover:border-unipaz-orange text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* PASO 2: SUBIDA Y PARSING DEL ARCHIVO */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Paso 2: Subir Archivo Diligenciado (CSV o Excel)
          </span>

          <label className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-unipaz-orange rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 group">
            <Upload className="w-10 h-10 text-slate-400 group-hover:text-unipaz-orange transition-colors mb-2" />
            <span className="text-xs font-black text-unipaz-navy dark:text-white">
              {selectedFile ? selectedFile.name : 'Haz clic para seleccionar o arrastra tu archivo aquí'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Formatos soportados: .xlsx, .xls, .csv (Detección automática de columnas)
            </span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* PASO 3: PREVISUALIZACIÓN Y VALIDACIÓN EN TIEMPO REAL */}
        {previewResult && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-unipaz-navy dark:text-white">
                  Previsualización de Datos ({previewResult.total} filas leídas)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                  ✓ {previewResult.valid.length} Válidas para importar
                </span>
                {previewResult.invalid.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[10px] font-black">
                    ✕ {previewResult.invalid.length} con errores
                  </span>
                )}
              </div>
            </div>

            {/* Errores encontrados */}
            {previewResult.invalid.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/30 space-y-1.5 text-xs text-rose-900 dark:text-rose-200 max-h-36 overflow-y-auto">
                <div className="font-bold flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Filas con observaciones que no serán importadas:
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-1">
                  {previewResult.invalid.map((inv, i) => (
                    <li key={i}>
                      <strong>Fila {inv.row}:</strong> {inv.errors.join(' | ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabla de Muestra de Filas Válidas */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-56 overflow-y-auto text-xs">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 sticky top-0">
                  <tr>
                    {activeType === 'estudiantes' && (
                      <>
                        <th className="py-2 px-3">Matrícula</th>
                        <th className="py-2 px-3">Nombre Completo</th>
                        <th className="py-2 px-3">Programa Académico</th>
                        <th className="py-2 px-3">Grado</th>
                        <th className="py-2 px-3">Beca</th>
                      </>
                    )}
                    {activeType === 'eventos' && (
                      <>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Título</th>
                        <th className="py-2 px-3">Categoría</th>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Horas PFI</th>
                        <th className="py-2 px-3">Puntos Beca</th>
                      </>
                    )}
                    {activeType === 'asistencias' && (
                      <>
                        <th className="py-2 px-3">Estudiante</th>
                        <th className="py-2 px-3">Evento</th>
                        <th className="py-2 px-3">Estatus</th>
                        <th className="py-2 px-3">Horas Acreditadas</th>
                        <th className="py-2 px-3">Puntos Beca</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {previewResult.valid.slice(0, 15).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {activeType === 'estudiantes' && (
                        <>
                          <td className="py-2 px-3 font-mono font-bold text-unipaz-orange">{row.matricula}</td>
                          <td className="py-2 px-3 font-bold">{row.nombre} {row.apellidos}</td>
                          <td className="py-2 px-3 truncate max-w-[180px]">{row.carrera}</td>
                          <td className="py-2 px-3">{row.cuatrimestre}° Cuatr.</td>
                          <td className="py-2 px-3">
                            {row.tiene_beca ? (
                              <span className="text-amber-600 font-bold">{row.porcentaje_beca}% Descuento</span>
                            ) : (
                              <span className="text-slate-400">Sin Beca</span>
                            )}
                          </td>
                        </>
                      )}
                      {activeType === 'eventos' && (
                        <>
                          <td className="py-2 px-3 font-mono font-bold text-unipaz-orange">{row.id}</td>
                          <td className="py-2 px-3 font-bold truncate max-w-[200px]">{row.titulo}</td>
                          <td className="py-2 px-3">{row.categoria}</td>
                          <td className="py-2 px-3 font-mono">{row.fecha_evento}</td>
                          <td className="py-2 px-3 font-bold text-unipaz-navy dark:text-blue-400">+{row.horas_pfi || 0} hrs</td>
                          <td className="py-2 px-3 font-bold text-amber-600">+{row.puntos_beca || 50} pts</td>
                        </>
                      )}
                      {activeType === 'asistencias' && (
                        <>
                          <td className="py-2 px-3 font-bold">{row.nombre_estudiante} ({row.matricula})</td>
                          <td className="py-2 px-3 truncate max-w-[180px]">{row.titulo_evento}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-600">{row.status}</td>
                          <td className="py-2 px-3 font-bold text-unipaz-orange">+{row.horas_acreditadas} hrs</td>
                          <td className="py-2 px-3 font-bold text-amber-600">+{row.puntos_beca_acreditados} pts</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón de Ejecución de Carga */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Se procesarán <strong>{previewResult.valid.length}</strong> registros al hacer clic en importar.
              </span>
              <button
                type="button"
                disabled={isProcessing || previewResult.valid.length === 0}
                onClick={handleExecuteImport}
                className="py-3 px-8 rounded-2xl bg-unipaz-navy hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-950/20 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-unipaz-orange" />
                {isProcessing ? 'Procesando...' : `Importar ${previewResult.valid.length} Registros`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
