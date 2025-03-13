from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import get_expansions, get_cards_by_expansion, get_cards_by_name, update_card_quantity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/expansions/")
def list_expansions():
    """Fetch a list of Pokémon TCG expansions."""
    expansions = get_expansions()
    return {"expansions": expansions}

@app.get("/expansion/{set_id}/cards")
def list_cards(set_id: str):
    """Fetch all cards in a specific expansion."""
    cards = get_cards_by_expansion(set_id)
    if not cards:
        raise HTTPException(status_code=404, detail="Expansion not found or no cards available")
    return {"cards": cards}

@app.get("/search/cards/")
def search_cards(
    q: str = Query(..., min_length=1),
    rarity: str = Query(None),
    type_: str = Query(None)  # `type_` because `type` is a reserved Python keyword
):
    """Search for cards by name with optional rarity and type filters."""
    cards = get_cards_by_name(q, rarity, type_)
    return {"cards": cards}

@app.get("/collection/")
def get_collection_cards():
    """Retrieve all collected cards."""
    from database import get_collection  # Ensure import
    return {"collection": get_collection()}

@app.get("/collection/{expansion_id}/")
def get_collection_for_expansion(expansion_id: str):
    """Retrieve collection data for a specific expansion, including stats."""
    from database import get_collection_by_expansion
    return get_collection_by_expansion(expansion_id)


@app.post("/collection/update/")
def update_collection(card_id: str, change: int):
    """Update the quantity of a card in the collection."""
    result = update_card_quantity(card_id, change)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to update quantity")
    return {"message": "Quantity updated"}
