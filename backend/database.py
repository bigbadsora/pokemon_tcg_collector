import sqlite3
import requests
import os
from dotenv import load_dotenv

load_dotenv()

POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2/sets"
API_KEY = os.getenv("POKEMON_TCG_API_KEY")
HEADERS = {"X-Api-Key": API_KEY}

def get_db_connection():
    conn = sqlite3.connect("pokemon.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Fetch expansions from PokémonTCG.io and store in the database with additional details."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create the expansions table with additional fields
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expansions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        series TEXT NOT NULL,
        printed_total INTEGER,
        total INTEGER,
        legal_unlimited TEXT,
        legal_standard TEXT,
        legal_expanded TEXT,
        ptcgo_code TEXT,
        release_date TEXT NOT NULL,
        updated_at TEXT,
        symbol_url TEXT,
        logo_url TEXT
    )
    """)

    # Fetch expansions from API
    response = requests.get(POKEMON_TCG_API_URL, headers=HEADERS)

    if response.status_code == 200:
        expansions = response.json().get("data", [])

        if not expansions:
            print("No expansions found in API response.")
            return

        # Insert expansions into the database with the new fields
        cursor.executemany("""
            INSERT OR IGNORE INTO expansions (
                id, name, series, printed_total, total, legal_unlimited, legal_standard, legal_expanded, 
                ptcgo_code, release_date, updated_at, symbol_url, logo_url
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (
                exp["id"], exp["name"], exp["series"], exp.get("printedTotal"), exp.get("total"),
                exp["legalities"].get("unlimited"), exp["legalities"].get("standard"), exp["legalities"].get("expanded"),
                exp.get("ptcgoCode"), exp["releaseDate"], exp.get("updatedAt"),
                exp["images"]["symbol"], exp["images"]["logo"]
            ) for exp in expansions
        ])
        
        conn.commit()
        print(f"✔ {len(expansions)} expansions added to database with full details!")
    else:
        print(f"❌ Failed to fetch expansions: {response.status_code}")

    conn.close()

def fetch_and_store_cards():
    """Fetch cards for all expansions and store in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create the cards table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        expansion_id TEXT NOT NULL,
        number TEXT NOT NULL,
        rarity TEXT,
        supertype TEXT,
        subtype TEXT,
        hp TEXT,
        types TEXT,
        evolves_from TEXT,
        image_url TEXT,
        FOREIGN KEY(expansion_id) REFERENCES expansions(id)
    )
    """)

    # Fetch expansions from the DB
    expansions = cursor.execute("SELECT id FROM expansions").fetchall()

    for exp in expansions:
        set_id = exp["id"]
        response = requests.get(f"https://api.pokemontcg.io/v2/cards?q=set.id:{set_id}", headers=HEADERS)

        if response.status_code == 200:
            cards = response.json().get("data", [])

            if cards:
                cursor.executemany("""
                INSERT OR IGNORE INTO cards (id, name, expansion_id, number, rarity, supertype, subtype, hp, types, evolves_from, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    (
                        card["id"], card["name"], card["set"]["id"], card["number"], card.get("rarity"),
                        card["supertype"], ",".join(card.get("subtypes", [])), card.get("hp"),
                        ",".join(card.get("types", [])), card.get("evolvesFrom"), card["images"]["small"]
                    ) for card in cards
                ])

                conn.commit()
                print(f"✔ {len(cards)} cards added for expansion {set_id}")
        else:
            print(f"❌ Failed to fetch cards for {set_id}: {response.status_code}")

    conn.close()

def get_expansions():
    conn = get_db_connection()
    expansions = conn.execute("""
        SELECT * FROM expansions 
        ORDER BY series DESC, release_date DESC
    """).fetchall()
    conn.close()
    
    grouped_expansions = {}
    sorted_series = []
    
    for exp in expansions:
        series = exp["series"]
        if series not in grouped_expansions:
            grouped_expansions[series] = []
            sorted_series.append(series)
        grouped_expansions[series].append(dict(exp))
    
    # Sort the series by the most recent release date in that group
    sorted_series.sort(key=lambda s: max(e["release_date"] for e in grouped_expansions[s]), reverse=True)
    
    return {series: grouped_expansions[series] for series in sorted_series}

def get_cards_by_expansion(set_id):
    conn = get_db_connection()
    cards = conn.execute("""
        SELECT * FROM cards WHERE expansion_id = ? ORDER BY CAST(number AS INTEGER) ASC
    """, (set_id,)).fetchall()
    conn.close()
    return [dict(card) for card in cards]

if __name__ == "__main__":
    init_db()
    fetch_and_store_cards()
    print("Database initialized with expansions and cards from PokémonTCG.io.")

def fetch_missing_cards():
    """Fetch cards only for expansions that are missing in the cards table."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get expansions that have no cards stored
    expansions = cursor.execute("""
        SELECT id FROM expansions 
        WHERE id NOT IN (SELECT DISTINCT expansion_id FROM cards)
    """).fetchall()

    if not expansions:
        print("✅ All expansions already have cards fetched!")
        conn.close()
        return

    print(f"⏳ Fetching cards for {len(expansions)} missing expansions...")

    for exp in expansions:
        set_id = exp["id"]
        response = requests.get(f"https://api.pokemontcg.io/v2/cards?q=set.id:{set_id}", headers=HEADERS)

        if response.status_code == 200:
            cards = response.json().get("data", [])

            if cards:
                cursor.executemany("""
                INSERT OR IGNORE INTO cards (id, name, expansion_id, number, rarity, supertype, subtype, hp, types, evolves_from, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    (
                        card["id"], card["name"], card["set"]["id"], card["number"], card.get("rarity"),
                        card["supertype"], ",".join(card.get("subtypes", [])), card.get("hp"),
                        ",".join(card.get("types", [])), card.get("evolvesFrom"), card["images"]["small"]
                    ) for card in cards
                ])

                conn.commit()
                print(f"✔ {len(cards)} cards added for expansion {set_id}")
        else:
            print(f"❌ Failed to fetch cards for {set_id}: {response.status_code}")

    conn.close()

def get_cards_by_name(query, rarity=None, type_=None):
    """Search for cards by name with optional filtering."""
    conn = get_db_connection()
    sql = "SELECT * FROM cards WHERE LOWER(name) LIKE LOWER(?)"
    params = [f"%{query}%"]

    if rarity and rarity.strip():
        sql += " AND LOWER(COALESCE(rarity, '')) = LOWER(?)"
        params.append(rarity.strip().lower())

    if type_ and type_.strip():
        sql += " AND LOWER(COALESCE(types, '')) = LOWER(?)"
        params.append(type_.strip().lower())  # Direct match for single-type cards

    sql += " ORDER BY name ASC"
    cards = conn.execute(sql, tuple(params)).fetchall()
    conn.close()
    return [dict(card) for card in cards]

def init_collection_table():
    """Ensure the collection table exists and has the necessary columns."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create the table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS collection (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        expansion_id TEXT NOT NULL,
        number TEXT NOT NULL,
        rarity TEXT,
        supertype TEXT,
        hp TEXT,
        types TEXT,
        evolves_from TEXT,
        image_url TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        collection_number INTEGER DEFAULT 0,
        FOREIGN KEY(expansion_id) REFERENCES expansions(id)
    )
    """)

    conn.commit()
    conn.close()
    print("✔ Collection table initialized with collection_number column.")



def get_collection():
    """Retrieve all cards in the user's collection."""
    conn = get_db_connection()
    cards = conn.execute("""
        SELECT card_id, name, supertype AS type, types AS color, rarity, image_url, quantity
        FROM collection
        ORDER BY name ASC
    """).fetchall()
    conn.close()
    return [dict(card) for card in cards]

def get_collection():
    """Retrieve all cards in the user's collection."""
    conn = get_db_connection()
    cards = conn.execute("""
        SELECT card_id, name, supertype AS type, types AS color, rarity, image_url, quantity
        FROM collection
        ORDER BY name ASC
    """).fetchall()
    conn.close()
    return [dict(card) for card in cards]

def get_collection_by_expansion(expansion_id):
    """Retrieve all cards from a selected expansion, showing collection quantities and stats."""
    conn = get_db_connection()

    # Fetch all cards from the expansion
    cards = conn.execute("""
        SELECT 
            c.id AS card_id, 
            c.name, 
            c.supertype AS type, 
            c.types AS color, 
            c.rarity, 
            c.image_url, 
            COALESCE(col.quantity, 0) AS quantity,
            COALESCE(col.collection_number, CAST(c.number AS INTEGER)) AS collection_number
        FROM cards c
        LEFT JOIN collection col ON c.id = col.card_id
        WHERE c.expansion_id = ?
        ORDER BY collection_number ASC
    """, (expansion_id,)).fetchall()

    # Convert to list of dicts
    cards_list = [dict(card) for card in cards]

    # Calculate total collected and breakdown by rarity
    total_cards = len(cards_list)
    collected_cards = sum(1 for card in cards_list if card["quantity"] > 0)

    rarity_counts = {}
    rarity_collected = {}

    for card in cards_list:
        rarity = card["rarity"] or "Unknown"
        rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
        if card["quantity"] > 0:
            rarity_collected[rarity] = rarity_collected.get(rarity, 0) + 1

    conn.close()

    return {
        "collection": cards_list,
        "stats": {
            "total": f"{collected_cards}/{total_cards}",
            "rarities": {rarity: f"{rarity_collected.get(rarity, 0)}/{count}" for rarity, count in rarity_counts.items()}
        }
    }





def update_card_quantity(card_id, change):
    """Increase or decrease the quantity of a collected card while preserving collection_number."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if card exists in collection
    existing_card = cursor.execute(
        "SELECT quantity, collection_number FROM collection WHERE card_id = ?", (card_id,)
    ).fetchone()

    if not existing_card:
        # Fetch card details from cards table to insert a complete row
        card = cursor.execute(
            "SELECT id, name, expansion_id, number, rarity, supertype, hp, types, evolves_from, image_url FROM cards WHERE id = ?", (card_id,)
        ).fetchone()

        if not card:
            conn.close()
            return False  # Prevents inserting an unknown card

        # Insert the new card into collection with the correct collection_number
        cursor.execute(
            """
            INSERT INTO collection (card_id, name, expansion_id, number, rarity, supertype, hp, types, evolves_from, image_url, quantity, collection_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                card["id"], card["name"], card["expansion_id"], card["number"], card["rarity"],
                card["supertype"], card["hp"], card["types"], card["evolves_from"], card["image_url"],
                max(0, change),  # Ensure quantity is non-negative
                int(card["number"])  # Use card number as default collection number
            ),
        )
        conn.commit()
        conn.close()
        return True

    new_quantity = max(0, existing_card["quantity"] + change)

    # Preserve collection_number when updating quantity
    if new_quantity > 0:
        cursor.execute(
            "UPDATE collection SET quantity = ?, collection_number = ? WHERE card_id = ?",
            (new_quantity, existing_card["collection_number"], card_id),
        )
    else:
        cursor.execute("DELETE FROM collection WHERE card_id = ?", (card_id,))

    conn.commit()
    conn.close()
    return True

