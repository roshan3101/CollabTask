from fastapi import FastAPI
from app.core.lifespan import lifespan

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Hello World"}