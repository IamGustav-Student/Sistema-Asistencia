// INTERACTIVE LOGIC: SYSTEM FOR TERCIARIO ATTENDANCE CANVAS

document.addEventListener("DOMContentLoaded", () => {
  
  // -------------------- State Store --------------------
  const state = {
    activeRole: "visitante", // visitante, preceptor, profesor, alumno
    activeView: "login",
    pendingJustifications: 3,
    scannedCount: 14,
    qrTimeLeft: 15,
    lastSelectedJustId: "1",
    attendance: {
      s1: null,
      s2: null,
      s3: null,
      s4: null
    }
  };

  // Mock database for justifications
  const justificationsDb = {
    "1": {
      name: "Lucas Gómez",
      role: "TS Software 1° Año",
      type: "Médico",
      badgeClass: "badge-warning",
      date: "04 de Mayo, 2026",
      subjects: "Análisis Matemático, Programación I",
      reason: '"Presento certificado médico por cuadro de gastroenteritis aguda que requirió reposo domiciliario por 24 horas y régimen hídrico prescrito."',
      certTitle: "Sanatorio Central",
      certDr: "Dr. Carlos Rossi - Mat. 12894",
      certDesc: "Se prescribe reposo absoluto de 24 horas por cuadro febril y gastrointestinal agudo con dolor abdominal."
    },
    "2": {
      name: "Sofía Martínez",
      role: "TS Software 2° Año",
      type: "Examen",
      badgeClass: "badge-info",
      date: "03 de Mayo, 2026",
      subjects: "Sistemas Operativos, Base de Datos II",
      reason: '"Cargado por citación a mesa de examen final presencial en la Universidad Tecnológica Nacional (UTN) para homologación."',
      certTitle: "Universidad Tecnológica Nac.",
      certDr: "Prof. Lic. Daniel Garais - Sec. Académico",
      certDesc: "Se extiende el presente comprobante por examen final rendido de Álgebra Lineal en fecha 03/05/2026."
    },
    "3": {
      name: "Prof. Jorge Martínez",
      role: "Docente de Redes",
      type: "Licencia",
      badgeClass: "badge-danger",
      date: "02 de Mayo, 2026",
      subjects: "Redes e Infraestructura I y II (Turno Noche)",
      reason: '"Solicitud de licencia gremial por participación en las Jornadas de Capacitación Técnica Docente Obligatoria."',
      certTitle: "Asoc. de Docentes de la Prov.",
      certDr: "Prof. Estela Romero - Secretaria Gral.",
      certDesc: "Se certifica la asistencia a las capacitaciones del Congreso Provincial Docente durante las jornadas asignadas."
    }
  };

  // -------------------- DOM Selectors --------------------
  const viewSections = document.querySelectorAll(".canvas-view");
  const navBtns = document.querySelectorAll(".nav-btn");
  const viewTitle = document.getElementById("view-title");
  const viewSubtitle = document.getElementById("view-subtitle");
  
  // Realtime Clock
  const headerClock = document.getElementById("header-clock");
  const largeClockTime = document.getElementById("large-clock-time");

  // Login UI
  const loginForm = document.getElementById("login-form");
  const btnLogout = document.getElementById("btn-logout");
  const activeRoleBadge = document.getElementById("active-role-badge");

  // Restricted sidebars
  const preceptorSections = document.querySelectorAll(".preceptor-only");
  const teacherSections = document.querySelectorAll(".teacher-only");
  const studentSections = document.querySelectorAll(".student-only");

  // -------------------- 1. REALTIME CLOCK --------------------
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    if (headerClock) headerClock.textContent = timeStr;
    if (largeClockTime) largeClockTime.textContent = timeStr;
  }
  setInterval(updateClock, 1000);
  updateClock();


  // -------------------- 2. VIEW SWITCHING --------------------
  const viewMeta = {
    "login": { title: "Login / Acceso", subtitle: "Ingresa tus credenciales o selecciona un perfil rápido para explorar el canvas." },
    "admin-dash": { title: "Dashboard General Preceptoría", subtitle: "Métricas generales, control de inasistencias y Live Feed institucional." },
    "admin-justifications": { title: "Bandeja de Justificaciones", subtitle: "Revisión y aprobación en split-screen de comprobantes y licencias médicas." },
    "admin-early-warning": { title: "Monitoreo de Alerta Temprana", subtitle: "Identificación proactiva de alumnos con riesgo de perder regularidad académica." },
    "admin-reports": { title: "Planilla Mensual Cruzada", subtitle: "Visualización de la matriz de asistencias del mes, exportable para firmas ministeriales." },
    "teacher-dash": { title: "Dashboard del Profesor", subtitle: "Organizador semanal del docente, clock-in de presentismo y accesos de aula." },
    "teacher-clockin": { title: "Firma Digital de Presentismo", subtitle: "Registro institucional para el cobro de horas cátedra con validación GPS de ubicación." },
    "teacher-attendance": { title: "Toma de Asistencia Interactiva", subtitle: "Llamador de lista rápido táctil. Haz clic en las iniciales de cada alumno para probar." },
    "teacher-qr": { title: "Proyección de QR Dinámico", subtitle: "Herramienta para proyectar en el pizarrón. Regeneración cada 15 segundos." },
    "student-dash": { title: "Dashboard del Alumno", subtitle: "Transparencia de asistencia individual, cálculo automático de regularidad y alertas." },
    "student-scanner": { title: "Escáner QR de Aula", subtitle: "Simula el escaneo del código QR del profesor desde la aplicación del alumno." },
    "student-justification": { title: "Carga de Certificados Médicos", subtitle: "Carga digital para la validación automática de inasistencias por preceptoría." },
    "admin-upload-students": { title: "Carga Masiva de Alumnos desde Excel", subtitle: "Importación directa por planilla XLSX/XLS/CSV con validación de datos en tiempo real." },
    "settings": { title: "Configuración de Preferencias", subtitle: "La vista más simple. Selectores sencillos de notificaciones y alertas críticas." }
  };

  function switchView(viewName) {
    // Hide all views, remove active class
    viewSections.forEach(section => section.classList.remove("active"));
    
    // Show selected view
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add("active");
      state.activeView = viewName;
    }

    // Update headers
    if (viewMeta[viewName]) {
      viewTitle.textContent = viewMeta[viewName].title;
      viewSubtitle.textContent = viewMeta[viewName].subtitle;
    }

    // Update nav button states
    navBtns.forEach(btn => {
      if (btn.getAttribute("data-view") === viewName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Close screen or focus adjustment
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) canvasContainer.scrollTop = 0;
  }

  // Nav button event listeners
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewName = btn.getAttribute("data-view");
      switchView(viewName);
    });
  });


  // -------------------- 3. ROLE STATE MANAGEMENT (LOGIN / LOGOUT) --------------------
  function applyRolePermissions(role) {
    state.activeRole = role;
    
    // Hide all restricted sidebars first
    preceptorSections.forEach(s => s.style.display = "none");
    teacherSections.forEach(s => s.style.display = "none");
    studentSections.forEach(s => s.style.display = "none");

    // Reset badge
    activeRoleBadge.className = "role-badge";

    if (role === "preceptor") {
      preceptorSections.forEach(s => s.style.display = "block");
      activeRoleBadge.textContent = "👑 Preceptor (Admin)";
      activeRoleBadge.classList.add("text-violet");
      btnLogout.style.display = "block";
      switchView("admin-dash");
    } else if (role === "profesor") {
      teacherSections.forEach(s => s.style.display = "block");
      activeRoleBadge.textContent = "👨‍🏫 Docente";
      activeRoleBadge.classList.add("text-violet");
      btnLogout.style.display = "block";
      switchView("teacher-dash");
    } else if (role === "alumno") {
      studentSections.forEach(s => s.style.display = "block");
      activeRoleBadge.textContent = "🎓 Alumno Regular";
      activeRoleBadge.classList.add("text-violet");
      btnLogout.style.display = "block";
      switchView("student-dash");
    } else {
      activeRoleBadge.textContent = "Visitante";
      btnLogout.style.display = "none";
      switchView("login");
    }
  }

  // Handle shortcut role clicks
  document.querySelectorAll(".btn-shortcut").forEach(button => {
    button.addEventListener("click", () => {
      const selectedRole = button.getAttribute("data-role");
      applyRolePermissions(selectedRole);
      createToast(`¡Bienvenido! Iniciaste sesión como ${selectedRole.toUpperCase()}`, "success");
    });
  });

  // Handle traditional submit login with DNI
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const inputDni = document.getElementById("input-dni");
      const dniValue = inputDni ? inputDni.value.trim() : "";
      
      if (!dniValue) return;

      // Determinar rol simulado según el DNI ingresado
      let assignedRole = "alumno"; // Rol por defecto
      let roleLabel = "Alumno Regular";

      // Lógica dinámica interactiva para simular múltiples roles mediante DNI:
      // Si empieza con 1 (ej: 11111111) -> Preceptor
      if (dniValue.startsWith("1")) {
        assignedRole = "preceptor";
        roleLabel = "Preceptor (Admin)";
      } 
      // Si empieza con 2 (ej: 22222222) -> Profesor
      else if (dniValue.startsWith("2")) {
        assignedRole = "profesor";
        roleLabel = "Docente";
      }
      // Si empieza con cualquier otro dígito (ej: 33333333 o 40000000) -> Alumno
      else {
        assignedRole = "alumno";
        roleLabel = "Alumno Regular";

        // Verificar si es un alumno registrado dinámicamente en registro.html
        try {
          const mockDb = JSON.parse(sessionStorage.getItem("mock_registered_students") || "[]");
          const registeredUser = mockDb.find(u => u.dni === dniValue);
          if (registeredUser) {
            roleLabel = `Alumno/a (${registeredUser.nombre} ${registeredUser.apellido})`;
            applyRolePermissions(assignedRole);
            createToast(`¡Bienvenido/a de nuevo, ${registeredUser.nombre}! Inscrito en ${registeredUser.carrera.split('(')[0]}`, "success");
            return;
          }
        } catch (err) {
          console.error("Error leyendo mock de alumnos", err);
        }
      }

      applyRolePermissions(assignedRole);
      createToast(`¡Sesión iniciada! DNI: ${dniValue} accedió como ${roleLabel}.`, "success");
    });
  }

  // Logout Handler
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      applyRolePermissions("visitante");
      createToast("Sesión terminada con éxito.", "warning");
    });
  }


  // -------------------- 4. ROLL CALL INTERACTIVE SHEET --------------------
  const rollCallRows = document.querySelectorAll("#student-list-roll-call .student-row");
  const countPresentSpan = document.getElementById("count-present");
  const countAbsentSpan = document.getElementById("count-absent");
  const countLateSpan = document.getElementById("count-late");
  const countJustifiedSpan = document.getElementById("count-justified");

  function updateRollCallStats() {
    let pr = 0, ab = 0, ta = 0, ju = 0;
    
    rollCallRows.forEach(row => {
      const status = row.getAttribute("data-status");
      if (status === "P") pr++;
      else if (status === "A") ab++;
      else if (status === "T") ta++;
      else if (status === "J") ju++;
    });

    if (countPresentSpan) countPresentSpan.textContent = pr;
    if (countAbsentSpan) countAbsentSpan.textContent = ab;
    if (countLateSpan) countLateSpan.textContent = ta;
    if (countJustifiedSpan) countJustifiedSpan.textContent = ju;
  }

  // Attach status toggle clicks
  rollCallRows.forEach(row => {
    const studentId = row.getAttribute("data-id");
    const statusButtons = row.querySelectorAll(".status-selector");

    statusButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedStatus = btn.getAttribute("data-status");
        
        // If already selected, untoggle, else set
        if (row.getAttribute("data-status") === selectedStatus) {
          row.removeAttribute("data-status");
          state.attendance[studentId] = null;
        } else {
          row.setAttribute("data-status", selectedStatus);
          state.attendance[studentId] = selectedStatus;
        }
        updateRollCallStats();
      });
    });
  });

  // Mark all present button
  const btnMarkAllPresent = document.getElementById("btn-mark-all-present");
  if (btnMarkAllPresent) {
    btnMarkAllPresent.addEventListener("click", () => {
      rollCallRows.forEach(row => {
        const studentId = row.getAttribute("data-id");
        row.setAttribute("data-status", "P");
        state.attendance[studentId] = "P";
      });
      updateRollCallStats();
      createToast("Todos los alumnos marcados como PRESENTES.", "success");
    });
  }

  // Save roll call attendance
  const btnSaveAttendance = document.getElementById("btn-save-attendance-roll-call");
  if (btnSaveAttendance) {
    btnSaveAttendance.addEventListener("click", () => {
      createToast("✓ Planilla de asistencia guardada con éxito y sincronizada con Preceptoría.", "success");
      switchView("teacher-dash");
    });
  }

  // Quick action from teacher dash
  const btnQuickRollCall = document.getElementById("btn-quick-roll-call");
  if (btnQuickRollCall) {
    btnQuickRollCall.addEventListener("click", () => {
      switchView("teacher-attendance");
    });
  }


  // -------------------- 5. DYNAMIC QR GENERATOR (15S ROTATING) --------------------
  const qrTimerSeconds = document.getElementById("qr-timer-seconds");
  const qrTimerProgress = document.getElementById("qr-timer-progress");
  const qrScanCount = document.getElementById("qr-scan-count");
  const qrScanAvatars = document.getElementById("qr-scan-avatars");
  const qrDynamicDots = document.getElementById("qr-dynamic-dots");

  function tickQrTimer() {
    if (state.activeView !== "teacher-qr") return;

    state.qrTimeLeft--;
    if (state.qrTimeLeft < 0) {
      state.qrTimeLeft = 15;
      
      // Simulate rotating code logic (shift dots of the SVG QR)
      if (qrDynamicDots) {
        const shiftX = Math.floor(Math.random() * 5);
        const shiftY = Math.floor(Math.random() * 5);
        qrDynamicDots.setAttribute("transform", `translate(${shiftX - 2}, ${shiftY - 2})`);
      }

      // Add 1-2 new scanned students
      const mockScanned = ["Martina Rossi (MR)", "Nicolás Ortiz (NO)", "Sofía Juárez (SJ)", "Geronimo Paz (GP)", "Elena Silva (ES)"];
      const chosen = mockScanned[Math.floor(Math.random() * mockScanned.length)];
      const initials = chosen.split("(")[1].slice(0, 2);
      const name = chosen.split("(")[0].trim();

      state.scannedCount++;
      if (qrScanCount) qrScanCount.textContent = state.scannedCount;

      if (qrScanAvatars) {
        const newAvatar = document.createElement("span");
        newAvatar.className = "scanned-avatar";
        newAvatar.title = name;
        newAvatar.textContent = initials;
        qrScanAvatars.prepend(newAvatar);
        
        // Remove last if there are more than 10 to keep it clean
        if (qrScanAvatars.children.length > 10) {
          qrScanAvatars.lastElementChild.remove();
        }
      }

      createToast(`¡Nuevo ingreso QR registrado! Alumno: ${name}`, "success");
    }

    // Update labels and progress UI
    if (qrTimerSeconds) qrTimerSeconds.textContent = `${state.qrTimeLeft}s`;
    if (qrTimerProgress) {
      const percentage = (state.qrTimeLeft / 15) * 100;
      qrTimerProgress.style.width = `${percentage}%`;
    }
  }
  setInterval(tickQrTimer, 1000);

  // Link quick actions
  const btnProjectQr = document.getElementById("btn-project-qr-current");
  if (btnProjectQr) {
    btnProjectQr.addEventListener("click", () => {
      switchView("teacher-qr");
    });
  }


  // -------------------- 6. TEACHER CLOCK-IN PRESENTISM --------------------
  const btnSidebarClockin = document.getElementById("btn-sidebar-clockin");
  const btnActionClockIn = document.getElementById("btn-action-clock-in");
  const btnActionClockOut = document.getElementById("btn-action-clock-out");
  const docentClockinStatus = document.getElementById("docent-clockin-status");

  if (btnSidebarClockin) {
    btnSidebarClockin.addEventListener("click", () => {
      switchView("teacher-clockin");
    });
  }

  if (btnActionClockIn) {
    btnActionClockIn.addEventListener("click", () => {
      btnActionClockIn.disabled = true;
      btnActionClockIn.textContent = "FIRMADO";
      if (btnActionClockOut) btnActionClockOut.disabled = false;

      if (docentClockinStatus) {
        docentClockinStatus.innerHTML = `
          <div class="clockin-circle status-present">✓</div>
          <p class="status-text font-bold text-success">Firmado - Entrada: ${new Date().toLocaleTimeString().slice(0, 5)}hs</p>
        `;
      }
      createToast("✓ Entrada docente firmada digitalmente con éxito.", "success");
    });
  }

  if (btnActionClockOut) {
    btnActionClockOut.addEventListener("click", () => {
      btnActionClockOut.disabled = true;
      btnActionClockOut.textContent = "FIRMADO SALIDA";
      createToast("✓ Salida docente firmada con éxito. Horas cátedra enviadas a liquidación.", "success");
    });
  }


  // -------------------- 7. ADMIN JUSTIFICATIONS INBOX (SPLIT-SCREEN) --------------------
  const justItems = document.querySelectorAll(".just-item");
  const justStudentName = document.getElementById("just-student-name");
  const justTypeBadge = document.getElementById("just-type-badge");
  const justUserCareer = document.getElementById("just-user-career");
  const justDate = document.getElementById("just-date");
  const justSubjects = document.getElementById("just-subjects");
  const justReason = document.getElementById("just-reason");
  const simulatedMedicalCert = document.querySelector(".simulated-medical-cert");
  
  const adminPendingJustCount = document.getElementById("admin-pending-justifications");
  const btnApproveJust = document.getElementById("btn-approve-justification");
  const btnRejectJust = document.getElementById("btn-reject-justification");

  function selectJustification(id) {
    state.lastSelectedJustId = id;
    const data = justificationsDb[id];
    if (!data) return;

    // Update active class
    justItems.forEach(item => {
      if (item.getAttribute("data-id") === id) item.classList.add("active");
      else item.classList.remove("active");
    });

    // Update detail layout
    if (justStudentName) justStudentName.textContent = data.name;
    if (justTypeBadge) {
      justTypeBadge.className = `badge ${data.badgeClass}`;
      justTypeBadge.textContent = data.type;
    }
    if (justUserCareer) justUserCareer.textContent = data.role;
    if (justDate) justDate.textContent = data.date;
    if (justSubjects) justSubjects.textContent = data.subjects;
    if (justReason) justReason.textContent = data.reason;

    // Update certificate preview
    if (simulatedMedicalCert) {
      simulatedMedicalCert.className = `simulated-medical-cert`;
      // apply custom border classes
      if (data.type === "Médico") simulatedMedicalCert.style.borderLeft = "4px solid var(--clr-rose)";
      else if (data.type === "Examen") simulatedMedicalCert.style.borderLeft = "4px solid var(--clr-blue)";
      else simulatedMedicalCert.style.borderLeft = "4px solid var(--clr-amber)";

      simulatedMedicalCert.innerHTML = `
        <h4>🏥 ${data.certTitle}</h4>
        <p class="cert-date">Fecha: ${data.date.split(",")[0]}</p>
        <p class="cert-patient">Paciente / Beneficiario: ${data.name}</p>
        <div class="cert-rx">
          <p>${data.certDesc}</p>
        </div>
        <div class="cert-signature">
          <p>______________________</p>
          <p>${data.certDr}</p>
        </div>
      `;
    }
  }

  // Attach clicks
  justItems.forEach(item => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      selectJustification(id);
    });
  });

  // Action: Approve
  if (btnApproveJust) {
    btnApproveJust.addEventListener("click", () => {
      const activeItem = document.querySelector(".just-item.active");
      if (activeItem) {
        const id = activeItem.getAttribute("data-id");
        createToast(`Justificación aprobada con éxito para ${justificationsDb[id].name}.`, "success");
        removeJustificationItem(activeItem, id);
      }
    });
  }

  // Action: Reject
  if (btnRejectJust) {
    btnRejectJust.addEventListener("click", () => {
      const activeItem = document.querySelector(".just-item.active");
      if (activeItem) {
        const id = activeItem.getAttribute("data-id");
        createToast(`Justificación de inasistencia RECHAZADA para ${justificationsDb[id].name}. Se notificará por email.`, "warning");
        removeJustificationItem(activeItem, id);
      }
    });
  }

  function removeJustificationItem(element, id) {
    element.remove();
    delete justificationsDb[id];
    
    // Decrement counter
    state.pendingJustifications = Math.max(0, state.pendingJustifications - 1);
    if (adminPendingJustCount) adminPendingJustCount.textContent = state.pendingJustifications;

    // Select first available item
    const remainingItems = document.querySelectorAll(".just-item");
    if (remainingItems.length > 0) {
      const nextId = remainingItems[0].getAttribute("data-id");
      selectJustification(nextId);
    } else {
      // Clear panel
      const detailPanel = document.getElementById("just-detail-panel");
      if (detailPanel) {
        detailPanel.innerHTML = `
          <div class="text-center py-8 text-muted">
            <h3>📂 Bandeja Vacía</h3>
            <p>No tienes solicitudes de justificaciones pendientes para procesar.</p>
          </div>
        `;
      }
    }
  }


  // -------------------- 8. STUDENT SCANNER & CERTIFICATE UPLOAD --------------------
  const btnOpenScanner = document.getElementById("btn-open-student-scanner");
  const btnSimulateScan = document.getElementById("btn-simulate-successful-scan");
  const btnCancelScan = document.getElementById("btn-cancel-scan");

  if (btnOpenScanner) {
    btnOpenScanner.addEventListener("click", () => {
      switchView("student-scanner");
    });
  }

  if (btnCancelScan) {
    btnCancelScan.addEventListener("click", () => {
      switchView("student-dash");
    });
  }

  if (btnSimulateScan) {
    btnSimulateScan.addEventListener("click", () => {
      const cameraViewport = document.getElementById("camera-viewport");
      if (cameraViewport) {
        cameraViewport.innerHTML = `
          <div class="text-center font-bold text-success" style="padding-top: 140px;">
            <div class="clockin-circle status-present" style="animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);">✓</div>
            <p style="margin-top: 10px;">¡ASISTENCIA REGISTRADA!</p>
          </div>
        `;
      }

      setTimeout(() => {
        createToast("✓ ¡Asistencia registrada con éxito! Materia: Análisis Matemático.", "success");
        switchView("student-dash");
        
        // Restore simulated camera layout
        if (cameraViewport) {
          cameraViewport.innerHTML = `
            <div class="scan-target-box">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
              <div class="laser-scanner-line"></div>
              <div class="camera-lens-sim">📸 Cámara Simulada Activa</div>
            </div>
          `;
        }
      }, 1500);
    });
  }

  // File drag simulation
  const certDragZone = document.getElementById("cert-drag-zone");
  const selectedFileBadge = document.getElementById("selected-file-badge");
  const btnOpenStudentJust = document.getElementById("btn-open-student-justification");
  const btnCancelJustUpload = document.getElementById("btn-cancel-justification-upload");
  const formUploadJust = document.getElementById("form-upload-justification");

  if (btnOpenStudentJust) {
    btnOpenStudentJust.addEventListener("click", () => {
      switchView("student-justification");
    });
  }

  if (btnCancelJustUpload) {
    btnCancelJustUpload.addEventListener("click", () => {
      switchView("student-dash");
    });
  }

  if (certDragZone) {
    certDragZone.addEventListener("click", () => {
      // Simulate file upload choice
      if (selectedFileBadge) {
        selectedFileBadge.style.display = "inline-block";
        createToast("Certificado cargado temporalmente. Listo para enviar.", "success");
      }
    });
  }

  if (formUploadJust) {
    formUploadJust.addEventListener("submit", (e) => {
      e.preventDefault();
      createToast("✓ Solicitud de justificación médica enviada correctamente a Preceptoría.", "success");
      if (selectedFileBadge) selectedFileBadge.style.display = "none";
      formUploadJust.reset();
      switchView("student-dash");
    });
  }


  // -------------------- 9. SETTINGS PREFERENCES (THE SIMPLEST VIEW) --------------------
  const btnSaveSettings = document.getElementById("btn-save-settings");
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener("click", () => {
      createToast("✓ Tus preferencias de alertas se guardaron correctamente.", "success");
    });
  }


  // -------------------- 9.5. EXCEL BULK UPLOAD LOGIC --------------------
  state.importedStudents = [];

  const excelDropZone = document.getElementById("excel-drop-zone");
  const excelFileInput = document.getElementById("excel-file-input");
  const btnDownloadTemplate = document.getElementById("btn-download-template");
  const btnSimulateTestData = document.getElementById("btn-simulate-test-data");
  const btnConfirmImport = document.getElementById("btn-confirm-import");
  const btnCancelImport = document.getElementById("btn-cancel-import");
  const previewPanel = document.getElementById("preview-panel");
  const previewTableBody = document.getElementById("preview-table-body");

  const kpiRead = document.getElementById("kpi-rows-read");
  const kpiValid = document.getElementById("kpi-rows-valid");
  const kpiError = document.getElementById("kpi-rows-error");

  if (excelDropZone) {
    excelDropZone.addEventListener("click", () => {
      if (excelFileInput) excelFileInput.click();
    });

    // Drag and drop event listeners
    ["dragenter", "dragover"].forEach(eventName => {
      excelDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        excelDropZone.classList.add("dragover");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      excelDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        excelDropZone.classList.remove("dragover");
      }, false);
    });

    excelDropZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    });
  }

  if (excelFileInput) {
    excelFileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to json array of objects
        const rawRows = XLSX.utils.sheet_to_json(worksheet);
        processParsedRows(rawRows);
      } catch (err) {
        console.error(err);
        createToast("Error al leer el archivo Excel. Asegúrate de que no esté corrupto.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processParsedRows(rawRows) {
    if (!rawRows || rawRows.length === 0) {
      createToast("El archivo de Excel está vacío o no contiene filas.", "warning");
      return;
    }

    state.importedStudents = [];
    let readCount = rawRows.length;
    let validCount = 0;
    let errorCount = 0;

    rawRows.forEach((row, index) => {
      // Find case-insensitive keys
      const getVal = (possibleKeys) => {
        const foundKey = Object.keys(row).find(k => possibleKeys.some(pk => k.toLowerCase().trim() === pk.toLowerCase()));
        return foundKey ? String(row[foundKey]).trim() : "";
      };

      const dni = getVal(["dni", "documento", "id"]);
      const nombre = getVal(["nombre", "name", "primer nombre"]);
      const apellido = getVal(["apellido", "surname", "last name", "apellidos"]);
      const carrera = getVal(["carrera", "career", "tecnicatura", "programa"]);

      const isValid = dni && nombre && apellido && carrera && /^\d{7,8}$/.test(dni);
      
      const studentObj = {
        id: `imp-${index}-${Date.now()}`,
        dni: dni,
        nombre: nombre,
        apellido: apellido,
        carrera: carrera,
        isValid: isValid,
        statusMsg: isValid ? "Válido" : (!dni || !/^\d{7,8}$/.test(dni) ? "DNI Inválido" : "Campos Vacíos")
      };

      state.importedStudents.push(studentObj);
      if (isValid) validCount++;
      else errorCount++;
    });

    updateKPIs(readCount, validCount, errorCount);
    renderPreviewTable();
    createToast(`Archivo procesado: ${readCount} registros encontrados.`, "success");
  }

  function updateKPIs(read, valid, errors) {
    if (kpiRead) kpiRead.textContent = read;
    if (kpiValid) kpiValid.textContent = valid;
    if (kpiError) kpiError.textContent = errors;
  }

  function renderPreviewTable() {
    if (!previewTableBody || !previewPanel) return;

    previewTableBody.innerHTML = "";
    if (state.importedStudents.length === 0) {
      previewPanel.style.display = "none";
      return;
    }

    state.importedStudents.forEach(student => {
      const tr = document.createElement("tr");
      tr.id = `row-${student.id}`;
      
      const badgeClass = student.isValid ? "badge-status-valid" : "badge-status-error";
      
      tr.innerHTML = `
        <td><strong>${student.dni}</strong></td>
        <td>${student.nombre}</td>
        <td>${student.apellido}</td>
        <td><span class="text-muted" style="font-size:0.85rem;">${student.carrera}</span></td>
        <td><span class="${badgeClass}">${student.statusMsg}</span></td>
        <td style="text-align: center;">
          <button class="btn btn-outline-danger btn-sm-delete" data-id="${student.id}" style="padding: 4px 8px; font-size: 0.75rem;">🗑️</button>
        </td>
      `;

      previewTableBody.appendChild(tr);
    });

    // Attach row delete actions
    previewTableBody.querySelectorAll(".btn-sm-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        removeImportedStudent(id);
      });
    });

    previewPanel.style.display = "block";
    previewPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function removeImportedStudent(id) {
    state.importedStudents = state.importedStudents.filter(s => s.id !== id);
    
    // Recalculate KPIs
    const read = state.importedStudents.length;
    const valid = state.importedStudents.filter(s => s.isValid).length;
    const errors = read - valid;

    updateKPIs(read, valid, errors);
    renderPreviewTable();
  }

  if (btnCancelImport) {
    btnCancelImport.addEventListener("click", () => {
      state.importedStudents = [];
      if (previewPanel) previewPanel.style.display = "none";
      updateKPIs(0, 0, 0);
      if (excelFileInput) excelFileInput.value = "";
      createToast("Importación cancelada.", "warning");
    });
  }

  // Simulate Test Data Load
  if (btnSimulateTestData) {
    btnSimulateTestData.addEventListener("click", () => {
      const mockImported = [
        { id: "imp-1", dni: "39874521", nombre: "Franco", apellido: "Caputo", carrera: "Tecnicatura Superior en Desarrollo de Software (TS Software)", isValid: true, statusMsg: "Válido" },
        { id: "imp-2", dni: "40123984", nombre: "Elena", apellido: "Giménez", carrera: "Tecnicatura Superior en Adm. de Redes y Sistemas (TS Redes)", isValid: true, statusMsg: "Válido" },
        { id: "imp-3", dni: "41984256", nombre: "Santiago", apellido: "Vázquez", carrera: "Tecnicatura Superior en Enfermería (TS Enfermería)", isValid: true, statusMsg: "Válido" },
        { id: "imp-4", dni: "invalid-dni", nombre: "Julieta", apellido: "Pons", carrera: "Tecnicatura Superior en Desarrollo de Software (TS Software)", isValid: false, statusMsg: "DNI Inválido" },
        { id: "imp-5", dni: "42109348", nombre: "Mateo", apellido: "Russo", carrera: "Tecnicatura Superior en Marketing Digital (TS Marketing)", isValid: true, statusMsg: "Válido" }
      ];

      state.importedStudents = mockImported;
      updateKPIs(5, 4, 1);
      renderPreviewTable();
      createToast("⚡ Planilla de prueba cargada con éxito. Revisa el listado.", "success");
    });
  }

  // Generate and Download Template
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener("click", () => {
      try {
        const wb = XLSX.utils.book_new();
        const ws_data = [
          ["DNI", "Nombre", "Apellido", "Carrera"],
          ["39123456", "Clara", "Méndez", "Tecnicatura Superior en Desarrollo de Software (TS Software)"],
          ["40555666", "Tomás", "Benítez", "Tecnicatura Superior en Adm. de Redes y Sistemas (TS Redes)"],
          ["38444999", "Federico", "Díaz", "Tecnicatura Superior en Enfermería (TS Enfermería)"],
          ["41777222", "Valentina", "Gómez", "Tecnicatura Superior en Marketing Digital (TS Marketing)"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
        XLSX.writeFile(wb, "Plantilla_Alumnos_Instituto124.xlsx");
        createToast("✓ Plantilla oficial descargada correctamente.", "success");
      } catch (err) {
        console.error(err);
        createToast("No se pudo generar el archivo de plantilla.", "error");
      }
    });
  }

  // Confirm and Save Import
  if (btnConfirmImport) {
    btnConfirmImport.addEventListener("click", () => {
      const validStudents = state.importedStudents.filter(s => s.isValid);
      if (validStudents.length === 0) {
        createToast("No hay registros válidos para importar.", "warning");
        return;
      }

      try {
        const mockDb = JSON.parse(sessionStorage.getItem("mock_registered_students") || "[]");
        
        validStudents.forEach(newStudent => {
          // Avoid duplicate entries
          if (!mockDb.some(u => u.dni === newStudent.dni)) {
            mockDb.push({
              nombre: newStudent.nombre,
              apellido: newStudent.apellido,
              dni: newStudent.dni,
              carrera: newStudent.carrera
            });
          }
        });

        sessionStorage.setItem("mock_registered_students", JSON.stringify(mockDb));
        createToast(`¡Importación exitosa! Se cargaron ${validStudents.length} alumnos correctamente al sistema.`, "success");
        
        // Reset state
        state.importedStudents = [];
        if (previewPanel) previewPanel.style.display = "none";
        updateKPIs(0, 0, 0);
        if (excelFileInput) excelFileInput.value = "";
        
        // Go back to preceptor dashboard
        switchView("admin-dash");
      } catch (err) {
        console.error(err);
        createToast("Error al guardar los alumnos importados.", "error");
      }
    });
  }


  // -------------------- 10. LIVE FEED EVENT GENERATION (AUTO-SIMULATE) --------------------
  const adminLiveFeed = document.getElementById("admin-live-feed");
  const mockFeedPhrases = [
    "Prof. Diego Álvarez firmó entrada digital (Aula 108 - Redes).",
    "Asistencia completada para TS Redes 2° Año (Presentes: 18 / Ausentes: 4).",
    "Sofía Martínez registró asistencia vía QR en Sistemas Operativos.",
    "Bandeja: Alumno Tomás Heredia cargó una solicitud de justificación médica.",
    "Alerta Temprana: Camila Sosa descendió a 74.8% en Análisis Matemático.",
    "Prof. Jorge Martínez solicitó cambio de aula para el módulo de POO."
  ];

  function autoAddLiveFeed() {
    if (state.activeView !== "admin-dash" || !adminLiveFeed) return;

    const chosenPhrase = mockFeedPhrases[Math.floor(Math.random() * mockFeedPhrases.length)];
    const timeStr = new Date().toLocaleTimeString().slice(0, 5);

    const newFeedItem = document.createElement("div");
    newFeedItem.className = "feed-item";
    newFeedItem.innerHTML = `
      <span class="time">${timeStr}</span>
      <p>${chosenPhrase}</p>
    `;

    adminLiveFeed.prepend(newFeedItem);

    // Keep max 5 items in dashboard list to avoid clutter
    if (adminLiveFeed.children.length > 5) {
      adminLiveFeed.lastElementChild.remove();
    }
  }
  setInterval(autoAddLiveFeed, 12000);


  // -------------------- 11. HELPER TOAST NOTIFICATIONS --------------------
  const toastWrapper = document.getElementById("toast-wrapper");

  function createToast(message, type = "success") {
    if (!toastWrapper) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    const icon = type === "success" ? "✓" : "⚠️";
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    toastWrapper.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // -------------------- 12. MOBILE NAVIGATION DRAWER --------------------
  const btnMenuToggle = document.getElementById("btn-menu-toggle");
  const appSidebar = document.querySelector(".app-sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  function toggleSidebar() {
    if (appSidebar && btnMenuToggle && sidebarOverlay) {
      appSidebar.classList.toggle("open");
      btnMenuToggle.classList.toggle("open");
      sidebarOverlay.classList.toggle("open");
    }
  }

  function closeSidebar() {
    if (appSidebar && btnMenuToggle && sidebarOverlay) {
      appSidebar.classList.remove("open");
      btnMenuToggle.classList.remove("open");
      sidebarOverlay.classList.remove("open");
    }
  }

  if (btnMenuToggle) {
    btnMenuToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Auto-close sidebar on mobile when navigating
  const allNavigableElements = document.querySelectorAll(".nav-btn, .btn-shortcut, #btn-logout");
  allNavigableElements.forEach(btn => {
    btn.addEventListener("click", () => {
      closeSidebar();
    });
  });

  // Pre-select first item on load
  selectJustification("1");
  updateRollCallStats();

});
