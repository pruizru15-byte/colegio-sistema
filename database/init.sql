-- Copyright (c) 2026 MyCompany LLC
-- 
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
-- 
--     http://www.apache.org/licenses/LICENSE-2.0
-- 
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'consulta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    pabellon VARCHAR(50),
    piso VARCHAR(20),
    responsable VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_patrimonial VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    marca VARCHAR(80),
    modelo VARCHAR(80),
    numero_serie VARCHAR(100),
    estado VARCHAR(50) NOT NULL DEFAULT 'operativo',
    observaciones TEXT,
    ubicacion_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL
);

CREATE TABLE codigos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_hash VARCHAR(100) NOT NULL UNIQUE,
    equipo_id INT NOT NULL,
    url_destino VARCHAR(255) NOT NULL,
    ruta_imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- Datos iniciales de prueba
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
('Administrador General', 'admin@colegio.edu.pe', '$2b$12$e8YQ3dK1Fz8c3yN0eM0zdeS7qXg0xI3Kj0qXg0xI3Kj0qXg0xI3Kj', 'administrador'),
('Docente de Turno', 'docente@colegio.edu.pe', '$2b$12$e8YQ3dK1Fz8c3yN0eM0zdeS7qXg0xI3Kj0qXg0xI3Kj0qXg0xI3Kj', 'consulta');

INSERT INTO ubicaciones (nombre, pabellon, piso, responsable) VALUES
('Laboratorio de Cómputo 1', 'Pabellón A', '2do Piso', 'Prof. Carlos Vega'),
('Laboratorio de Cómputo 2', 'Pabellón A', '2do Piso', 'Prof. María Salazar'),
('Sala de Profesores', 'Pabellón B', '1er Piso', 'Lic. Rosa Morales'),
('Biblioteca Central', 'Pabellón C', '1er Piso', 'Prof. Juan Ramos');
