"""
Descarga el dataset Political Books (polbooks.gml) del repositorio oficial
del libro "Graph Neural Networks in Action" de Keita Broadwater.

Fuentes:
  - Repo oficial: https://github.com/keitabroadwater/gnns_in_action
  - Dataset original: Compilado por Valdis Krebs, etiquetas por Mark Newman
  - Tambien disponible en: http://www-personal.umich.edu/~mejn/netdata/

Uso:
  python descargar_polbooks.py
"""

import os
import urllib.request
import sys

# URLs de descarga
POLBOOKS_URL = "https://raw.githubusercontent.com/keitabroadwater/gnns_in_action/master/chapter_2/polbooks.gml"
DEST_DIR = "datos"
DEST_FILE = os.path.join(DEST_DIR, "polbooks.gml")


def descargar_polbooks():
    """Descarga polbooks.gml al directorio datos/"""
    os.makedirs(DEST_DIR, exist_ok=True)

    if os.path.exists(DEST_FILE):
        print(f"[OK] El archivo ya existe: {DEST_FILE}")
        resp = input("    Deseas descargarlo de nuevo? (s/n): ").strip().lower()
        if resp != 's':
            print("    Descarga cancelada.")
            return DEST_FILE

    print(f"[...] Descargando polbooks.gml desde el repo oficial...")
    print(f"      URL: {POLBOOKS_URL}")

    try:
        urllib.request.urlretrieve(POLBOOKS_URL, DEST_FILE)
        file_size = os.path.getsize(DEST_FILE)
        print(f"[OK] Descargado exitosamente: {DEST_FILE} ({file_size:,} bytes)")
    except Exception as e:
        print(f"[ERROR] No se pudo descargar: {e}")
        print(f"        Descarga manual: {POLBOOKS_URL}")
        return None

    return DEST_FILE


def explorar_dataset(filepath):
    """Muestra estadisticas basicas del dataset descargado"""
    try:
        import networkx as nx
    except ImportError:
        print("\n[INFO] Instala networkx para explorar el dataset:")
        print("       pip install networkx")
        return

    print(f"\n{'='*60}")
    print(f"  EXPLORACION DEL POLITICAL BOOKS DATASET")
    print(f"{'='*60}")

    G = nx.read_gml(filepath)

    print(f"\n  Tipo de grafo:    {'No dirigido' if not G.is_directed() else 'Dirigido'}")
    print(f"  Nodos (libros):   {G.number_of_nodes()}")
    print(f"  Aristas (co-compras): {G.number_of_edges()}")
    print(f"  Densidad:         {nx.density(G):.4f}")

    # Contar orientaciones
    from collections import Counter
    values = nx.get_node_attributes(G, 'value')
    conteo = Counter(values.values())
    total = sum(conteo.values())

    print(f"\n  Distribucion politica:")
    label_map = {'l': 'Izquierda (liberal)', 'c': 'Derecha (conservative)', 'n': 'Neutral'}
    for k in ['l', 'c', 'n']:
        count = conteo.get(k, 0)
        pct = count / total * 100
        bar = '#' * int(pct / 2)
        print(f"    {label_map[k]:30s} {count:3d} ({pct:5.1f}%) {bar}")

    # Grado promedio
    degrees = [d for _, d in G.degree()]
    print(f"\n  Grado promedio:   {sum(degrees)/len(degrees):.1f}")
    print(f"  Grado maximo:     {max(degrees)} (nodo: {max(G.degree(), key=lambda x: x[1])[0]})")
    print(f"  Grado minimo:     {min(degrees)}")

    # Componentes conexas
    components = list(nx.connected_components(G))
    print(f"  Componentes conexas: {len(components)}")

    # Ejemplos de nodos
    print(f"\n  Ejemplos de libros:")
    print(f"  {'ID':>4s}  {'Orientacion':>12s}  Titulo")
    print(f"  {'-'*4}  {'-'*12}  {'-'*40}")
    for node_id in list(G.nodes())[:10]:
        node_data = G.nodes[node_id]
        orient = label_map.get(node_data.get('value', '?'), '?')[:12]
        label = node_data.get('label', node_id)
        print(f"  {str(node_id):>4s}  {orient:>12s}  {label}")

    print(f"\n  Estructura del archivo GML:")
    print(f"  - Atributos de nodo: id, label (titulo), value (l/c/n)")
    print(f"  - Atributos de arista: source, target (sin peso)")
    print(f"  - Formato: texto plano, legible por humanos")

    print(f"\n{'='*60}")
    print(f"  FUENTES Y REFERENCIAS")
    print(f"{'='*60}")
    print(f"  Repo oficial:     https://github.com/keitabroadwater/gnns_in_action")
    print(f"  Capitulo 2:       https://github.com/keitabroadwater/gnns_in_action/tree/master/chapter_2")
    print(f"  Notebook Colab:   Ver archivo 'chp2 embeddings.ipynb' en el repo")
    print(f"  Mark Newman:      http://www-personal.umich.edu/~mejn/netdata/")
    print(f"  Compilador:       Valdis Krebs (www.orgnet.com)")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    filepath = descargar_polbooks()
    if filepath and os.path.exists(filepath):
        explorar_dataset(filepath)
