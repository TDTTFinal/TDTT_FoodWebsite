"""
Route Improvement Evaluation Script

So sánh Greedy (input order) vs OSRM Optimized routing
Đo % cải thiện khoảng cách tổng

Requirements:
    pip install requests python-dotenv

Usage:
    python routing/eval_route_improvement.py
    
Output:
    routing/results/route_improvement.txt
    routing/results/route_comparison.csv
"""

import os
import json
import requests
import math
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OSRM_BASE_URL = os.getenv('OSRM_BASE_URL', 'https://router.project-osrm.org')
ROUTES_FILE = 'routing/routes_sample.json'
RESULTS_DIR = 'routing/results'
OUTPUT_FILE = f'{RESULTS_DIR}/route_improvement.txt'
CSV_OUTPUT = f'{RESULTS_DIR}/route_comparison.csv'

def ensure_results_dir():
    """Tạo thư mục results"""
    os.makedirs(RESULTS_DIR, exist_ok=True)

def haversine_distance(lat1, lon1, lat2, lon2):
    """Tính khoảng cách Haversine (km) giữa 2 điểm"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_greedy_distance(stops):
    """Tính tổng khoảng cách theo thứ tự input (Greedy baseline)"""
    total_distance = 0
    for i in range(len(stops) - 1):
        dist = haversine_distance(
            stops[i]['lat'], stops[i]['lon'],
            stops[i+1]['lat'], stops[i+1]['lon']
        )
        total_distance += dist
    return total_distance

def get_osrm_optimized_distance(stops):
    """Gọi OSRM /trip API để lấy khoảng cách optimized"""
    # Build coordinates string (lon, lat format for OSRM)
    coords = ';'.join([f"{stop['lon']},{stop['lat']}" for stop in stops])
    
    # Use /trip endpoint for TSP optimization
    url = f"{OSRM_BASE_URL}/trip/v1/driving/{coords}?source=first&destination=last&roundtrip=false"
    
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        if data.get('code') == 'Ok' and data.get('trips'):
            # Distance in meters, convert to km
            distance_km = data['trips'][0]['distance'] / 1000
            waypoint_order = [w['waypoint_index'] for w in data.get('waypoints', [])]
            return distance_km, waypoint_order
        else:
            print(f"  ⚠️  OSRM API returned: {data.get('code', 'Unknown error')}")
            return None, None
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ OSRM API Error: {e}")
        return None, None

def evaluate_routes():
    """Main evaluation function"""
    ensure_results_dir()
    
    print("\n" + "="*60)
    print("🗺️  ROUTE IMPROVEMENT EVALUATION")
    print("="*60 + "\n")
    
    # Load sample routes
    try:
        with open(ROUTES_FILE, 'r', encoding='utf-8') as f:
            tours = json.load(f)
        print(f"✅ Loaded {len(tours)} tours from {ROUTES_FILE}\n")
    except FileNotFoundError:
        print(f"❌ File not found: {ROUTES_FILE}")
        return
    
    # Results storage
    results = []
    improvements = []
    
    # Process each tour
    for idx, tour in enumerate(tours):
        tour_name = tour.get('name', f"Tour {idx+1}")
        stops = tour.get('stops', [])
        
        if len(stops) < 2:
            print(f"[{idx+1}] ⚠️  Skipping '{tour_name}': Need at least 2 stops")
            continue
        
        print(f"[{idx+1}/{len(tours)}] Evaluating: {tour_name} ({len(stops)} stops)")
        
        # Calculate Greedy (baseline)
        greedy_distance = calculate_greedy_distance(stops)
        print(f"  📍 Greedy (input order): {greedy_distance:.2f} km")
        
        # Calculate OSRM Optimized
        optimized_distance, waypoint_order = get_osrm_optimized_distance(stops)
        
        if optimized_distance is not None:
            print(f"  🚀 OSRM Optimized:       {optimized_distance:.2f} km")
            
            # Calculate improvement
            improvement = ((greedy_distance - optimized_distance) / greedy_distance) * 100
            improvements.append(improvement)
            
            print(f"  ✅ Improvement:          {improvement:+.2f}%\n")
            
            results.append({
                'tour_name': tour_name,
                'num_stops': len(stops),
                'greedy_km': round(greedy_distance, 2),
                'optimized_km': round(optimized_distance, 2),
                'improvement_pct': round(improvement, 2),
                'waypoint_order': waypoint_order
            })
        else:
            print(f"  ❌ OSRM optimization failed\n")
            results.append({
                'tour_name': tour_name,
                'num_stops': len(stops),
                'greedy_km': round(greedy_distance, 2),
                'optimized_km': None,
                'improvement_pct': None,
                'waypoint_order': None
            })
    
    # Calculate overall metrics
    if improvements:
        avg_improvement = sum(improvements) / len(improvements)
        max_improvement = max(improvements)
        min_improvement = min(improvements)
    else:
        avg_improvement = max_improvement = min_improvement = 0
    
    # Generate report
    report = f"""
{'='*60}
ROUTE IMPROVEMENT EVALUATION REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}

📊 OVERALL STATISTICS
--------------------------------------------------
Total Tours Tested:          {len(tours)}
Successfully Optimized:      {len(improvements)}
Failed:                      {len(tours) - len(improvements)}

🚀 IMPROVEMENT METRICS
--------------------------------------------------
Average Improvement:         {avg_improvement:.2f}%
Best Case:                   {max_improvement:.2f}%
Worst Case:                  {min_improvement:.2f}%

📈 DETAILED RESULTS
--------------------------------------------------
"""
    
    for r in results:
        report += f"\n{r['tour_name']}:\n"
        report += f"  - Stops: {r['num_stops']}\n"
        report += f"  - Greedy:     {r['greedy_km']} km\n"
        if r['optimized_km']:
            report += f"  - Optimized:  {r['optimized_km']} km\n"
            report += f"  - Improvement: {r['improvement_pct']:+.2f}%\n"
        else:
            report += f"  - Optimized:  FAILED\n"
    
    report += f"""
{'='*60}

⚠️  INTERPRETATION
--------------------------------------------------
- Greedy Baseline: Thứ tự input ban đầu (không optimize)
- OSRM Optimized:  Sử dụng /trip API (TSP solver)
- Improvement:     % giảm khoảng cách so với baseline

Positive % = Optimized tốt hơn Greedy
Negative % = Greedy tốt hơn (rare, do heuristic)

📁 OUTPUT FILES
--------------------------------------------------
- This Report: {OUTPUT_FILE}
- CSV Data:    {CSV_OUTPUT}

{'='*60}
"""
    
    # Save report
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(report)
    print(f"✅ Report saved to: {OUTPUT_FILE}")
    
    # Save CSV
    with open(CSV_OUTPUT, 'w', encoding='utf-8') as f:
        f.write("tour_name,num_stops,greedy_km,optimized_km,improvement_pct\n")
        for r in results:
            f.write(f"{r['tour_name']},{r['num_stops']},{r['greedy_km']},{r['optimized_km']},{r['improvement_pct']}\n")
    
    print(f"✅ CSV saved to: {CSV_OUTPUT}")

if __name__ == '__main__':
    evaluate_routes()
