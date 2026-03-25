# Graph Neural Networks Course - GNN para AML

Notebooks interactivos para aprender GNNs desde cero, con aplicacion a deteccion de lavado de dinero.

## Notebooks

| # | Tema | Dataset | Concepto clave |
|---|------|---------|----------------|
| 0 | Fundamentos de Redes Neuronales | - | Neuronas, backprop, PyTorch |
| 1 | Graph Convolutional Networks (GCN) | Karate Club | Message passing, agregacion de vecinos |
| 2 | Graph Attention Networks (GAT) | CiteSeer | Atencion entre nodos, multi-head |
| 2.5 | Node2Vec | - | Graph embeddings, random walks |
| 3 | GraphSAGE | PubMed | Sampling de vecinos, aprendizaje inductivo |
| 4 | Graph Isomorphism Network (GIN) | PROTEINS | Poder expresivo, clasificacion de grafos |

## Requisitos

Python 3.8+ - PyTorch - PyTorch Geometric - NetworkX

```
pip install torch torch-geometric networkx matplotlib numpy
```

## Basado en

*Graph Neural Networks in Action* - Keita Broadwater (Manning)
