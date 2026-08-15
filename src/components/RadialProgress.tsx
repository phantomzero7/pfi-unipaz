'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { EvaluationScale } from '@/lib/types';

interface RadialProgressProps {
  currentHours: number;
  minHours?: number; // 400
  sobresalienteHours?: number; // 730
  escala: EvaluationScale;
  escalaTexto: string;
  isAcreditado: boolean;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  currentHours,
  minHours = 400,
  sobresalienteHours = 730,
  escala,
  escalaTexto,
  isAcreditado,
}) => {
  // Dimensiones del SVG
  const size = 280;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculamos el porcentaje visual (con tope suave en 100% de 730h)
  const percentOfSobresaliente = Math.min(100, (currentHours / sobresalienteHours) * 100);
  const strokeDashoffset = circumference - (percentOfSobresaliente / 100) * circumference;

  // Color e iconos según escala
  const isSobresaliente = escala === 'Sobresaliente';
  const isSatisfactorio = escala === 'Satisfactorio';

  const gradientId = 'pfiProgressGradient';

  return (
    <div className="flex flex-col items-center justify-center relative p-4">
      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(255,85,0,0.25)]"
        >
          <defs>
            {/* Gradiente Institucional UNIPAZ: Naranja a Dorado Brillante */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0056B3" />
              <stop offset="50%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#FFAA00" />
            </linearGradient>
            
            {/* Gradiente Sobresaliente Oro */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8800" />
              <stop offset="60%" stopColor="#FFAA00" />
              <stop offset="100%" stopColor="#FFE066" />
            </linearGradient>
          </defs>

          {/* Círculo de Fondo (Track) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/80"
          />

          {/* Marcador del 400h (54.8% del círculo) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`4 ${circumference - 4}`}
            strokeDashoffset={circumference - (minHours / sobresalienteHours) * circumference}
            fill="transparent"
            className="opacity-70"
          />

          {/* Círculo de Progreso con Animación */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${isSobresaliente ? 'goldGradient' : gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Contenido Central */}
        <div className="absolute flex flex-col items-center justify-center text-center p-4">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-1"
          >
            {currentHours.toFixed(1)}
            <span className="text-sm font-semibold text-slate-400">hrs</span>
          </motion.span>

          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">
            Meta Min: <strong className="text-slate-200">400 hrs</strong>
          </span>

          {/* Estado de Acreditación */}
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 shadow-lg bg-slate-950/70">
            {isSobresaliente ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-300 font-bold">Sobresaliente</span>
              </>
            ) : isSatisfactorio ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Acreditado</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-unipaz-orange" />
                <span className="text-orange-400 font-semibold">En Proceso</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Escala Detallada Debajo */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-slate-300">
          {escalaTexto}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentHours < minHours
            ? `Faltan ${(minHours - currentHours).toFixed(1)} hrs para titulación`
            : currentHours < sobresalienteHours
            ? `Faltan ${(sobresalienteHours - currentHours).toFixed(1)} hrs para Mención Sobresaliente`
            : '¡Has superado con honores el límite de horas PFI!'}
        </p>
      </div>
    </div>
  );
};
