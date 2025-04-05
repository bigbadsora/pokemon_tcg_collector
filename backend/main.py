from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import database as db

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
    expansions = db.get_expansions()
    return {"expansions": expansions}

@app.get("/expansion/{set_id}/cards")
def list_cards(set_id: str):
    """Fetch all cards in a specific expansion."""
    cards = db.get_cards_by_expansion(set_id)
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
    cards = db.get_cards_by_name(q, rarity, type_)
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
    result = db.update_card_quantity(card_id, change)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to update quantity")
    return {"message": "Quantity updated"}

@app.post("/expansions/update/")
def update_expansions_endpoint():
    """Endpoint to update expansions by checking for new releases from the PokémonTCG API."""
    try:
        db.update_expansions()
        return {"message": "Expansions updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/expansion/{set_id}/cards/update")
def update_expansion_cards(set_id: str):
    """Fetch and store missing cards for a specific expansion chosen by the user."""
    from database import fetch_cards_for_expansion  # Import the new function
    result = fetch_cards_for_expansion(set_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to fetch cards."))
    return result

#Widget endpoints
@app.get("/api/widgets/totalCards")
def total_cards_endpoint():
    """
    Endpoint to get the total number of cards in the user's collection.
    Response format: { "totalCards": <number> }
    """
    total = db.get_total_cards_collection()
    return {"totalCards": total}

@app.get("/api/widgets/totalExpansions")
def total_expansions_endpoint():
    """
    Endpoint to get the total number of expansions collected.
    Response format: { "totalExpansions": <number> }
    """
    total = db.get_total_expansions_collection()
    return {"totalExpansions": total}

@app.get("/api/widgets/cardsByExpansion")
def cards_by_expansion_endpoint():
    """
    Endpoint to get a breakdown of the cards by expansion.
    Response format: [
        { "expansionName": "Base Set", "cardCount": 42 },
        { "expansionName": "Jungle", "cardCount": 17 },
         ...
    ]
    """
    data = db.get_cards_by_expansion_collection()
    return data