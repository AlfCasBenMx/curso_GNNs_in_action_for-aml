# 🌐 Curso: Graph Neural Networks in Action para AML

Repositorio de estudio y materiales complementarios del libro **"Graph Neural Networks in Action"**, con enfoque en aplicaciones de **Anti-Money Laundering (AML)**.

## 🎯 Objetivo

Aprender Graph Neural Networks desde cero — partiendo de fundamentos de redes neuronales hasta arquitecturas avanzadas (GCN, GAT, GraphSAGE, GIN) — con aplicación práctica a la detección de lavado de dinero en redes transaccionales.

## 📁 Estructura del Repositorio

```
📂 graph-neural-network-course/    ← Notebooks y materiales interactivos del curso
│   ├── 0_Neural_Networks_Fundamentals.ipynb   # Cap 0: Fundamentos de redes neuronales
│   ├── 1_Graph_Convolutional_Networks.ipynb   # Cap 1: GCN (Graph Convolutional Networks)
│   ├── 2_Graph_Attention_Network.ipynb        # Cap 2: GAT (Graph Attention Networks)
│   ├── 2_5_Node2Vec_Paso_a_Paso.ipynb         # Cap 2.5: Node2Vec embeddings
│   ├── 3_GraphSAGE.ipynb                      # Cap 3: GraphSAGE
│   ├── 4_Graph_Isomorphism_Network.ipynb      # Cap 4: GIN
│   ├── chapter0_sections/                     # HTML interactivos del Cap 0
│   └── *.html                                 # Guías visuales por capítulo
│
📂 capitulos/                      ← Resúmenes HTML de capítulos del libro
│   ├── Capitulo_1_Graph_Neural_Networks_in_Action.html
│   ├── Capitulo_2_Graph_Embeddings.html
│   └── Capitulo_2_5_Aplicacion_IA_y_Prompts.html
│
📂 datos/                          ← Datasets utilizados en los ejercicios
│   ├── polbooks.gml               # Red de libros políticos (Cap 2)
│   └── README_datasets.md         # Documentación de los datasets
│
📂 css/ y js/                      ← Estilos y scripts para las guías HTML
│
📄 GUIA_ESTUDIO_CAP1.md            ← Guía de estudio del Capítulo 1
📄 capitulo1.txt / capitulo2.txt   ← Texto extraído de los capítulos del libro
📄 extract_pdf.py                  ← Script para extraer texto del PDF del libro
📄 descargar_polbooks.py           ← Script para descargar el dataset polbooks
```

## 📚 Ruta de Aprendizaje

| # | Tema | Notebook | Conceptos Clave |
|---|------|----------|-----------------|
| 0 | Fundamentos de Redes Neuronales | `0_Neural_Networks_Fundamentals.ipynb` | Neuronas, activación, backpropagation, PyTorch |
| 1 | Graph Convolutional Networks | `1_Graph_Convolutional_Networks.ipynb` | Convolución en grafos, message passing, GCN |
| 2 | Graph Attention Networks | `2_Graph_Attention_Network.ipynb` | Mecanismo de atención en grafos, multi-head |
| 2.5 | Node2Vec | `2_5_Node2Vec_Paso_a_Paso.ipynb` | Graph embeddings, random walks, Word2Vec |
| 3 | GraphSAGE | `3_GraphSAGE.ipynb` | Sampling de vecinos, aprendizaje inductivo |
| 4 | Graph Isomorphism Network | `4_Graph_Isomorphism_Network.ipynb` | Poder expresivo de GNNs, test de Weisfeiler-Leman |

## 🏦 ¿Por qué GNNs para AML?

Las transacciones financieras forman **grafos naturales** donde personas y entidades son nodos, y las transacciones son aristas. Las GNNs permiten:

- Detectar **patrones de lavado** en múltiples capas de transacciones
- Identificar **comunidades sospechosas** por su estructura de conexiones
- Capturar **relaciones ocultas** que los métodos tabulares no ven

## 🛠️ Requisitos

- Python 3.8+
- PyTorch
- PyTorch Geometric
- NetworkX, Matplotlib, NumPy

## 📖 Basado en

**"Graph Neural Networks in Action"** — Keita Broadwater (Manning Publications)
