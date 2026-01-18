import fitz
from fastapi import HTTPException
from typing import List

def extract_text_with_metadata(file_content: bytes) -> List[dict]:
    # fitz can launch errors on corrupted files
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted PDF file")

    chunks_data = []
    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")
        for block in blocks:
            # block format: (x0, y0, x1, y1, "text", block_no, block_type)
            if block[6] != 0: 
                continue
                
            text_block = block[4].strip()
            clean_text = " ".join(text_block.splitlines())

            if len(clean_text) > 50:
                if len(clean_text) > 500:
                    sentences = clean_text.split(". ")
                    for sentence in sentences:
                        if len(sentence) > 30:
                            final_text = clean_text.strip().rstrip(".") + "."
                            chunks_data.append({"text": final_text, "page": page_num + 1})
                else:
                    final_text = clean_text.strip().rstrip(".") + "."
                    chunks_data.append({"text": final_text, "page": page_num + 1})
    return chunks_data