import { AttendanceStatus, EventAttendance, EvaluationScale, PFIEvent, PFIProgressSummary, UserProfile } from './types';

// REGLAS NORMATIVAS OFICIALES UNIPAZ PFI
export const PFI_RULES = {
  HORAS_MINIMAS_ACREDITACION: 400.0, // Satisfactorio ("Espíritu Unipaceño")
  HORAS_SOBRESALIENTE: 730.0,        // Sobresaliente
  
  // Requisitos obligatorios
  TALLERES_EXTRACURRICULARES_CANTIDAD: 3,
  TALLERES_EXTRACURRICULARES_HORAS_UNITARIAS: 16.67,
  TALLERES_EXTRACURRICULARES_TOTAL_HORAS: 50.0,
  
  TALLER_LIDERAZGO_CANTIDAD: 1,
  TALLER_LIDERAZGO_TOTAL_HORAS: 10.0,
  
  PVC_HORAS_UNITARIAS: 25.0,
  PVC_TOTAL_HORAS: 75.0,
  
  // Catálogo de Actividades Formativas (horas por actividad)
  CATALOGO_HORAS: {
    'Investigación': 100.00,       // Artículos, Ponencias, Proyectos
    'Club Anual': 33.34,           // Lectura, debate, altruistas
    'PVC': 25.00,                  // PVC I, II, III
    'Taller Extracurricular': 16.67,// Culturales, Deportivos, Sociales
    'Taller Liderazgo': 10.00,     // Inclusión, Equidad, Liderazgo
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
 */
export function calculateStudentPFIProgress(
  attendances: EventAttendance[],
  eventsMap: Map<string, PFIEvent>
): PFIProgressSummary {
  let totalHoras = 0;
  
  let extraTalleresCount = 0;
  let extraTalleresHoras = 0;
  
  let liderazgoCount = 0;
  let liderazgoHoras = 0;
  
  let pvc1 = false;
  let pvc2 = false;
  let pvc3 = false;
  let pvcHoras = 0;
  
  const desglose: Record<string, { horas: number; cantidad: number }> = {};
  
  // Procesar asistencias con horas acreditadas o estatus 'asistio'
  for (const att of attendances) {
    if (att.status !== 'asistio' && att.horas_acreditadas <= 0) continue;
    
    const event = att.event || eventsMap.get(att.event_id);
    const horas = att.horas_acreditadas > 0 ? Number(att.horas_acreditadas) : (event?.horas_pfi || 0);
    
    totalHoras += horas;
    
    const cat = event?.categoria || 'General';
    if (!desglose[cat]) {
      desglose[cat] = { horas: 0, cantidad: 0 };
    }
    desglose[cat].horas += horas;
    desglose[cat].cantidad += 1;
    
    // Validar talleres extracurriculares
    if (cat === 'Taller Extracurricular') {
      extraTalleresCount++;
      extraTalleresHoras += horas;
    }
    
    // Validar taller de liderazgo
    if (cat === 'Taller Liderazgo') {
      liderazgoCount++;
      liderazgoHoras += horas;
    }
    
    // Validar PVC
    if (cat === 'PVC' || event?.titulo.includes('PVC') || event?.subcategoria?.includes('PVC')) {
      const titleUpper = (event?.titulo || '').toUpperCase();
      if (titleUpper.includes('PVC I') || titleUpper.includes('INICIANDO MIS SUEÑOS') || titleUpper.includes('PVC 1')) {
        pvc1 = true;
      }
      if (titleUpper.includes('PVC II') || titleUpper.includes('AHÍ LA LLEVO') || titleUpper.includes('PVC 2')) {
        pvc2 = true;
      }
      if (titleUpper.includes('PVC III') || titleUpper.includes('YA CASI') || titleUpper.includes('PVC 3')) {
        pvc3 = true;
      }
      pvcHoras += horas;
    }
  }
  
  const scaleInfo = calculateEvaluationScale(totalHoras);
  
  const cumpleTalleres = extraTalleresCount >= PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD || extraTalleresHoras >= PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS;
  const cumpleLiderazgo = liderazgoCount >= PFI_RULES.TALLER_LIDERAZGO_CANTIDAD || liderazgoHoras >= PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS;
  const cumplePVC = (pvc1 && pvc2 && pvc3) || pvcHoras >= PFI_RULES.PVC_TOTAL_HORAS;
  
  const isAcreditado = totalHoras >= PFI_RULES.HORAS_MINIMAS_ACREDITACION && cumpleTalleres && cumpleLiderazgo && cumplePVC;
  
  return {
    horasTotales: Math.round(totalHoras * 100) / 100,
    escala: scaleInfo.escala,
    escalaTexto: scaleInfo.texto,
    porcentajeMeta: Math.min(100, Math.round((totalHoras / PFI_RULES.HORAS_MINIMAS_ACREDITACION) * 100)),
    porcentajeSobresaliente: Math.min(100, Math.round((totalHoras / PFI_RULES.HORAS_SOBRESALIENTE) * 100)),
    isAcreditado,
    talleresExtracurriculares: {
      horas: Math.round(extraTalleresHoras * 100) / 100,
      completados: extraTalleresCount,
      requeridos: PFI_RULES.TALLERES_EXTRACURRICULARES_CANTIDAD,
      metaHoras: PFI_RULES.TALLERES_EXTRACURRICULARES_TOTAL_HORAS,
      cumplido: cumpleTalleres,
    },
    tallerLiderazgo: {
      horas: Math.round(liderazgoHoras * 100) / 100,
      completados: liderazgoCount,
      requeridos: PFI_RULES.TALLER_LIDERAZGO_CANTIDAD,
      metaHoras: PFI_RULES.TALLER_LIDERAZGO_TOTAL_HORAS,
      cumplido: cumpleLiderazgo,
    },
    pvc: {
      pvc1,
      pvc2,
      pvc3,
      horas: Math.round(pvcHoras * 100) / 100,
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
      mensaje: `Permanencia insuficiente (${porcentajePercent}%). Se requiere al menos el 80% (${Math.round(duracionMinutos * 0.8)} min).`,
    };
  }
}
