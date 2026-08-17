import {
  AttendanceStatus,
  EventAttendance,
  EventCategory,
  EvaluationScale,
  ParticipantRole,
  PFIEvent,
  PFIProgressSummary,
  UserProfile,
} from './types';

// REGLAS NORMATIVAS OFICIALES UNIPAZ PFI
export const PFI_RULES = {
  HORAS_MINIMAS_ACREDITACION: 400.0, // Satisfactorio ("Espíritu Unipaceño")
  HORAS_SOBRESALIENTE: 730.0,        // Sobresaliente
  PENALIZACION_DEFAULT_STAFF: 5.0,   // -5 hrs por no asistir como Staff
  
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
 * Retorna etiquetas y colores según el rol de participación
 */
export function getRoleBadgeInfo(role?: ParticipantRole): {
  label: string;
  badgeClass: string;
} {
  switch (role) {
    case 'staff_logistica':
      return {
        label: 'Staff Logístico',
        badgeClass: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-400/30',
      };
    case 'ponente':
      return {
        label: 'Ponente / Expositor',
        badgeClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-400/30',
      };
    case 'moderador':
      return {
        label: 'Moderador',
        badgeClass: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-400/30',
      };
    case 'organizador':
      return {
        label: 'Organizador',
        badgeClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-400/30',
      };
    default:
      return {
        label: 'Oyente / Asistente',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
      };
  }
}

/**
 * Determina el estado real y descriptivo de una asistencia considerando roles y penalizaciones
 */
export function getAttendanceStatusInfo(
  att: EventAttendance,
  event?: PFIEvent
): {
  isRealizado: boolean;
  isNoRealizado: boolean;
  isProgramado: boolean;
  isPenalizado: boolean;
  statusLabel: string;
  badgeClass: string;
  description: string;
} {
  const isPastEvent = event ? new Date(`${event.fecha_evento}T23:59:59`) < new Date() : false;
  const isPenalizado = Boolean(att.penalizacion_horas && att.penalizacion_horas > 0);

  if (isPenalizado) {
    return {
      isRealizado: false,
      isNoRealizado: true,
      isProgramado: false,
      isPenalizado: true,
      statusLabel: `Penalizado (-${att.penalizacion_horas} hrs)`,
      badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-400/30 font-black',
      description: att.motivo_penalizacion || 'Penalización por no asistir a su rol confirmado de Staff Logístico.',
    };
  }

  if (att.status === 'asistio' && att.horas_acreditadas > 0) {
    const roleInfo = getRoleBadgeInfo(att.rol_participacion);
    return {
      isRealizado: true,
      isNoRealizado: false,
      isProgramado: false,
      isPenalizado: false,
      statusLabel: `Acreditada (${roleInfo.label})`,
      badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-400/30',
      description: `Actividad acreditada satisfactoriamente con +${att.horas_acreditadas.toFixed(2)} hrs PFI (${roleInfo.label}).`,
    };
  }

  if (att.status === 'incompleto') {
    return {
      isRealizado: false,
      isNoRealizado: true,
      isProgramado: false,
      isPenalizado: false,
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
        isPenalizado: false,
        statusLabel: 'No Realizada (Sin Check-Out)',
        badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-400/30',
        description: 'El evento concluyó sin registro de Check-Out. Requiere justificación o validación de Coordinación.',
      };
    }
    return {
      isRealizado: false,
      isNoRealizado: false,
      isProgramado: true,
      isPenalizado: false,
      statusLabel: att.rol_participacion === 'staff_logistica' ? 'Staff Confirmado' : 'Programada / Inscrito',
      badgeClass: att.rol_participacion === 'staff_logistica'
        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-400/30'
        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-400/30',
      description: 'Inscripción activa. Recuerda realizar Check-In y Check-Out el día del evento.',
    };
  }

  return {
    isRealizado: false,
    isNoRealizado: true,
    isProgramado: false,
    isPenalizado: false,
    statusLabel: 'Cancelada / No Asistió',
    badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10',
    description: 'Actividad no completada (0.00 hrs).',
  };
}

/**
 * Calcula la escala de evaluación a partir del total de horas netas
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
 * Procesa el resumen de avance PFI de un estudiante considerando roles diferenciados y penalizaciones
 */
export function calculateStudentPFIProgress(
  attendances: EventAttendance[],
  eventsMap: Map<string, PFIEvent>
): PFIProgressSummary {
  let totalHorasBrutas = 0;
  let totalPenalizaciones = 0;
  
  let extraTalleresCount = 0;
  let extraTalleresHorasAcreditables = 0;
  
  let liderazgoCount = 0;
  let liderazgoHorasAcreditables = 0;
  
  let pvc1 = false;
  let pvc2 = false;
  let pvc3 = false;
  let pvcHorasAcreditables = 0;
  
  let asistenteHoras = 0;
  let staffHoras = 0;
  let ponenteHoras = 0;
  let participacionesStaff = 0;

  const desglose: Record<string, { horas: number; cantidad: number }> = {};
  
  for (const att of attendances) {
    // Si tiene penalización, restar
    if (att.penalizacion_horas && att.penalizacion_horas > 0) {
      totalPenalizaciones += Number(att.penalizacion_horas);
    }

    // Solo acreditan las asistencias con status === 'asistio' y horas > 0
    if (att.status !== 'asistio' || att.horas_acreditadas <= 0) continue;
    
    const event = att.event || eventsMap.get(att.event_id);
    const horasNominales = Number(att.horas_acreditadas);
    const cat = event?.categoria || 'General';
    const rol = att.rol_participacion || 'asistente';
    
    let horasEfectivas = horasNominales;

    // Métricas por roles
    if (rol === 'staff_logistica') {
      staffHoras += horasEfectivas;
      participacionesStaff++;
    } else if (rol === 'ponente' || rol === 'moderador') {
      ponenteHoras += horasEfectivas;
    } else {
      asistenteHoras += horasEfectivas;
    }

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
    
    totalHorasBrutas += horasEfectivas;
    
    if (!desglose[cat]) {
      desglose[cat] = { horas: 0, cantidad: 0 };
    }
    desglose[cat].horas += horasEfectivas;
    desglose[cat].cantidad += 1;
  }
  
  const totalHorasNetas = Math.max(0, totalHorasBrutas - totalPenalizaciones);
  const scaleInfo = calculateEvaluationScale(totalHorasNetas);
  
  const cumpleTalleres = extraTalleresCount >= PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD || extraTalleresHorasAcreditables >= PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS;
  const cumpleLiderazgo = liderazgoCount >= PFI_RULES.TALLER_LIDERAZGO_CANTIDAD || liderazgoHorasAcreditables >= PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS;
  const cumplePVC = (pvc1 && pvc2 && pvc3) || pvcHorasAcreditables >= PFI_RULES.PVC_TOTAL_HORAS;
  
  const isAcreditado = totalHorasNetas >= PFI_RULES.HORAS_MINIMAS_ACREDITACION && cumpleTalleres && cumpleLiderazgo && cumplePVC;
  
  return {
    horasTotales: Math.round(totalHorasNetas * 100) / 100,
    horasBrutas: Math.round(totalHorasBrutas * 100) / 100,
    horasPenalizaciones: Math.round(totalPenalizaciones * 100) / 100,
    escala: scaleInfo.escala,
    escalaTexto: scaleInfo.texto,
    porcentajeMeta: Math.min(100, Math.round((totalHorasNetas / PFI_RULES.HORAS_MINIMAS_ACREDITACION) * 100)),
    porcentajeSobresaliente: Math.min(100, Math.round((totalHorasNetas / PFI_RULES.HORAS_SOBRESALIENTE) * 100)),
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
    desglosePorRoles: {
      asistenteHoras: Math.round(asistenteHoras * 100) / 100,
      staffHoras: Math.round(staffHoras * 100) / 100,
      ponenteHoras: Math.round(ponenteHoras * 100) / 100,
      participacionesStaff,
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

/**
 * Retorna la asignación estándar de puntos de beca (50 a 500) según categoría y rol
 */
export function getStandardScholarshipPoints(category: EventCategory, role?: ParticipantRole): number {
  let basePoints = 150;
  switch (category) {
    case 'Investigación':
      basePoints = 500;
      break;
    case 'Club Anual':
      basePoints = 300;
      break;
    case 'PVC':
      basePoints = 250;
      break;
    case 'Taller Extracurricular':
      basePoints = 200;
      break;
    case 'Simposio':
      basePoints = 180;
      break;
    case 'Taller Liderazgo':
      basePoints = 150;
      break;
    case 'Jornada Social':
      basePoints = 120;
      break;
    case 'Foro':
      basePoints = 80;
      break;
    case 'Cine Club':
      basePoints = 60;
      break;
    case 'Campaña':
      basePoints = 50;
      break;
    default:
      basePoints = 100;
  }

  if (role === 'staff_logistica') {
    basePoints = Math.min(500, basePoints + 100);
  } else if (role === 'ponente') {
    basePoints = Math.min(500, basePoints + 150);
  }

  return basePoints;
}

/**
 * Calcula el progreso de puntos de beca de un estudiante becado (meta de 1000 puntos cuatrimestrales)
 */
export function calculateStudentScholarshipProgress(
  student: UserProfile,
  attendances: EventAttendance[],
  eventsMap: Map<string, PFIEvent>
): import('./types').ScholarshipProgressSummary {
  if (!student.tiene_beca) {
    return {
      tieneBeca: false,
      tipoBeca: '',
      porcentajeBeca: 0,
      promedioAcademico: student.promedio_academico || 0,
      puntosTotales: 0,
      puntosBrutos: 0,
      puntosPenalizaciones: 0,
      puntosMeta: 1000,
      porcentajeCumplimiento: 0,
      estatus: 'no_acreditado',
      estatusTexto: 'Sin Beca Asignada',
      isAcreditadoBeca: false,
      actividadesBecadas: [],
    };
  }

  const meta = student.puntos_beca_meta_cuatrimestral || 1000;
  let puntosBrutos = 0;
  let puntosPenalizaciones = student.puntos_beca_penalizaciones || 0;
  const actividadesBecadas: import('./types').ScholarshipProgressSummary['actividadesBecadas'] = [];

  attendances.forEach((att) => {
    if (att.student_id !== student.id) return;
    const event = eventsMap.get(att.event_id) || att.event;

    if (att.penalizacion_puntos_beca) {
      puntosPenalizaciones += att.penalizacion_puntos_beca;
    }

    if (att.status === 'asistio') {
      let puntos = att.puntos_beca_acreditados;
      if (puntos === undefined && event) {
        puntos = event.puntos_beca || getStandardScholarshipPoints(event.categoria, att.rol_participacion);
        if (att.rol_participacion === 'staff_logistica' && event.puntos_beca_staff) {
          puntos += event.puntos_beca_staff;
        }
      }

      const finalPuntos = Math.min(500, Math.max(50, puntos || 100));
      puntosBrutos += finalPuntos;

      if (event) {
        actividadesBecadas.push({
          id: att.id,
          eventId: event.id,
          titulo: event.titulo,
          categoria: event.categoria,
          fecha: event.fecha_evento,
          puntosAcreditados: finalPuntos,
          rol: att.rol_participacion || 'asistente',
        });
      }
    }
  });

  const puntosTotales = Math.max(0, puntosBrutos - puntosPenalizaciones);
  const porcentajeCumplimiento = Math.min(100, Math.round((puntosTotales / meta) * 100));

  let estatus: import('./types').ScholarshipStatus = 'en_progreso';
  let estatusTexto = 'En Progreso hacia la Meta';

  if (puntosTotales >= meta) {
    estatus = 'cumplido';
    estatusTexto = '✓ Beca Acreditada y Renovada';
  } else if (puntosTotales < 500) {
    estatus = 'en_riesgo';
    estatusTexto = '⚠️ En Riesgo de Pérdida de Beca';
  } else {
    estatus = 'en_progreso';
    estatusTexto = 'En Progreso (Más del 50%)';
  }

  return {
    tieneBeca: true,
    tipoBeca: student.tipo_beca || 'Beca Institucional',
    porcentajeBeca: student.porcentaje_beca || 50,
    promedioAcademico: student.promedio_academico || 9.0,
    puntosTotales,
    puntosBrutos,
    puntosPenalizaciones,
    puntosMeta: meta,
    porcentajeCumplimiento,
    estatus,
    estatusTexto,
    isAcreditadoBeca: puntosTotales >= meta,
    actividadesBecadas,
  };
}
