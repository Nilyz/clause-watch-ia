import chromadb
from chromadb.utils import embedding_functions
import uuid

class ContractVectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="paraphrase-multilingual-MiniLM-L12-v2"
        )
        self.collection = self.client.get_or_create_collection(
            name="contracts_rag",
            embedding_function=self.embedding_fn
        )


    def add_contract(self, filename: str, chunks_data: list[dict]):
        
        if not chunks_data:
            return
            
        texts = [item['text'] for item in chunks_data]
        
        ids = [str(uuid.uuid4()) for _ in texts]
        
        metadatas = []
        for i, item in enumerate(chunks_data):
            meta = {
                "filename": filename,
                "chunk_index": i,
                "page": item.get("page", 1) 
            }
            metadatas.append(meta)
        
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

    def search_similar(self, query: str, filename: str = None, n_results=3):
        filter_dict = {"filename": filename} if filename else None
        
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_dict  
        )
        return results

# Singleton instance
vector_db = ContractVectorStore()