from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer import analyze_text
from responder import generate_reply
from models import AnalyzeRequest, AnalyzeResponse, GenerateReplyRequest, GenerateReplyResponse

app = FastAPI(title='Facebook Freelance Bot Analyzer')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health_check():
    return {'status': 'ok'}


@app.post('/analyze', response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    try:
        data = analyze_text(request.text)
        return AnalyzeResponse(**data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Analyze failed: {str(exc)}')


@app.post('/generate-reply', response_model=GenerateReplyResponse)
def generate(request: GenerateReplyRequest):
    try:
        reply = generate_reply(request.text, request.language, request.category)
        return GenerateReplyResponse(reply=reply)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Generate reply failed: {str(exc)}')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=False)
