import PyPDF2
import re

pdf_path = r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\Graph Neural Networks in Action - Keita Broadwater.pdf"

def extract_toc(pdf_reader, max_pages=30):
    """Extrae el índice de contenidos (Table of Contents) del PDF"""
    print("Buscando el índice de contenidos...\n")
    
    chapters = {}
    toc_found = False
    
    for page_num in range(min(max_pages, len(pdf_reader.pages))):
        page = pdf_reader.pages[page_num]
        text = page.extract_text()
        
        # Buscar página de contenidos
        if re.search(r'(Contents|Table of Contents|TOC)\b', text, re.IGNORECASE):
            toc_found = True
            print(f"Índice encontrado en la página {page_num + 1}\n")
        
        if toc_found:
            # Buscar patrones como "Chapter 1    23" o "1 Introduction to graphs    23"
            # Patrones comunes: Chapter N ... page_number o N Title ... page_number
            patterns = [
                r'Chapter\s+(\d+)[^\d]*?(\d{1,3})\s*$',
                r'(\d+)\s+([A-Z][^.\n]{10,60}?)\s+(\d{1,3})\s*$',
                r'CHAPTER\s+(\d+)[^\d]*?(\d{1,3})\s*$',
            ]
            
            lines = text.split('\n')
            for line in lines:
                for pattern in patterns:
                    match = re.search(pattern, line, re.MULTILINE)
                    if match:
                        if len(match.groups()) == 2:
                            chapter_num = int(match.group(1))
                            page = int(match.group(2))
                        elif len(match.groups()) == 3:
                            chapter_num = int(match.group(1))
                            page = int(match.group(3))
                        else:
                            continue
                        
                        if 1 <= chapter_num <= 20 and 1 <= page <= 700:
                            chapters[chapter_num] = page
                            print(f"  Capítulo {chapter_num}: página {page}")
        
        # Si ya encontramos varios capítulos, podemos detenernos
        if len(chapters) >= 10:
            break
    
    return chapters

try:
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        print(f"Número total de páginas: {num_pages}\n")
        
        # Extraer índice
        chapters = extract_toc(pdf_reader)
        
        if chapters:
            print(f"\n✓ Se encontraron {len(chapters)} capítulos en el índice")
            
            # Guardar la información del índice
            with open(r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\indice_capitulos.txt", 'w', encoding='utf-8') as f:
                f.write("ÍNDICE DE CAPÍTULOS\n")
                f.write("=" * 80 + "\n\n")
                for ch_num in sorted(chapters.keys()):
                    # Las páginas en el PDF empiezan en 0, pero en el índice se numeran desde 1
                    pdf_page = chapters[ch_num] - 1
                    f.write(f"Capítulo {ch_num}: Página {chapters[ch_num]} (PDF página {pdf_page})\n")
            
            print("\n✓ Índice guardado en: indice_capitulos.txt")
            
            # Ahora extraer el Capítulo 1 usando la información del índice
            if 1 in chapters and 2 in chapters:
                # Convertir páginas del libro a páginas del PDF (restando 1)
                chapter1_start = chapters[1] - 1
                chapter1_end = chapters[2] - 1
                
                print(f"\nExtrayendo Capítulo 1...")
                print(f"  Desde página {chapters[1]} hasta página {chapters[2] - 1} del libro")
                print(f"  (PDF páginas {chapter1_start} a {chapter1_end - 1})")
                
                output_file = r"C:\Users\alfca\OneDrive\Documentos\gihub\GNN\capitulo1.txt"
                with open(output_file, 'w', encoding='utf-8') as out:
                    out.write(f"CAPÍTULO 1 - Graph Neural Networks in Action\n")
                    out.write(f"Páginas {chapters[1]} a {chapters[2] - 1}\n")
                    out.write("=" * 80 + "\n\n")
                    
                    for page_num in range(chapter1_start, chapter1_end):
                        page = pdf_reader.pages[page_num]
                        text = page.extract_text()
                        
                        out.write(f"\n--- Página {page_num + 1} (libro: {page_num + 1}) ---\n\n")
                        out.write(text)
                        out.write("\n\n" + "=" * 80 + "\n")
                
                print(f"\n✓ Capítulo 1 extraído y guardado en: capitulo1.txt")
            else:
                print("\nNo se encontraron las páginas del Capítulo 1 y 2 en el índice")
        else:
            print("\nNo se pudo extraer el índice automáticamente.")
            print("Mostrando las primeras páginas para análisis manual...\n")
            
            for page_num in range(min(15, num_pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                print(f"\n=== Página {page_num + 1} ===")
                print(text[:400])
                print("...\n")
            
except FileNotFoundError:
    print(f"Error: No se encontró el archivo en {pdf_path}")
except Exception as e:
    print(f"Error al procesar el PDF: {str(e)}")
