import { EventAttendance, PFIEvent, PFIProgressSummary, UserProfile } from './types';

/**
 * Exporta el padrón completo de estudiantes con horas y nivel de rezago a archivo CSV
 */
export function exportStudentsToCsv(
  students: UserProfile[],
  getProgressFn: (id: string) => PFIProgressSummary
) {
  const headers = [
    'Matricula',
    'Nombre',
    'Apellidos',
    'Carrera',
    'Cuatrimestre',
    'Periodo Ingreso',
    'Email',
    'Horas Totales',
    'Escala Evaluacion',
    'PVC I',
    'PVC II',
    'PVC III',
    'Talleres Completados',
    'Liderazgo Social',
    'Horas Staff',
    'Acreditado Titulacion',
    'Riesgo de Rezago',
  ];

  const rows = students.map((std) => {
    const prog = getProgressFn(std.id);
    const cuatri = std.cuatrimestre || 1;
    const isRiesgo = cuatri >= 6 && prog.horasTotales < 200;

    return [
      `"${std.matricula}"`,
      `"${std.nombre}"`,
      `"${std.apellidos}"`,
      `"${std.carrera}"`,
      `"${cuatri}° Cuatrimestre"`,
      `"${std.periodo_ingreso}"`,
      `"${std.email}"`,
      prog.horasTotales.toFixed(2),
      `"${prog.escala}"`,
      prog.pvc.pvc1 ? 'SI' : 'NO',
      prog.pvc.pvc2 ? 'SI' : 'NO',
      prog.pvc.pvc3 ? 'SI' : 'NO',
      `${prog.talleresExtracurriculares.completados}/3`,
      prog.tallerLiderazgo.cumplido ? 'SI' : 'NO',
      prog.desglosePorRoles.staffHoras.toFixed(2),
      prog.isAcreditado ? 'SI' : 'NO',
      isRiesgo ? 'ALTO RIESGO' : 'REGULAR',
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `padron_pfi_unipaz_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta el padrón estudiantil con datos PFI y Becas a archivo Microsoft Excel (.xlsx) nativo
 */
export async function exportStudentsToExcel(
  students: UserProfile[],
  getProgressFn: (id: string) => PFIProgressSummary,
  getScholarshipProgressFn?: (id: string) => import('./types').ScholarshipProgressSummary
) {
  const XLSX = await import('xlsx');

  const data = students.map((std) => {
    const prog = getProgressFn(std.id);
    const sch = getScholarshipProgressFn ? getScholarshipProgressFn(std.id) : null;
    const cuatri = std.cuatrimestre || 1;
    const isRiesgo = cuatri >= 6 && prog.horasTotales < 200;

    return {
      Matrícula: std.matricula,
      Nombre: std.nombre,
      Apellidos: std.apellidos,
      Carrera: std.carrera,
      Grado: `${cuatri}° Cuatrimestre`,
      'Periodo Ingreso': std.periodo_ingreso,
      Correo: std.email,
      'Horas Totales PFI': prog.horasTotales,
      'Escala PFI': prog.escala,
      'PVC I': prog.pvc.pvc1 ? 'CUMPLIDO' : 'PENDIENTE',
      'PVC II': prog.pvc.pvc2 ? 'CUMPLIDO' : 'PENDIENTE',
      'PVC III': prog.pvc.pvc3 ? 'CUMPLIDO' : 'PENDIENTE',
      'Talleres Formativos': `${prog.talleresExtracurriculares.completados}/3`,
      'Liderazgo Social': prog.tallerLiderazgo.cumplido ? 'CUMPLIDO' : 'PENDIENTE',
      'Horas como Staff': prog.desglosePorRoles.staffHoras,
      'Liberado para Titulación': prog.isAcreditado ? 'SÍ' : 'NO',
      'Alerta de Rezago': isRiesgo ? 'ALERTA REZAGO' : 'REGULAR',
      'Tiene Beca': std.tiene_beca ? 'SÍ' : 'NO',
      'Tipo de Beca': std.tipo_beca || 'N/A',
      '% Descuento': std.porcentaje_beca ? `${std.porcentaje_beca}%` : 'N/A',
      'Puntos Beca Acumulados': sch ? sch.puntosTotales : 0,
      'Meta Beca Cuatrimestral': 1000,
      'Beca Refrendada': sch && sch.isAcreditadoBeca ? 'SÍ' : 'NO',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Padrón PFI y Becas');

  XLSX.writeFile(workbook, `Padron_PFI_Becas_UNIPAZ_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exporta la lista de asistencia oficial de un evento a archivo CSV
 */
export function exportEventAttendanceToCsv(
  event: PFIEvent,
  attendances: EventAttendance[],
  profiles: UserProfile[]
) {
  const headers = [
    'Matricula',
    'Nombre Completo',
    'Carrera',
    'Rol de Participacion',
    'Check-In',
    'Check-Out',
    'Estatus',
    'Horas Acreditadas',
    'Validado Por',
  ];

  const eventAtts = attendances.filter((a) => a.event_id === event.id);

  const rows = eventAtts.map((att) => {
    const student = profiles.find((p) => p.id === att.student_id);
    return [
      `"${student?.matricula || ''}"`,
      `"${student?.nombre || ''} ${student?.apellidos || ''}"`,
      `"${student?.carrera || ''}"`,
      `"${att.rol_participacion || 'asistente'}"`,
      `"${att.check_in_timestamp ? new Date(att.check_in_timestamp).toLocaleTimeString() : 'Sin Check-In'}"`,
      `"${att.check_out_timestamp ? new Date(att.check_out_timestamp).toLocaleTimeString() : 'Sin Check-Out'}"`,
      `"${att.status}"`,
      att.horas_acreditadas.toFixed(2),
      `"${att.validado_por || 'N/A'}"`,
    ];
  });

  const csvContent = '\uFEFF' + [
    `"LISTA DE ASISTENCIA OFICIAL - UNIPAZ PFI"`,
    `"Actividad: ${event.titulo}"`,
    `"Fecha: ${event.fecha_evento} (${event.hora_inicio} - ${event.hora_fin})"`,
    `""`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `asistencia_${event.id}_${event.fecha_evento}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
