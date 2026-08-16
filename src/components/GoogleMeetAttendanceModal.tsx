'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Loader2,
  Lock,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { PFIEvent, UserProfile } from '@/lib/types';

interface GoogleMeetAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PFIEvent;
}

interface ParsedMeetRecord {
  id: string;
  rawName: string;
  rawEmail: string;
  rawDuration: string;
  durationMinutes: number;
  timeJoined: string;
  timeLeft: string;
  matchedStudent: UserProfile | null;
  attendancePercent: number;
  willAccredit: boolean;
}

export const GoogleMeetAttendanceModal: React.FC<GoogleMeetAttendanceModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { profiles, bulkAccreditFromMeet } = usePFI();

  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [minPercentage, setMinPercentage] = useState<number>(80);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [resultFeedback, setResultFeedback] = useState<{
    accreditedCount: number;
    rejectedCount: number;
    message: string;
  } | null>(null);

  const [records, setRecords] = useState<ParsedMeetRecord[]>([]);

  // Duración nominal del evento calculada a partir de hora_inicio y hora_fin
  const eventDurationMinutes = useMemo(() => {
    const [startH, startM] = event.hora_inicio.split(':').map(Number);
    const [endH, endM] = event.hora_fin.split(':').map(Number);
    let totalMinutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
    if (totalMinutes <= 0) totalMinutes = 120; // 2 hrs default
    return totalMinutes;
  }, [event.hora_inicio, event.hora_fin]);

  if (!isOpen) return null;

  // Helper para convertir cadenas de duración variadas a minutos
  const parseDurationStringToMinutes = (raw: string): number => {
    if (!raw) return 0;
    const clean = raw.trim().toLowerCase();

    // Formato HH:MM:SS
    if (clean.includes(':')) {
      const parts = clean.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }

    // Formato "1 hr 20 min" o "85 mins"
    let mins = 0;
    const hrMatch = clean.match(/(\d+)\s*(?:hr|hora|h)/);
    const minMatch = clean.match(/(\d+)\s*(?:min|m)/);
    const secMatch = clean.match(/(\d+)\s*(?:sec|seg|s)/);

    if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) mins += parseInt(minMatch[1], 10);
    if (secMatch) mins += parseInt(secMatch[1], 10) / 60;

    if (mins > 0) return mins;

    // Solo número (ej. "95")
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Parsear el archivo CSV de Google Meet
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Encontrar índices de columnas dinámicamente
    const headerLine = lines[0].toLowerCase();
    const delimiter = headerLine.includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const nameIdx = headers.findIndex((h) => h.includes('nombre') || h.includes('name') || h.includes('participante'));
    const emailIdx = headers.findIndex((h) => h.includes('correo') || h.includes('email') || h.includes('e-mail'));
    const durIdx = headers.findIndex((h) => h.includes('duraci') || h.includes('duration') || h.includes('tiempo'));
    const joinIdx = headers.findIndex((h) => h.includes('unión') || h.includes('join') || h.includes('inicio'));
    const leftIdx = headers.findIndex((h) => h.includes('salida') || h.includes('left') || h.includes('fin'));

    const parsed: ParsedMeetRecord[] = [];
    const students = profiles.filter((p) => p.role === 'estudiante');

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (row.length < 2) continue;

      const rawName = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx] : row[0] || 'Desconocido';
      const rawEmail = (emailIdx !== -1 && row[emailIdx]) ? row[emailIdx] : row[1] || '';
      const rawDuration = (durIdx !== -1 && row[durIdx]) ? row[durIdx] : (row[2] || '0');
      const timeJoined = (joinIdx !== -1 && row[joinIdx]) ? row[joinIdx] : '10:00';
      const timeLeft = (leftIdx !== -1 && row[leftIdx]) ? row[leftIdx] : '12:00';

      const durationMinutes = Math.round(parseDurationStringToMinutes(rawDuration) * 10) / 10;
      const attendancePercent = Math.min(100, Math.round((durationMinutes / eventDurationMinutes) * 100));

      // Match con base de datos de estudiantes
      let matchedStudent: UserProfile | null = null;
      if (rawEmail) {
        matchedStudent = students.find((s) => s.email.toLowerCase() === rawEmail.toLowerCase()) || null;
      }
      if (!matchedStudent && rawName) {
        const cleanName = rawName.toLowerCase();
        matchedStudent =
          students.find((s) => {
            const fullName = `${s.nombre} ${s.apellidos}`.toLowerCase();
            return fullName.includes(cleanName) || cleanName.includes(s.nombre.toLowerCase());
          }) || null;
      }

      parsed.push({
        id: `meet-rec-${i}-${Date.now()}`,
        rawName,
        rawEmail,
        rawDuration,
        durationMinutes,
        timeJoined,
        timeLeft,
        matchedStudent,
        attendancePercent,
        willAccredit: attendancePercent >= minPercentage && matchedStudent !== null,
      });
    }

    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      const parsed = parseCsvText(text);
      setRecords(parsed);
      setResultFeedback(null);
    };
    reader.readAsText(file);
  };

  // Cargar datos simulados reales de Google Meet para pruebas inmediatas
  const loadDemoData = () => {
    setFileName('meet_asistencia_simposio_unipaz_demo.csv');
    const demoCsv = `Nombre,Correo electrónico,Duración,Hora de unión,Hora de salida
Valeria Morales Ramos,valeria.morales@unipaz.edu.mx,1 hr 55 min,10:02,11:57
Carlos Eduardo Ruiz,carlos.ruiz@unipaz.edu.mx,1 hr 48 min,10:05,11:53
Ana Sofía Mendoza,ana.mendoza@unipaz.edu.mx,1 hr 50 min,10:01,11:51
Mateo Fernando Castillo,mateo.castillo@unipaz.edu.mx,1 hr 45 min,10:08,11:53
Mariana Guadalupe Domínguez,mariana.dominguez@unipaz.edu.mx,1 hr 40 min,10:12,11:52
Diego Alejandro Navarro,diego.navarro@unipaz.edu.mx,15 min,10:02,10:17
Invitado Externo La Paz,contacto@externo.org,1 hr 30 min,10:15,11:45`;

    setCsvContent(demoCsv);
    const parsed = parseCsvText(demoCsv);
    setRecords(parsed);
    setResultFeedback(null);
  };

  // Actualizar umbral y recalcular `willAccredit`
  const handleThresholdChange = (newThreshold: number) => {
    setMinPercentage(newThreshold);
    setRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        willAccredit: rec.attendancePercent >= newThreshold && rec.matchedStudent !== null,
      }))
    );
  };

  const handleToggleRecord = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, willAccredit: !r.willAccredit } : r))
    );
  };

  // Ejecutar Acreditación Masiva en el Store
  const handleExecuteBulkAccredit = () => {
    setProcessing(true);

    const validRecords = records
      .filter((r) => r.matchedStudent !== null)
      .map((r) => ({
        studentId: r.matchedStudent!.id,
        durationMinutes: r.durationMinutes,
        attendancePercent: r.attendancePercent,
        accredit: r.willAccredit,
        meetEmail: r.rawEmail,
        meetName: r.rawName,
      }));

    const res = bulkAccreditFromMeet(event.id, validRecords);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF6600', '#10B981'],
    });

    setResultFeedback(res);
    setProcessing(false);
  };

  const filteredRecords = records.filter(
    (r) =>
      r.rawName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rawEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.matchedStudent && r.matchedStudent.matricula.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const accreditedCount = records.filter((r) => r.willAccredit).length;
  const rejectedCount = records.filter((r) => !r.willAccredit && r.matchedStudent !== null).length;
  const unmatchedCount = records.filter((r) => r.matchedStudent === null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-300">
                  Google Workspace for Education
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Duración Evento: {eventDurationMinutes} min
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-unipaz-navy dark:text-white mt-0.5">
                Auditoría & Acreditación Masiva desde Google Meet (CSV)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                Actividad: <strong className="text-unipaz-orange">{event.titulo}</strong> (+{event.horas_pfi} hrs)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK TRAS ACREDITACIÓN EXITOSA */}
        {resultFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between animate-fadeIn text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-black text-emerald-900 dark:text-emerald-200 block text-sm">
                  ¡Acreditación Masiva Procesada con Éxito!
                </span>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {resultFeedback.message}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Listo / Salir
            </button>
          </div>
        )}

        {/* ÁREA DE CARGA DE ARCHIVO & CONFIGURACIÓN DE UMBRAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Subir Archivo */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-white/20 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-black uppercase text-unipaz-navy dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-unipaz-orange" />
                Cargar Reporte de Asistencia de Meet (.csv)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Sube el archivo CSV exportado automáticamente por Google Meet al finalizar la videollamada institucional.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="py-2.5 px-4 rounded-xl bg-unipaz-navy dark:bg-unipaz-cobalt hover:bg-opacity-90 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow-sm transition-all hover:scale-105">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Seleccionar CSV de Meet
                <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={loadDemoData}
                type="button"
                className="py-2.5 px-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Cargar Archivo de Prueba (Demo)
              </button>

              {fileName && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {fileName}
                </span>
              )}
            </div>
          </div>

          {/* Configuración de Umbral */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-black uppercase text-unipaz-navy dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-unipaz-orange" />
                Umbral Mínimo de Permanencia
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Porcentaje mínimo de conexión requerido para liberar las horas oficiales.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Exigencia mínima:</span>
                <span className="font-mono font-black text-unipaz-orange text-sm">
                  {minPercentage}% ({Math.round((eventDurationMinutes * minPercentage) / 100)} min)
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={minPercentage}
                onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
                className="w-full accent-unipaz-orange cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>50% (Flexible)</span>
                <span>80% (Estándar PFI)</span>
                <span>95% (Estricto)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE AUDITORÍA Y MATCHING EN VIVO */}
        {records.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Contadores */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Total Detectados: <strong className="text-unipaz-navy dark:text-white">{records.length}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  ✓ Acreditan: {accreditedCount}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                  ❌ No Acreditan: {rejectedCount}
                </span>
                {unmatchedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                    ⚠️ Sin Match PFI: {unmatchedCount}
                  </span>
                )}
              </div>

              {/* Búsqueda */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en el reporte..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-unipaz-orange"
                />
              </div>
            </div>

            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Acción</th>
                    <th className="py-2.5 px-3">Estudiante UNIPAZ</th>
                    <th className="py-2.5 px-3">Registro en Meet</th>
                    <th className="py-2.5 px-3 text-center">Permanencia</th>
                    <th className="py-2.5 px-3 text-right">Dictamen de Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {filteredRecords.map((rec) => {
                    const std = rec.matchedStudent;

                    return (
                      <tr
                        key={rec.id}
                        className={`transition-colors ${
                          rec.willAccredit
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                            : 'bg-white dark:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={rec.willAccredit}
                            onChange={() => handleToggleRecord(rec.id)}
                            disabled={!std}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {std ? (
                            <div>
                              <div className="font-bold text-unipaz-navy dark:text-white flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                {std.nombre} {std.apellidos}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Matrícula: {std.matricula} · {std.carrera}
                              </div>
                            </div>
                          ) : (
                            <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              No coincide con la matrícula
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">{rec.rawName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{rec.rawEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-mono font-bold text-unipaz-navy dark:text-white">
                            {rec.durationMinutes} min ({rec.attendancePercent}%)
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Entró: {rec.timeJoined} · Salió: {rec.timeLeft}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {rec.willAccredit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Acreditar (+{event.horas_pfi}h)
                            </span>
                          ) : !std ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                              Ignorado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Permanencia &lt; {minPercentage}% (0h)
                            </span>
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

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-300"
          >
            Cancelar
          </button>

          {records.length > 0 && (
            <button
              onClick={handleExecuteBulkAccredit}
              disabled={processing || accreditedCount === 0}
              className={`w-full sm:w-auto py-3 px-6 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                accreditedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Procesar y Acreditar Horas a {accreditedCount} Estudiantes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
