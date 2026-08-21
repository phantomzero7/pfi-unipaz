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
  Compass,
  DollarSign,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  History,
  Layers,
  LayoutGrid,
  List,
  Lock,
  MessageSquare,
  PenTool,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { ScholarshipRenewalDictamenModal } from '@/components/ScholarshipRenewalDictamenModal';
import { calculateStudentScholarshipProgress } from '@/lib/pfi-rules';
import { usePFI } from '@/lib/store';
import {
  CATALOGO_BECAS,
  CATALOGO_PROGRAMAS_ACADEMICOS,
  formatGradoAcademico,
  ModalidadBecaConfig,
  MODALIDADES_BECA_DEFAULT,
  PROGRAMAS_ACADEMICOS,
  ScholarshipAuditLog,
  ServicioBecarioDept,
  UserProfile,
} from '@/lib/types';

export default function AdminBecasConfigPage() {
  const {
    pfiConfig,
    updateGlobalConfig,
    profiles,
    events,
    attendances,
    scholarshipAuditLogs,
    addScholarshipAuditLog,
    updateScholarshipDates,
    batchSendScholarshipNotifications,
    addModalidadBeca,
    updateModalidadBeca,
    deleteModalidadBeca,
    getStudentScholarshipProgress,
    assignScholarshipToStudent,
    assignDepartmentalScholarship,
    accreditDepartmentalService,
    revokeScholarship,
    notifyScholarshipResolution,
    getActivePeriodForStudent,
  } = usePFI();

  const [activeTab, setActiveTab] = useState<'convocatoria' | 'directorio' | 'modalidades' | 'politicas'>('convocatoria');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDictamen, setSelectedStudentForDictamen] = useState<UserProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fechas Oficiales 1: Convocatoria Nuevas Solicitudes
  const [fechaInicioSolicitud, setFechaInicioSolicitud] = useState(pfiConfig.fecha_inicio_solicitud_becas || '2026-09-01');
  const [fechaFinSolicitud, setFechaFinSolicitud] = useState(pfiConfig.fecha_fin_solicitud_becas || '2026-09-25');
  const [fechaPubResolucion, setFechaPubResolucion] = useState(pfiConfig.fecha_publicacion_resolucion_becas || '2026-09-30');

  // Fechas Oficiales 2: Periodo de Ratificación Cuatrimestral (3 veces al año)
  const [fechaInicioRatificacion, setFechaInicioRatificacion] = useState(pfiConfig.fecha_inicio_ratificacion_becas || '2026-08-15');
  const [fechaFinRatificacion, setFechaFinRatificacion] = useState(pfiConfig.fecha_fin_ratificacion_becas || '2026-08-30');
  const [fechaPubDictamen, setFechaPubDictamen] = useState(pfiConfig.fecha_publicacion_dictamen_ratificacion || '2026-09-05');

  // Form State para Asignación Directa de Beca Regular
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTipoBeca, setSelectedTipoBeca] = useState<string>('Excelencia Académica (Promedio 9.6 - 10.0)');
  const [selectedPorcentaje, setSelectedPorcentaje] = useState<number>(50);
  const [promedioAsignado, setPromedioAsignado] = useState<number>(9.5);
  const [asignacionMsg, setAsignacionMsg] = useState<string | null>(null);

  // Form State para Servicio Becario (Becarios Departamentales)
  const [deptStudentId, setDeptStudentId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Biblioteca');
  const [deptPorcentaje, setDeptPorcentaje] = useState<number>(50);
  const [deptHorasSemanales, setDeptHorasSemanales] = useState<number>(10);
  const [deptPromedio, setDeptPromedio] = useState<number>(9.2);
  const [deptMsg, setDeptMsg] = useState<string | null>(null);

  // Modal para revisar solicitud de aspirante nuevo
  const [selectedApplicantForReview, setSelectedApplicantForReview] = useState<UserProfile | null>(null);
  const [applicantReviewTipoBeca, setApplicantReviewTipoBeca] = useState<string>('Excelencia Académica (Promedio 9.6 - 10.0)');
  const [applicantReviewPorcentaje, setApplicantReviewPorcentaje] = useState<number>(50);
  const [applicantReviewObservaciones, setApplicantReviewObservaciones] = useState<string>('');
  const [applicantReviewCondiciones, setApplicantReviewCondiciones] = useState<string>('');
  const [modalidadesViewMode, setModalidadesViewMode] = useState<'grid' | 'list'>('grid');

  // Selección múltiple para envío de notificaciones en lote
  const [selectedForNotification, setSelectedForNotification] = useState<string[]>([]);
  const [batchNotifMsg, setBatchNotifMsg] = useState<string | null>(null);

  // Modal de Historial / Bitácora Inmutable
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [selectedAuditStudent, setSelectedAuditStudent] = useState<UserProfile | null>(null);

  // Modal de Crear / Editar Modalidad de Beca
  const [showModalidadModal, setShowModalidadModal] = useState(false);
  const [editingModalidad, setEditingModalidad] = useState<ModalidadBecaConfig | null>(null);
  const [modalidadForm, setModalidadForm] = useState<Omit<ModalidadBecaConfig, 'id'>>({
    nombre: '',
    descripcion: '',
    descuento_min: 20,
    descuento_max: 50,
    porcentajes_aplicables: [20, 25, 30, 50],
    promedio_minimo: 8.5,
    requiere_estudio_socioeconomico: false,
    activa: true,
  });

  // MODAL DE EVALUACIÓN Y RATIFICACIÓN NORMATIVA DE BECA
  const [evaluatingStudent, setEvaluatingStudent] = useState<UserProfile | null>(null);
  const [showConditionalModal, setShowConditionalModal] = useState(false);
  const [selectedStudentForConditionDetails, setSelectedStudentForConditionDetails] = useState<UserProfile | null>(null);
  const [evalData, setEvalData] = useState({
    pagos_al_corriente: true,
    sin_reprobadas: true,
    solicitud_a_tiempo: true,
    sin_sanciones: true,
    esta_inscrito_proximo_ciclo: true,
    proxima_carga_materias: 'normal' as 'normal' | 'minima',
    cumple_puntos_1000: true,
    visto_bueno_reincidencia: false,
    motivo_visto_bueno: '',
    condiciones: '',
    tipo_beca: '',
    porcentaje_beca: 50,
    promedio_academico: 9.0,
    observaciones: '',
  });

  const students = useMemo(() => profiles.filter((p) => p.role === 'estudiante'), [profiles]);
  const studentsSinBeca = useMemo(() => students.filter((s) => !s.tiene_beca), [students]);
  const becarios = useMemo(() => students.filter((s) => s.tiene_beca), [students]);
  const becariosDept = useMemo(() => students.filter((s) => s.es_becario_departamental), [students]);
  const solicitudesPendientes = useMemo(
    () => students.filter((s) => s.solicitud_beca_status === 'enviada' || s.solicitud_beca_status === 'en_evaluacion' || (!s.tiene_beca && s.tipo_beca_solicitada)),
    [students]
  );

  // Periodo activo
  const activePeriod = useMemo(() => {
    const list = pfiConfig.periodosAcademicos || [];
    return list.find((p) => p.tipo === 'cuatrimestral' && p.es_actual) || list[0] || { codigo: '187', nombre: 'Mayo - Agosto 2026' };
  }, [pfiConfig.periodosAcademicos]);

  // Modalidades de beca disponibles
  const modalidadesCatalogo = useMemo(() => {
    return pfiConfig.modalidadesBecaCatalog || MODALIDADES_BECA_DEFAULT;
  }, [pfiConfig.modalidadesBecaCatalog]);

  const departamentosDisponibles = useMemo(() => {
    return pfiConfig.departamentosServicioBecario || [
      { id: 'dept-1', nombre: 'Biblioteca', descripcion: 'Atención y catalogación de acervo bibliográfico', cupo_maximo: 8, cupo_ocupado: 3, activo: true },
      { id: 'dept-2', nombre: 'INDE (Instituto de Investigación e Innovación)', descripcion: 'Apoyo a proyectos de investigación y estadística', cupo_maximo: 6, cupo_ocupado: 2, activo: true },
      { id: 'dept-3', nombre: 'DEDU (Dirección de Extensión y Difusión)', descripcion: 'Logística de eventos y difusión universitaria', cupo_maximo: 10, cupo_ocupado: 5, activo: true },
    ];
  }, [pfiConfig.departamentosServicioBecario]);

  const filteredBecarios = useMemo(() => {
    return becarios.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        (s.tipo_beca && s.tipo_beca.toLowerCase().includes(q)) ||
        s.carrera.toLowerCase().includes(q)
      );
    });
  }, [becarios, searchTerm]);

  // Guardar Fechas Oficiales
  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    updateScholarshipDates({
      fecha_inicio_solicitud: fechaInicioSolicitud,
      fecha_fin_solicitud: fechaFinSolicitud,
      fecha_publicacion_resolucion: fechaPubResolucion,
      fecha_inicio_ratificacion: fechaInicioRatificacion,
      fecha_fin_ratificacion: fechaFinRatificacion,
      fecha_publicacion_dictamen: fechaPubDictamen,
      activo: pfiConfig.periodo_solicitud_becas_activo ?? true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleAssignRegularBeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Selecciona un estudiante sin beca.');
      return;
    }
    const res = assignScholarshipToStudent(
      selectedStudentId,
      selectedTipoBeca as any,
      selectedPorcentaje,
      promedioAsignado,
      1000
    );
    setAsignacionMsg(res.message);
    setSelectedStudentId('');
    setTimeout(() => setAsignacionMsg(null), 4000);
  };

  const openApplicantReviewModal = (s: UserProfile) => {
    setSelectedApplicantForReview(s);
    setApplicantReviewTipoBeca(s.tipo_beca_solicitada || s.tipo_beca || 'Excelencia Académica (Promedio 9.6 - 10.0)');
    setApplicantReviewPorcentaje(s.porcentaje_beca || 50);
    setApplicantReviewObservaciones('Requisitos normativos, promedio académico y estudio socioeconómico validados por el Comité de Becas UNIPAZ.');
    setApplicantReviewCondiciones('');
  };

  const handleAssignDeptBeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptStudentId) {
      alert('Selecciona un estudiante.');
      return;
    }
    const res = assignDepartmentalScholarship(
      deptStudentId,
      selectedDept,
      deptPorcentaje,
      deptHorasSemanales,
      deptPromedio
    );
    setDeptMsg(res.message);
    setDeptStudentId('');
    setTimeout(() => setDeptMsg(null), 4000);
  };

  // Guardar / Crear Modalidad de Beca
  const handleSaveModalidad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalidadForm.nombre.trim()) return;

    if (editingModalidad) {
      updateModalidadBeca(editingModalidad.id, modalidadForm);
    } else {
      addModalidadBeca(modalidadForm);
    }

    setShowModalidadModal(false);
    setEditingModalidad(null);
  };

  const openCreateModalidad = () => {
    setEditingModalidad(null);
    setModalidadForm({
      nombre: '',
      descripcion: '',
      descuento_min: 20,
      descuento_max: 50,
      porcentajes_aplicables: [20, 25, 30, 50],
      promedio_minimo: 8.5,
      requiere_estudio_socioeconomico: false,
      activa: true,
    });
    setShowModalidadModal(true);
  };

  const openEditModalidad = (mod: ModalidadBecaConfig) => {
    setEditingModalidad(mod);
    setModalidadForm({
      nombre: mod.nombre,
      descripcion: mod.descripcion,
      descuento_min: mod.descuento_min,
      descuento_max: mod.descuento_max,
      porcentajes_aplicables: mod.porcentajes_aplicables || [mod.descuento_min, mod.descuento_max],
      promedio_minimo: mod.promedio_minimo || 8.0,
      requiere_estudio_socioeconomico: mod.requiere_estudio_socioeconomico || false,
      activa: mod.activa,
    });
    setShowModalidadModal(true);
  };

  // Enviar notificaciones en lote
  const handleBatchSendNotifications = () => {
    if (selectedForNotification.length === 0) {
      alert('Selecciona al menos un estudiante con la casilla de verificación.');
      return;
    }
    const res = batchSendScholarshipNotifications(selectedForNotification);
    setBatchNotifMsg(res.message);
    setSelectedForNotification([]);
    setTimeout(() => setBatchNotifMsg(null), 5000);
  };

  const handleSelectAllForNotification = () => {
    if (selectedForNotification.length === filteredBecarios.length) {
      setSelectedForNotification([]);
    } else {
      setSelectedForNotification(filteredBecarios.map((b) => b.id));
    }
  };

  // Descarga del Manual Oficial y Diagrama de Becas en PDF
  const handleDownloadManualPdf = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#002855', '#FF6600', '#FFB81C'],
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // PÁGINA 1
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(0, 40, 85);
    doc.setLineWidth(1.2);
    doc.rect(10, 10, 190, 277);
    doc.setDrawColor(255, 102, 0);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 40, 85);
    doc.text('UNIVERSIDAD INTERNACIONAL DE LA PAZ', 105, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(255, 102, 0);
    doc.text('COMISIÓN GENERAL DE BECAS, ESTÍMULOS Y APOYOS UNIVERSITARIOS', 105, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('MANUAL OFICIAL DE POLÍTICAS, SUPUESTOS NORMATIVOS Y DIAGRAMA DE DECISIÓN DE BECAS', 105, 32, { align: 'center' });

    // Cuadro Informativo de Periodos
    doc.setFillColor(248, 250, 252);
    doc.rect(18, 38, 174, 16, 'F');
    doc.setDrawColor(200, 210, 220);
    doc.rect(18, 38, 174, 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 40, 85);
    doc.text('CALENDARIO DE PERIODOS OFICIALES:', 22, 43);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text('• Cuatrimestral (Licenciaturas y Posgrados): Periodo 187 (Mayo-Ago) evalúa para Periodo 188 (Sep-Dic).', 22, 48);
    doc.text('• Semestral (Médico Cirujano): Periodo 902 (Feb-Jul) evalúa para Periodo 903 (Ago-Ene).', 22, 52);

    // Título Matriz de Supuestos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(0, 40, 85);
    doc.text('MATRIZ DE SUPUESTOS NORMATIVOS Y RESOLUCIONES:', 18, 62);

    const supuestos = [
      {
        num: '1',
        title: 'Ratificación Ordinaria Favorable (Verde)',
        desc: '0 reprobadas en ordinario, colegiaturas al corriente, informe a tiempo, >=1,000 pts e inscrito.',
        res: 'APROBADA (100% Ratificada)',
        color: [16, 185, 129]
      },
      {
        num: '2',
        title: 'Superación de Condición Previa (Verde)',
        desc: 'Tenía Beca Condicionada el ciclo previo y en este periodo cumplió el 100% de requisitos.',
        res: 'APROBADA (Condición superada)',
        color: [16, 185, 129]
      },
      {
        num: '3',
        title: 'Beca Condicionada (Amarillo - 1ª Vez)',
        desc: 'Sin reprobadas pero incurrió en: pagos tardíos, informe fuera de tiempo, <1000 pts o reinscripción.',
        res: 'CONDICIONADA (Compromiso)',
        color: [245, 158, 11]
      },
      {
        num: '4',
        title: 'Reincidencia sin Visto Bueno (Rojo)',
        desc: 'Ya tenía Beca Condicionada en el periodo previo y volvió a incumplir en algún criterio normativo.',
        res: 'CANCELACIÓN / BAJA REGLAMENTARIA',
        color: [225, 29, 72]
      },
      {
        num: '5',
        title: 'Reincidencia con Visto Bueno Extraordinario (Amarillo)',
        desc: 'Reincide pero el Comité de Becas emite acuerdo y visto bueno extraordinario motivado.',
        res: 'CONDICIONADA C/ VISTO BUENO',
        color: [245, 158, 11]
      },
      {
        num: '6',
        title: 'Reprobación en Periodo Ordinario (Rojo)',
        desc: 'Reprobó 1 o más materias en ordinario. No negociable (incluso si aprobó extraordinario).',
        res: 'BAJA DIRECTA NO NEGOCIABLE',
        color: [225, 29, 72]
      },
      {
        num: '7',
        title: 'Carga Mínima de Materias (Exclusión)',
        desc: 'Cursa la mitad de materias (paga 50% colegiatura). Incompatible con beca institucional.',
        res: 'NO APLICA BECA / SUSPENSIÓN',
        color: [147, 51, 234]
      },
      {
        num: '8',
        title: 'Servicio Becario Departamental (10 hrs/sem)',
        desc: 'Asignado a Biblioteca, INDE, DEDU, Cómputo o Clínica. Acredita 10 hrs semanales.',
        res: 'LIBERACIÓN DE 1,000 PTS',
        color: [37, 99, 235]
      },
    ];

    let y = 68;
    supuestos.forEach((s) => {
      doc.setFillColor(250, 250, 252);
      doc.rect(18, y, 174, 18, 'F');
      doc.setDrawColor(220, 225, 230);
      doc.rect(18, y, 174, 18);

      doc.setFillColor(s.color[0], s.color[1], s.color[2]);
      doc.rect(18, y, 3.5, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 40, 85);
      doc.text(`${s.num}. ${s.title}`, 24, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(70, 70, 70);
      doc.text(s.desc, 24, y + 10, { maxWidth: 110 });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(s.color[0], s.color[1], s.color[2]);
      doc.text(`[${s.res}]`, 188, y + 9, { align: 'right' });

      y += 21;
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text('DOCUMENTO NORMATIVO INSTITUCIONAL · UNIVERSIDAD INTERNACIONAL DE LA PAZ · PÁGINA 1 DE 2', 105, 282, { align: 'center' });

    // PÁGINA 2: DIAGRAMA DE FLUJO VISUAL DE BECAS (VECTORIAL)
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(0, 40, 85);
    doc.setLineWidth(1.2);
    doc.rect(10, 10, 190, 277);
    doc.setDrawColor(255, 102, 0);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 40, 85);
    doc.text('DIAGRAMA OFICIAL DE DECISIÓN Y RATIFICACIÓN DE BECAS', 105, 22, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setTextColor(255, 102, 0);
    doc.text('ÁRBOL NORMATIVO DE EVALUACIÓN CUATRIMESTRAL Y SEMESTRAL', 105, 27, { align: 'center' });

    // Nodo 1: Inicio
    doc.setFillColor(0, 40, 85);
    doc.roundedRect(65, 33, 80, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('1. SOLICITUD / EXPEDIENTE DE BECA', 105, 40, { align: 'center' });

    // Flecha hacia abajo
    doc.setDrawColor(0, 40, 85);
    doc.setLineWidth(0.8);
    doc.line(105, 45, 105, 52);

    // Nodo 2: Filtro Carga Mínima
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(50, 52, 110, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 40, 85);
    doc.text('2. FILTRO DE CARGA ACADÉMICA A INSCRIBIR', 105, 59, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(70, 70, 70);
    doc.text('¿Llevará carga normal o carga mínima (mitad de materias / 50% colegiatura)?', 105, 65, { align: 'center' });

    // Ramas de Carga
    // Izquierda -> Carga Mínima (Exclusión)
    doc.line(70, 70, 40, 78);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(225, 29, 72);
    doc.roundedRect(18, 78, 60, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(225, 29, 72);
    doc.text('CARGA MÍNIMA:', 48, 83, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 20, 20);
    doc.text('🚫 NO APLICA BECA INSTITUCIONAL\n(Paga 50% colegiatura fija)', 48, 88, { align: 'center' });

    // Derecha -> Carga Normal -> Filtro Reprobadas
    doc.setDrawColor(0, 40, 85);
    doc.line(140, 70, 150, 78);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(120, 78, 70, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('CARGA REGULAR COMPLETA:', 155, 83, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(20, 80, 50);
    doc.text('Pasa a verificación de materias y calificaciones', 155, 88, { align: 'center' });

    // Flecha hacia Filtro 3
    doc.setDrawColor(0, 40, 85);
    doc.line(155, 94, 155, 101);
    doc.line(155, 101, 105, 101);
    doc.line(105, 101, 105, 106);

    // Nodo 3: Filtro Cero Reprobadas
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(0, 40, 85);
    doc.roundedRect(50, 106, 110, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 40, 85);
    doc.text('3. FILTRO DE NO REPROBACIÓN EN ORDINARIO', 105, 113, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(70, 70, 70);
    doc.text('¿Aprobó el 100% de materias en periodo ordinario?', 105, 119, { align: 'center' });

    // Izquierda -> Reprobó ordinario (Baja Directa)
    doc.setDrawColor(225, 29, 72);
    doc.line(70, 124, 40, 132);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(18, 132, 60, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(225, 29, 72);
    doc.text('REPROBÓ EN ORDINARIO:', 48, 138, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 20, 20);
    doc.text('🔴 BAJA DIRECTA REGLAMENTARIA\n(Incluso con examen extraordinario)', 48, 143, { align: 'center' });

    // Derecha -> Sin Reprobadas -> Auditoría Integral
    doc.setDrawColor(0, 40, 85);
    doc.line(140, 124, 150, 132);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(120, 132, 70, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('0 REPROBADAS EN ORDINARIO:', 155, 138, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(20, 80, 50);
    doc.text('Pasa a Auditoría Integral de Criterios', 155, 143, { align: 'center' });

    // Flecha hacia Auditoría 4
    doc.setDrawColor(0, 40, 85);
    doc.line(155, 150, 155, 157);
    doc.line(155, 157, 105, 157);
    doc.line(105, 157, 105, 162);

    // Nodo 4: Auditoría de Criterios
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(0, 40, 85);
    doc.roundedRect(35, 162, 140, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 40, 85);
    doc.text('4. AUDITORÍA DE 6 CRITERIOS INTEGRALES', 105, 168, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(60, 60, 60);
    doc.text('Pagos al corriente · Informe en tiempo · 1,000 pts becario · Reinscripción · Sin sanciones · Promedio >= 8.0', 105, 174, { align: 'center' });

    // Dos Resultados Finales
    // Izquierda: Cumple 100%
    doc.setDrawColor(16, 185, 129);
    doc.line(65, 182, 50, 192);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(18, 192, 75, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text('CUMPLE CABALMENTE (100%):', 55, 198, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(20, 80, 50);
    doc.text('🟢 RATIFICAR Y APROBAR BECA (Verde)\nSi tenía condición previa ➔ SUPERADA CON ÉXITO', 55, 204, { align: 'center' });

    // Derecha: Incumplimiento Parcial
    doc.setDrawColor(245, 158, 11);
    doc.line(145, 182, 160, 192);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(115, 192, 78, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(217, 119, 6);
    doc.text('INCUMPLIMIENTO PARCIAL:', 154, 198, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(120, 53, 15);
    doc.text('• 1ª Vez ➔ 🟡 BECA CONDICIONADA (Mini-Modal)\n• Reincide s/ V.B. ➔ 🔴 CANCELACIÓN DE BECA\n• Reincide c/ V.B. ➔ 🟡 CONDICIONADA EXTRAORDINARIA', 154, 204, { align: 'center' });

    const fY = 236;
    doc.setDrawColor(150, 150, 150);
    doc.line(25, fY, 75, fY);
    doc.line(85, fY, 135, fY);
    doc.line(145, fY, 195, fY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 40, 85);
    doc.text('Comité de Becas y Estímulos', 50, fY + 4, { align: 'center' });
    doc.text('Dirección de Finanzas', 110, fY + 4, { align: 'center' });
    doc.text('Dirección de Control Escolar', 170, fY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Dra. Paulina Velázquez R.', 50, fY + 8, { align: 'center' });
    doc.text('Mtro. Ricardo Domínguez V.', 110, fY + 8, { align: 'center' });
    doc.text('Lic. Patricia Morales S.', 170, fY + 8, { align: 'center' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text('DOCUMENTO NORMATIVO INSTITUCIONAL · UNIVERSIDAD INTERNACIONAL DE LA PAZ · PÁGINA 2 DE 2', 105, 282, { align: 'center' });

    doc.save('Manual_y_Diagrama_Becas_UNIPAZ.pdf');
  };

  const openEvaluationModal = (student: UserProfile) => {
    setEvaluatingStudent(student);
    setShowConditionalModal(false);
    const prog = getStudentScholarshipProgress(student.id);
    const isCond = student.estatus_ratificacion_beca === 'condicionada' || student.refrendo_beca_condicionado_admin || student.habia_tenido_beca_condicionada;
    
    setEvalData({
      pagos_al_corriente: student.cumple_pagos_al_corriente !== undefined ? student.cumple_pagos_al_corriente : true,
      sin_reprobadas: student.cumple_cero_reprobaciones !== undefined ? student.cumple_cero_reprobaciones : true,
      solicitud_a_tiempo: student.informe_becario_entregado !== undefined ? student.informe_becario_entregado : true,
      sin_sanciones: student.cumple_sin_sanciones !== undefined ? student.cumple_sin_sanciones : true,
      esta_inscrito_proximo_ciclo: student.esta_inscrito_proximo_ciclo !== undefined ? student.esta_inscrito_proximo_ciclo : true,
      proxima_carga_materias: (student.proxima_carga_materias || student.carga_materias_actual || 'normal') as 'normal' | 'minima',
      cumple_puntos_1000: prog.puntosTotales >= 1000,
      visto_bueno_reincidencia: student.visto_bueno_reincidencia_comite || false,
      motivo_visto_bueno: '',
      condiciones: student.condiciones_ratificacion_beca || (isCond ? student.resolucion_refrendo_observaciones || '' : ''),
      tipo_beca: student.tipo_beca || modalidadesCatalogo[0]?.nombre || 'Excelencia Académica (Promedio 9.6 - 10.0)',
      porcentaje_beca: student.porcentaje_beca || 50,
      promedio_academico: student.promedio_academico || 9.0,
      observaciones: student.resolucion_refrendo_observaciones || '',
    });
  };

  const detectedReasons = useMemo(() => {
    if (!evaluatingStudent) return [];
    const reasons: string[] = [];
    if (!evalData.pagos_al_corriente) reasons.push('Colegiaturas con pagos tardíos o pendientes de regularización.');
    if (!evalData.solicitud_a_tiempo) reasons.push('Informe de becario entregado de forma extemporánea.');
    if (!evalData.cumple_puntos_1000) reasons.push('Puntos formativos cuatrimestrales incompletos (< 1,000 pts).');
    if (!evalData.esta_inscrito_proximo_ciclo) reasons.push('Trámite de reinscripción al próximo periodo pendiente.');
    if (!evalData.sin_sanciones) reasons.push('Registra incidencia o acta disciplinaria en el periodo.');
    if ((evalData.promedio_academico || 0) < 8.0) reasons.push(`Promedio académico (${evalData.promedio_academico}) inferior al estándar.`);
    if (evalData.visto_bueno_reincidencia) reasons.push('Reincidencia en condición previa autorizada con Visto Bueno del Comité.');
    return reasons;
  }, [evaluatingStudent, evalData]);

  const handleSaveEvaluation = (resolution: 'aprobada' | 'condicionada' | 'rechazada') => {
    if (!evaluatingStudent) return;

    // 1. Carga Mínima de Materias: Exclusión directa de beca institucional
    if ((resolution === 'aprobada' || resolution === 'condicionada') && evalData.proxima_carga_materias === 'minima') {
      alert('🚫 NO APLICA BECA INSTITUCIONAL: El estudiante llevará Carga Mínima de materias en el ciclo por venir y pagará la mitad de colegiatura correspondiente. Por reglamento institucional, no es acreedor a beca ni ratificación.');
      return;
    }

    // 2. Reprobación en ordinario siempre es baja definitiva
    if ((resolution === 'aprobada' || resolution === 'condicionada') && !evalData.sin_reprobadas) {
      alert('⚠️ BAJA DIRECTA REGLAMENTARIA: No es posible ratificar ni condicionar la beca si el alumno reprobó una materia en ordinario (incluso si aprobó examen extraordinario). Debe dictaminarse como Rechazar / Baja de Beca.');
      return;
    }

    const hadPreviousCondition = Boolean(
      evaluatingStudent.estatus_ratificacion_beca === 'condicionada' ||
      evaluatingStudent.refrendo_beca_condicionado_admin ||
      evaluatingStudent.habia_tenido_beca_condicionada
    );

    const cumpleTodo = Boolean(
      evalData.sin_reprobadas &&
      evalData.pagos_al_corriente &&
      evalData.solicitud_a_tiempo &&
      evalData.sin_sanciones &&
      evalData.esta_inscrito_proximo_ciclo &&
      evalData.proxima_carga_materias === 'normal' &&
      evalData.cumple_puntos_1000
    );

    // 3. Control de Reincidencia: si ya era condicionada y volvió a incumplir
    if (hadPreviousCondition && !cumpleTodo) {
      if ((resolution === 'condicionada' || resolution === 'aprobada') && !evalData.visto_bueno_reincidencia) {
        alert('⚠️ CANCELACIÓN POR REINCIDENCIA: El estudiante ya contaba con estatus de Beca Condicionada en el ciclo previo y ha vuelto a presentar incumplimientos. Por normativa institucional, la reincidencia conlleva a la CANCELACIÓN DE LA BECA, a menos que el Comité de Becas active el Visto Bueno Extraordinario.');
        return;
      }
    }

    let finalCond = evalData.condiciones.trim();
    if (resolution === 'condicionada' && !finalCond) {
      if (!evalData.pagos_al_corriente) finalCond = 'Regularización de pagos tardíos de colegiatura.';
      else if (!evalData.solicitud_a_tiempo) finalCond = 'Entrega extemporánea de informe de becario autorizada por el Comité.';
      else if (!evalData.esta_inscrito_proximo_ciclo) finalCond = 'Condicionada a completar la reinscripción al próximo periodo.';
      else if (!evalData.cumple_puntos_1000) finalCond = 'Autorización especial de puntos formativos cuatrimestrales.';
      else finalCond = 'Beca otorgada bajo acuerdo y condición especial del Comité de Becas.';
    }

    if (evalData.visto_bueno_reincidencia && evalData.motivo_visto_bueno.trim()) {
      finalCond = `${finalCond ? `${finalCond} - ` : ''}Visto Bueno Extraordinario Comité: ${evalData.motivo_visto_bueno.trim()}`;
    }

    // Registrar en Bitácora Inmutable (Audit Log)
    addScholarshipAuditLog({
      student_id: evaluatingStudent.id,
      periodo_codigo: activePeriod.codigo,
      periodo_nombre: activePeriod.nombre,
      autor_nombre: 'Comité de Becas UNIPAZ',
      resolucion: resolution,
      tipo_beca: evalData.tipo_beca,
      porcentaje_beca: evalData.porcentaje_beca,
      promedio_evaluado: evalData.promedio_academico,
      criterios: {
        sin_reprobadas: evalData.sin_reprobadas,
        pagos_al_corriente: evalData.pagos_al_corriente,
        solicitud_a_tiempo: evalData.solicitud_a_tiempo,
        sin_sanciones: evalData.sin_sanciones,
        esta_inscrito_proximo_ciclo: evalData.esta_inscrito_proximo_ciclo,
        cumple_puntos_1000: evalData.cumple_puntos_1000,
        carga_materias: evalData.proxima_carga_materias,
        visto_bueno_reincidencia: evalData.visto_bueno_reincidencia,
      },
      condicion_acordada: finalCond,
      comentarios_comite: evalData.observaciones || (
        resolution === 'aprobada'
          ? (hadPreviousCondition && cumpleTodo
              ? 'Estatus condicionado superado con éxito. Beca ratificada regular en estatus APROBADA.'
              : 'Beca ratificada satisfactoriamente.')
          : resolution === 'condicionada'
          ? `Beca condicionada: ${finalCond}`
          : 'Baja reglamentaria.'
      ),
      notificacion_enviada: false,
    });

    notifyScholarshipResolution(
      evaluatingStudent.id,
      resolution,
      evalData.tipo_beca as any,
      evalData.porcentaje_beca,
      evalData.observaciones || (
        resolution === 'aprobada'
          ? (hadPreviousCondition && cumpleTodo
              ? 'Estatus condicionado superado con éxito. Beca ratificada regular en estatus APROBADA.'
              : 'Beca ratificada satisfactoriamente.')
          : resolution === 'condicionada'
          ? `Beca condicionada: ${finalCond}`
          : 'Baja reglamentaria.'
      ),
      finalCond
    );

    setShowConditionalModal(false);
    setEvaluatingStudent(null);
  };

  const studentAuditLogs = useMemo(() => {
    if (!selectedAuditStudent) return [];
    return scholarshipAuditLogs.filter((l) => l.student_id === selectedAuditStudent.id);
  }, [selectedAuditStudent, scholarshipAuditLogs]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2.5 py-0.5 rounded-full">
              Comisión General de Becas y Estímulos
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIPAZ / IESPAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-unipaz-navy dark:text-white mt-1 tracking-tight">
            Gestión y Configuración del Sistema de Becas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convocatorias, auditoría de requisitos, ratificación cuatrimestral y Servicio Becario.
          </p>
        </div>

        {/* Indicador Periodo Vigente */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm text-xs">
          <Clock className="w-4 h-4 text-unipaz-orange" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Periodo Activo:</span>
            <strong className="text-unipaz-navy dark:text-white font-black">
              Periodo {activePeriod.codigo} ({activePeriod.nombre})
            </strong>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-unipaz-orange text-slate-950 shadow-md shadow-orange-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider">Becarios Activos</span>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black">{becarios.length}</div>
          <p className="text-[11px] font-medium opacity-90">
            {((becarios.length / (students.length || 1)) * 100).toFixed(1)}% de la matrícula total
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Solicitudes Nuevas</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{solicitudesPendientes.length}</div>
          <p className="text-[11px] text-slate-400">Aspirantes pendientes de dictamen</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Servicio Becario</span>
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-unipaz-navy dark:text-white">{becariosDept.length}</div>
          <p className="text-[11px] text-slate-400">1,000 pts acreditados con servicio</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Meta Formativa</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">1,000</div>
          <p className="text-[11px] text-slate-400">Puntos obligatorios cuatrimestre</p>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('convocatoria')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'convocatoria'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Calendar className="w-4 h-4" />
          1. Convocatorias & Asignación
        </button>

        <button
          onClick={() => setActiveTab('directorio')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'directorio'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          2. Directorio de Becarios & Ratificación ({becarios.length})
        </button>

        <button
          onClick={() => setActiveTab('modalidades')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'modalidades'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Award className="w-4 h-4" />
          3. Modalidades de Beca ({modalidadesCatalogo.length})
        </button>

        <button
          onClick={() => setActiveTab('politicas')}
          className={`py-2.5 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            activeTab === 'politicas'
              ? 'bg-unipaz-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          4. Políticas y Reglamentos
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBPESTAÑA 1: CONVOCATORIAS & ASIGNACIÓN                 */}
      {/* ======================================================== */}
      {activeTab === 'convocatoria' && (
        <div className="space-y-6">
          {/* BANNER 2 CALENDARIOS */}
          <form onSubmit={handleSaveDates} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-unipaz-orange" />
                  Calendario Oficial de Fechas de Becas
                </h3>
                <p className="text-xs text-slate-500">
                  Distingue las convocatorias de nuevo ingreso de los periodos de renovación cuatrimestral y publicación de dictámenes.
                </p>
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {savedSuccess ? '¡Guardado con Éxito!' : 'Guardar Calendarios'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendario 1: Nuevas Solicitudes */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-unipaz-orange"></span>
                  1. Convocatoria de Nuevas Solicitudes de Beca
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Inicio Solicitudes:</label>
                    <input
                      type="date"
                      value={fechaInicioSolicitud}
                      onChange={(e) => setFechaInicioSolicitud(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Cierre Solicitudes:</label>
                    <input
                      type="date"
                      value={fechaFinSolicitud}
                      onChange={(e) => setFechaFinSolicitud(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha de Publicación de Resoluciones:</label>
                  <input
                    type="date"
                    value={fechaPubResolucion}
                    onChange={(e) => setFechaPubResolucion(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs text-unipaz-orange font-bold"
                  />
                </div>
              </div>

              {/* Calendario 2: Renovación / Ratificación (3 veces al año) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  2. Periodo de Renovación & Ratificación (Cierre Cuatrimestre)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Inicio Ratificación:</label>
                    <input
                      type="date"
                      value={fechaInicioRatificacion}
                      onChange={(e) => setFechaInicioRatificacion(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Fin Ratificación:</label>
                    <input
                      type="date"
                      value={fechaFinRatificacion}
                      onChange={(e) => setFechaFinRatificacion(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha Publicación Dictámenes Ratificados:</label>
                  <input
                    type="date"
                    value={fechaPubDictamen}
                    onChange={(e) => setFechaPubDictamen(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono text-xs text-blue-600 font-bold"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* BANDEJA DE SOLICITUDES DE BECAS NUEVAS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Bandeja de Solicitudes de Becas Nuevas ({solicitudesPendientes.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Aspirantes que han enviado su solicitud formal para dictaminar su porcentaje de beca.
                </p>
              </div>
            </div>

            {solicitudesPendientes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-white/10">
                No hay solicitudes de beca pendientes en este momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold">
                      <th className="py-3 px-3">Estudiante</th>
                      <th className="py-3 px-3">Programa Académico</th>
                      <th className="py-3 px-3">Promedio</th>
                      <th className="py-3 px-3">Modalidad Solicitada</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {solicitudesPendientes.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <strong className="text-unipaz-navy dark:text-white">{s.nombre} {s.apellidos}</strong>
                          <div className="text-[10px] font-mono text-slate-400">{s.matricula}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">{s.carrera}</td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">{s.promedio_academico || 9.0}</td>
                        <td className="py-3 px-3">{s.tipo_beca_solicitada || s.tipo_beca || 'Excelencia Académica'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                            Pendiente Revisión
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => openApplicantReviewModal(s)}
                            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 ml-auto transition-all hover:scale-105 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Revisar Expediente
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ASIGNACIÓN Y CONVOCATORIA DE SERVICIO BECARIO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario Asignación Servicio Becario */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
                <Building2 className="w-5 h-5 text-purple-600" />
                Asignación & Convocatoria a Servicio Becario
              </div>
              <p className="text-xs text-slate-500">
                Los estudiantes becados pueden prestar su servicio en departamentos institucionales para liberar sus 1,000 puntos cuatrimestrales.
              </p>

              {deptMsg && (
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-300 text-purple-900 text-xs font-bold">
                  {deptMsg}
                </div>
              )}

              <form onSubmit={handleAssignDeptBeca} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Seleccionar Estudiante Becario:</label>
                  <select
                    value={deptStudentId}
                    onChange={(e) => setDeptStudentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="">-- Selecciona un estudiante --</option>
                    {students.map((s) => (
                      <option key={`dept-${s.id}`} value={s.id}>
                        {s.nombre} {s.apellidos} ({s.matricula}) {s.tiene_beca ? `· Beca ${s.porcentaje_beca}%` : '· Sin Beca'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Departamento Destino:</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold text-purple-700"
                    >
                      {departamentosDisponibles.map((d) => (
                        <option key={d.id} value={d.nombre}>
                          {d.nombre} ({d.cupo_ocupado || 0}/{d.cupo_maximo || 10} cupos)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">% de Beca Asignado:</label>
                    <select
                      value={deptPorcentaje}
                      onChange={(e) => setDeptPorcentaje(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                    >
                      {CATALOGO_BECAS.map((b) => (
                        <option key={`cat-dept-${b.clave}`} value={b.porcentaje}>
                          {b.clave} · {b.porcentaje}% ({b.descripcion})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Horas Semanales:</label>
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={deptHorasSemanales}
                      onChange={(e) => setDeptHorasSemanales(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Promedio Académico:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="7"
                      max="10"
                      value={deptPromedio}
                      onChange={(e) => setDeptPromedio(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-bold text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  <Building2 className="w-4 h-4" />
                  Asignar a Servicio Becario
                </button>
              </form>
            </div>

            {/* Asignación Directa de Beca Regular */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-unipaz-navy dark:text-white font-black text-sm">
                <Award className="w-5 h-5 text-unipaz-orange" />
                Asignación Directa de Beca Institucional
              </div>
              <p className="text-xs text-slate-500">
                Otorga beca institucional regular a estudiantes de nuevo ingreso o aspirantes sin beca.
              </p>

              {asignacionMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-900 text-xs font-bold">
                  {asignacionMsg}
                </div>
              )}

              <form onSubmit={handleAssignRegularBeca} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Estudiante Sin Beca:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="">-- Selecciona un aspirante --</option>
                    {studentsSinBeca.map((s) => (
                      <option key={`reg-${s.id}`} value={s.id}>
                        {s.nombre} {s.apellidos} ({s.matricula}) · {s.carrera}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Modalidad de Beca Institucional:</label>
                  <select
                    value={selectedTipoBeca}
                    onChange={(e) => setSelectedTipoBeca(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    {modalidadesCatalogo.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} (Descuento {m.descuento_min}% - {m.descuento_max}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">% de Descuento:</label>
                    <select
                      value={selectedPorcentaje}
                      onChange={(e) => setSelectedPorcentaje(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                    >
                      {CATALOGO_BECAS.map((b) => (
                        <option key={`reg-pct-${b.clave}`} value={b.porcentaje}>
                          {b.clave} · {b.porcentaje}% ({b.descripcion})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Promedio Actual:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="7"
                      max="10"
                      value={promedioAsignado}
                      onChange={(e) => setPromedioAsignado(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-bold text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  <Award className="w-4 h-4" />
                  Asignar Beca Regular
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPESTAÑA 2: DIRECTORIO DE BECARIOS & RATIFICACIÓN      */}
      {/* ======================================================== */}
      {activeTab === 'directorio' && (
        <div className="space-y-6">
          {/* Barra de Acciones de Notificación en Lote & Búsqueda */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar becario por nombre, matrícula o carrera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleSelectAllForNotification}
                className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {selectedForNotification.length === filteredBecarios.length && filteredBecarios.length > 0 ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>

              <button
                onClick={handleBatchSendNotifications}
                disabled={selectedForNotification.length === 0}
                className={`py-2.5 px-4 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md ${
                  selectedForNotification.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Dictámenes ({selectedForNotification.length})
              </button>
            </div>
          </div>

          {batchNotifMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn">
              {batchNotifMsg}
            </div>
          )}

          {/* Tabla de Becarios */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedForNotification.length === filteredBecarios.length && filteredBecarios.length > 0}
                        onChange={handleSelectAllForNotification}
                        className="rounded"
                      />
                    </th>
                    <th className="py-3 px-3">Estudiante</th>
                    <th className="py-3 px-3">Programa Académico</th>
                    <th className="py-3 px-3">Beca / %</th>
                    <th className="py-3 px-3">Puntos Beca</th>
                    <th className="py-3 px-3">Estatus Ratificación</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredBecarios.map((s) => {
                    const sch = getStudentScholarshipProgress(s.id);
                    const isSelected = selectedForNotification.includes(s.id);
                    const hasAudit = scholarshipAuditLogs.some((l) => l.student_id === s.id);

                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedForNotification((prev) =>
                                isSelected ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-unipaz-navy dark:text-white">{s.nombre} {s.apellidos}</strong>
                          <div className="text-[10px] font-mono text-slate-400">{s.matricula}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{s.carrera}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-unipaz-orange">{s.porcentaje_beca}%</span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{s.tipo_beca}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${sch.puntosTotales >= 1000 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {sch.puntosTotales} / 1,000 pts
                            </span>
                            {sch.isAcreditadoBeca && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {s.estatus_ratificacion_beca === 'ratificada' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Aprobada / Ratificada
                            </span>
                          ) : s.estatus_ratificacion_beca === 'condicionada' ? (
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForConditionDetails(s)}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-all flex items-center gap-1 shadow-xs hover:scale-105"
                              title="Click para ver causas y compromiso de Beca Condicionada"
                            >
                              <span>⚠️ Beca Condicionada</span>
                              <span className="text-[9px] underline font-normal">(ver)</span>
                            </button>
                          ) : s.estatus_ratificacion_beca === 'suspendida' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              ✕ Baja / Suspendida
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              Pendiente Evaluación
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón Bitácora Inmutable */}
                            <button
                              onClick={() => {
                                setSelectedAuditStudent(s);
                                setShowAuditLogModal(true);
                              }}
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Ver Bitácora e Historial Inmutable"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Botón Dictamen PDF */}
                            <button
                              onClick={() => setSelectedStudentForDictamen(s)}
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Ver Dictamen Oficial"
                            >
                              <FileText className="w-3.5 h-3.5 text-unipaz-orange" />
                            </button>

                            {/* Botón Evaluar y Ratificar */}
                            <button
                              onClick={() => openEvaluationModal(s)}
                              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 transition-all"
                            >
                              <Award className="w-3.5 h-3.5" />
                              Evaluar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPESTAÑA 3: MODALIDADES DE BECA (CRUD COMPLETO CON VISTA DUAL) */}
      {/* ======================================================== */}
      {activeTab === 'modalidades' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-unipaz-orange" />
                Catálogo de Modalidades de Beca Institucionales (CRUD)
              </h3>
              <p className="text-xs text-slate-500">
                Administra los tipos de beca reconocidos, sus descripciones, rangos de descuento y promedios mínimos requeridos.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Selector de Vista Dual (Mosaico / Lista) */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setModalidadesViewMode('grid')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    modalidadesViewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-unipaz-orange shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Vista en Mosaico (Tarjetas)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Mosaico
                </button>
                <button
                  onClick={() => setModalidadesViewMode('list')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    modalidadesViewMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-unipaz-orange shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Vista en Lista (Tabla)"
                >
                  <List className="w-3.5 h-3.5" />
                  Lista
                </button>
              </div>

              <button
                onClick={openCreateModalidad}
                className="py-2.5 px-4 rounded-2xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Nueva Modalidad
              </button>
            </div>
          </div>

          {modalidadesViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modalidadesCatalogo.map((m) => (
                <div key={m.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-full">
                        Descuento {m.descuento_min}% - {m.descuento_max}%
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {m.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-unipaz-navy dark:text-white leading-tight">
                      {m.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {m.descripcion}
                    </p>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 space-y-1">
                      <div>• Promedio mínimo: <strong>{m.promedio_minimo || 8.0}</strong></div>
                      <div>• Requiere estudio socioeconómico: <strong>{m.requiere_estudio_socioeconomico ? 'SÍ' : 'NO'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => openEditModalidad(m)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la modalidad "${m.nombre}"?`)) {
                          deleteModalidadBeca(m.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Eliminar Modalidad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold">
                    <th className="py-3 px-3">Modalidad de Beca</th>
                    <th className="py-3 px-3">Rango de Descuento</th>
                    <th className="py-3 px-3">Promedio Mínimo</th>
                    <th className="py-3 px-3">Estudio Socioeconómico</th>
                    <th className="py-3 px-3">Estatus</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {modalidadesCatalogo.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <strong className="text-unipaz-navy dark:text-white block">{m.nombre}</strong>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{m.descripcion}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-unipaz-orange">{m.descuento_min}% - {m.descuento_max}%</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {m.promedio_minimo || 8.0}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.requiere_estudio_socioeconomico ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {m.requiere_estudio_socioeconomico ? 'REQUERIDO' : 'OPCIONAL'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {m.activa ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModalidad(m)}
                            className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la modalidad "${m.nombre}"?`)) {
                                deleteModalidadBeca(m.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Eliminar Modalidad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPESTAÑA 4: POLÍTICAS Y REGLAMENTO                     */}
      {/* ======================================================== */}
      {activeTab === 'politicas' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-unipaz-orange" />
                  Manual Normativo & Diagrama de Flujo de Becas UNIPAZ
                </h3>
                <p className="text-xs text-slate-500">
                  Descarga el documento oficial en formato PDF con la matriz de 8 supuestos normativos y el árbol vectorial de decisión.
                </p>
              </div>
              <button
                onClick={handleDownloadManualPdf}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-unipaz-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Descargar Manual y Diagrama (PDF Oficial)
              </button>
            </div>

            {/* Matriz Visual de los 8 Supuestos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                <span className="font-black text-xs text-emerald-950 dark:text-emerald-200 block">
                  1. Ratificación Ordinaria Favorable (Verde)
                </span>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300">
                  0 reprobadas en ordinario, colegiaturas al corriente, informe de becario entregado a tiempo, 1,000 pts e inscrito al siguiente ciclo. Dictamen: <strong>APROBADA (100% Ratificada)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                <span className="font-black text-xs text-emerald-950 dark:text-emerald-200 block">
                  2. Superación de Condición Previa (Verde)
                </span>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300">
                  El alumno tenía Beca Condicionada en el ciclo previo y en este periodo cumplió el 100% de los requisitos normativos. Dictamen: <strong>APROBADA (Condición Superada con Éxito)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 space-y-1.5">
                <span className="font-black text-xs text-amber-950 dark:text-amber-200 block">
                  3. Beca Condicionada (Amarillo - 1ª Vez)
                </span>
                <p className="text-[11px] text-amber-900 dark:text-amber-300">
                  Sin reprobadas pero incurrió en: pagos tardíos, informe fuera de tiempo, puntaje incompleto o reinscripción pendiente. Dictamen: <strong>BECA CONDICIONADA (con compromiso)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                <span className="font-black text-xs text-rose-950 dark:text-rose-200 block">
                  4. Reincidencia sin Visto Bueno (Rojo)
                </span>
                <p className="text-[11px] text-rose-900 dark:text-rose-300">
                  El estudiante ya contaba con Beca Condicionada en el ciclo previo y volvió a incumplir requisitos. Dictamen: <strong>CANCELACIÓN / BAJA REGLAMENTARIA</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 space-y-1.5">
                <span className="font-black text-xs text-amber-950 dark:text-amber-200 block">
                  5. Reincidencia con Visto Bueno Extraordinario (Amarillo)
                </span>
                <p className="text-[11px] text-amber-900 dark:text-amber-300">
                  Reincide pero el Comité de Becas emite acuerdo y visto bueno extraordinario motivado en sesión. Dictamen: <strong>BECA CONDICIONADA C/ VISTO BUENO</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                <span className="font-black text-xs text-rose-950 dark:text-rose-200 block">
                  6. Reprobación en Periodo Ordinario (Rojo)
                </span>
                <p className="text-[11px] text-rose-900 dark:text-rose-300">
                  Reprobó 1 o más materias en ordinario. No negociable (incluso si acreditó con extraordinario). Dictamen: <strong>BAJA DIRECTA REGLAMENTARIA</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 space-y-1.5">
                <span className="font-black text-xs text-purple-950 dark:text-purple-200 block">
                  7. Carga Mínima de Materias (Exclusión)
                </span>
                <p className="text-[11px] text-purple-900 dark:text-purple-300">
                  El alumno cursará la mitad de materias (paga 50% colegiatura). Incompatible con beca institucional. Dictamen: <strong>NO APLICA BECA / SUSPENSIÓN</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 space-y-1.5">
                <span className="font-black text-xs text-blue-950 dark:text-blue-200 block">
                  8. Servicio Becario Departamental (10 hrs/sem)
                </span>
                <p className="text-[11px] text-blue-900 dark:text-blue-300">
                  Asignado a Biblioteca, INDE, DEDU, Cómputo o Clínica. Acredita 10 hrs semanales. Dictamen: <strong>LIBERACIÓN AUTOMÁTICA DE 1,000 PTS</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL REVISAR SOLICITUD DE ASPIRANTE (EXPEDIENTE COMPLETO) */}
      {/* ======================================================== */}
      {selectedApplicantForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApplicantForReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Expediente */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-unipaz-orange bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-full">
                    Comité Evaluador de Becas
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                    {selectedApplicantForReview.matricula}
                  </span>
                </div>
                <h3 className="text-lg font-black text-unipaz-navy dark:text-white mt-0.5">
                  Expediente de Solicitud · {selectedApplicantForReview.nombre} {selectedApplicantForReview.apellidos}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedApplicantForReview.carrera} · {selectedApplicantForReview.cuatrimestre}° Cuatrimestre
                </p>
              </div>
            </div>

            {/* 1. FICHA ACADÉMICA Y DATOS PERSONALES */}
            <div className="space-y-2">
              <span className="text-xs font-black text-unipaz-navy dark:text-white uppercase tracking-wider block">
                1. Datos Académicos y Personales del Aspirante
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Promedio Académico:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm font-black">
                    {selectedApplicantForReview.promedio_academico || 9.0}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sexo:</span>
                  <strong className="text-slate-700 dark:text-slate-200">{selectedApplicantForReview.sexo || 'Hombre'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Correo Institucional:</span>
                  <strong className="text-slate-700 dark:text-slate-200 truncate block">{selectedApplicantForReview.email || 'estudiante@unipaz.mx'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Grupo Prioritario / Etnia:</span>
                  <strong className="text-slate-700 dark:text-slate-200">{selectedApplicantForReview.pertenencia_etnica_prioritaria || 'Población General'}</strong>
                </div>
              </div>
            </div>

            {/* 2. DETALLES DE LA POSTULACIÓN & EXPOSICIÓN DE MOTIVOS */}
            <div className="space-y-2">
              <span className="text-xs font-black text-unipaz-navy dark:text-white uppercase tracking-wider block">
                2. Postulación y Exposición de Motivos
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Modalidad Solicitada por el Estudiante:</span>
                    <strong className="text-unipaz-orange text-xs">
                      {selectedApplicantForReview.tipo_beca_solicitada || 'Excelencia Académica (Promedio 9.6 - 10.0)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Situación Laboral:</span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {selectedApplicantForReview.situacion_laboral_solicitante || 'Estudiante Tiempo Completo / Sin empleo'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Justificación y Motivos redactados por el estudiante:</span>
                  <p className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedApplicantForReview.motivos_solicitud_beca ||
                      'Solicito la beca institucional UNIPAZ para mantener la continuidad en mis estudios profesionales con excelencia y compromiso social, comprometiéndome a cumplir puntualmente con todas las horas y actividades formativas del PFI.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. ESTUDIO SOCIOECONÓMICO Y DOCUMENTACIÓN */}
            <div className="space-y-2">
              <span className="text-xs font-black text-unipaz-navy dark:text-white uppercase tracking-wider block">
                3. Estudio Socioeconómico & Documentos Adjuntos
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estudio Socioeconómico:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedApplicantForReview.estudio_socioeconomico_entregado ? '✓ Entregado' : '✓ En Expediente'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ingreso Familiar Estimado:</span>
                  <strong className="text-slate-700 dark:text-slate-200">$12,000 - $16,500 MXN</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Personas Dependientes:</span>
                  <strong className="text-slate-700 dark:text-slate-200">3 - 4 integrantes</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tipo de Vivienda:</span>
                  <strong className="text-slate-700 dark:text-slate-200">Propia / Zona Urbana</strong>
                </div>
              </div>
            </div>

            {/* 4. DICTAMINACIÓN Y RESOLUCIÓN OFICIAL */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 space-y-4">
              <span className="text-xs font-black text-blue-950 dark:text-blue-200 uppercase tracking-wider block">
                4. Dictamen Oficial del Comité de Becas
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidad Definitiva a Asignar:
                  </label>
                  <select
                    value={applicantReviewTipoBeca}
                    onChange={(e) => setApplicantReviewTipoBeca(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                  >
                    {modalidadesCatalogo.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Porcentaje de Descuento Aprobado:
                  </label>
                  <select
                    value={applicantReviewPorcentaje}
                    onChange={(e) => setApplicantReviewPorcentaje(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold font-mono text-unipaz-orange"
                  >
                    {[10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 100].map((pct) => (
                      <option key={pct} value={pct}>
                        {pct}% de Descuento
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones / Fundamentación del Dictamen:
                </label>
                <input
                  type="text"
                  value={applicantReviewObservaciones}
                  onChange={(e) => setApplicantReviewObservaciones(e.target.value)}
                  placeholder="Ej. Cumple con el promedio reglamentario y estudio socioeconómico verificado."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Condiciones Formales (Solo si se aprueba como Condicionada):
                </label>
                <input
                  type="text"
                  value={applicantReviewCondiciones}
                  onChange={(e) => setApplicantReviewCondiciones(e.target.value)}
                  placeholder="Ej. Mantener promedio ≥ 9.0 y regularizar documentación en 30 días."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            {/* Acciones de Dictamen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  notifyScholarshipResolution(
                    selectedApplicantForReview.id,
                    'rechazada',
                    applicantReviewTipoBeca,
                    0,
                    applicantReviewObservaciones || 'Solicitud no aprobada por el Comité de Becas según cupo y criterios vigentes.'
                  );
                  setSelectedApplicantForReview(null);
                }}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <XCircle className="w-4 h-4" />
                Rechazar Solicitud
              </button>

              <button
                type="button"
                onClick={() => {
                  notifyScholarshipResolution(
                    selectedApplicantForReview.id,
                    'condicionada',
                    applicantReviewTipoBeca,
                    applicantReviewPorcentaje,
                    applicantReviewObservaciones || 'Beca autorizada en estatus condicionado por el Comité.',
                    applicantReviewCondiciones || 'Cumplir con el promedio mínimo y horas formativas PFI.'
                  );
                  setSelectedApplicantForReview(null);
                }}
                className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Aprobar Condicionada
              </button>

              <button
                type="button"
                onClick={() => {
                  notifyScholarshipResolution(
                    selectedApplicantForReview.id,
                    'aprobada',
                    applicantReviewTipoBeca,
                    applicantReviewPorcentaje,
                    applicantReviewObservaciones || 'Solicitud dictaminada y aprobada favorablemente por el Comité de Becas.'
                  );
                  setSelectedApplicantForReview(null);
                }}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar y Asignar Beca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL BITÁCORA INMUTABLE / AUDIT LOG HISTORIAL          */}
      {/* ======================================================== */}
      {showAuditLogModal && selectedAuditStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowAuditLogModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-unipaz-navy text-white">
                <History className="w-6 h-6 text-unipaz-orange" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Expediente de Auditoría Inmutable</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Historial de Resoluciones · {selectedAuditStudent.nombre} {selectedAuditStudent.apellidos}
                </h3>
              </div>
            </div>

            {studentAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-white/10">
                No hay registros históricos previos para este estudiante. Las nuevas evaluaciones generarán bitácoras permanentes.
              </div>
            ) : (
              <div className="space-y-3">
                {studentAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-unipaz-navy dark:text-white">
                        Periodo {log.periodo_codigo} ({log.periodo_nombre})
                      </span>
                      <span className="font-mono text-slate-400">
                        {new Date(log.fecha_registro).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.resolucion === 'aprobada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.resolucion === 'condicionada'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.resolucion.toUpperCase()} · {log.porcentaje_beca}%
                      </span>
                      <span className="text-slate-500 font-medium">{log.tipo_beca}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      {log.comentarios_comite}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Autor: {log.autor_nombre}</span>
                      <span>{log.notificacion_enviada ? '✓ Notificación enviada' : '🟡 Pendiente de notificación'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CREAR / EDITAR MODALIDAD DE BECA                   */}
      {/* ======================================================== */}
      {showModalidadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setShowModalidadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-unipaz-orange text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Administración de Catálogo</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  {editingModalidad ? 'Editar Modalidad de Beca' : 'Nueva Modalidad de Beca'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveModalidad} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre de la Modalidad:</label>
                <input
                  type="text"
                  required
                  value={modalidadForm.nombre}
                  onChange={(e) => setModalidadForm({ ...modalidadForm, nombre: e.target.value })}
                  placeholder="ej. Beca de Mérito Deportivo Garzas"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descripción y Justificación:</label>
                <textarea
                  rows={2}
                  value={modalidadForm.descripcion}
                  onChange={(e) => setModalidadForm({ ...modalidadForm, descripcion: e.target.value })}
                  placeholder="Requisitos y criterios de otorgamiento..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descuento Mínimo (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={modalidadForm.descuento_min}
                    onChange={(e) => setModalidadForm({ ...modalidadForm, descuento_min: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Descuento Máximo (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={modalidadForm.descuento_max}
                    onChange={(e) => setModalidadForm({ ...modalidadForm, descuento_max: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Promedio Mínimo:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="7"
                    max="10"
                    value={modalidadForm.promedio_minimo}
                    onChange={(e) => setModalidadForm({ ...modalidadForm, promedio_minimo: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2 font-bold text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="reqSocio"
                    checked={modalidadForm.requiere_estudio_socioeconomico}
                    onChange={(e) => setModalidadForm({ ...modalidadForm, requiere_estudio_socioeconomico: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="reqSocio" className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                    Requiere Estudio Socioeconómico
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModalidadModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  {editingModalidad ? 'Guardar Cambios' : 'Crear Modalidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL EVALUAR / RATIFICAR BECA CON 6 CRITERIOS           */}
      {/* ======================================================== */}
      {evaluatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEvaluatingStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Modal */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-unipaz-orange">Comité de Becas UNIPAZ</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Auditoría Normativa · {evaluatingStudent.nombre} {evaluatingStudent.apellidos}
                </h3>
              </div>
            </div>

            {/* 6 Criterios de Evaluación */}
            <div className="space-y-3">
              {/* 1. Reprobadas */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">1. Materias Aprobadas en Periodo Ordinario</h4>
                  <p className="text-[11px] text-slate-500">Reprobar 1 materia es baja no negociable (incluso con extraordinario).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, sin_reprobadas: !p.sin_reprobadas }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.sin_reprobadas
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  {evalData.sin_reprobadas ? '✓ 0 Reprobadas' : '✕ Reprobó Ordinario (Baja)'}
                </button>
              </div>

              {/* 2. Carga Académica */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">2. Carga Académica para el Próximo Periodo</h4>
                  <p className="text-[11px] text-slate-500">Carga mínima (50% materias) no aplica beca por pagar mitad de colegiatura.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEvalData((p) => ({
                      ...p,
                      proxima_carga_materias: p.proxima_carga_materias === 'normal' ? 'minima' : 'normal',
                    }))
                  }
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.proxima_carga_materias === 'normal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                  }`}
                >
                  {evalData.proxima_carga_materias === 'normal' ? '✓ Carga Regular Completa' : '🚫 Carga Mínima (No Aplica)'}
                </button>
              </div>

              {/* 3. Pagos al Corriente */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">3. Pagos de Colegiatura al Corriente</h4>
                  <p className="text-[11px] text-slate-500">Sin atrasos de pago en el cuatrimestre previo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, pagos_al_corriente: !p.pagos_al_corriente }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.pagos_al_corriente
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.pagos_al_corriente ? '✓ Al Corriente' : '🟡 Pagos Tardíos (Condicionante)'}
                </button>
              </div>

              {/* 4. Informe de Becario */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">4. Informe de Becario en Tiempo</h4>
                  <p className="text-[11px] text-slate-500">Entregado antes de la fecha límite fijada en la convocatoria.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, solicitud_a_tiempo: !p.solicitud_a_tiempo }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.solicitud_a_tiempo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.solicitud_a_tiempo ? '✓ En Tiempo' : '🟡 Extemporáneo (Condicionante)'}
                </button>
              </div>

              {/* 5. Reinscripción */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">5. Reinscripción al Siguiente Ciclo</h4>
                  <p className="text-[11px] text-slate-500">Estar formalmente inscrito al periodo académico a iniciar.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, esta_inscrito_proximo_ciclo: !p.esta_inscrito_proximo_ciclo }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.esta_inscrito_proximo_ciclo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {evalData.esta_inscrito_proximo_ciclo ? '✓ Inscrito al Siguiente Ciclo' : '🟡 Pendiente Reinscripción'}
                </button>
              </div>

              {/* 6. Historial Disciplinario */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">6. Historial Disciplinario</h4>
                  <p className="text-[11px] text-slate-500">Sin sanciones graves ni actas administrativas en el cuatrimestre.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvalData((p) => ({ ...p, sin_sanciones: !p.sin_sanciones }))}
                  className={`py-1 px-3 rounded-full text-[11px] font-black transition-all ${
                    evalData.sin_sanciones
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}
                >
                  {evalData.sin_sanciones ? '✓ Expediente Limpio' : '✕ Con Sanción'}
                </button>
              </div>
            </div>

            {/* Selector de Modalidad y Porcentaje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Modalidad de Beca:</label>
                <select
                  value={evalData.tipo_beca}
                  onChange={(e) => setEvalData((p) => ({ ...p, tipo_beca: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs font-semibold"
                >
                  {modalidadesCatalogo.map((m) => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Porcentaje de Descuento:</label>
                <select
                  value={evalData.porcentaje_beca}
                  onChange={(e) => setEvalData((p) => ({ ...p, porcentaje_beca: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 font-mono font-bold text-xs"
                >
                  {CATALOGO_BECAS.map((b) => (
                    <option key={`eval-pct-${b.clave}`} value={b.porcentaje}>
                      {b.clave} · {b.porcentaje}% ({b.descripcion})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Observaciones del Dictamen:</label>
              <textarea
                rows={2}
                value={evalData.observaciones}
                onChange={(e) => setEvalData((p) => ({ ...p, observaciones: e.target.value }))}
                placeholder="Notas adicionales o número de acuerdo de sesión..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
              />
            </div>

            {/* ACCIONES FINALES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleSaveEvaluation('rechazada')}
                className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <XCircle className="w-4 h-4" />
                {evalData.proxima_carga_materias === 'minima' ? 'No Aplica (Carga Mínima)' : 'Rechazar / Baja'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (detectedReasons.length > 0 && !evalData.condiciones.trim()) {
                    setEvalData((p) => ({ ...p, condiciones: detectedReasons.join(' ') }));
                  }
                  setShowConditionalModal(true);
                }}
                disabled={evalData.proxima_carga_materias === 'minima'}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md ${
                  evalData.proxima_carga_materias !== 'minima'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Beca Condicionada
              </button>

              <button
                type="button"
                onClick={() => handleSaveEvaluation('aprobada')}
                disabled={!evalData.sin_reprobadas || evalData.proxima_carga_materias === 'minima'}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md ${
                  evalData.sin_reprobadas && evalData.proxima_carga_materias !== 'minima'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Ratificar y Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINI-MODAL DEDICADO: BECA CONDICIONADA (DESDE EVALUACIÓN) */}
      {showConditionalModal && evaluatingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowConditionalModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">Dictamen Oficial de Beca</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Beca Condicionada · {evaluatingStudent.nombre} {evaluatingStudent.apellidos}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 space-y-2">
              <span className="font-black text-xs text-amber-950 dark:text-amber-200 block">
                📋 Criterios que originan el condicionamiento:
              </span>
              {detectedReasons.length > 0 ? (
                <ul className="space-y-1.5 text-[11px] text-amber-900 dark:text-amber-300">
                  {detectedReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  🟡 Condicionamiento preventivo o por acuerdo especial del Comité de Becas.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                Condición y Compromiso Formal del Estudiante:
              </label>
              <textarea
                rows={3}
                value={evalData.condiciones}
                onChange={(e) => setEvalData((p) => ({ ...p, condiciones: e.target.value }))}
                placeholder="Escribe el compromiso formal (ej. Regularizar pagos antes del 15 de septiembre y entregar informe de becario a tiempo)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/30 rounded-xl p-3 text-xs font-medium"
              />
              <span className="text-[10px] text-slate-500 block">
                * Este texto se mostrará directamente al alumno en su portal y dictamen oficial.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                Comentarios Adicionales del Verificador / Comité:
              </label>
              <textarea
                rows={2}
                value={evalData.observaciones}
                onChange={(e) => setEvalData((p) => ({ ...p, observaciones: e.target.value }))}
                placeholder="Notas internas del dictamen..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowConditionalModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Volver a Evaluación
              </button>
              <button
                type="button"
                onClick={() => handleSaveEvaluation('condicionada')}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <AlertTriangle className="w-4 h-4" />
                Confirmar Beca Condicionada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFORMATIVO: DETALLES DE BECA CONDICIONADA (DESDE TABLA DIRECTA) */}
      {selectedStudentForConditionDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudentForConditionDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">Expediente de Beca</span>
                <h3 className="text-base font-black text-unipaz-navy dark:text-white">
                  Detalles de Condicionamiento · {selectedStudentForConditionDetails.nombre} {selectedStudentForConditionDetails.apellidos}
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  {selectedStudentForConditionDetails.matricula} · {selectedStudentForConditionDetails.carrera}
                </div>
              </div>
            </div>

            {/* Datos de Beca */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Modalidad de Beca:</span>
                <strong className="text-unipaz-navy dark:text-white">{selectedStudentForConditionDetails.tipo_beca || 'Institucional'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Porcentaje Descuento:</span>
                <strong className="text-unipaz-orange font-bold">{selectedStudentForConditionDetails.porcentaje_beca}%</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estatus Ratificación:</span>
                <span className="text-amber-600 font-bold">⚠️ CONDICIONADA</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Promedio Evaluado:</span>
                <strong className="font-mono">{selectedStudentForConditionDetails.promedio_academico || '9.0'}</strong>
              </div>
            </div>

            {/* Condición y Compromiso */}
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 space-y-2">
              <span className="font-black text-xs text-amber-950 dark:text-amber-200 block">
                📝 Condición y Compromiso Asignado:
              </span>
              <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                {selectedStudentForConditionDetails.condiciones_ratificacion_beca ||
                  selectedStudentForConditionDetails.resolucion_refrendo_observaciones ||
                  'Beca sujeta a regularización de criterios administrativos o formativos en el periodo activo.'}
              </p>
            </div>

            {/* Observaciones del Comité */}
            {selectedStudentForConditionDetails.resolucion_refrendo_observaciones && (
              <div className="space-y-1">
                <span className="font-bold text-[11px] text-slate-500 block">Comentarios del Verificador / Comité:</span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
                  {selectedStudentForConditionDetails.resolucion_refrendo_observaciones}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedStudentForConditionDetails(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const std = selectedStudentForConditionDetails;
                  setSelectedStudentForConditionDetails(null);
                  openEvaluationModal(std);
                }}
                className="py-2.5 px-4 rounded-xl bg-unipaz-orange hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Re-evaluar Beca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Dictamen Oficial */}
      {selectedStudentForDictamen && (
        <ScholarshipRenewalDictamenModal
          isOpen={true}
          onClose={() => setSelectedStudentForDictamen(null)}
          student={selectedStudentForDictamen}
          scholarshipProgress={getStudentScholarshipProgress(selectedStudentForDictamen.id)}
        />
      )}
    </div>
  );
}
