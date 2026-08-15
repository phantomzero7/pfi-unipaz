'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { usePFI } from '@/lib/store';
import { calculateStudentPFIProgress } from '@/lib/pfi-rules';
import { PFIEvent, UserProfile } from '@/lib/types';

export default function AdminEstudiantesDirectoryPage() {
  const { profiles, events, attendances, validateAttendanceManually, currentUser } = usePFI();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const students = profiles.filter((p) => p.role === 'estudiante');
  const eventsMap = new Map<string, PFIEvent>(events.map((e) => [e.id, e]));

  const filteredStudents = students.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.carrera.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentProgress = selectedStudent
    ? calculateStudentPFIProgress(
        attendances.filter((a) => a.student_id === selectedStudent.id),
        eventsMap
      )
    : null;

  const selectedStudentAttendances = selectedStudent
    ? attendances
        .filter((a) => a.student_id === selectedStudent.id)
        .map((att) => ({
          ...att,
          event: eventsMap.get(att.event_id),
        }))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-950/5 dark:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-unipaz-orange">
            Control Escolar y Titulación PFI
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-unipaz-navy dark:text-white mt-1">
          Directorio Estudiantil & Auditoría de Créditos
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
          Consulta el historial de horas, expedientes de titulación y valida créditos de actividades especiales.
        </p>

        {/* Buscador */}
        <div className="mt-6 relative max-w-xl">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, matrícula (UP...) o carrera..."
            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/15 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-unipaz-orange font-semibold"
          />
        </div>
      </div>

      {/* Grid de Estudiantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((std) => {
          const studentAtts = attendances.filter((a) => a.student_id === std.id);
          const prog = calculateStudentPFIProgress(studentAtts, eventsMap);

          return (
            <div
              key={std.id}
              className="rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 p-6 shadow-lg shadow-blue-950/5 dark:shadow-xl space-y-4 hover:border-unipaz-orange/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-300 dark:border-white/20 flex-shrink-0">
                    <Image
                      src={std.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={std.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-unipaz-navy dark:text-white text-base">
                      {std.nombre} {std.apellidos}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{std.carrera}</p>
                    <span className="text-[10px] font-mono text-unipaz-orange dark:text-amber-300 font-bold">
                      {std.matricula}
                    </span>
                  </div>
                </div>

                {/* Métricas de Horas */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Horas Acumuladas:</span>
                    <span className="font-mono font-black text-unipaz-navy dark:text-white text-sm">
                      {prog.horasTotales.toFixed(2)} hrs
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        prog.horasTotales >= 730
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : prog.horasTotales >= 400
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : 'bg-unipaz-orange'
                      }`}
                      style={{ width: `${Math.min(100, (prog.horasTotales / 730) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Estatus:</span>
                    <span
                      className={`font-black ${
                        prog.isAcreditado ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {prog.isAcreditado ? '✓ Acreditado PFI' : 'En Proceso (≤ 399h)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Auditar */}
              <button
                onClick={() => setSelectedStudent(std)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-unipaz-navy dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <FileCheck className="w-4 h-4 text-unipaz-orange" />
                Auditar Expediente Completo
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Auditoría de Expediente */}
      {selectedStudent && selectedStudentProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8 space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Expediente */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-unipaz-orange shadow-lg flex-shrink-0">
                <Image
                  src={selectedStudent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedStudent.nombre}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-unipaz-navy dark:text-white">
                  {selectedStudent.nombre} {selectedStudent.apellidos}
                </h3>
                <p className="text-xs text-unipaz-orange dark:text-amber-300 font-bold">
                  {selectedStudent.carrera} · Matrícula: {selectedStudent.matricula}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Generación {selectedStudent.periodo_ingreso} · Correo: {selectedStudent.email}
                </p>
              </div>
            </div>

            {/* Resumen de Requisitos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Horas:</span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {selectedStudentProgress.horasTotales.toFixed(2)} hrs
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {selectedStudentProgress.escalaTexto}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">3 Talleres Extracurr.:</span>
                <div className="font-bold text-slate-800 dark:text-white">
                  {selectedStudentProgress.talleresExtracurriculares.completados}/3 ({selectedStudentProgress.talleresExtracurriculares.horas.toFixed(1)}h)
                </div>
                <div className={`text-[10px] font-black ${selectedStudentProgress.talleresExtracurriculares.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {selectedStudentProgress.talleresExtracurriculares.cumplido ? '✓ Cumplido' : 'Pendiente'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Plan de Vida y Carrera:</span>
                <div className="font-bold text-slate-800 dark:text-white">
                  {selectedStudentProgress.pvc.horas.toFixed(1)} / 75.00 hrs
                </div>
                <div className={`text-[10px] font-black ${selectedStudentProgress.pvc.cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {selectedStudentProgress.pvc.cumplido ? '✓ PVC I, II, III Acreditados' : 'En proceso'}
                </div>
              </div>
            </div>

            {/* Tabla de Asistencias del Estudiante */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-unipaz-navy dark:text-white">
                Registro de Actividades y Asistencias:
              </h4>

              <div className="max-h-60 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 sticky top-0 font-bold">
                      <th className="py-2.5 px-3">Actividad</th>
                      <th className="py-2.5 px-3">Estatus</th>
                      <th className="py-2.5 px-3 text-right">Horas</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {selectedStudentAttendances.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="font-black text-unipaz-navy dark:text-white">
                            {att.event?.titulo || 'Actividad PFI'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {att.event?.categoria} · {att.event?.fecha_evento}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 capitalize font-bold">
                          {att.status === 'asistio' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Acreditado</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">{att.status}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-800 dark:text-white">
                          +{att.horas_acreditadas.toFixed(2)}h
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {att.status !== 'asistio' && (
                            <button
                              onClick={() => {
                                validateAttendanceManually(att.id, 'asistio');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] shadow-sm"
                            >
                              Aprobar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="py-2.5 px-6 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-unipaz-navy dark:hover:text-white font-bold text-xs"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
