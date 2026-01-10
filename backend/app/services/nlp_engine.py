import re

class DeterministicNLPEngine:
    def __init__(self):
        # --- BILINGUAL RISK PATTERNS ---
        self.risk_patterns = {
            "High Liability / Responsabilidad": [
                # English
                r"unlimited liability", 
                r"indemnify.*hold harmless", 
                r"consequential damages",
                r"gross negligence",
                r"solely responsible",
                # Español
                r"responsabilidad ilimitada",
                r"indemnización total",
                r"daños consecuentes",
                r"negligencia grave",
                r"único responsable",
                r"exime de toda responsabilidad"
            ],
            "Termination / Terminación": [
                # English
                r"terminate.*without cause", 
                r"immediate termination", 
                r"termination at will",
                r"unilateral termination",
                # Español
                r"terminación sin causa",
                r"terminación inmediata",
                r"rescisión unilateral",
                r"fin del contrato.*sin previo aviso",
                r"desistimiento unilateral"
            ],
            "Privacy & Data / Privacidad": [
                # English
                r"sell.*data", 
                r"share.*third parties",
                r"use.*marketing purposes",
                r"data monetization",
                # Español
                r"venta de datos",
                r"ceder.*datos.*terceros",
                r"uso.*fines comerciales",
                r"compartir.*información personal"
            ],
            "Jurisdiction / Jurisdicción": [
                # English
                r"arbitration.*binding", 
                r"waiver of jury trial",
                r"exclusive jurisdiction",
                r"governed by the laws of",
                # Español
                r"arbitraje vinculante",
                r"renuncia.*fuero",
                r"renuncia.*jurisdicción",
                r"tribunales de.*(?!españa)", 
                r"sometimiento expreso"
            ],
            "Payment / Pagos": [
                # English
                r"non-refundable",
                r"penalty",
                r"late payment interest",
                # Español
                r"no reembolsable",
                r"penalización",
                r"intereses de demora",
                r"pago por adelantado"
            ]
        }

    def analyze_clause(self, text: str):

        if not text or len(text) < 10:
            return None

        text_lower = text.lower()
        
        # Recorremos nuestros patrones
        for label, patterns in self.risk_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return {
                        "text_snippet": text[:100] + "..." if len(text) > 100 else text,
                        "label": label,
                        "confidence": 1.0,
                        "is_risky": True
                    }
        
        return None

# Instancia global
nlp_engine = DeterministicNLPEngine()