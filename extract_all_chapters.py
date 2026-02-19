import PyPDF2
import re

pdf_path = r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\Graph Neural Networks in Action - Keita Broadwater.pdf"

def extract_full_toc(pdf_reader):
    """Extrae todos los capítulos del índice"""
    print("Extrayendo índice completo...\n")
    
    chapters = {}
    
    # El índice está en las páginas 7-12 aproximadamente
    for page_num in range(6, 15):
        page = pdf_reader.pages[page_num]
        text = page.extract_text()
        
        # Buscar líneas que empiezan con un número seguido de un título
        # Formato: "1 Discovering graph neural networks" o "2 Graph embeddings"
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            # Buscar capítulos (números al inicio de línea seguidos de texto)
            match = re.match(r'^(\d+)\s+([A-Z][a-zA-Z\s,:-]+?)(?:\s+(\d+))?$', line.strip())
            if match:
                chapter_num = int(match.group(1))
                title = match.group(2).strip()
                page_number = match.group(3)
                
                # Si no hay número de página en la misma línea, buscar en las siguientes
                if not page_number and i + 1 < len(lines):
                    # A veces el número está en la siguiente línea
                    next_line = lines[i + 1].strip()
                    if next_line.isdigit():
                        page_number = next_line
                
                if chapter_num >= 1 and chapter_num <= 20:
                    if page_number:
                        chapters[chapter_num] = {
                            'title': title,
                            'page': int(page_number) if page_number else None
                        }
                        print(f"  Capítulo {chapter_num}: {title} - Página {page_number}")
    
    # Si no encontramos páginas, buscar manualmente en el PDF
    if not any(ch.get('page') for ch in chapters.values()):
        print("\nBuscando páginas de capítulos en el PDF...\n")
        for ch_num in sorted(chapters.keys()):
            for page_num in range(200):  # Buscar en las primeras 200 páginas
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                # Buscar el inicio del capítulo
                pattern = f"^{ch_num}\\s+{re.escape(chapters[ch_num]['title'][:20])}"
                if re.search(pattern, text, re.MULTILINE | re.IGNORECASE):
                    chapters[ch_num]['page'] = page_num + 1
                    print(f"  Capítulo {ch_num} encontrado en página {page_num + 1}")
                    break
    
    return chapters

try:
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        print(f"Total de páginas en el PDF: {num_pages}\n")
        
        # Extraer índice completo
        chapters = extract_full_toc(pdf_reader)
        
        if chapters:
            print(f"\n{'='*80}")
            print(f"✓ Se encontraron {len(chapters)} capítulos")
            print(f"{'='*80}\n")
            
            # Guardar información del índice
            with open(r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\indice_completo.txt", 'w', encoding='utf-8') as f:
                f.write("ÍNDICE COMPLETO DE CAPÍTULOS\n")
                f.write("=" * 80 + "\n\n")
                
                for ch_num in sorted(chapters.keys()):
                    ch = chapters[ch_num]
                    page_info = f"Página {ch['page']}" if ch.get('page') else "Página no encontrada"
                    f.write(f"Capítulo {ch_num}: {ch['title']}\n")
                    f.write(f"  {page_info}\n\n")
            
            print("✓ Índice completo guardado en: indice_completo.txt\n")
            
            # Extraer Capítulo 1
            if 1 in chapters and 2 in chapters:
                ch1_page = chapters[1].get('page')
                ch2_page = chapters[2].get('page')
                
                if ch1_page and ch2_page:
                    # Convertir de número de página del libro a índice del PDF
                    # Las páginas del contenido empiezan alrededor de la página 20 del PDF
                    # pero en el libro están numeradas desde 3
                    
                    # Método más seguro: buscar directamente el texto del capítulo
                    for page_num in range(min(50, num_pages)):
                        page = pdf_reader.pages[page_num]
                        text = page.extract_text()
                        
                        if "1 Discovering graph neural networks" in text or "Discovering graph neural networks" in text:
                            chapter1_pdf_start = page_num
                            print(f"Capítulo 1 encontrado en PDF página {page_num + 1}")
                            break
                    
                    for page_num in range(chapter1_pdf_start + 1, min(100, num_pages)):
                        page = pdf_reader.pages[page_num]
                        text = page.extract_text()
                        
                        if "2 Graph embeddings" in text or "Graph embeddings" in text:
                            chapter1_pdf_end = page_num
                            print(f"Capítulo 2 encontrado en PDF página {page_num + 1}")
                            break
                    
                    # Extraer capítulo 1
                    output_file = r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\capitulo1_nuevo.txt"
                    with open(output_file, 'w', encoding='utf-8') as out:
                        out.write(f"CAPÍTULO 1: {chapters[1]['title']}\n")
                        out.write("=" * 80 + "\n\n")
                        
                        for page_num in range(chapter1_pdf_start, chapter1_pdf_end):
                            page = pdf_reader.pages[page_num]
                            text = page.extract_text()
                            
                            out.write(f"\n--- PDF Página {page_num + 1} ---\n\n")
                            out.write(text)
                            out.write("\n\n" + "=" * 80 + "\n")
                    
                    print(f"\n✓ Capítulo 1 extraído: capitulo1_nuevo.txt")
                    print(f"  Páginas PDF: {chapter1_pdf_start + 1} a {chapter1_pdf_end}")
        else:
            print("No se pudieron extraer los capítulos del índice")
            
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
