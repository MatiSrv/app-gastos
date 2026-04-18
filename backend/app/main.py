from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import categories, accounts, transactions, transfers, dashboard

app = FastAPI(title="Expense Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://app-gastos.vercel.app",
        "https://app-gastos-front-five.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(transfers.router)
app.include_router(dashboard.router)

# healtgh check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}
