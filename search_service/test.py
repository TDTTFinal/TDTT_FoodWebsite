from src.database import get_collection
from src.config import settings

def test_keyword_search():
    """Test keyword search riêng biệt để debug"""
    col = get_collection(settings.COLLECTION_NAME)
    
    print("="*60)
    print("🔍 KEYWORD SEARCH DEBUG TEST")
    print("="*60)
    
    # Test 1: Simple text search
    print("\n📌 Test 1: Simple text search")
    pipeline1 = [
        {
            "$search": {
                "index": "keyword_index",
                "text": {
                    "query": "Phở",
                    "path": "name"
                }
            }
        },
        {"$limit": 5},
        {"$project": {"name": 1, "address": 1}}
    ]
    
    try:
        results1 = list(col.aggregate(pipeline1))
        print(f"   Results: {len(results1)}")
        for r in results1:
            print(f"   - {r.get('name')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: With score
    print("\n📌 Test 2: With search score")
    pipeline2 = [
        {
            "$search": {
                "index": "keyword_index",
                "text": {
                    "query": "Phở bò",
                    "path": ["name", "menu.name"]
                }
            }
        },
        {
            "$addFields": {
                "score": {"$meta": "searchScore"}
            }
        },
        {"$limit": 5},
        {"$project": {"name": 1, "score": 1}}
    ]
    
    try:
        results2 = list(col.aggregate(pipeline2))
        print(f"   Results: {len(results2)}")
        for r in results2:
            print(f"   - {r.get('name')}: {r.get('score', 0):.2f}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Compound query (giống code chính)
    print("\n📌 Test 3: Compound query")
    pipeline3 = [
        {
            "$search": {
                "index": "keyword_index",
                "compound": {
                    "should": [
                        {
                            "text": {
                                "query": "Phở bò",
                                "path": ["name", "menu.name"],
                                "score": {"boost": {"value": 3}}
                            }
                        },
                        {
                            "text": {
                                "query": "Phở bò",
                                "path": ["name", "menu.name", "address"],
                                "fuzzy": {
                                    "maxEdits": 2,
                                    "prefixLength": 0
                                },
                                "score": {"boost": {"value": 1.5}}
                            }
                        }
                    ]
                }
            }
        },
        {
            "$addFields": {
                "score": {"$meta": "searchScore"}
            }
        },
        {"$limit": 5},
        {"$project": {"name": 1, "score": 1}}
    ]
    
    try:
        results3 = list(col.aggregate(pipeline3))
        print(f"   Results: {len(results3)}")
        for r in results3:
            print(f"   - {r.get('name')}: {r.get('score', 0):.2f}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 4: Check index existence
    print("\n📌 Test 4: List all search indexes")
    try:
        indexes = list(col.list_search_indexes())
        print(f"   Found {len(indexes)} search indexes:")
        for idx in indexes:
            print(f"   - {idx['name']}: {idx.get('status', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 5: Database info
    print("\n📌 Test 5: Collection info")
    print(f"   Database: {col.database.name}")
    print(f"   Collection: {col.name}")
    print(f"   Document count: {col.count_documents({})}")
    
    # Test 6: Sample document structure
    print("\n📌 Test 6: Sample document")
    sample = col.find_one({"name": {"$regex": "Phở", "$options": "i"}})
    if sample:
        print(f"   Name: {sample.get('name')}")
        print(f"   Has menu: {'menu' in sample}")
        if 'menu' in sample:
            print(f"   Menu type: {type(sample['menu'])}")
            if isinstance(sample['menu'], list) and len(sample['menu']) > 0:
                print(f"   First menu item: {sample['menu'][0]}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_keyword_search()