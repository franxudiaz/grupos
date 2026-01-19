const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'grupos_data.xlsx');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
// Placeholder columns. USER: Please edit these if they don't match your Excel!
const COLUMNS = [
    "Fecha",
    "Hora",
    "Operador",
    "Grupo", // Added to track which group
    "Horas de Funcionamiento",
    "Nivel de Combustible",
    "Nivel de Aceite",
    "Tensión Batería",
    "Temperatura Agua",
    "Observaciones"
];

// Session state to track progress (Simple in-memory for MVP)
let sessionReviews = new Set(); // Stores group IDs reviewed this session

// Ensure Excel file exists with headers
if (!fs.existsSync(DATA_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([COLUMNS]);
    XLSX.utils.book_append_sheet(wb, ws, "Revisiones");
    XLSX.writeFile(wb, DATA_FILE);
    console.log("Created new Excel file:", DATA_FILE);
}

// Routes
app.get('/api/config', (req, res) => {
    res.json({ columns: COLUMNS, groups: [1, 2, 3, 4, 5] });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        completedCount: sessionReviews.size,
        completedGroups: Array.from(sessionReviews),
        isComplete: sessionReviews.size >= 5 
    });
});

app.post('/api/review', (req, res) => {
    const data = req.body;
    
    // simple validation
    if (!data) return res.status(400).json({ error: "No data provided" });

    // Read existing file
    let wb = XLSX.readFile(DATA_FILE);
    let ws = wb.Sheets["Revisiones"];
    
    // Convert current sheet to storage to append
    let sheetData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // Prepare new row based on COLUMNS order
    const newRow = COLUMNS.map(col => data[col] || "");
    
    // Auto-fill Timestamp if missing
    if (COLUMNS.includes("Fecha") && !data["Fecha"]) newRow[COLUMNS.indexOf("Fecha")] = new Date().toLocaleDateString('es-ES');
    if (COLUMNS.includes("Hora") && !data["Hora"]) newRow[COLUMNS.indexOf("Hora")] = new Date().toLocaleTimeString('es-ES');

    sheetData.push(newRow);

    // Write back
    const newWs = XLSX.utils.aoa_to_sheet(sheetData);
    wb.Sheets["Revisiones"] = newWs;
    XLSX.writeFile(wb, DATA_FILE);

    // Update Session
    if (data.Grupo) {
        sessionReviews.add(data.Grupo);
    }

    res.json({ success: true, message: "Review saved" });
});

app.post('/api/reset', (req, res) => {
    sessionReviews.clear();
    res.json({ success: true, message: "Session reset" });
});

app.get('/api/download', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        res.download(DATA_FILE);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
