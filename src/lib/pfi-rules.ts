import { AttendanceStatus, EventAttendance, EvaluationScale, PFIEvent, PFIProgressSummary, UserProfile } from './types';

// REGLAS NORMATIVAS OFICIALES UNIPAZ PFI
export const PFI_RULES = {
  HORAS_MINIMAS_ACREDITACION: 400.0, // Satisfactorio ("Espíritu Unipaceño")
  HORAS_SOBRESALIENTE: 730.0,        // Sobresaliente
  
  // Requisitos obligatorios
  TALLERES_EXTRACURRICULARES_CANTIDAD: 3,
  TALLERES_EXTRACURRICULARES_HORAS_UNITARIAS: 16.67,
  TALLERES_EXTRACURRICULARES_TOTAL_HORAS: 50.0, // Tope máximo acreditable
  
  TALLER_LIDERAZGO_CANTIDAD: 1,
  TALLER_LIDERAZGO_TOTAL_HORAS: 10.0, // Tope máximo acreditable
  
  PVC_HORAS_UNITARIAS: 25.0,
  PVC_TOTAL_HORAS: 75.0, // Tope máximo (PVC I, II, III)
  
  // Catálogo de Actividades Formativas (horas por actividad)
  CATALOGO_HORAS: {
    'Investigación': 100.00,       // Artículos, Ponencias, Proyectos
    'Club Anual': 33.34,           // Lectura, debate, altruistas
    'PVC': 25.00,                  // PVC I, II, III
    'Taller Extracurricular': 16.67,// Culturales, Deportivos, Sociales (Máx 3)
    'Taller Liderazgo': 10.00,     // Inclusión, Equidad, Liderazgo (Máx 1)
    'Simposio': 5.56,              // Simposios y Congresos
    'Jornada Social': 5.00,        // Jornadas y Ferias
    'Cine Club': 2.50,             // Cine club, café literario, donación libros
    'Foro': 2.00,                  // Foros, conferencias, salud universitaria
    'Campaña': 1.00,               // Campañas de vacunación, colectas, desfiles
  },
  
  // Regla de permanencia mínima para acreditación
  PORCENTAJE_PERMANENCIA_MINIMA: 0.80, // 80%
};

/**
 * Determina el estado real y descriptivo de una asistencia
 */
export function getAttendanceStatusInfo(
  att: EventAttendance,
  event?: PFIEvent
): {
  isRealizado: boolean;
  isNoRealizado: boolean;
  isProgramado: boolean;
  statusLabel: string;
  badgeClass: string;
  description: string;
} {
  const isPastEvent = event ? new Date(`${event.fecha_evento}T23:59:59`) < new Date() : false;

  if (att.status === 'asistio' && att.horas_acreditadas > 0) {
    return {
      isRealizado: true,
      isNoRealizado: false,
      isProgramado: false,
      statusLabel: 'Realizada & Acreditada',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-400/30',
      description: `Actividad acreditada satisfactoriamente con +${att.horas_acreditadas.toFixed(2)} hrs PFI.`,
    };
  }

  if (att.status === 'incompleto') {
    return {
      isRealizado: false,
      isNoRealizado: true,
      isProgramado: false,
      statusLabel: 'No Realizada (Sin Check-Out)',
      badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-400/30',
      description: att.notes || 'No se registró Check-Out o la permanencia fue inferior al 80%. Otorga 0.00 hrs.',
    };
  }

  if (att.status === 'registrado') {
    if (isPastEvent || (att.check_in_timestamp && !att.check_out_timestamp)) {
      return {
        isRealizado: false,
        isNoRealizado: true,
        isProgramado: false,
        statusLabel: 'No Realizada (Sin Check-Out)',
        badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-400/30',
        description: 'El evento concluyó sin registro de Check-Out. Requiere justificación o validación de Coordinación.',
      };
    }
    return {
      isRealizado: false,
      isNoRealizado: false,
      isProgramado: true,
      statusLabel: 'Programada / Inscrito',
      badgeClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-400/30',
      description: 'Inscripción activa. Recuerda realizar Check-In y Check-Out el día del evento.',
    };
  }

  return {
    isRealizado: false,
    isNoRealizado: true,
    isProgramado: false,
    statusLabel: 'Cancelada / No Asistió',
    badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10',
    description: 'Actividad no completada (0.00 hrs).',
  };
}

/**
 * Calcula la escala de evaluación a partir del total de horas
 */
export function calculateEvaluationScale(horasTotales: number): {
  escala: EvaluationScale;
  texto: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
} {
  if (horasTotales >= PFI_RULES.HORAS_SOBRESALIENTE) {
    return {
      escala: 'Sobresaliente',
      texto: 'Sobresaliente (Mérito PFI UNIPAZ)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-400/30',
      bgColor: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-400/40',
    };
  } else if (horasTotales >= PFI_RULES.HORAS_MINIMAS_ACREDITACION) {
    return {
      escala: 'Satisfactorio',
      texto: 'Satisfactorio (Espíritu Unipaceño)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30',
      bgColor: 'from-emerald-500/20 to-blue-500/20',
      borderColor: 'border-emerald-400/40',
    };
  } else {
    return {
      escala: 'No Satisfactorio',
      texto: 'En Proceso / No Satisfactorio (≤ 399 hrs)',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-400/30',
      bgColor: 'from-rose-500/20 to-amber-500/20',
      borderColor: 'border-rose-400/40',
    };
  }
}

/**
 * Procesa el resumen de avance PFI de un estudiante a partir de sus asistencias
 * Solo suman horas aquellas asistencias con status === 'asistio' y horas_acreditadas > 0
 */
export function calculateStudentPFIProgress(
  attendances: EventAttendance[],
  eventsMap: Map<string, PFIEvent>
): PFIProgressSummary {
  let totalHoras = 0;
  
  let extraTalleresCount = 0;
  let extraTalleresHorasAcreditables = 0;
  
  let liderazgoCount = 0;
  let liderazgoHorasAcreditables = 0;
  
  let pvc1 = false;
  let pvc2 = false;
  let pvc3 = false;
  let pvcHorasAcreditables = 0;
  
  const desglose: Record<string, { horas: number; cantidad: number }> = {};
  
  // Procesar asistencias con horas acreditadas y estatus 'asistio'
  for (const att of attendances) {
    // Si no tiene estatus 'asistio' o sus horas son 0, NO suma
    if (att.status !== 'asistio' || att.horas_acreditadas <= 0) continue;
    
    const event = att.event || eventsMap.get(att.event_id);
    const horasNominales = Number(att.horas_acreditadas);
    const cat = event?.categoria || 'General';
    
    let horasEfectivas = horasNominales;

    // Regla de tope para Talleres Extracurriculares (Máx 3 talleres / 50 hrs)
    if (cat === 'Taller Extracurricular') {
      extraTalleresCount++;
      if (extraTalleresCount <= PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD && extraTalleresHorasAcreditables < PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS) {
        const resto = PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS - extraTalleresHorasAcreditables;
        horasEfectivas = Math.min(horasNominales, resto);
        extraTalleresHorasAcreditables += horasEfectivas;
      } else {
        horasEfectivas = 0; // Excede los 3 talleres obligatorios
      }
    }
    
    // Regla de tope para Taller de Liderazgo (Máx 1 taller / 10 hrs)
    else if (cat === 'Taller Liderazgo') {
      liderazgoCount++;
      if (liderazgoCount <= PFI_RULES.TALLER_LIDERAZGO_CANTIDAD && liderazgoHorasAcreditables < PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS) {
        horasEfectivas = Math.min(horasNominales, PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS - liderazgoHorasAcreditables);
        liderazgoHorasAcreditables += horasEfectivas;
      } else {
        horasEfectivas = 0; // Excede el taller de liderazgo obligatorio
      }
    }
    
    // Regla de PVC (PVC I, II, III · 25h c/u = 75h máx)
    else if (cat === 'PVC' || event?.titulo.includes('PVC') || event?.subcategoria?.includes('PVC')) {
      const titleUpper = (event?.titulo || '').toUpperCase();
      if ((titleUpper.includes('PVC I') || titleUpper.includes('INICIANDO MIS SUEÑOS') || titleUpper.includes('PVC 1')) && !pvc1) {
        pvc1 = true;
        horasEfectivas = Math.min(horasNominales, 25.0);
        pvcHorasAcreditables += horasEfectivas;
      } else if ((titleUpper.includes('PVC II') || titleUpper.includes('AHÍ LA LLEVO') || titleUpper.includes('PVC 2')) && !pvc2) {
        pvc2 = true;
        horasEfectivas = Math.min(horasNominales, 25.0);
        pvcHorasAcreditables += horasEfectivas;
      } else if ((titleUpper.includes('PVC III') || titleUpper.includes('YA CASI') || titleUpper.includes('PVC 3')) && !pvc3) {
        pvc3 = true;
        horasEfectivas = Math.min(horasNominales, 25.0);
        pvcHorasAcreditables += horasEfectivas;
      } else {
        horasEfectivas = 0; // PVC duplicado
      }
    }
    
    totalHoras += horasEfectivas;
    
    if (!desglose[cat]) {
      desglose[cat] = { horas: 0, cantidad: 0 };
    }
    desglose[cat].horas += horasEfectivas;
    desglose[cat].cantidad += 1;
  }
  
  const scaleInfo = calculateEvaluationScale(totalHoras);
  
  const cumpleTalleres = extraTalleresCount >= PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD || extraTalleresHorasAcreditables >= PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS;
  const cumpleLiderazgo = liderazgoCount >= PFI_RULES.TALLER_LIDERAZGO_CANTIDAD || liderazgoHorasAcreditables >= PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS;
  const cumplePVC = (pvc1 && pvc2 && pvc3) || pvcHorasAcreditables >= PFI_RULES.PVC_TOTAL_HORAS;
  
  const isAcreditado = totalHoras >= PFI_RULES.HORAS_MINIMAS_ACREDITACION && cumpleTalleres && cumpleLiderazgo && cumplePVC;
  
  return {
    horasTotales: Math.round(totalHoras * 100) / 100,
    escala: scaleInfo.escala,
    escalaTexto: scaleInfo.texto,
    porcentajeMeta: Math.min(100, Math.round((totalHoras / PFI_RULES.HORAS_MINIMAS_ACREDITACION) * 100)),
    porcentajeSobresaliente: Math.min(100, Math.round((totalHoras / PFI_RULES.HORAS_SOBRESALIENTE) * 100)),
    isAcreditado,
    talleresExtracurriculares: {
      horas: Math.round(extraTalleresHorasAcreditables * 100) / 100,
      completados: extraTalleresCount,
      requeridos: PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD,
      metaHoras: PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS,
      cumplido: cumpleTalleres,
    },
    tallerLiderazgo: {
      horas: Math.round(liderazgoHorasAcreditables * 100) / 100,
      completados: liderazgoCount,
      requeridos: PFI_RULES.TALLER_LIDERAZGO_CANTIDAD,
      metaHoras: PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS,
      cumplido: cumpleLiderazgo,
    },
    pvc: {
      pvc1,
      pvc2,
      pvc3,
      horas: Math.round(pvcHorasAcreditables * 100) / 100,
      metaHoras: PFI_RULES.PVC_TOTAL_HORAS,
      cumplido: cumplePVC,
    },
    desglosePorCategoria: desglose,
  };
}

/**
 * Valida la regla del 80% de permanencia a partir de marcas de tiempo de check-in y check-out
 */
export function validateStayDuration(
  checkIn: Date | string,
  checkOut: Date | string,
  eventStartTime: string, // "10:00"
  eventEndTime: string,   // "12:00"
  eventHours: number
): {
  asistio: boolean;
  horasAcreditadas: number;
  duracionMinutos: number;
  permanenciaMinutos: number;
  porcentajePermanencia: number;
  status: AttendanceStatus;
  mensaje: string;
} {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  
  const permanenciaMinutos = Math.max(0, (outDate.getTime() - inDate.getTime()) / (1000 * 60));
  
  // Calcular duración nominal del evento
  const [startH, startM] = eventStartTime.split(':').map(Number);
  const [endH, endM] = eventEndTime.split(':').map(Number);
  
  const duracionMinutos = Math.max(1, (endH * 60 + endM) - (startH * 60 + startM));
  const porcentaje = (permanenciaMinutos / duracionMinutos);
  const porcentajePercent = Math.round(porcentaje * 100);
  
  if (porcentaje >= PFI_RULES.PORCENTAJE_PERMANENCIA_MINIMA) {
    return {
      asistio: true,
      horasAcreditadas: eventHours,
      duracionMinutos,
      permanenciaMinutos: Math.round(permanenciaMinutos),
      porcentajePermanencia: porcentajePercent,
      status: 'asistio',
      mensaje: `¡Permanencia cumplida (${porcentajePercent}%)! Se acreditaron ${eventHours} hrs PFI.`,
    };
  } else {
    return {
      asistio: false,
      horasAcreditadas: 0,
      duracionMinutos,
      permanenciaMinutos: Math.round(permanenciaMinutos),
      porcentajePermanencia: porcentajePercent,
      status: 'incompleto',
      mensaje: `No se acreditó por permanencia insuficiente (${porcentajePercent}%). Se requiere al menos el 80% de estancia y Check-Out.`,
    };
  }
}
