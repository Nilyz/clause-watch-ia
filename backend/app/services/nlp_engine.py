import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

class LegalNLPEngine:

    def __init__(self):
        # Legal-BERT model for clause classification
        self.model_name = "nlpaueb/legal-bert-base-uncased"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        print(f"Loading NLP Model: {self.model_name} on {self.device}...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval() 

        # Mapping logical labels. In a real fine-tuning scenario, 
        self.labels = ["ACCEPTABLE", "POTENTIAL_RISK", "UNFAIR_CLAUSE"]

    def analyze_clause(self, text: str):
        
        #Analyzes a specific text segment to detect abusive clauses.
        if not text or len(text) < 10:
            return None

        # 1. Tokenization
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # 2. Inference (Pure NLP)
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # 3. Probability Calculation (Softmax)
        probs = F.softmax(outputs.logits, dim=-1)
        confidence, predicted_class_idx = torch.max(probs, dim=-1)
        
        label_idx = predicted_class_idx.item() % len(self.labels)
        
        return {
            "text_snippet": text[:50] + "...",
            "label": self.labels[label_idx],
            "confidence": round(float(confidence.item()), 4),
            "is_risky": label_idx > 0 
        }

# Singleton instance to avoid reloading model on every request
nlp_engine = LegalNLPEngine()