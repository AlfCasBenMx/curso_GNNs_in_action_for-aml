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
    setTimeout(() => { drawBFSDFS(); drawN2VGraph(); }, 200);
  }
  if(id === 'gnn_emb'){
    setTimeout(() => { drawGNNGraph(); }, 200);
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

/* ---------- N2V Random Walk Animation ---------- */
let n2vNodes = [];
let n2vEdges = [];

function drawN2VGraph(){
  const c = document.getElementById('canvasN2VWalk');
  if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  n2vNodes = [
    { x: 350, y: 200, label: '0', color: '#03EF62' },
    { x: 200, y: 100, label: '1', color: '#4ea8de' },
    { x: 500, y: 100, label: '2', color: '#4ea8de' },
    { x: 150, y: 250, label: '3', color: '#ff6b6b' },
    { x: 250, y: 330, label: '4', color: '#ff6b6b' },
    { x: 450, y: 330, label: '5', color: '#ffc107' },
    { x: 550, y: 250, label: '6', color: '#ffc107' },
    { x: 100, y: 150, label: '7', color: '#ff6b6b' },
    { x: 600, y: 150, label: '8', color: '#ffc107' },
  ];
  n2vEdges = [[0,1],[0,2],[0,5],[1,3],[1,7],[2,6],[2,8],[3,4],[3,7],[4,5],[5,6],[6,8]];

  // Edges
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  n2vEdges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(n2vNodes[a].x, n2vNodes[a].y);
    ctx.lineTo(n2vNodes[b].x, n2vNodes[b].y);
    ctx.stroke();
  });

  // Nodes
  n2vNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 22, 0, Math.PI*2);
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

  // Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Haz clic en "Animar Random Walk" para ver una caminata desde el nodo 0', 350, 390);
}

function animateRandomWalk(){
  drawN2VGraph();
  const c = document.getElementById('canvasN2VWalk');
  if(!c) return;
  const ctx = c.getContext('2d');

  // Build adjacency
  const adj = {};
  n2vNodes.forEach((_, i) => adj[i] = []);
  n2vEdges.forEach(([a,b]) => { adj[a].push(b); adj[b].push(a); });

  // Generate random walk from node 0
  const walk = [0];
  let current = 0;
  for(let i = 0; i < 7; i++){
    const neighbors = adj[current];
    current = neighbors[Math.floor(Math.random() * neighbors.length)];
    walk.push(current);
  }

  // Animate
  let step = 0;
  function animateStep(){
    if(step >= walk.length - 1) return;
    const a = walk[step];
    const b = walk[step + 1];

    // Draw walk edge
    ctx.strokeStyle = '#03EF62';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(n2vNodes[a].x, n2vNodes[a].y);
    ctx.lineTo(n2vNodes[b].x, n2vNodes[b].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight visited node
    ctx.beginPath();
    ctx.arc(n2vNodes[b].x, n2vNodes[b].y, 26, 0, Math.PI*2);
    ctx.strokeStyle = '#03EF62';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Step number
    ctx.fillStyle = '#03EF62';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('t=' + (step+1), n2vNodes[b].x, n2vNodes[b].y - 32);

    step++;
    setTimeout(animateStep, 600);
  }

  // Show walk path as text
  ctx.fillStyle = '#03EF62';
  ctx.font = 'bold 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Walk: ' + walk.join(' \u2192 '), 350, 390);

  setTimeout(animateStep, 400);
}

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
