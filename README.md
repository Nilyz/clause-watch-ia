# ClauseWatch AI
ClauseWatch AI is an intelligent contract analysis platform that leverages **Fine-Tuned Transformers (BERT)** for semantic risk detection and **Generative AI (RAG)** for deep legal explanation.

## Preview
![ClauseWatch Preview](./assets/preview.png "ClauseWatch Dashboard")

## About
ClauseWatch AI modernizes the legal review process by transforming dense PDFs into actionable insights. Moving beyond simple "keyword search", ClauseWatch implements a **Multi-Model AI Architecture**. It deploys a specialized **Legal-BERT** model to detect nuanced risks (like "Unilateral Modification") that simple regex misses, while leveraging Large Language Models (LLMs) for complex reasoning and user Q&A.

### How it works
1.  **Secure Ingestion** → The Backend (FastAPI) receives the PDF and performs a **Magic Bytes Verification** to prevent RCE attacks, ensuring file integrity before processing.
2.  **Semantic Risk Detection (Layer 1)** → Instead of rigid rules, the system uses **`nlpaueb/legal-bert-base-uncased`**, a transformer model pre-trained on legal texts. This allows it to understand context and detect dangerous clauses even if the wording is obscure or complex.
3.  **Vectorization (Layer 2)** → Text chunks are processed via **Google Embeddings API** to create semantic vectors, stored in an ephemeral in-memory vector store for privacy-focused sessions.
4.  **RAG & Explanation (Layer 3)** → When a user queries a clause, the system retrieves relevant context and feeds it to **Google Gemini 2.5 Flash**, which acts as an expert lawyer to explain the implications in simple terms.
5.  **Visualization** → Next.js renders risk scores and analysis cards in a responsive UI, offering real-time interaction with the document's data.

## Features to highlight
-   **Deep Learning Powered:** Utilizes **PyTorch & Transformers** to run a specialized Legal-BERT model, offering superior accuracy over traditional keyword matching.
-   **Hybrid AI Strategy:** Combines a deterministic discriminative model (BERT) for classification with a generative model (Gemini) for explanation, optimizing for both precision and creativity.
-   **Containerized Architecture:** The backend is fully Dockerized to manage heavy ML dependencies (Torch, CUDA libraries) and deployed on **Hugging Face Spaces** for high-performance inference.
-   **Privacy by Design (Ephemeral):** Built for security. Files and vector indexes are processed in volatile memory and discarded after the session.
-   **RAG-Powered Chat:** Implements Retrieval-Augmented Generation to allow users to "chat" with their contract.

## Technologies
ClauseWatch AI is built with:
-   **Core AI:** `PyTorch`, `Hugging Face Transformers` (Legal-BERT)
-   **GenAI:** `Google Gemini API` (LLM & Embeddings)
-   **Backend:** `Python`, `FastAPI`, `Docker`
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
# GENAI_API_KEY=your_google_api_key_here

# Install dependencies (Warning: This installs PyTorch ~1GB)
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

#-------- Option B: Docker --------
docker build -t clausewatch-api .
docker run -p 7860:7860 --env-file .env clausewatch-api
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install Node dependencies:

```bash
cd frontend

# Create .env.local file
# NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000) (or http://localhost:7860 if using Docker)

# Install and run
npm install
npm run dev
```
