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

-- Placeholder: se termina de definir cuando tengas un fichero real a mano
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(40),
  email VARCHAR(150),
  ultima_visita DATE,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
  paciente_nombre VARCHAR(150), -- se completa a mano si el paciente todavía no está en el fichero
  profesional_id INTEGER REFERENCES profesionales(id) ON DELETE SET NULL,
  tratamiento VARCHAR(150),
  fecha_hora TIMESTAMP NOT NULL,
  notas TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

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
