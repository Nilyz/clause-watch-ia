# ClauseWatch AI
ClauseWatch AI is an intelligent contract analysis platform specialized in **Spanish Labor Law**. It leverages a **Hybrid AI Architecture** combining heuristic linguistic patterns with **Zero-Shot Transformers** for high-precision risk detection, alongside **Generative AI** for deep legal explanation.

## Preview
![ClauseWatch Preview](./assets/preview.png "ClauseWatch Dashboard")

## About
ClauseWatch AI modernizes the legal review process by transforming dense PDFs into actionable insights. Moving beyond simple keyword search, ClauseWatch implements a **Multi-Stage Analysis Pipeline**. It combines deterministic detection for known abusive clauses (based on the Spanish *"Estatuto de los Trabajadores"*) with a **Zero-Shot AI Model** to understand context and detect nuanced risks (like "Unilateral Modification" or "Rights Waiver") that rigid rules might miss.

### How it works
1.  **Secure Ingestion** → The Backend (FastAPI) receives the PDF and performs a **Magic Bytes Verification** to prevent RCE attacks, ensuring file integrity before processing.
2.  **Smart Parsing & Filtering** → A custom PDF processor cleans the document, intelligently removing headers, footers, signatures, and page numbers to isolate relevant legal text and avoid false positives.
3.  **Hybrid Risk Detection (The Core)** →
    * **Layer 1 (Heuristic):** Linguistic root matching detects high-probability abusive terms immediately (e.g., "renuncia fuero", "15 días vacaciones").
    * **Layer 2 (Zero-Shot AI):** Ambiguous clauses are analyzed by **`recognai/zeroshot_selectra_medium`**, a Transformer model specialized in Spanish, to classify risks without needing labeled training data.
4.  **Generative Explanation** → Detected risks are fed into **Google Gemini 2.5 Flash**, which acts as an expert lawyer to explain *why* a clause is dangerous and cite the relevant legal context.
5.  **Ephemeral Visualization** → Results are rendered in a Next.js UI for real-time interaction.

## 🔒 Privacy & Security (Zero-Data Retention)
ClauseWatch AI is designed with a **"Privacy by Design"** architecture, making it suitable for confidential and sensitive legal documents.

-   **Volatile Memory Storage:** The database runs entirely in **RAM (`sqlite:///:memory:`)**. No analysis data, filenames, or risk scores are ever written to the server's hard drive.
-   **Ephemeral Sessions:** Once the analysis session ends or the container restarts, all data is cryptographically irretrievable—it simply ceases to exist.
-   **No Third-Party Training:** We do not store your contracts to train future models. The Transformer model runs locally within the container, and Gemini is used strictly for inference with zero-retention settings.

## Features to highlight
-   **Zero-Shot Learning:** Utilizes **Hugging Face Pipelines** with the `selectra-medium` model to classify legal text on the fly, eliminating the need for extensive model training.
-   **Spanish Legal Specialization:** Specifically tuned to detect abuses common in Spanish contracts (e.g., "modificación sustancial", "renuncia de derechos").
-   **Hybrid Engine Strategy:** Combines the speed of heuristics with the semantic understanding of Transformers, optimizing for both low latency and high accuracy.
-   **Containerized Architecture:** The backend is fully Dockerized, managing heavy ML dependencies (Torch, Transformers) and deployed on **Hugging Face Spaces**.
-   **RAG-Powered Context:** Implements Retrieval-Augmented Generation concepts to ground AI explanations in the actual document text.

## Technologies
ClauseWatch AI is built with:
-   **Core AI:** `PyTorch`, `Hugging Face Transformers` (Zero-Shot Classification)
-   **GenAI:** `Google Gemini API` (LLM for Explanations)
-   **Backend:** `Python`, `FastAPI`, `SQLAlchemy`, `PyMuPDF`
-   **Frontend:** `Next.js 14`, `TypeScript`, `Tailwind CSS`
-   **Infrastructure:** `Vercel` (Frontend), `Hugging Face Spaces` (Backend Container)

## Installation
This is a monorepo containing both Client and Server. Follow these steps to run it locally:

### 1. Backend Setup
Navigate to the backend folder, create a virtual environment, and install dependencies:

```bash
cd backend
#-------- Option A: Local Python -------- 
# Create .env file with your API Key
# API_KEY_GEMINI=your_google_api_key_here

# Install dependencies (Warning: This installs PyTorch ~1GB)
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

#-------- Option B: Docker --------
docker build -t clausewatch-api .
docker run -p 7860:7860 --env-file .env clausewatch-api
```bash
cd frontend

# Create .env.local file
# NEXT_PUBLIC_API_URL=[http://127.0.0.1:7860](http://127.0.0.1:7860)

# Install and run
npm install
npm run dev
```
