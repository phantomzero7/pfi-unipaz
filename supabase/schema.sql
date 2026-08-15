-- ============================================================================
-- PLATAFORMA DE GESTIÓN Y SEGUIMIENTO DEL PFI - UNIPAZ
-- Esquema relacional PostgreSQL / Supabase con RLS y Triggers
-- ============================================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles de Usuario y Tipos ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('estudiante', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_modality AS ENUM ('presencial', 'online', 'hibrido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('registrado', 'asistio', 'incompleto', 'cancelado', 'lista_espera');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Perfil de Estudiantes y Usuarios
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    matricula VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    carrera VARCHAR(120),
    periodo_ingreso VARCHAR(30),
    email VARCHAR(120) UNIQUE NOT NULL,
    role user_role DEFAULT 'estudiante',
    avatar_url TEXT,
    qr_secret UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Eventos y Talleres
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL, -- 'Taller Extracurricular', 'Taller Liderazgo', 'PVC', 'Conferencia', 'Simposio', etc.
    subcategoria VARCHAR(50),
    modalidad event_modality DEFAULT 'presencial',
    fecha_evento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_pfi NUMERIC(5,2) NOT NULL,
    cupo_maximo INT DEFAULT 0, -- 0 = ilimitado
    enlace_virtual TEXT,
    otp_online_code VARCHAR(6), -- Token dinámico para eventos virtuales
    tolerancia_minutos INT DEFAULT 15,
    ubicacion VARCHAR(255),
    creado_por UUID REFERENCES profiles(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registro de Cupos y Asistencias
CREATE TABLE IF NOT EXISTS event_attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'registrado',
    check_in_timestamp TIMESTAMPTZ,
    check_out_timestamp TIMESTAMPTZ,
    horas_acreditadas NUMERIC(5,2) DEFAULT 0.00,
    validado_por UUID REFERENCES profiles(id),
    qr_scanned_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_event UNIQUE (event_id, student_id)
);

-- 5. Función y Trigger: Cálculo Automático de Horas y Acreditación (Regla 80% Permanencia)
CREATE OR REPLACE FUNCTION process_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
    v_event_hours NUMERIC(5,2);
    v_event_start TIME;
    v_event_end TIME;
    v_duration_minutes NUMERIC;
    v_stay_minutes NUMERIC;
BEGIN
    IF NEW.check_in_timestamp IS NOT NULL AND NEW.check_out_timestamp IS NOT NULL THEN
        SELECT horas_pfi, hora_inicio, hora_fin INTO v_event_hours, v_event_start, v_event_end
        FROM events WHERE id = NEW.event_id;

        v_stay_minutes := EXTRACT(EPOCH FROM (NEW.check_out_timestamp - NEW.check_in_timestamp)) / 60;
        v_duration_minutes := EXTRACT(EPOCH FROM (v_event_end - v_event_start)) / 60;

        -- Validar permanencia mínima del 80%
        IF v_duration_minutes <= 0 OR v_stay_minutes >= (v_duration_minutes * 0.80) THEN
            NEW.horas_acreditadas := v_event_hours;
            NEW.status := 'asistio';
        ELSE
            NEW.horas_acreditadas := 0.00;
            NEW.status := 'incompleto';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_hours ON event_attendances;
CREATE TRIGGER trg_calculate_hours
BEFORE INSERT OR UPDATE ON event_attendances
FOR EACH ROW EXECUTE FUNCTION process_attendance_hours();

-- 6. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
DROP POLICY IF EXISTS "Perfiles visibles por usuarios autenticados" ON profiles;
CREATE POLICY "Perfiles visibles por usuarios autenticados" ON profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas de Events
DROP POLICY IF EXISTS "Eventos públicos para usuarios autenticados" ON events;
CREATE POLICY "Eventos públicos para usuarios autenticados" ON events FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff y Admin pueden crear/editar eventos" ON events;
CREATE POLICY "Staff y Admin pueden crear/editar eventos" ON events FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Políticas de Asistencias
DROP POLICY IF EXISTS "Estudiantes ven sus asistencias" ON event_attendances;
CREATE POLICY "Estudiantes ven sus asistencias" ON event_attendances FOR SELECT USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Estudiantes pueden reservar cupo" ON event_attendances;
CREATE POLICY "Estudiantes pueden reservar cupo" ON event_attendances FOR INSERT WITH CHECK (
    student_id = auth.uid()
);

DROP POLICY IF EXISTS "Staff y Admin pueden validar asistencias" ON event_attendances;
CREATE POLICY "Staff y Admin pueden validar asistencias" ON event_attendances FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);
