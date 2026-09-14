-- Esquema inicial. La tabla "pacientes" tiene los campos básicos;
-- cuando definas el fichero real (historia clínica, tratamientos, etc.)
-- se amplía con ALTER TABLE o migraciones nuevas.

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin', -- admin | asistente
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profesionales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  titulo VARCHAR(200),
  especialidad VARCHAR(120),
  foto_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  descripcion TEXT,
  precio VARCHAR(60), -- texto libre ("Desde $X" / "Consultar") por ahora
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  apellido VARCHAR(150),
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(40),
  email VARCHAR(150),
  ultima_visita DATE,
  domicilio VARCHAR(255),
  localidad VARCHAR(120),
  cp VARCHAR(20),
  ocupacion VARCHAR(150),
  fecha_nacimiento DATE,
  sexo VARCHAR(20),
  estado_civil VARCHAR(30),
  derivado_por VARCHAR(150),
  obra_social VARCHAR(150),
  nro_afiliado VARCHAR(60),
  plan_tratamiento TEXT,
  dientes_existentes VARCHAR(60),
  color VARCHAR(60),
  observaciones TEXT,
  -- Historia clínica (antecedentes médicos)
  antecedentes JSONB NOT NULL DEFAULT '[]'::jsonb, -- claves de CONDICIONES_MEDICAS que el paciente marcó
  usa_marcapasos BOOLEAN,
  alergico_farmacos BOOLEAN,
  trastornos_hemorragicos BOOLEAN,
  toma_medicacion BOOLEAN,
  medicacion_detalle TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Migración para bases ya existentes (no toca nada si la columna ya está).
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS apellido VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS domicilio VARCHAR(255);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS localidad VARCHAR(120);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cp VARCHAR(20);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ocupacion VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS sexo VARCHAR(20);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS derivado_por VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS obra_social VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nro_afiliado VARCHAR(60);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS plan_tratamiento TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS dientes_existentes VARCHAR(60);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS color VARCHAR(60);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS antecedentes JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS usa_marcapasos BOOLEAN;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS alergico_farmacos BOOLEAN;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS trastornos_hemorragicos BOOLEAN;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS toma_medicacion BOOLEAN;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS medicacion_detalle TEXT;

-- Odontograma: un registro por SUPERFICIE de una pieza dentaria marcada
-- (vestibular/palatino-lingual/mesial/distal, como el cuadrado dividido en
-- 4 de la ficha de papel), separado en dos grillas: estado_actual y
-- tratamiento_realizado. Incluye piezas permanentes y de leche (FDI).
CREATE TABLE IF NOT EXISTS odontograma (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo VARCHAR(25) NOT NULL, -- estado_actual | tratamiento_realizado
  pieza SMALLINT NOT NULL,
  superficie VARCHAR(25) NOT NULL, -- vestibular | palatino_lingual | mesial | distal
  condicion VARCHAR(40) NOT NULL,
  actualizado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE (paciente_id, tipo, pieza, superficie)
);

-- Migración: la tabla odontograma ya existía sin "superficie" (versión anterior
-- marcaba un solo símbolo por diente). Esto la actualiza sin perder datos.
ALTER TABLE odontograma ADD COLUMN IF NOT EXISTS superficie VARCHAR(25) NOT NULL DEFAULT 'vestibular';
ALTER TABLE odontograma DROP CONSTRAINT IF EXISTS odontograma_paciente_id_tipo_pieza_key;
DO $$
BEGIN
  ALTER TABLE odontograma ADD CONSTRAINT odontograma_unico UNIQUE (paciente_id, tipo, pieza, superficie);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Cuenta corriente: registro de presentaciones/cobros por paciente.
-- El saldo NO se guarda (se calcula sumando debe-haber en orden de fecha),
-- así nunca queda desincronizado si se edita o borra un movimiento viejo.
CREATE TABLE IF NOT EXISTS cuenta_corriente (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  presentacion VARCHAR(255) NOT NULL,
  debe NUMERIC(10,2) NOT NULL DEFAULT 0,
  haber NUMERIC(10,2) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
  paciente_nombre VARCHAR(150), -- copia del nombre al momento de cargar el turno; sobrevive si el paciente se borra del fichero
  profesional_id INTEGER REFERENCES profesionales(id) ON DELETE SET NULL,
  tratamiento VARCHAR(150),
  fecha_hora TIMESTAMP NOT NULL,
  notas TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'confirmado', -- confirmado | cancelado | atendido
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Migración para bases ya existentes (no toca nada si la columna ya está).
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'confirmado';

-- Datos reales de arranque (tratamientos de Dentar y profesionales de la sucursal Devoto).
-- Los precios no se publican: siempre "Consultar", se coordina por WhatsApp.
INSERT INTO servicios (nombre, descripcion, precio) VALUES
  ('Implantología', 'Reemplazo de la raíz dentaria con un cilindro de titanio, sobre el que luego se coloca la prótesis.', 'Consultar'),
  ('Prótesis', 'Dispositivos removibles o fijos para reemplazar piezas dentarias ausentes.', 'Consultar'),
  ('Ortodoncia', 'Alineamiento y posicionamiento correcto de los dientes con distintas técnicas y aparatología.', 'Consultar'),
  ('Blanqueamiento', 'Aclarado del color dentario con sustancias inocuas para los dientes y el organismo.', 'Consultar'),
  ('Operatoria dental', 'Eliminación de caries y reconstrucción con materiales del mismo color del diente.', 'Consultar'),
  ('Cirugías', 'Tratamiento de malformaciones, lesiones y traumatismos de los huesos maxilares.', 'Consultar'),
  ('Estética dental', 'Técnicas y materiales para embellecer las piezas dentarias y resaltar la sonrisa.', 'Consultar'),
  ('Endodoncia', 'Eliminación de la pulpa dental, limpieza y sellado del conducto.', 'Consultar'),
  ('Prevención', 'Destartaje, eliminación de placa bacteriana y topicación con flúor.', 'Consultar'),
  ('Reconstrucción maxilar', 'Aplicación de sustitutos óseos para preparar la zona antes de un implante.', 'Consultar')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO profesionales (nombre, titulo, especialidad) VALUES
  ('Dr. Mariano Sapia', 'Odontólogo', 'Prótesis, blanqueamiento e implantes'),
  ('Dra. María Laura Perazzi', 'Odontóloga', 'Endodoncia')
ON CONFLICT (nombre) DO NOTHING;
