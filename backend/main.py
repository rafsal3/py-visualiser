from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import io
import contextlib
import traceback

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str

@app.post("/execute")
async def execute_code(request: CodeRequest):
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            # Safe-ish execution for MVP (User runs their own local code)
            # Use a shared globals dict if we want state persistence across cells later
            # For now, isolated execution per run
            exec_globals = {}
            exec(request.code, exec_globals)
        
        return {
            "stdout": stdout_buffer.getvalue(),
            "stderr": stderr_buffer.getvalue(),
            "status": "success"
        }
    except Exception:
        # Capture the full traceback including the exception message
        return {
            "stdout": stdout_buffer.getvalue(),
            "stderr": traceback.format_exc(),
            "status": "error"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
