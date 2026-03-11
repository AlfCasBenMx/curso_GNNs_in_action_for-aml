/* ================================================================
   app_ch2.js — Capitulo 2: Graph Embeddings
   Logica interactiva, quizzes, canvas, flashcards, ejercicios
   ================================================================ */

/* ---------- SECTION ORDER & STATE ---------- */
const sectionOrder = [
  'intro','n2v','gnn_emb','comparacion','semi_supervised',
  'under_hood','aml','quiz1','quiz2','flashcards','ejercicios','resumen'
];

let completed = {};
let unlocked  = { intro: true };
let scores    = { 1: 0, 2: 0 };
let answered  = { 1: {}, 2: {} };
let totals    = { 1: 12, 2: 10 };

/* ---------- PERSISTENCE ---------- */
function saveProgress(){
  localStorage.setItem('gnn_ch2_unlocked',  JSON.stringify(unlocked));
  localStorage.setItem('gnn_ch2_completed', JSON.stringify(completed));
  localStorage.setItem('gnn_ch2_scores',    JSON.stringify(scores));
  localStorage.setItem('gnn_ch2_answered',  JSON.stringify(answered));
}
function loadProgress(){
  try{
    const u = localStorage.getItem('gnn_ch2_unlocked');
    const c = localStorage.getItem('gnn_ch2_completed');
    const s = localStorage.getItem('gnn_ch2_scores');
    const a = localStorage.getItem('gnn_ch2_answered');
    if(u) unlocked  = JSON.parse(u);
    if(c) completed = JSON.parse(c);
    if(s) scores    = JSON.parse(s);
    if(a) answered  = JSON.parse(a);
  }catch(e){}
}

/* ---------- GLOBAL PROGRESS ---------- */
function updateGlobalProgress(){
  const total = sectionOrder.length;
  const done  = sectionOrder.filter(s => completed[s]).length;
  const pct   = Math.round(done / total * 100);
  const fill  = document.getElementById('globalFill');
  const label = document.getElementById('globalPct');
  if(fill)  fill.style.width = pct + '%';
  if(label) label.textContent = pct + '%';
}

/* ---------- NAV ---------- */
function updateNavState(){
  document.querySelectorAll('#mainNav button').forEach(btn => {
    const s = btn.getAttribute('data-section');
    const lock = btn.querySelector('.lock-icon');
    if(unlocked[s]){
      btn.classList.remove('locked');
      if(lock) lock.textContent = '';
    } else {
      btn.classList.add('locked');
      if(lock) lock.textContent = ' \uD83D\uDD12';
    }
    btn.classList.toggle('completed', !!completed[s]);
  });
}
function unlockNext(current){
  const i = sectionOrder.indexOf(current);
  if(i >= 0 && i < sectionOrder.length - 1){
    unlocked[sectionOrder[i + 1]] = true;
  }
  saveProgress();
  updateNavState();
}
function navClick(sec){
  if(!unlocked[sec]) return;
  showSection(sec);
}

/* ---------- SECTIONS ---------- */
function showSection(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el){
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Init canvases when their section becomes visible
  if(id === 'n2v'){
    setTimeout(() => { drawBFSDFS(); drawN2VPipelineBase(); }, 200);
  }
  if(id === 'gnn_emb'){
    setTimeout(() => { drawGNNGraph(); drawGNNPipelineBase(); }, 200);
  }
  if(id === 'semi_supervised'){
    setTimeout(() => { drawResultsChart(); }, 200);
  }
  if(id === 'aml'){
    setTimeout(() => { drawAMLGraph(); }, 200);
  }
  if(id === 'flashcards'){
    setTimeout(() => { initFlashcards(); }, 100);
  }
  if(id === 'ejercicios'){
    setTimeout(() => { initExercises(); }, 100);
  }
  if(id === 'resumen'){
    setTimeout(() => { drawMindMap(); updateFinalScores(); }, 200);
  }
}

/* ---------- CHECKPOINTS ---------- */
function checkCP(section, el, correct){
  const fb = document.getElementById('cpFb-' + section);
  if(!fb) return;
  if(correct){
    fb.innerHTML = '<span style="color:var(--dc-green);font-weight:700;">&#10004; Correcto! Seccion desbloqueada.</span>';
    el.style.background = 'var(--dc-green)';
    el.style.color = '#000';
    completed[section] = true;
    unlockNext(section);
    updateGlobalProgress();
  } else {
    fb.innerHTML = '<span style="color:#ff6b6b;font-weight:700;">&#10008; Incorrecto. Intenta de nuevo.</span>';
    el.style.background = '#ff6b6b';
    el.style.color = '#fff';
    setTimeout(() => {
      el.style.background = '';
      el.style.color = '';
    }, 1200);
  }
}

/* ---------- COMPLETE SECTION (flashcards/ejercicios) ---------- */
function completeSection(section){
  completed[section] = true;
  unlockNext(section);
  updateGlobalProgress();
  saveProgress();
  const i = sectionOrder.indexOf(section);
  if(i >= 0 && i < sectionOrder.length - 1){
    showSection(sectionOrder[i + 1]);
  }
}

/* ---------- ACCORDION & TABS ---------- */
function toggleAccordion(header){
  const body = header.nextElementSibling;
  const icon = header.querySelector('.accordion-icon');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open');
  if(icon) icon.textContent = isOpen ? '\u25BC' : '\u25B2';
}

/* ---------- QUIZ LOGIC ---------- */
function checkQ(el, correct, quizNum, explanation){
  const q = el.parentElement;
  if(q.classList.contains('answered')) return;

  q.classList.add('answered');
  const opts = q.querySelectorAll('.option');
  opts.forEach(o => {
    o.style.pointerEvents = 'none';
    o.style.opacity = '0.6';
  });

  const fb = q.querySelector('.feedback');
  if(correct){
    el.classList.add('correct');
    scores[quizNum]++;
    if(fb) fb.innerHTML = '<span style="color:#28a745;font-weight:600;">\u2714 ' + explanation + '</span>';
  } else {
    el.classList.add('wrong');
    if(fb) fb.innerHTML = '<span style="color:#dc3545;font-weight:600;">\u2718 ' + explanation + '</span>';
  }

  // Count answered
  const allQ = document.querySelectorAll('#quiz' + quizNum + ' .quiz-question');
  let answeredCount = 0;
  allQ.forEach(qq => { if(qq.classList.contains('answered')) answeredCount++; });

  document.getElementById('score' + quizNum).textContent = scores[quizNum];
  const pct = Math.round(scores[quizNum] / totals[quizNum] * 100);
  const bar = document.getElementById('progress' + quizNum);
  if(bar){ bar.style.width = pct + '%'; bar.textContent = pct + '%'; }

  saveProgress();

  // Check completion
  if(answeredCount >= totals[quizNum]){
    checkQuizCompletion(quizNum);
  }
}

function checkQuizCompletion(quizNum){
  const threshold = Math.ceil(totals[quizNum] * 0.7);
  const passed = scores[quizNum] >= threshold;
  const msgEl = document.getElementById('quiz' + quizNum + 'UnlockMsg');
  if(!msgEl) return;
  msgEl.style.display = 'block';

  if(passed){
    msgEl.style.background = 'rgba(3,239,98,0.15)';
    msgEl.style.border = '2px solid var(--dc-green)';
    msgEl.innerHTML = '<span style="color:var(--dc-green);font-size:1.2em;font-weight:700;">\uD83C\uDF89 Excelente! ' + scores[quizNum] + '/' + totals[quizNum] + ' correctas. Siguiente seccion desbloqueada!</span>';
    completed['quiz' + quizNum] = true;
    unlockNext('quiz' + quizNum);
    updateGlobalProgress();
  } else {
    msgEl.style.background = 'rgba(255,107,107,0.15)';
    msgEl.style.border = '2px solid #ff6b6b';
    msgEl.innerHTML = '<span style="color:#ff6b6b;font-size:1.1em;font-weight:700;">' + scores[quizNum] + '/' + totals[quizNum] + ' correctas. Necesitas al menos ' + threshold + '. Reinicia el quiz para intentar de nuevo.</span>';
  }
}

function resetQuiz(quizNum){
  scores[quizNum] = 0;
  answered[quizNum] = {};
  document.getElementById('score' + quizNum).textContent = '0';
  const bar = document.getElementById('progress' + quizNum);
  if(bar){ bar.style.width = '0%'; bar.textContent = '0%'; }

  const sec = document.getElementById('quiz' + quizNum);
  sec.querySelectorAll('.quiz-question').forEach(q => {
    q.classList.remove('answered');
    q.querySelectorAll('.option').forEach(o => {
      o.classList.remove('correct','wrong');
      o.style.pointerEvents = '';
      o.style.opacity = '';
    });
    const fb = q.querySelector('.feedback');
    if(fb) fb.innerHTML = '';
  });

  const msgEl = document.getElementById('quiz' + quizNum + 'UnlockMsg');
  if(msgEl) msgEl.style.display = 'none';

  saveProgress();
}

/* ---------- FINAL SCORES ---------- */
function updateFinalScores(){
  const fs1 = document.getElementById('finalScore1');
  const fs2 = document.getElementById('finalScore2');
  if(fs1) fs1.textContent = scores[1] + '/' + totals[1];
  if(fs2) fs2.textContent = scores[2] + '/' + totals[2];
}

/* ================================================================
   CANVAS DRAWINGS
   ================================================================ */

/* ---------- BFS vs DFS Diagram ---------- */
function drawBFSDFS(){
  const c = document.getElementById('canvasBFSDFS');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  // Nodes positions
  const nodes = [
    { x: 175, y: 175, label: 'A', color: '#03EF62' },
    { x: 100, y: 80,  label: 'B', color: '#4ea8de' },
    { x: 250, y: 80,  label: 'C', color: '#4ea8de' },
    { x: 50,  y: 175, label: 'D', color: '#4ea8de' },
    { x: 100, y: 270, label: 'E', color: '#4ea8de' },
    { x: 250, y: 270, label: 'F', color: '#4ea8de' },
    { x: 300, y: 175, label: 'G', color: '#4ea8de' },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,3],[2,6],[4,5]];

  // Draw edges
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  edges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.stroke();
  });

  // BFS arrows (left side)
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 3;
  const bfsEdges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]];
  bfsEdges.forEach(([a,b]) => {
    drawArrow(ctx, nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, '#03EF62');
  });

  // DFS arrows (right side)
  const dfsNodes = [
    { x: 525, y: 175, label: 'A', color: '#ff6b6b' },
    { x: 450, y: 80,  label: 'B', color: '#4ea8de' },
    { x: 600, y: 80,  label: 'C', color: '#4ea8de' },
    { x: 400, y: 175, label: 'D', color: '#4ea8de' },
    { x: 450, y: 270, label: 'E', color: '#4ea8de' },
    { x: 600, y: 270, label: 'F', color: '#4ea8de' },
    { x: 650, y: 175, label: 'G', color: '#4ea8de' },
  ];
  const dfsEdgesAll = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,3],[2,6],[4,5]];

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  dfsEdgesAll.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(dfsNodes[a].x, dfsNodes[a].y);
    ctx.lineTo(dfsNodes[b].x, dfsNodes[b].y);
    ctx.stroke();
  });

  // DFS path
  const dfsPath = [[0,1],[1,3],[3,0],[0,4],[4,5],[5,0],[0,2],[2,6]];
  dfsPath.forEach(([a,b]) => {
    drawArrow(ctx, dfsNodes[a].x, dfsNodes[a].y, dfsNodes[b].x, dfsNodes[b].y, '#ffc107');
  });

  // Draw nodes
  [...nodes, ...dfsNodes].forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  });

  // Labels
  ctx.fillStyle = '#03EF62';
  ctx.font = 'bold 16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('BFS (q > 1)', 175, 320);
  ctx.fillStyle = '#ffc107';
  ctx.fillText('DFS (q < 1)', 525, 320);
}

function drawArrow(ctx, x1, y1, x2, y2, color){
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const ux = dx/len, uy = dy/len;
  const sx = x1 + ux*24, sy = y1 + uy*24;
  const ex = x2 - ux*24, ey = y2 - uy*24;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const headLen = 10;
  const angle = Math.atan2(ey - sy, ex - sx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen*Math.cos(angle-0.5), ey - headLen*Math.sin(angle-0.5));
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen*Math.cos(angle+0.5), ey - headLen*Math.sin(angle+0.5));
  ctx.stroke();
}

/* (Old drawN2VGraph / animateRandomWalk removed — replaced by animateN2VPipeline) */

/* ---------- GNN Message Passing Animation ---------- */
let gnnNodes = [];
let gnnEdges = [];

function drawGNNGraph(){
  const c = document.getElementById('canvasGNNMP');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  gnnNodes = [
    { x: 350, y: 200, label: 'v', color: '#03EF62', emb: '[0.2, 0.8, ...]' },
    { x: 200, y: 100, label: 'u1', color: '#4ea8de', emb: '[0.5, 0.1, ...]' },
    { x: 500, y: 100, label: 'u2', color: '#4ea8de', emb: '[0.3, 0.9, ...]' },
    { x: 200, y: 300, label: 'u3', color: '#4ea8de', emb: '[0.7, 0.4, ...]' },
    { x: 500, y: 300, label: 'u4', color: '#4ea8de', emb: '[0.1, 0.6, ...]' },
  ];
  gnnEdges = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4]];

  // Edges
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  gnnEdges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(gnnNodes[a].x, gnnNodes[a].y);
    ctx.lineTo(gnnNodes[b].x, gnnNodes[b].y);
    ctx.stroke();
  });

  // Nodes
  gnnNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 28, 0, Math.PI*2);
    ctx.fillStyle = n.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText(n.emb, n.x, n.y + 42);
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Nodo central v recibe mensajes de u1, u2, u3, u4', 350, 380);
}

function animateGNNMessagePassing(){
  drawGNNGraph();
  const c = document.getElementById('canvasGNNMP');
  if(!c) return;
  const ctx = c.getContext('2d');

  const neighbors = [1, 2, 3, 4];
  let step = 0;

  function sendMessage(){
    if(step >= neighbors.length){
      // Final: update central node
      setTimeout(() => {
        ctx.beginPath();
        ctx.arc(gnnNodes[0].x, gnnNodes[0].y, 32, 0, Math.PI*2);
        ctx.fillStyle = '#ffc107';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('v\'', gnnNodes[0].x, gnnNodes[0].y);
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Embedding actualizado!', 350, 380);
      }, 400);
      return;
    }

    const ni = neighbors[step];
    const n = gnnNodes[ni];

    // Animate message (growing circle from neighbor to center)
    let progress = 0;
    function moveMsg(){
      if(progress >= 1){
        step++;
        setTimeout(sendMessage, 300);
        return;
      }
      const mx = n.x + (gnnNodes[0].x - n.x) * progress;
      const my = n.y + (gnnNodes[0].y - n.y) * progress;

      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI*2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI*2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      progress += 0.08;
      requestAnimationFrame(moveMsg);
    }
    moveMsg();
  }

  setTimeout(sendMessage, 300);
}

/* ================================================================
   N2V PIPELINE ANIMATION — Full embedding creation demo (rewritten)
   ================================================================ */
function drawN2VPipelineBase(){
  const c = document.getElementById('canvasN2VPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Asi crea Node2Vec un embedding, paso a paso:', W/2, 24);

  // Draw the graph (always visible on the left)
  _drawPipelineGraph(ctx);

  // Phase indicator area (right side)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(210, 42, W - 220, H - 55);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(210, 42, W - 220, H - 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Pulsa "Iniciar Animacion"', 480, 230);
  ctx.fillText('para ver las 4 fases', 480, 255);

  // Bottom: phase indicators
  const phLabels = ['1. Grafo','2. Turista pasea','3. Red aprende','4. Embedding!'];
  const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
  phLabels.forEach((l,i) => {
    const px = 120 + i * 170;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px - 60, H - 30, 120, 22);
    ctx.fillStyle = phColors[i];
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(l, px, H - 14);
  });
}

// Shared graph drawing helper
const _pipeNodes = [
  { x: 95, y: 130, label: 'A', col: '#ff6b6b' },
  { x: 45, y: 210, label: 'B', col: '#ff6b6b' },
  { x: 145,y: 210, label: 'C', col: '#4ea8de' },
  { x: 25, y: 300, label: 'D', col: '#4ea8de' },
  { x: 95, y: 350, label: 'E', col: '#4ea8de' },
  { x: 165,y: 300, label: 'F', col: '#03EF62' },
];
const _pipeEdges = [[0,1],[0,2],[1,2],[1,3],[1,4],[2,5],[3,4],[4,5]];
const _pipeAdj = {0:[1,2], 1:[0,2,3,4], 2:[0,1,5], 3:[1,4], 4:[1,3,5], 5:[2,4]};
const _pipeLabels = ['A','B','C','D','E','F'];

function _drawPipelineGraph(ctx, highlightEdges, walkerAt){
  // Edges
  _pipeEdges.forEach(([a,b]) => {
    const isHL = highlightEdges && highlightEdges.some(e => (e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
    ctx.strokeStyle = isHL ? '#ffc107' : '#475569';
    ctx.lineWidth = isHL ? 3 : 1.5;
    ctx.globalAlpha = isHL ? 0.9 : 0.5;
    ctx.beginPath();
    ctx.moveTo(_pipeNodes[a].x, _pipeNodes[a].y);
    ctx.lineTo(_pipeNodes[b].x, _pipeNodes[b].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  // Nodes
  _pipeNodes.forEach((n, i) => {
    const isWalker = (walkerAt === i);
    ctx.beginPath();
    ctx.arc(n.x, n.y, isWalker ? 22 : 18, 0, Math.PI*2);
    ctx.fillStyle = isWalker ? '#ffc107' : n.col;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isWalker ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = isWalker ? 'bold 16px Inter' : 'bold 13px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isWalker ? '\uD83D\uDEB6' : n.label, n.x, n.y);
  });
  // Graph label
  ctx.fillStyle = '#4ea8de';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Grafo: 6 libros', 95, 80);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter';
  ctx.fillText('aristas = co-compras', 95, 395);
  // Legend
  ctx.font = '9px Inter';
  [[_pipeNodes[0].col,'Izquierda'],[_pipeNodes[2].col,'Derecha'],[_pipeNodes[5].col,'Neutral']].forEach(([c,l],i)=>{
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(20, 420 + i*16, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(l, 30, 424 + i*16);
  });
}

function animateN2VPipeline(){
  const c = document.getElementById('canvasN2VPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  // Panel area
  const PX = 215, PY = 45, PW = W - 225, PH = H - 60;

  function clearPanel(){
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, W, H);
    // Phase bar at bottom (always visible)
    const phLabels = ['1. Grafo','2. Turista pasea','3. Red aprende','4. Embedding!'];
    const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
    phLabels.forEach((l,i) => {
      const px = 120 + i * 170;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 60, H - 30, 120, 22);
      ctx.fillStyle = phColors[i];
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(l, px, H - 14);
    });
  }

  function highlightPhase(idx){
    const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
    const px = 120 + idx * 170;
    ctx.strokeStyle = phColors[idx];
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 62, H - 32, 124, 26);
  }

  // ========== PHASE 1: Show the graph ==========
  function phase1(){
    clearPanel();
    _drawPipelineGraph(ctx);
    highlightPhase(0);

    // Explanation panel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);

    ctx.fillStyle = '#4ea8de';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 1: Tenemos un grafo', PX + PW/2, PY + 35);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter';
    const lines1 = [
      'Este grafo tiene 6 libros (nodos)',
      'conectados por co-compras (aristas).',
      '',
      'Cada libro tiene un color que indica',
      'su orientacion politica, pero N2V',
      'NO VE los colores. Solo ve las',
      'conexiones (quien compra con quien).',
      '',
      'Objetivo: convertir cada nodo en',
      'una lista de numeros (embedding)',
      'que capture su "posicion" en la red.',
    ];
    lines1.forEach((l,i) => {
      ctx.fillStyle = l.startsWith('NO VE') || l === '' ? '#ffc107' : '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.fillText(l, PX + 20, PY + 70 + i * 22);
    });

    // Arrow to phase 2
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('\u25B6 Siguiente: mandamos un turista a pasear...', PX + PW/2, PY + PH - 20);

    setTimeout(phase2, 3500);
  }

  // ========== PHASE 2: Random walks with turista ==========
  function phase2(){
    // Generate 3 walks
    const walks = [];
    for(let w = 0; w < 3; w++){
      const walk = [0]; let cur = 0;
      for(let s = 0; s < 5; s++){
        const nb = _pipeAdj[cur];
        cur = nb[Math.floor(Math.random() * nb.length)];
        walk.push(cur);
      }
      walks.push(walk);
    }

    let walkIdx = 0;

    function animateOneWalk(){
      if(walkIdx >= walks.length){
        // Show summary after all walks
        setTimeout(showWalkSummary, 600);
        return;
      }

      const walk = walks[walkIdx];
      let stepIdx = 0;
      const visitedEdges = [];

      function stepWalk(){
        clearPanel();
        highlightPhase(1);

        // Draw graph with highlighted edges and walker
        const currentNode = walk[stepIdx];
        _drawPipelineGraph(ctx, visitedEdges, currentNode);

        // Right panel
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(PX, PY, PW, PH);

        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Fase 2: El turista pasea (Walk ' + (walkIdx+1) + '/3)', PX + PW/2, PY + 35);

        // Explain what's happening
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '13px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('El turista sale de un nodo y en cada', PX + 20, PY + 65);
        ctx.fillText('esquina elige una arista al azar.', PX + 20, PY + 85);

        // Show walk path built so far
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Ruta hasta ahora:', PX + 20, PY + 125);

        const pathSoFar = walk.slice(0, stepIdx + 1).map(i => _pipeLabels[i]);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(pathSoFar.join('  \u2192  '), PX + 20, PY + 155);

        // Show "sentence" analogy
        ctx.fillStyle = '#7c3aed';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Esto es como una "oracion" para Word2Vec:', PX + 20, PY + 195);
        ctx.fillStyle = '#ce9178';
        ctx.font = '14px monospace';
        ctx.fillText('"' + pathSoFar.join(' ') + '"', PX + 20, PY + 218);

        // Show all completed walks
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        for(let w = 0; w < walkIdx; w++){
          const prevStr = walks[w].map(i => _pipeLabels[i]).join(' \u2192 ');
          ctx.fillText('Walk ' + (w+1) + ': ' + prevStr + '  \u2713', PX + 20, PY + 260 + w * 22);
        }

        // Current step info
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        const nodeName = _pipeLabels[currentNode];
        if(stepIdx === 0){
          ctx.fillText('\uD83D\uDEB6 Turista sale desde el nodo ' + nodeName, PX + 20, PY + PH - 50);
        } else {
          const prevName = _pipeLabels[walk[stepIdx-1]];
          ctx.fillText('\uD83D\uDEB6 De ' + prevName + ' elige al azar \u2192 ' + nodeName + ' (paso ' + stepIdx + ')', PX + 20, PY + PH - 50);
        }

        // Continue walk
        if(stepIdx < walk.length - 1){
          visitedEdges.push([walk[stepIdx], walk[stepIdx+1]]);
          stepIdx++;
          setTimeout(stepWalk, 900);
        } else {
          // Walk complete
          ctx.fillStyle = '#03EF62';
          ctx.font = 'bold 12px Inter';
          ctx.fillText('\u2713 Walk ' + (walkIdx+1) + ' completa!', PX + 20, PY + PH - 25);
          walkIdx++;
          setTimeout(animateOneWalk, 1200);
        }
      }
      stepWalk();
    }

    function showWalkSummary(){
      clearPanel();
      _drawPipelineGraph(ctx);
      highlightPhase(1);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(PX, PY, PW, PH);

      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Fase 2: Resultado de los paseos', PX + PW/2, PY + 35);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px Inter';
      ctx.textAlign = 'left';

      // Show all walks
      walks.forEach((walk, w) => {
        const y = PY + 75 + w * 50;
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Walk ' + (w+1) + ':', PX + 20, y);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '15px monospace';
        ctx.fillText(walk.map(i => _pipeLabels[i]).join('  \u2192  '), PX + 80, y);
        // As sentence
        ctx.fillStyle = '#ce9178';
        ctx.font = '12px monospace';
        ctx.fillText('"' + walk.map(i => _pipeLabels[i]).join(' ') + '"', PX + 80, y + 20);
      });

      // Key insight
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('\u2714 Nodos que aparecen juntos frecuentemente', PX + 20, PY + 260);
      ctx.fillText('   en las "oraciones" son similares.', PX + 20, PY + 280);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.fillText('En realidad se hacen 200+ walks x cada nodo', PX + 20, PY + 310);
      ctx.fillText('Aqui solo mostramos 3 para entender la idea.', PX + 20, PY + 330);

      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('\u25B6 Siguiente: estas "oraciones" entrenan una red...', PX + PW/2, PY + PH - 20);

      setTimeout(phase3, 4000);
    }

    animateOneWalk();
  }

  // ========== PHASE 3: How walks become numbers (3 sub-steps) ==========
  function phase3(){
    // Use the first walk's data for the demo
    phase3a();
  }

  // --- 3a: Walks → Training pairs ---
  function phase3a(){
    clearPanel();
    _drawPipelineGraph(ctx);
    highlightPhase(2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);

    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3a: De paseos a "parejas de entrenamiento"', PX + PW/2, PY + 30);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    const tx = PX + 15;
    ctx.fillText('Tomemos una walk:  A \u2192 B \u2192 D \u2192 E \u2192 F', tx, PY + 58);

    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('Con ventana = 2, creamos parejas (input, contexto):', tx, PY + 85);

    // Show pairs appearing one by one
    const pairs = [
      { input: 'A', ctx: 'B', note: 'A aparece cerca de B' },
      { input: 'A', ctx: 'D', note: 'A aparece cerca de D' },
      { input: 'B', ctx: 'A', note: 'B aparece cerca de A' },
      { input: 'B', ctx: 'D', note: 'B aparece cerca de D' },
      { input: 'B', ctx: 'E', note: 'B aparece cerca de E' },
      { input: 'D', ctx: 'B', note: 'D aparece cerca de B' },
      { input: 'D', ctx: 'E', note: 'D aparece cerca de E' },
      { input: 'D', ctx: 'F', note: 'D aparece cerca de F' },
    ];

    let pIdx = 0;
    function showNextPair(){
      if(pIdx >= pairs.length){
        // Final explanation
        ctx.fillStyle = '#03EF62';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('\u2714 Le diremos a la red:', tx, PY + 370);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Inter';
        ctx.fillText('   "Si te doy A, deberias predecir B y D"', tx, PY + 390);
        ctx.fillText('   "Si te doy B, deberias predecir A, D y E"', tx, PY + 408);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter';
        ctx.fillText('Nodos que caminan juntos = deben tener numeros parecidos', tx, PY + 435);

        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('\u25B6 Siguiente: como calcula la red esos numeros...', PX + PW/2, PY + PH - 15);
        setTimeout(phase3b, 4500);
        return;
      }
      const p = pairs[pIdx];
      const y = PY + 110 + pIdx * 30;

      // Pair box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tx, y - 12, PW - 30, 26);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tx, y - 12, PW - 30, 26);

      // Input node circle
      ctx.beginPath(); ctx.arc(tx + 20, y, 9, 0, Math.PI*2);
      const inputCol = _pipeNodes[_pipeLabels.indexOf(p.input)].col;
      ctx.fillStyle = inputCol; ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.input, tx + 20, y + 1);

      // Arrow
      ctx.fillStyle = '#e2e8f0'; ctx.font = '13px Inter'; ctx.textAlign = 'left';
      ctx.fillText('\u2192', tx + 38, y + 4);

      // Context node circle
      ctx.beginPath(); ctx.arc(tx + 68, y, 9, 0, Math.PI*2);
      const ctxCol = _pipeNodes[_pipeLabels.indexOf(p.ctx)].col;
      ctx.fillStyle = ctxCol; ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.ctx, tx + 68, y + 1);

      // Note
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
      ctx.fillText(p.note, tx + 95, y + 4);

      pIdx++;
      setTimeout(showNextPair, 450);
    }
    showNextPair();
  }

  // --- 3b: One-hot × Weight table = Embedding ---
  function phase3b(){
    clearPanel();
    _drawPipelineGraph(ctx);
    highlightPhase(2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);

    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3b: La "tabla de pesos" (el truco clave)', PX + PW/2, PY + 30);

    const tx = PX + 15;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('La red tiene una tabla secreta con 3 numeros por nodo:', tx, PY + 58);

    // Draw the weight table
    const tableX = tx + 10, tableY = PY + 75;
    const rowH = 28, colW = 75;
    const headers = ['Nodo', 'Peso 1', 'Peso 2', 'Peso 3'];
    const initWeights = [
      ['A', '0.12', '-0.45', '0.67'],
      ['B', '0.34', '0.22', '-0.18'],
      ['C', '-0.56', '0.89', '0.11'],
      ['D', '0.78', '-0.33', '0.44'],
      ['E', '-0.21', '0.55', '-0.72'],
      ['F', '0.09', '0.41', '0.36'],
    ];

    // Header
    headers.forEach((h, i) => {
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(tableX + i * colW, tableY, colW - 2, rowH);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(h, tableX + i * colW + colW/2, tableY + 18);
    });

    // Rows appearing one by one
    let rIdx = 0;
    function showNextRow(){
      if(rIdx >= initWeights.length){
        setTimeout(showLookupDemo, 800);
        return;
      }
      const row = initWeights[rIdx];
      const y = tableY + rowH + rIdx * rowH;
      ctx.fillStyle = rIdx % 2 === 0 ? '#0f172a' : '#1a2332';
      ctx.fillRect(tableX, y, colW * 4 - 2, rowH);
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5;
      ctx.strokeRect(tableX, y, colW * 4 - 2, rowH);

      // Node with color dot
      const nodeCol = _pipeNodes[rIdx].col;
      ctx.beginPath(); ctx.arc(tableX + colW/2 - 10, y + 14, 7, 0, Math.PI*2);
      ctx.fillStyle = nodeCol; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(row[0], tableX + colW/2 - 10, y + 15);

      // Weights
      for(let c = 1; c < 4; c++){
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(row[c], tableX + c * colW + colW/2, y + 18);
      }
      rIdx++;
      setTimeout(showNextRow, 250);
    }

    function showLookupDemo(){
      const demoY = tableY + rowH * 8 + 10;

      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('\u2B50 Como obtiene el embedding de A:', tx, demoY);

      // Show one-hot
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Inter';
      ctx.fillText('Paso 1: "A" se convierte en one-hot:', tx + 10, demoY + 25);
      ctx.fillStyle = '#4ea8de';
      ctx.font = '14px monospace';
      ctx.fillText('A = [1, 0, 0, 0, 0, 0]', tx + 10, demoY + 48);

      // Arrow
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Inter';
      ctx.fillText('Paso 2: Multiplica [1,0,0,0,0,0] \u00D7 Tabla =', tx + 10, demoY + 75);
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 12px Inter';
      ctx.fillText('         \u2193 Solo selecciona la fila de A!', tx + 10, demoY + 95);

      // Result
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('Embedding(A) = [0.12, -0.45, 0.67]', tx + 10, demoY + 122);

      // Highlight row A in the table
      ctx.strokeStyle = '#ffc107';
      ctx.lineWidth = 3;
      ctx.strokeRect(tableX, tableY + rowH, colW * 4 - 2, rowH);

      // Arrow from table to result
      ctx.strokeStyle = '#ffc107';
      ctx.lineWidth = 2;
      ctx.setLineDash([4,3]);
      ctx.beginPath();
      ctx.moveTo(tableX + colW * 4, tableY + rowH + rowH/2);
      ctx.lineTo(tableX + colW * 4 + 15, tableY + rowH + rowH/2);
      ctx.lineTo(tableX + colW * 4 + 15, demoY + 115);
      ctx.lineTo(tableX + colW * 4 - 5, demoY + 115);
      ctx.stroke();
      ctx.setLineDash([]);

      // Key insight
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('El embedding es literalmente la fila de esa tabla!', tx + 10, demoY + 148);
      ctx.fillText('El truco: la red AJUSTA estos pesos durante el entrenamiento.', tx + 10, demoY + 166);

      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('\u25B6 Siguiente: como ajusta la tabla...', PX + PW/2, PY + PH - 15);
      setTimeout(phase3c, 5500);
    }

    showNextRow();
  }

  // --- 3c: Training loop - adjusting the table ---
  function phase3c(){
    clearPanel();
    _drawPipelineGraph(ctx);
    highlightPhase(2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);

    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3c: La red ajusta la tabla (entrenamiento)', PX + PW/2, PY + 30);

    const tx = PX + 15;

    // Training step visualization
    const steps = [
      {
        title: 'Epoca 1: Pesos iniciales (aleatorios)',
        table: [
          ['A', ' 0.12', '-0.45', ' 0.67'],
          ['B', ' 0.34', ' 0.22', '-0.18'],
        ],
        task: 'Input: A  \u2192  Predice vecino: ???',
        pred: 'Prediccion: F (\u274C mal! deberia ser B)',
        action: 'Ajusta pesos de A y B para acercarlos',
        color: '#ff6b6b',
      },
      {
        title: 'Epoca 50: Pesos mejorando...',
        table: [
          ['A', ' 0.45', '-0.12', ' 0.55'],
          ['B', ' 0.48', '-0.08', ' 0.49'],
        ],
        task: 'Input: A  \u2192  Predice vecino: ???',
        pred: 'Prediccion: C (casi... pero no)',
        action: 'A y B se van pareciendo!  \u2193 0.45\u22480.48',
        color: '#ffc107',
      },
      {
        title: 'Epoca 200: Pesos convergidos!',
        table: [
          ['A', ' 0.82', '-0.31', ' 0.45'],
          ['B', ' 0.79', '-0.28', ' 0.51'],
        ],
        task: 'Input: A  \u2192  Predice vecino: ???',
        pred: 'Prediccion: B (\u2714 correcto!)',
        action: 'A\u22480.82  B\u22480.79  Son casi iguales!',
        color: '#03EF62',
      },
    ];

    let sIdx = 0;
    function showTrainingStep(){
      if(sIdx >= steps.length){
        showTrainingSummary();
        return;
      }
      const s = steps[sIdx];
      const baseY = PY + 55 + sIdx * 145;

      // Step box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tx, baseY, PW - 30, 130);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(tx, baseY, PW - 30, 130);

      // Title
      ctx.fillStyle = s.color;
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(s.title, tx + 10, baseY + 18);

      // Mini table
      ctx.fillStyle = '#7c3aed';
      ctx.font = '10px Inter';
      ctx.fillText('Nodo   Peso1   Peso2   Peso3', tx + 10, baseY + 38);
      s.table.forEach((row, ri) => {
        const nodeIdx = _pipeLabels.indexOf(row[0]);
        const nc = _pipeNodes[nodeIdx].col;
        // Node dot
        ctx.beginPath(); ctx.arc(tx + 18, baseY + 55 + ri * 18, 6, 0, Math.PI*2);
        ctx.fillStyle = nc; ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = 'bold 8px Inter'; ctx.textAlign = 'center';
        ctx.fillText(row[0], tx + 18, baseY + 56 + ri * 18);
        // Weights
        ctx.fillStyle = '#e2e8f0'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
        ctx.fillText(row[1] + '   ' + row[2] + '   ' + row[3], tx + 55, baseY + 58 + ri * 18);
      });

      // Task and prediction
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
      ctx.fillText(s.task, tx + 200, baseY + 42);
      ctx.fillStyle = s.color; ctx.font = 'bold 11px Inter';
      ctx.fillText(s.pred, tx + 200, baseY + 62);

      // Action
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px Inter';
      ctx.fillText(s.action, tx + 200, baseY + 85);

      // Similarity bar
      const simBar = [0.15, 0.65, 0.95][sIdx];
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx + 200, baseY + 96, 200, 14);
      ctx.fillStyle = s.color;
      ctx.fillRect(tx + 200, baseY + 96, 200 * simBar, 14);
      ctx.fillStyle = '#fff'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
      ctx.fillText('Similitud A\u2194B: ' + Math.round(simBar * 100) + '%', tx + 205, baseY + 107);

      sIdx++;
      setTimeout(showTrainingStep, 2500);
    }

    function showTrainingSummary(){
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('\u2714 Los pesos de la tabla SON los embeddings finales!', PX + PW/2, PY + PH - 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter';
      ctx.fillText('A y B caminan juntos \u2192 sus filas se vuelven parecidas', PX + PW/2, PY + PH - 18);

      setTimeout(phase4, 4000);
    }

    showTrainingStep();
  }

  // ========== PHASE 4: Final embeddings ==========
  function phase4(){
    clearPanel();
    _drawPipelineGraph(ctx);
    highlightPhase(3);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);

    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 4: Los embeddings finales!', PX + PW/2, PY + 35);

    // Embeddings data — nodes with similar neighbors get similar values
    const embData = [
      { label: 'A', col: '#ff6b6b', vals: [ 0.82, -0.31,  0.45] },
      { label: 'B', col: '#ff6b6b', vals: [ 0.79, -0.28,  0.51] },
      { label: 'C', col: '#4ea8de', vals: [-0.15,  0.73,  0.22] },
      { label: 'D', col: '#4ea8de', vals: [-0.22,  0.69,  0.18] },
      { label: 'E', col: '#4ea8de', vals: [-0.18,  0.65,  0.30] },
      { label: 'F', col: '#03EF62', vals: [ 0.10,  0.25, -0.80] },
    ];

    let eIdx = 0;
    function showNextEmb(){
      if(eIdx >= embData.length){ setTimeout(showScatterAndConclusion, 600); return; }
      const e = embData[eIdx];
      const y = PY + 75 + eIdx * 30;

      // Node circle
      ctx.beginPath();
      ctx.arc(PX + 30, y - 3, 10, 0, Math.PI*2);
      ctx.fillStyle = e.col;
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.label, PX + 30, y - 3);

      // Arrow
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('\u2192', PX + 48, y);

      // Vector
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px monospace';
      ctx.fillText('[' + e.vals.map(v => (v >= 0 ? ' ' : '') + v.toFixed(2)).join(', ') + ']', PX + 68, y);

      eIdx++;
      setTimeout(showNextEmb, 350);
    }

    function showScatterAndConclusion(){
      // Mini scatter plot
      const sx = PX + 30, sy = PY + 290;
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('Visualizado en 2D:', sx, sy);

      // Axes
      const ox = sx + 40, oy = sy + 80;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox, oy + 50); ctx.lineTo(ox, oy - 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox - 10, oy + 30); ctx.lineTo(ox + 150, oy + 30); ctx.stroke();

      // Plot points
      embData.forEach(e => {
        const px = ox + 30 + (e.vals[0] + 0.5) * 80;
        const py = oy + 10 - (e.vals[1] + 0.5) * 70;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI*2);
        ctx.fillStyle = e.col;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.label, px, py);
      });

      // Circle around clusters
      ctx.setLineDash([5,4]);
      ctx.lineWidth = 1.5;
      // Red cluster (A, B)
      ctx.strokeStyle = '#ff6b6b';
      ctx.beginPath(); ctx.ellipse(ox + 30 + (0.82 + 0.5) * 80 - 5, oy + 10 - (-0.3 + 0.5) * 70, 30, 22, 0, 0, Math.PI*2); ctx.stroke();
      // Blue cluster (C, D, E)
      ctx.strokeStyle = '#4ea8de';
      ctx.beginPath(); ctx.ellipse(ox + 30 + (-0.18 + 0.5) * 80, oy + 10 - (0.69 + 0.5) * 70 + 8, 35, 28, 0, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);

      // Conclusion text on the right
      const tx = PX + 260, ty = sy + 10;
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('\u2714 Resultado:', tx, ty);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Inter';
      ctx.fillText('A y B quedan juntos', tx, ty + 22);
      ctx.fillText('  (misma zona del grafo)', tx, ty + 39);
      ctx.fillText('C, D, E quedan juntos', tx, ty + 62);
      ctx.fillText('  (otro cluster)', tx, ty + 79);
      ctx.fillText('F queda aparte', tx, ty + 102);
      ctx.fillText('  (nodo puente/neutral)', tx, ty + 119);

      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 12px Inter';
      ctx.fillText('N2V descubrio los grupos', tx, ty + 150);
      ctx.fillText('SIN ver los colores!', tx, ty + 167);
    }

    setTimeout(showNextEmb, 500);
  }

  // Kick off!
  phase1();
}

/* ================================================================
   GNN PIPELINE ANIMATION — Message passing embedding demo
   ================================================================ */
function drawGNNPipelineBase(){
  const c = document.getElementById('canvasGNNPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  // Phase labels
  const phases = [
    { x: 95,  label: '1. Grafo + Features', color: '#4ea8de' },
    { x: 300, label: '2. Capa 1: Mensajes', color: '#ffc107' },
    { x: 510, label: '3. Capa 2: Mas Mensajes', color: '#7c3aed' },
    { x: 690, label: '4. Embedding', color: '#03EF62' },
  ];
  phases.forEach((p, i) => {
    ctx.fillStyle = p.color;
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, p.x, 22);
    if(i < phases.length - 1){
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(p.x + 100, 30);
      ctx.lineTo(p.x + 100, H - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Phase 1: graph with feature vectors
  const gNodes = [
    { x: 95, y: 200, label: 'v',  col: '#03EF62', feat: '[0.2, 0.8]' },
    { x: 40, y: 120, label: 'u1', col: '#4ea8de', feat: '[0.5, 0.1]' },
    { x: 150, y: 120, label: 'u2', col: '#4ea8de', feat: '[0.3, 0.9]' },
    { x: 40, y: 300, label: 'u3', col: '#ff6b6b', feat: '[0.7, 0.4]' },
    { x: 150, y: 300, label: 'u4', col: '#ff6b6b', feat: '[0.1, 0.6]' },
  ];
  const gEdges = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4]];

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  gEdges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(gNodes[a].x, gNodes[a].y);
    ctx.lineTo(gNodes[b].x, gNodes[b].y);
    ctx.stroke();
  });
  gNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 18, 0, Math.PI*2);
    ctx.fillStyle = n.col;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
    // Feature
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(n.feat, n.x, n.y + 28);
  });

  // Placeholder boxes for phases 2-4
  [[200, '2. Mensajes viajaran', 'de vecinos a v...'], [400, '3. Segunda ronda de', 'chisme...'], [610, 'Embedding final', 'aparecera aqui...']].forEach(([xStart, t1, t2]) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(t1, xStart + 80, 210);
    ctx.fillText(t2, xStart + 80, 228);
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Pulsa "Iniciar Animacion" para ver message passing en accion', W/2, H - 15);
}

function animateGNNPipeline(){
  const c = document.getElementById('canvasGNNPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  drawGNNPipelineBase();

  // ---- PHASE 2: Layer 1 message passing ----
  function phase2(){
    // Clear phase 2 area
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(196, 40, 198, H - 55);

    const centerX = 300, centerY = 200;
    // Draw central node v
    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, Math.PI*2);
    ctx.fillStyle = '#03EF62';
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = 'bold 14px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('v', centerX, centerY);

    // Neighbors sending messages
    const senders = [
      { label: 'u1', col: '#4ea8de', angle: -2.3, msg: '[0.5, 0.1]' },
      { label: 'u2', col: '#4ea8de', angle: -0.8, msg: '[0.3, 0.9]' },
      { label: 'u3', col: '#ff6b6b', angle: 2.3,  msg: '[0.7, 0.4]' },
      { label: 'u4', col: '#ff6b6b', angle: 0.8,  msg: '[0.1, 0.6]' },
    ];
    const radius = 85;

    // Draw neighbor positions
    senders.forEach(s => {
      const sx = centerX + Math.cos(s.angle) * radius;
      const sy = centerY + Math.sin(s.angle) * radius;
      s.sx = sx; s.sy = sy;
      ctx.beginPath();
      ctx.arc(sx, sy, 16, 0, Math.PI*2);
      ctx.fillStyle = s.col;
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.label, sx, sy);
    });

    // Animate messages flying to center
    let msgIdx = 0;
    function sendMsg(){
      if(msgIdx >= senders.length){
        setTimeout(showAggregation, 500);
        return;
      }
      const s = senders[msgIdx];
      let progress = 0;
      function fly(){
        if(progress >= 1){ msgIdx++; setTimeout(sendMsg, 200); return; }
        const mx = s.sx + (centerX - s.sx) * progress;
        const my = s.sy + (centerY - s.sy) * progress;

        // Message dot
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI*2);
        ctx.fillStyle = s.col;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Trail
        ctx.strokeStyle = s.col;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.sx, s.sy);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.globalAlpha = 1;

        progress += 0.06;
        requestAnimationFrame(fly);
      }
      fly();
    }

    function showAggregation(){
      // Show aggregation formula
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('AGREGA (promedia):', centerX, 330);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText('h_v = \u03C3(W \u00B7 AVG(msgs) + b)', centerX, 350);

      // Updated v
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 11px Inter';
      ctx.fillText("v' = [0.4, 0.5]", centerX, 375);

      // Glow on center node
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, Math.PI*2);
      ctx.strokeStyle = '#ffc107';
      ctx.lineWidth = 3;
      ctx.setLineDash([4,3]);
      ctx.stroke();
      ctx.setLineDash([]);

      setTimeout(phase3, 1000);
    }

    setTimeout(sendMsg, 400);
  }

  // ---- PHASE 3: Layer 2 — 2-hop info ----
  function phase3(){
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(396, 40, 198, H - 55);

    const centerX = 510, centerY = 200;

    // Now v already has aggregated info. Show 2-hop concept
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Capa 2: "chisme" a 2 hops', centerX, 60);

    // Draw a "tree" showing info propagation
    // Level 0: v
    ctx.beginPath();
    ctx.arc(centerX, 140, 20, 0, Math.PI*2);
    ctx.fillStyle = '#03EF62'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = 'bold 12px Inter'; ctx.textBaseline = 'middle';
    ctx.fillText('v', centerX, 140);

    // Level 1: neighbors (already updated from layer 1)
    const l1 = [
      { x: centerX - 60, y: 220, label: "u1'", col: '#4ea8de' },
      { x: centerX - 20, y: 220, label: "u2'", col: '#4ea8de' },
      { x: centerX + 20, y: 220, label: "u3'", col: '#ff6b6b' },
      { x: centerX + 60, y: 220, label: "u4'", col: '#ff6b6b' },
    ];
    l1.forEach(n => {
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(centerX, 160); ctx.lineTo(n.x, n.y - 14); ctx.stroke();
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14, 0, Math.PI*2);
      ctx.fillStyle = n.col; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y);
    });

    // Level 2: 2-hop neighbors (info that already flowed into u's)
    ctx.fillStyle = '#7c3aed';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText("u1' ya tiene info de", centerX, 265);
    ctx.fillText("SUS vecinos (2-hop de v)", centerX, 280);

    // Animate messages from l1 to center
    let step = 0;
    function sendLayer2(){
      if(step >= l1.length){
        setTimeout(showLayer2Result, 500);
        return;
      }
      const n = l1[step];
      let progress = 0;
      function fly2(){
        if(progress >= 1){ step++; setTimeout(sendLayer2, 150); return; }
        const mx = n.x + (centerX - n.x) * progress;
        const my = n.y + (140 - n.y) * progress;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI*2);
        ctx.fillStyle = '#7c3aed';
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        progress += 0.08;
        requestAnimationFrame(fly2);
      }
      fly2();
    }

    function showLayer2Result(){
      // Glow center
      ctx.beginPath();
      ctx.arc(centerX, 140, 26, 0, Math.PI*2);
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 3;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText("v'' = [0.35, 0.62]", centerX, 320);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter';
      ctx.fillText('v ahora "conoce" a', centerX, 350);
      ctx.fillText('vecinos a 2 saltos', centerX, 366);
      ctx.fillText('sin haber caminado!', centerX, 382);

      setTimeout(phase4, 1000);
    }

    setTimeout(sendLayer2, 400);
  }

  // ---- PHASE 4: Final embedding ----
  function phase4(){
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(610, 40, 140, H - 55);

    const cx = 680;

    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Embedding de v', cx, 65);

    // Show final vector
    const finalVals = [0.35, 0.62, -0.18, 0.44];
    let vIdx = 0;
    function showVal(){
      if(vIdx >= finalVals.length){
        showComparison();
        return;
      }
      const y = 100 + vIdx * 35;

      // Dim box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 55, y - 12, 110, 28);
      ctx.strokeStyle = '#03EF62';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 55, y - 12, 110, 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('dim ' + (vIdx+1) + ':', cx - 48, y + 4);

      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(finalVals[vIdx].toFixed(2), cx + 48, y + 5);

      // Bar visualization
      const barW = Math.abs(finalVals[vIdx]) * 60;
      ctx.fillStyle = finalVals[vIdx] >= 0 ? '#03EF62' : '#ff6b6b';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(cx - 5, y - 6, barW * (finalVals[vIdx] >= 0 ? 1 : -1), 16);
      ctx.globalAlpha = 1;

      vIdx++;
      setTimeout(showVal, 350);
    }

    function showComparison(){
      const y = 280;
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('vs N2V:', cx, y);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Inter';
      ctx.fillText('N2V: camina + Word2Vec', cx, y + 20);
      ctx.fillText('GNN: chisme + agrega', cx, y + 36);

      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('GNN = end-to-end', cx, y + 60);
      ctx.fillText('(embedding se optimiza', cx, y + 75);
      ctx.fillText('para la tarea!)', cx, y + 90);
    }

    setTimeout(showVal, 300);
  }

  // Start
  setTimeout(phase2, 600);
}

/* ---------- Results Bar Chart ---------- */
function drawResultsChart(){
  const c = document.getElementById('canvasResults');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const data = [
    { label: 'RF+GNN', acc: 83.33, f1: 82.01, color: '#4ea8de' },
    { label: 'RF+N2V', acc: 84.52, f1: 80.72, color: '#7c3aed' },
    { label: 'GNN 2L', acc: 82.27, f1: 82.14, color: '#f97316' },
    { label: 'GNN+N2V 2L', acc: 87.79, f1: 88.10, color: '#03EF62' },
    { label: 'GNN 4L', acc: 86.58, f1: 86.90, color: '#ec4899' },
    { label: 'GNN+N2V 4L', acc: 88.99, f1: 89.29, color: '#ffc107' },
  ];

  const barW = 40;
  const gap = 30;
  const startX = 60;
  const baseY = 300;
  const scale = 3.2;

  // Y axis
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX - 10, baseY);
  ctx.lineTo(startX - 10, 20);
  ctx.stroke();

  // Grid lines
  for(let v = 70; v <= 90; v += 5){
    const y = baseY - (v - 70) * scale;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(startX - 10, y);
    ctx.lineTo(c.width - 20, y);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(v + '%', startX - 15, y + 4);
  }

  data.forEach((d, i) => {
    const x = startX + i * (barW*2 + gap);

    // Accuracy bar
    const hAcc = (d.acc - 70) * scale;
    ctx.fillStyle = d.color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x, baseY - hAcc, barW, hAcc);
    ctx.globalAlpha = 1;

    // F1 bar
    const hF1 = (d.f1 - 70) * scale;
    ctx.fillStyle = d.color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + barW + 2, baseY - hF1, barW, hF1);
    ctx.globalAlpha = 1;

    // Values
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.acc.toFixed(1), x + barW/2, baseY - hAcc - 5);
    ctx.fillText(d.f1.toFixed(1), x + barW + 2 + barW/2, baseY - hF1 - 5);

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barW + 1, baseY + 15);
  });

  // Legend
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px Inter';
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(c.width - 160, 20, 14, 14);
  ctx.globalAlpha = 1;
  ctx.fillText('Accuracy', c.width - 140, 32);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(c.width - 160, 40, 14, 14);
  ctx.globalAlpha = 1;
  ctx.fillText('F1 Score', c.width - 140, 52);
}

/* ---------- AML Graph ---------- */
function drawAMLGraph(){
  const c = document.getElementById('canvasAML');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const nodes = [
    { x: 200, y: 100, label: 'Cuenta A', color: '#03EF62', type: 'normal' },
    { x: 400, y: 80,  label: 'Cuenta B', color: '#03EF62', type: 'normal' },
    { x: 100, y: 250, label: 'Mula 1',  color: '#ff6b6b', type: 'mula' },
    { x: 300, y: 200, label: 'Hub',     color: '#ffc107', type: 'hub' },
    { x: 500, y: 250, label: 'Mula 2',  color: '#ff6b6b', type: 'mula' },
    { x: 350, y: 330, label: 'Shell Co', color: '#ff6b6b', type: 'shell' },
    { x: 150, y: 350, label: 'Cuenta C', color: '#03EF62', type: 'normal' },
    { x: 550, y: 350, label: 'Cuenta D', color: '#03EF62', type: 'normal' },
    { x: 600, y: 150, label: 'Cuenta E', color: '#03EF62', type: 'normal' },
  ];
  const edges = [[0,3],[1,3],[2,3],[3,4],[3,5],[4,5],[2,6],[4,7],[1,8],[8,4]];

  // Edges
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  edges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.stroke();
  });

  // Nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 24, 0, Math.PI*2);
    ctx.fillStyle = n.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  });

  // Legend
  ctx.font = '12px Inter';
  ctx.textAlign = 'left';
  [['#03EF62','Normal'],['#ff6b6b','Sospechoso'],['#ffc107','Hub']].forEach(([c2,l], i) => {
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.arc(30, 25 + i*22, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(l, 45, 29 + i*22);
  });
}

function animateAMLEmbeddings(){
  drawAMLGraph();
  const c = document.getElementById('canvasAML');
  if(!c) return;
  const ctx = c.getContext('2d');

  // Show embedding space on the right
  setTimeout(() => {
    // Divider
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(350, 380);
    ctx.lineTo(350, 400);
    ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Embedding Space (despues de GNN)', 350, 395);

  }, 500);
}

/* ---------- MIND MAP ---------- */
function drawMindMap(){
  const c = document.getElementById('mindMap');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const center = { x: 450, y: 250 };
  const topics = [
    { label: 'N2V\nRandom Walks', x: 150, y: 80, color: '#4ea8de' },
    { label: 'GNN\nEmbeddings', x: 750, y: 80, color: '#03EF62' },
    { label: 'Transductivo\nvs Inductivo', x: 100, y: 250, color: '#ff6b6b' },
    { label: 'Semi-\nSupervised', x: 800, y: 250, color: '#ffc107' },
    { label: 'Message\nPassing', x: 150, y: 420, color: '#7c3aed' },
    { label: 'AML\nAplicaciones', x: 750, y: 420, color: '#ec4899' },
    { label: 'UMAP\nVisualizacion', x: 450, y: 60, color: '#f97316' },
    { label: 'RF vs\nGNN', x: 450, y: 440, color: '#14b8a6' },
  ];

  // Lines from center to topics
  topics.forEach(t => {
    ctx.strokeStyle = t.color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Topic nodes
  topics.forEach(t => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 42, 0, Math.PI*2);
    ctx.fillStyle = t.color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = t.label.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, t.x, t.y - 6 + i * 14);
    });
  });

  // Center
  ctx.beginPath();
  ctx.arc(center.x, center.y, 55, 0, Math.PI*2);
  ctx.fillStyle = '#05192D';
  ctx.fill();
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#03EF62';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Cap 2:', center.x, center.y - 10);
  ctx.fillText('Graph', center.x, center.y + 6);
  ctx.fillText('Embeddings', center.x, center.y + 22);
}

/* ================================================================
   FLASHCARDS
   ================================================================ */
const flashcardsData = [
  { q: 'Que es un embedding?', a: 'Una representacion vectorial de baja dimension que captura patrones y relaciones complejas de datos de grafos.' },
  { q: 'Que inspiro a Node2Vec?', a: 'Word2Vec (NLP). Los nodos son como palabras y las random walks como oraciones.' },
  { q: 'Que controla el parametro p?', a: 'La probabilidad de retroceder al nodo anterior. p alto = menos retroceso.' },
  { q: 'Que controla el parametro q?', a: 'BFS vs DFS. q>1 = BFS (cerca), q<1 = DFS (lejos), q=1 = DeepWalk.' },
  { q: 'Que es UMAP?', a: 'Tecnica de reduccion de dimensionalidad que preserva estructura local Y global. Superior a t-SNE para embeddings.' },
  { q: 'Que es Xavier Initialization?', a: 'Inicializacion de pesos con variabilidad consistente entre capas para evitar vanishing/exploding gradients.' },
  { q: 'Que tipo de capa usa SimpleGNN?', a: 'GCNConv (Graph Convolutional) de PyTorch Geometric. Cada capa hace message passing.' },
  { q: 'Transductivo vs Inductivo?', a: 'Transductivo: solo nodos vistos (N2V). Inductivo: generaliza a nodos nuevos (GNN).' },
  { q: 'Que es message passing?', a: 'Cada nodo agrega info de sus vecinos, la transforma, y actualiza su embedding. 1 capa = 1 hop.' },
  { q: 'Que es end-to-end?', a: 'Proceso completo en un solo modelo: datos crudos -> embeddings -> prediccion. Sin pasos separados.' },
  { q: 'Mejor combo del capitulo?', a: 'GNN 4 capas + N2V como features: 88.99% accuracy, 89.29% F1.' },
  { q: 'Que es semi-supervised learning?', a: 'Entrenamiento con pocos datos etiquetados + muchos sin etiquetar. Ideal para AML.' },
  { q: 'Por que GNN para AML en produccion?', a: 'GNN es inductiva: puede procesar cuentas nuevas sin reentrenar. N2V requiere reentrenamiento.' },
  { q: 'Que es un "shallow method"?', a: 'Metodo sin deep learning que usa lookup tables. Ej: N2V, DeepWalk, matrix factorization.' },
  { q: 'Cuantos nodos tiene el Political Books dataset?', a: '105 libros con 441 aristas de co-compra. 3 clases: izquierda, derecha, neutral.' },
  { q: 'Que hace model.eval()?', a: 'Desactiva dropout y batch normalization para outputs deterministas en inferencia.' },
];

let flashcardsInited = false;
function initFlashcards(){
  if(flashcardsInited) return;
  flashcardsInited = true;
  renderFlashcards();
}
function renderFlashcards(){
  const container = document.getElementById('flashcardsContainer');
  if(!container) return;
  container.innerHTML = '';
  flashcardsData.forEach((fc, i) => {
    const card = document.createElement('div');
    card.className = 'flashcard';
    card.onclick = () => card.classList.toggle('flipped');
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front"><h4>${fc.q}</h4></div>
        <div class="flashcard-back"><p>${fc.a}</p></div>
      </div>`;
    container.appendChild(card);
  });
}
function shuffleFlashcards(){
  for(let i = flashcardsData.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [flashcardsData[i], flashcardsData[j]] = [flashcardsData[j], flashcardsData[i]];
  }
  renderFlashcards();
}
function resetFlashcards(){
  document.querySelectorAll('.flashcard').forEach(c => c.classList.remove('flipped'));
}

/* ================================================================
   EXERCISES
   ================================================================ */
let exercisesInited = false;
function initExercises(){
  if(exercisesInited) return;
  exercisesInited = true;
  initTransIndExercise();
  initParamExercise();
  initAMLExercise();
  initTFExercise();
}

function initTransIndExercise(){
  const container = document.getElementById('transIndExercise');
  if(!container) return;

  const scenarios = [
    { text: 'Sistema de alertas de fraude en tiempo real con cuentas nuevas diarias', answer: 'inductivo' },
    { text: 'Analisis historico de una red de narcotraficantes ya desmantelada', answer: 'transductivo' },
    { text: 'Recomendacion de productos en e-commerce con catalogo cambiante', answer: 'inductivo' },
    { text: 'Mapeo de comunidades en una red social con usuarios fijos', answer: 'transductivo' },
    { text: 'Deteccion de spam en email con nuevos correos cada minuto', answer: 'inductivo' },
  ];

  let html = '<p>Clasifica cada escenario como <strong>transductivo</strong> o <strong>inductivo</strong>:</p>';
  scenarios.forEach((s, i) => {
    html += `<div style="margin:12px 0; padding:12px; background:#1e293b; border-radius:8px;">
      <p style="margin-bottom:8px;">${i+1}. ${s.text}</p>
      <button class="btn btn-primary" style="margin-right:8px; padding:6px 16px; font-size:0.85em;" onclick="checkExercise(this,'${s.answer}','transductivo')">Transductivo</button>
      <button class="btn btn-warning" style="padding:6px 16px; font-size:0.85em;" onclick="checkExercise(this,'${s.answer}','inductivo')">Inductivo</button>
      <span class="ex-fb" style="margin-left:10px;font-weight:600;"></span>
    </div>`;
  });
  container.innerHTML = html;
}

function initParamExercise(){
  const container = document.getElementById('paramExercise');
  if(!container) return;

  const params = [
    { param: 'dimensions', desc: 'Tamano del vector embedding' },
    { param: 'walk_length', desc: 'Pasos por caminata' },
    { param: 'num_walks', desc: 'Caminatas por nodo' },
    { param: 'p', desc: 'Control de retroceso' },
    { param: 'q', desc: 'BFS vs DFS' },
  ];

  // Shuffled descriptions
  const descs = [...params.map(p => p.desc)].sort(() => Math.random() - 0.5);

  let html = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">';
  html += '<div><h4 style="color:var(--dc-green);">Parametro</h4>';
  params.forEach(p => {
    html += `<div style="padding:8px 12px; background:#1e293b; border-radius:6px; margin:6px 0; font-family:monospace; color:#4ea8de;">${p.param}</div>`;
  });
  html += '</div><div><h4 style="color:var(--dc-green);">Funcion</h4>';
  params.forEach(p => {
    html += `<div style="padding:8px 12px; background:#1e293b; border-radius:6px; margin:6px 0;">${p.desc}</div>`;
  });
  html += '</div></div>';
  html += '<div class="info-box" style="margin-top:12px;"><p>Los parametros ya estan emparejados correctamente. Estudia la correspondencia!</p></div>';
  container.innerHTML = html;
}

function initAMLExercise(){
  const container = document.getElementById('amlExercise');
  if(!container) return;

  const scenarios = [
    { text: 'Investigar una red de lavado de dinero detectada hace 6 meses', answer: 'N2V', reason: 'Red estatica, exploracion rapida de estructura' },
    { text: 'Monitorear transacciones en tiempo real para alertas de fraude', answer: 'GNN', reason: 'Cuentas nuevas diariamente, necesita generalizar' },
    { text: 'Crear un reporte de comunidades sospechosas para el regulador', answer: 'N2V', reason: 'Analisis puntual, grafo fijo' },
    { text: 'Sistema automatizado de scoring de riesgo para onboarding', answer: 'GNN', reason: 'Nuevos clientes constantemente, debe generalizar' },
  ];

  let html = '<p>Para cada escenario AML, elige el metodo mas adecuado:</p>';
  scenarios.forEach((s, i) => {
    html += `<div style="margin:12px 0; padding:12px; background:#1e293b; border-radius:8px;">
      <p style="margin-bottom:8px;">${i+1}. ${s.text}</p>
      <button class="btn btn-primary" style="margin-right:8px; padding:6px 16px; font-size:0.85em;" onclick="checkExercise(this,'${s.answer}','N2V')">N2V</button>
      <button class="btn btn-success" style="padding:6px 16px; font-size:0.85em;" onclick="checkExercise(this,'${s.answer}','GNN')">GNN</button>
      <span class="ex-fb" style="margin-left:10px;font-weight:600;"></span>
    </div>`;
  });
  container.innerHTML = html;
}

function initTFExercise(){
  const container = document.getElementById('tfExercise');
  if(!container) return;

  const statements = [
    { text: 'Node2Vec puede generar embeddings para nodos nuevos sin reentrenar.', answer: false, explain: 'Falso. N2V es transductivo, requiere reentrenamiento.' },
    { text: 'UMAP preserva tanto la estructura local como la global.', answer: true, explain: 'Verdadero. UMAP supera a t-SNE en preservar distancias globales.' },
    { text: 'El message passing en GNNs permite que cada nodo agrege informacion de sus vecinos.', answer: true, explain: 'Verdadero. Cada capa de MP agrega info de vecinos a 1 hop.' },
    { text: 'Random Forest siempre supera a las GNNs en clasificacion de grafos.', answer: false, explain: 'Falso. Las GNNs end-to-end superan a RF en F1 score.' },
    { text: 'Usar embeddings de N2V como features iniciales de la GNN mejora el rendimiento.', answer: true, explain: 'Verdadero. GNN+N2V logro el mejor F1 (89.29%).' },
    { text: 'En GNNs, mas capas siempre da mejor resultado sin limite.', answer: false, explain: 'Falso. Demasiadas capas causan over-smoothing: todos los embeddings convergen.' },
  ];

  let html = '<p>Indica si cada afirmacion es verdadera o falsa:</p>';
  statements.forEach((s, i) => {
    html += `<div style="margin:12px 0; padding:12px; background:#1e293b; border-radius:8px;">
      <p style="margin-bottom:8px;">${i+1}. ${s.text}</p>
      <button class="btn btn-success" style="margin-right:8px; padding:6px 16px; font-size:0.85em;" onclick="checkTF(this,${s.answer},true,'${s.explain}')">Verdadero</button>
      <button class="btn btn-danger" style="padding:6px 16px; font-size:0.85em;" onclick="checkTF(this,${s.answer},false,'${s.explain}')">Falso</button>
      <span class="ex-fb" style="margin-left:10px;font-weight:600;"></span>
    </div>`;
  });
  container.innerHTML = html;
}

function checkExercise(btn, correct, chosen){
  const parent = btn.parentElement;
  const fb = parent.querySelector('.ex-fb');
  if(parent.classList.contains('answered-ex')) return;
  parent.classList.add('answered-ex');

  const buttons = parent.querySelectorAll('button');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if(chosen === correct){
    fb.innerHTML = '<span style="color:#03EF62;">\u2714 Correcto!</span>';
    btn.style.background = '#03EF62';
    btn.style.color = '#000';
  } else {
    fb.innerHTML = '<span style="color:#ff6b6b;">\u2718 Incorrecto. Respuesta: ' + correct + '</span>';
    btn.style.background = '#ff6b6b';
    btn.style.color = '#fff';
  }
}

function checkTF(btn, correct, chosen, explain){
  const parent = btn.parentElement;
  const fb = parent.querySelector('.ex-fb');
  if(parent.classList.contains('answered-ex')) return;
  parent.classList.add('answered-ex');

  const buttons = parent.querySelectorAll('button');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if(chosen === correct){
    fb.innerHTML = '<span style="color:#03EF62;">\u2714 ' + explain + '</span>';
    btn.style.background = '#03EF62';
    btn.style.color = '#000';
  } else {
    fb.innerHTML = '<span style="color:#ff6b6b;">\u2718 ' + explain + '</span>';
    btn.style.background = '#ff6b6b';
    btn.style.color = '#fff';
  }
}

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateNavState();
  updateGlobalProgress();
  showSection('intro');
});
