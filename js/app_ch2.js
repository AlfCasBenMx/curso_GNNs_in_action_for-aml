/* ================================================================
   app_ch2.js — Capitulo 2: Graph Embeddings
   Logica interactiva, quizzes, canvas, flashcards, ejercicios
   ================================================================ */

/* ---------- SECTION ORDER & STATE ---------- */
const sectionOrder = [
  'intro','gat_recap','n2v','gnn_emb','comparacion','metricas',
  'semi_supervised','under_hood','aml','quiz1','quiz2','flashcards','ejercicios','resumen'
];

let completed = {};
let unlocked  = { intro: true };
let scores    = { 1: 0, 2: 0 };
let answered  = { 1: {}, 2: {} };
let totals    = { 1: 13, 2: 12 };

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
  n2vClearTimers();
  _n2vPaused = false;
  const pauseBtn = document.getElementById('n2vPauseBtn');
  if(pauseBtn) pauseBtn.style.display = 'none';
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
  ctx.fillText('Pulsa "Iniciar Animacion"', W/2, 230);
  ctx.fillText('para ver las 4 fases', W/2, 255);

  // Bottom: phase indicators
  const phLabels = ['1. Grafo','2. Turista pasea','3. Red aprende','4. Embedding!'];
  const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
  phLabels.forEach((l,i) => {
    const px = 175 + i * 250;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px - 75, H - 30, 150, 22);
    ctx.fillStyle = phColors[i];
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(l, px, H - 14);
  });
}

// Shared graph drawing helper
const _pipeNodes = [
  { x: 95, y: 160, label: 'A', col: '#ff6b6b' },
  { x: 45, y: 260, label: 'B', col: '#ff6b6b' },
  { x: 145,y: 260, label: 'C', col: '#4ea8de' },
  { x: 25, y: 370, label: 'D', col: '#4ea8de' },
  { x: 95, y: 450, label: 'E', col: '#4ea8de' },
  { x: 165,y: 370, label: 'F', col: '#03EF62' },
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
  ctx.fillText('Grafo: 6 libros', 95, 110);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter';
  ctx.fillText('aristas = co-compras', 95, 500);
  // Legend
  ctx.font = '9px Inter';
  [[_pipeNodes[0].col,'Izquierda'],[_pipeNodes[2].col,'Derecha'],[_pipeNodes[5].col,'Neutral']].forEach(([c,l],i)=>{
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(20, 530 + i*16, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(l, 30, 534 + i*16);
  });
}

/* ================================================================
   N2V PIPELINE CONTROLS — Pause, Stop, Timer management
   ================================================================ */
let _n2vTimerIds = [];
let _n2vPaused = false;
let _n2vPendingFn = null;

function _n2vDelay(fn, ms){
  if(_n2vPaused){ _n2vPendingFn = fn; return; }
  const id = setTimeout(fn, ms);
  _n2vTimerIds.push(id);
}

function n2vClearTimers(){
  _n2vTimerIds.forEach(id => clearTimeout(id));
  _n2vTimerIds = [];
  _n2vPendingFn = null;
}

function n2vStop(){
  n2vClearTimers();
  _n2vPaused = false;
  const btn = document.getElementById('n2vPauseBtn');
  if(btn){ btn.style.display = 'none'; btn.innerHTML = '&#9208; Pausar'; }
  drawN2VPipelineBase();
}

function n2vTogglePause(){
  _n2vPaused = !_n2vPaused;
  const btn = document.getElementById('n2vPauseBtn');
  if(_n2vPaused){
    n2vClearTimers();
    if(btn) btn.innerHTML = '&#9654; Continuar';
  } else {
    if(btn) btn.innerHTML = '&#9208; Pausar';
    if(_n2vPendingFn){ const fn = _n2vPendingFn; _n2vPendingFn = null; _n2vDelay(fn, 400); }
  }
}

/* ================================================================
   N2V PIPELINE JUMP — Static renders for each phase (no auto-advance)
   ================================================================ */
function n2vJumpTo(phase){
  n2vClearTimers();
  _n2vPaused = false;
  const pauseBtn = document.getElementById('n2vPauseBtn');
  if(pauseBtn) pauseBtn.style.display = 'none';

  const c = document.getElementById('canvasN2VPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const PX = 215, PY = 45, PW = W - 225, PH = H - 60;

  function clearAll(){
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, W, H);
    const phLabels = ['1. Grafo','2. Turista pasea','3. Red aprende','4. Embedding!'];
    const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
    phLabels.forEach((l,i) => {
      const px = 175 + i * 250;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 75, H - 30, 150, 22);
      ctx.fillStyle = phColors[i];
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(l, px, H - 14);
    });
  }
  function hlPhase(idx){
    const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
    const px = 175 + idx * 250;
    ctx.strokeStyle = phColors[idx];
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 77, H - 32, 154, 26);
  }

  // ===== PHASE 1 =====
  if(phase === 1){
    clearAll();
    _drawPipelineGraph(ctx);
    hlPhase(0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#4ea8de';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 1: Tenemos un grafo', PX + PW/2, PY + 40);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
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
      ctx.fillStyle = l.startsWith('NO VE') ? '#ffc107' : (l === '' ? '#ffc107' : '#e2e8f0');
      ctx.fillText(l, PX + 25, PY + 85 + i * 28);
    });
  }

  // ===== PHASE 2 =====
  if(phase === 2){
    clearAll();
    hlPhase(1);
    // Generate static demo walks
    const demoWalks = [[0,1,3,4,5],[0,2,5,4,1],[0,1,2,0,1]];
    _drawPipelineGraph(ctx);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 2: Resultado de los paseos', PX + PW/2, PY + 40);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    demoWalks.forEach((walk, w) => {
      const y = PY + 90 + w * 65;
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 13px Inter';
      ctx.fillText('Walk ' + (w+1) + ':', PX + 25, y);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(walk.map(i => _pipeLabels[i]).join('  \u2192  '), PX + 90, y);
      ctx.fillStyle = '#ce9178';
      ctx.font = '13px monospace';
      ctx.fillText('"' + walk.map(i => _pipeLabels[i]).join(' ') + '"', PX + 90, y + 24);
    });
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('\u2714 Nodos que aparecen juntos frecuentemente', PX + 25, PY + 310);
    ctx.fillText('   en las "oraciones" son similares.', PX + 25, PY + 338);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.fillText('En realidad se hacen 200+ walks por cada nodo.', PX + 25, PY + 380);
    ctx.fillText('Aqui solo mostramos 3 para entender la idea.', PX + 25, PY + 405);
  }

  // ===== PHASE 3a =====
  if(phase === '3a'){
    clearAll();
    _drawPipelineGraph(ctx);
    hlPhase(2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3a: De paseos a "parejas de entrenamiento"', PX + PW/2, PY + 35);
    const tx = PX + 20;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Tomemos una walk:  A \u2192 B \u2192 D \u2192 E \u2192 F', tx, PY + 65);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('Con ventana = 2, creamos parejas (input, contexto):', tx, PY + 95);
    const pairs = [
      { input: 'A', ctx_: 'B', note: 'A aparece cerca de B' },
      { input: 'A', ctx_: 'D', note: 'A aparece cerca de D' },
      { input: 'B', ctx_: 'A', note: 'B aparece cerca de A' },
      { input: 'B', ctx_: 'D', note: 'B aparece cerca de D' },
      { input: 'B', ctx_: 'E', note: 'B aparece cerca de E' },
      { input: 'D', ctx_: 'B', note: 'D aparece cerca de B' },
      { input: 'D', ctx_: 'E', note: 'D aparece cerca de E' },
      { input: 'D', ctx_: 'F', note: 'D aparece cerca de F' },
    ];
    pairs.forEach((p, pi) => {
      const y = PY + 128 + pi * 34;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tx, y - 12, PW - 40, 28);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tx, y - 12, PW - 40, 28);
      const inputCol = _pipeNodes[_pipeLabels.indexOf(p.input)].col;
      ctx.beginPath(); ctx.arc(tx + 20, y, 10, 0, Math.PI*2);
      ctx.fillStyle = inputCol; ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.input, tx + 20, y + 1);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '14px Inter'; ctx.textAlign = 'left';
      ctx.fillText('\u2192', tx + 40, y + 4);
      const ctxCol = _pipeNodes[_pipeLabels.indexOf(p.ctx_)].col;
      ctx.beginPath(); ctx.arc(tx + 70, y, 10, 0, Math.PI*2);
      ctx.fillStyle = ctxCol; ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.ctx_, tx + 70, y + 1);
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Inter'; ctx.textAlign = 'left';
      ctx.fillText(p.note, tx + 100, y + 4);
    });
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('\u2714 Le diremos a la red:', tx, PY + 420);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter';
    ctx.fillText('   "Si te doy A, deberias predecir B y D"', tx, PY + 445);
    ctx.fillText('   "Si te doy B, deberias predecir A, D y E"', tx, PY + 468);
  }

  // ===== PHASE 3b =====
  if(phase === '3b'){
    clearAll();
    _drawPipelineGraph(ctx);
    hlPhase(2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3b: La "tabla de pesos" (el truco clave)', PX + PW/2, PY + 35);
    const tx = PX + 20;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('La red tiene una tabla secreta con 3 numeros por nodo:', tx, PY + 65);
    const tableX = tx + 10, tableY = PY + 85, rowH = 32, colW = 110;
    const headers = ['Nodo', 'Peso 1', 'Peso 2', 'Peso 3'];
    const initWeights = [
      ['A', '0.12', '-0.45', '0.67'],
      ['B', '0.34', '0.22', '-0.18'],
      ['C', '-0.56', '0.89', '0.11'],
      ['D', '0.78', '-0.33', '0.44'],
      ['E', '-0.21', '0.55', '-0.72'],
      ['F', '0.09', '0.41', '0.36'],
    ];
    headers.forEach((h, i) => {
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(tableX + i * colW, tableY, colW - 2, rowH);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(h, tableX + i * colW + colW/2, tableY + 20);
    });
    initWeights.forEach((row, rIdx) => {
      const y = tableY + rowH + rIdx * rowH;
      ctx.fillStyle = rIdx % 2 === 0 ? '#0f172a' : '#1a2332';
      ctx.fillRect(tableX, y, colW * 4 - 2, rowH);
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5;
      ctx.strokeRect(tableX, y, colW * 4 - 2, rowH);
      const nodeCol = _pipeNodes[rIdx].col;
      ctx.beginPath(); ctx.arc(tableX + colW/2 - 10, y + 16, 8, 0, Math.PI*2);
      ctx.fillStyle = nodeCol; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
      ctx.fillText(row[0], tableX + colW/2 - 10, y + 17);
      for(let cc = 1; cc < 4; cc++){
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(row[cc], tableX + cc * colW + colW/2, y + 20);
      }
    });
    // Highlight row A
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 3;
    ctx.strokeRect(tableX, tableY + rowH, colW * 4 - 2, rowH);
    // Lookup demo
    const demoY = tableY + rowH * 8 + 20;
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('\u2B50 Como obtiene el embedding de A:', tx, demoY);
    ctx.fillStyle = '#4ea8de';
    ctx.font = '14px monospace';
    ctx.fillText('A = [1, 0, 0, 0, 0, 0]  (one-hot)', tx + 10, demoY + 30);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('\u2193 Solo selecciona la fila de A!', tx + 10, demoY + 60);
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('Embedding(A) = [0.12, -0.45, 0.67]', tx + 10, demoY + 92);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText('El embedding es literalmente la fila de esa tabla!', tx + 10, demoY + 125);
    ctx.fillText('La red AJUSTA estos pesos durante el entrenamiento.', tx + 10, demoY + 148);
  }

  // ===== PHASE 3c =====
  if(phase === '3c'){
    clearAll();
    _drawPipelineGraph(ctx);
    hlPhase(2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 3c: La red ajusta la tabla (entrenamiento)', PX + PW/2, PY + 35);
    const tx = PX + 20;
    const steps = [
      { title: 'Epoca 1: Pesos aleatorios', wA: ' 0.12, -0.45,  0.67', wB: ' 0.34,  0.22, -0.18', pred: 'Predice F \u274C', sim: 0.15, color: '#ff6b6b' },
      { title: 'Epoca 50: Mejorando...', wA: ' 0.45, -0.12,  0.55', wB: ' 0.48, -0.08,  0.49', pred: 'Predice C (casi)', sim: 0.65, color: '#ffc107' },
      { title: 'Epoca 200: Convergido!', wA: ' 0.82, -0.31,  0.45', wB: ' 0.79, -0.28,  0.51', pred: 'Predice B \u2714', sim: 0.95, color: '#03EF62' },
    ];
    steps.forEach((s, si) => {
      const baseY = PY + 65 + si * 195;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tx, baseY, PW - 40, 175);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(tx, baseY, PW - 40, 175);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(s.title, tx + 12, baseY + 22);
      // Mini weights
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter';
      ctx.fillText('A: [' + s.wA + ']', tx + 12, baseY + 48);
      ctx.fillText('B: [' + s.wB + ']', tx + 12, baseY + 68);
      // Prediction
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px Inter';
      ctx.fillText('Input: A \u2192 ' + s.pred, tx + 220, baseY + 48);
      // Similarity bar
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx + 12, baseY + 88, 300, 18);
      ctx.fillStyle = s.color;
      ctx.fillRect(tx + 12, baseY + 88, 300 * s.sim, 18);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'left';
      ctx.fillText('Similitud A\u2194B: ' + Math.round(s.sim * 100) + '%', tx + 18, baseY + 101);
      // Insight
      ctx.fillStyle = s.color; ctx.font = '11px Inter';
      const insights = [
        'Los pesos son aleatorios, A y B no se parecen',
        'La red va acercando los pesos de A y B',
        'A \u2248 0.82 y B \u2248 0.79  Son casi iguales!',
      ];
      ctx.fillText(insights[si], tx + 12, baseY + 125);
    });
  }

  // ===== PHASE 4 =====
  if(phase === 4){
    clearAll();
    _drawPipelineGraph(ctx);
    hlPhase(3);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Fase 4: Los embeddings finales!', PX + PW/2, PY + 40);
    const embData = [
      { label: 'A', col: '#ff6b6b', vals: [ 0.82, -0.31,  0.45] },
      { label: 'B', col: '#ff6b6b', vals: [ 0.79, -0.28,  0.51] },
      { label: 'C', col: '#4ea8de', vals: [-0.15,  0.73,  0.22] },
      { label: 'D', col: '#4ea8de', vals: [-0.22,  0.69,  0.18] },
      { label: 'E', col: '#4ea8de', vals: [-0.18,  0.65,  0.30] },
      { label: 'F', col: '#03EF62', vals: [ 0.10,  0.25, -0.80] },
    ];
    embData.forEach((e, i) => {
      const y = PY + 85 + i * 45;
      ctx.beginPath();
      ctx.arc(PX + 35, y, 12, 0, Math.PI*2);
      ctx.fillStyle = e.col;
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.label, PX + 35, y);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('\u2192', PX + 55, y + 3);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px monospace';
      ctx.fillText('[' + e.vals.map(v => (v >= 0 ? ' ' : '') + v.toFixed(2)).join(', ') + ']', PX + 75, y + 3);
    });
    // Scatter
    const sx = PX + 35, sy = PY + 380;
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Visualizado en 2D (UMAP):', sx, sy);
    const ox = sx + 50, oy = sy + 90;
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, oy + 50); ctx.lineTo(ox, oy - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox - 10, oy + 30); ctx.lineTo(ox + 160, oy + 30); ctx.stroke();
    embData.forEach(e => {
      const px = ox + 30 + (e.vals[0] + 0.5) * 90;
      const py = oy + 10 - (e.vals[1] + 0.5) * 75;
      ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI*2);
      ctx.fillStyle = e.col; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(e.label, px, py);
    });
    ctx.setLineDash([5,4]); ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ff6b6b';
    ctx.beginPath(); ctx.ellipse(ox + 30 + (0.82 + 0.5) * 90 - 5, oy + 10 - (-0.3 + 0.5) * 75, 35, 25, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#4ea8de';
    ctx.beginPath(); ctx.ellipse(ox + 30 + (-0.18 + 0.5) * 90, oy + 10 - (0.69 + 0.5) * 75 + 8, 40, 30, 0, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    // Conclusion
    const ttx = PX + 380, tty = sy + 20;
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('\u2714 Resultado:', ttx, tty);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter';
    ctx.fillText('A y B quedan juntos (misma zona)', ttx, tty + 26);
    ctx.fillText('C, D, E quedan juntos (otro cluster)', ttx, tty + 52);
    ctx.fillText('F queda aparte (nodo puente)', ttx, tty + 78);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('N2V descubrio los grupos', ttx, tty + 115);
    ctx.fillText('SIN ver los colores!', ttx, tty + 138);
  }

  // Update step label
  _n2vUpdateLabel(phase);
}

/* ================================================================
   N2V STEP-BY-STEP — Previous / Next sequential navigation
   ================================================================ */
const _n2vPhaseOrder = [1, 2, '3a', '3b', '3c', 4];
const _n2vPhaseNames = {
  1:    'Fase 1 de 6: Tenemos un grafo',
  2:    'Fase 2 de 6: El turista pasea',
  '3a': 'Fase 3 de 6: Parejas de entrenamiento',
  '3b': 'Fase 4 de 6: La tabla de pesos',
  '3c': 'Fase 5 de 6: Entrenamiento',
  4:    'Fase 6 de 6: Embeddings finales!',
};
let _n2vCurrentStep = -1;

function _n2vUpdateLabel(phase){
  const idx = _n2vPhaseOrder.indexOf(phase);
  if(idx >= 0) _n2vCurrentStep = idx;
  const lbl = document.getElementById('n2vStepLabel');
  if(lbl && phase in _n2vPhaseNames){
    lbl.textContent = _n2vPhaseNames[phase];
  }
}

function n2vStepNext(){
  if(_n2vCurrentStep < 0) _n2vCurrentStep = -1;
  _n2vCurrentStep = Math.min(_n2vCurrentStep + 1, _n2vPhaseOrder.length - 1);
  n2vJumpTo(_n2vPhaseOrder[_n2vCurrentStep]);
}

function n2vStepPrev(){
  if(_n2vCurrentStep <= 0) _n2vCurrentStep = 1;
  _n2vCurrentStep = Math.max(_n2vCurrentStep - 1, 0);
  n2vJumpTo(_n2vPhaseOrder[_n2vCurrentStep]);
}

function animateN2VPipeline(){
  n2vClearTimers();
  _n2vPaused = false;
  const pauseBtn = document.getElementById('n2vPauseBtn');
  if(pauseBtn){ pauseBtn.style.display = 'inline-flex'; pauseBtn.innerHTML = '&#9208; Pausar'; }
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
      const px = 175 + i * 250;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 75, H - 30, 150, 22);
      ctx.fillStyle = phColors[i];
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(l, px, H - 14);
    });
  }

  function highlightPhase(idx){
    const phColors = ['#4ea8de','#ffc107','#7c3aed','#03EF62'];
    const px = 175 + idx * 250;
    ctx.strokeStyle = phColors[idx];
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 77, H - 32, 154, 26);
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

    _n2vDelay(phase2, 8000);
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
        _n2vDelay(showWalkSummary, 1500);
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
          _n2vDelay(stepWalk, 1800);
        } else {
          // Walk complete
          ctx.fillStyle = '#03EF62';
          ctx.font = 'bold 12px Inter';
          ctx.fillText('\u2713 Walk ' + (walkIdx+1) + ' completa!', PX + 20, PY + PH - 25);
          walkIdx++;
          _n2vDelay(animateOneWalk, 2500);
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

      _n2vDelay(phase3, 9000);
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
        _n2vDelay(phase3b, 9000);
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
      _n2vDelay(showNextPair, 900);
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
    const rowH = 28, colW = 100;
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
        _n2vDelay(showLookupDemo, 1800);
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
      _n2vDelay(showNextRow, 500);
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
      _n2vDelay(phase3c, 10000);
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
      const baseY = PY + 55 + sIdx * 195;

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
      ctx.fillText(s.task, tx + 250, baseY + 42);
      ctx.fillStyle = s.color; ctx.font = 'bold 11px Inter';
      ctx.fillText(s.pred, tx + 250, baseY + 62);

      // Action
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px Inter';
      ctx.fillText(s.action, tx + 250, baseY + 85);

      // Similarity bar
      const simBar = [0.15, 0.65, 0.95][sIdx];
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx + 250, baseY + 96, 350, 14);
      ctx.fillStyle = s.color;
      ctx.fillRect(tx + 250, baseY + 96, 350 * simBar, 14);
      ctx.fillStyle = '#fff'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
      ctx.fillText('Similitud A\u2194B: ' + Math.round(simBar * 100) + '%', tx + 205, baseY + 107);

      sIdx++;
      _n2vDelay(showTrainingStep, 5000);
    }

    function showTrainingSummary(){
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('\u2714 Los pesos de la tabla SON los embeddings finales!', PX + PW/2, PY + PH - 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter';
      ctx.fillText('A y B caminan juntos \u2192 sus filas se vuelven parecidas', PX + PW/2, PY + PH - 18);

      _n2vDelay(phase4, 8000);
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
      if(eIdx >= embData.length){ _n2vDelay(showScatterAndConclusion, 1500); return; }
      const e = embData[eIdx];
      const y = PY + 75 + eIdx * 45;

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
      _n2vDelay(showNextEmb, 700);
    }

    function showScatterAndConclusion(){
      // Mini scatter plot
      const sx = PX + 30, sy = PY + 370;
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
      const tx = PX + 380, ty = sy + 10;
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
  { q: 'Transductivo vs Inductivo?', a: 'Transductivo: solo nodos vistos (N2V). Inductivo: generaliza a nodos nuevos (GNN). GAT es inductivo en teoria pero necesita el grafo completo en memoria.' },
  { q: 'Que es message passing?', a: 'Cada nodo agrega info de sus vecinos, la transforma, y actualiza su embedding. 1 capa = 1 hop.' },
  { q: 'Que es end-to-end?', a: 'Proceso completo en un solo modelo: datos crudos -> embeddings -> prediccion. Sin pasos separados.' },
  { q: 'Mejor combo del capitulo?', a: 'GNN 4 capas + N2V como features: 88.99% accuracy, 89.29% F1.' },
  { q: 'Que es semi-supervised learning?', a: 'Entrenamiento con pocos datos etiquetados + muchos sin etiquetar. Ideal para AML.' },
  { q: 'Por que GNN para AML en produccion?', a: 'GNN es inductiva: puede procesar cuentas nuevas sin reentrenar. N2V requiere reentrenamiento.' },
  { q: 'Que es un "shallow method"?', a: 'Metodo sin deep learning que usa lookup tables. Ej: N2V, DeepWalk, matrix factorization.' },
  { q: 'Cuantos nodos tiene el Political Books dataset?', a: '105 libros con 441 aristas de co-compra. 3 clases: izquierda, derecha, neutral.' },
  { q: 'Que hace model.eval()?', a: 'Desactiva dropout y batch normalization para outputs deterministas en inferencia.' },
  { q: 'Que son los coeficientes alpha en GAT?', a: 'Pesos escalares aprendidos via atencion que indican cuanta importancia darle a cada vecino en la agregacion. Suman 1 (softmax).' },
  { q: 'Por que GAT tiene multi-cabeza?', a: 'Cada cabeza (K) tiene sus propios pesos W^k y a^k, capturando perspectivas diferentes del grafo en paralelo. Se concatenan o promedian al final.' },
  { q: 'Por que GAT no escala a grafos enormes?', a: 'Necesita el grafo completo en GPU/RAM. K cabezas x N nodos x vecinos = demasiadas operaciones. GraphSAGE resuelve esto con muestreo.' },
  { q: 'Que es GraphSAGE?', a: 'Arquitectura GNN que muestrea K vecinos por nodo (no usa todos) y entrena en mini-batches via NeighborLoader. Escala a millones de nodos.' },
  { q: 'GCN vs GAT: diferencia clave?', a: 'GCN: pesos de agregacion fijos (por grado). GAT: pesos aprendidos (alpha via atencion). GAT es mas expresivo e interpretable.' },
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
   INTERACTIVE HOVER — canvasGNNMP (Message Passing graph)
   Hover over a node to highlight its neighbors + show embedding
   ================================================================ */
function initGNNMPHover(){
  const c = document.getElementById('canvasGNNMP');
  if(!c || c._hoverInit) return;
  c._hoverInit = true;

  c.addEventListener('mousemove', function(e){
    const rect = c.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (c.width / rect.width);
    const my = (e.clientY - rect.top)  * (c.height / rect.height);
    let hoveredIdx = -1;
    gnnNodes.forEach((n, i) => {
      if(Math.hypot(mx - n.x, my - n.y) < 30) hoveredIdx = i;
    });
    drawGNNGraphInteractive(hoveredIdx);
  });
  c.addEventListener('mouseleave', function(){ drawGNNGraphInteractive(-1); });
}

function drawGNNGraphInteractive(hoveredIdx){
  const c = document.getElementById('canvasGNNMP');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  if(gnnNodes.length === 0){ drawGNNGraph(); return; }

  const neighbors = {};
  if(hoveredIdx >= 0){
    gnnEdges.forEach(([a,b]) => {
      if(a === hoveredIdx){ neighbors[b] = true; }
      if(b === hoveredIdx){ neighbors[a] = true; }
    });
  }

  // Edges
  gnnEdges.forEach(([a,b]) => {
    const isActive = hoveredIdx >= 0 && (a === hoveredIdx || b === hoveredIdx);
    ctx.strokeStyle = isActive ? '#ffc107' : (hoveredIdx >= 0 ? '#1e293b' : '#334155');
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.globalAlpha = (hoveredIdx >= 0 && !isActive) ? 0.25 : 1;
    ctx.beginPath();
    ctx.moveTo(gnnNodes[a].x, gnnNodes[a].y);
    ctx.lineTo(gnnNodes[b].x, gnnNodes[b].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Nodes
  gnnNodes.forEach((n, i) => {
    const isHovered = (i === hoveredIdx);
    const isNeigh = neighbors[i];
    const dimmed = hoveredIdx >= 0 && !isHovered && !isNeigh;
    ctx.globalAlpha = dimmed ? 0.25 : 1;
    ctx.beginPath();
    ctx.arc(n.x, n.y, isHovered ? 34 : 28, 0, Math.PI*2);
    ctx.fillStyle = isHovered ? '#ffc107' : n.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isHovered ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = isHovered ? 'bold 16px Inter' : 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
    // Embedding text
    ctx.fillStyle = dimmed ? '#334155' : (isHovered ? '#ffc107' : '#94a3b8');
    ctx.font = isHovered ? 'bold 11px monospace' : '10px Inter';
    ctx.fillText(n.emb, n.x, n.y + (isHovered ? 48 : 42));
    ctx.globalAlpha = 1;
  });

  // Tooltip
  if(hoveredIdx >= 0){
    const n = gnnNodes[hoveredIdx];
    const neighLabels = Object.keys(neighbors).map(i => gnnNodes[i].label);
    const tx = n.x, ty = Math.max(60, n.y - 55);
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    const tw = 200, th = 52;
    ctx.fillRect(tx - tw/2, ty - th, tw, th);
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - tw/2, ty - th, tw, th);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(n.label + '  →  Vecinos: ' + neighLabels.join(', '), tx, ty - th + 18);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px monospace';
    ctx.fillText('emb: ' + n.emb, tx, ty - th + 38);
  }

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(hoveredIdx >= 0 ? 'Pasa sobre otro nodo para explorar su vecindario' : '🖱 Pasa el mouse sobre un nodo para ver sus vecinos y embedding', 350, 390);
}

/* ================================================================
   INTERACTIVE HOVER — canvasAML (AML transaction network)
   ================================================================ */
let amlNodes = [];
let amlEdges = [[0,3],[1,3],[2,3],[3,4],[3,5],[4,5],[2,6],[4,7],[1,8],[8,4]];

function initAMLHover(){
  const c = document.getElementById('canvasAML');
  if(!c || c._hoverInit) return;
  c._hoverInit = true;

  c.addEventListener('mousemove', function(e){
    const rect = c.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (c.width / rect.width);
    const my = (e.clientY - rect.top)  * (c.height / rect.height);
    let hIdx = -1;
    amlNodes.forEach((n, i) => {
      if(Math.hypot(mx - n.x, my - n.y) < 26) hIdx = i;
    });
    drawAMLGraphInteractive(hIdx);
  });
  c.addEventListener('mouseleave', function(){ drawAMLGraphInteractive(-1); });
}

function drawAMLGraphInteractive(hIdx){
  const c = document.getElementById('canvasAML');
  if(!c || amlNodes.length === 0) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const fakeEmbs = {
    normal: '[0.8, 0.1, -0.2]',
    mula:   '[-0.7, 0.6, 0.9]',
    hub:    '[-0.5, 0.8, 0.4]',
    shell:  '[-0.6, 0.7, 0.8]'
  };
  const typeLabels = { normal: 'Cuenta Normal', mula: 'Mula Financiera', hub: 'Hub Sospechoso', shell: 'Shell Company' };

  const neighbors = {};
  if(hIdx >= 0){
    amlEdges.forEach(([a,b]) => {
      if(a === hIdx) neighbors[b] = true;
      if(b === hIdx) neighbors[a] = true;
    });
  }

  // Edges
  amlEdges.forEach(([a,b]) => {
    const isActive = hIdx >= 0 && (a === hIdx || b === hIdx);
    ctx.strokeStyle = isActive ? '#ffc107' : (hIdx >= 0 ? '#1e293b' : '#334155');
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.globalAlpha = (hIdx >= 0 && !isActive) ? 0.2 : 1;
    ctx.beginPath();
    ctx.moveTo(amlNodes[a].x, amlNodes[a].y);
    ctx.lineTo(amlNodes[b].x, amlNodes[b].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Nodes
  amlNodes.forEach((n, i) => {
    const isH = (i === hIdx);
    const isN = neighbors[i];
    const dim = hIdx >= 0 && !isH && !isN;
    ctx.globalAlpha = dim ? 0.2 : 1;
    ctx.beginPath();
    ctx.arc(n.x, n.y, isH ? 28 : 24, 0, Math.PI*2);
    ctx.fillStyle = isH ? '#ffc107' : n.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isH ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = isH ? 'bold 12px Inter' : 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
    ctx.globalAlpha = 1;
  });

  // Tooltip
  if(hIdx >= 0){
    const n = amlNodes[hIdx];
    const nCount = Object.keys(neighbors).length;
    const tx = Math.min(Math.max(n.x, 130), c.width - 130);
    const ty = Math.max(80, n.y - 50);
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    const tw = 250, th = 68;
    ctx.fillRect(tx - tw/2, ty - th, tw, th);
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - tw/2, ty - th, tw, th);
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(typeLabels[n.type] || n.type, tx, ty - th + 16);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter';
    ctx.fillText(nCount + ' conexiones | Embedding:', tx, ty - th + 34);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#03EF62';
    ctx.fillText(fakeEmbs[n.type] || '[...]', tx, ty - th + 52);
  }

  // Legend
  ctx.font = '12px Inter';
  ctx.textAlign = 'left';
  [['#03EF62','Normal'],['#ff6b6b','Sospechoso'],['#ffc107','Hub']].forEach(([c2,l], i) => {
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.arc(30, 25 + i*22, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(l, 45, 29 + i*22);
  });

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(hIdx >= 0 ? 'Las mulas y shells tienden a tener embeddings similares entre si' : '🖱 Pasa el mouse sobre una cuenta para ver su tipo, conexiones y embedding', 350, 390);
}

/* ================================================================
   REAL AML EMBEDDINGS ANIMATION — Nodes move from graph to embedding space
   ================================================================ */
function animateAMLEmbeddings(){
  const c = document.getElementById('canvasAML');
  if(!c || amlNodes.length === 0){ drawAMLGraph(); return; }
  // Remove hover during animation
  c._hoverInit = false;
  const oldMM = c.onmousemove;
  const listeners = c._hoverInit;

  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  // Target positions in "embedding space" (right half) — clustered by type
  const clusterTargets = {
    normal: { cx: 540, cy: 120 },
    mula:   { cx: 580, cy: 300 },
    hub:    { cx: 520, cy: 250 },
    shell:  { cx: 600, cy: 280 },
  };

  // Save original positions & compute targets
  const origPos = amlNodes.map(n => ({ x: n.x, y: n.y }));
  const targets = amlNodes.map(n => {
    const ct = clusterTargets[n.type];
    return { x: ct.cx + (Math.random() - 0.5) * 50, y: ct.cy + (Math.random() - 0.5) * 40 };
  });

  let t = 0;
  const duration = 90; // frames

  function frame(){
    t++;
    const p = Math.min(t / duration, 1);
    const ease = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2; // easeInOutQuad

    ctx.clearRect(0, 0, W, H);

    // Divider
    if(p > 0.1){
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([5,5]);
      ctx.globalAlpha = Math.min((p - 0.1) * 3, 0.6);
      ctx.beginPath();
      ctx.moveTo(350, 20);
      ctx.lineTo(350, H - 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Labels
    if(p > 0.2){
      ctx.globalAlpha = Math.min((p - 0.2) * 2, 1);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Grafo Original', 175, 18);
      ctx.fillStyle = '#03EF62';
      ctx.fillText('Embedding Space', 530, 18);
      ctx.globalAlpha = 1;
    }

    // Draw fading edges in original space
    ctx.globalAlpha = Math.max(1 - p * 1.5, 0.1);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    amlEdges.forEach(([a,b]) => {
      const ax = origPos[a].x * (1 - ease) + (origPos[a].x * 0.5) * ease;
      const bx = origPos[b].x * (1 - ease) + (origPos[b].x * 0.5) * ease;
      ctx.beginPath();
      ctx.moveTo(ax, origPos[a].y);
      ctx.lineTo(bx, origPos[b].y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Animated nodes — interpolate position
    amlNodes.forEach((n, i) => {
      const cx = origPos[i].x + (targets[i].x - origPos[i].x) * ease;
      const cy = origPos[i].y + (targets[i].y - origPos[i].y) * ease;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI*2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, cx, cy);
    });

    // Cluster circles when settled
    if(p > 0.8){
      ctx.globalAlpha = (p - 0.8) * 5;
      ctx.setLineDash([5,4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#03EF62';
      ctx.beginPath(); ctx.ellipse(540, 120, 60, 40, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#ff6b6b';
      ctx.beginPath(); ctx.ellipse(570, 280, 70, 50, 0, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Labels
      ctx.fillStyle = '#03EF62';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Normales', 540, 170);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('Sospechosos', 570, 340);
    }

    if(t < duration){
      requestAnimationFrame(frame);
    } else {
      // Final text
      ctx.fillStyle = '#ffc107';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Las cuentas similares quedan juntas en el embedding space', W/2, H - 15);
      // Re-enable hover after a delay
      setTimeout(() => { c._hoverInit = false; initAMLHover(); }, 500);
    }
  }

  requestAnimationFrame(frame);
}

/* ================================================================
   INTERACTIVE HOVER — canvasBFSDFS (BFS vs DFS)
   Hover over a node to animate traversal from it
   ================================================================ */
let bfsNodes = [];
let bfsDFSNodes_right = [];
const _bfsEdgesAll = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,3],[2,6],[4,5]];

function initBFSDFSHover(){
  const c = document.getElementById('canvasBFSDFS');
  if(!c || c._hoverInit) return;
  c._hoverInit = true;

  bfsNodes = [
    { x: 175, y: 175, label: 'A', color: '#03EF62' },
    { x: 100, y: 80,  label: 'B', color: '#4ea8de' },
    { x: 250, y: 80,  label: 'C', color: '#4ea8de' },
    { x: 50,  y: 175, label: 'D', color: '#4ea8de' },
    { x: 100, y: 270, label: 'E', color: '#4ea8de' },
    { x: 250, y: 270, label: 'F', color: '#4ea8de' },
    { x: 300, y: 175, label: 'G', color: '#4ea8de' },
  ];
  bfsDFSNodes_right = bfsNodes.map(n => ({...n, x: n.x + 350}));

  const adjList = {0:[1,2,3,4,5,6], 1:[0,3], 2:[0,6], 3:[0,1], 4:[0,5], 5:[0,4], 6:[0,2]};

  c.addEventListener('mousemove', function(e){
    const rect = c.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (c.width / rect.width);
    const my = (e.clientY - rect.top)  * (c.height / rect.height);

    let hIdx = -1, side = 'bfs';
    bfsNodes.forEach((n, i) => { if(Math.hypot(mx - n.x, my - n.y) < 24) hIdx = i; });
    if(hIdx < 0){
      bfsDFSNodes_right.forEach((n, i) => { if(Math.hypot(mx - n.x, my - n.y) < 24){ hIdx = i; side = 'dfs'; } });
    }
    drawBFSDFSInteractive(hIdx, side, adjList);
  });
  c.addEventListener('mouseleave', function(){ drawBFSDFSInteractive(-1, 'bfs', {0:[1,2,3,4,5,6], 1:[0,3], 2:[0,6], 3:[0,1], 4:[0,5], 5:[0,4], 6:[0,2]}); });
}

function drawBFSDFSInteractive(hIdx, side, adjList){
  const c = document.getElementById('canvasBFSDFS');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  // Compute BFS order from hIdx
  let bfsOrder = [], dfsOrder = [];
  if(hIdx >= 0){
    // BFS
    const visited = new Set();
    const queue = [hIdx];
    visited.add(hIdx);
    while(queue.length > 0){
      const curr = queue.shift();
      bfsOrder.push(curr);
      (adjList[curr]||[]).forEach(nb => { if(!visited.has(nb)){ visited.add(nb); queue.push(nb); } });
    }
    // DFS
    const vis2 = new Set();
    const stack = [hIdx];
    while(stack.length > 0){
      const curr = stack.pop();
      if(vis2.has(curr)) continue;
      vis2.add(curr);
      dfsOrder.push(curr);
      (adjList[curr]||[]).reverse().forEach(nb => { if(!vis2.has(nb)) stack.push(nb); });
    }
  }

  // Draw both sides
  [bfsNodes, bfsDFSNodes_right].forEach((nodes, sideIdx) => {
    const isBFS = (sideIdx === 0);
    const order = isBFS ? bfsOrder : dfsOrder;

    // Edges
    _bfsEdgesAll.forEach(([a,b]) => {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    // Traversal arrows
    if(order.length > 1){
      const color = isBFS ? '#03EF62' : '#ffc107';
      for(let i = 0; i < order.length - 1; i++){
        const a = order[i], b = order[i+1];
        ctx.globalAlpha = 1 - i * 0.1;
        drawArrow(ctx, nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, color);
        ctx.globalAlpha = 1;
      }
    }

    // Nodes
    nodes.forEach((n, i) => {
      const orderIdx = order.indexOf(i);
      const isInOrder = orderIdx >= 0;
      const isStart = (i === hIdx);
      ctx.beginPath();
      ctx.arc(n.x, n.y, isStart ? 26 : 22, 0, Math.PI*2);
      ctx.fillStyle = isStart ? '#ffc107' : (isInOrder ? (isBFS ? '#03EF62' : '#ffc107') : '#4ea8de');
      ctx.globalAlpha = (hIdx >= 0 && !isInOrder) ? 0.35 : 1;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y);
      // Order number
      if(isInOrder && orderIdx > 0){
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath(); ctx.arc(n.x + 16, n.y - 16, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Inter';
        ctx.fillText(orderIdx + 1, n.x + 16, n.y - 16);
      }
      ctx.globalAlpha = 1;
    });
  });

  // Labels
  ctx.fillStyle = '#03EF62';
  ctx.font = 'bold 16px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('BFS (q > 1)', 175, 325);
  ctx.fillStyle = '#ffc107';
  ctx.fillText('DFS (q < 1)', 525, 325);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Inter';
  ctx.fillText(hIdx >= 0 ? 'Numeros = orden de visita desde ' + bfsNodes[hIdx].label : '🖱 Pasa el mouse sobre un nodo para ver BFS vs DFS desde ese nodo', 350, 345);
}

/* ================================================================
   ADJACENCY MATRIX ↔ GRAPH — Interactive bidirectional visualization
   ================================================================ */
const _adjGraphNodes = [
  { x: 90,  y: 80,  label: 'A', color: '#ff6b6b', group: 'l' },
  { x: 50,  y: 160, label: 'B', color: '#ff6b6b', group: 'l' },
  { x: 130, y: 160, label: 'C', color: '#4ea8de', group: 'c' },
  { x: 50,  y: 240, label: 'D', color: '#4ea8de', group: 'c' },
  { x: 130, y: 240, label: 'E', color: '#03EF62', group: 'n' },
  { x: 200, y: 160, label: 'F', color: '#4ea8de', group: 'c' },
  { x: 170, y: 80,  label: 'G', color: '#ff6b6b', group: 'l' },
];
const _adjGraphEdges = [[0,1],[0,2],[0,6],[1,2],[1,3],[2,5],[3,4],[4,5],[5,6]];

function initAdjMatrixCanvas(){
  const c = document.getElementById('canvasAdjMatrix');
  if(!c || c._init) return;
  c._init = true;
  drawAdjMatrix(-1, -1);

  c.addEventListener('mousemove', function(e){
    const rect = c.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (c.width / rect.width);
    const my = (e.clientY - rect.top)  * (c.height / rect.height);
    const N = _adjGraphNodes.length;

    // Check if hovering graph node
    let hNode = -1;
    _adjGraphNodes.forEach((n, i) => {
      if(Math.hypot(mx - n.x, my - n.y) < 18) hNode = i;
    });

    // Check if hovering graph edge
    let hEdge = -1;
    if(hNode < 0){
      _adjGraphEdges.forEach(([a,b], ei) => {
        const na = _adjGraphNodes[a], nb = _adjGraphNodes[b];
        const dx = nb.x - na.x, dy = nb.y - na.y;
        const len = Math.hypot(dx, dy);
        const t = Math.max(0, Math.min(1, ((mx - na.x)*dx + (my - na.y)*dy) / (len*len)));
        const px = na.x + t*dx, py = na.y + t*dy;
        if(Math.hypot(mx - px, my - py) < 8) hEdge = ei;
      });
    }

    // Check if hovering matrix cell
    let hRow = -1, hCol = -1;
    const matOX = 290, matOY = 60, cellS = 32;
    if(mx >= matOX && my >= matOY && mx < matOX + N*cellS && my < matOY + N*cellS){
      hCol = Math.floor((mx - matOX) / cellS);
      hRow = Math.floor((my - matOY) / cellS);
    }

    drawAdjMatrix(hNode, hEdge, hRow, hCol);
  });
  c.addEventListener('mouseleave', function(){ drawAdjMatrix(-1, -1); });
}

function drawAdjMatrix(hNode, hEdge, hRow, hCol){
  const c = document.getElementById('canvasAdjMatrix');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const N = _adjGraphNodes.length;

  // Build adjacency matrix
  const adj = Array.from({length: N}, () => Array(N).fill(0));
  _adjGraphEdges.forEach(([a,b]) => { adj[a][b] = 1; adj[b][a] = 1; });

  // Determine which edge is highlighted
  let hlEdgeA = -1, hlEdgeB = -1;
  if(hNode >= 0){
    hlEdgeA = hNode; // highlight all edges from this node
  } else if(hEdge >= 0){
    hlEdgeA = _adjGraphEdges[hEdge][0];
    hlEdgeB = _adjGraphEdges[hEdge][1];
  } else if(hRow >= 0 && hCol >= 0 && adj[hRow][hCol]){
    hlEdgeA = hRow;
    hlEdgeB = hCol;
  }

  // --- GRAPH (left side) ---
  // Edges
  _adjGraphEdges.forEach(([a,b], ei) => {
    const isHL = (hlEdgeA === a && (hlEdgeB < 0 || hlEdgeB === b)) ||
                 (hlEdgeA === b && (hlEdgeB < 0 || hlEdgeB === a)) ||
                 (hlEdgeB === a && hlEdgeA === b);
    ctx.strokeStyle = isHL ? '#ffc107' : '#475569';
    ctx.lineWidth = isHL ? 3 : 1.5;
    ctx.globalAlpha = (hlEdgeA >= 0 && !isHL) ? 0.2 : 1;
    ctx.beginPath();
    ctx.moveTo(_adjGraphNodes[a].x, _adjGraphNodes[a].y);
    ctx.lineTo(_adjGraphNodes[b].x, _adjGraphNodes[b].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  // Nodes
  _adjGraphNodes.forEach((n, i) => {
    const isHL = (i === hNode) || (i === hlEdgeA) || (i === hlEdgeB) || (hRow >= 0 && (i === hRow || i === hCol));
    ctx.beginPath();
    ctx.arc(n.x, n.y, isHL ? 20 : 16, 0, Math.PI*2);
    ctx.fillStyle = isHL ? '#ffc107' : n.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = isHL ? 'bold 14px Inter' : 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  });

  // Title
  ctx.fillStyle = '#4ea8de';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Grafo (7 libros)', 120, 290);

  // --- MATRIX (right side) ---
  const matOX = 290, matOY = 60, cellS = 32;

  // Column headers
  _adjGraphNodes.forEach((n, i) => {
    ctx.fillStyle = (i === hCol || i === hlEdgeA || i === hlEdgeB) ? '#ffc107' : n.color;
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, matOX + i*cellS + cellS/2, matOY - 8);
  });
  // Row headers
  _adjGraphNodes.forEach((n, i) => {
    ctx.fillStyle = (i === hRow || i === hlEdgeA || i === hlEdgeB) ? '#ffc107' : n.color;
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(n.label, matOX - 6, matOY + i*cellS + cellS/2 + 4);
  });

  // Cells
  for(let r = 0; r < N; r++){
    for(let col = 0; col < N; col++){
      const x = matOX + col*cellS, y = matOY + r*cellS;
      const isEdge = adj[r][col] === 1;
      const isHLCell = (hlEdgeA >= 0 && ((r === hlEdgeA && (hlEdgeB < 0 || col === hlEdgeB)) || (col === hlEdgeA && (hlEdgeB < 0 || r === hlEdgeB)))) ||
                        (hRow === r && hCol === col);
      const isHLRow = (r === hRow || r === hlEdgeA || r === hlEdgeB);
      const isHLCol = (col === hCol || col === hlEdgeA || col === hlEdgeB);

      // Background
      if(isHLCell && isEdge){
        ctx.fillStyle = '#ffc107';
      } else if(isEdge){
        ctx.fillStyle = (isHLRow || isHLCol) ? 'rgba(255,199,7,0.3)' : '#1e4a2e';
      } else {
        ctx.fillStyle = (isHLRow || isHLCol) ? 'rgba(255,255,255,0.05)' : '#0f172a';
      }
      ctx.fillRect(x, y, cellS, cellS);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellS, cellS);

      // Value
      ctx.fillStyle = isEdge ? (isHLCell ? '#000' : '#03EF62') : '#334155';
      ctx.font = isHLCell ? 'bold 14px monospace' : '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isEdge ? '1' : '0', x + cellS/2, y + cellS/2);
    }
  }

  // Matrix title
  ctx.fillStyle = '#4ea8de';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Matriz de Adyacencia', matOX + N*cellS/2, matOY + N*cellS + 22);

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  const footTxt = (hNode >= 0) ? 'Nodo ' + _adjGraphNodes[hNode].label + ': fila y columna resaltadas en la matriz' :
                  (hEdge >= 0) ? 'Arista ' + _adjGraphNodes[_adjGraphEdges[hEdge][0]].label + '↔' + _adjGraphNodes[_adjGraphEdges[hEdge][1]].label + ' = celda amarilla en la matriz' :
                  (hRow >= 0 && hCol >= 0) ? 'Celda [' + _adjGraphNodes[hRow].label + ',' + _adjGraphNodes[hCol].label + '] ' + (adj[hRow][hCol] ? '= arista conectada (1)' : '= sin conexion (0)') :
                  '🖱 Pasa sobre un nodo, arista o celda para ver la correspondencia';
  ctx.fillText(footTxt, c.width/2, c.height - 10);

  // Legend
  ctx.font = '9px Inter';
  ctx.textAlign = 'left';
  [['#ff6b6b','Izquierda'],['#4ea8de','Derecha'],['#03EF62','Neutral']].forEach(([cl,l],i) => {
    ctx.fillStyle = cl;
    ctx.beginPath(); ctx.arc(20, 310 + i*14, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(l, 28, 313 + i*14);
  });
}

/* ================================================================
   PARAMETER PLAYGROUND — Interactive model comparison
   ================================================================ */
const _playgroundData = [
  { model: 'RF',  n2v: false, layers: 0, acc: 83.33, f1: 82.01 },
  { model: 'RF',  n2v: true,  layers: 0, acc: 84.52, f1: 80.72 },
  { model: 'GNN', n2v: false, layers: 2, acc: 82.27, f1: 82.14 },
  { model: 'GNN', n2v: true,  layers: 2, acc: 87.79, f1: 88.10 },
  { model: 'GNN', n2v: false, layers: 4, acc: 86.58, f1: 86.90 },
  { model: 'GNN', n2v: true,  layers: 4, acc: 88.99, f1: 89.29 },
];
let _pgModel = 'GNN', _pgN2V = true, _pgLayers = 4;

function initPlayground(){
  const c = document.getElementById('canvasPlayground');
  if(!c || c._init) return;
  c._init = true;
  drawPlayground();
}

function pgSetModel(val){ _pgModel = val; drawPlayground(); }
function pgSetN2V(val){ _pgN2V = (val === 'true' || val === true); drawPlayground(); }
function pgSetLayers(val){ _pgLayers = parseInt(val); drawPlayground(); }

function drawPlayground(){
  const c = document.getElementById('canvasPlayground');
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  // Find selected config
  let selected = _playgroundData.find(d =>
    d.model === _pgModel &&
    d.n2v === _pgN2V &&
    (_pgModel === 'RF' || d.layers === _pgLayers)
  );
  if(!selected) selected = _playgroundData[5]; // fallback

  // Background for chart area
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Draw all bars (muted) + highlight selected
  const barW = 80, gap = 18, baseY = H - 50, minY = 50, maxVal = 95, minVal = 75;
  const scaleY = (baseY - minY) / (maxVal - minVal);

  _playgroundData.forEach((d, i) => {
    const x = 40 + i * (barW + gap);
    const isSel = (d === selected);

    // Accuracy bar
    const hAcc = (d.acc - minVal) * scaleY;
    ctx.fillStyle = isSel ? '#03EF62' : '#1e293b';
    ctx.fillRect(x, baseY - hAcc, barW/2 - 2, hAcc);
    ctx.strokeStyle = isSel ? '#03EF62' : '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, baseY - hAcc, barW/2 - 2, hAcc);

    // F1 bar
    const hF1 = (d.f1 - minVal) * scaleY;
    ctx.fillStyle = isSel ? '#ffc107' : '#1e293b';
    ctx.fillRect(x + barW/2, baseY - hF1, barW/2 - 2, hF1);
    ctx.strokeStyle = isSel ? '#ffc107' : '#334155';
    ctx.strokeRect(x + barW/2, baseY - hF1, barW/2 - 2, hF1);

    // Values on top
    ctx.fillStyle = isSel ? '#e2e8f0' : '#475569';
    ctx.font = isSel ? 'bold 11px Inter' : '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.acc.toFixed(1), x + barW/4, baseY - hAcc - 5);
    ctx.fillText(d.f1.toFixed(1), x + 3*barW/4, baseY - hF1 - 5);

    // Label
    const lbl = (d.model === 'RF' ? 'RF' : 'GNN ' + d.layers + 'L') + (d.n2v ? '+N2V' : '');
    ctx.fillStyle = isSel ? '#e2e8f0' : '#475569';
    ctx.font = '9px Inter';
    ctx.fillText(lbl, x + barW/2, baseY + 14);
  });

  // Y axis labels
  for(let v = 75; v <= 95; v += 5){
    const y = baseY - (v - minVal) * scaleY;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(35, y); ctx.lineTo(W - 10, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(v + '%', 32, y + 4);
  }

  // Selected highlight box
  ctx.fillStyle = 'rgba(3,239,98,0.08)';
  ctx.fillRect(W - 175, 10, 170, 90);
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 1;
  ctx.strokeRect(W - 175, 10, 170, 90);
  ctx.fillStyle = '#03EF62';
  ctx.font = 'bold 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Seleccionado:', W - 90, 30);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px Inter';
  ctx.fillText('Acc: ' + selected.acc.toFixed(2) + '%', W - 90, 52);
  ctx.fillText('F1:  ' + selected.f1.toFixed(2) + '%', W - 90, 72);
  ctx.fillStyle = '#ffc107';
  ctx.font = 'bold 11px Inter';
  const selLabel = (_pgModel === 'RF' ? 'Random Forest' : 'GNN ' + _pgLayers + ' capas') + (_pgN2V ? ' + N2V' : '');
  ctx.fillText(selLabel, W - 90, 92);

  // Legend
  ctx.fillStyle = '#03EF62';
  ctx.fillRect(W - 175, H - 30, 12, 12);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter';
  ctx.textAlign = 'left';
  ctx.fillText('Accuracy', W - 160, H - 20);
  ctx.fillStyle = '#ffc107';
  ctx.fillRect(W - 100, H - 30, 12, 12);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('F1 Score', W - 85, H - 20);
}

/* ================================================================
   GNN PIPELINE STEP CONTROLS — Phase-by-phase navigation
   ================================================================ */
let _gnnPipeStep = 0;
const _gnnPipePhases = ['base', 'layer1', 'layer2', 'embedding'];

function gnnPipeGoto(step){
  _gnnPipeStep = Math.max(0, Math.min(3, step));
  const c = document.getElementById('canvasGNNPipeline');
  if(!c) return;
  const ctx = c.getContext('2d');

  // Update button states
  document.querySelectorAll('.gnn-pipe-step-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector('.gnn-pipe-step-btn[data-step="' + _gnnPipeStep + '"]');
  if(activeBtn) activeBtn.classList.add('active');

  if(_gnnPipeStep === 0){
    drawGNNPipelineBase();
  } else {
    // Draw a static version of each phase
    drawGNNPipelineBase();
    if(_gnnPipeStep >= 1) drawGNNPipePhase2Static(ctx, c.width, c.height);
    if(_gnnPipeStep >= 2) drawGNNPipePhase3Static(ctx, c.width, c.height);
    if(_gnnPipeStep >= 3) drawGNNPipePhase4Static(ctx, c.width, c.height);
  }

  // Update step label
  const lbl = document.getElementById('gnnPipeStepLabel');
  if(lbl) lbl.textContent = ['1. Grafo + Features', '2. Capa 1: Mensajes llegan', '3. Capa 2: Info a 2 hops', '4. Embedding final'][_gnnPipeStep];
}
function gnnPipeNext(){ gnnPipeGoto(_gnnPipeStep + 1); }
function gnnPipePrev(){ gnnPipeGoto(_gnnPipeStep - 1); }

function drawGNNPipePhase2Static(ctx, W, H){
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(196, 40, 198, H - 55);
  const centerX = 300, centerY = 200;
  // Central node
  ctx.beginPath(); ctx.arc(centerX, centerY, 22, 0, Math.PI*2);
  ctx.fillStyle = '#03EF62'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = 'bold 14px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('v', centerX, centerY);
  // Neighbors
  const senders = [
    { label: 'u1', col: '#4ea8de', angle: -2.3 },
    { label: 'u2', col: '#4ea8de', angle: -0.8 },
    { label: 'u3', col: '#ff6b6b', angle: 2.3 },
    { label: 'u4', col: '#ff6b6b', angle: 0.8 },
  ];
  senders.forEach(s => {
    const sx = centerX + Math.cos(s.angle) * 85;
    const sy = centerY + Math.sin(s.angle) * 85;
    // Arrow line
    ctx.strokeStyle = s.col; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(centerX, centerY); ctx.stroke();
    ctx.globalAlpha = 1;
    // Node
    ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI*2);
    ctx.fillStyle = s.col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = 'bold 11px Inter';
    ctx.fillText(s.label, sx, sy);
  });
  // Aggregation formula
  ctx.fillStyle = '#ffc107'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText('AGREGA (promedia):', centerX, 330);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '11px monospace';
  ctx.fillText('h_v = σ(W · AVG(msgs) + b)', centerX, 350);
  ctx.fillStyle = '#ffc107'; ctx.font = 'bold 11px Inter';
  ctx.fillText("v' = [0.4, 0.5]", centerX, 375);
  // Glow
  ctx.beginPath(); ctx.arc(centerX, centerY, 28, 0, Math.PI*2);
  ctx.strokeStyle = '#ffc107'; ctx.lineWidth = 3; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
}

function drawGNNPipePhase3Static(ctx, W, H){
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(396, 40, 198, H - 55);
  const centerX = 510, centerY = 140;
  ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Capa 2: "chisme" a 2 hops', centerX, 60);
  // Center node
  ctx.beginPath(); ctx.arc(centerX, centerY, 20, 0, Math.PI*2);
  ctx.fillStyle = '#03EF62'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = 'bold 12px Inter'; ctx.textBaseline = 'middle';
  ctx.fillText('v', centerX, centerY);
  // Level 1 neighbors
  const l1 = [
    { x: centerX - 60, y: 220, label: "u1'", col: '#4ea8de' },
    { x: centerX - 20, y: 220, label: "u2'", col: '#4ea8de' },
    { x: centerX + 20, y: 220, label: "u3'", col: '#ff6b6b' },
    { x: centerX + 60, y: 220, label: "u4'", col: '#ff6b6b' },
  ];
  l1.forEach(n => {
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(centerX, 160); ctx.lineTo(n.x, n.y - 14); ctx.stroke();
    ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI*2);
    ctx.fillStyle = n.col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  });
  ctx.fillStyle = '#7c3aed'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
  ctx.fillText("u1' ya tiene info de", centerX, 265);
  ctx.fillText("SUS vecinos (2-hop de v)", centerX, 280);
  // Glow + result
  ctx.beginPath(); ctx.arc(centerX, centerY, 26, 0, Math.PI*2);
  ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 3; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
  ctx.fillText("v'' = [0.35, 0.62]", centerX, 320);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '11px Inter';
  ctx.fillText('v ahora "conoce" a', centerX, 350);
  ctx.fillText('vecinos a 2 saltos', centerX, 366);
}

function drawGNNPipePhase4Static(ctx, W, H){
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(610, 40, 140, H - 55);
  const cx = 680;
  ctx.fillStyle = '#03EF62'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Embedding de v', cx, 65);
  const finalVals = [0.35, 0.62, -0.18, 0.44];
  finalVals.forEach((v, i) => {
    const y = 100 + i * 35;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(cx - 55, y - 12, 110, 28);
    ctx.strokeStyle = '#03EF62'; ctx.lineWidth = 1; ctx.strokeRect(cx - 55, y - 12, 110, 28);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('dim ' + (i+1) + ':', cx - 48, y + 4);
    ctx.fillStyle = '#03EF62'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right';
    ctx.fillText(v.toFixed(2), cx + 48, y + 5);
    const barW = Math.abs(v) * 60;
    ctx.fillStyle = v >= 0 ? '#03EF62' : '#ff6b6b'; ctx.globalAlpha = 0.3;
    ctx.fillRect(cx - 5, y - 6, barW * (v >= 0 ? 1 : -1), 16);
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = '#ffc107'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText('vs N2V:', cx, 280);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '10px Inter';
  ctx.fillText('N2V: camina + Word2Vec', cx, 300);
  ctx.fillText('GNN: chisme + agrega', cx, 316);
  ctx.fillStyle = '#03EF62'; ctx.font = 'bold 10px Inter';
  ctx.fillText('GNN = end-to-end', cx, 340);
}

/* ================================================================
   PATCHED drawAMLGraph — stores nodes in amlNodes for hover
   ================================================================ */
const _origDrawAMLGraph = drawAMLGraph;
drawAMLGraph = function(){
  _origDrawAMLGraph();
  amlNodes = [
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
  initAMLHover();
};

/* ================================================================
   PATCHED showSection — init hover handlers when sections become visible
   ================================================================ */
const _origShowSection = showSection;
showSection = function(id){
  _origShowSection(id);
  if(id === 'n2v'){
    setTimeout(initBFSDFSHover, 300);
  }
  if(id === 'gnn_emb'){
    setTimeout(() => { initGNNMPHover(); }, 300);
  }
  if(id === 'aml'){
    setTimeout(initAMLHover, 300);
  }
  if(id === 'intro'){
    setTimeout(initAdjMatrixCanvas, 300);
  }
  if(id === 'semi_supervised'){
    setTimeout(initPlayground, 300);
  }
};

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateNavState();
  updateGlobalProgress();
  showSection('intro');
});
