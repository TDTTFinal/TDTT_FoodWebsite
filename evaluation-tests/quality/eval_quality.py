"""
Search Quality Evaluation Script

Đo lường chất lượng kết quả tìm kiếm bằng Hit@K và Precision@K

Requirements:
    pip install requests python-dotenv

Usage:
    python quality/eval_quality.py
    
Output:
    quality/results/quality_metrics.txt
    quality/results/search_results.json
"""

import os
import json
import csv
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = os.getenv('BASE_URL', 'http://localhost:5000')
SEARCH_PATH = os.getenv('SEARCH_PATH', '/api/search/advanced')
DEFAULT_LAT = float(os.getenv('DEFAULT_LAT', '10.7769'))
DEFAULT_LON = float(os.getenv('DEFAULT_LON', '106.7009'))
DEFAULT_RADIUS = int(os.getenv('DEFAULT_RADIUS', '5'))
DEFAULT_ALPHA = float(os.getenv('DEFAULT_ALPHA', '0.6'))
DEFAULT_TOP_K = int(os.getenv('DEFAULT_TOP_K', '10'))

QUERIES_FILE = 'quality/queries.csv'
RESULTS_DIR = 'quality/results'
OUTPUT_FILE = f'{RESULTS_DIR}/quality_metrics.txt'
JSON_OUTPUT = f'{RESULTS_DIR}/search_results.json'

def ensure_results_dir():
    """Tạo thư mục results nếu chưa tồn tại"""
    os.makedirs(RESULTS_DIR, exist_ok=True)

def load_queries():
    """Đọc queries từ CSV"""
    try:
        queries = []
        with open(QUERIES_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            queries = list(reader)
        print(f"✅ Loaded {len(queries)} queries from {QUERIES_FILE}")
        return queries
    except FileNotFoundError:
        print(f"❌ File not found: {QUERIES_FILE}")
        return None

def search_api(query):
    """Gọi API search và trả về kết quả"""
    params = {
        'q': query,
        'lat': DEFAULT_LAT,
        'lon': DEFAULT_LON,
        'radius': DEFAULT_RADIUS,
        'alpha': DEFAULT_ALPHA,
        'top_k': DEFAULT_TOP_K,
    }
    
    url = f"{BASE_URL}{SEARCH_PATH}"
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error for query '{query}': {e}")
        return None

def calculate_hit_at_k(results, expected_category, k=5):
    """
    Tính Hit@K - có ít nhất 1 kết quả relevant trong top K không?
    
    Note: Đây là phiên bản đơn giản dựa trên category matching.
    Để chính xác hơn, cần ground truth cụ thể.
    """
    if not results or 'data' not in results:
        return 0
    
    top_k_results = results['data'][:k]
    
    # Simple heuristic: check if any result's category matches expected
    for result in top_k_results:
        if expected_category and expected_category.lower() in result.get('category', '').lower():
            return 1
        # Also check in name
        if expected_category and expected_category.lower() in result.get('name', '').lower():
            return 1
    
    return 0

def calculate_precision_at_k(results, expected_category, k=5):
    """
    Tính Precision@K - % kết quả relevant trong top K
    
    Note: Đây là phiên bản đơn giản. Trong thực tế cần ground truth.
    """
    if not results or 'data' not in results:
        return 0.0
    
    top_k_results = results['data'][:k]
    if len(top_k_results) == 0:
        return 0.0
    
    relevant_count = 0
    for result in top_k_results:
        if expected_category and expected_category.lower() in result.get('category', '').lower():
            relevant_count += 1
        elif expected_category and expected_category.lower() in result.get('name', '').lower():
            relevant_count += 1
    
    return relevant_count / len(top_k_results)

def evaluate_search_quality():
    """Main evaluation function"""
    ensure_results_dir()
    
    print("\n" + "="*50)
    print("🔍 SEARCH QUALITY EVALUATION")
    print("="*50 + "\n")
    
    # Load queries
    queries_list = load_queries()
    if queries_list is None:
        return
    
    # Store all results
    all_results = []
    hit_at_5_scores = []
    precision_at_5_scores = []
    
    # Process each query
    for idx, row in enumerate(queries_list):
        query = row['query']
        expected_cat = row.get('expected_category', '')
        
        print(f"[{idx+1}/{len(queries_list)}] Testing: '{query}'")
        
        # Call API
        result = search_api(query)
        
        if result:
            # Calculate metrics
            hit_5 = calculate_hit_at_k(result, expected_cat, k=5)
            precision_5 = calculate_precision_at_k(result, expected_cat, k=5)
            
            hit_at_5_scores.append(hit_5)
            precision_at_5_scores.append(precision_5)
            
            # Store result
            all_results.append({
                'query_id': row['query_id'],
                'query': query,
                'expected_category': expected_cat,
                'num_results': len(result.get('data', [])),
                'hit_at_5': hit_5,
                'precision_at_5': precision_5,
                'top_5_names': [r.get('name', 'N/A') for r in result.get('data', [])[:5]]
            })
            
            print(f"  ✓ Results: {len(result.get('data', []))}, Hit@5: {hit_5}, Precision@5: {precision_5:.2f}")
        else:
            hit_at_5_scores.append(0)
            precision_at_5_scores.append(0.0)
            all_results.append({
                'query_id': row['query_id'],
                'query': query,
                'expected_category': expected_cat,
                'num_results': 0,
                'hit_at_5': 0,
                'precision_at_5': 0.0,
                'top_5_names': []
            })
            print(f"  ✗ No results")
    
    # Calculate overall metrics
    avg_hit_5 = sum(hit_at_5_scores) / len(hit_at_5_scores) if hit_at_5_scores else 0
    avg_precision_5 = sum(precision_at_5_scores) / len(precision_at_5_scores) if precision_at_5_scores else 0
    
    # Save JSON results
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Detailed results saved to: {JSON_OUTPUT}")
    
    # Generate report
    report = f"""
{'='*60}
SEARCH QUALITY EVALUATION REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}

📊 OVERALL METRICS
--------------------------------------------------
Total Queries Tested:        {len(queries_list)}
Average Hit@5:               {avg_hit_5:.2%}
Average Precision@5:         {avg_precision_5:.2%}

📈 DETAILED BREAKDOWN
--------------------------------------------------
Hit@5 = 1 (có kết quả relevant): {sum(hit_at_5_scores)} queries
Hit@5 = 0 (không relevant):      {len(hit_at_5_scores) - sum(hit_at_5_scores)} queries

⚠️  INTERPRETATION
--------------------------------------------------
Hit@K:       Tỷ lệ queries có ít nhất 1 kết quả relevant trong top K
Precision@K: Tỷ lệ kết quả relevant trong top K results

Note: Metrics này dựa trên category matching đơn giản.
      Để đánh giá chính xác hơn, cần ground truth thủ công từ scoring template.

📁 OUTPUT FILES
--------------------------------------------------
- Detailed JSON: {JSON_OUTPUT}
- This Report:   {OUTPUT_FILE}

{'='*60}
"""
    
    # Save report
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(report)
    print(f"✅ Report saved to: {OUTPUT_FILE}")

if __name__ == '__main__':
    evaluate_search_quality()
