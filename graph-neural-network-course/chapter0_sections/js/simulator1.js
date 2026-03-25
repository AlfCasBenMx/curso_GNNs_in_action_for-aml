/* ═══════════════════════════════════════════════════════════════════════════
   PRIMER SIMULADOR - Forward Pass Calculator
   Simulador simple para entender el flujo de datos en una red neuronal
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  // === ESTADO GLOBAL ===
  const numInputs = 2;
  let weights = { layers: [] };
  let activations = ['ReLU', 'ReLU', 'ReLU'];
  const actOptions = ['ReLU', 'Sigmoid', 'Tanh', 'LeakyReLU'];
  const actColors = { ReLU: '#3b82f6', Sigmoid: '#10b981', Tanh: '#f59e0b', LeakyReLU: '#ef4444' };
  
  // Valores calculados para mostrar en el diagrama
  let calculatedValues = {
    inputs: [0, 0],
    hiddenActivations: [],
    outputs: []
  };
  
  // === FUNCIONES DE ACTIVACIÓN ===
  const relu = x => Math.max(0, x);
  const sigmoid = x => 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
  const tanh_ = x => Math.tanh(x);
  const leakyRelu = x => x > 0 ? x : 0.01 * x;
  const softmax = arr => {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };
  
  function getActFn(name) {
    if (name === 'ReLU') return relu;
    if (name === 'Sigmoid') return sigmoid;
    if (name === 'Tanh') return tanh_;
    if (name === 'LeakyReLU') return leakyRelu;
    return relu;
  }
  
  // === OBTENER CONFIGURACIÓN ===
  function getConfig() {
    return {
      numLayers: parseInt(document.getElementById('simLayers').value),
      numNeurons: parseInt(document.getElementById('simNeurons').value),
      numOutputs: parseInt(document.getElementById('simOutputs').value),
      mode: document.getElementById('simMode').value
    };
  }
  
  // === GENERAR PESOS ALEATORIOS ===
  function randomWeight() { return parseFloat((Math.random() * 2 - 1).toFixed(2)); }
  
  function generateWeights() {
    const { numLayers, numNeurons, numOutputs } = getConfig();
    weights = { layers: [] };
    
    // Primera capa: inputs -> primera oculta
    weights.layers.push({
      W: Array(numNeurons).fill(0).map(() => Array(numInputs).fill(0).map(randomWeight)),
      b: Array(numNeurons).fill(0).map(randomWeight)
    });
    
    // Capas ocultas intermedias
    for (let l = 1; l < numLayers; l++) {
      weights.layers.push({
        W: Array(numNeurons).fill(0).map(() => Array(numNeurons).fill(0).map(randomWeight)),
        b: Array(numNeurons).fill(0).map(randomWeight)
      });
    }
    
    // Capa de salida
    weights.layers.push({
      W: Array(numOutputs).fill(0).map(() => Array(numNeurons).fill(0).map(randomWeight)),
      b: Array(numOutputs).fill(0).map(randomWeight)
    });
  }
  
  // === ACTUALIZAR UI ===
  function updateUI() {
    const { numLayers, numNeurons, numOutputs, mode } = getConfig();
    
    document.getElementById('simLayersVal').textContent = numLayers;
    document.getElementById('simNeuronsVal').textContent = numNeurons;
    document.getElementById('simOutputsVal').textContent = numOutputs;
    
    // Actualizar selectores de activación
    const isRegression = mode === 'regression';
    let actHTML = '';
    for (let i = 0; i < numLayers; i++) {
      actHTML += `<select id="simAct${i}" style="padding: 4px 6px; border-radius: 5px; border: none; font-size: 0.75em; background: ${actColors[activations[i]]}; color: white; cursor: pointer;">
        ${actOptions.map(o => `<option value="${o}" ${activations[i] === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>`;
    }
    const outActName = isRegression ? 'Lineal' : (numOutputs === 1 ? 'Sigmoid' : 'Softmax');
    const outActColor = isRegression ? '#fbbf24' : (numOutputs === 1 ? '#10b981' : '#3b82f6');
    actHTML += `<span style="background: ${outActColor}; padding: 4px 8px; border-radius: 5px; font-size: 0.7em;">${outActName}</span>`;
    document.getElementById('simActivations').innerHTML = actHTML;
    
    // Event listeners para activaciones
    for (let i = 0; i < numLayers; i++) {
      document.getElementById(`simAct${i}`).addEventListener('change', function() {
        activations[i] = this.value;
        this.style.background = actColors[this.value];
        updateAll();
      });
    }
    
    // Actualizar texto de arquitectura
    let arch = '2 → ';
    for (let i = 0; i < numLayers; i++) {
      arch += `[${numNeurons}/${activations[i]}]`;
      if (i < numLayers - 1) arch += ' → ';
    }
    arch += ` → ${numOutputs}`;
    document.getElementById('simArchText').textContent = arch;
    
    // Actualizar targets según modo
    let targetsHTML = '';
    for (let i = 0; i < numOutputs; i++) {
      const stepVal = isRegression ? '0.1' : '1';
      const minMax = isRegression ? '' : 'min="0" max="1"';
      const defaultVal = isRegression ? '0.5' : (i === 0 ? '1' : '0');
      targetsHTML += `<input type="number" id="simY${i+1}" value="${defaultVal}" step="${stepVal}" ${minMax} style="width: 50px; padding: 6px; border: 2px solid #10b981; border-radius: 6px; text-align: center; background: rgba(16,185,129,0.2); color: white;">`;
    }
    document.getElementById('simTargets').innerHTML = targetsHTML;
    
    // Event listeners para targets
    for (let i = 0; i < numOutputs; i++) {
      const idx = i;
      document.getElementById(`simY${i+1}`).addEventListener('input', function() {
        if (!isRegression && numOutputs > 1) {
          const val = parseInt(this.value);
          if (val === 1) {
            for (let j = 0; j < numOutputs; j++) {
              if (j !== idx) {
                document.getElementById(`simY${j+1}`).value = '0';
              }
            }
          }
        }
        calculate();
      });
    }
    
    document.getElementById('simOutAct').innerHTML = `Salida: <span style="color: ${isRegression ? '#fbbf24' : (numOutputs === 1 ? '#34d399' : '#60a5fa')}; font-weight: bold;">${isRegression ? 'Lineal' : (numOutputs === 1 ? 'Sigmoid' : 'Softmax')}</span> (${isRegression ? 'Regresión' : 'Clasificación'})`;
  }
  
  // === CALCULAR FORWARD PASS ===
  function calculate() {
    const { numLayers, numNeurons, numOutputs, mode } = getConfig();
    const isRegression = mode === 'regression';
    
    const x1 = parseFloat(document.getElementById('simX1').value) || 0;
    const x2 = parseFloat(document.getElementById('simX2').value) || 0;
    let current = [x1, x2];
    
    calculatedValues.inputs = [x1, x2];
    calculatedValues.hiddenActivations = [];
    
    const targets = [];
    for (let i = 0; i < numOutputs; i++) {
      targets.push(parseFloat(document.getElementById(`simY${i+1}`)?.value) || 0);
    }
    
    let html = '<div style="color: #a5b4fc; font-weight: bold; margin-bottom: 8px;">📊 FORWARD PASS</div>';
    
    for (let l = 0; l < weights.layers.length; l++) {
      const layer = weights.layers[l];
      const isOutput = l === weights.layers.length - 1;
      const layerName = isOutput ? 'Salida' : `Oculta ${l+1}`;
      let actName, actFn;
      if (isOutput) {
        if (isRegression) {
          actName = 'Lineal';
          actFn = x => x;
        } else if (numOutputs === 1) {
          actName = 'Sigmoid';
          actFn = sigmoid;
        } else {
          actName = 'Softmax';
          actFn = null;
        }
      } else {
        actName = activations[l];
        actFn = getActFn(activations[l]);
      }
      
      html += `<div style="color: ${isOutput ? '#34d399' : '#a78bfa'}; margin-top: 10px;"><strong>Capa ${layerName}</strong> (${actName})</div>`;
      html += `<div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; margin-top: 4px;">`;
      
      const zVals = [];
      const newCurrent = [];
      
      for (let j = 0; j < layer.W.length; j++) {
        let z = layer.b[j];
        let formula = '';
        for (let k = 0; k < current.length; k++) {
          z += layer.W[j][k] * current[k];
          formula += `${layer.W[j][k].toFixed(2)}×${current[k].toFixed(2)}`;
          if (k < current.length - 1) formula += ' + ';
        }
        formula += ` + ${layer.b[j].toFixed(2)}`;
        zVals.push(z);
        
        let a = z;
        if (isOutput) {
          if (isRegression) {
            a = z;
          } else if (numOutputs === 1) {
            a = sigmoid(z);
          }
        } else {
          a = actFn(z);
        }
        newCurrent.push(a);
        
        const label = isOutput ? `ŷ${numOutputs > 1 ? j+1 : ''}` : `h${j+1}`;
        html += `<div style="font-size: 0.85em; margin: 2px 0;"><span style="color: #93c5fd;">${label}</span>: z=${z.toFixed(3)}`;
        if (!isOutput || numOutputs === 1 || isRegression) {
          html += ` → ${actName}=${a.toFixed(4)}`;
        }
        html += `</div>`;
      }
      
      if (isOutput && numOutputs > 1 && !isRegression) {
        const probs = softmax(zVals);
        html += `<div style="margin-top: 4px; color: #60a5fa;">Softmax: [${probs.map(p => p.toFixed(4)).join(', ')}]</div>`;
        for (let j = 0; j < probs.length; j++) newCurrent[j] = probs[j];
      } else if (isOutput && numOutputs > 1 && isRegression) {
        html += `<div style="margin-top: 4px; color: #fbbf24;">Salidas lineales: [${newCurrent.map(v => v.toFixed(4)).join(', ')}]</div>`;
      }
      
      html += `</div>`;
      
      if (isOutput) {
        calculatedValues.outputs = [...newCurrent];
      } else {
        calculatedValues.hiddenActivations.push([...newCurrent]);
      }
      
      current = newCurrent;
    }
    
    // Calcular error
    let totalErr = 0, mse = 0;
    html += `<div style="color: #fca5a5; margin-top: 10px;"><strong>Error</strong></div>`;
    html += `<div style="background: rgba(239,68,68,0.1); padding: 8px; border-radius: 6px; margin-top: 4px;">`;
    for (let i = 0; i < numOutputs; i++) {
      const err = current[i] - targets[i];
      totalErr += Math.abs(err);
      mse += err * err;
      html += `<div style="font-size: 0.85em;">ŷ${numOutputs > 1 ? i+1 : ''} - y = ${current[i].toFixed(4)} - ${targets[i]} = <span style="color: #fca5a5;">${err.toFixed(4)}</span></div>`;
    }
    mse /= numOutputs;
    html += `<div style="margin-top: 4px; color: #fcd34d;">MSE = ${mse.toFixed(6)}</div></div>`;
    
    document.getElementById('simCalcs').innerHTML = html;
    
    const predStr = current.length > 1 ? `[${current.map(v => v.toFixed(3)).join(', ')}]` : current[0].toFixed(4);
    document.getElementById('simPred').textContent = predStr;
    document.getElementById('simError').textContent = (totalErr / numOutputs).toFixed(4);
    document.getElementById('simLoss').textContent = mse.toFixed(6);
    
    drawNetwork();
    updateTransformExplanation();
  }
  
  // === DIBUJAR RED ===
  function drawNetwork() {
    const { numLayers, numNeurons, numOutputs } = getConfig();
    const svg = document.getElementById('simSvg');
    
    const w = 380, h = 320;
    const inputX = 55, outputX = w - 55;
    const layerSpacing = (outputX - inputX) / (numLayers + 1);
    
    const getYPositions = (count) => {
      const spacing = Math.min(55, (h - 100) / Math.max(count - 1, 1));
      const start = count === 1 ? h/2 : (h - (count-1)*spacing) / 2;
      return Array(count).fill(0).map((_, i) => start + i * spacing);
    };
    
    const inputY = getYPositions(2);
    const hiddenY = Array(numLayers).fill(0).map(() => getYPositions(numNeurons));
    const outputY = getYPositions(numOutputs);
    const hiddenX = Array(numLayers).fill(0).map((_, i) => inputX + (i+1) * layerSpacing);
    
    const getWeightColor = (w) => {
      const intensity = Math.min(1, Math.abs(w));
      if (w > 0) {
        const g = Math.floor(200 + 55 * intensity);
        const r = Math.floor(34 * (1 - intensity));
        return `rgb(${r}, ${g}, 80)`;
      } else {
        const r = Math.floor(200 + 55 * intensity);
        const g = Math.floor(68 * (1 - intensity));
        return `rgb(${r}, ${g}, 68)`;
      }
    };
    
    const getWeightWidth = (w) => Math.max(0.8, Math.min(4, Math.abs(w) * 2.5));
    
    let svgContent = '';
    
    // Conexiones: Entrada -> Primera oculta
    if (weights.layers.length > 0) {
      const layer = weights.layers[0];
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < numNeurons; j++) {
          const wVal = layer.W[j][i];
          const x1 = inputX + 20, y1 = inputY[i];
          const x2 = hiddenX[0] - 17, y2 = hiddenY[0][j];
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          
          svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${getWeightColor(wVal)}" stroke-width="${getWeightWidth(wVal)}" opacity="0.8"/>`;
          
          if (numNeurons <= 4) {
            svgContent += `<text x="${midX}" y="${midY - 3}" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="bold">${wVal.toFixed(2)}</text>`;
          }
        }
      }
    }
    
    // Entre capas ocultas
    for (let l = 0; l < numLayers - 1; l++) {
      if (weights.layers[l+1]) {
        const layer = weights.layers[l+1];
        for (let i = 0; i < numNeurons; i++) {
          for (let j = 0; j < numNeurons; j++) {
            const wVal = layer.W[j][i];
            const x1 = hiddenX[l] + 17, y1 = hiddenY[l][i];
            const x2 = hiddenX[l+1] - 17, y2 = hiddenY[l+1][j];
            
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              stroke="${getWeightColor(wVal)}" stroke-width="${getWeightWidth(wVal)}" opacity="0.6"/>`;
          }
        }
      }
    }
    
    // Última oculta -> Salida
    const lastHiddenLayer = weights.layers[weights.layers.length - 1];
    if (lastHiddenLayer) {
      for (let i = 0; i < numNeurons; i++) {
        for (let j = 0; j < numOutputs; j++) {
          const wVal = lastHiddenLayer.W[j][i];
          const x1 = hiddenX[numLayers-1] + 17, y1 = hiddenY[numLayers-1][i];
          const x2 = outputX - 22, y2 = outputY[j];
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          
          svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${getWeightColor(wVal)}" stroke-width="${getWeightWidth(wVal)}" opacity="0.8"/>`;
          
          if (numNeurons <= 4 && numOutputs <= 2) {
            svgContent += `<text x="${midX}" y="${midY - 3}" text-anchor="middle" fill="#a1a1aa" font-size="7" font-weight="bold">${wVal.toFixed(2)}</text>`;
          }
        }
      }
    }
    
    // Neuronas de entrada
    for (let i = 0; i < 2; i++) {
      const val = calculatedValues.inputs[i] || 0;
      svgContent += `<circle cx="${inputX}" cy="${inputY[i]}" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>`;
      svgContent += `<text x="${inputX}" y="${inputY[i]-5}" text-anchor="middle" fill="#1e40af" font-size="9" font-weight="bold">x${i+1}</text>`;
      svgContent += `<text x="${inputX}" y="${inputY[i]+8}" text-anchor="middle" fill="#1e3a8a" font-size="10" font-weight="bold">${val.toFixed(2)}</text>`;
    }
    svgContent += `<text x="${inputX}" y="22" text-anchor="middle" fill="#1e40af" font-size="8" font-weight="bold">Entrada</text>`;
    
    // Neuronas ocultas
    const colors = ['#8b5cf6', '#f59e0b', '#ec4899'];
    const bgColors = ['#f3e8ff', '#fef3c7', '#fce7f3'];
    for (let l = 0; l < numLayers; l++) {
      for (let i = 0; i < numNeurons; i++) {
        const val = (calculatedValues.hiddenActivations[l] && calculatedValues.hiddenActivations[l][i]) || 0;
        const bias = (weights.layers[l] && weights.layers[l].b[i]) || 0;
        
        svgContent += `<circle cx="${hiddenX[l]}" cy="${hiddenY[l][i]}" r="17" fill="${bgColors[l%3]}" stroke="${colors[l%3]}" stroke-width="2"/>`;
        svgContent += `<text x="${hiddenX[l]}" y="${hiddenY[l][i]-4}" text-anchor="middle" fill="${colors[l%3]}" font-size="8">h${i+1}</text>`;
        svgContent += `<text x="${hiddenX[l]}" y="${hiddenY[l][i]+7}" text-anchor="middle" fill="#1f2937" font-size="9" font-weight="bold">${val.toFixed(2)}</text>`;
        svgContent += `<text x="${hiddenX[l]}" y="${hiddenY[l][i]+25}" text-anchor="middle" fill="#9ca3af" font-size="6">b=${bias.toFixed(2)}</text>`;
      }
      svgContent += `<text x="${hiddenX[l]}" y="18" text-anchor="middle" fill="${colors[l%3]}" font-size="7" font-weight="bold">Capa ${l+1}</text>`;
      svgContent += `<text x="${hiddenX[l]}" y="28" text-anchor="middle" fill="${actColors[activations[l]]}" font-size="6">(${activations[l]})</text>`;
    }
    
    // Neuronas de salida
    for (let i = 0; i < numOutputs; i++) {
      const val = calculatedValues.outputs[i] || 0;
      const bias = (lastHiddenLayer && lastHiddenLayer.b[i]) || 0;
      
      svgContent += `<circle cx="${outputX}" cy="${outputY[i]}" r="22" fill="#dcfce7" stroke="#10b981" stroke-width="2"/>`;
      svgContent += `<text x="${outputX}" y="${outputY[i]-6}" text-anchor="middle" fill="#065f46" font-size="9">ŷ${numOutputs > 1 ? i+1 : ''}</text>`;
      svgContent += `<text x="${outputX}" y="${outputY[i]+7}" text-anchor="middle" fill="#047857" font-size="11" font-weight="bold">${val.toFixed(3)}</text>`;
      svgContent += `<text x="${outputX}" y="${outputY[i]+28}" text-anchor="middle" fill="#9ca3af" font-size="6">b=${bias.toFixed(2)}</text>`;
    }
    svgContent += `<text x="${outputX}" y="22" text-anchor="middle" fill="#065f46" font-size="8" font-weight="bold">Salida</text>`;
    
    // Leyenda
    svgContent += `<text x="${w/2}" y="${h-8}" text-anchor="middle" fill="#64748b" font-size="6">Pesos: <tspan fill="#22c55e">+positivo</tspan> <tspan fill="#ef4444">-negativo</tspan> (grosor = magnitud)</text>`;
    
    svg.innerHTML = svgContent;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  
  // === UPDATE ALL ===
  function updateAll() {
    updateUI();
    calculate();
  }
  
  // === FUNCIÓN PARA ACTUALIZAR EXPLICACIÓN DINÁMICA ===
  function updateTransformExplanation() {
    const x1 = parseFloat(document.getElementById('simX1').value) || 0;
    const x2 = parseFloat(document.getElementById('simX2').value) || 0;
    const numLayers = parseInt(document.getElementById('simLayers').value);
    const numNeurons = parseInt(document.getElementById('simNeurons').value);
    const numOutputs = parseInt(document.getElementById('simOutputs').value);
    const mode = document.getElementById('simMode').value;
    const isRegression = mode === 'regression';
    
    let html = `<strong style="color: #fbbf24;">1. Entrada:</strong> <span style="color: #fde68a;">Punto (${x1.toFixed(2)}, ${x2.toFixed(2)}) del espacio original</span><br><br>`;
    
    html += `<strong style="color: #fbbf24;">2. Capas ocultas:</strong> <span style="color: #fde68a;">${numLayers} capa(s) con ${numNeurons} neurona(s) cada una</span><br>`;
    html += `<em style="color: #fcd34d;">Los valores z y activaciones se muestran en la visualización de la red</em><br><br>`;
    
    html += `<strong style="color: #fbbf24;">3. Salida:</strong> <span style="color: #fde68a;">`;
    if (isRegression) {
      html += `${numOutputs} salida(s) lineal(es) (sin activación)`;
    } else if (numOutputs === 1) {
      html += `Sigmoid → probabilidad entre 0 y 1`;
    } else {
      html += `Softmax → ${numOutputs} probabilidades que suman 1`;
    }
    html += `</span>`;
    
    document.getElementById('transformDetails').innerHTML = html;
    
    const hiddenText = numLayers > 0 
      ? `El punto (${x1.toFixed(2)}, ${x2.toFixed(2)}) fue transformado por ${numLayers} capa(s) oculta(s) a un nuevo espacio de ${numNeurons} dimensiones.`
      : `Sin capas ocultas, el modelo solo puede aprender fronteras lineales.`;
    
    document.getElementById('transformResultText').textContent = hiddenText + (numLayers > 0 ? ' ¡La red "dobló" el espacio!' : '');
  }
  
  // === EVENT LISTENERS ===
  document.getElementById('simLayers').addEventListener('input', function() { generateWeights(); updateAll(); });
  document.getElementById('simNeurons').addEventListener('input', function() { generateWeights(); updateAll(); });
  document.getElementById('simOutputs').addEventListener('input', function() { generateWeights(); updateAll(); });
  document.getElementById('simMode').addEventListener('change', function() { generateWeights(); updateAll(); });
  document.getElementById('simRandomBtn').addEventListener('click', function() { generateWeights(); updateAll(); });
  document.getElementById('simX1').addEventListener('input', calculate);
  document.getElementById('simX2').addEventListener('input', calculate);
  
  // === INICIALIZAR ===
  generateWeights();
  updateAll();
})();
