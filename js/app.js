/* ============================================================
   Capitulo 1 — Graph Neural Networks in Action
   Application Logic: Progress, Navigation, Quizzes, Diagrams
   ============================================================ */

// ======================== SECTION ORDER & PROGRESS ========================
var sectionOrder = ['intro','conceptos','tipos','diagramas','flujo','aplicaciones','quiz1','quiz2','flashcards','ejercicios','resumen'];
var completed = {};       // { sectionId: true }
var unlocked = { intro: true }; // intro always unlocked

// ======================== QUIZ STATE ========================
var scores = { 1: 0, 2: 0 };
var answered = { 1: 0, 2: 0 };
var totals = { 1: 12, 2: 10 };

var matrixState = [[0,0,1,0],[0,0,1,1],[1,1,0,0],[0,1,0,0]];

// ======================== PERSISTENCE ========================
function saveProgress() {
    try {
        localStorage.setItem('gnn_ch1_unlocked', JSON.stringify(unlocked));
        localStorage.setItem('gnn_ch1_completed', JSON.stringify(completed));
    } catch(e) {}
}

function loadProgress() {
    try {
        var u = localStorage.getItem('gnn_ch1_unlocked');
        var c = localStorage.getItem('gnn_ch1_completed');
        if (u) unlocked = JSON.parse(u);
        if (c) completed = JSON.parse(c);
        if (!unlocked.intro) unlocked.intro = true;
    } catch(e) {
        unlocked = { intro: true };
        completed = {};
    }
}

function resetAllProgress() {
    if (!confirm('Seguro que quieres reiniciar todo el progreso? Se perderan todos los avances.')) return;
    unlocked = { intro: true };
    completed = {};
    scores = { 1: 0, 2: 0 };
    answered = { 1: 0, 2: 0 };
    saveProgress();
    location.reload();
}

// ======================== GLOBAL PROGRESS BAR ========================
function updateGlobalProgress() {
    var total = sectionOrder.length;
    var done = 0;
    sectionOrder.forEach(function(s) { if (completed[s]) done++; });
    var pct = Math.round((done / total) * 100);
    document.getElementById('globalFill').style.width = pct + '%';
    document.getElementById('globalPct').textContent = pct + '%';
}

// ======================== NAV STATE ========================
function updateNavState() {
    var btns = document.querySelectorAll('#mainNav button');
    btns.forEach(function(btn) {
        var sec = btn.getAttribute('data-section');
        var icon = btn.querySelector('.lock-icon');
        btn.classList.remove('locked', 'completed');
        if (completed[sec]) {
            btn.classList.add('completed');
            icon.textContent = ' \u2713';
        } else if (!unlocked[sec]) {
            btn.classList.add('locked');
            icon.textContent = ' \uD83D\uDD12';
        } else {
            icon.textContent = '';
        }
    });
}

// ======================== UNLOCK NEXT SECTION ========================
function unlockNext(currentSection) {
    var idx = sectionOrder.indexOf(currentSection);
    if (idx >= 0 && idx < sectionOrder.length - 1) {
        var next = sectionOrder[idx + 1];
        unlocked[next] = true;
    }
    saveProgress();
    updateNavState();
    updateGlobalProgress();
}

// ======================== NAVIGATION ========================
function navClick(sectionId, btn) {
    if (!unlocked[sectionId]) {
        var idx = sectionOrder.indexOf(sectionId);
        var prevName = idx > 0 ? sectionOrder[idx - 1] : '';
        alert('\uD83D\uDD12 Seccion bloqueada\n\nCompleta la seccion "' + prevName + '" primero para desbloquear esta.');
        return;
    }
    showSection(sectionId);
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    // Update active nav button
    document.querySelectorAll('#mainNav button').forEach(function(b) {
        b.classList.remove('active');
        if (b.getAttribute('data-section') === id) b.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function() {
        if (id === 'diagramas') initDiagrams();
        if (id === 'tipos') initTypeDiagrams();
        if (id === 'flujo') drawMessagePassingDiagram();
        if (id === 'aplicaciones') drawApplicationDiagrams();
        if (id === 'flashcards') initFlashcards();
        if (id === 'ejercicios') { newExercise1(); initScenarios(); initTFExercise(); }
        if (id === 'resumen') { drawMindMap(); document.getElementById('finalScore1').textContent = scores[1]+'/'+totals[1]; document.getElementById('finalScore2').textContent = scores[2]+'/'+totals[2]; }
    }, 150);
}

// ======================== CHECKPOINT (content sections) ========================
function checkCP(sectionId, el, correct) {
    var cp = document.getElementById('cp-' + sectionId);
    if (cp.classList.contains('completed')) return;
    var fb = document.getElementById('cpFb-' + sectionId);
    cp.querySelectorAll('.cp-option').forEach(function(o) {
        o.classList.remove('cp-correct','cp-incorrect');
    });
    if (correct) {
        el.classList.add('cp-correct');
        fb.className = 'cp-feedback show cp-ok';
        fb.innerHTML = '\u2705 Correcto! Seccion completada. La siguiente seccion ya esta desbloqueada.';
        cp.classList.add('completed');
        cp.querySelectorAll('.cp-option').forEach(function(o) { o.style.pointerEvents = 'none'; });
        completed[sectionId] = true;
        unlockNext(sectionId);
    } else {
        el.classList.add('cp-incorrect');
        fb.className = 'cp-feedback show cp-fail';
        fb.innerHTML = '\u274C Incorrecto. Vuelve a leer la seccion e intenta de nuevo.';
        setTimeout(function() {
            el.classList.remove('cp-incorrect');
            fb.className = 'cp-feedback';
        }, 2500);
    }
}

// ======================== COMPLETE SECTION (flashcards/ejercicios) ========================
function completeSection(sectionId) {
    completed[sectionId] = true;
    unlockNext(sectionId);
    var idx = sectionOrder.indexOf(sectionId);
    if (idx < sectionOrder.length - 1) {
        showSection(sectionOrder[idx + 1]);
    }
}

// ======================== ACCORDION ========================
function toggleAccordion(header) {
    var body = header.nextElementSibling;
    var icon = header.querySelector('.accordion-icon');
    body.classList.toggle('open');
    icon.classList.toggle('open');
}

// ======================== TABS ========================
function showTab(btn, tabId) {
    btn.parentElement.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    var parent = btn.parentElement.parentElement;
    parent.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    setTimeout(function() { initTypeDiagrams(); }, 100);
}

// ======================== QUIZ ========================
function checkQuizCompletion(quizNum) {
    if (answered[quizNum] < totals[quizNum]) return;
    var required = quizNum === 1 ? 9 : 7;
    var sectionId = quizNum === 1 ? 'quiz1' : 'quiz2';
    var msgEl = document.getElementById(sectionId + 'UnlockMsg');
    if (scores[quizNum] >= required) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(5,150,105,0.15)';
        msgEl.style.borderLeft = '4px solid #059669';
        msgEl.style.color = '#6EE7B7';
        msgEl.innerHTML = '\uD83C\uDF89 Aprobado con ' + scores[quizNum] + '/' + totals[quizNum] + '! Siguiente seccion desbloqueada.';
        var cp = document.getElementById('cp-' + sectionId);
        cp.classList.add('completed');
        completed[sectionId] = true;
        unlockNext(sectionId);
    } else {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(255,107,107,0.15)';
        msgEl.style.borderLeft = '4px solid #FF6B6B';
        msgEl.style.color = '#FCA5A5';
        msgEl.innerHTML = '\uD83D\uDE15 Obtuviste ' + scores[quizNum] + '/' + totals[quizNum] + '. Necesitas al menos ' + required + '. Reinicia el quiz e intenta de nuevo.';
    }
}

function checkQ(el, correct, quizNum, explanation) {
    var q = el.parentElement;
    if (q.dataset.answered) return;
    q.dataset.answered = 'true';
    q.querySelectorAll('.option').forEach(function(o) { o.style.pointerEvents = 'none'; });
    var fb = q.querySelector('.feedback');
    if (correct) {
        el.classList.add('correct');
        fb.className = 'feedback correct-fb show';
        fb.innerHTML = explanation;
        scores[quizNum]++;
    } else {
        el.classList.add('incorrect');
        fb.className = 'feedback incorrect-fb show';
        fb.innerHTML = explanation;
        q.querySelectorAll('.option').forEach(function(o) {
            if (o.getAttribute('onclick') && o.getAttribute('onclick').indexOf(',true,') !== -1) o.classList.add('correct');
        });
    }
    answered[quizNum]++;
    document.getElementById('score' + quizNum).textContent = scores[quizNum];
    var pct = Math.round((answered[quizNum] / totals[quizNum]) * 100);
    var bar = document.getElementById('progress' + quizNum);
    bar.style.width = pct + '%';
    bar.textContent = pct + '%';
    checkQuizCompletion(quizNum);
}

function resetQuiz(num) {
    scores[num] = 0; answered[num] = 0;
    document.querySelectorAll('[data-quiz="' + num + '"]').forEach(function(q) {
        q.removeAttribute('data-answered');
        q.querySelectorAll('.option').forEach(function(o) { o.className = 'option'; o.style.pointerEvents = 'auto'; });
        q.querySelector('.feedback').className = 'feedback';
    });
    document.getElementById('score' + num).textContent = 0;
    var bar = document.getElementById('progress' + num);
    bar.style.width = '0%'; bar.textContent = '0%';
    var sectionId = num === 1 ? 'quiz1' : 'quiz2';
    var msgEl = document.getElementById(sectionId + 'UnlockMsg');
    msgEl.style.display = 'none';
    if (!completed[sectionId]) {
        var cp = document.getElementById('cp-' + sectionId);
        cp.classList.remove('completed');
    }
}

// ======================== DRAWING HELPERS ========================
function drawNode(ctx, x, y, r, color, label, textColor) {
    textColor = textColor || '#fff';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = 'bold ' + (r > 18 ? 16 : 13) + 'px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}

function drawEdge(ctx, x1, y1, x2, y2, color, width) {
    color = color || '#667eea'; width = width || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}

function drawArrow(ctx, x1, y1, x2, y2, color, nodeR) {
    color = color || '#667eea'; nodeR = nodeR || 20;
    var a = Math.atan2(y2-y1, x2-x1);
    var sx = x1 + nodeR*Math.cos(a), sy = y1 + nodeR*Math.sin(a);
    var ex = x2 - nodeR*Math.cos(a), ey = y2 - nodeR*Math.sin(a);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 12*Math.cos(a - 0.5), ey - 12*Math.sin(a - 0.5));
    ctx.lineTo(ex - 12*Math.cos(a + 0.5), ey - 12*Math.sin(a + 0.5));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

function drawEdgeLabel(ctx, x1, y1, x2, y2, label) {
    var mx = (x1+x2)/2, my = (y1+y2)/2;
    ctx.fillStyle = '#dc3545'; ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, mx, my - 10);
}

function drawCurve(ctx, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y - r - 15, 15, 0.3, Math.PI*2 - 0.3);
    ctx.strokeStyle = '#667eea'; ctx.lineWidth = 2; ctx.stroke();
}

// ======================== MAIN DIAGRAMS ========================
function initDiagrams() {
    drawMainGraph();
    drawComparisonGraphs();
    drawMatrixGraph();
}

function drawMainGraph() {
    var c = document.getElementById('mainGraph'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var nodes = [{x:150,y:100,l:'A'},{x:400,y:80,l:'B'},{x:650,y:100,l:'C'},{x:550,y:300,l:'D'},{x:250,y:300,l:'E'}];
    var edges = [[0,1],[0,4],[1,2],[1,3],[1,4],[2,3],[3,4]];
    edges.forEach(function(e) { drawEdge(ctx, nodes[e[0]].x, nodes[e[0]].y, nodes[e[1]].x, nodes[e[1]].y, '#667eea', 3); });
    nodes.forEach(function(n) { drawNode(ctx, n.x, n.y, 30, '#764ba2', n.l); });
    ctx.fillStyle = '#999'; ctx.font = '14px Arial'; ctx.textAlign = 'left';
    ctx.fillText('Grafo del libro: 5 nodos (A-E), 7 aristas', 20, 430);
}

function animateMessagePassing() {
    var c = document.getElementById('mainGraph'); if (!c) return;
    var ctx = c.getContext('2d');
    var nodes = [{x:150,y:100,l:'A'},{x:400,y:80,l:'B'},{x:650,y:100,l:'C'},{x:550,y:300,l:'D'},{x:250,y:300,l:'E'}];
    var edges = [[0,1],[0,4],[1,2],[1,3],[1,4],[2,3],[3,4]];
    var step = 0, frame = 0;

    function animate() {
        ctx.clearRect(0,0,c.width,c.height);
        edges.forEach(function(e) { drawEdge(ctx, nodes[e[0]].x, nodes[e[0]].y, nodes[e[1]].x, nodes[e[1]].y, '#ddd', 2); });
        var ae = edges[step % edges.length];
        drawEdge(ctx, nodes[ae[0]].x, nodes[ae[0]].y, nodes[ae[1]].x, nodes[ae[1]].y, '#f5576c', 5);
        var progress = (frame % 60) / 60;
        var px = nodes[ae[0]].x + (nodes[ae[1]].x - nodes[ae[0]].x) * progress;
        var py = nodes[ae[0]].y + (nodes[ae[1]].y - nodes[ae[0]].y) * progress;
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2);
        ctx.fillStyle = '#f5576c'; ctx.fill();
        nodes.forEach(function(n,i) {
            var active = i === ae[0] || i === ae[1];
            drawNode(ctx, n.x, n.y, 30, active ? '#f5576c' : '#764ba2', n.l);
        });
        ctx.fillStyle = '#333'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Message Passing: ' + nodes[ae[0]].l + ' -> ' + nodes[ae[1]].l, c.width/2, 400);
        ctx.fillStyle = '#666'; ctx.font = '14px Arial';
        ctx.fillText('El nodo ' + nodes[ae[0]].l + ' envia su informacion al nodo ' + nodes[ae[1]].l, c.width/2, 425);
        frame++;
        if (frame % 60 === 0) step++;
        if (step < edges.length) requestAnimationFrame(animate);
        else drawMainGraph();
    }
    animate();
}

function highlightPath() {
    var c = document.getElementById('mainGraph'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var nodes = [{x:150,y:100,l:'A'},{x:400,y:80,l:'B'},{x:650,y:100,l:'C'},{x:550,y:300,l:'D'},{x:250,y:300,l:'E'}];
    var edges = [[0,1],[0,4],[1,2],[1,3],[1,4],[2,3],[3,4]];
    var path = [0,1,3,4];
    edges.forEach(function(e) { drawEdge(ctx, nodes[e[0]].x, nodes[e[0]].y, nodes[e[1]].x, nodes[e[1]].y, '#ddd', 2); });
    for (var i = 0; i < path.length-1; i++) drawEdge(ctx, nodes[path[i]].x, nodes[path[i]].y, nodes[path[i+1]].x, nodes[path[i+1]].y, '#28a745', 5);
    nodes.forEach(function(n,i) { drawNode(ctx, n.x, n.y, 30, path.indexOf(i)>=0 ? '#28a745' : '#ccc', n.l); });
    ctx.fillStyle = '#28a745'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText('Camino: A -> B -> D -> E (longitud: 3)', c.width/2, 400);
}

// ======================== COMPARISON GRAPHS ========================
function drawComparisonGraphs() {
    var n = [{x:100,y:140,l:'A'},{x:210,y:60,l:'B'},{x:320,y:140,l:'C'},{x:210,y:220,l:'D'}];
    var c = document.getElementById('compUndirected'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    [[0,1],[1,2],[2,3],[3,0],[1,3]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y); });
    n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#764ba2',nd.l); });

    c = document.getElementById('compDirected'); ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    [[0,1],[1,2],[0,3],[3,2]].forEach(function(e) { drawArrow(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,'#667eea',22); });
    n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#28a745',nd.l); });

    c = document.getElementById('compWeighted'); ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var we = [[0,1,'3'],[1,2,'7'],[2,3,'2'],[3,0,'5'],[1,3,'10']];
    we.forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,'#667eea',parseInt(e[2])/2); drawEdgeLabel(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,e[2]); });
    n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#fd7e14',nd.l); });

    c = document.getElementById('compSelfLoop'); ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    [[0,1],[1,2],[2,3]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y); });
    drawCurve(ctx, n[0].x, n[0].y, 22);
    drawCurve(ctx, n[2].x, n[2].y, 22);
    n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#dc3545',nd.l); });
}

// ======================== INTERACTIVE MATRIX ========================
function toggleCell(i, j) {
    if (i === j) return;
    matrixState[i][j] = matrixState[i][j] ? 0 : 1;
    matrixState[j][i] = matrixState[i][j];
    updateMatrixDisplay();
    drawMatrixGraph();
}

function updateMatrixDisplay() {
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++) {
            var cell = document.getElementById('c'+i+j);
            if (cell) {
                cell.textContent = matrixState[i][j];
                cell.style.background = matrixState[i][j] ? '#d4edda' : 'white';
                cell.style.cursor = i===j ? 'default' : 'pointer';
            }
        }
}

function drawMatrixGraph() {
    var c = document.getElementById('matrixGraph'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var n = [{x:80,y:80,l:'A'},{x:270,y:80,l:'B'},{x:270,y:220,l:'C'},{x:80,y:220,l:'D'}];
    for (var i = 0; i < 4; i++) for (var j = i+1; j < 4; j++)
        if (matrixState[i][j]) drawEdge(ctx,n[i].x,n[i].y,n[j].x,n[j].y,'#667eea',3);
    n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#764ba2',nd.l); });
}

// ======================== TYPE DIAGRAMS ========================
function initTypeDiagrams() {
    var c, ctx;
    c = document.getElementById('canvasHomogeneo'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var n = [{x:100,y:150,l:'1'},{x:250,y:80,l:'2'},{x:400,y:150,l:'3'},{x:250,y:220,l:'4'}];
        [[0,1],[1,2],[2,3],[3,0],[0,2]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y); });
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,'#28a745',nd.l); });
    }
    c = document.getElementById('canvasHeterogeneo'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var hn = [{x:80,y:100,l:'P1',c:'#e74c3c'},{x:250,y:80,l:'E1',c:'#3498db'},{x:420,y:100,l:'P2',c:'#e74c3c'},{x:250,y:220,l:'E2',c:'#3498db'}];
        [[0,1],[1,2],[2,3],[0,3]].forEach(function(e) { drawEdge(ctx,hn[e[0]].x,hn[e[0]].y,hn[e[1]].x,hn[e[1]].y, e[0]%2===0?'#e74c3c':'#3498db'); });
        hn.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,nd.c,nd.l); });
        ctx.fillStyle='#e74c3c'; ctx.font='12px Arial'; ctx.textAlign='left';
        ctx.fillText('Rojo = Persona', 20, 270);
        ctx.fillStyle='#3498db';
        ctx.fillText('Azul = Empresa', 20, 290);
    }
    c = document.getElementById('canvasBipartito'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var left = [{x:100,y:80,l:'U1'},{x:100,y:150,l:'U2'},{x:100,y:220,l:'U3'}];
        var right = [{x:400,y:60,l:'P1'},{x:400,y:130,l:'P2'},{x:400,y:200,l:'P3'},{x:400,y:270,l:'P4'}];
        [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]].forEach(function(e) { drawEdge(ctx,left[e[0]].x,left[e[0]].y,right[e[1]].x,right[e[1]].y); });
        left.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#e74c3c',nd.l); });
        right.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#3498db',nd.l); });
    }
    c = document.getElementById('canvasCiclico'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var cn = [{x:210,y:50,l:'A'},{x:350,y:140,l:'B'},{x:300,y:250,l:'C'},{x:120,y:250,l:'D'},{x:70,y:140,l:'E'}];
        [[0,1],[1,2],[2,3],[3,4],[4,0]].forEach(function(e) { drawEdge(ctx,cn[e[0]].x,cn[e[0]].y,cn[e[1]].x,cn[e[1]].y,'#ffc107',3); });
        cn.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#fd7e14',nd.l); });
        ctx.fillStyle='#fd7e14'; ctx.font='bold 14px Arial'; ctx.textAlign='center';
        ctx.fillText('Ciclo: A-B-C-D-E-A',210,285);
    }
    c = document.getElementById('canvasAciclico'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var an = [{x:210,y:50,l:'A'},{x:120,y:140,l:'B'},{x:300,y:140,l:'C'},{x:60,y:230,l:'D'},{x:180,y:230,l:'E'},{x:350,y:230,l:'F'}];
        [[0,1],[0,2],[1,3],[1,4],[2,5]].forEach(function(e) { drawEdge(ctx,an[e[0]].x,an[e[0]].y,an[e[1]].x,an[e[1]].y); });
        an.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#17a2b8',nd.l); });
        ctx.fillStyle='#17a2b8'; ctx.font='bold 14px Arial'; ctx.textAlign='center';
        ctx.fillText('Arbol: sin ciclos posibles',210,275);
    }
    c = document.getElementById('canvasDAG'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var dn = [{x:100,y:60,l:'A'},{x:250,y:60,l:'B'},{x:400,y:60,l:'C'},{x:175,y:170,l:'D'},{x:325,y:170,l:'E'},{x:250,y:260,l:'F'}];
        [[0,1],[1,2],[0,3],[1,4],[3,5],[4,5],[2,4]].forEach(function(e) { drawArrow(ctx,dn[e[0]].x,dn[e[0]].y,dn[e[1]].x,dn[e[1]].y,'#28a745',22); });
        dn.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#28a745',nd.l); });
    }
    c = document.getElementById('canvasKnowledge'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var kn = [{x:350,y:60,l:'Depto',c:'#e74c3c'},{x:150,y:180,l:'Prof',c:'#3498db'},{x:550,y:180,l:'Est',c:'#28a745'},{x:150,y:330,l:'Paper',c:'#fd7e14'},{x:550,y:330,l:'Tema',c:'#764ba2'}];
        drawArrow(ctx,kn[0].x,kn[0].y,kn[1].x,kn[1].y,'#999',30); drawEdgeLabel(ctx,kn[0].x,kn[0].y,kn[1].x,kn[1].y,'miembro');
        drawArrow(ctx,kn[0].x,kn[0].y,kn[2].x,kn[2].y,'#999',30); drawEdgeLabel(ctx,kn[0].x,kn[0].y,kn[2].x,kn[2].y,'miembro');
        drawArrow(ctx,kn[1].x,kn[1].y,kn[2].x,kn[2].y,'#3498db',30); drawEdgeLabel(ctx,kn[1].x,kn[1].y,kn[2].x,kn[2].y,'supervisa');
        drawArrow(ctx,kn[1].x,kn[1].y,kn[3].x,kn[3].y,'#fd7e14',30); drawEdgeLabel(ctx,kn[1].x,kn[1].y,kn[3].x,kn[3].y,'escribio');
        drawArrow(ctx,kn[2].x,kn[2].y,kn[3].x,kn[3].y,'#fd7e14',30); drawEdgeLabel(ctx,kn[2].x,kn[2].y,kn[3].x,kn[3].y,'escribio');
        drawArrow(ctx,kn[3].x,kn[3].y,kn[4].x,kn[4].y,'#764ba2',30); drawEdgeLabel(ctx,kn[3].x,kn[3].y,kn[4].x,kn[4].y,'sobre');
        kn.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,30,nd.c,nd.l); });
    }
    c = document.getElementById('canvasHipergrafo'); if (c) {
        ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var hgn = [{x:100,y:100,l:'1'},{x:250,y:60,l:'2'},{x:400,y:100,l:'3'},{x:500,y:200,l:'4'},{x:350,y:280,l:'5'},{x:150,y:250,l:'6'}];
        ctx.beginPath(); ctx.moveTo(hgn[0].x,hgn[0].y); ctx.lineTo(hgn[1].x,hgn[1].y); ctx.lineTo(hgn[2].x,hgn[2].y); ctx.closePath();
        ctx.fillStyle='rgba(102,126,234,0.15)'; ctx.fill(); ctx.strokeStyle='#667eea'; ctx.lineWidth=2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hgn[2].x,hgn[2].y); ctx.lineTo(hgn[3].x,hgn[3].y); ctx.lineTo(hgn[4].x,hgn[4].y); ctx.closePath();
        ctx.fillStyle='rgba(40,167,69,0.15)'; ctx.fill(); ctx.strokeStyle='#28a745'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hgn[4].x,hgn[4].y); ctx.lineTo(hgn[5].x,hgn[5].y); ctx.lineTo(hgn[0].x,hgn[0].y); ctx.closePath();
        ctx.fillStyle='rgba(220,53,69,0.15)'; ctx.fill(); ctx.strokeStyle='#dc3545'; ctx.stroke();
        hgn.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#764ba2',nd.l); });
        ctx.fillStyle='#667eea'; ctx.font='14px Arial'; ctx.textAlign='center';
        ctx.fillText('Areas coloreadas = hiperaristas (conectan 3 nodos cada una)',300,330);
    }
}

// ======================== MESSAGE PASSING DIAGRAM ========================
function drawMessagePassingDiagram() {
    var c = document.getElementById('messagePassing'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var labels = ['Capa 1: Vecinos directos', 'Capa 2: 2-hop vecinos', 'Capa 3: Todo el grafo'];
    var colors = [['#764ba2','#ddd','#ddd','#ddd','#ddd'],['#764ba2','#764ba2','#ddd','#ddd','#ddd'],['#764ba2','#764ba2','#764ba2','#764ba2','#764ba2']];
    for (var s = 0; s < 3; s++) {
        var ox = 30 + s*270, oy = 50;
        ctx.fillStyle = '#333'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(labels[s], ox+120, oy - 10);
        var n = [{x:ox+120,y:oy+80,l:'A'},{x:ox+50,y:oy+160,l:'B'},{x:ox+190,y:oy+160,l:'C'},{x:ox+50,y:oy+250,l:'D'},{x:ox+190,y:oy+250,l:'E'}];
        [[0,1],[0,2],[1,3],[2,4]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,'#ccc',2); });
        n.forEach(function(nd,i) { drawNode(ctx,nd.x,nd.y,18,colors[s][i],nd.l); });
    }
    ctx.fillStyle = '#667eea'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center';
    ctx.fillText(String.fromCharCode(8594), 280, 200); ctx.fillText(String.fromCharCode(8594), 550, 200);
}

function startMessagePassingAnimation() {
    var c = document.getElementById('messagePassing'); if (!c) return;
    var ctx = c.getContext('2d');
    var frame = 0;
    var explain = document.getElementById('mpExplanation');
    var msgs = [
        'Paso 1: El nodo A recoge mensajes de sus vecinos directos (B y C)',
        'Paso 2: Los nodos B y C recogen mensajes de SUS vecinos (D y E)',
        'Paso 3: Ahora A tiene informacion indirecta de D y E a traves de B y C'
    ];
    function anim() {
        var step = Math.floor(frame / 60) % 3;
        drawMessagePassingDiagram();
        var ox = 30 + step*270, oy = 50;
        ctx.strokeStyle = '#f5576c'; ctx.lineWidth = 3;
        ctx.strokeRect(ox - 5, oy - 30, 250, 310);
        explain.innerHTML = '<p><strong>' + msgs[step] + '</strong></p>';
        frame++;
        if (frame < 180) requestAnimationFrame(anim);
        else { explain.innerHTML = '<p><strong>Completo! Despues de 3 capas, cada nodo tiene informacion de todo el grafo.</strong></p>'; }
    }
    anim();
}

// ======================== AML APPLICATION DIAGRAMS ========================
function drawApplicationDiagrams() {
    var c = document.getElementById('canvasFentanyl'); if (c) {
        var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var n = [{x:100,y:80,l:'Quim CN',c:'#e74c3c'},{x:300,y:60,l:'Shell Co',c:'#fd7e14'},{x:500,y:80,l:'Banco MX',c:'#3498db'},{x:600,y:200,l:'Lab MX',c:'#dc3545'},{x:350,y:200,l:'Cuenta$',c:'#28a745'},{x:100,y:200,l:'Persona',c:'#764ba2'},{x:200,y:330,l:'Dir.Envio',c:'#17a2b8'},{x:450,y:330,l:'Distrib',c:'#e83e8c'}];
        drawArrow(ctx,n[0].x,n[0].y,n[1].x,n[1].y,'#999',25); drawArrow(ctx,n[1].x,n[1].y,n[2].x,n[2].y,'#999',25);
        drawArrow(ctx,n[2].x,n[2].y,n[3].x,n[3].y,'#999',25); drawArrow(ctx,n[5].x,n[5].y,n[1].x,n[1].y,'#764ba2',25);
        drawArrow(ctx,n[4].x,n[4].y,n[0].x,n[0].y,'#28a745',25); drawArrow(ctx,n[0].x,n[0].y,n[6].x,n[6].y,'#17a2b8',25);
        drawArrow(ctx,n[3].x,n[3].y,n[7].x,n[7].y,'#e83e8c',25); drawArrow(ctx,n[7].x,n[7].y,n[4].x,n[4].y,'#28a745',25);
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,nd.c,nd.l); });
        ctx.fillStyle='#666'; ctx.font='12px Arial'; ctx.textAlign='center';
        ctx.fillText('Cadena: Proveedor China -> Shell Company -> Banco MX -> Laboratorio -> Distribucion',350,385);
    }
    c = document.getElementById('canvasOil'); if (c) {
        var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var n = [{x:80,y:100,l:'Puerto IR',c:'#e74c3c'},{x:250,y:60,l:'Buque A',c:'#3498db'},{x:420,y:100,l:'STS',c:'#fd7e14'},{x:550,y:60,l:'Buque B',c:'#3498db'},{x:650,y:150,l:'Refin.',c:'#28a745'},{x:350,y:220,l:'Trading',c:'#764ba2'},{x:150,y:280,l:'Banco',c:'#17a2b8'},{x:500,y:300,l:'Shell Co',c:'#e83e8c'}];
        drawArrow(ctx,n[0].x,n[0].y,n[1].x,n[1].y,'#999',25); drawArrow(ctx,n[1].x,n[1].y,n[2].x,n[2].y,'#999',25);
        drawArrow(ctx,n[2].x,n[2].y,n[3].x,n[3].y,'#999',25); drawArrow(ctx,n[3].x,n[3].y,n[4].x,n[4].y,'#999',25);
        drawArrow(ctx,n[5].x,n[5].y,n[6].x,n[6].y,'#17a2b8',25); drawArrow(ctx,n[7].x,n[7].y,n[5].x,n[5].y,'#764ba2',25);
        drawArrow(ctx,n[4].x,n[4].y,n[7].x,n[7].y,'#28a745',25);
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,nd.c,nd.l); });
        ctx.fillStyle='#fd7e14'; ctx.font='bold 12px Arial'; ctx.textAlign='center';
        ctx.fillText('STS = Ship-to-Ship transfer (zona gris)',420,135);
        ctx.fillStyle='#666'; ctx.font='12px Arial';
        ctx.fillText('Flujo: Puerto sancionado -> Buque fantasma -> Transfer maritima -> Refineria -> Shell company',350,385);
    }
    c = document.getElementById('canvasTrafficking'); if (c) {
        var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var n = [{x:350,y:50,l:'Tratante',c:'#dc3545'},{x:120,y:150,l:'Reclut.',c:'#e74c3c'},{x:580,y:150,l:'Call Ctr',c:'#fd7e14'},{x:80,y:280,l:'Depto 1',c:'#764ba2'},{x:250,y:280,l:'Depto 2',c:'#764ba2'},{x:420,y:280,l:'Depto 3',c:'#764ba2'},{x:600,y:280,l:'Remesa',c:'#28a745'},{x:350,y:370,l:'Victimas',c:'#999'}];
        drawArrow(ctx,n[0].x,n[0].y,n[1].x,n[1].y,'#dc3545',25); drawArrow(ctx,n[0].x,n[0].y,n[2].x,n[2].y,'#dc3545',25);
        drawArrow(ctx,n[0].x,n[0].y,n[3].x,n[3].y,'#764ba2',25); drawArrow(ctx,n[0].x,n[0].y,n[4].x,n[4].y,'#764ba2',25);
        drawArrow(ctx,n[0].x,n[0].y,n[5].x,n[5].y,'#764ba2',25); drawArrow(ctx,n[0].x,n[0].y,n[6].x,n[6].y,'#28a745',25);
        drawEdge(ctx,n[7].x,n[7].y,n[3].x,n[3].y,'#999',1); drawEdge(ctx,n[7].x,n[7].y,n[4].x,n[4].y,'#999',1); drawEdge(ctx,n[7].x,n[7].y,n[5].x,n[5].y,'#999',1);
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,nd.c,nd.l); });
        ctx.fillStyle='#666'; ctx.font='12px Arial'; ctx.textAlign='center';
        ctx.fillText('Tratante controla: reclutadores, departamentos, call centers. Victimas ubicadas en departamentos.',350,395);
    }
    c = document.getElementById('canvasTimeshare'); if (c) {
        var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var victims = [{x:80,y:80,l:'Vict.1'},{x:80,y:160,l:'Vict.2'},{x:80,y:240,l:'Vict.3'},{x:80,y:320,l:'Vict.4'}];
        var scams = [{x:350,y:100,l:'Empresa A',c:'#dc3545'},{x:350,y:250,l:'Empresa B',c:'#dc3545'}];
        var cashout = [{x:580,y:100,l:'Retiro$',c:'#fd7e14'},{x:580,y:250,l:'Retiro$',c:'#fd7e14'}];
        [[0,0],[1,0],[1,1],[2,1],[3,0],[3,1]].forEach(function(e) { drawArrow(ctx,victims[e[0]].x,victims[e[0]].y,scams[e[1]].x,scams[e[1]].y,'#667eea',22); });
        drawArrow(ctx,scams[0].x,scams[0].y,cashout[0].x,cashout[0].y,'#dc3545',25);
        drawArrow(ctx,scams[1].x,scams[1].y,cashout[1].x,cashout[1].y,'#dc3545',25);
        ctx.save(); ctx.setLineDash([6,4]); drawEdge(ctx,scams[0].x,scams[0].y,scams[1].x,scams[1].y,'#e83e8c',2); ctx.restore();
        victims.forEach(function(n) { drawNode(ctx,n.x,n.y,22,'#3498db',n.l); });
        scams.forEach(function(n) { drawNode(ctx,n.x,n.y,25,n.c,n.l); });
        cashout.forEach(function(n) { drawNode(ctx,n.x,n.y,22,n.c,n.l); });
        ctx.fillStyle='#e83e8c'; ctx.font='bold 12px Arial'; ctx.textAlign='center';
        ctx.fillText('--- = Conexion oculta (mismos duenos)',350,195);
        ctx.fillStyle='#666'; ctx.font='12px Arial';
        ctx.fillText('Bipartito: Victimas (azul) -> Empresas fachada (rojo) -> Cash out',350,385);
    }
    c = document.getElementById('canvasMules'); if (c) {
        var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
        var n = [{x:80,y:200,l:'Origen',c:'#dc3545'},{x:220,y:120,l:'Mula 1',c:'#fd7e14'},{x:220,y:280,l:'Mula 2',c:'#fd7e14'},{x:380,y:80,l:'Mula 3',c:'#fd7e14'},{x:380,y:200,l:'Mula 4',c:'#fd7e14'},{x:380,y:320,l:'Mula 5',c:'#fd7e14'},{x:540,y:200,l:'Consolid',c:'#e83e8c'},{x:660,y:200,l:'Criminal',c:'#dc3545'}];
        drawArrow(ctx,n[0].x,n[0].y,n[1].x,n[1].y,'#dc3545',25); drawArrow(ctx,n[0].x,n[0].y,n[2].x,n[2].y,'#dc3545',25);
        drawArrow(ctx,n[1].x,n[1].y,n[3].x,n[3].y,'#fd7e14',25); drawArrow(ctx,n[1].x,n[1].y,n[4].x,n[4].y,'#fd7e14',25);
        drawArrow(ctx,n[2].x,n[2].y,n[4].x,n[4].y,'#fd7e14',25); drawArrow(ctx,n[2].x,n[2].y,n[5].x,n[5].y,'#fd7e14',25);
        drawArrow(ctx,n[3].x,n[3].y,n[6].x,n[6].y,'#e83e8c',25); drawArrow(ctx,n[4].x,n[4].y,n[6].x,n[6].y,'#e83e8c',25);
        drawArrow(ctx,n[5].x,n[5].y,n[6].x,n[6].y,'#e83e8c',25); drawArrow(ctx,n[6].x,n[6].y,n[7].x,n[7].y,'#dc3545',25);
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,25,nd.c,nd.l); });
        ctx.fillStyle='#666'; ctx.font='12px Arial'; ctx.textAlign='center';
        ctx.fillText('Fan-out (1->muchos) + Capas de mulas + Fan-in (muchos->1) + Cash out final',370,385);
        ctx.fillStyle='#fd7e14'; ctx.font='bold 12px Arial';
        ctx.fillText('Cada mula retiene ~8% y pasa el resto',370,30);
    }
}

// ======================== FLASHCARDS ========================
var flashcardData = [
    {q:'Que es una mula financiera en terminos de grafo?', a:'Un NODO (cuenta bancaria) que actua como puente: recibe fondos de una fuente ilicita y los transfiere a otro destino, quedandose con 5-10% de comision'},
    {q:'Como modelas precursores de fentanilo como grafo?', a:'Grafo HETEROGENEO: nodos = empresas quimicas, cuentas, personas, direcciones. Aristas = pagos, envios, propiedad. Features = pais, volumen, SARs previos'},
    {q:'Que tipo de grafo es ideal para fraude de tiempos compartidos?', a:'BIPARTITO: un conjunto = victimas, otro = empresas fachada. Las aristas (pagos) solo van de victimas a empresas, nunca entre victimas'},
    {q:'Que es structuring (pitufeo)?', a:'Dividir depositos en montos justo bajo el umbral de reporte ($10,000). Ej: depositos de $9,500 multiples veces. En un grafo, se ve como muchas aristas pequenas hacia un mismo nodo'},
    {q:'Que es fan-out en mulas financieras?', a:'Un nodo (cuenta) envia fondos a MUCHOS destinos. En la matriz de adyacencia, la fila de ese nodo tiene muchos 1s. Indica distribucion de fondos ilicitos'},
    {q:'Que es fan-in en AML?', a:'MUCHAS cuentas envian dinero a UN solo destino. En la matriz de adyacencia, la columna de ese nodo tiene muchos 1s. Indica consolidacion de fondos'},
    {q:'Por que las GNNs superan a las reglas en AML?', a:'Las reglas ven transacciones individuales. Las GNNs ven la RED COMPLETA y detectan patrones de multiples saltos (A->B->C->D) que las reglas no pueden capturar'},
    {q:'Que es Message Passing aplicado a AML?', a:'Cada cuenta "aprende" el comportamiento de las cuentas conectadas. Si tus vecinos son sospechosos, tu tambien te vuelves sospechoso. Se propaga por la red'},
    {q:'Como se detecta contrabando de petroleo con GNNs?', a:'Grafo DAG: buques=nodos, rutas=aristas. Features: bandera, historial sanciones, AIS on/off. Detecta rutas anomalas y transferencias ship-to-ship sospechosas'},
    {q:'Que features de arista son utiles en AML?', a:'Monto, hora, dia, frecuencia, pais origen/destino, diferencia con patron historico, si es justo bajo umbral de reporte, velocidad de retiro post-deposito'},
    {q:'Que es un SAR?', a:'Suspicious Activity Report: reporte que los bancos envian al regulador cuando detectan actividad sospechosa. Los SARs previos son features valiosas para nodos'},
    {q:'Como detecta una GNN re-victimizacion en timeshare?', a:'Si una victima (nodo) tiene aristas hacia MULTIPLES empresas fachada, la GNN detecta que esta en una "lista de suckers" compartida entre estafadores'},
    {q:'Que tipo de grafo modela trafico de personas?', a:'HETEROGENEO + CICLICO: nodos = cuentas, personas, propiedades. El dinero circula ciclicamente (victima->tratante->lavado->reinversion)'},
    {q:'Que es beneficial ownership en contrabando de petroleo?', a:'El propietario real detras de empresas fachada. En un grafo, la GNN descubre que 5 empresas aparentemente separadas son controladas por la misma persona/red'},
    {q:'3 senales AML para usar GNNs', a:'1) Actores conectados en redes (mulas, supply chains) 2) Transacciones dispersas en muchas cuentas 3) Influencias indirectas (amigo de amigo sospechoso)'},
];

function initFlashcards() {
    var container = document.getElementById('flashcardsContainer');
    container.innerHTML = '';
    flashcardData.forEach(function(card, i) {
        container.innerHTML += '<div class="flashcard-container"><div class="flashcard" onclick="this.classList.toggle(\'flipped\')" id="fc'+i+'"><div class="flashcard-front"><h4>Pregunta</h4><p style="font-size:1.1em">'+card.q+'</p><small>Clic para ver respuesta</small></div><div class="flashcard-back"><h4>Respuesta</h4><p>'+card.a+'</p></div></div></div>';
    });
}

function shuffleFlashcards() {
    flashcardData.sort(function() { return Math.random() - 0.5; });
    initFlashcards();
}

function resetFlashcards() {
    document.querySelectorAll('.flashcard').forEach(function(fc) { fc.classList.remove('flipped'); });
}

// ======================== EXERCISE 1: IDENTIFY GRAPH ========================
var exerciseGraphs = [
    { type:'bipartito', draw: function(ctx) {
        var l=[{x:100,y:80,l:'A'},{x:100,y:180,l:'B'},{x:100,y:280,l:'C'}], r=[{x:450,y:100,l:'X'},{x:450,y:200,l:'Y'},{x:450,y:300,l:'Z'}];
        [[0,0],[0,1],[1,1],[1,2],[2,0],[2,2]].forEach(function(e) { drawEdge(ctx,l[e[0]].x,l[e[0]].y,r[e[1]].x,r[e[1]].y); });
        l.forEach(function(n) { drawNode(ctx,n.x,n.y,22,'#e74c3c',n.l); }); r.forEach(function(n) { drawNode(ctx,n.x,n.y,22,'#3498db',n.l); });
    }, desc:'Dos grupos de nodos con conexiones solo entre grupos'},
    { type:'dag', draw: function(ctx) {
        var n=[{x:100,y:60,l:'A'},{x:300,y:60,l:'B'},{x:500,y:60,l:'C'},{x:200,y:180,l:'D'},{x:400,y:180,l:'E'},{x:300,y:300,l:'F'}];
        [[0,3],[1,3],[1,4],[2,4],[3,5],[4,5]].forEach(function(e) { drawArrow(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,'#28a745',22); });
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#28a745',nd.l); });
    }, desc:'Flechas en una direccion, sin ciclos'},
    { type:'ciclico', draw: function(ctx) {
        var n=[{x:300,y:60,l:'A'},{x:480,y:160,l:'B'},{x:420,y:300,l:'C'},{x:180,y:300,l:'D'},{x:120,y:160,l:'E'}];
        [[0,1],[1,2],[2,3],[3,4],[4,0]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y,'#ffc107',3); });
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#fd7e14',nd.l); });
    }, desc:'Los nodos forman un ciclo cerrado'},
    { type:'homogeneo', draw: function(ctx) {
        var n=[{x:150,y:100,l:'1'},{x:350,y:80,l:'2'},{x:500,y:180,l:'3'},{x:350,y:280,l:'4'},{x:150,y:250,l:'5'}];
        [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,4]].forEach(function(e) { drawEdge(ctx,n[e[0]].x,n[e[0]].y,n[e[1]].x,n[e[1]].y); });
        n.forEach(function(nd) { drawNode(ctx,nd.x,nd.y,22,'#764ba2',nd.l); });
    }, desc:'Todos los nodos y aristas son del mismo tipo'},
];
var currentExIdx = 0;

function newExercise1() {
    currentExIdx = Math.floor(Math.random() * exerciseGraphs.length);
    var c = document.getElementById('exGraph1'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    exerciseGraphs[currentExIdx].draw(ctx);
    document.getElementById('exGraph1Desc').textContent = exerciseGraphs[currentExIdx].desc;
    document.getElementById('ex1Feedback').className = 'feedback';
}

function checkExercise1(answer) {
    var fb = document.getElementById('ex1Feedback');
    if (answer === exerciseGraphs[currentExIdx].type) {
        fb.className = 'feedback correct-fb show';
        fb.innerHTML = 'Correcto! Es un grafo <strong>' + answer + '</strong>.';
    } else {
        fb.className = 'feedback incorrect-fb show';
        fb.innerHTML = 'Incorrecto. La respuesta correcta es: <strong>' + exerciseGraphs[currentExIdx].type + '</strong>.';
    }
}

// ======================== MATRIX EXERCISE ========================
function checkMatrix() {
    var correct = [[0,1,0,1],[1,0,1,1],[0,1,0,1],[1,1,1,0]];
    var allCorrect = true;
    for (var i=0;i<4;i++) for (var j=0;j<4;j++) {
        var inp = document.getElementById('m'+i+j);
        if (parseInt(inp.value) !== correct[i][j]) { allCorrect = false; inp.style.background = '#f8d7da'; }
        else inp.style.background = '#d4edda';
    }
    var fb = document.getElementById('matrixFeedback');
    fb.className = allCorrect ? 'feedback correct-fb show' : 'feedback incorrect-fb show';
    fb.innerHTML = allCorrect ? 'Perfecto! La matriz es correcta y simetrica.' : 'Hay errores. Recuerda: A-B=1, B-C=1, C-D=1, D-A=1, B-D=1 y la matriz es simetrica.';
}

function showMatrixAnswer() {
    var correct = [[0,1,0,1],[1,0,1,1],[0,1,0,1],[1,1,1,0]];
    for (var i=0;i<4;i++) for (var j=0;j<4;j++) {
        document.getElementById('m'+i+j).value = correct[i][j];
        document.getElementById('m'+i+j).style.background = '#d4edda';
    }
}

// ======================== SCENARIOS ========================
var scenarios = [
    {text:'Detectar cadenas de mulas financieras que mueven dinero en cascada entre 5+ cuentas', answer:true, explanation:'Perfecto para GNNs! Las mulas forman cadenas en un grafo de transacciones. Message passing detecta estos patrones de cascada.'},
    {text:'Verificar si un documento de identidad tiene alteraciones digitales', answer:false, explanation:'Es analisis de imagen (CNNs). No hay estructura de grafo en un documento individual.'},
    {text:'Rastrear pagos a proveedores de precursores quimicos de fentanilo en multiples paises', answer:true, explanation:'Perfecto! Las cadenas de suministro forman un grafo heterogeneo (empresas, pagos, envios, paises). La GNN detecta patrones de abastecimiento ilicito.'},
    {text:'Calcular el score crediticio de un cliente basandose solo en su historial de pagos', answer:false, explanation:'Es ML tabular (XGBoost/regresion). Solo usa datos individuales del cliente sin relaciones con otros.'},
    {text:'Identificar buques que hacen transferencias ship-to-ship de petroleo en zonas no autorizadas', answer:true, explanation:'Perfecto! Buques=nodos, rutas=aristas, encuentros=interacciones. La GNN detecta patrones de evasion de sanciones.'},
    {text:'Detectar depositos estructurados ($9,500 repetidos) vinculados a trafico de personas', answer:true, explanation:'Perfecto! Multiples personas depositando montos similares a pocas cuentas forman un grafo bipartito sospechoso.'},
    {text:'Clasificar un email como phishing basandose en su contenido de texto', answer:false, explanation:'Es NLP/clasificacion de texto. No hay estructura de grafo en un email aislado.'},
    {text:'Detectar empresas fachada de tiempos compartidos que reciben pagos de cientos de victimas', answer:true, explanation:'Perfecto! Victimas y empresas forman un grafo bipartito. La GNN identifica concentracion anormal de pagos y re-victimizacion.'},
    {text:'Predecir si un empleado del banco cometara fraude interno basandose en sus logs de acceso y conexiones con cuentas', answer:true, explanation:'Si! Los logs forman un grafo (empleado->sistemas->cuentas). La GNN detecta accesos anomalos en el contexto de la red.'},
    {text:'Determinar el valor de mercado de una propiedad vacacional', answer:false, explanation:'Es regresion tabular (metros, ubicacion, amenities). No es un problema de grafos.'},
];

function initScenarios() {
    var container = document.getElementById('scenarioExercise');
    container.innerHTML = '';
    scenarios.forEach(function(s, i) {
        container.innerHTML += '<div style="background:#f8f9fa;padding:15px;border-radius:10px;margin:10px 0;"><p><strong>' + (i+1) + '.</strong> ' + s.text + '</p><div class="btn-group" style="justify-content:flex-start;"><button class="btn btn-success" onclick="checkScenario(' + i + ',true)" style="padding:8px 20px">Si, GNN</button><button class="btn btn-danger" onclick="checkScenario(' + i + ',false)" style="padding:8px 20px">No, otro metodo</button></div><div id="scenarioFb' + i + '" class="feedback"></div></div>';
    });
}

function checkScenario(i, answer) {
    var fb = document.getElementById('scenarioFb'+i);
    if (answer === scenarios[i].answer) {
        fb.className = 'feedback correct-fb show';
        fb.innerHTML = 'Correcto! ' + scenarios[i].explanation;
    } else {
        fb.className = 'feedback incorrect-fb show';
        fb.innerHTML = 'Incorrecto. ' + scenarios[i].explanation;
    }
}

// ======================== DEGREE EXERCISE ========================
function checkDegree() {
    var correct = {a:2,b:4,c:2,d:3,e:3};
    var allCorrect = true;
    ['a','b','c','d','e'].forEach(function(n) {
        var val = parseInt(document.getElementById('deg_'+n).value);
        var r = document.getElementById('deg_'+n+'_r');
        if (val === correct[n]) { r.textContent = 'Correcto!'; r.style.color = '#28a745'; }
        else { r.textContent = 'Incorrecto (es ' + correct[n] + ')'; r.style.color = '#dc3545'; allCorrect = false; }
    });
    var fb = document.getElementById('degreeFeedback');
    fb.className = allCorrect ? 'feedback correct-fb show' : 'feedback incorrect-fb show';
    fb.innerHTML = allCorrect ? 'Perfecto! Todos los grados son correctos.' : 'Revisa los errores. Grado = numero de aristas conectadas al nodo.';
}

function showDegreeAnswer() {
    var correct = {a:2,b:4,c:2,d:3,e:3};
    ['a','b','c','d','e'].forEach(function(n) {
        document.getElementById('deg_'+n).value = correct[n];
        document.getElementById('deg_'+n+'_r').textContent = correct[n];
        document.getElementById('deg_'+n+'_r').style.color = '#28a745';
    });
}

// ======================== TRUE/FALSE EXERCISE ========================
var tfQuestions = [
    {q:'Un modelo basado en reglas puede detectar cadenas de mulas de 4+ saltos igual de bien que una GNN.', a:false, exp:'Falso! Las reglas trabajan transaccion por transaccion. Las GNNs propagan informacion por multiples saltos via message passing, viendo la cadena completa.'},
    {q:'En un grafo de fraude timeshare, las victimas y las empresas fachada forman un grafo bipartito.', a:true, exp:'Correcto! Las victimas solo pagan a empresas (nunca entre victimas). Dos conjuntos con conexiones solo entre ellos = bipartito.'},
    {q:'El contrabando de petroleo se modela mejor como grafo homogeneo porque todos son barcos.', a:false, exp:'Falso! Involucra buques, puertos, empresas trading, cuentas, personas. Multiples tipos = grafo heterogeneo.'},
    {q:'El structuring (pitufeo) crea un patron de fan-in visible en un grafo de transacciones.', a:true, exp:'Correcto! Muchos depositos pequenos de multiples fuentes hacia una cuenta = fan-in. La GNN lo detecta como anomalia.'},
    {q:'Las GNNs necesitan que le digas las reglas de AML para funcionar.', a:false, exp:'Falso! Las GNNs APRENDEN los patrones automaticamente de los datos etiquetados. No necesitan reglas explicitas.'},
    {q:'Un DAG es ideal para modelar el flujo de contrabando de petroleo porque el crudo fluye en una direccion.', a:true, exp:'Correcto! Extraccion->transporte->refineria->venta. Flujo unidireccional sin ciclos = DAG.'},
    {q:'En trafico de personas, el dinero nunca circula de vuelta al tratante.', a:false, exp:'Falso! El dinero circula ciclicamente: se reinvierte en mas trafico. Por eso el grafo es CICLICO.'},
    {q:'Message passing en AML significa que si tus vecinos transaccionales son sospechosos, tu riesgo aumenta.', a:true, exp:'Correcto! Message passing propaga "sospecha" por la red. Una cuenta limpia conectada a 5 mulas heredara un embedding de alto riesgo.'},
    {q:'Los embeddings de una GNN pueden capturar si una cuenta es mula incluso sin features del titular.', a:true, exp:'Correcto! Aunque no sepas nada del titular, la ESTRUCTURA de conexiones (a quien transfiere, de quien recibe) genera un embedding que revela el patron de mula.'},
    {q:'Un grafo bipartito de timeshare tiene matriz de adyacencia simetrica.', a:false, exp:'Falso! Los pagos van de victima->empresa (dirigido). La matriz NO es simetrica porque la victima paga pero la empresa no le devuelve.'},
];

function initTFExercise() {
    var container = document.getElementById('tfExercise');
    container.innerHTML = '<p>Indica si cada afirmacion es Verdadera o Falsa:</p>';
    tfQuestions.forEach(function(q, i) {
        container.innerHTML += '<div style="background:#f8f9fa;padding:15px;border-radius:10px;margin:10px 0;"><p><strong>' + (i+1) + '.</strong> ' + q.q + '</p><div class="btn-group" style="justify-content:flex-start;"><button class="btn btn-success" onclick="checkTF(' + i + ',true)" style="padding:8px 20px">Verdadero</button><button class="btn btn-danger" onclick="checkTF(' + i + ',false)" style="padding:8px 20px">Falso</button></div><div id="tfFb' + i + '" class="feedback"></div></div>';
    });
}

function checkTF(i, answer) {
    var fb = document.getElementById('tfFb'+i);
    if (answer === tfQuestions[i].a) {
        fb.className = 'feedback correct-fb show';
    } else {
        fb.className = 'feedback incorrect-fb show';
    }
    fb.innerHTML = tfQuestions[i].exp;
}

// ======================== MIND MAP ========================
function drawMindMap() {
    var c = document.getElementById('mindMap'); if (!c) return;
    var ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    var center = {x:450,y:250};
    drawNode(ctx,center.x,center.y,50,'#667eea','Cap. 1');
    var branches = [
        {x:150,y:80,l:'Grafos',c:'#764ba2',children:[{x:50,y:30,l:'Nodos'},{x:50,y:130,l:'Aristas'}]},
        {x:750,y:80,l:'GNNs',c:'#28a745',children:[{x:850,y:30,l:'Msg Pass'},{x:850,y:130,l:'Embed'}]},
        {x:150,y:420,l:'Tipos',c:'#fd7e14',children:[{x:30,y:380,l:'Homo'},{x:30,y:460,l:'Hetero'},{x:150,y:490,l:'Bipart.'}]},
        {x:750,y:420,l:'AML',c:'#dc3545',children:[{x:870,y:370,l:'Mulas'},{x:870,y:420,l:'Fentanilo'},{x:870,y:470,l:'Petroleo'}]},
        {x:450,y:50,l:'Banca',c:'#17a2b8',children:[]},
        {x:450,y:450,l:'Trafico',c:'#e83e8c',children:[]},
    ];
    branches.forEach(function(b) {
        drawEdge(ctx,center.x,center.y,b.x,b.y,'#ddd',2);
        drawNode(ctx,b.x,b.y,30,b.c,b.l);
        b.children.forEach(function(ch) {
            drawEdge(ctx,b.x,b.y,ch.x,ch.y,'#eee',1);
            drawNode(ctx,ch.x,ch.y,22,'#999',ch.l);
        });
    });
}

// ======================== INIT ========================
window.onload = function() {
    loadProgress();
    updateNavState();
    updateGlobalProgress();
    updateMatrixDisplay();

    // Restore checkpoint UI for already completed sections
    sectionOrder.forEach(function(sec) {
        if (completed[sec]) {
            var cp = document.getElementById('cp-' + sec);
            if (cp) {
                cp.classList.add('completed');
                cp.querySelectorAll('.cp-option').forEach(function(o) { o.style.pointerEvents = 'none'; });
                var fb = document.getElementById('cpFb-' + sec);
                if (fb) {
                    fb.className = 'cp-feedback show cp-ok';
                    fb.innerHTML = '\u2705 Seccion completada.';
                }
            }
        }
    });

    // Show the first unlocked but not completed section, or the last completed
    var startSection = 'intro';
    for (var i = 0; i < sectionOrder.length; i++) {
        if (unlocked[sectionOrder[i]] && !completed[sectionOrder[i]]) {
            startSection = sectionOrder[i];
            break;
        }
        if (completed[sectionOrder[i]]) startSection = sectionOrder[i];
    }
    showSection(startSection);
};
