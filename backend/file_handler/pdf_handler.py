import fitz

def extract_pdf_text(pdf_path):
    """Extract text from PDF"""
    doc = fitz.open(pdf_path)
    all_text = []    
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text()
        if page_text.strip():
            all_text.append(f"Page {page_num + 1}:\n{page_text}")
    doc.close()
    return '\n\n'.join(all_text)