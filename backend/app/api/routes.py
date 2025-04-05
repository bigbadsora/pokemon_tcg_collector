from fastapi import APIRouter, HTTPException, Query
import app.database as db

router = APIRouter()

#Expansion
@router.get("/expansions/", tags=["expansion"])
def list_expansions():
    """Fetch a list of Pokémon TCG expansions."""
    expansions = db.get_expansions()
    return {"expansions": expansions}

@router.get("/expansion/{set_id}/cards", tags=["expansion"])
def list_cards(set_id: str):
    """Fetch all cards in a specific expansion."""
    cards = db.get_cards_by_expansion(set_id)
    if not cards:
        raise HTTPException(status_code=404, detail="Expansion not found or no cards available")
    return {"cards": cards}

#Search and Filter
@router.get("/search/cards/", tags=["search"])
def search_cards(
    q: str = Query(..., min_length=1),
    rarity: str = Query(None),
    type_: str = Query(None)  # `type_` because `type` is a reserved Python keyword
):
    """Search for cards by name with optional rarity and type filters."""
    cards = db.get_cards_by_name(q, rarity, type_)
    return {"cards": cards}

#Collection
@router.get("/collection/", tags=["collection"])
def get_collection_cards():
    """Retrieve all collected cards."""
    return {"collection": db.get_collection()}


@router.get("/collection/{expansion_id}/", tags=["collection"])
def get_collection_for_expansion(expansion_id: str):
    """Retrieve collection data for a specific expansion, including stats."""
    return db.get_collection_by_expansion(expansion_id)


@router.post("/collection/update/", tags=["collection"])
def update_collection(card_id: str, change: int):
    """Update the quantity of a card in the collection."""
    result = db.update_card_quantity(card_id, change)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to update quantity")
    return {"message": "Quantity updated"}

#Settings
@router.post("/expansions/update/", tags=["settings"])
def update_expansions_endpoint():
    """Endpoint to update expansions by checking for new releases from the PokémonTCG API."""
    try:
        db.update_expansions()
        return {"message": "Expansions updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/expansion/{set_id}/cards/update", tags=["settings"])
def update_expansion_cards(set_id: str):
    """Fetch and store missing cards for a specific expansion chosen by the user."""
    result = db.fetch_cards_for_expansion(set_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to fetch cards."))
    return result

#Widgets on the home page
@router.get("/widgets/totalCards", tags=["widgets"])
def total_cards_endpoint():
    """
    Endpoint to get the total number of cards in the user's collection.
    Response format: { "totalCards": <number> }
    """
    total = db.get_total_cards_collection()
    return {"totalCards": total}

@router.get("/widgets/totalExpansions", tags=["widgets"])
def total_expansions_endpoint():
    """
    Endpoint to get the total number of expansions collected.
    Response format: { "totalExpansions": <number> }
    """
    total = db.get_total_expansions_collection()
    return {"totalExpansions": total}

@router.get("/widgets/cardsByExpansion", tags=["widgets"])
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