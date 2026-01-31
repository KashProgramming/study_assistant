# NoteAlchemy: An Intelligent Study Companion
Transform any PDF/DOCX/TXT into consolidated notes, flashcards, quizzes, and a document-aware chatbot. Built with a FastAPI backend (LangChain + Groq + Chroma) and a React/Vite frontend, fully deployed on Hugging Face Spaces.

🚀 Live Demo: [AI Study Assistant](https://huggingface.co/spaces/KashishM/study_assistant)

## ✨ Features
- Multi-file upload (PDF, DOCX, TXT) with server-side text extraction
- Consolidated notes with summary, key points, and detailed notes
- AI-generated flashcards and quizzes with adjustable counts and difficulty
- Chatbot that answers questions grounded in your uploaded documents (RAG)
- Download notes as a DOCX file
- Responsive, tabbed UI for Notes, Flashcards, Quiz, and Chatbot

## Tech Stack
- Backend: Python 3.10, FastAPI, LangChain, Groq (Llama 3.1 8B), Chroma, HuggingFace embeddings, Docx/PyMuPDF
- Frontend: React 19, Vite, React Router
- Build/Deploy: Docker (multi-stage), Hugging Face Spaces ready

## Repository Structure
- `backend/` – FastAPI app and AI utilities (`main.py`, `poc_app.py`, `file_handler/`)
- `frontend/` – React/Vite SPA (pages for upload/notes/flashcards/quiz/chatbot)
- `Dockerfile` – Multi-stage build serving built frontend via FastAPI
- `requirements.txt` – Python dependencies

## ⚙️ Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Environment variable: `GROQ_API_KEY` (required for all LLM-powered features)

## 🛠️ Setup & Running Locally
1) Clone and install backend
```
pip install -r requirements.txt
export GROQ_API_KEY=your_key_here
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Chroma will persist to `./chroma_db`. Uploaded files are saved to temp files per session.

2) Install and run frontend (in `frontend/`)
```
npm install
npm run dev -- --host --port 5173
```
Set `VITE_API_URL` in `.env` for custom API hosts; otherwise defaults to `http://localhost:8000` in dev and relative paths in prod.

3) Open the app
- Dev: http://localhost:5173
- Backend health: http://localhost:8000/api/health

## User Flow
1. Upload one or more supported files (PDF/DOCX/TXT).
2. Generate notes (summary, key points, detailed notes).
3. Generate flashcards (choose count and difficulty).
4. Generate quiz (choose number of questions and difficulty; view score and explanations).
5. Chat with the uploaded content. 
6. Download notes as DOCX.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request
