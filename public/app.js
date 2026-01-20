let sheets = [];
let completedSheets = new Set();
let currentSheetType = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
});

async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        const data = await res.json();

        if (data.sheets) {
            sheets = data.sheets; // [{name: 'G1', type: 'grupo'}, ...]
            populateSelect();
        }
    } catch (e) {
        console.error("Error loading config:", e);
        alert("Error cargando configuración del servidor.");
    }
}

// --- NAVIGATION ---
function startRevision() {
    completedSheets.clear(); // Start fresh session? Or persist? User said "automaticamente añade... cuando haya rellenado todos... popup"
    // Assuming session reset on "Iniciar Revision"
    updateProgress();

    document.getElementById('view-menu').classList.add('hidden');
    document.getElementById('view-menu').classList.remove('active');

    document.getElementById('view-revision').classList.remove('hidden');
    document.getElementById('view-revision').classList.add('active');

    // Reset selection
    document.getElementById('vehicle-select').value = "";
    document.getElementById('form-container').classList.add('hidden');
}

function showMenu() {
    document.getElementById('view-revision').classList.add('hidden');
    document.getElementById('view-revision').classList.remove('active');

    document.getElementById('view-menu').classList.remove('hidden');
    document.getElementById('view-menu').classList.add('active');
}

function updateProgress() {
    const total = sheets.length;
    const completed = completedSheets.size;
    document.getElementById('progress-indicator').textContent = `Completados: ${completed}/${total}`;

    if (completed === total && total > 0) {
        showCompletionModal();
    }
}

// --- FORM LOGIC ---
function populateSelect() {
    const select = document.getElementById('vehicle-select');
    select.innerHTML = '<option value="">-- Seleccionar --</option>';

    sheets.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet.name;
        option.textContent = sheet.name;
        // Mark as completed distinctively if needed?
        select.appendChild(option);
    });
}

function loadVehicleForm() {
    const select = document.getElementById('vehicle-select');
    const sheetName = select.value;
    const container = document.getElementById('form-container');
    const form = document.getElementById('dynamic-form');

    if (!sheetName) {
        container.classList.add('hidden');
        return;
    }

    // Find config
    const config = sheets.find(s => s.name === sheetName);
    currentSheetType = config ? config.type : 'grupo'; // Default

    // Build Form
    form.innerHTML = ''; // Clear previous

    // BUTTON: Delete Last Row
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-secondary';
    deleteBtn.style.backgroundColor = '#ef4444'; // Red color
    deleteBtn.style.color = 'white';
    deleteBtn.style.marginBottom = '20px';
    deleteBtn.textContent = 'Borrar última fila';
    deleteBtn.onclick = () => deleteLastRow(sheetName);
    form.appendChild(deleteBtn);

    // Common fields? No, specific per user request.

    if (currentSheetType === 'grupo') {
        createField(form, 'Horas', 'number', 'HORAS', false);
        createSelect(form, 'Aceite', 'ACEITE', ['Exceso', 'Bien', 'Poco', 'Vacío']);
        createSelect(form, 'Combustible', 'COMBUSTIBLE', ['Lleno', '3/4', '1/2', '1/4', 'Vacío']);
        createSelect(form, 'Pintura', 'PINTURA', ['OK', 'Mal']);
        createSelect(form, 'Piqueta', 'PIQUETA', ['OK', 'Mal']);
        createSelect(form, 'Extintor', 'EXTINTOR', ['OK', 'Mal']);
        createSelect(form, 'Ubicación', 'UBICACIÓN', ['Garaje', 'Escalón', 'ITV', 'Maniobras']);
        createField(form, 'Próxima ITV', 'date', 'PROXIMA ITV', false);
        createField(form, 'Observaciones', 'textarea', 'OBSERVACIONES');
        createField(form, 'Hecho Por', 'text', 'HECHO POR:', false);
    } else {
        // Remolque
        createSelect(form, 'Pintura', 'PINTURA', ['OK', 'Mal']);
        createSelect(form, 'Pines', 'PINES', ['Bien', 'Mal']);
        createSelect(form, 'Ruedas', 'RUEDAS', ['OK', 'Mal']);
        createSelect(form, 'Gancho', 'GANCHO', ['OK', 'Mal']);
        createSelect(form, 'Calzos', 'CALZOS', ['Si', 'No']);
        createSelect(form, 'Ubicación', 'UBICACIÓN', ['Garaje', 'Escalón', 'ITV', 'Maniobras']);
        createField(form, 'Próxima ITV', 'date', 'PROXIMA ITV', false);
        createField(form, 'Observaciones', 'textarea', 'OBSERVACIONES');
        createField(form, 'Hecho Por', 'text', 'HECHO POR:', false);
    }

    // Add Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Aceptar y Guardar';
    submitBtn.style.marginTop = '20px';
    form.appendChild(submitBtn);

    container.classList.remove('hidden');
}

// Helper to create input fields
function createField(parent, labelText, type, name, required = false) {
    const div = document.createElement('div');
    div.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;
    div.appendChild(label);

    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
    } else {
        input = document.createElement('input');
        input.type = type;
        if (type === 'number') input.step = "0.1";
    }

    input.name = name; // Important: matches Excel header key we logic-ed in app.py
    if (required) input.required = true;

    div.appendChild(input);
    parent.appendChild(div);
}

// Helper to create select fields
function createSelect(parent, labelText, name, options) {
    const div = document.createElement('div');
    div.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;
    div.appendChild(label);

    const select = document.createElement('select');
    select.name = name;

    options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.toUpperCase(); // Store as UPPER in excel? or matches prompt? Prompt said "Exceso, Bien..."
        // Let's store as is or upper. Usually excel enumerations are uppercase or consistent.
        // Prompt examples: "Exceso, Bien, Poco y Vacío" -> "BIEN" in example json.
        // Let's us uppercase for value to match existing data likely.
        o.value = opt;
        o.textContent = opt;
        select.appendChild(o);
    });

    div.appendChild(select);
    parent.appendChild(div);
}

// --- SUBMISSION ---
async function handleFormSubmit(e) {
    e.preventDefault();

    const select = document.getElementById('vehicle-select');
    const sheetName = select.value;
    const formDataRaw = new FormData(e.target);
    const formData = {};

    formDataRaw.forEach((value, key) => {
        formData[key] = value;
    });

    // Show loading
    document.getElementById('loading-overlay').classList.remove('hidden');

    try {
        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sheetName, formData })
        });

        const resData = await res.json();

        if (resData.success) {
            completedSheets.add(sheetName);
            updateProgress();

            // Clear form and selection
            e.target.reset();
            select.value = "";
            document.getElementById('form-container').classList.add('hidden');

            // Alert user briefly? Or just flow?
            // User: "automaticamente se añade fila... asi con cada una".
            // Maybe remove option from select or mark it?
            markOptionCompleted(sheetName);

        } else {
            alert("Error al guardar: " + resData.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error de red al guardar.");
    } finally {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
}

function markOptionCompleted(sheetName) {
    const select = document.getElementById('vehicle-select');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === sheetName) {
            select.options[i].innerText += " (Completado)";
            // disabled?
            // select.options[i].disabled = true; 
            break;
        }
    }
}

function showCompletionModal() {
    document.getElementById('completion-modal').classList.remove('hidden');
}

function closeModalAndReset() {
    document.getElementById('completion-modal').classList.add('hidden');
    // Go to menu?
    showMenu();
}


function downloadExcel() {
    window.location.href = '/api/download';
}

function showManual(e) {
    if (e) e.preventDefault();
    document.getElementById('manual-modal').classList.remove('hidden');
}

function closeManual() {
    document.getElementById('manual-modal').classList.add('hidden');
}

async function deleteLastRow(sheetName) {
    if (!confirm(`¿Estás seguro de que quieres borrar la última fila de ${sheetName}?`)) return;

    document.getElementById('loading-overlay').classList.remove('hidden');
    try {
        const res = await fetch('/api/delete_last', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sheetName })
        });
        const data = await res.json();

        if (data.success) {
            alert("Última fila borrada correctamente.");
        } else {
            alert("Error: " + data.error);
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión al borrar.");
    } finally {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
}
