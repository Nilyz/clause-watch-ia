import google.generativeai as genai
import numpy as np
import os

class InMemoryVectorStore:
    def __init__(self):
        self.store = {}

        self.model_name = "models/text-embedding-004" 

    def get_embedding(self, text):
        try:
            result = genai.embed_content(
                model=self.model_name,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return []

    def add_contract(self, filename: str, chunks: list):
        print(f"Indexing {filename} using Google Embeddings...")
        
        self.store[filename] = []
        
        for chunk in chunks:
            text = chunk["text"]
            vector = self.get_embedding(text)
            
            if vector:
                self.store[filename].append({
                    "text": text,
                    "vector": np.array(vector),
                    "metadata": {"page": chunk["page"]}
                })
        
        print(f"Indexed {len(self.store[filename])} chunks for {filename}")

    def search_similar(self, query: str, filename: str, n_results: int = 3):
        if filename not in self.store:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        try:
            query_emb = genai.embed_content(
                model=self.model_name,
                content=query,
                task_type="retrieval_query"
            )['embedding']
            query_vec = np.array(query_emb)
        except:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        scores = []
        for item in self.store[filename]:
            doc_vec = item["vector"]
            score = np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
            scores.append((score, item))

        scores.sort(key=lambda x: x[0], reverse=True)
        top_results = scores[:n_results]

        return {
            "documents": [[res[1]["text"] for res in top_results]],
            "metadatas": [[res[1]["metadata"] for res in top_results]],
            "distances": [[1 - res[0] for res in top_results]]
        }

# Instancia global (Singularidad)
vector_db = InMemoryVectorStore()