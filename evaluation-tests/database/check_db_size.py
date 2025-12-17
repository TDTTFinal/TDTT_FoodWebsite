"""
Database Size Check Script

Đếm số lượng restaurants trong MongoDB

Requirements:
    pip install pymongo python-dotenv

Usage:
    python database/check_db_size.py
    
Output:
    database/results/db_size.txt
"""

import os
from datetime import datetime
from dotenv import load_dotenv

try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    print("⚠️  pymongo not installed. Run: pip install pymongo")

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/tdtt_food')
RESULTS_DIR = 'database/results'
OUTPUT_FILE = f'{RESULTS_DIR}/db_size.txt'

def ensure_results_dir():
    """Tạo thư mục results"""
    os.makedirs(RESULTS_DIR, exist_ok=True)

def check_database_size():
    """Kiểm tra số lượng restaurants trong MongoDB"""
    if not PYMONGO_AVAILABLE:
        print("❌ Cannot proceed without pymongo")
        return
    
    ensure_results_dir()
    
    print("\n" + "="*60)
    print("📊 DATABASE SIZE CHECK")
    print("="*60 + "\n")
    
    print(f"Connecting to MongoDB: {MONGO_URI}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Get database name from URI
        db_name = MONGO_URI.split('/')[-1].split('?')[0]
        db = client[db_name]
        
        # Test connection
        client.server_info()
        print("✅ Connected to MongoDB successfully\n")
        
        # Count restaurants
        restaurants_count = db.restaurants.count_documents({})
        
        print(f"📊 Total Restaurants: {restaurants_count}")
        
        # Additional stats
        try:
            # Count by category
            pipeline = [
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            categories = list(db.restaurants.aggregate(pipeline))
            
            # Avg rating
            avg_rating_pipeline = [
                {"$group": {"_id": None, "avg_rating": {"$avg": "$avg_rating"}}}
            ]
            avg_rating_result = list(db.restaurants.aggregate(avg_rating_pipeline))
            avg_rating = avg_rating_result[0]['avg_rating'] if avg_rating_result else 0
            
        except Exception as e:
            print(f"⚠️  Could not fetch additional stats: {e}")
            categories = []
            avg_rating = 0
        
        # Generate report
        report = f"""
{'='*60}
DATABASE SIZE REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}

📊 MAIN METRICS
--------------------------------------------------
Total Restaurants:           {restaurants_count}
Target:                      > 1000
Status:                      {'✅ PASSED' if restaurants_count > 1000 else '❌ FAILED'}

📈 ADDITIONAL STATS
--------------------------------------------------
Average Rating:              {avg_rating:.2f} / 10

Top Categories:
"""
        
        for cat in categories[:10]:
            category_name = cat['_id'] or 'Unknown'
            count = cat['count']
            report += f"  - {category_name:<20} {count:>5} restaurants\n"
        
        report += f"""
{'='*60}

⚠️  NOTE
--------------------------------------------------
Ensure MongoDB has at least 1000 restaurants for meaningful
search and routing tests.

If count < 1000, consider running seedData.js script.

📁 OUTPUT
--------------------------------------------------
Report saved to: {OUTPUT_FILE}

{'='*60}
"""
        
        # Save report
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(report)
        print(f"✅ Report saved to: {OUTPUT_FILE}")
        
        # Close connection
        client.close()
        
    except Exception as e:
        error_msg = f"""
{'='*60}
❌ ERROR
{'='*60}

Could not connect to MongoDB or fetch data.

Error: {str(e)}

Troubleshooting:
1. Check if MongoDB is running
2. Verify MONGO_URI in .env file
3. Ensure network connectivity

Current MONGO_URI: {MONGO_URI}

{'='*60}
"""
        print(error_msg)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(error_msg)

if __name__ == '__main__':
    check_database_size()
