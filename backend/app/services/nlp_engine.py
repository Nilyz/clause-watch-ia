import torch
from transformers import pipeline
import logging

# -- LOGGER ---
logger = logging.getLogger(__name__)


class LegalNLPEngine:

    def __init__(self):
        self.model_name = "recognai/zeroshot_selectra_medium"
        self.device = 0 if torch.cuda.is_available() else -1

        print(f"Loading NLP Model: {self.model_name} on device {self.device}...")

        try:
            self.classifier = pipeline(
                "zero-shot-classification", model=self.model_name, device=self.device
            )
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.classifier = None

    def analyze_clause(self, text: str):
        if not text or len(text) < 15:
            return None

        text_lower = text.lower()

        # --- LEVEL 1: RISK HEURISTIC  ---
        risky_keywords = [
            # --- Bloque: Renuncias y Legal ---
            "modificación unilateral", 
            "modificar unilateralmente", 
            "exención de responsabilidad",
            "no se hace responsable",
            "renuncia a derechos", 
            "renuncia de forma expresa",
            "renuncia expresa", 
            "irrevocable",
            "renuncia al fuero",
            "renuncia a cualquier otro fuero",
            "juzgados que designe la empresa",
            "juzgados que libremente designe", # 
            
            # --- Bloque: Condiciones Laborales ---
            "sin preaviso", 
            "sin necesidad de causa",
            "sin necesidad de alegar causa",
            "sin derecho a compensación",
            "sin compensación económica",
            "no genera derecho",
            "absorbe cualquier concepto",
            "cualesquiera otras tareas", 
            "no guarden relación directa", 
            
            # --- Bloque: Movilidad y Funciones ---
            "movilidad geográfica", 
            "traslado a cualquier",
            "podrá trasladar",
            "cambio de centro",
            "funciones de distinta categoría",
            "polivalencia funcional",
            
            # --- Bloque: Tiempo y Vacaciones ---
            "jornada de hasta", 
            "horas extraordinarias obligatorias",
            "realización ilimitada",
            "disponibilidad total",
            "cancelar las vacaciones", 
            "modificar las vacaciones",
            "fraccionar las vacaciones",
            "fijada exclusivamente por la empresa",
            
            # --- Bloque: Pagos ---
            "cuando su tesorería", 
            "retrasarlo hasta", 
            "pago diferido",
            "sin que ello genere intereses",
            
            # --- Bloque: Privacidad y Sanciones ---
            "despido disciplinario inmediato", 
            "comentarios privados",
            "uso ilimitado de su imagen", 
            "cesión de imagen",
            "datos a terceros"
        ]

        for keyword in risky_keywords:
            if keyword in text_lower:
                return {
                    "text_snippet": text[:150] + "...",
                    "label": "POTENTIAL_RISK",
                    "confidence": 0.98,
                    "is_risky": True,
                }

        # --- LEVEL 2: FILTER "ADMINISTRATIVE NOISE" ---

        safe_keywords = [
            "en madrid a",
            "reunidos",
            "con domicilio en",
            "con dni",
            "mayor de edad",
            "intervienen",
            "exponen",
            "cláusulas:",
            "firmado en",
            "fdo.",
            "el trabajador:",
            "la empresa:",
        ]

        if any(sk in text_lower for sk in safe_keywords):
            return {
                "text_snippet": text[:150] + "...",
                "label": "ACCEPTABLE",
                "confidence": 0.90,
                "is_risky": False,
            }

        # --- LEVEL 3: ARTIFICIAL INTELLIGENCE (Zero-Shot) ---
        if self.classifier:
            try:
                candidate_labels = [
                    "cláusula abusiva",
                    "explotación laboral",
                    "renuncia de derechos",
                    "condición laboral estándar",
                    "información administrativa",
                ]

                result = self.classifier(text, candidate_labels)
                top_label = result["labels"][0]
                score = result["scores"][0]

                risky_labels = [
                    "cláusula abusiva",
                    "explotación laboral",
                    "renuncia de derechos",
                ]

                is_risky_ai = top_label in risky_labels and score > 0.40

                return {
                    "text_snippet": text[:150] + "...",
                    "label": "AI_DETECTED_RISK" if is_risky_ai else "ACCEPTABLE",
                    "confidence": round(score, 2),
                    "is_risky": is_risky_ai,
                }

            except Exception as e:
                logger.error(f"AI Inference error: {e}")

        # Fallback
        return {
            "text_snippet": text[:100] + "...",
            "label": "NEUTRAL",
            "confidence": 0.0,
            "is_risky": False,
        }


#  Singleton instance
nlp_engine = LegalNLPEngine()
