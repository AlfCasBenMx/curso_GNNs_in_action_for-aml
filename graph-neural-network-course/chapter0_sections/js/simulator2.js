/**
 * Simulador Completo de Red Neuronal (Simulator 2)
 * Con: Batches, Feature Engineering, SGD con mini-batches, Visualización de probabilidades
 */
(function() {
  // === ESTADO DEL SIMULADOR 2 ===
  let weights2 = { layers: [] };
  let lossHistory2 = [];
  let valLossHistory2 = [];
  let trainAccHistory2 = [];
  let valAccHistory2 = [];
  let isTraining2 = false;
  let trainInterval2 = null;
  let dataset2 = [];
  let trainSet2 = [];
  let valSet2 = [];
  let batchSize2 = 4;
  let currentBatchIndices = [];
  
  // Features activas (x1, x2 siempre disponibles, las demás son opcionales)
  let activeFeatures2 = { x1: true, x2: true, x1x2: false, x1sq: false, x2sq: false, sinx1: false, sinx2: false };
  const featureLabels2 = { x1: 'x₁', x2: 'x₂', x1x2: 'x₁x₂', x1sq: 'x₁²', x2sq: 'x₂²', sinx1: 'sin(x₁)', sinx2: 'sin(x₂)' };
  
  function toggleFeature2(feat) {
    activeFeatures2[feat] = !activeFeatures2[feat];
    
    // Actualizar UI del botón
    const btn = document.getElementById(`sim2Feat_${feat}`);
    if (activeFeatures2[feat]) {
      btn.style.background = '#8b5cf6';
      btn.style.color = 'white';
    } else {
      btn.style.background = 'transparent';
      btn.style.color = '#c4b5fd';
    }
    
    // Actualizar contador
    const count = Object.values(activeFeatures2).filter(v => v).length;
    document.getElementById('sim2FeatCount').textContent = `${count} feature${count !== 1 ? 's' : ''} activa${count !== 1 ? 's' : ''}`;
    
    // Regenerar pesos y redibujar
    generateWeights2();
    drawNetwork2();
    drawDataset2();
  }
  
  function getActiveFeatures2() {
    return Object.keys(activeFeatures2).filter(k => activeFeatures2[k]);
  }
  
  function computeFeatures2(x1, x2) {
    // Transforma coordenadas raw (x1, x2) en vector de features según las activas
    const features = [];
    if (activeFeatures2.x1) features.push(x1);
    if (activeFeatures2.x2) features.push(x2);
    if (activeFeatures2.x1x2) features.push(x1 * x2);
    if (activeFeatures2.x1sq) features.push(x1 * x1);
    if (activeFeatures2.x2sq) features.push(x2 * x2);
    if (activeFeatures2.sinx1) features.push(Math.sin(x1 * Math.PI));
    if (activeFeatures2.sinx2) features.push(Math.sin(x2 * Math.PI));
    return features;
  }
  
  // === CONFIGURACIÓN ===
  function getConfig2() {
    const numFeatures = getActiveFeatures2().length;
    return {
      numInputs: numFeatures, // Dinámico según features activas
      numLayers: parseInt(document.getElementById('sim2Layers').value),
      numNeurons: parseInt(document.getElementById('sim2Neurons').value),
      numOutputs: 1, // Clasificación binaria
      mode: document.getElementById('sim2Mode').value
    };
  }
  
  // === GENERAR DATASET ===
  function generateDataset2() {
    const numPoints = parseInt(document.getElementById('sim2NumPoints').value);
    const pattern = document.getElementById('sim2Pattern').value;
    dataset2 = [];
    
    // Limpiar historiales al regenerar dataset
    lossHistory2 = [];
    valLossHistory2 = [];
    trainAccHistory2 = [];
    valAccHistory2 = [];
    
    for (let i = 0; i < numPoints; i++) {
      let x1, x2, label;
      
      switch(pattern) {
        case 'xor':
          x1 = (Math.random() - 0.5) * 2;
          x2 = (Math.random() - 0.5) * 2;
          label = (x1 * x2 > 0) ? 1 : 0;
          break;
        case 'circles':
          const r = Math.random() > 0.5 ? 0.3 + Math.random() * 0.2 : 0.7 + Math.random() * 0.2;
          const angle = Math.random() * Math.PI * 2;
          x1 = Math.cos(angle) * r;
          x2 = Math.sin(angle) * r;
          label = r < 0.5 ? 0 : 1;
          break;
        case 'linear':
          x1 = (Math.random() - 0.5) * 2;
          x2 = (Math.random() - 0.5) * 2;
          label = (x1 + x2 > 0) ? 1 : 0;
          break;
        case 'spiral':
          const t = (i / numPoints) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
          const rSpiral = t / (2 * Math.PI) * 0.8 + 0.1;
          if (i % 2 === 0) {
            x1 = Math.cos(t) * rSpiral;
            x2 = Math.sin(t) * rSpiral;
            label = 0;
          } else {
            x1 = Math.cos(t + Math.PI) * rSpiral;
            x2 = Math.sin(t + Math.PI) * rSpiral;
            label = 1;
          }
          break;
      }
      
      dataset2.push({ x: [x1, x2], y: label });
    }
    
    // Dividir en train (80%) y validation (20%)
    splitTrainVal2();
    
    document.getElementById('sim2DataInfo').textContent = `${numPoints} puntos (${trainSet2.length} train / ${valSet2.length} val)`;
    updateBatchInfo2();
    drawDataset2();
  }
  
  // === DIVIDIR TRAIN / VALIDATION ===
  function splitTrainVal2() {
    // Shuffle dataset
    const shuffled = [...dataset2].sort(() => Math.random() - 0.5);
    const splitIdx = Math.floor(shuffled.length * 0.8);
    trainSet2 = shuffled.slice(0, splitIdx);
    valSet2 = shuffled.slice(splitIdx);
  }
  
  // === BATCH SIZE LOGIC ===
  function setBatchSize2(size) {
    batchSize2 = size === 'all' ? dataset2.length : parseInt(size);
    
    // Update button styles
    document.querySelectorAll('.sim2BatchBtn').forEach(btn => {
      const btnSize = btn.dataset.batch;
      if ((btnSize === 'all' && batchSize2 === dataset2.length) || parseInt(btnSize) === batchSize2) {
        btn.style.background = 'rgba(16,185,129,0.3)';
        btn.style.color = 'white';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#34d399';
      }
    });
    
    updateBatchInfo2();
  }
  
  function updateBatchInfo2() {
    const itersPerEpoch = Math.ceil(dataset2.length / batchSize2);
    let batchType = 'Mini-batch';
    if (batchSize2 === 1) batchType = 'SGD (Estocástico)';
    else if (batchSize2 >= dataset2.length) batchType = 'Full Batch';
    
    document.getElementById('sim2BatchInfo').textContent = 
      `${batchType}: ${batchSize2} puntos → ${itersPerEpoch} iteración(es)/época`;
  }
  
  // === GENERAR PESOS ===
  function generateWeights2() {
    const config = getConfig2();
    weights2.layers = [];
    
    let prevSize = config.numInputs;
    
    // Capas ocultas
    for (let l = 0; l < config.numLayers; l++) {
      const layer = { weights: [], biases: [] };
      for (let n = 0; n < config.numNeurons; n++) {
        const neuronWeights = [];
        for (let p = 0; p < prevSize; p++) {
          neuronWeights.push((Math.random() - 0.5) * 2);
        }
        layer.weights.push(neuronWeights);
        layer.biases.push((Math.random() - 0.5) * 0.5);
      }
      weights2.layers.push(layer);
      prevSize = config.numNeurons;
    }
    
    // Capa de salida
    const outputLayer = { weights: [], biases: [] };
    const neuronWeights = [];
    for (let p = 0; p < prevSize; p++) {
      neuronWeights.push((Math.random() - 0.5) * 2);
    }
    outputLayer.weights.push(neuronWeights);
    outputLayer.biases.push((Math.random() - 0.5) * 0.5);
    weights2.layers.push(outputLayer);
    
    lossHistory2 = [];
    document.getElementById('sim2Epoch').textContent = '0';
    drawLossChart2();
  }
  
  // === FUNCIONES DE ACTIVACIÓN ===
  function getActivation2(layerIndex) {
    const selector = document.getElementById(`sim2Act${layerIndex}`);
    return selector ? selector.value : 'relu';
  }
  
  function applyActivation2(x, type) {
    switch(type) {
      case 'relu': return Math.max(0, x);
      case 'sigmoid': return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
      case 'tanh': return Math.tanh(x);
      case 'leaky': return x > 0 ? x : 0.01 * x;
      case 'linear': return x;
      default: return Math.max(0, x);
    }
  }
  
  function activationDerivative2(x, type) {
    switch(type) {
      case 'relu': return x > 0 ? 1 : 0;
      case 'sigmoid': const s = 1 / (1 + Math.exp(-x)); return s * (1 - s);
      case 'tanh': return 1 - Math.pow(Math.tanh(x), 2);
      case 'leaky': return x > 0 ? 1 : 0.01;
      case 'linear': return 1;
      default: return x > 0 ? 1 : 0;
    }
  }
  
  // === FORWARD PASS (para un punto) ===
  // inputs puede ser [x1, x2] raw o ya features computadas
  function forwardPass2(inputs, rawInput = true) {
    const config = getConfig2();
    const isRegression = config.mode === 'regression';
    
    // Si es input raw (x1, x2), computar features
    const features = rawInput ? computeFeatures2(inputs[0], inputs[1]) : inputs;
    
    let layerActivations = [features];
    let layerZ = [];
    let current = features;
    
    for (let l = 0; l < weights2.layers.length; l++) {
      const layer = weights2.layers[l];
      const isOutputLayer = l === weights2.layers.length - 1;
      const activation = isOutputLayer ? (isRegression ? 'linear' : 'sigmoid') : getActivation2(l);
      const zValues = [];
      const activations = [];
      
      for (let n = 0; n < layer.weights.length; n++) {
        let z = layer.biases[n];
        for (let p = 0; p < current.length; p++) {
          z += current[p] * layer.weights[n][p];
        }
        zValues.push(z);
        activations.push(applyActivation2(z, activation));
      }
      
      layerZ.push(zValues);
      layerActivations.push(activations);
      current = activations;
    }
    
    return { layerActivations, layerZ, output: current[0] };
  }
  
  // === COMPUTE LOSS (todo el dataset) ===
  function computeTotalLoss2() {
    if (dataset2.length === 0) return 0;
    
    const config = getConfig2();
    const isRegression = config.mode === 'regression';
    let totalLoss = 0;
    
    for (const point of dataset2) {
      const { output } = forwardPass2(point.x);
      const target = point.y;
      
      if (isRegression) {
        totalLoss += Math.pow(output - target, 2);
      } else {
        const p = Math.max(0.0001, Math.min(0.9999, output));
        totalLoss -= target * Math.log(p) + (1 - target) * Math.log(1 - p);
      }
    }
    
    return totalLoss / dataset2.length;
  }
  
  // === TRAINING STEP (un batch) ===
  function trainBatch2(batchIndices) {
    const config = getConfig2();
    const lr = parseFloat(document.getElementById('sim2LR').value);
    const isRegression = config.mode === 'regression';
    
    // Acumular gradientes
    const gradients = weights2.layers.map(layer => ({
      weights: layer.weights.map(w => w.map(() => 0)),
      biases: layer.biases.map(() => 0)
    }));
    
    for (const idx of batchIndices) {
      const point = dataset2[idx];
      const { layerActivations, layerZ, output } = forwardPass2(point.x);
      
      // Output gradient
      let delta = output - point.y;
      
      // Backprop
      for (let l = weights2.layers.length - 1; l >= 0; l--) {
        const layer = weights2.layers[l];
        const prevActivations = layerActivations[l];
        
        // Acumular gradientes para este layer
        for (let n = 0; n < layer.weights.length; n++) {
          for (let p = 0; p < layer.weights[n].length; p++) {
            gradients[l].weights[n][p] += delta * prevActivations[p];
          }
          gradients[l].biases[n] += delta;
        }
        
        // Propagar delta hacia atrás
        if (l > 0) {
          const newDelta = [];
          for (let p = 0; p < prevActivations.length; p++) {
            let d = 0;
            for (let n = 0; n < layer.weights.length; n++) {
              d += (l === weights2.layers.length - 1 ? delta : delta) * layer.weights[n][p];
            }
            const z = layerZ[l-1][p];
            const prevAct = getActivation2(l-1);
            newDelta.push(d * activationDerivative2(z, prevAct));
          }
          delta = newDelta[0]; // Para una neurona de salida
        }
      }
    }
    
    // Aplicar gradientes promedio
    const batchLen = batchIndices.length;
    for (let l = 0; l < weights2.layers.length; l++) {
      for (let n = 0; n < weights2.layers[l].weights.length; n++) {
        for (let p = 0; p < weights2.layers[l].weights[n].length; p++) {
          weights2.layers[l].weights[n][p] -= lr * gradients[l].weights[n][p] / batchLen;
        }
        weights2.layers[l].biases[n] -= lr * gradients[l].biases[n] / batchLen;
      }
    }
  }
  
  // === DRAW DATASET ===
  function drawDataset2(highlightIndices = []) {
    const canvas = document.getElementById('sim2DataCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    
    // Clear and draw background with decision boundary
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    
    // Draw decision boundary (grid of predictions) - alta resolución para nube suave
    const resolution = 50;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x1 = (i / resolution) * 2 - 1;
        const x2 = (j / resolution) * 2 - 1;
        
        if (weights2.layers.length > 0) {
          const { output } = forwardPass2([x1, x2]);
          // Más contraste en la nube de probabilidades
          const alpha = Math.abs(output - 0.5) * 0.6;
          ctx.fillStyle = output > 0.5 
            ? `rgba(239, 68, 68, ${alpha})` 
            : `rgba(59, 130, 246, ${alpha})`;
          ctx.fillRect(
            (x1 + 1) / 2 * w - w/resolution/2, 
            (1 - (x2 + 1) / 2) * h - h/resolution/2, 
            w / resolution + 1, 
            h / resolution + 1
          );
        }
      }
    }
    
    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
    
    // Draw data points
    for (let i = 0; i < dataset2.length; i++) {
      const point = dataset2[i];
      const px = (point.x[0] + 1) / 2 * w;
      const py = (1 - (point.x[1] + 1) / 2) * h;
      
      const isHighlighted = highlightIndices.includes(i);
      
      ctx.beginPath();
      ctx.arc(px, py, isHighlighted ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = point.y === 1 ? '#ef4444' : '#3b82f6';
      ctx.fill();
      
      if (isHighlighted) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }
  
  // === DRAW NETWORK ===
  function drawNetwork2() {
    const config = getConfig2();
    const svg = document.getElementById('sim2Svg');
    const activeFeats = getActiveFeatures2();
    
    // Usar punto del batch actual si existe, sino primer punto del dataset
    let samplePoint;
    let sampleIdx = 0;
    if (currentBatchIndices.length > 0) {
      sampleIdx = currentBatchIndices[0];
      samplePoint = dataset2[sampleIdx] || { x: [0, 0], y: 0 };
    } else {
      samplePoint = dataset2[0] || { x: [0, 0], y: 0 };
    }
    const { layerActivations, output } = forwardPass2(samplePoint.x);
    
    const layers = [config.numInputs];
    for (let i = 0; i < config.numLayers; i++) layers.push(config.numNeurons);
    layers.push(1);
    
    const width = 450, height = 280;
    const layerSpacing = width / (layers.length + 1);
    
    let html = '';
    const positions = [];
    
    for (let l = 0; l < layers.length; l++) {
      const x = layerSpacing * (l + 1);
      const neurons = layers[l];
      const neuronSpacing = Math.min(35, (height - 60) / Math.max(neurons, 1));
      const startY = (height - (neurons - 1) * neuronSpacing) / 2;
      
      const layerPos = [];
      for (let n = 0; n < neurons; n++) {
        layerPos.push({ x, y: startY + n * neuronSpacing });
      }
      positions.push(layerPos);
    }
    
    // Draw connections
    for (let l = 1; l < layers.length; l++) {
      const layerWeights = weights2.layers[l - 1];
      for (let n = 0; n < positions[l].length; n++) {
        for (let p = 0; p < positions[l-1].length; p++) {
          const w = layerWeights.weights[n][p];
          const color = w > 0 ? '#22c55e' : '#ef4444';
          const strokeWidth = Math.min(3, Math.abs(w) * 1.5);
          html += `<line x1="${positions[l-1][p].x}" y1="${positions[l-1][p].y}" 
                   x2="${positions[l][n].x}" y2="${positions[l][n].y}" 
                   stroke="${color}" stroke-width="${strokeWidth}" opacity="0.5"/>`;
        }
      }
    }
    
    // Draw neurons
    const colors = ['#3b82f6', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef'];
    
    for (let l = 0; l < layers.length; l++) {
      const isOutput = l === layers.length - 1;
      const isInput = l === 0;
      const color = isOutput ? '#f59e0b' : colors[Math.min(l, colors.length - 1)];
      
      for (let n = 0; n < positions[l].length; n++) {
        const pos = positions[l][n];
        const activation = layerActivations[l] ? layerActivations[l][n] : 0;
        const displayVal = activation.toFixed(2);
        
        // Highlight input neurons with data info
        if (isInput) {
          html += `<circle cx="${pos.x}" cy="${pos.y}" r="16" fill="${color}" stroke="#fbbf24" stroke-width="3"/>`;
        } else {
          html += `<circle cx="${pos.x}" cy="${pos.y}" r="14" fill="${color}" stroke="white" stroke-width="2"/>`;
        }
        html += `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${displayVal}</text>`;
        
        // Add feature labels for inputs
        if (isInput && n < activeFeats.length) {
          const featLabel = featureLabels2[activeFeats[n]];
          html += `<text x="${pos.x - 25}" y="${pos.y + 4}" text-anchor="end" fill="#93c5fd" font-size="7">${featLabel}</text>`;
        }
      }
    }
    
    // Labels
    const batchInfo = currentBatchIndices.length > 0 ? ` (punto ${sampleIdx + 1})` : '';
    html += `<text x="${positions[0][0].x}" y="18" text-anchor="middle" fill="#3b82f6" font-size="10" font-weight="bold">Input${batchInfo}</text>`;
    html += `<text x="${positions[positions.length-1][0].x}" y="18" text-anchor="middle" fill="#f59e0b" font-size="10">Output</text>`;
    
    // Show prediction vs target
    const prediction = output > 0.5 ? 1 : 0;
    const target = samplePoint.y;
    const isCorrect = prediction === target;
    const predColor = isCorrect ? '#22c55e' : '#ef4444';
    html += `<text x="${positions[positions.length-1][0].x}" y="${height - 10}" text-anchor="middle" fill="${predColor}" font-size="9">
      Pred: ${prediction} | Target: ${target} ${isCorrect ? '✓' : '✗'}
    </text>`;
    
    svg.innerHTML = html;
  }
  
  // === DRAW LOSS CHART ===
  function drawLossChart2() {
    const canvas = document.getElementById('sim2LossChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    
    if (lossHistory2.length < 2) return;
    
    // Encontrar el rango combinado de train y val loss
    const allLosses = [...lossHistory2, ...valLossHistory2];
    const maxLoss = Math.max(...allLosses);
    const minLoss = Math.min(...allLosses);
    const range = maxLoss - minLoss || 1;
    
    // Dibujar Train Loss (rojo)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < lossHistory2.length; i++) {
      const x = (i / (lossHistory2.length - 1)) * w;
      const y = h - ((lossHistory2[i] - minLoss) / range) * (h - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar Val Loss (naranja)
    if (valLossHistory2.length >= 2) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let i = 0; i < valLossHistory2.length; i++) {
        const x = (i / (valLossHistory2.length - 1)) * w;
        const y = h - ((valLossHistory2[i] - minLoss) / range) * (h - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  
  // === DRAW ACCURACY CHART ===
  function drawAccChart2() {
    const canvas = document.getElementById('sim2AccChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    
    if (trainAccHistory2.length < 2) return;
    
    // Accuracy siempre va de 0 a 100
    const minAcc = 0;
    const maxAcc = 100;
    const range = maxAcc - minAcc;
    
    // Dibujar Train Accuracy (verde)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < trainAccHistory2.length; i++) {
      const x = (i / (trainAccHistory2.length - 1)) * w;
      const y = h - ((trainAccHistory2[i] - minAcc) / range) * (h - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar Val Accuracy (azul)
    if (valAccHistory2.length >= 2) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let i = 0; i < valAccHistory2.length; i++) {
        const x = (i / (valAccHistory2.length - 1)) * w;
        const y = h - ((valAccHistory2[i] - minAcc) / range) * (h - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Línea de referencia al 50%
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    const y50 = h - ((50 - minAcc) / range) * (h - 10) - 5;
    ctx.moveTo(0, y50);
    ctx.lineTo(w, y50);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // === UI UPDATE ===
  function updateUI2() {
    const config = getConfig2();
    
    document.getElementById('sim2InputsVal').textContent = config.numInputs;
    document.getElementById('sim2LayersVal').textContent = config.numLayers;
    document.getElementById('sim2NeuronsVal').textContent = config.numNeurons;
    document.getElementById('sim2OutputsVal').textContent = config.numOutputs;
    
    // Activation selectors
    const actPanel = document.getElementById('sim2ActivationSelectors');
    actPanel.innerHTML = '';
    for (let l = 0; l < config.numLayers; l++) {
      const div = document.createElement('div');
      div.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
      div.innerHTML = `
        <span style="font-size: 0.7em; color: #c084fc;">Capa ${l+1}</span>
        <select id="sim2Act${l}" style="padding: 4px; border-radius: 4px; background: #1e1e2e; color: white; border: 1px solid #a855f7; font-size: 0.75em;">
          <option value="relu">ReLU</option>
          <option value="sigmoid">Sigmoid</option>
          <option value="tanh">Tanh</option>
          <option value="leaky">Leaky</option>
        </select>
      `;
      actPanel.appendChild(div);
    }
    
    if (config.numLayers === 0) {
      actPanel.innerHTML = '<span style="color: #9ca3af; font-size: 0.8em;">Sin capas ocultas</span>';
    }
    
    setTimeout(() => {
      for (let l = 0; l < config.numLayers; l++) {
        const el = document.getElementById(`sim2Act${l}`);
        if (el) el.addEventListener('change', updateAll2);
      }
    }, 50);
    
    // Update layer selector for space transformation visualization
    updateLayerSelector2();
  }
  
  // === UPDATE ALL ===
  function updateAll2() {
    drawDataset2(currentBatchIndices);
    drawNetwork2();
    drawSpaceTransformation2();
    
    const loss = computeTotalLoss2();
    document.getElementById('sim2TrainStatus').textContent = `Loss: ${loss.toFixed(4)} | Accuracy: ${computeAccuracy2().toFixed(1)}%`;
  }

  // === DRAW SPACE TRANSFORMATION ===
  function drawSpaceTransformation2() {
    const canvasOrig = document.getElementById('sim2SpaceOriginal');
    const canvasTrans = document.getElementById('sim2SpaceTransformed');
    const layerSelect = document.getElementById('sim2LayerSelect');
    
    if (!canvasOrig || !canvasTrans) return;
    
    const ctxOrig = canvasOrig.getContext('2d');
    const ctxTrans = canvasTrans.getContext('2d');
    const w = canvasOrig.width, h = canvasOrig.height;
    
    // Clear canvases
    ctxOrig.fillStyle = '#0f172a';
    ctxOrig.fillRect(0, 0, w, h);
    ctxTrans.fillStyle = '#0f172a';
    ctxTrans.fillRect(0, 0, w, h);
    
    if (dataset2.length === 0) return;
    
    // Get selected layer
    const selectedLayer = layerSelect ? layerSelect.value : 'input';
    const config = getConfig2();
    
    // Draw axes on original canvas
    ctxOrig.strokeStyle = '#334155';
    ctxOrig.lineWidth = 1;
    ctxOrig.beginPath();
    ctxOrig.moveTo(w/2, 0); ctxOrig.lineTo(w/2, h);
    ctxOrig.moveTo(0, h/2); ctxOrig.lineTo(w, h/2);
    ctxOrig.stroke();
    
    // Collect transformed points
    let transformedPoints = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (const point of dataset2) {
      const { layerActivations } = forwardPass2(point.x);
      
      let coords;
      if (selectedLayer === 'input') {
        coords = [point.x[0], point.x[1]];
      } else {
        const layerIdx = parseInt(selectedLayer);
        const activation = layerActivations[layerIdx + 1]; // +1 porque index 0 es input
        
        if (activation && activation.length >= 2) {
          coords = [activation[0], activation[1]];
        } else if (activation && activation.length === 1) {
          coords = [activation[0], 0];
        } else {
          coords = [0, 0];
        }
      }
      
      transformedPoints.push({ coords, label: point.y, orig: point.x });
      minX = Math.min(minX, coords[0]);
      maxX = Math.max(maxX, coords[0]);
      minY = Math.min(minY, coords[1]);
      maxY = Math.max(maxY, coords[1]);
    }
    
    // Add padding to bounds
    const rangeX = Math.max(0.1, maxX - minX);
    const rangeY = Math.max(0.1, maxY - minY);
    const padding = 0.1;
    minX -= rangeX * padding;
    maxX += rangeX * padding;
    minY -= rangeY * padding;
    maxY += rangeY * padding;
    
    // Draw transformed axes
    ctxTrans.strokeStyle = '#334155';
    ctxTrans.lineWidth = 1;
    ctxTrans.beginPath();
    const zeroX = ((0 - minX) / (maxX - minX)) * w;
    const zeroY = h - ((0 - minY) / (maxY - minY)) * h;
    if (zeroX >= 0 && zeroX <= w) {
      ctxTrans.moveTo(zeroX, 0); ctxTrans.lineTo(zeroX, h);
    }
    if (zeroY >= 0 && zeroY <= h) {
      ctxTrans.moveTo(0, zeroY); ctxTrans.lineTo(w, zeroY);
    }
    ctxTrans.stroke();
    
    // Calculate separability score
    let class0Center = [0, 0], class1Center = [0, 0];
    let count0 = 0, count1 = 0;
    
    for (const p of transformedPoints) {
      if (p.label === 0) {
        class0Center[0] += p.coords[0];
        class0Center[1] += p.coords[1];
        count0++;
      } else {
        class1Center[0] += p.coords[0];
        class1Center[1] += p.coords[1];
        count1++;
      }
    }
    
    if (count0 > 0) { class0Center[0] /= count0; class0Center[1] /= count0; }
    if (count1 > 0) { class1Center[0] /= count1; class1Center[1] /= count1; }
    
    // Distance between class centers
    const interClassDist = Math.sqrt(
      Math.pow(class1Center[0] - class0Center[0], 2) + 
      Math.pow(class1Center[1] - class0Center[1], 2)
    );
    
    // Average intra-class variance
    let var0 = 0, var1 = 0;
    for (const p of transformedPoints) {
      const center = p.label === 0 ? class0Center : class1Center;
      const d = Math.sqrt(Math.pow(p.coords[0] - center[0], 2) + Math.pow(p.coords[1] - center[1], 2));
      if (p.label === 0) var0 += d; else var1 += d;
    }
    if (count0 > 0) var0 /= count0;
    if (count1 > 0) var1 /= count1;
    
    const avgIntraVar = (var0 + var1) / 2;
    const separability = avgIntraVar > 0 ? Math.min(100, (interClassDist / (avgIntraVar + 0.01)) * 25) : 0;
    
    // Update separability indicator
    const sepValue = document.getElementById('sim2SeparabilityValue');
    const sepBar = document.getElementById('sim2SeparabilityBar');
    if (sepValue) sepValue.textContent = separability.toFixed(0) + '%';
    if (sepBar) sepBar.style.width = separability + '%';
    
    // Draw points on both canvases
    for (let i = 0; i < dataset2.length; i++) {
      const point = dataset2[i];
      const tp = transformedPoints[i];
      
      // Original space
      const origPx = (point.x[0] + 1) / 2 * w;
      const origPy = (1 - (point.x[1] + 1) / 2) * h;
      
      ctxOrig.beginPath();
      ctxOrig.arc(origPx, origPy, 5, 0, Math.PI * 2);
      ctxOrig.fillStyle = point.y === 1 ? '#ef4444' : '#3b82f6';
      ctxOrig.fill();
      ctxOrig.strokeStyle = 'white';
      ctxOrig.lineWidth = 1;
      ctxOrig.stroke();
      
      // Transformed space
      const transPx = ((tp.coords[0] - minX) / (maxX - minX)) * w;
      const transPy = h - ((tp.coords[1] - minY) / (maxY - minY)) * h;
      
      ctxTrans.beginPath();
      ctxTrans.arc(transPx, transPy, 5, 0, Math.PI * 2);
      ctxTrans.fillStyle = point.y === 1 ? '#ef4444' : '#3b82f6';
      ctxTrans.fill();
      ctxTrans.strokeStyle = 'white';
      ctxTrans.lineWidth = 1;
      ctxTrans.stroke();
    }
    
    // Update labels
    const transformLabel = document.getElementById('sim2TransformLabel');
    const transformAxes = document.getElementById('sim2TransformAxes');
    if (transformLabel && transformAxes) {
      if (selectedLayer === 'input') {
        transformLabel.textContent = 'Entrada (sin transformar)';
        transformAxes.textContent = '(x₁, x₂)';
      } else {
        const layerNum = parseInt(selectedLayer) + 1;
        transformLabel.textContent = `Después de Capa ${layerNum}`;
        transformAxes.textContent = `(h${layerNum}_1, h${layerNum}_2)`;
      }
    }
  }
  
  // Update layer selector options when architecture changes
  function updateLayerSelector2() {
    const select = document.getElementById('sim2LayerSelect');
    if (!select) return;
    
    const config = getConfig2();
    select.innerHTML = '<option value="input">Entrada (x₁, x₂)</option>';
    
    for (let i = 0; i < config.numLayers; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.textContent = `Capa Oculta ${i + 1}`;
      select.appendChild(option);
    }
    
    // Add output layer option if exists
    if (config.numLayers > 0) {
      select.value = (config.numLayers - 1).toString(); // Default to last hidden layer
    }
  }
  
  function computeAccuracy2() {
    if (dataset2.length === 0) return 0;
    let correct = 0;
    for (const point of dataset2) {
      const { output } = forwardPass2(point.x);
      const predicted = output > 0.5 ? 1 : 0;
      if (predicted === point.y) correct++;
    }
    return (correct / dataset2.length) * 100;
  }
  
  // Calcular métricas para un subset específico
  function computeMetricsForSet(dataSet) {
    if (dataSet.length === 0) return { loss: 0, accuracy: 0 };
    
    let totalLoss = 0;
    let correct = 0;
    
    for (const point of dataSet) {
      const { output } = forwardPass2(point.x);
      const predicted = output > 0.5 ? 1 : 0;
      if (predicted === point.y) correct++;
      
      // Binary cross-entropy
      const eps = 1e-7;
      const clipped = Math.max(eps, Math.min(1 - eps, output));
      const loss = -(point.y * Math.log(clipped) + (1 - point.y) * Math.log(1 - clipped));
      totalLoss += loss;
    }
    
    return {
      loss: totalLoss / dataSet.length,
      accuracy: (correct / dataSet.length) * 100
    };
  }
  
  function updateMetricsDisplay() {
    const trainMetrics = computeMetricsForSet(trainSet2);
    const valMetrics = computeMetricsForSet(valSet2);
    const epoch = lossHistory2.length;
    
    // Actualizar displays numéricos
    var epochDisplay = document.getElementById('sim2EpochDisplay');
    if (epochDisplay) epochDisplay.textContent = epoch;
    
    var trainLossEl = document.getElementById('sim2TrainLoss');
    if (trainLossEl) trainLossEl.textContent = trainMetrics.loss.toFixed(4);
    
    var valLossEl = document.getElementById('sim2ValLoss');
    if (valLossEl) valLossEl.textContent = valMetrics.loss.toFixed(4);
    
    var trainAccEl = document.getElementById('sim2TrainAcc');
    if (trainAccEl) trainAccEl.textContent = trainMetrics.accuracy.toFixed(1) + '%';
    
    var valAccEl = document.getElementById('sim2ValAcc');
    if (valAccEl) valAccEl.textContent = valMetrics.accuracy.toFixed(1) + '%';
    
    // Detectar overfitting (val loss subiendo mientras train loss baja)
    var overfitWarning = document.getElementById('sim2OverfitWarning');
    if (overfitWarning && lossHistory2.length > 5) {
      const recentTrainTrend = lossHistory2[lossHistory2.length - 1] - lossHistory2[lossHistory2.length - 3];
      const recentValTrend = valLossHistory2[valLossHistory2.length - 1] - valLossHistory2[valLossHistory2.length - 3];
      
      if (recentTrainTrend < -0.01 && recentValTrend > 0.01) {
        overfitWarning.style.display = 'block';
      } else {
        overfitWarning.style.display = 'none';
      }
    }
  }
  
  // === TRAINING LOOP ===
  function startTraining2() {
    if (isTraining2) {
      isTraining2 = false;
      clearInterval(trainInterval2);
      document.getElementById('sim2TrainBtn').innerHTML = '▶️ Entrenar';
      currentBatchIndices = [];
      updateAll2();
      return;
    }
    
    isTraining2 = true;
    document.getElementById('sim2TrainBtn').innerHTML = '⏸️ Pausar';
    
    const totalEpochs = parseInt(document.getElementById('sim2Epochs').value);
    let epoch = 0;
    let batchIdx = 0;
    let shuffledIndices = [...Array(dataset2.length).keys()];
    
    // Shuffle
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    
    trainInterval2 = setInterval(() => {
      if (!isTraining2 || epoch >= totalEpochs) {
        isTraining2 = false;
        clearInterval(trainInterval2);
        document.getElementById('sim2TrainBtn').innerHTML = '▶️ Entrenar';
        currentBatchIndices = [];
        updateAll2();
        document.getElementById('sim2TrainStatus').textContent = 
          `✅ Completo | Loss: ${lossHistory2[lossHistory2.length - 1]?.toFixed(4) || '--'} | Accuracy: ${computeAccuracy2().toFixed(1)}%`;
        return;
      }
      
      // Get batch indices
      const startIdx = batchIdx * batchSize2;
      const endIdx = Math.min(startIdx + batchSize2, dataset2.length);
      currentBatchIndices = shuffledIndices.slice(startIdx, endIdx);
      
      // Train batch
      trainBatch2(currentBatchIndices);
      
      batchIdx++;
      
      // End of epoch?
      if (batchIdx * batchSize2 >= dataset2.length) {
        epoch++;
        batchIdx = 0;
        
        // Reshuffle
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        
        // Calcular métricas de train y val
        const trainMetrics = computeMetricsForSet(trainSet2);
        const valMetrics = computeMetricsForSet(valSet2);
        
        lossHistory2.push(trainMetrics.loss);
        valLossHistory2.push(valMetrics.loss);
        trainAccHistory2.push(trainMetrics.accuracy);
        valAccHistory2.push(valMetrics.accuracy);
        
        document.getElementById('sim2Epoch').textContent = epoch;
        drawLossChart2();
        drawAccChart2();
        updateMetricsDisplay();
      }
      
      document.getElementById('sim2TrainStatus').textContent = 
        `Época ${epoch}/${totalEpochs} | Batch ${batchIdx + 1}/${Math.ceil(dataset2.length/batchSize2)} | Acc: ${computeAccuracy2().toFixed(1)}%`;
      
      updateAll2();
    }, 30);
  }
  
  // === EVENT LISTENERS ===
  function setupEventListeners2() {
  ['sim2Layers', 'sim2Neurons'].forEach(id => {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      updateUI2();
      generateWeights2();
      updateAll2();
    });
  });
  
  var modeEl = document.getElementById('sim2Mode');
  if (modeEl) modeEl.addEventListener('change', () => {
    updateAll2();
  });
  
  var genDataEl = document.getElementById('sim2GenData');
  if (genDataEl) genDataEl.addEventListener('click', () => {
    generateDataset2();
    updateAll2();
  });
  
  var numPointsEl = document.getElementById('sim2NumPoints');
  if (numPointsEl) numPointsEl.addEventListener('change', () => {
    generateDataset2();
    updateBatchInfo2();
    updateAll2();
  });
  
  var patternEl = document.getElementById('sim2Pattern');
  if (patternEl) patternEl.addEventListener('change', () => {
    generateDataset2();
    updateAll2();
  });
  
  // Layer selector for space transformation
  var layerSelectEl = document.getElementById('sim2LayerSelect');
  if (layerSelectEl) layerSelectEl.addEventListener('change', () => {
    drawSpaceTransformation2();
  });
  
  // Batch size buttons
  document.querySelectorAll('.sim2BatchBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      setBatchSize2(btn.dataset.batch);
    });
  });
  
  var trainBtn = document.getElementById('sim2TrainBtn');
  if (trainBtn) trainBtn.addEventListener('click', startTraining2);
  
  var stepBtn = document.getElementById('sim2StepBtn');
  if (stepBtn) stepBtn.addEventListener('click', () => {
    // One epoch
    const shuffledIndices = [...Array(dataset2.length).keys()];
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    
    for (let b = 0; b < Math.ceil(dataset2.length / batchSize2); b++) {
      const startIdx = b * batchSize2;
      const endIdx = Math.min(startIdx + batchSize2, dataset2.length);
      trainBatch2(shuffledIndices.slice(startIdx, endIdx));
    }
    
    // Calcular métricas de train y val
    const trainMetrics = computeMetricsForSet(trainSet2);
    const valMetrics = computeMetricsForSet(valSet2);
    
    lossHistory2.push(trainMetrics.loss);
    valLossHistory2.push(valMetrics.loss);
    trainAccHistory2.push(trainMetrics.accuracy);
    valAccHistory2.push(valMetrics.accuracy);
    
    var epochEl = document.getElementById('sim2Epoch');
    if (epochEl) epochEl.textContent = lossHistory2.length;
    currentBatchIndices = [];
    updateAll2();
    drawLossChart2();
    drawAccChart2();
    updateMetricsDisplay();
    drawSurface3D(); // Actualizar superficie 3D
  });
  
  var resetBtn = document.getElementById('sim2ResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    isTraining2 = false;
    clearInterval(trainInterval2);
    var trainBtnEl = document.getElementById('sim2TrainBtn');
    if (trainBtnEl) trainBtnEl.innerHTML = '▶️ Entrenar';
    currentBatchIndices = [];
    
    // Limpiar historiales
    lossHistory2 = [];
    valLossHistory2 = [];
    trainAccHistory2 = [];
    valAccHistory2 = [];
    
    generateWeights2();
    updateAll2();
    
    // Resetear displays
    var epochEl = document.getElementById('sim2Epoch');
    if (epochEl) epochEl.textContent = '0';
    var epochDisplay = document.getElementById('sim2EpochDisplay');
    if (epochDisplay) epochDisplay.textContent = '0';
    var trainLoss = document.getElementById('sim2TrainLoss');
    if (trainLoss) trainLoss.textContent = '--';
    var valLoss = document.getElementById('sim2ValLoss');
    if (valLoss) valLoss.textContent = '--';
    var trainAcc = document.getElementById('sim2TrainAcc');
    if (trainAcc) trainAcc.textContent = '--%';
    var valAcc = document.getElementById('sim2ValAcc');
    if (valAcc) valAcc.textContent = '--%';
    var overfitWarning = document.getElementById('sim2OverfitWarning');
    if (overfitWarning) overfitWarning.style.display = 'none';
    
    // Limpiar gráficos
    drawLossChart2();
    drawAccChart2();
    drawSurface3D(); // Actualizar superficie 3D
  });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VISUALIZACIÓN 3D: SUPERFICIE DE PROBABILIDAD
  // ═══════════════════════════════════════════════════════════════════════════
  
  let surface3DVisible = true;
  let surface3DRotation = { x: 0.5, y: -0.6 };
  let isDragging3D = false;
  let lastMouse3D = { x: 0, y: 0 };
  
  function toggle3DView() {
    surface3DVisible = !surface3DVisible;
    var container = document.getElementById('sim23DContainer');
    if (container) {
      container.style.display = surface3DVisible ? 'block' : 'none';
    }
    if (surface3DVisible) drawSurface3D();
  }
  
  function project3DSurface(x1, x2, y, W, H) {
    // Normalizar a rango [-1, 1]
    var scale = 90;
    var nx = x1 * scale;
    var ny = x2 * scale;
    var nz = (y - 0.5) * scale * 1.5; // Y va de 0-1, centramos en 0.5
    
    // Rotación Y (horizontal)
    var cosY = Math.cos(surface3DRotation.y);
    var sinY = Math.sin(surface3DRotation.y);
    var rx = nx * cosY - ny * sinY;
    var rz = nx * sinY + ny * cosY;
    
    // Rotación X (inclinación)
    var cosX = Math.cos(surface3DRotation.x);
    var sinX = Math.sin(surface3DRotation.x);
    var ry = nz * cosX - rz * sinX;
    var rz2 = nz * sinX + rz * cosX;
    
    // Proyección
    var screenX = W / 2 + rx;
    var screenY = H / 2 - ry;
    
    return { x: screenX, y: screenY, z: rz2 };
  }
  
  function getProbabilityColor(p) {
    // Azul (0) -> Verde (0.5) -> Rojo (1)
    if (p < 0.5) {
      var t = p * 2;
      var r = Math.round(59 + (34 - 59) * t);
      var g = Math.round(130 + (197 - 130) * t);
      var b = Math.round(246 + (94 - 246) * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else {
      var t = (p - 0.5) * 2;
      var r = Math.round(34 + (239 - 34) * t);
      var g = Math.round(197 + (68 - 197) * t);
      var b = Math.round(94 + (68 - 94) * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
  }
  
  function drawSurface3D() {
    var canvas = document.getElementById('sim2Surface3D');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    
    // Verificar que hay pesos
    if (!weights2.layers || weights2.layers.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Genera un dataset para ver la superficie', W/2, H/2);
      return;
    }
    
    // Crear grid de puntos
    var gridSize = 20;
    var surfaces = [];
    
    for (var i = 0; i < gridSize; i++) {
      for (var j = 0; j < gridSize; j++) {
        var x1 = (i / (gridSize - 1)) * 2 - 1;
        var x2 = (j / (gridSize - 1)) * 2 - 1;
        
        var result = forwardPass2([x1, x2]);
        var prob = Math.max(0, Math.min(1, result.output));
        
        var proj = project3DSurface(x1, x2, prob, W, H);
        surfaces.push({
          i: i, j: j,
          x1: x1, x2: x2,
          prob: prob,
          proj: proj
        });
      }
    }
    
    // Ordenar por profundidad
    surfaces.sort(function(a, b) { return a.proj.z - b.proj.z; });
    
    // Dibujar grid del suelo (y = 0)
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) {
      var t = (i / 4) * 2 - 1;
      var p1 = project3DSurface(-1, t, 0, W, H);
      var p2 = project3DSurface(1, t, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      
      p1 = project3DSurface(t, -1, 0, W, H);
      p2 = project3DSurface(t, 1, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    
    // Dibujar ejes
    ctx.lineWidth = 2;
    
    // Eje X1 (azul)
    ctx.strokeStyle = '#3b82f6';
    var ox = project3DSurface(0, 0, 0, W, H);
    var ax1 = project3DSurface(1.2, 0, 0, W, H);
    ctx.beginPath();
    ctx.moveTo(ox.x, ox.y);
    ctx.lineTo(ax1.x, ax1.y);
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('x₁', ax1.x + 5, ax1.y);
    
    // Eje X2 (púrpura)
    ctx.strokeStyle = '#a855f7';
    var ax2 = project3DSurface(0, 1.2, 0, W, H);
    ctx.beginPath();
    ctx.moveTo(ox.x, ox.y);
    ctx.lineTo(ax2.x, ax2.y);
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.fillText('x₂', ax2.x + 5, ax2.y);
    
    // Eje Y/Prob (verde)
    ctx.strokeStyle = '#22c55e';
    var ay = project3DSurface(0, 0, 1, W, H);
    ctx.beginPath();
    ctx.moveTo(ox.x, ox.y);
    ctx.lineTo(ay.x, ay.y);
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.fillText('P(y=1)', ay.x - 30, ay.y - 5);
    
    // Dibujar superficie como mesh
    for (var s = 0; s < surfaces.length; s++) {
      var pt = surfaces[s];
      var i = pt.i;
      var j = pt.j;
      
      if (i < gridSize - 1 && j < gridSize - 1) {
        // Encontrar los 4 vértices del cuadrado
        var idx00 = surfaces.findIndex(function(p) { return p.i === i && p.j === j; });
        var idx10 = surfaces.findIndex(function(p) { return p.i === i + 1 && p.j === j; });
        var idx01 = surfaces.findIndex(function(p) { return p.i === i && p.j === j + 1; });
        var idx11 = surfaces.findIndex(function(p) { return p.i === i + 1 && p.j === j + 1; });
        
        if (idx00 >= 0 && idx10 >= 0 && idx01 >= 0 && idx11 >= 0) {
          var p00 = surfaces[idx00];
          var p10 = surfaces[idx10];
          var p01 = surfaces[idx01];
          var p11 = surfaces[idx11];
          
          // Calcular proyecciones para este quad
          var proj00 = project3DSurface(p00.x1, p00.x2, p00.prob, W, H);
          var proj10 = project3DSurface(p10.x1, p10.x2, p10.prob, W, H);
          var proj01 = project3DSurface(p01.x1, p01.x2, p01.prob, W, H);
          var proj11 = project3DSurface(p11.x1, p11.x2, p11.prob, W, H);
          
          // Color promedio
          var avgProb = (p00.prob + p10.prob + p01.prob + p11.prob) / 4;
          ctx.fillStyle = getProbabilityColor(avgProb);
          ctx.globalAlpha = 0.7;
          
          ctx.beginPath();
          ctx.moveTo(proj00.x, proj00.y);
          ctx.lineTo(proj10.x, proj10.y);
          ctx.lineTo(proj11.x, proj11.y);
          ctx.lineTo(proj01.x, proj01.y);
          ctx.closePath();
          ctx.fill();
          
          // Borde sutil
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    
    // Dibujar línea de frontera (P = 0.5) resaltada
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    for (var i = 0; i < gridSize - 1; i++) {
      for (var j = 0; j < gridSize - 1; j++) {
        var x1a = (i / (gridSize - 1)) * 2 - 1;
        var x2a = (j / (gridSize - 1)) * 2 - 1;
        var x1b = ((i + 1) / (gridSize - 1)) * 2 - 1;
        var x2b = ((j + 1) / (gridSize - 1)) * 2 - 1;
        
        var r00 = forwardPass2([x1a, x2a]);
        var r10 = forwardPass2([x1b, x2a]);
        var r01 = forwardPass2([x1a, x2b]);
        
        // Check si cruza 0.5
        if ((r00.output - 0.5) * (r10.output - 0.5) < 0) {
          var t = (0.5 - r00.output) / (r10.output - r00.output);
          var xc = x1a + t * (x1b - x1a);
          var pc = project3DSurface(xc, x2a, 0.5, W, H);
          ctx.beginPath();
          ctx.arc(pc.x, pc.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        }
        if ((r00.output - 0.5) * (r01.output - 0.5) < 0) {
          var t = (0.5 - r00.output) / (r01.output - r00.output);
          var xc = x2a + t * (x2b - x2a);
          var pc = project3DSurface(x1a, xc, 0.5, W, H);
          ctx.beginPath();
          ctx.arc(pc.x, pc.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        }
      }
    }
    ctx.setLineDash([]);
    
    // Dibujar puntos del dataset sobre la superficie
    for (var d = 0; d < dataset2.length; d++) {
      var pt = dataset2[d];
      var result = forwardPass2(pt.x);
      var prob = Math.max(0, Math.min(1, result.output));
      var proj = project3DSurface(pt.x[0], pt.x[1], prob, W, H);
      
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = pt.y === 1 ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    // Actualizar insight
    updateSurface3DInsight();
  }
  
  function updateSurface3DInsight() {
    var insight = document.getElementById('sim23DInsight');
    if (!insight) return;
    
    var config = getConfig2();
    var numLayers = config.numLayers;
    
    if (numLayers === 0) {
      insight.innerHTML = '<div style="display: flex; align-items: start; gap: 8px;"><span style="font-size: 1.2em;">📏</span><div style="font-size: 0.8em; color: #fde68a;"><strong>0 capas ocultas:</strong> La superficie es un <strong>plano inclinado</strong>. Solo puede hacer fronteras lineales (líneas rectas).<br>➡️ <strong>Agrega 1+ capas ocultas</strong> para ver cómo se curva.</div></div>';
    } else if (numLayers === 1 && config.numNeurons <= 3) {
      insight.innerHTML = '<div style="display: flex; align-items: start; gap: 8px;"><span style="font-size: 1.2em;">🔺</span><div style="font-size: 0.8em; color: #bbf7d0;"><strong>1 capa con pocas neuronas:</strong> La superficie tiene <strong>pliegues simples</strong>. Cada neurona aporta un "doblez" al espacio.<br>➡️ Agrega más neuronas o capas para más flexibilidad.</div></div>';
    } else {
      insight.innerHTML = '<div style="display: flex; align-items: start; gap: 8px;"><span style="font-size: 1.2em;">🌊</span><div style="font-size: 0.8em; color: #a5f3fc;"><strong>Red profunda:</strong> La superficie puede hacer <strong>curvas complejas</strong>. Cada capa oculta transforma el espacio, "doblándolo" para separar mejor las clases.<br>💡 ¡Esto es el poder de Deep Learning!</div></div>';
    }
  }
  
  // Setup drag para rotar la vista 3D
  function setup3DDrag() {
    var canvas = document.getElementById('sim2Surface3D');
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', function(e) {
      isDragging3D = true;
      lastMouse3D = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mousemove', function(e) {
      if (!isDragging3D) return;
      var dx = e.clientX - lastMouse3D.x;
      var dy = e.clientY - lastMouse3D.y;
      
      surface3DRotation.y += dx * 0.01;
      surface3DRotation.x += dy * 0.01;
      
      // Limitar rotación X
      surface3DRotation.x = Math.max(-1.2, Math.min(1.2, surface3DRotation.x));
      
      lastMouse3D = { x: e.clientX, y: e.clientY };
      drawSurface3D();
    });
    
    canvas.addEventListener('mouseup', function() {
      isDragging3D = false;
      canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mouseleave', function() {
      isDragging3D = false;
      canvas.style.cursor = 'grab';
    });
  }
  
  // Hook para actualizar 3D durante entrenamiento
  var originalUpdateAll2 = updateAll2;
  updateAll2 = function() {
    originalUpdateAll2();
    if (surface3DVisible) {
      drawSurface3D();
    }
  };
  
  // Exponer función toggle
  window.toggle3DView = toggle3DView;
  
  // === INICIALIZAR ===
  // Exponer funciones al scope global para onclick inline
  window.toggleFeature2 = toggleFeature2;
  
  function initSimulator2() {
    // Check if elements exist
    if (!document.getElementById('sim2Layers')) {
      return; // Elements not ready yet
    }
    setupEventListeners2();
    updateUI2();
    generateDataset2();
    generateWeights2();
    setBatchSize2(4);
    setup3DDrag(); // Setup drag para superficie 3D
    setTimeout(function() {
      updateAll2();
      drawSurface3D(); // Dibujar superficie 3D inicial
    }, 100);
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator2);
  } else {
    initSimulator2();
  }
})();
