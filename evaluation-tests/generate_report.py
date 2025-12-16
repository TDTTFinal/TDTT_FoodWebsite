"""
Master Report Generator

Tổng hợp TẤT CẢ kết quả đánh giá vào một file TXT duy nhất

Requirements:
    pip install python-dotenv

Usage:
    python generate_report.py
    
Output:
    EVALUATION_REPORT.txt
"""

import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load env
load_dotenv()

# Paths
PERFORMANCE_RESULTS = 'performance/results'
QUALITY_RESULTS = 'quality/results'
ROUTING_RESULTS = 'routing/results'
DATABASE_RESULTS = 'database/results'
OUTPUT_FILE = 'EVALUATION_REPORT.txt'

def load_json(filepath):
    """Load JSON file safely"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def load_text(filepath):
    """Load text file safely"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return None

def parse_k6_summary(json_data):
    """Parse k6 JSON summary"""
    if not json_data or 'metrics' not in json_data:
        return None
    
    metrics = json_data['metrics']
    
    # k6 exports flat structure: metrics.http_reqs.count (not .values.count)
    http_reqs = metrics.get('http_reqs', {})
    http_req_failed = metrics.get('http_req_failed', {})
    http_req_duration = metrics.get('http_req_duration', {})
    
    return {
        'total_requests': http_reqs.get('count', 0),
        'failed_requests': http_req_failed.get('passes', 0),  # passes = passed checks (failed requests)
        'error_rate': http_req_failed.get('value', 0) * 100,  # value = rate as decimal
        'avg_duration': http_req_duration.get('avg', 0),
        'p95_duration': http_req_duration.get('p(95)', 0),
        'p99_duration': http_req_duration.get('p(99)', 0),
    }

def extract_quality_metrics(text):
    """Extract metrics from quality report text"""
    if not text:
        return None
    
    metrics = {}
    for line in text.split('\n'):
        if 'Average Hit@5:' in line:
            try:
                val = line.split(':')[1].strip().rstrip('%')
                metrics['hit_at_5'] = float(val)
            except:
                pass
        elif 'Average Precision@5:' in line:
            try:
                val = line.split(':')[1].strip().rstrip('%')
                metrics['precision_at_5'] = float(val)
            except:
                pass
    
    return metrics if metrics else None

def extract_routing_metrics(text):
    """Extract metrics from routing report text"""
    if not text:
        return None
    
    metrics = {}
    for line in text.split('\n'):
        if 'Average Improvement:' in line:
            try:
                val = line.split(':')[1].strip().rstrip('%')
                metrics['avg_improvement'] = float(val)
            except:
                pass
        elif 'Best Case:' in line:
            try:
                val = line.split(':')[1].strip().rstrip('%')
                metrics['best_improvement'] = float(val)
            except:
                pass
        elif 'Worst Case:' in line:
            try:
                val = line.split(':')[1].strip().rstrip('%')
                metrics['worst_improvement'] = float(val)
            except:
                pass
    
    return metrics if metrics else None

def extract_db_size(text):
    """Extract database size from report"""
    if not text:
        return None
    
    for line in text.split('\n'):
        if 'Total Restaurants:' in line:
            try:
                val = line.split(':')[1].strip()
                return int(val)
            except:
                pass
    
    return None

def generate_master_report():
    """Generate comprehensive evaluation report"""
    
    print("\n" + "="*70)
    print("📊 GENERATING MASTER EVALUATION REPORT")
    print("="*70 + "\n")
    
    # ===================================
    # 1. Load Performance Data (k6)
    # ===================================
    print("📈 Loading performance test results...")
    
    search_data = load_json(f'{PERFORMANCE_RESULTS}/search_summary.json')
    hf_data = load_json(f'{PERFORMANCE_RESULTS}/hf_summary.json')
    osrm_data = load_json(f'{PERFORMANCE_RESULTS}/osrm_summary.json')
    
    search_metrics = parse_k6_summary(search_data)
    hf_metrics = parse_k6_summary(hf_data)
    osrm_metrics = parse_k6_summary(osrm_data)
    
    # ===================================
    # 2. Load Quality Data
    # ===================================
    print("🔍 Loading search quality results...")
    
    quality_text = load_text(f'{QUALITY_RESULTS}/quality_metrics.txt')
    quality_metrics = extract_quality_metrics(quality_text)
    
    # ===================================
    # 3. Load Routing Data
    # ===================================
    print("🗺️  Loading route improvement results...")
    
    routing_text = load_text(f'{ROUTING_RESULTS}/route_improvement.txt')
    routing_metrics = extract_routing_metrics(routing_text)
    
    # ===================================
    # 4. Load Database Size
    # ===================================
    print("📊 Loading database size...")
    
    db_text = load_text(f'{DATABASE_RESULTS}/db_size.txt')
    db_size = extract_db_size(db_text)
    
    # ===================================
    # Generate Master Report
    # ===================================
    print("✍️  Generating master report...\n")
    
    report = f"""
{'='*70}
                    EVALUATION REPORT
        TDTT_FoodWebsite - Food Recommendation System
{'='*70}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Author: Evaluation System v1.0

{'='*70}


1. PERFORMANCE METRICS (k6 Load Testing)
{'='*70}

"""
    
    # Search API
    if search_metrics:
        status = '✅ PASSED' if search_metrics['p95_duration'] < 3000 and search_metrics['error_rate'] < 5 else '❌ FAILED'
        report += f"""
[Local Search API] - /api/search/advanced
--------------------------------------------------
Total Requests:              {search_metrics['total_requests']}
Failed Requests:             {search_metrics['failed_requests']}
Error Rate:                  {search_metrics['error_rate']:.2f}% (Target: <5%) {' ✅' if search_metrics['error_rate'] < 5 else ' ❌'}
Avg Response Time:           {search_metrics['avg_duration']:.2f}ms
p95 Response Time:           {search_metrics['p95_duration']:.2f}ms (Target: <3000ms) {' ✅' if search_metrics['p95_duration'] < 3000 else ' ❌'}
p99 Response Time:           {search_metrics['p99_duration']:.2f}ms
Status:                      {status}

"""
    else:
        report += """
[Local Search API]
--------------------------------------------------
⚠️  No data available. Run: k6 run performance/scripts/search.k6.js

"""
    
    # HuggingFace API
    if hf_metrics:
        status = '✅ PASSED' if hf_metrics['p95_duration'] < 3000 and hf_metrics['error_rate'] < 5 else '❌ FAILED'
        report += f"""
[HuggingFace Food Tour API]
--------------------------------------------------
Total Requests:              {hf_metrics['total_requests']}
Failed Requests:             {hf_metrics['failed_requests']}
Error Rate:                  {hf_metrics['error_rate']:.2f}% (Target: <5%) {' ✅' if hf_metrics['error_rate'] < 5 else ' ❌'}
Avg Response Time:           {hf_metrics['avg_duration']:.2f}ms
p95 Response Time:           {hf_metrics['p95_duration']:.2f}ms (Target: <3000ms) {' ✅' if hf_metrics['p95_duration'] < 3000 else ' ❌'}
p99 Response Time:           {hf_metrics['p99_duration']:.2f}ms
Status:                      {status}

"""
    else:
        report += """
[HuggingFace Food Tour API]
--------------------------------------------------
⚠️  No data available. Run: k6 run performance/scripts/hf_search.k6.js

"""
    
    # OSRM Routing
    if osrm_metrics:
        status = '✅ PASSED' if osrm_metrics['p95_duration'] < 5000 and osrm_metrics['error_rate'] < 5 else '❌ FAILED'
        report += f"""
[OSRM Routing API]
--------------------------------------------------
Total Requests:              {osrm_metrics['total_requests']}
Failed Requests:             {osrm_metrics['failed_requests']}
Error Rate:                  {osrm_metrics['error_rate']:.2f}% (Target: <5%) {' ✅' if osrm_metrics['error_rate'] < 5 else ' ❌'}
Avg Response Time:           {osrm_metrics['avg_duration']:.2f}ms
p95 Response Time:           {osrm_metrics['p95_duration']:.2f}ms (Target: <5000ms) {' ✅' if osrm_metrics['p95_duration'] < 5000 else ' ❌'}
p99 Response Time:           {osrm_metrics['p99_duration']:.2f}ms
Status:                      {status}

"""
    else:
        report += """
[OSRM Routing API]
--------------------------------------------------
⚠️  No data available. Run: k6 run performance/scripts/osrm_routing.k6.js

"""
    
    # Database Size
    report += f"""
{'='*70}


2. DATABASE SIZE
{'='*70}

"""
    
    if db_size is not None:
        status = '✅ PASSED' if db_size > 1000 else '❌ FAILED'
        report += f"""
Total Restaurants:           {db_size} (Target: >1000) {status}

"""
    else:
        report += """
⚠️  No data available. Run: python database/check_db_size.py

"""
    
    # Search Quality
    report += f"""
{'='*70}


3. SEARCH QUALITY
{'='*70}

"""
    
    if quality_metrics:
        report += f"""
Hit@5:                       {quality_metrics.get('hit_at_5', 0):.2f}%
Precision@5:                 {quality_metrics.get('precision_at_5', 0):.2f}%

Interpretation:
- Hit@5: % queries có ít nhất 1 kết quả relevant trong top 5
- Precision@5: % kết quả relevant trong top 5

"""
    else:
        report += """
⚠️  No data available. Run: python quality/eval_quality.py

"""
    
    # Route Improvement
    report += f"""
{'='*70}


4. ROUTE OPTIMIZATION IMPROVEMENT
{'='*70}

"""
    
    if routing_metrics:
        report += f"""
Average Improvement:         {routing_metrics.get('avg_improvement', 0):.2f}%
Best Case:                   {routing_metrics.get('best_improvement', 0):.2f}%
Worst Case:                  {routing_metrics.get('worst_improvement', 0):.2f}%

Comparison: Greedy (input order) vs OSRM Optimized (TSP)
Positive % = OSRM optimized tốt hơn baseline

"""
    else:
        report += """
⚠️  No data available. Run: python routing/eval_route_improvement.py

"""
    

    # Pre-calculate values for evaluation table
    search_p95 = search_metrics['p95_duration'] if search_metrics else 0
    search_p95_s = search_p95 / 1000
    search_err = search_metrics['error_rate'] if search_metrics else 0
    
    osrm_p95 = osrm_metrics['p95_duration'] if osrm_metrics else 0
    osrm_p95_s = osrm_p95 / 1000
    osrm_err = osrm_metrics['error_rate'] if osrm_metrics else 0
    
    db_val = db_size if db_size else "N/A"
    
    hit5 = quality_metrics.get('hit_at_5', 0) if quality_metrics else 0
    prec5 = quality_metrics.get('precision_at_5', 0) if quality_metrics else 0
    
    route_imp = routing_metrics.get('avg_improvement', 0) if routing_metrics else 0
    
    report += f"""
{'='*70}


📋 HOW TO FILL EVALUATION TABLE
{'='*70}

1. Search Response Time:
   - p95: {search_p95:.0f}ms ≈ {search_p95_s:.1f}s
   - Error rate: {search_err:.2f}%

2. Route Optimization Time:
   - p95: {osrm_p95:.0f}ms ≈ {osrm_p95_s:.1f}s
   - Error rate: {osrm_err:.2f}%

3. Database Size:
   - Restaurants: {db_val}

4. Search Quality:
   - Hit@5: {hit5:.1f}%
   - Precision@5: {prec5:.1f}%

5. Route Improvement:
   - Avg: {route_imp:.1f}%

6. Usability:
   - See manual test results in usability/


{'='*70}
END OF REPORT
{'='*70}
"""
    
    # Save report
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(report)
    print(f"\n✅ Master Report saved to: {OUTPUT_FILE}\n")
    print("="*70)

if __name__ == '__main__':
    generate_master_report()
