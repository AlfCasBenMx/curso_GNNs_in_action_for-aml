# 📚 GUÍA DE ESTUDIO - CAPÍTULO 1
## Discovering Graph Neural Networks

---

## 🎯 OBJETIVOS DEL CAPÍTULO

Al terminar el capítulo 1, deberías poder:
- ✅ Definir qué son los grafos y las GNNs (Graph Neural Networks)
- ✅ Entender por qué las GNNs son importantes
- ✅ Reconocer cuándo usar GNNs
- ✅ Comprender el panorama general de resolver problemas con GNNs

---

## 📝 CONCEPTOS CLAVE

### 1. ¿Qué son los Grafos?

**Definición**: Estructuras de datos con:
- **Nodos (vertices)**: Elementos individuales
- **Aristas (edges/links)**: Relaciones entre elementos
- **Características**: Datos adicionales de cada nodo

**Diferencia con datos tabulares**: 
- Datos tabulares → filas y columnas fijas
- Grafos → estructura flexible basada en relaciones

**Representación - Matriz de Adyacencia**:
```
      A  B  C  D  E
  A [ 0  1  0  0  1 ]
  B [ 1  0  1  1  1 ]
  C [ 0  1  0  1  0 ]
  D [ 0  1  1  0  1 ]
  E [ 1  1  0  1  0 ]
```
- **1** = hay conexión
- **0** = no hay conexión
- Simétrica = grafo no dirigido

---

### 2. Tipos de Grafos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Homogéneo** | Un solo tipo de nodo y arista | Red social (solo personas) |
| **Heterogéneo** | Múltiples tipos de nodos/aristas | Red laboral (candidatos + empresas) |
| **Bipartito** | Dos conjuntos, conexiones solo entre conjuntos | Pinterest (pins ↔ boards) |
| **Cíclico** | Puedes volver al nodo inicial | Redes con loops |
| **Acíclico** | No puedes volver sin retroceder | Estructuras tipo árbol |
| **DAG** | Acíclico dirigido (solo una dirección) | Análisis causal, workflows |
| **Knowledge Graph** | Grafo con semántica enriquecida | Grafos de conocimiento académico |
| **Hipergrafo** | Aristas conectan múltiples nodos | Chats grupales |

**Propiedades adicionales**:
- **Weighted/Unweighted** (con peso o sin peso)
- **Directed/Undirected** (dirigido o no dirigido)
- **Self-loops** (bucles a sí mismo)

---

### 3. ¿Por qué GNNs?

#### Problemas con métodos anteriores:
- ❌ Modelos separados para procesar grafos
- ❌ Difíciles de escalar
- ❌ No capturan bien propiedades de nodos y aristas

#### Ventajas de GNNs:
- ✅ Diseñadas específicamente para datos relacionales
- ✅ Manejan grandes volúmenes de datos
- ✅ Se adaptan a grafos de diferentes tamaños y formas
- ✅ Resultados más ricos y eficientes

---

### 4. ¿Cuándo usar GNNs?

**Indicadores clave** de que necesitas una GNN:

1. **Relaciones implícitas e interdependencias**
   - Tus datos tienen conexiones importantes
   - Las relaciones afectan el resultado

2. **Alta dimensionalidad y dispersión (sparsity)**
   - Muchas características pero datos dispersos
   - No todos los elementos están conectados

3. **Interacciones complejas no locales**
   - Las influencias se propagan por la red
   - Efectos indirectos importan

**Pregunta clave**: ¿Tus datos se pueden estructurar como un grafo?

---

## 🏆 APLICACIONES PRÁCTICAS

### Casos de Estudio del Capítulo:

1. **Motores de Recomendación**
   - E-commerce
   - Plataformas de contenido

2. **Descubrimiento de Fármacos y Ciencia Molecular**
   - Predicción de toxicidad
   - Identificación de nuevos candidatos

3. **Razonamiento Mecánico**
   - Predicción de ETA en Google Maps
   - Sistemas físicos

4. **Detección de Fraude**
   - Análisis de transacciones bancarias
   - Redes de actividad sospechosa

5. **Redes Sociales**
   - Análisis de comunidades
   - Propagación de información

---

## 🔧 HERRAMIENTAS Y LIBRERÍAS

**PyTorch Geometric (PyG)** - Enfoque del libro
- Popular y fácil de usar
- Construida sobre PyTorch

**Otras opciones**:
- Deep Graph Library (DGL)
- Spektral (Keras/TensorFlow)
- Jraph (JAX)

---

## 📊 ESTRUCTURA DEL LIBRO

### Parte 1: Primeros Pasos
- Cap 1: Descubriendo GNNs
- Cap 2: Embeddings de grafos

### Parte 2: Modelos de GNN
- Modelos clave y arquitecturas

### Parte 3: Temas Avanzados
- Escalabilidad
- Datos temporales

---

## 💡 CONCEPTOS FUNDAMENTALES

### Graph-Based Learning

**Objetivo**: Construir modelos a partir de grafos para obtener insights

**Métodos históricos**:
- **Clique methods** (1950s)
- **PageRank** (1996) - Base de Google
- Belief propagation
- Graph kernel methods

### Embeddings

**Definición**: Representaciones vectoriales de baja dimensión

**Tipos**:
- Embeddings de nodos
- Embeddings de aristas
- Embeddings de grafos completos

**Algoritmos**:
- Node2Vec (N2V)
- DeepWalk

---

## 🎓 PREGUNTAS DE REPASO

### Básicas:
1. ¿Qué es un grafo y cuáles son sus componentes básicos?
2. ¿Qué es una matriz de adyacencia?
3. Menciona 3 tipos diferentes de grafos
4. ¿Qué diferencia hay entre un grafo homogéneo y heterogéneo?

### Intermedias:
5. ¿Cuáles son las 3 señales clave de que necesitas usar una GNN?
6. ¿Por qué las GNNs son mejores que los métodos anteriores para datos de grafos?
7. Explica la diferencia entre un DAG y un grafo cíclico
8. ¿Qué es un knowledge graph y en qué se diferencia de un grafo heterogéneo normal?

### Avanzadas:
9. Da 3 ejemplos de aplicaciones reales donde se usan GNNs
10. ¿Qué es un hipergrafo y cuándo lo usarías?
11. ¿Cómo se representa un hipergrafo matemáticamente?
12. ¿Qué papel juegan los embeddings en el aprendizaje basado en grafos?

---

## 🧠 EJERCICIOS PRÁCTICOS

### Ejercicio 1: Identificar Grafos
Para cada escenario, identifica:
- ¿Es un problema de grafos?
- ¿Qué tipo de grafo sería?
- ¿Los nodos y aristas qué representarían?

**Escenarios**:
1. Red de seguidores en Twitter
2. Moléculas y sus enlaces químicos
3. Sistema de recomendación de Netflix
4. Mapa de carreteras de una ciudad
5. Flujo de trabajo de aprobaciones en una empresa

### Ejercicio 2: Matriz de Adyacencia
Dibuja el grafo correspondiente a esta matriz de adyacencia:
```
      A  B  C  D
  A [ 0  1  1  0 ]
  B [ 1  0  0  1 ]
  C [ 1  0  0  1 ]
  D [ 0  1  1  0 ]
```
- ¿Es dirigido o no dirigido?
- ¿Tiene ciclos?
- ¿Es bipartito?

### Ejercicio 3: Casos de Uso
Para cada aplicación, explica:
- ¿Por qué una GNN sería útil?
- ¿Qué señales de la lista "cuándo usar GNNs" aplican?

**Aplicaciones**:
1. Detección de spam en emails
2. Predicción de tráfico urbano
3. Sistema de recomendación de productos en Amazon

---

## 📌 TÉRMINOS CLAVE A MEMORIZAR

| Término | Definición |
|---------|------------|
| **Node/Vertex** | Elemento individual en un grafo |
| **Edge/Link** | Relación entre nodos |
| **Adjacency Matrix** | Representación matricial de conexiones |
| **Directed Graph** | Grafo con direcciones en las aristas |
| **Weighted Graph** | Grafo con valores en las aristas |
| **Self-loop** | Arista que conecta un nodo consigo mismo |
| **Bipartite** | Dos conjuntos, conexiones solo entre ellos |
| **DAG** | Directed Acyclic Graph - sin ciclos |
| **Embedding** | Representación vectorial de baja dimensión |
| **Message Passing** | Mecanismo clave de las GNNs |
| **Relational Data** | Datos donde las relaciones son importantes |

---

## 📖 LECTURAS COMPLEMENTARIAS

**Referencias mencionadas en el capítulo**:
- [1] Grafos en naturaleza, sociedad y tecnología
- [2] GNNs como avance genuino
- [3] Matriz de adyacencia
- [4] Clique methods (1950s)
- [5] Belief propagation
- [6] Graph kernel methods

**Para profundizar**:
- Apéndice A del libro (fundamentos de grafos)
- Sección "Under the Hood" al final de cada capítulo

---

## ✅ CHECKLIST DE DOMINIO

Marca cuando domines cada concepto:

- [ ] Puedo explicar qué es un grafo con mis propias palabras
- [ ] Entiendo la matriz de adyacencia y puedo crear una
- [ ] Conozco al menos 5 tipos diferentes de grafos
- [ ] Puedo identificar cuándo usar una GNN vs otros métodos
- [ ] Comprendo las 3 señales clave para usar GNNs
- [ ] Conozco al menos 3 aplicaciones reales de GNNs
- [ ] Entiendo qué son los embeddings
- [ ] Puedo explicar la diferencia entre grafo dirigido y no dirigido
- [ ] Sé qué es un DAG y por qué es importante
- [ ] Comprendo la diferencia entre homogéneo y heterogéneo

---

## 🎯 PRÓXIMOS PASOS

**Después de dominar el Capítulo 1**:
1. Revisar el Apéndice A para profundizar en fundamentos
2. Prepararse para el Capítulo 2: Graph Embeddings
3. Practicar con código usando PyTorch Geometric
4. Buscar datasets de grafos para experimentar

**Conceptos del Cap 1 que se expandirán**:
- Message passing (mecanismo clave de GNNs)
- Embeddings (Capítulo 2)
- Arquitectura de GNNs
- Casos prácticos de implementación

---

## 💬 RESUMEN EN 3 PUNTOS

1. **Los grafos son estructuras poderosas** para representar datos relacionales donde las conexiones importan tanto como los elementos individuales.

2. **Las GNNs son la solución moderna** para aprendizaje automático en grafos, superando limitaciones de métodos anteriores y ofreciendo escalabilidad y eficiencia.

3. **Usa GNNs cuando tus datos tienen**: relaciones importantes, alta dimensionalidad con dispersión, o interacciones complejas no locales.

---

🎓 **¡Éxito en tu estudio!**
