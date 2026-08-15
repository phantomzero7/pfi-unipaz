# Plataforma de Gestión y Seguimiento del Programa de Formación Integral (PFI) - UNIPAZ

Plataforma web universitaria integral desarrollada para la **Universidad Internacional de La Paz (UNIPAZ)**, diseñada para la gestión de créditos, seguimiento de requisitos formativos, registro y control de asistencias mediante códigos QR (con validación de permanencia del 80%) y emisión de constancias oficiales de titulación con sello digital.

---

## 🚀 Stack Tecnológico

- **Framework Frontend & Backend:** Next.js 14 (App Router, Server Actions, TypeScript)
- **Base de Datos & Auth:** Supabase (PostgreSQL con tipos ENUM, Row Level Security [RLS], Triggers de permanencia del 80%)
- **Estilos & UI:** Tailwind CSS, Framer Motion (microinteracciones), Lucide React Icons, Canvas Confetti
- **Escáner QR en Tiempo Real:** `html5-qrcode` para lectura desde cámara móvil/web y simulador en vivo
- **Generación de Constancias Oficiales:** `jspdf` + `qrcode` con sello digital y folio único institucional

---

## 🎨 Sistema de Diseño (UNIPAZ Glass-Modern)

- **Azul Institucional (Navy Base):** `#002855` / `#0A1526`
- **Azul Cobalto Interactivo:** `#0056B3` / `#0070F3`
- **Naranja UNIPAZ (Acento & Progreso):** `#FF5500` / `#E04B00`
- **Dorado Sol (Logros & Sobresaliente):** `#FFAA00` / `#FFC72C`
- **Componentes:** Efectos *Glassmorphism* (`backdrop-blur-xl`), medidores circulares SVG con gradientes interactivos, tarjetas con relieves sutiles (*soft neumorphism*) y credencial estudiantil digital.

---

## 📋 Reglas Normativas del PFI Integradas

1. **Escala de Evaluación y Horas Totales:**
   - **No Satisfactorio:** $\le 399\text{ hrs}$ (En proceso, insuficiente para titulación).
   - **Satisfactorio ("Espíritu Unipaceño"):** $400\text{ a }729\text{ hrs}$ (Mínimo obligatorio para titulación).
   - **Sobresaliente:** $\ge 730\text{ hrs}$ (Mención honorífica y mérito extracurricular).

2. **Requisitos Obligatorios:**
   - **3 Talleres Extracurriculares:** $16.67\text{ h}$ c/u = $50.00\text{ hrs}$ (Culturales, deportivos o sociales).
   - **1 Taller de Liderazgo y Promoción Social:** $10.00\text{ hrs}$ (Inclusión y equidad de género).
   - **Plan de Vida y Carrera (PVC):** PVC I ($25\text{ h}$), PVC II ($25\text{ h}$) y PVC III ($25\text{ h}$) = $75.00\text{ hrs}$.

3. **Catálogo de Horas Formativas:**
   - Artículos académicos / Ponencias / Investigación: $100.00\text{ h}$
   - Clubes anuales (Lectura, debate, altruistas): $33.34\text{ h}$
   - Simposios y Congresos: $5.56\text{ h}$
   - Jornadas Sociales / Ferias: $5.00\text{ h}$
   - Cine club / Café literario: $2.50\text{ h}$
   - Foros y conferencias: $2.00\text{ h}$
   - Campañas y voluntariado: $1.00\text{ h}$

4. **Regla de Permanencia del 80%:**
   - El escáner calcula automáticamente la diferencia de tiempo entre Check-In y Check-Out. Si la permanencia es $\ge 80\%$ de la duración del evento, se acreditan las horas; de lo contrario, el estatus queda como `incompleto`.

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar o ingresar al proyecto:
```bash
cd "PFI APP"
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Configuración de Base de Datos (Supabase)

El script SQL completo con tablas, tipos ENUM, triggers de cálculo automático y políticas RLS se encuentra en:
👉 [`supabase/schema.sql`](supabase/schema.sql)

Para conectarlo a tu proyecto en producción, crea un archivo `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```
*(La aplicación incluye un sistema de almacenamiento local reactivo y perfiles de prueba interactivos que funcionan de forma 100% autónoma incluso sin conexión a Supabase).*

---

## 👥 Perfiles de Prueba Preconfigurados

Puedes alternar entre los siguientes usuarios con el selector en la esquina superior derecha:
- **Sofía Méndez Cota (UP220419):** Estudiante de Derecho con $420\text{ hrs}$ acreditadas (**Satisfactorio / Espíritu Unipaceño**).
- **Carlos Valenzuela Arce (UP210382):** Estudiante de Software con $745\text{ hrs}$ acreditadas (**Sobresaliente**).
- **Mariana Castro Beltrán (UP230554):** Estudiante de Psicología con $210\text{ hrs}$ (**En proceso / No Satisfactorio**).
- **Mtro. Roberto Ojeda Lucero (ADM-1044):** Coordinador General PFI (**Admin**).
- **Lic. Paulina García Davis (STF-2091):** Promoción y Eventos (**Staff**).
