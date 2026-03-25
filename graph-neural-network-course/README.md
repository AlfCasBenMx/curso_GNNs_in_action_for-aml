# 🌐 Graph Neural Networks Course - GNN AML

## 📖 Introducción

Bienvenido al **Curso Completo de Graph Neural Networks** (Redes Neuronales de Grafos) aplicadas a **Anti-Money Laundering** (AML).

### ¿Qué son las Graph Neural Networks?

Las **Graph Neural Networks (GNNs)** son una clase de redes neuronales profundas diseñadas para trabajar directamente con datos estructurados en forma de grafos. A diferencia de las redes neuronales tradicionales que operan sobre datos tabulares o imágenes, las GNNs pueden capturar las relaciones complejas y las dependencias entre entidades conectadas.

**¿Por qué son importantes para AML?**

En el contexto de detección de lavado de dinero:
- 🏦 **Transacciones financieras** forman redes naturales (grafos)
- 👥 **Entidades** (personas, empresas) están conectadas por transacciones
- 🔍 Los **patrones de lavado** a menudo involucran múltiples capas de transacciones
- 🎯 Las GNNs pueden **detectar patrones sospechosos** que métodos tradicionales no identifican

### ¿Qué aprenderás en este curso?

Este curso te llevará desde los fundamentos de las redes neuronales hasta arquitecturas avanzadas de GNN:

1. ✅ **Fundamentos sólidos** de redes neuronales y PyTorch
2. ✅ **Arquitecturas GNN** desde GCN hasta Graph Isomorphism Networks
3. ✅ **Implementación práctica** con datasets reales
4. ✅ **Aplicaciones específicas** a detección de fraude y AML
5. ✅ **Visualizaciones interactivas** para entender el comportamiento de los modelos

---

## 📚 Contenido Detallado del Curso

### **Capítulo 0: Fundamentos de Redes Neuronales** 🧠

**Archivos:**
- 📓 Notebook: `0_Neural_Networks_Fundamentals.ipynb`
- 🌐 Guía HTML: `Chapter0_Neural_Networks_Fundamentals.html`

**¿Qué aprenderás?**

Este capítulo es tu punto de partida si eres nuevo en deep learning. Cubre:

1. **La Neurona Artificial**: Comprende el building block fundamental
   - Anatomía de una neurona (pesos, bias, activación)
   - Interpretación geométrica: hiperplanos de decisión
   - Analogía con neuronas biológicas

2. **Regresión Lineal**: El modelo más simple
   - Ecuación y = wx + b
   - Interpretación de parámetros
   - Visualización de predicciones

3. **El Problema del Círculo**: ¿Por qué necesitamos capas ocultas?
   - Limitaciones de modelos lineales
   - Teorema de Aproximación Universal
   - Cómo las capas ocultas "doblan el espacio"

4. **Funciones de Activación**: Introduciendo no-linealidad
   - ReLU, Sigmoid, Tanh
   - ¿Por qué necesitamos no-linealidad?
   - Ventajas y desventajas de cada función

5. **Forward Pass**: Propagación hacia adelante
   - Flujo de datos a través de la red
   - Seguimiento de dimensiones [batch, features]
   - Operaciones matriciales

6. **Funciones de Pérdida**: Midiendo el error
   - Mean Squared Error (MSE) para regresión
   - Cross Entropy para clasificación
   - Interpretación de valores

7. **Backpropagation**: El corazón del aprendizaje
   - Regla de la cadena
   - Gradientes y su significado
   - ¿Hacia dónde actualizar los pesos?

8. **Optimizadores**: Actualizando parámetros eficientemente
   - Gradient Descent básico
   - Adam y otros optimizadores adaptativos
   - Learning rate y su impacto

9. **Regularización**: Evitando overfitting
   - ¿Qué es el overfitting?
   - Dropout y otras técnicas
   - Señales de alarma (train↓ validation↑)

10. **Loop de Entrenamiento**: Todo junto
    - Estructura completa de entrenamiento
    - Evaluación y validación
    - Guardado de modelos

**Características especiales:**
- ✨ Guía HTML interactiva con 10 secciones
- 🎯 Referencias cruzadas entre HTML y notebook
- 📊 Diagramas SVG de arquitecturas
- 💡 Analogías para facilitar comprensión

---

### **Capítulo 1: Graph Convolutional Networks (GCN)** 🕸️

**Archivo:** `1_Graph_Convolutional_Networks.ipynb`

**¿Qué aprenderás?**

Este capítulo introduce las Graph Neural Networks usando la arquitectura GCN:

1. **Introducción a PyTorch Geometric**
   - Instalación y configuración
   - Estructura de datos de grafos
   - Dataset Karate Club

2. **Representación de Grafos**
   - Matriz de adyacencia (A)
   - Lista de aristas (edge_index)
   - Características de nodos (x)
   - Etiquetas (y)

3. **El Dataset Karate Club** 🥋
   - 34 miembros de un club de karate
   - 2 comunidades (instructor vs presidente)
   - Problema: clasificar nodos en comunidades
   - Visualización del grafo

4. **Arquitectura GCN**
   ```python
   class GCN(torch.nn.Module):
       def __init__(self):
           self.gcn = GCNConv(num_features, 3)  # Capa GCN
           self.out = Linear(3, num_classes)     # Clasificador
   ```
   - Capa de convolución de grafos
   - Agregación de vecinos
   - Embeddings de 3 dimensiones

5. **Proceso de Agregación**
   - Cada nodo recoge información de sus vecinos
   - Combinación de features propias y de vecinos
   - Múltiples capas = contexto más amplio

6. **Entrenamiento**
   - 201 épocas de entrenamiento
   - Función de pérdida: CrossEntropy
   - Optimizador: Adam (lr=0.02)
   - Seguimiento de accuracy

7. **Visualizaciones**
   - Animación del proceso de clasificación
   - Embeddings en 3D
   - Evolución de la accuracy
   - Coloreado por comunidad

**Conceptos clave:**
- 🔑 **Message Passing**: Intercambio de información entre nodos
- 🔑 **Agregación**: Combinar información de vecinos
- 🔑 **Node Classification**: Predecir categoría de cada nodo
- 🔑 **Semi-supervised Learning**: Entrenar con pocos nodos etiquetados

---

### **Capítulo 2: Graph Attention Networks (GAT)** 👁️

**Archivo:** `2_Graph_Attention_Network.ipynb`

**¿Qué aprenderás?**

Las GAT mejoran las GCN usando mecanismos de atención:

1. **Limitaciones de GCN**
   - Trata todos los vecinos por igual
   - No diferencia importancia de conexiones
   - Agregación uniforme puede perder información

2. **Mecanismo de Atención**
   - Aprende qué vecinos son más relevantes
   - Pesos de atención dinámicos
   - Multi-head attention para capturar múltiples relaciones

3. **Dataset CiteSeer** 📄
   - Red de citas académicas
   - Nodos: artículos científicos
   - Aristas: citas entre artículos
   - Objetivo: clasificar artículos por tema

4. **Arquitectura GAT**
   ```python
   class GAT(torch.nn.Module):
       def __init__(self):
           self.gat1 = GATConv(features, 8, heads=8)  # 8 cabezas
           self.gat2 = GATConv(8*8, classes, heads=1)
   ```

5. **Ventajas sobre GCN**
   - Atención adaptativa a cada vecino
   - Mejor manejo de grafos heterogéneos
   - Más expresividad

**Aplicación en AML:**
- Identificar transacciones "importantes" en una red
- Detectar nodos centrales en esquemas de lavado
- Enfocarse en relaciones sospechosas

---

### **Capítulo 3: GraphSAGE** 🚀

**Archivo:** `3_GraphSAGE.ipynb`

**¿Qué aprenderás?**

GraphSAGE permite escalar GNNs a grafos masivos:

1. **Problema de Escalabilidad**
   - GCN/GAT requieren el grafo completo
   - Imposible para millones de nodos
   - Alto costo computacional

2. **Solución: Sampling**
   - Muestreo de vecinos fijo
   - Mini-batches de nodos
   - Aprendizaje inductivo

3. **Dataset PubMed** 🔬
   - Base de datos médica
   - Miles de artículos
   - Clasificación por categoría médica

4. **Agregadores**
   - Mean aggregator: promedio de vecinos
   - LSTM aggregator: secuencial
   - Pool aggregator: max/mean pooling

5. **Aprendizaje Inductivo**
   - Puede predecir en nodos no vistos
   - Útil cuando el grafo crece constantemente
   - Aplicable a nuevas transacciones

**Aplicación en AML:**
- Procesar millones de transacciones
- Actualización en tiempo real
- Detectar nuevos patrones de fraude

---

### **Capítulo 4: Graph Isomorphism Network (GIN)** 💪

**Archivo:** `4_Graph_Isomorphism_Network.ipynb`

**¿Qué aprenderás?**

GIN maximiza el poder expresivo de las GNNs:

1. **Test de Weisfeiler-Lehman**
   - ¿Qué grafos puede distinguir una GNN?
   - Isomorfismo de grafos
   - Limitaciones teóricas

2. **Arquitectura GIN**
   - Agregación inyectiva
   - MLP para transformaciones
   - Máximo poder discriminativo

3. **Dataset PROTEINS** 🧬
   - Estructuras de proteínas
   - Graph classification (no node classification)
   - Predecir función de proteína

4. **Graph-level Tasks**
   - Pooling de todo el grafo
   - Readout functions
   - Clasificación de grafos completos

**Aplicación en AML:**
- Clasificar patrones de transacciones completos
- Detectar esquemas específicos de lavado
- Comparar estructuras de redes criminales

---

## 🚀 Instalación y Configuración

### Requisitos del Sistema

**Software necesario:**
- 🐍 **Python 3.11 o superior** (recomendado: 3.11.x)
- 📦 **pip** (gestor de paquetes de Python)
- 💻 **8GB RAM mínimo** (16GB recomendado)
- 💾 **2GB de espacio en disco**
- 🖥️ **GPU (opcional)**: CUDA para aceleración (mejora significativa en rendimiento)

**Sistemas operativos compatibles:**
- ✅ Windows 10/11
- ✅ macOS (Intel/Apple Silicon)
- ✅ Linux (Ubuntu 20.04+, Debian, Fedora, etc.)

---

### 📥 Paso 1: Clonar el Repositorio

Abre tu terminal o línea de comandos y ejecuta:

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/MX014107492_EYGS/GNN_AML.git

# Navegar al directorio del proyecto
cd GNN_AML
```

**¿No tienes Git?** Descarga el ZIP desde GitHub:
1. Ve a https://github.com/MX014107492_EYGS/GNN_AML
2. Click en "Code" → "Download ZIP"
3. Descomprime el archivo

---

### 🔧 Paso 2: Crear Entorno Virtual

**¿Por qué un entorno virtual?**
- ✅ Aísla las dependencias del proyecto
- ✅ Evita conflictos con otros proyectos
- ✅ Facilita la reproducibilidad

```bash
# Crear entorno virtual llamado 'curso_gnn'
python -m venv curso_gnn
```

**Alternativa con conda:**
```bash
conda create -n curso_gnn python=3.11
```

---

### 🟢 Paso 3: Activar el Entorno

**Windows:**
```cmd
# En CMD
curso_gnn\Scripts\activate

# En PowerShell
curso_gnn\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
source curso_gnn/bin/activate
```

**Con conda:**
```bash
conda activate curso_gnn
```

**✅ Verificación:** Tu prompt debe mostrar `(curso_gnn)` al inicio

---

### 📦 Paso 4: Instalar Dependencias

**Opción A: Instalación Básica (CPU)**

```bash
# Actualizar pip
python -m pip install --upgrade pip

# Instalar PyTorch (CPU)
pip install torch torchvision torchaudio

# Instalar librerías científicas
pip install numpy matplotlib networkx

# Instalar PyTorch Geometric
pip install torch-scatter torch-sparse torch-cluster torch-spline-conv -f https://data.pyg.org/whl/torch-2.1.0+cpu.html
pip install torch-geometric

# Instalar Jupyter
pip install jupyter ipykernel
```

**Opción B: Instalación con GPU (CUDA 11.8)**

```bash
# Actualizar pip
python -m pip install --upgrade pip

# Instalar PyTorch con CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Instalar librerías científicas
pip install numpy matplotlib networkx

# Instalar PyTorch Geometric con CUDA
pip install torch-scatter torch-sparse torch-cluster torch-spline-conv -f https://data.pyg.org/whl/torch-2.1.0+cu118.html
pip install torch-geometric

# Instalar Jupyter
pip install jupyter ipykernel
```

**Opción C: Instalación desde requirements.txt**

```bash
# Si existe un archivo requirements.txt
pip install -r requirements.txt
```

---

### 🧪 Paso 5: Verificar la Instalación

Crea un script de prueba `test_installation.py`:

```python
import torch
import torch_geometric
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt

print("✅ PyTorch version:", torch.__version__)
print("✅ PyTorch Geometric version:", torch_geometric.__version__)
print("✅ CUDA available:", torch.cuda.is_available())
print("✅ NumPy version:", np.__version__)
print("✅ NetworkX version:", nx.__version__)
print("\n🎉 ¡Todas las dependencias instaladas correctamente!")
```

Ejecuta:
```bash
python test_installation.py
```

**Salida esperada:**
```
✅ PyTorch version: 2.1.0
✅ PyTorch Geometric version: 2.4.0
✅ CUDA available: False (o True si tienes GPU)
✅ NumPy version: 1.26.2
✅ NetworkX version: 3.2.1

🎉 ¡Todas las dependencias instaladas correctamente!
```

---

### 🚦 Paso 6: Iniciar Jupyter Notebook

```bash
# Registrar el entorno en Jupyter
python -m ipykernel install --user --name=curso_gnn --display-name="Python (GNN AML)"

# Iniciar Jupyter Notebook
jupyter notebook
```

Esto abrirá tu navegador en `http://localhost:8888`

**Alternativa: Jupyter Lab**
```bash
pip install jupyterlab
jupyter lab
```

**Alternativa: VS Code**
1. Instala la extensión "Python" y "Jupyter" en VS Code
2. Abre la carpeta del proyecto
3. Abre cualquier `.ipynb`
4. Selecciona el kernel "Python (GNN AML)"

---

### 🆘 Solución de Problemas Comunes

#### ❌ Error: "No module named torch_geometric"

**Solución:**
```bash
pip install torch-geometric
pip install torch-scatter torch-sparse -f https://data.pyg.org/whl/torch-2.1.0+cpu.html
```

#### ❌ Error: "Microsoft Visual C++ required"

**Windows:** Instala [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

#### ❌ Error: "CUDA not available" (quieres usar GPU)

1. Verifica drivers de NVIDIA: `nvidia-smi`
2. Reinstala PyTorch con CUDA correcto
3. Verifica compatibilidad GPU-CUDA

#### ❌ Error: "Permission denied" al activar entorno

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### ❌ Jupyter no encuentra el kernel

```bash
python -m ipykernel install --user --name=curso_gnn
```

#### ❌ Error de memoria durante entrenamiento

- Reduce batch size
- Usa menos workers en DataLoader
- Cierra otras aplicaciones
- Considera usar GPU

---

### 📚 Recursos Adicionales de Instalación

- 📖 [PyTorch Installation Guide](https://pytorch.org/get-started/locally/)
- 📖 [PyTorch Geometric Installation](https://pytorch-geometric.readthedocs.io/en/latest/install/installation.html)
- 📖 [Anaconda Documentation](https://docs.anaconda.com/)
- 📖 [Jupyter Documentation](https://jupyter.org/install)

---

## 📖 Cómo Usar Este Curso

### 🎯 Ruta de Aprendizaje Recomendada

#### **Para Principiantes Completos**

```
Paso 1️⃣: Chapter 0 - Neural Networks Fundamentals
         ├─ Lee el HTML guide primero (conceptos visuales)
         ├─ Ejecuta el notebook celda por celda
         └─ Experimenta cambiando parámetros

Paso 2️⃣: Chapter 1 - Graph Convolutional Networks
         ├─ Entiende la estructura de datos de grafos
         ├─ Visualiza el Karate Club dataset
         └─ Observa cómo el modelo aprende

Paso 3️⃣: Chapter 2 - Graph Attention Networks
         ├─ Comprende la diferencia con GCN
         └─ Analiza los pesos de atención

Paso 4️⃣: Chapter 3 - GraphSAGE
         ├─ Aprende sobre sampling
         └─ Entiende el aprendizaje inductivo

Paso 5️⃣: Chapter 4 - Graph Isomorphism Network
         └─ Conceptos avanzados y aplicaciones
```

#### **Para Practicantes de ML**

Si ya conoces redes neuronales:
- ⏭️ **Salta el Capítulo 0** o úsalo como referencia rápida
- 🎯 **Empieza en Capítulo 1** con GCN
- 🚀 **Avanza rápido** a GAT y GraphSAGE
- 🔬 **Experimenta** con tus propios datasets

#### **Para Expertos en GNN**

Si ya conoces GNNs:
- 📊 Usa los notebooks como **templates**
- 🔧 **Adapta** las arquitecturas a tus casos de uso
- 🎯 Enfócate en **aplicaciones de AML**
- 🌟 Contribuye con mejoras

---

### 🗂️ Estructura de Cada Capítulo

Cada notebook sigue esta estructura:

```python
1. 📦 Instalación de Dependencias
   └─ !pip install torch_geometric

2. 📚 Importaciones
   └─ import torch, numpy, networkx, matplotlib

3. 📊 Carga de Datos
   └─ dataset = KarateClub()
   └─ Exploración del dataset

4. 🏗️ Definición del Modelo
   └─ class GNN(torch.nn.Module)
   └─ Arquitectura de la red

5. 🎓 Entrenamiento
   └─ Loop de entrenamiento
   └─ Métricas (loss, accuracy)

6. 📈 Visualización
   └─ Gráficos de resultados
   └─ Animaciones de embeddings

7. 🔍 Análisis
   └─ Interpretación de resultados
   └─ Conclusiones
```

---

### 💻 Guía de Ejecución

#### **Opción 1: Jupyter Notebook (Recomendado para Aprendizaje)**

```bash
# Activar entorno
curso_gnn\Scripts\activate  # Windows
source curso_gnn/bin/activate  # Linux/Mac

# Iniciar Jupyter
jupyter notebook

# En el navegador:
# 1. Navega a la carpeta del curso
# 2. Abre el notebook deseado
# 3. Selecciona kernel "Python (GNN AML)"
# 4. Ejecuta celda por celda: Shift + Enter
```

**🎓 Tips de Jupyter:**
- `Shift + Enter`: Ejecutar celda y avanzar
- `Ctrl + Enter`: Ejecutar celda sin avanzar
- `A`: Insertar celda arriba
- `B`: Insertar celda abajo
- `DD`: Eliminar celda
- `M`: Convertir a Markdown
- `Y`: Convertir a código

#### **Opción 2: Google Colab (Sin Instalación)**

```bash
1. Ve a https://colab.research.google.com/
2. File → Upload notebook
3. Selecciona el .ipynb del capítulo
4. ¡Ejecuta directamente en la nube!
```

**⚠️ En Colab:** Cada sesión requiere reinstalar torch_geometric:
```python
!pip install -q torch-scatter torch-sparse torch-cluster torch-spline-conv torch-geometric
```

#### **Opción 3: VS Code (Para Desarrolladores)**

```bash
1. Abre VS Code en la carpeta del proyecto
2. Instala extensiones: Python, Jupyter
3. Abre cualquier .ipynb
4. Selecciona kernel: "Python (GNN AML)"
5. Click en "Run All" o ejecuta celda por celda
```

**✨ Ventajas de VS Code:**
- Intellisense y autocompletado
- Debugging integrado
- Git integration
- Terminal integrada

#### **Opción 4: Script Python (Para Producción)**

Convierte notebooks a scripts:

```bash
# Convertir notebook a .py
jupyter nbconvert --to script 1_Graph_Convolutional_Networks.ipynb

# Ejecutar script
python 1_Graph_Convolutional_Networks.py
```

---

### 🎨 Trabajando con el HTML Guide (Capítulo 0)

El Capítulo 0 incluye un **HTML Guide interactivo**:

#### **Cómo usarlo:**

```bash
# Opción 1: Abrir directamente en navegador
# 1. Navega a la carpeta del proyecto
# 2. Doble click en Chapter0_Neural_Networks_Fundamentals.html
# 3. Se abre en tu navegador predeterminado

# Opción 2: Desde VS Code
# 1. Click derecho en el archivo .html
# 2. "Open with Live Server" (necesita extensión Live Server)
```

#### **Navegación del HTML:**

1. **Tabla de Correspondencia** (inicio)
   - Mapeo de secciones HTML → Celdas del notebook
   - Usa esto como índice

2. **Secciones Numeradas**
   - 10 secciones principales
   - Cada una con:
     - 🎯 Explicación conceptual
     - 📊 Diagramas visuales
     - 💡 Analogías
     - ⚡ Prompts de ejecución (qué celdas ejecutar)

3. **Prompts de Ejecución**
   - Ejemplo: "🔮 Celda 7: Datos en círculo"
   - Indica qué celdas ejecutar en el notebook
   - Emojis para identificación rápida

#### **Flujo de Trabajo Óptimo:**

```
1. Lee una sección del HTML (conceptos)
     ↓
2. Abre el notebook
     ↓
3. Ejecuta las celdas indicadas en el prompt
     ↓
4. Observa los resultados
     ↓
5. Vuelve al HTML para profundizar
     ↓
6. Experimenta en el notebook
```

---

### 🧪 Experimentación y Modificaciones

#### **Ejercicios Sugeridos por Capítulo**

**Capítulo 0:**
- 🔧 Cambia el learning rate: `lr=0.01`, `lr=0.1`, `lr=0.001`
- 🔧 Agrega más capas ocultas: `[32, 64, 32]`
- 🔧 Prueba diferentes activaciones: `tanh()`, `sigmoid()`
- 🔧 Modifica el dropout: `p=0.1`, `p=0.5`, `p=0.8`

**Capítulo 1 (GCN):**
- 🔧 Cambia el tamaño de embeddings: `hidden=3` → `hidden=16`
- 🔧 Aumenta épocas: `range(201)` → `range(500)`
- 🔧 Modifica el optimizador: `SGD` en lugar de `Adam`
- 🔧 Prueba diferentes learning rates

**Capítulo 2 (GAT):**
- 🔧 Cambia número de attention heads: `heads=8` → `heads=4`
- 🔧 Visualiza los pesos de atención
- 🔧 Compara resultados con GCN

**Capítulo 3 (GraphSAGE):**
- 🔧 Modifica el número de vecinos: `num_neighbors`
- 🔧 Prueba diferentes agregadores: `mean`, `max`, `lstm`
- 🔧 Ajusta el batch size

**Capítulo 4 (GIN):**
- 🔧 Cambia la arquitectura del MLP
- 🔧 Experimenta con diferentes pooling strategies

#### **Cómo Guardar tus Experimentos**

```python
# Guardar modelo entrenado
torch.save(model.state_dict(), 'mi_modelo_gcn.pth')

# Cargar modelo
model = GCN()
model.load_state_dict(torch.load('mi_modelo_gcn.pth'))

# Guardar métricas
import json
metrics = {'loss': losses, 'accuracy': accuracies}
with open('metrics.json', 'w') as f:
    json.dump(metrics, f)
```

---

### 📊 Visualizaciones y Gráficos

Cada capítulo incluye visualizaciones:

#### **Tipos de Visualizaciones**

1. **Grafos de Red**
   ```python
   nx.draw_networkx(G, pos=nx.spring_layout(G))
   ```
   - Nodos coloreados por clase
   - Tamaño proporcional a importancia
   - Aristas que muestran conexiones

2. **Embeddings 3D**
   ```python
   ax = fig.add_subplot(projection='3d')
   ax.scatter(embed[:, 0], embed[:, 1], embed[:, 2])
   ```
   - Cómo el modelo "ve" los nodos
   - Separación de clases en el espacio

3. **Animaciones**
   ```python
   anim = animation.FuncAnimation(fig, animate, frames)
   ```
   - Evolución del aprendizaje
   - Cambio de clasificaciones

4. **Curvas de Aprendizaje**
   ```python
   plt.plot(epochs, losses, label='Loss')
   plt.plot(epochs, accuracies, label='Accuracy')
   ```
   - Convergencia del modelo
   - Detección de overfitting

#### **Guardando Visualizaciones**

```python
# Guardar figura estática
plt.savefig('mi_grafico.png', dpi=300, bbox_inches='tight')

# Guardar animación
anim.save('training_animation.mp4', writer='ffmpeg', fps=30)

# Crear HTML interactivo
from IPython.display import HTML
HTML(anim.to_html5_video())
```

---

## 🏦 Aplicaciones a Anti-Money Laundering (AML)

### ¿Por qué GNNs para AML?

Las transacciones financieras forman **grafos naturales**:

```
    [Cliente A] ----$500----> [Cliente B]
         |                        |
       $1000                    $300
         |                        |
         v                        v
    [Empresa X] <---$200---- [Empresa Y]
```

**Ventajas de GNNs sobre métodos tradicionales:**

| Método Tradicional | GNN |
|-------------------|-----|
| 🔴 Analiza transacciones individuales | 🟢 Analiza redes completas |
| 🔴 Reglas estáticas (ej: >$10k) | 🟢 Aprende patrones complejos |
| 🔴 Alto false positive rate | 🟢 Contexto reduce falsos positivos |
| 🔴 No detecta smurfing/layering | 🟢 Detecta patrones multi-hop |
| 🔴 Fácil de evadir | 🟢 Adaptativo y robusto |

---

### 🎯 Casos de Uso Específicos

#### **1. Detección de Smurfing**

**Problema:** Dividir grandes sumas en transacciones pequeñas

```python
# Red de smurfing típica
Central_Account --$500--> Account_1
                --$400--> Account_2
                --$300--> Account_3
                --$600--> Account_4
                  ...
                --$450--> Account_N
```

**Cómo GNN ayuda:**
- 🎯 Detecta patrones de "estrella" (un nodo central)
- 🎯 Identifica montos similares en corto tiempo
- 🎯 Aprende el patrón sin reglas explícitas

**Implementación:**
```python
# Características del nodo
node_features = [
    'total_amount',        # Suma de transacciones
    'num_transactions',    # Cantidad de transacciones
    'time_variance',       # Varianza temporal
    'avg_amount',          # Monto promedio
    'degree_centrality'    # Número de conexiones
]

# GCN aprende a combinar estas features
# considerando la estructura del grafo
```

---

#### **2. Detección de Layering**

**Problema:** Múltiples capas de transacciones para ocultar origen

```
Ilícito -> Cuenta A -> Cuenta B -> Cuenta C -> Legítimo
           (Layer 1)   (Layer 2)   (Layer 3)
```

**Cómo GNN ayuda:**
- 🎯 Capas GNN = capas de transacciones
- 🎯 Embeddings capturan caminos sospechosos
- 🎯 Atención identifica flujos críticos

**Arquitectura sugerida:**
```python
class AML_GNN(torch.nn.Module):
    def __init__(self):
        # 3 capas GCN para capturar 3 hops
        self.conv1 = GCNConv(features, 64)
        self.conv2 = GCNConv(64, 32)
        self.conv3 = GCNConv(32, 16)
        
        # Clasificador
        self.classifier = Linear(16, 2)  # Legítimo vs Sospechoso
    
    def forward(self, x, edge_index):
        # Cada capa agrega info de vecinos más lejanos
        h1 = self.conv1(x, edge_index).relu()
        h2 = self.conv2(h1, edge_index).relu()
        h3 = self.conv3(h2, edge_index).relu()
        
        return self.classifier(h3)
```

---

#### **3. Detección de Redes de Mulas**

**Problema:** Redes de cuentas intermediarias

```
         [Cuenta criminal]
              /    |    \
             /     |     \
        [Mula1] [Mula2] [Mula3]
           |       |       |
        [Destino1] [Destino2] [Destino3]
```

**Cómo GNN ayuda:**
- 🎯 GAT aprende qué conexiones son importantes
- 🎯 GraphSAGE escala a miles de cuentas
- 🎯 Clasificación de comunidades

**Features importantes:**
```python
account_features = {
    'account_age': days_since_opening,
    'kyc_score': kyc_verification_level,
    'transaction_frequency': tx_per_day,
    'balance_volatility': std(daily_balance),
    'cross_border_ratio': foreign_tx / total_tx,
    'round_amount_ratio': round_tx / total_tx,  # $1000, $5000
    'dormant_activation': was_dormant_then_active
}
```

---

#### **4. Identificación de Estructuras Cíclicas**

**Problema:** Dinero que vuelve al origen (round-tripping)

```
A --> B --> C --> D --> A  (círculo sospechoso)
```

**Cómo GNN ayuda:**
- 🎯 GIN detecta isomorfismos (estructuras repetidas)
- 🎯 Embeddings de grafos completos
- 🎯 Clasificación de subgrafos

---

### 🔬 Pipeline Completo de AML con GNN

```python
# 1. PREPARACIÓN DE DATOS
class TransactionGraph:
    def __init__(self, transactions_df):
        # Crear grafo dirigido
        self.G = nx.DiGraph()
        
        # Nodos = cuentas
        for account in transactions_df['account'].unique():
            self.G.add_node(account)
        
        # Aristas = transacciones
        for _, tx in transactions_df.iterrows():
            self.G.add_edge(
                tx['from_account'],
                tx['to_account'],
                amount=tx['amount'],
                timestamp=tx['timestamp'],
                type=tx['type']
            )

# 2. FEATURE ENGINEERING
def compute_node_features(G, account):
    features = []
    
    # Características básicas
    features.append(G.in_degree(account))   # Transacciones recibidas
    features.append(G.out_degree(account))  # Transacciones enviadas
    
    # Características de montos
    in_amounts = [G[u][account]['amount'] for u in G.predecessors(account)]
    out_amounts = [G[account][v]['amount'] for v in G.successors(account)]
    
    features.append(np.sum(in_amounts))     # Total recibido
    features.append(np.sum(out_amounts))    # Total enviado
    features.append(np.std(in_amounts))     # Volatilidad ingresos
    features.append(np.std(out_amounts))    # Volatilidad egresos
    
    # Características de red
    features.append(nx.pagerank(G)[account])           # Importancia
    features.append(nx.betweenness_centrality(G)[account])  # Intermediación
    features.append(nx.clustering(G.to_undirected())[account])  # Clustering
    
    return features

# 3. MODELO GNN
class AML_Detector(torch.nn.Module):
    def __init__(self, num_features):
        super().__init__()
        
        # Stack de GNN layers
        self.conv1 = GATConv(num_features, 64, heads=8)
        self.conv2 = GATConv(64*8, 32, heads=4)
        self.conv3 = GATConv(32*4, 16, heads=1)
        
        # Dropout para regularización
        self.dropout = torch.nn.Dropout(0.3)
        
        # Clasificador final
        self.classifier = torch.nn.Sequential(
            Linear(16, 8),
            torch.nn.ReLU(),
            Linear(8, 3)  # 3 clases: Legítimo, Sospechoso, Alta_Prioridad
        )
    
    def forward(self, x, edge_index):
        # Primera capa con atención
        h = self.conv1(x, edge_index).relu()
        h = self.dropout(h)
        
        # Segunda capa
        h = self.conv2(h, edge_index).relu()
        h = self.dropout(h)
        
        # Tercera capa
        h = self.conv3(h, edge_index).relu()
        
        # Clasificación
        return self.classifier(h)

# 4. ENTRENAMIENTO
def train_aml_model(model, data, labeled_accounts):
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = torch.nn.CrossEntropyLoss()
    
    for epoch in range(100):
        model.train()
        optimizer.zero_grad()
        
        # Forward pass
        out = model(data.x, data.edge_index)
        
        # Loss solo en cuentas etiquetadas
        loss = criterion(out[labeled_accounts], data.y[labeled_accounts])
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            print(f'Epoch {epoch}, Loss: {loss.item():.4f}')

# 5. INFERENCIA Y ALERTAS
def generate_alerts(model, data, threshold=0.8):
    model.eval()
    with torch.no_grad():
        predictions = model(data.x, data.edge_index)
        probabilities = torch.softmax(predictions, dim=1)
        
        # Cuentas con alta probabilidad de sospecha
        suspicious = probabilities[:, 1] > threshold  # Clase "Sospechoso"
        high_priority = probabilities[:, 2] > 0.9     # Clase "Alta_Prioridad"
        
        alerts = []
        for account_id in torch.where(suspicious | high_priority)[0]:
            alerts.append({
                'account': account_id.item(),
                'suspicion_score': probabilities[account_id, 1].item(),
                'priority_score': probabilities[account_id, 2].item(),
                'recommendation': 'INVESTIGATE' if high_priority[account_id] else 'MONITOR'
            })
        
        return sorted(alerts, key=lambda x: x['priority_score'], reverse=True)
```

---

### 📊 Métricas de Evaluación para AML

**Métricas importantes:**

```python
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score
)

def evaluate_aml_model(predictions, ground_truth):
    metrics = {}
    
    # Precisión: De las alertas, ¿cuántas son correctas?
    metrics['precision'] = precision_score(ground_truth, predictions)
    
    # Recall: De los casos reales, ¿cuántos detectamos?
    metrics['recall'] = recall_score(ground_truth, predictions)
    
    # F1: Balance entre precisión y recall
    metrics['f1'] = f1_score(ground_truth, predictions)
    
    # AUC-ROC: Capacidad de discriminación
    metrics['auc_roc'] = roc_auc_score(ground_truth, predictions)
    
    # Métricas de negocio
    num_alerts = predictions.sum()
    true_positives = ((predictions == 1) & (ground_truth == 1)).sum()
    
    metrics['alert_rate'] = num_alerts / len(predictions)
    metrics['true_positive_rate'] = true_positives / num_alerts
    
    # SAR (Suspicious Activity Report) efficiency
    metrics['sar_efficiency'] = true_positives / ground_truth.sum()
    
    return metrics
```

**Interpretación:**

| Métrica | Óptimo | Significado en AML |
|---------|--------|-------------------|
| Precision | >0.80 | Pocas alertas falsas → Menos investigaciones inútiles |
| Recall | >0.90 | Detectamos mayoría de casos → Cumplimiento regulatorio |
| F1 Score | >0.85 | Balance general del sistema |
| AUC-ROC | >0.95 | Excelente discriminación |
| Alert Rate | <0.05 | No saturamos el equipo de compliance |

---

### 🎓 Ejercicio Práctico: Detección de Smurfing

**Dataset sintético:**

```python
# Crear dataset de smurfing
import pandas as pd
import numpy as np

def generate_smurfing_dataset(num_normal=1000, num_smurfing=50):
    transactions = []
    
    # Transacciones normales
    for i in range(num_normal):
        transactions.append({
            'from': f'account_{np.random.randint(0, 500)}',
            'to': f'account_{np.random.randint(500, 1000)}',
            'amount': np.random.lognormal(6, 2),  # Distribución realista
            'is_suspicious': 0
        })
    
    # Patrones de smurfing
    for i in range(num_smurfing):
        central = f'smurfing_central_{i}'
        num_smurfs = np.random.randint(10, 30)
        base_amount = 500  # Justo debajo del umbral
        
        for j in range(num_smurfs):
            transactions.append({
                'from': central,
                'to': f'smurf_{i}_{j}',
                'amount': base_amount + np.random.randint(-50, 50),
                'is_suspicious': 1
            })
    
    return pd.DataFrame(transactions)

# Generar y entrenar
df = generate_smurfing_dataset()
# ... convertir a grafo y entrenar modelo
```

**Tarea:**
1. ✅ Genera el dataset
2. ✅ Convierte a grafo PyTorch Geometric
3. ✅ Entrena un modelo GCN
4. ✅ Evalúa precision/recall
5. ✅ Visualiza los patrones detectados

---

### 🔐 Consideraciones de Privacidad y Compliance

**Importante para aplicaciones reales:**

1. **Anonimización**
   ```python
   # Hashear IDs de cuentas
   import hashlib
   account_id_hashed = hashlib.sha256(account_id.encode()).hexdigest()
   ```

2. **Differential Privacy**
   - Agregar ruido a gradientes
   - Limitar la influencia de un solo ejemplo
   
3. **Explicabilidad**
   ```python
   # Usar GNNExplainer para justificar alertas
   from torch_geometric.explain import GNNExplainer
   explainer = GNNExplainer(model)
   explanation = explainer.explain_node(node_idx, x, edge_index)
   ```

4. **Auditoría**
   - Registrar todas las predicciones
   - Versionar modelos
   - Documentar decisiones

---

### 📚 Recursos Adicionales para AML

- 📖 [FATF Recommendations](https://www.fatf-gafi.org/)
- 📖 [FinCEN Guidelines](https://www.fincen.gov/)
- 📖 [Graph ML for AML (Paper)](https://arxiv.org/abs/2009.08591)
- 📖 [Elliptic Bitcoin Dataset](https://www.kaggle.com/ellipticco/elliptic-data-set)

---

## 🔧 Tecnologías y Herramientas

### 📚 Bibliotecas Principales

#### **PyTorch** 🔥
```python
import torch
```
- Framework de deep learning más popular
- Computación dinámica de grafos
- Soporte CUDA para GPU
- Ecosistema extenso

**Versión requerida:** ≥2.0.0

#### **PyTorch Geometric** 🌐
```python
import torch_geometric
from torch_geometric.nn import GCNConv, GATConv, SAGEConv
from torch_geometric.data import Data, DataLoader
```
- Extensión especializada para GNNs
- Implementaciones optimizadas de GCN, GAT, GraphSAGE, GIN
- DataLoaders eficientes para grafos
- Mini-batching para grafos grandes

**Versión requerida:** ≥2.3.0

#### **NetworkX** 🕸️
```python
import networkx as nx
```
- Creación y manipulación de grafos
- Algoritmos de grafos (shortest path, centrality, etc.)
- Conversión entre formatos
- Visualización básica

**Uso en el curso:**
- Visualizar datasets
- Calcular métricas de red
- Análisis exploratorio

#### **NumPy** 🔢
```python
import numpy as np
```
- Operaciones numéricas eficientes
- Arrays multidimensionales
- Álgebra lineal
- Funciones matemáticas

**Versión requerida:** ≥1.24.0

#### **Matplotlib** 📊
```python
import matplotlib.pyplot as plt
from matplotlib import animation
```
- Visualizaciones estáticas
- Animaciones
- Gráficos de entrenamiento
- Embeddings 3D

**Versión recomendada:** ≥3.7.0

---

### 🛠️ Herramientas de Desarrollo

#### **Jupyter Notebook/Lab**
```bash
pip install jupyter jupyterlab
```
- Entorno interactivo
- Ejecución celda por celda
- Visualizaciones inline
- Markdown para documentación

**Comandos útiles:**
```bash
jupyter notebook          # Inicia Jupyter Notebook
jupyter lab              # Inicia Jupyter Lab (más moderno)
jupyter notebook list    # Ver notebooks activos
```

#### **VS Code**
- Editor recomendado para desarrollo
- Extensiones necesarias:
  - `Python` (ms-python.python)
  - `Jupyter` (ms-toolsai.jupyter)
  - `Pylance` (ms-python.vscode-pylance)

#### **Git**
```bash
git --version  # Verificar instalación
```
- Control de versiones
- Colaboración
- Branches para experimentos

---

### 📦 Dependencias Completas

**Lista completa de paquetes:**

```txt
# Core
torch>=2.0.0
torchvision>=0.15.0
torchaudio>=2.0.0

# PyTorch Geometric
torch-geometric>=2.3.0
torch-scatter>=2.1.0
torch-sparse>=0.6.0
torch-cluster>=1.6.0
torch-spline-conv>=1.2.0

# Ciencia de datos
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0

# Visualización
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.14.0

# Grafos
networkx>=3.0

# Jupyter
jupyter>=1.0.0
jupyterlab>=4.0.0
ipykernel>=6.0.0
ipywidgets>=8.0.0

# Utilidades
tqdm>=4.65.0  # Barras de progreso
```

**Crear archivo `requirements.txt`:**

```bash
# Guardar dependencias actuales
pip freeze > requirements.txt

# Instalar desde requirements.txt
pip install -r requirements.txt
```

---

### 🖥️ Requisitos de Hardware

#### **Configuración Mínima**
- **CPU:** Intel i5 / AMD Ryzen 5 o superior
- **RAM:** 8 GB
- **Almacenamiento:** 2 GB libres
- **GPU:** No requerida (CPU funciona)

**Rendimiento esperado:** Capítulos 0-2 ejecutan bien en CPU

#### **Configuración Recomendada**
- **CPU:** Intel i7 / AMD Ryzen 7 o superior
- **RAM:** 16 GB
- **Almacenamiento:** 5 GB libres (con datasets)
- **GPU:** NVIDIA GTX 1660 o superior (6GB VRAM)

**Rendimiento esperado:** Todos los capítulos fluidos, experimentos rápidos

#### **Configuración Óptima**
- **CPU:** Intel i9 / AMD Ryzen 9 o superior
- **RAM:** 32 GB
- **Almacenamiento:** SSD con 10 GB libres
- **GPU:** NVIDIA RTX 3080 o superior (10GB+ VRAM)

**Rendimiento esperado:** Entrenamientos instantáneos, datasets grandes

---

### ☁️ Alternativas Cloud (Sin Hardware Local)

#### **Google Colab** 
- ✅ Gratis con GPU
- ✅ No requiere instalación
- ✅ 12GB RAM, Tesla T4 GPU
- ⚠️ Sesiones de 12 horas máximo
- ⚠️ Requiere reconexión frecuente

**Cómo usar:**
```python
# Montar Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Instalar dependencias
!pip install -q torch-geometric
```

#### **Kaggle Notebooks** 
- ✅ Gratis con GPU
- ✅ 16GB RAM, P100 GPU
- ✅ 30 horas/semana
- ✅ Datasets pre-cargados

#### **AWS SageMaker** 💰
- ⚡ Instancias potentes
- ⚡ Escalable
- ⚠️ Costo por uso
- ⚠️ Configuración más compleja

#### **Azure Machine Learning** 💰
- ⚡ Integración con EY
- ⚡ Enterprise features
- ⚠️ Requiere suscripción

---

### 🔍 Verificación de Configuración GPU

```python
import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU device: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
else:
    print("Running on CPU")

# Test tensor en GPU
if torch.cuda.is_available():
    x = torch.randn(1000, 1000).cuda()
    y = torch.randn(1000, 1000).cuda()
    z = x @ y  # Multiplicación matricial en GPU
    print("✅ GPU test passed!")
```

**Troubleshooting GPU:**

```bash
# Verificar drivers NVIDIA
nvidia-smi

# Reinstalar PyTorch con CUDA
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verificar compatibilidad CUDA
python -c "import torch; print(torch.cuda.is_available())"
```

---

## 📁 Estructura del Proyecto

```
GNN_AML/
│
├── 📓 0_Neural_Networks_Fundamentals.ipynb
│   └── Fundamentos de redes neuronales
│
├── 🌐 Chapter0_Neural_Networks_Fundamentals.html
│   └── Guía HTML interactiva del Capítulo 0
│
├── 📓 1_Graph_Convolutional_Networks.ipynb
│   └── Introducción a GCN con Karate Club
│
├── 📓 2_Graph_Attention_Network.ipynb
│   └── GAT con mecanismos de atención
│
├── 📓 3_GraphSAGE.ipynb
│   └── Escalado con sampling
│
├── 📓 4_Graph_Isomorphism_Network.ipynb
│   └── Máximo poder expresivo
│
├── 📂 images/
│   ├── colab.svg
│   └── (otras imágenes de documentación)
│
├── 📄 .gitignore
│   └── Archivos a ignorar en Git
│
├── 📄 README.md
│   └── Este archivo
│
└── 📄 requirements.txt (opcional)
    └── Lista de dependencias

```

**Archivos generados durante uso:**
```
GNN_AML/
├── 📂 curso_gnn/              # Entorno virtual (ignorado por Git)
├── 📂 .ipynb_checkpoints/     # Checkpoints de Jupyter (ignorado)
├── 📄 *.pth                   # Modelos guardados
├── 📄 *.png / *.mp4           # Visualizaciones guardadas
└── 📂 __pycache__/            # Cache de Python (ignorado)
```

---

## 🎯 Objetivos de Aprendizaje

### 🎓 Al Completar el Curso Completo

#### **Conocimientos Fundamentales**
- ✅ **Redes Neuronales**: Arquitectura, entrenamiento, optimización
- ✅ **Grafos**: Teoría básica, representaciones, métricas
- ✅ **PyTorch**: Tensores, autograd, modelos, entrenamiento
- ✅ **Álgebra Lineal**: Matrices, vectores, operaciones

#### **Competencias en GNN**
- ✅ **GCN**: Implementar y entrenar Graph Convolutional Networks
- ✅ **GAT**: Usar mecanismos de atención en grafos
- ✅ **GraphSAGE**: Escalar a grafos grandes con sampling
- ✅ **GIN**: Comprender poder expresivo de GNNs

#### **Habilidades Prácticas**
- ✅ **Data Processing**: Convertir datos a formato de grafo
- ✅ **Model Training**: Entrenar, validar, evaluar modelos
- ✅ **Visualization**: Graficar resultados, embeddings, métricas
- ✅ **Debugging**: Solucionar problemas comunes

#### **Aplicaciones Específicas**
- ✅ **AML**: Detectar patrones de lavado de dinero
- ✅ **Fraud Detection**: Identificar transacciones sospechosas
- ✅ **Network Analysis**: Analizar estructuras complejas
- ✅ **Production**: Desplegar modelos en producción

### 📊 Progresión de Habilidades

```
Nivel 1 (Capítulo 0): Fundamentos de NN
├─ Entiendes backpropagation
├─ Puedes entrenar una red simple
└─ Conoces funciones de activación/pérdida

Nivel 2 (Capítulo 1): Introducción a GNN
├─ Comprendes message passing
├─ Implementas tu primer GCN
└─ Visualizas embeddings

Nivel 3 (Capítulo 2): GNN Intermedio
├─ Usas mecanismos de atención
├─ Entiendes multi-head attention
└─ Comparas diferentes arquitecturas

Nivel 4 (Capítulo 3): GNN Avanzado
├─ Implementas mini-batching
├─ Escalas a grafos grandes
└─ Aprendizaje inductivo

Nivel 5 (Capítulo 4): GNN Experto
├─ Comprendes teoría de expresividad
├─ Clasificas grafos completos
└─ Optimizas arquitecturas
```

---

## 📝 Certificación y Evaluación

### ✅ Criterios de Completitud

**Para considerar el curso completado:**

1. **Capítulo 0** (Obligatorio)
   - [ ] Ejecutar todas las celdas del notebook
   - [ ] Leer todo el HTML guide
   - [ ] Completar al menos 2 ejercicios de experimentación
   - [ ] Entender conceptos: backprop, activaciones, optimizadores

2. **Capítulo 1** (Obligatorio)
   - [ ] Ejecutar notebook completo
   - [ ] Entrenar modelo GCN exitosamente
   - [ ] Visualizar embeddings
   - [ ] Accuracy >90% en Karate Club

3. **Capítulo 2** (Obligatorio)
   - [ ] Implementar GAT
   - [ ] Comparar con GCN
   - [ ] Analizar pesos de atención

4. **Capítulo 3** (Recomendado)
   - [ ] Entender sampling
   - [ ] Implementar mini-batching
   - [ ] Entrenar en dataset grande

5. **Capítulo 4** (Avanzado)
   - [ ] Comprender WL test
   - [ ] Implementar GIN
   - [ ] Graph-level classification

### 🏆 Proyecto Final Sugerido

**Opción 1: Detección de Smurfing**
```
Objetivo: Construir un detector de smurfing usando GNN
Datos: Dataset sintético de transacciones
Entregables:
  - Notebook con implementación completa
  - Reporte de métricas (precision, recall, F1)
  - Visualización de patrones detectados
  - Documento de 2-3 páginas explicando el enfoque
```

**Opción 2: Clasificación de Comunidades**
```
Objetivo: Detectar comunidades en red de transacciones
Datos: Dataset real (ej: Elliptic Bitcoin)
Entregables:
  - Modelo GNN entrenado
  - Comparación de GCN vs GAT vs GraphSAGE
  - Análisis de comunidades encontradas
  - Presentación de 10 slides
```

**Opción 3: Predicción de Enlaces**
```
Objetivo: Predecir futuras transacciones
Datos: Red temporal de transacciones
Entregables:
  - Modelo de link prediction
  - Evaluación temporal (train/test por tiempo)
  - Análisis de features importantes
  - Dashboard interactivo
```

### 📊 Rúbrica de Evaluación

| Criterio | Peso | Excelente (5) | Bueno (3-4) | Suficiente (2) | Insuficiente (0-1) |
|----------|------|---------------|-------------|----------------|-------------------|
| **Código** | 30% | Funcional, limpio, documentado | Funcional, algo documentado | Funcional básico | No funciona |
| **Resultados** | 30% | Métricas excelentes, visualizaciones | Métricas buenas | Métricas aceptables | Métricas pobres |
| **Análisis** | 20% | Insights profundos, comparaciones | Análisis correcto | Análisis básico | Sin análisis |
| **Documentación** | 20% | Completa, clara, profesional | Buena explicación | Explicación básica | Sin documentación |

**Calificación mínima para aprobar:** 60/100

---

## 🤝 Contribuciones y Mejoras

### 💡 Cómo Contribuir

Este proyecto acepta contribuciones para mejorar el material educativo:

**Tipos de contribuciones bienvenidas:**

1. **Correcciones** 🐛
   - Errores de código
   - Typos en documentación
   - Links rotos
   - Bugs en notebooks

2. **Mejoras** ✨
   - Nuevos ejercicios
   - Visualizaciones adicionales
   - Explicaciones más claras
   - Optimizaciones de código

3. **Nuevos Contenidos** 🎁
   - Casos de uso adicionales
   - Datasets de ejemplo
   - Tutoriales complementarios
   - Guías de troubleshooting

### 📋 Proceso de Contribución

```bash
# 1. Fork el repositorio en GitHub
# 2. Clone tu fork
git clone https://github.com/TU_USUARIO/GNN_AML.git
cd GNN_AML

# 3. Crea una branch para tu feature
git checkout -b feature/mi-mejora

# 4. Haz tus cambios
# ... edita archivos ...

# 5. Commit con mensaje descriptivo
git add .
git commit -m "Add: Nuevo ejercicio de detección de fraude"

# 6. Push a tu fork
git push origin feature/mi-mejora

# 7. Crea Pull Request en GitHub
```

**Lineamientos para PRs:**
- ✅ Descripción clara de los cambios
- ✅ Código probado y funcional
- ✅ Documentación actualizada
- ✅ Sigue el estilo del proyecto
- ✅ Un tema por PR

### 🐛 Reportar Issues

**Formato para reportar bugs:**

```markdown
**Título:** [BUG] Descripción breve

**Descripción:**
Explicación detallada del problema

**Pasos para Reproducir:**
1. Ejecutar notebook X
2. Ejecutar celda Y
3. Ver error

**Comportamiento Esperado:**
Qué debería pasar

**Comportamiento Actual:**
Qué pasa realmente

**Entorno:**
- OS: Windows 11
- Python: 3.11.5
- PyTorch: 2.1.0
- PyG: 2.4.0

**Screenshots:**
(si aplica)
```

---

## 🆘 FAQ y Troubleshooting

### ❓ Preguntas Frecuentes

#### **Q: ¿Necesito conocimientos previos de ML?**
A: Para el Capítulo 0, no. Para capítulos 1-4, conocimientos básicos ayudan pero no son estrictamente necesarios.

#### **Q: ¿Cuánto tiempo toma completar el curso?**
A: 
- **Rápido** (solo notebooks): 8-10 horas
- **Completo** (con ejercicios): 20-30 horas
- **Profundo** (con proyecto final): 40-50 horas

#### **Q: ¿Puedo usar esto en producción?**
A: Los notebooks son educativos. Para producción, necesitas:
- Validación adicional
- Testing robusto
- Manejo de errores
- Escalabilidad
- Monitoreo

#### **Q: ¿Funciona sin GPU?**
A: Sí, todos los ejemplos funcionan en CPU. GPU acelera el entrenamiento pero no es obligatoria.

#### **Q: ¿Qué dataset usar para AML real?**
A: Datasets públicos:
- [Elliptic Bitcoin Dataset](https://www.kaggle.com/ellipticco/elliptic-data-set)
- [IEEE-CIS Fraud Detection](https://www.kaggle.com/c/ieee-fraud-detection)
- Genera datasets sintéticos para prototipos

#### **Q: ¿Cómo cito este material?**
A:
```bibtex
@misc{gnn_aml_course,
  title={Graph Neural Networks Course - AML Applications},
  author={EY Analytics Team},
  year={2026},
  publisher={GitHub},
  url={https://github.com/MX014107492_EYGS/GNN_AML}
}
```

### 🔧 Problemas Comunes

#### **Error: "CUDA out of memory"**

**Soluciones:**
```python
# 1. Reduce batch size
batch_size = 32  # en lugar de 128

# 2. Reduce tamaño de modelo
hidden_channels = 32  # en lugar de 128

# 3. Usa gradient accumulation
# ... entrena en mini-mini-batches

# 4. Limpia cache de GPU
torch.cuda.empty_cache()

# 5. Usa CPU
device = 'cpu'
model = model.to(device)
```

#### **Error: "RuntimeError: Expected all tensors on same device"**

**Solución:**
```python
# Asegúrate que modelo y datos estén en mismo device
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = model.to(device)
data = data.to(device)
```

#### **Advertencia: "UserWarning: To copy construct from a tensor"**

**Solución:**
```python
# En lugar de:
tensor = torch.tensor(some_tensor)

# Usa:
tensor = some_tensor.clone()
```

#### **Error: "KeyError" en dataset**

**Solución:**
```python
# Verifica estructura del dataset
print(data)  # Imprime info del Data object
print(data.keys)  # Ve qué atributos tiene
```

#### **Notebooks muy lentos**

**Soluciones:**
- Cierra otras aplicaciones
- Reduce tamaño de dataset para pruebas
- Usa GPU si disponible
- Aumenta RAM del sistema
- Usa entorno virtual limpio

---

## 📚 Recursos Adicionales

### 📖 Lecturas Recomendadas

**Fundamentos:**
- 📘 [Deep Learning Book](https://www.deeplearningbook.org/) - Goodfellow, Bengio, Courville
- 📘 [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/) - Michael Nielsen

**Graph Neural Networks:**
- 📄 [Graph Neural Networks: A Review](https://arxiv.org/abs/1812.08434)
- 📄 [Geometric Deep Learning](https://arxiv.org/abs/2104.13478) - Bronstein et al.
- 📄 [Stanford CS224W](http://web.stanford.edu/class/cs224w/) - Course materials

**Papers Importantes:**
- 📄 [GCN Paper](https://arxiv.org/abs/1609.02907) - Kipf & Welling, 2016
- 📄 [GAT Paper](https://arxiv.org/abs/1710.10903) - Veličković et al., 2017
- 📄 [GraphSAGE Paper](https://arxiv.org/abs/1706.02216) - Hamilton et al., 2017
- 📄 [GIN Paper](https://arxiv.org/abs/1810.00826) - Xu et al., 2018

**AML/Fraud Detection:**
- 📄 [Graph-based Anomaly Detection](https://arxiv.org/abs/2003.12338)
- 📄 [AML with Graph Neural Networks](https://arxiv.org/abs/2009.08591)

### 🎥 Videos y Tutoriales

- 🎬 [PyTorch Geometric Tutorial](https://pytorch-geometric.readthedocs.io/en/latest/notes/introduction.html)
- 🎬 [Stanford CS224W Lectures](https://www.youtube.com/playlist?list=PLoROMvodv4rPLKxIpqhjhPgdQy7imNkDn)
- 🎬 [Geometric Deep Learning](https://www.youtube.com/watch?v=w6Pw4MOzMuo)

### 🌐 Comunidades y Foros

- 💬 [PyTorch Forums](https://discuss.pytorch.org/)
- 💬 [PyG GitHub Discussions](https://github.com/pyg-team/pytorch_geometric/discussions)
- 💬 [Reddit r/MachineLearning](https://www.reddit.com/r/MachineLearning/)
- 💬 [Stack Overflow - pytorch-geometric](https://stackoverflow.com/questions/tagged/pytorch-geometric)

### 🛠️ Herramientas Útiles

- 🔧 [Weights & Biases](https://wandb.ai/) - Experiment tracking
- 🔧 [TensorBoard](https://www.tensorflow.org/tensorboard) - Visualization
- 🔧 [Netron](https://netron.app/) - Model visualization
- 🔧 [DGL](https://www.dgl.ai/) - Alternativa a PyG

---

## 📄 Licencia y Uso

### 📜 Licencia

Este material es propiedad de **Ernst & Young Global Services Limited (EY)** y está destinado exclusivamente para:

- ✅ Uso interno de empleados de EY
- ✅ Capacitación y desarrollo profesional
- ✅ Proyectos internos de EY
- ✅ Investigación y desarrollo

**Restricciones:**
- ❌ No redistribuir fuera de EY
- ❌ No usar para fines comerciales externos
- ❌ No modificar sin autorización
- ❌ No compartir con terceros

### 🔐 Confidencialidad

- Todos los datos de ejemplo son **sintéticos** o **públicos**
- No usar datos reales de clientes en los notebooks
- Seguir políticas de seguridad de información de EY
- No subir notebooks con datos sensibles a repositorios públicos

### ⚖️ Disclaimer

Este material es **educativo** y no constituye:
- Asesoramiento legal
- Recomendación de inversión
- Garantía de resultados
- Cumplimiento regulatorio

Para implementaciones en producción, consultar con:
- Equipo legal de EY
- Compliance officer
- Risk management
- Data protection officer

---

## 📞 Contacto y Soporte

### 🆘 Obtener Ayuda

**Para preguntas técnicas:**
1. Revisa este README completo
2. Busca en [Issues](https://github.com/MX014107492_EYGS/GNN_AML/issues)
3. Consulta documentación oficial de PyTorch/PyG
4. Crea un nuevo Issue detallado

**Para reportar bugs:**
1. Verifica que sea reproducible
2. Incluye código mínimo para reproducir
3. Especifica entorno (OS, versiones)
4. Crea Issue con template de bug

**Para sugerir mejoras:**
1. Verifica que no esté ya sugerido
2. Explica el caso de uso
3. Propón implementación si es posible
4. Crea Issue con template de feature

### 👥 Equipo de Desarrollo

**Maintainers:**
- Analytics Team - EY Mexico
- Data Science CoE

**Contributors:**
- Basado en [Graph Neural Network Course](https://github.com/mlabonne/Graph-Neural-Network-Course) por Maxime Labonne

### 📧 Contacto Interno

Para consultas específicas de EY:
- **Email interno:** [Especificar email de contacto]
- **Teams Channel:** [Especificar canal]
- **SharePoint:** [Especificar sitio]

---

## 🌟 Próximos Pasos

### 🚀 Después de Completar el Curso

**Nivel Intermedio:**
1. 📖 Estudia papers de GNN más recientes
2. 🔬 Experimenta con datasets más grandes
3. 🏗️ Implementa arquitecturas custom
4. 📊 Participa en competiciones (Kaggle)

**Nivel Avanzado:**
1. 🎓 Toma cursos especializados (Stanford CS224W)
2. 📝 Publica research o blog posts
3. 🛠️ Contribuye a PyTorch Geometric
4. 🏢 Aplica GNNs en proyectos reales de EY

**Especialización en AML:**
1. 💼 Estudia regulaciones (FATF, FinCEN)
2. 📚 Lee papers de fraud detection
3. 🔍 Analiza casos reales de lavado de dinero
4. 🤝 Colabora con equipos de compliance

### 📅 Roadmap del Curso

**Planeado para futuras versiones:**

- [ ] **Capítulo 5**: Temporal Graph Networks
- [ ] **Capítulo 6**: Heterogeneous Graphs
- [ ] **Capítulo 7**: Explainability en GNNs
- [ ] **Capítulo 8**: GNNs en Producción
- [ ] Más casos de uso de AML
- [ ] Datasets reales anonimizados
- [ ] Evaluaciones automáticas
- [ ] Certificación formal

---

## 🙏 Agradecimientos

### Créditos

**Basado en el trabajo de:**
- 👨‍💻 [Maxime Labonne](https://github.com/mlabonne) - Curso original de GNN
- 🏛️ PyTorch & PyTorch Geometric teams
- 📚 Stanford CS224W course materials

**Datasets utilizados:**
- Karate Club (PyTorch Geometric)
- CiteSeer (PyTorch Geometric)
- PubMed (PyTorch Geometric)
- PROTEINS (TUDataset)

**Inspiración y referencias:**
- Papers y research de la comunidad GNN
- Open source community
- EY Analytics team

---

<div align="center">

## ⭐ Si este curso te fue útil, considera darle una estrella en GitHub ⭐

### 📚 Happy Learning! 🚀

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Repositorio:** https://github.com/MX014107492_EYGS/GNN_AML

---

**Ernst & Young Global Services Limited (EY)**  
*Building a better working world*

</div>
