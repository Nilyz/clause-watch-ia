import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

class LegalNLPEngine:

    def __init__(self):
        self.model_name = "nlpaueb/legal-bert-base-uncased"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        print(f"Loading NLP Model: {self.model_name} on {self.device}...")
        
        # 1. TOKENIZER: Converts text to numbers
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
        # 2. MODEL: The neural network
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name, num_labels=2)
        self.model.to(self.device)
        self.model.eval() 

    def analyze_clause(self, text: str):
        if not text or len(text) < 10:
            return None

        # --- Rules heuristics ---
        text_lower = text.lower()

        risky_keywords = [
            "modificación unilateral", "exención total de responsabilidad",
            "venta de datos", "renuncia a derechos", "demandas colectivas",
            "arbitraje privado", "sin previo aviso", "no se hace responsable",
            "derecho irrevocable", "renunciando a la jurisdicción",
            "indemnización", "sin compensación", "datos a terceros"
        ]
        
        safe_keywords = [
            "horario", "jornada", "fecha", "nombre", "domicilio", 
            "dni", "firmado", "en prueba", "convenio", "trabajador",
            "vacaciones", "nómina", "seguridad social", "protección de datos"
        ]

        if any(k in text_lower for k in risky_keywords):
            return {
                "text_snippet": text[:100] + "...",
                "label": "POTENTIAL_RISK",
                "confidence": 0.95,
                "is_risky": True
            }
            
        if any(k in text_lower for k in safe_keywords):
            return {
                "text_snippet": text[:100] + "...",
                "label": "ACCEPTABLE",
                "confidence": 0.90,
                "is_risky": False
            }

        # ---IA BERT ---
        try:
            # Tokenization
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512,
                padding=True
            ).to(self.device)

            # Inference (Pass through the neural network)
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            probs = F.softmax(outputs.logits, dim=1)
            
            risk_score = probs[0][1].item() 
            
            is_risky_ai = risk_score > 0.55 

            return {
                "text_snippet": text[:100] + "...",
                "label": "AI_DETECTED_RISK" if is_risky_ai else "AI_CLEARED",
                "confidence": round(float(max(probs[0])), 2),
                "is_risky": is_risky_ai
            }

        except Exception as e:
            # Fallback 
            return {
                "text_snippet": text[:100] + "...",
                "label": "NEUTRAL",
                "confidence": 0.0,
                "is_risky": False
            }

# Singleton instance
nlp_engine = LegalNLPEngine()