-- =============================================================================
-- INSTITUTO 124 - SISTEMA DE CONTROL DE ASISTENCIAS
-- DISEÑO DE BASE DE DATOS RELACIONAL (SQL)
-- Basado en el relevamiento de pizarra física (PP III)
-- =============================================================================

-- Habilitar integridad referencial (en caso de usar SQLite/PostgreSQL/MySQL)
-- Este script es compatible con PostgreSQL y MySQL (estándar ANSI SQL).

-- -----------------------------------------------------------------------------
-- 1. TABLA: ROLES
-- Define los roles de acceso al sistema (Preceptor, Profesor, Alumno, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE ROLES (
    RoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria (Auto-incremental)
    RoDenominacion VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: USUARIOS
-- Datos demográficos y de identificación de los integrantes de la institución
-- -----------------------------------------------------------------------------
CREATE TABLE USUARIOS (
    UsId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    UsApellido VARCHAR(100) NOT NULL,
    UsNombre VARCHAR(100) NOT NULL,
    UsDNI INT NOT NULL UNIQUE -- DNI como entero único
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: USUARIOS_ROLES (Tabla Intermedia / Relación N:M)
-- Asocia usuarios con uno o más roles del sistema
-- -----------------------------------------------------------------------------
CREATE TABLE USUARIOS_ROLES (
    UsRoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    UsId INT NOT NULL, -- CF: Clave Foránea -> USUARIOS
    RoId INT NOT NULL, -- CF: Clave Foránea -> ROLES
    CONSTRAINT FK_UsRoles_Usuarios FOREIGN KEY (UsId) REFERENCES USUARIOS(UsId) ON DELETE CASCADE,
    CONSTRAINT FK_UsRoles_Roles FOREIGN KEY (RoId) REFERENCES ROLES(RoId) ON DELETE CASCADE,
    CONSTRAINT UQ_Usuario_Rol UNIQUE (UsId, RoId) -- Previene duplicados del mismo rol para un usuario
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: Login
-- Credenciales de acceso asociadas a los usuarios del sistema
-- -----------------------------------------------------------------------------
CREATE TABLE Login (
    LoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    LoUSER INT NOT NULL UNIQUE, -- CF: Hace referencia al ID de USUARIOS (Relación 1:1)
    LoPass VARCHAR(255) NOT NULL, -- Hash de la contraseña del usuario
    CONSTRAINT FK_Login_Usuarios FOREIGN KEY (LoUSER) REFERENCES USUARIOS(UsId) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: COHORTE
-- Agrupamiento temporal por año de ingreso de las carreras (ej: "Cohorte 2026")
-- -----------------------------------------------------------------------------
CREATE TABLE COHORTE (
    CoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    CoDenominacion VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: CARRERAS
-- Listado de carreras/tecnicaturas dictadas por el Instituto 124
-- -----------------------------------------------------------------------------
CREATE TABLE CARRERAS (
    CaId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    CaDenominacion VARCHAR(150) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: CARRERAS_COHORTES (Tabla Intermedia / Relación N:M)
-- Vincula las carreras con sus respectivas cohortes activas
-- -----------------------------------------------------------------------------
CREATE TABLE CARRERAS_COHORTES (
    CaCoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    CaId INT NOT NULL, -- CF: Clave Foránea -> CARRERAS
    CoId INT NOT NULL, -- CF: Clave Foránea -> COHORTE
    CONSTRAINT FK_CaCohortes_Carreras FOREIGN KEY (CaId) REFERENCES CARRERAS(CaId) ON DELETE CASCADE,
    CONSTRAINT FK_CaCohortes_Cohorte FOREIGN KEY (CoId) REFERENCES COHORTE(CoId) ON DELETE CASCADE,
    CONSTRAINT UQ_Carrera_Cohorte UNIQUE (CaId, CoId)
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: MATERIAS
-- Unidades curriculares con su modalidad y cantidad de módulos semanales
-- -----------------------------------------------------------------------------
CREATE TABLE MATERIAS (
    MaId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    MaDenominacion VARCHAR(150) NOT NULL,
    MaModalidad VARCHAR(50) NOT NULL, -- Presencial, Virtual, Híbrido, etc.
    MaCantModulos INT NOT NULL -- Cantidad de bloques de clase (módulos) de la materia
);

-- -----------------------------------------------------------------------------
-- 9. TABLA: CARRERAS_MATERIAS (Tabla Intermedia / Relación N:M)
-- Mapeo curricular que asocia las materias correspondientes a cada carrera
-- -----------------------------------------------------------------------------
CREATE TABLE CARRERAS_MATERIAS (
    CaMaId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    CaId INT NOT NULL, -- CF: Clave Foránea -> CARRERAS
    MaId INT NOT NULL, -- CF: Clave Foránea -> MATERIAS
    CONSTRAINT FK_CaMaterias_Carreras FOREIGN KEY (CaId) REFERENCES CARRERAS(CaId) ON DELETE CASCADE,
    CONSTRAINT FK_CaMaterias_Materias FOREIGN KEY (MaId) REFERENCES MATERIAS(MaId) ON DELETE CASCADE,
    CONSTRAINT UQ_Carrera_Materia UNIQUE (CaId, MaId)
);

-- -----------------------------------------------------------------------------
-- 10. TABLA: MODULOS
-- Define los bloques horarios correspondientes a cada clase presencial
-- (Representa la anotación "DateTime M1 M2 M3 M4" del pizarrón)
-- -----------------------------------------------------------------------------
CREATE TABLE MODULOS (
    MoId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    MoDenominacion VARCHAR(50) NOT NULL, -- Ej: "Módulo 1", "Módulo 2", "Módulo 3", etc.
    MoHoraInicio TIME NOT NULL, -- Ej: '18:30:00'
    MoHoraFin TIME NOT NULL -- Ej: '19:10:00'
);

-- -----------------------------------------------------------------------------
-- 11. TABLA: ASISTENCIAS
-- Registro de presencialidad de alumnos y docentes para clases específicas
-- -----------------------------------------------------------------------------
CREATE TABLE ASISTENCIAS (
    AsId INT AUTO_INCREMENT PRIMARY KEY, -- CP: Clave Primaria
    UsId INT NOT NULL, -- CF: Alumno o Docente que asiste (USUARIOS)
    MaId INT NOT NULL, -- CF: Materia asociada (MATERIAS)
    AsFecha DATETIME NOT NULL, -- Fecha y hora del registro de asistencia
    AsPresente BOOLEAN NOT NULL DEFAULT FALSE, -- Estado de presencia (True: Presente, False: Ausente)
    AsJustificacion BOOLEAN NOT NULL DEFAULT FALSE, -- Estado de justificativo cargado/aprobado
    CONSTRAINT FK_Asistencias_Usuarios FOREIGN KEY (UsId) REFERENCES USUARIOS(UsId) ON DELETE CASCADE,
    CONSTRAINT FK_Asistencias_Materias FOREIGN KEY (MaId) REFERENCES MATERIAS(MaId) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 12. ÍNDICES DE RENDIMIENTO (OPTIMIZACIÓN DE CONSULTAS)
-- -----------------------------------------------------------------------------
CREATE INDEX IDX_Asistencias_Usuario ON ASISTENCIAS(UsId);
CREATE INDEX IDX_Asistencias_Materia ON ASISTENCIAS(MaId);
CREATE INDEX IDX_Asistencias_Fecha ON ASISTENCIAS(AsFecha);
CREATE INDEX IDX_UsRoles_Usuario ON USUARIOS_ROLES(UsId);
CREATE INDEX IDX_UsRoles_Rol ON USUARIOS_ROLES(RoId);

-- =============================================================================
-- INSERCIÓN DE DATOS DE PRUEBA (SEED DATA - SIMULACIÓN COMPATIBLE CON CANVAS APP)
-- =============================================================================

-- Insertar Roles Institucionales
INSERT INTO ROLES (RoDenominacion) VALUES 
('Preceptor'),
('Profesor'),
('Alumno');

-- Insertar Usuarios de Prueba (Según simulación de app.js)
INSERT INTO USUARIOS (UsApellido, UsNombre, UsDNI) VALUES 
('Olivera', 'Gustav', 41209384),    -- Preceptor / Admin
('Martínez', 'Jorge', 25192834),   -- Docente
('Gómez', 'Lucas', 46294029),       -- Alumno 1
('Martínez', 'Sofía', 45920394),    -- Alumno 2
('Álvarez', 'Diego', 44839402),     -- Alumno 3
('Sosa', 'Camila', 45109283);       -- Alumno 4

-- Asociar Usuarios con sus respectivos Roles
INSERT INTO USUARIOS_ROLES (UsId, RoId) VALUES 
(1, 1), -- Gustav -> Preceptor
(2, 2), -- Jorge Martínez -> Profesor
(3, 3), -- Lucas Gómez -> Alumno
(4, 3), -- Sofía Martínez -> Alumno
(5, 3), -- Diego Álvarez -> Alumno
(6, 3); -- Camila Sosa -> Alumno

-- Insertar Credenciales de Acceso (Login)
-- Las contraseñas reales estarían hasheadas con bcrypt/argon2
INSERT INTO Login (LoUSER, LoPass) VALUES 
(1, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe'), -- preceptor
(2, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe'), -- profesor
(3, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe'), -- alumno
(4, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe'),
(5, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe'),
(6, '$2b$10$e0MYzE828/qG2p7IuA07OeV68mKzXQ9N0aOqXW6nreCpy1FWeqXWe');

-- Insertar Cohortes
INSERT INTO COHORTE (CoDenominacion) VALUES 
('Cohorte 2024'),
('Cohorte 2025'),
('Cohorte 2026');

-- Insertar Carreras
INSERT INTO CARRERAS (CaDenominacion) VALUES 
('T.S. en Desarrollo de Software'),
('T.S. en Redes e Infraestructura de la Información'),
('T.S. en Hotelería'),
('T.S. en Enfermería'),
('T.S. en Marketing');

-- Asociar Carreras a Cohortes activas
INSERT INTO CARRERAS_COHORTES (CaId, CoId) VALUES 
(1, 3), -- T.S. Software -> Cohorte 2026
(2, 2), -- T.S. Redes -> Cohorte 2025
(3, 3),
(4, 3),
(5, 3);

-- Insertar Materias (Con Modalidad y Módulos curriculares)
INSERT INTO MATERIAS (MaDenominacion, MaModalidad, MaCantModulos) VALUES 
('Análisis Matemático', 'Presencial', 4),
('Programación I', 'Presencial', 5),
('Sistemas Operativos', 'Híbrida', 4),
('Base de Datos II', 'Presencial', 4),
('Redes de Información I', 'Presencial', 3);

-- Vincular Materias con Carreras (Mapeo Curricular)
INSERT INTO CARRERAS_MATERIAS (CaId, MaId) VALUES 
(1, 1), -- Software -> Análisis Matemático
(1, 2), -- Software -> Programación I
(1, 4), -- Software -> Base de Datos II
(2, 3), -- Redes -> Sistemas Operativos
(2, 5); -- Redes -> Redes de Información I

-- Insertar Módulos Horarios (Distribución del Turno Noche - PP III)
INSERT INTO MODULOS (MoDenominacion, MoHoraInicio, MoHoraFin) VALUES 
('Módulo 1', '18:30:00', '19:10:00'),
('Módulo 2', '19:10:00', '19:50:00'),
('Módulo 3', '20:00:00', '20:40:00'),
('Módulo 4', '20:40:00', '21:20:00');

-- Cargar Historial de Asistencias Iniciales para simular los tableros
-- (Fecha: 04/05/2026 correspondientes a las vistas de reportes)
INSERT INTO ASISTENCIAS (UsId, MaId, AsFecha, AsPresente, AsJustificacion) VALUES 
-- Lucas Gómez (Asistencia Regular: 88%)
(3, 1, '2026-05-01 18:30:00', TRUE, FALSE),
(3, 1, '2026-05-04 18:30:00', FALSE, TRUE), -- Ausente Justificado
(3, 1, '2026-05-05 18:30:00', TRUE, FALSE),
(3, 1, '2026-05-06 18:30:00', TRUE, FALSE),

-- Diego Álvarez (Riesgo Crítico: 44.4%)
(5, 1, '2026-05-01 18:30:00', FALSE, FALSE),
(5, 1, '2026-05-04 18:30:00', FALSE, FALSE),
(5, 1, '2026-05-05 18:30:00', TRUE, FALSE),
(5, 1, '2026-05-06 18:30:00', FALSE, FALSE),

-- Sofía Martínez (Asistencia Perfecta: 100%)
(4, 1, '2026-05-01 18:30:00', TRUE, FALSE),
(4, 1, '2026-05-04 18:30:00', TRUE, FALSE),
(4, 1, '2026-05-05 18:30:00', TRUE, FALSE),
(4, 1, '2026-05-06 18:30:00', TRUE, FALSE),

-- Camila Sosa (Zona de Alerta: 77%)
(6, 1, '2026-05-01 18:30:00', TRUE, FALSE),
(6, 1, '2026-05-04 18:30:00', TRUE, FALSE), -- Tarde o justificado
(6, 1, '2026-05-05 18:30:00', TRUE, FALSE),
(6, 1, '2026-05-06 18:30:00', FALSE, FALSE);
