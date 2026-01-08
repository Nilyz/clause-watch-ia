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

    def add_contract(self, filename: str, text_paragraphs: list[str]):

        ids = [str(uuid.uuid4()) for _ in text_paragraphs]
        metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(text_paragraphs))]
        
        self.collection.add(
            documents=text_paragraphs, 
            metadatas=metadatas,       
            ids=ids
        )
        print(f"Vectorized {len(text_paragraphs)} chunks for {filename}")

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