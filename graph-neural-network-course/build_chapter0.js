/**
 * Build Script para Chapter 0 - Fundamentos de Redes Neuronales
 * 
 * Este script concatena todos los archivos modulares en un solo HTML
 * para uso en producción (sin necesidad de servidor para fetch).
 * 
 * Uso: node build_chapter0.js
 * Salidas:
 *  - dist/chapter0/Chapter0_Neural_Networks_Fundamentals_built.html
 *  - Copia en la raíz para compatibilidad
 */

const fs = require('fs');
const path = require('path');

const SECTIONS_DIR = 'chapter0_sections';
const OUTPUT_DIR = path.join('dist', 'chapter0');
const OUTPUT_NAME = 'Chapter0_Neural_Networks_Fundamentals_built.html';
const OUTPUT_FILE = path.join(OUTPUT_DIR, OUTPUT_NAME);
const OUTPUT_FILE_ROOT = OUTPUT_NAME; // copia en raíz

// Orden de los archivos a concatenar
// Flujo narrativo: Sigmoid → Frontera → Capas Ocultas → XOR → Círculo → Multiclase → Maquinaria
const htmlSections = [
  '02_intro.html',
  '03_section1_neurona.html',
  '04_section2_regresion.html',
  '05_section2.5_clasificacion.html',   // Sigmoid y clasificación binaria
  '06_section2.6_frontera.html',        // Frontera de decisión lineal
  '07_section2.7_capas_ocultas.html',   // Capas ocultas (para XOR necesitamos esto)
  '07b_xor_problema.html',              // XOR: el problema que requiere capas ocultas
  '08_section3_circulo.html',           // Círculo: caso continuo de no-linealidad
  '08_logits_softmax.html',             // §3.5: Logits y Softmax - transición a multiclase
  '13_appendix_activaciones.html',      // Funciones de activación como referencia
  '09_sections4_9.html',                // §4-§9: La maquinaria (Forward, Loss, Backprop, etc.)
  '10_section10_loop.html',
  '11_simulator_complete.html',
  '12_summary_footer.html'
];

const jsFiles = [
  'js/simulator1.js',
  'js/simulator2.js'
];

// Template del HTML final
const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capítulo 0: Fundamentos de Redes Neuronales</title>
  <style>
    /* ===== ESTILOS BASE ===== */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
      color: #e0e0e0;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* ===== HERO ===== */
    .hero {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    
    .hero h1 {
      font-size: 2.5em;
      margin-bottom: 15px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero p {
      font-size: 1.2em;
      opacity: 0.95;
      color: white;
    }
    
    /* ===== SECCIONES ===== */
    .section {
      background: #2a2a40;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .section-number {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3em;
      font-weight: bold;
      color: white;
    }
    
    .section-title h2 {
      font-size: 1.4em;
      color: #a5b4fc;
    }
    
    .section-title p {
      font-size: 0.9em;
      color: #9ca3af;
    }
    
    /* ===== ANALOGÍAS ===== */
    .analogy {
      background: linear-gradient(135deg, #374151, #1f2937);
      border-left: 4px solid #fbbf24;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin: 20px 0;
    }
    
    .analogy .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .analogy .header .icon {
      font-size: 1.5em;
    }
    
    .analogy .header .title {
      font-weight: bold;
      color: #fbbf24;
    }
    
    /* ===== HIGHLIGHTS ===== */
    .highlight {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 20px;
      border-radius: 12px;
      margin: 15px 0;
      border-left: 4px solid;
    }
    
    .highlight.info {
      background: rgba(59, 130, 246, 0.15);
      border-color: #3b82f6;
    }
    
    .highlight.warning {
      background: rgba(251, 191, 36, 0.15);
      border-color: #fbbf24;
    }
    
    .highlight.success {
      background: rgba(34, 197, 94, 0.15);
      border-color: #22c55e;
    }
    
    .highlight .icon {
      font-size: 1.5em;
    }
    
    /* ===== ECUACIONES ===== */
    .equation {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
      font-family: 'Times New Roman', serif;
      font-size: 1.4em;
      color: #60a5fa;
      border: 1px solid rgba(96, 165, 250, 0.3);
    }
    
    /* ===== CÓDIGO ===== */
    .code-block {
      background: #0f172a;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      overflow-x: auto;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    
    .code-block pre {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.9em;
      line-height: 1.5;
      color: #e2e8f0;
    }
    
    .code-block .keyword { color: #c084fc; }
    .code-block .string { color: #86efac; }
    .code-block .number { color: #fbbf24; }
    .code-block .comment { color: #6b7280; font-style: italic; }
    .code-block .function { color: #60a5fa; }
    
    /* ===== GRIDS ===== */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    @media (max-width: 768px) {
      .grid-2, .grid-3 {
        grid-template-columns: 1fr;
      }
    }
    
    /* ===== NOTEBOOK PROMPTS ===== */
    .exec-prompt {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-left: 4px solid #f59e0b;
      padding: 15px 20px;
      border-radius: 0 12px 12px 0;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .exec-prompt .icon {
      font-size: 1.3em;
    }
    
    .exec-prompt strong {
      color: #92400e;
    }
    
    .exec-prompt .sub {
      font-size: 0.85em;
      color: #a16207;
      margin-top: 5px;
    }
    
    /* ===== NAV BUTTON ===== */
    .nav-btn {
      display: inline-flex;
      text-decoration: none;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 15px 30px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 1.1em;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HERO -->
    <div class="hero">
      <h1>🧠 Capítulo 0</h1>
      <h2 style="font-size: 1.8em; margin-bottom: 20px; color: white;">Fundamentos de Redes Neuronales</h2>
      <p>De la neurona básica al entrenamiento completo — todo lo que necesitas antes de GNNs</p>
      <div style="margin-top: 25px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; display: inline-block;">
        <span style="font-size: 1.1em;">📓 Abre el notebook: <code style="background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 5px;">Chapter0_Notebook.ipynb</code></span>
      </div>
    </div>
    
    <!-- CONTENIDO GENERADO -->
{{SECTIONS_CONTENT}}
    
  </div>

  <!-- SCRIPTS -->
{{SCRIPTS_CONTENT}}
</body>
</html>`;

function build() {
  console.log('🔨 Building Chapter 0...\n');
  
  // Leer y concatenar secciones HTML
  let sectionsContent = '';
  for (const file of htmlSections) {
    const filePath = path.join(SECTIONS_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      sectionsContent += `\n    <!-- ===== ${file} ===== -->\n${content}\n`;
      console.log(`✅ Loaded: ${file}`);
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  }
  
  // Leer y concatenar scripts JS
  let scriptsContent = '';
  for (const file of jsFiles) {
    const filePath = path.join(SECTIONS_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      scriptsContent += `\n  <script>\n    // ===== ${file} =====\n${content}\n  </script>\n`;
      console.log(`✅ Loaded: ${file}`);
    } else {
      console.log(`⚠️  Not found: ${file}`);
    }
  }
  
  // Ensamblar HTML final
  let finalHtml = htmlTemplate
    .replace('{{SECTIONS_CONTENT}}', sectionsContent)
    .replace('{{SCRIPTS_CONTENT}}', scriptsContent);
  
  // Asegurar directorio de salida y escribir archivos
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, finalHtml, 'utf-8');
  fs.writeFileSync(OUTPUT_FILE_ROOT, finalHtml, 'utf-8');
  
  const statsDist = fs.statSync(OUTPUT_FILE);
  const statsRoot = fs.statSync(OUTPUT_FILE_ROOT);
  console.log(`\n📦 Output (dist): ${OUTPUT_FILE}`);
  console.log(`📊 Size: ${(statsDist.size / 1024).toFixed(1)} KB`);
  console.log(`\n📦 Output (root): ${OUTPUT_FILE_ROOT}`);
  console.log(`📊 Size: ${(statsRoot.size / 1024).toFixed(1)} KB`);
  console.log('\n✨ Build complete!\n');
}

// Ejecutar
build();
