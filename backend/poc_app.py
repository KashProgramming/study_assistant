import time
import tempfile
from pathlib import Path
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json
from backend.file_handler.txt_handler import extract_txt_text
from backend.file_handler.pdf_handler import extract_pdf_text
from backend.file_handler.docx_handler import extract_docx_text

load_dotenv()
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")

def save_uploaded(uploaded):
    suffix=Path(uploaded.name).suffix
    with tempfile.NamedTemporaryFile(delete=False,suffix=suffix) as tmp:
        tmp.write(uploaded.read())
        return Path(tmp.name)

def extract_text(file):
    ext=file.suffix.lower()
    if ext==".txt":
        return extract_txt_text(str(file))
    if ext==".pdf":
        return extract_pdf_text(str(file))
    if ext==".docx":
        return extract_docx_text(str(file))
    return ""

def create_chunks(file):
    chunks=[]
    try:
        txt=extract_text(file)
        if not txt or txt.strip()=="":
            return chunks
        doc=Document(page_content=txt,metadata={"source":file.name,"path":str(file)})
        splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
        split_docs=splitter.split_documents([doc])
        for d in split_docs:
            d.metadata["source"]=file.name
        chunks.extend(split_docs)
    except Exception as e:
        print("Error:",str(e))
    return chunks

def create_vector_db(all_chunks):
    embeddings=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    name="flashcards_"+str(int(time.time()))
    store=Chroma(collection_name=name,embedding_function=embeddings,persist_directory="./chroma_db")
    store.add_documents(all_chunks)
    return store

llm=ChatGroq(model="llama-3.1-8b-instant")

class Flashcard(BaseModel):
    q:str
    a:str

class FlashcardList(BaseModel):
    cards:List[Flashcard]

structured_llm=llm.with_structured_output(FlashcardList)

def generate_flashcards(text,num_cards:int=10,difficulty:str="medium"):
    difficulty=difficulty.lower().strip()
    if difficulty not in {"easy","medium","hard"}:
        difficulty="medium"

    prompt=(
        f"Generate EXACTLY {num_cards} flashcards based on this text, not more or less. "
        "Put them inside a list under the key 'cards'. "
        "Each flashcard must contain 'q' and 'a'. "
        f"The difficulty level of the flashcards should be {difficulty}. "
        "Text:"+text
    )
    result=structured_llm.invoke(prompt)
    return result.cards

class ConsolidatedNotes(BaseModel):
    title:str
    summary:str
    key_points:List[str]
    detailed_notes:str

# Use JSON mode instead of structured output to avoid Groq API issues
notes_llm=ChatGroq(model="llama-3.1-8b-instant",model_kwargs={"response_format":{"type":"json_object"}})

def generate_notes(text):
    prompt=(
        "Generate comprehensive consolidated notes from the following text in JSON format. "
        "The JSON should have exactly these fields: "
        "- 'title': a clear, descriptive title for the notes "
        "- 'summary': a brief summary (2-3 sentences) "
        "- 'key_points': an array of important key points (3-7 items) "
        "- 'detailed_notes': comprehensive detailed notes covering all important information "
        "\n\nText: "+text[:8000]
    )
    
    try:
        response=notes_llm.invoke(prompt)
        notes_data=json.loads(response.content)

        raw_key_points=notes_data.get("key_points",[])
        if isinstance(raw_key_points,list):
            key_points=raw_key_points
        else:
            key_points=[str(raw_key_points)]

        raw_detailed=notes_data.get("detailed_notes","")
        if isinstance(raw_detailed,(dict,list)):
            detailed_str=json.dumps(raw_detailed,ensure_ascii=False,indent=2)
        else:
            detailed_str=str(raw_detailed)
        
        return ConsolidatedNotes(
            title=notes_data.get("title","Study Notes"),
            summary=notes_data.get("summary",""),
            key_points=key_points,
            detailed_notes=detailed_str
        )
    except (json.JSONDecodeError,KeyError) as e:
        print(f"Error parsing notes JSON:{e}")
        return ConsolidatedNotes(
            title="Study Notes",
            summary="Unable to generate summary. Please try again.",
            key_points=["Error generating notes"],
            detailed_notes="An error occurred while generating notes. Please try uploading your files again."
        )

class QuizQuestion(BaseModel):
    question:str
    options:List[str]
    correct_answer:str
    explanation:str

class QuizList(BaseModel):
    questions:List[QuizQuestion]

quiz_llm=ChatGroq(model="llama-3.1-8b-instant",model_kwargs={"response_format":{"type":"json_object"}})

def generate_quiz(text,num_questions:int=5,difficulty:str="medium"):
    difficulty=difficulty.lower().strip()
    if difficulty not in {"easy","medium","hard"}:
        difficulty="medium"
    
    prompt=(
        f"Generate EXACTLY {num_questions} multiple-choice quiz questions based on this text. "
        f"The difficulty level should be {difficulty}. "
        "Return a JSON object with a 'questions' array. Each question must have: "
        "- 'question': the question text "
        "- 'options': an array of exactly 4 answer options "
        "- 'correct_answer': the correct answer (must match one of the options exactly) "
        "- 'explanation': a brief explanation of why this is the correct answer "
        "\n\nText: "+text[:8000]
    )
    
    try:
        response=quiz_llm.invoke(prompt)
        quiz_data=json.loads(response.content)
        questions_data=quiz_data.get("questions",[])
        
        questions=[]
        for q in questions_data:
            questions.append(QuizQuestion(
                question=q.get("question",""),
                options=q.get("options",[]),
                correct_answer=q.get("correct_answer",""),
                explanation=q.get("explanation","")
            ))
        
        return QuizList(questions=questions)
    except (json.JSONDecodeError,KeyError) as e:
        print(f"Error parsing quiz JSON:{e}")
        return QuizList(questions=[])

def answer_question(question:str,vector_store):
    """Use RAG to answer questions based on the vector database"""
    try:
        # Retrieve relevant documents
        docs=vector_store.similarity_search(question,k=3)
        
        # Combine retrieved context
        context=""
        sources_set=set()
        
        if docs:
            context="\n\n".join([doc.page_content for doc in docs])
            # Extract actual filenames from metadata
            for doc in docs:
                source=doc.metadata.get("source","")
                if source and source != "Unknown":
                    sources_set.add(source)
        
        # Format sources
        if sources_set:
            sources=", ".join(sorted(sources_set))
        else:
            sources=""
        
        # Generate answer using LLM with conversational tone
        if context:
            prompt=(
                f"You are a helpful and friendly AI study assistant. Answer the following question based on the context provided. "
                f"Be conversational, clear, and helpful. If the question is a greeting or casual conversation, respond warmly. "
                f"If the answer is not in the context, politely say so and offer to help with something else.\n\n"
                f"Context from the documents:\n{context}\n\n"
                f"Question: {question}\n\n"
                f"Answer:"
            )
        else:
            # No context found, but still be conversational
            prompt=(
                f"You are a helpful and friendly AI study assistant. The user said: '{question}'. "
                f"Respond in a warm, conversational way. If it's a greeting, greet them back. "
                f"If it's a question you can't answer without the documents, politely explain that and ask if they have questions about their uploaded materials."
            )
        
        response=llm.invoke(prompt)
        answer=response.content.strip()
        
        return {"answer":answer,"sources":sources}
    except Exception as e:
        print(f"Error answering question:{e}")
        return {"answer":"I apologize, but I encountered an error processing your question. Please try again.","sources":""}
