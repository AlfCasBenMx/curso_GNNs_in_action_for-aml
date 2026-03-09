# Datasets - GNNs in Action

## Capitulo 2: Political Books Dataset (`polbooks.gml`)

### Descripcion
Red de libros sobre politica estadounidense vendidos en Amazon.com durante las elecciones presidenciales de 2004. Las aristas representan co-compras frecuentes ("los compradores de este libro tambien compraron...").

### Fuentes originales
| Recurso | URL |
|---------|-----|
| **Repo oficial del libro** | https://github.com/keitabroadwater/gnns_in_action/tree/master/chapter_2 |
| **Notebook Colab** | Disponible en el repo oficial (archivo `chp2 embeddings.ipynb`) |
| **Carnegie Mellon University** | http://www-personal.umich.edu/~mejn/netdata/ (Mark Newman's Network Data) |
| **Compilado por** | Valdis Krebs (www.orgnet.com) |
| **Etiquetas asignadas por** | Mark Newman (U. Michigan) mediante analisis cualitativo de resenas en Amazon |

### Estructura del archivo GML
```
graph [
  directed 0              # Grafo NO dirigido
  node [
    id 0                   # ID numerico (0-104)
    label "Nombre del libro"
    value "l"              # Orientacion: "l"=left, "c"=conservative, "n"=neutral
  ]
  edge [
    source 1               # ID del nodo origen
    target 0               # ID del nodo destino
  ]
]
```

### Estadisticas
| Metrica | Valor |
|---------|-------|
| Nodos (libros) | 105 |
| Aristas (co-compras) | 441 |
| Tipo de grafo | No dirigido |
| Libros izquierda ("l") | 43 (41.0%) |
| Libros derecha ("c") | 49 (46.7%) |
| Libros neutros ("n") | 13 (12.4%) |

### Atributos de nodos
- `id`: Identificador numerico unico (entero, 0-104)
- `label`: Titulo del libro (string)
- `value`: Orientacion politica (string: "l", "c", o "n")

### Atributos de aristas
- `source`: ID del nodo origen
- `target`: ID del nodo destino
- Sin peso (todas las aristas son iguales)

### Ejemplos de libros
| ID | Titulo | Orientacion |
|----|--------|-------------|
| 0 | 1000 Years for Revenge | Neutral |
| 30 | The Price of Loyalty | Left |
| 34 | The O'Reilly Factor | Conservative |
| 59 | Downsize This! | Left |
| 86 | Lies and the Lying Liars Who Tell Them | Left |

### Como cargar el dataset
```python
import networkx as nx

# Cargar desde archivo local
G = nx.read_gml('datos/polbooks.gml')

# Estadisticas basicas
print(f"Nodos: {G.number_of_nodes()}")
print(f"Aristas: {G.number_of_edges()}")

# Ver atributos de un nodo
print(G.nodes['0'])  # {'label': '1000 Years for Revenge', 'value': 'n'}

# Contar por orientacion
from collections import Counter
orientaciones = Counter(nx.get_node_attributes(G, 'value').values())
print(orientaciones)  # Counter({'c': 49, 'l': 43, 'n': 13})
```

### Referencia academica
- Krebs, V. (2004). Political Books Network. http://www.orgnet.com
- Newman, M.E.J. (2006). Modularity and community structure in networks.

---

## Como descargar datasets

Ejecuta el script `descargar_polbooks.py` en la raiz del repositorio:
```bash
python descargar_polbooks.py
```

O descarga manualmente desde:
- https://github.com/keitabroadwater/gnns_in_action/raw/master/chapter_2/polbooks.gml
