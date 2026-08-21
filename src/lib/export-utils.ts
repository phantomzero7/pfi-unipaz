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

/**
 * Genera y descarga reporte oficial de expedientes estudiantiles en PDF institucional membretado
 */
export async function generateStudentsOfficialPdfReport(
  students: UserProfile[],
  getProgressFn: (id: string) => PFIProgressSummary,
  getScholarshipProgressFn: (id: string) => import('./types').ScholarshipProgressSummary,
  filtersApplied: { carrera?: string; cuatrimestre?: string; status?: string; sexo?: string; totalStudents: number }
) {
  const jsPDF = (await import('jspdf')).default;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner Institucional
  doc.setFillColor(0, 40, 85);
  doc.rect(10, 10, 277, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ · LA PAZ, B.C.S.', 148.5, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('PROGRAMA DE FORMACIÓN INTEGRAL (PFI) · REPORTE OFICIAL DE EXPEDIENTES ESTUDIANTILES', 148.5, 24, { align: 'center' });

  // Metadatos y Filtros Aplicados
  doc.setTextColor(0, 40, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PADRÓN Y AUDITORÍA DE AVANCE DE HORAS Y BECAS', 14, 35);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const filterDesc = `Filtros: Carrera: ${filtersApplied.carrera || 'Todas'} | Grado: ${filtersApplied.cuatrimestre || 'Todos'} | Sexo: ${filtersApplied.sexo || 'Todos'} | Estatus: ${filtersApplied.status || 'Todos'} | Total Registros: ${filtersApplied.totalStudents}`;
  doc.text(filterDesc, 14, 40);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} | Folio: UNIPAZ-REP-${Date.now().toString().slice(-6)}`, 14, 44);

  // Table header
  doc.setFillColor(0, 40, 85);
  doc.rect(14, 48, 269, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text('#', 16, 52.5);
  doc.text('MATRÍCULA', 24, 52.5);
  doc.text('NOMBRE COMPLETO', 50, 52.5);
  doc.text('SEXO', 112, 52.5);
  doc.text('PROGRAMA ACADÉMICO', 130, 52.5);
  doc.text('GRADO', 190, 52.5);
  doc.text('HORAS PFI', 206, 52.5);
  doc.text('BECA & PUNTOS', 230, 52.5);
  doc.text('TITULACIÓN', 260, 52.5);

  let y = 60;
  const maxPerPage = 22;
  const items = students.slice(0, maxPerPage);

  items.forEach((s, idx) => {
    const prog = getProgressFn(s.id);
    const sch = getScholarshipProgressFn(s.id);

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 269, 6, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);

    doc.text((idx + 1).toString(), 16, y);
    doc.text(s.matricula, 24, y);
    doc.text(`${s.nombre} ${s.apellidos}`.slice(0, 35), 50, y);
    doc.text(s.sexo || 'Hombre', 112, y);
    doc.text(s.carrera.slice(0, 30), 130, y);
    doc.text(`${s.cuatrimestre || 1}°`, 190, y);
    doc.text(`${prog.horasTotales.toFixed(1)} hrs`, 206, y);
    doc.text(s.tiene_beca ? `${s.porcentaje_beca}% (${sch.puntosTotales} pts)` : 'Sin Beca', 230, y);
    doc.text(prog.isAcreditado ? 'LIBERADO' : 'EN PROCESO', 260, y);

    y += 6;
  });

  doc.save(`reporte_estudiantes_unipaz_${new Date().toISOString().split('T')[0]}.pdf`);
}
