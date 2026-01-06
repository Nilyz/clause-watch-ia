from fastapi import FastAPI
# Importamos esto para verificar que la IA se instaló bien
from transformers import pipeline 

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "LegalShield AI Online", "backend": "FastAPI"}

@app.get("/test-ai")
def test_ai():
    # Prueba rápida de análisis de sentimiento (NLP Puro)
    classifier = pipeline("sentiment-analysis")
    result = classifier("I love using Python for legal tech!")
    return {"result": result}

#uvicorn main:app --reload