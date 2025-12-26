import sys
import os
import ast
import regex as re
import pandas as pd

sys.path.append(os.path.join(os.getcwd(), 'src'))

try:
    from to_mongo import process_menu
    print("Successfully imported process_menu")
except ImportError:
    print("Could not import to_mongo.")
    sys.exit(1)

# Sample Tuple Data with unescaped quotes causing literal_eval failure
# Note: "Phở Trộn 'Bò'" inside the single quoted string 'Phở Trộn 'Bò'' is invalid python literal
sample_broken_tuple = """('Phở Trộn 'Bò' (70k)', [{'ten_mon': 'Phở Trộn Bò', 'gia': '70.000', 'anh_mon': 'http://image1.jpg'}])"""

print("Testing Broken Tuple Format...")
results = process_menu(sample_broken_tuple)

print(f"Found {len(results)} items.")
for item in results:
    print(item)

# Check results
if len(results) == 1 and results[0]['name'] == 'Phở Trộn Bò' and results[0]['image_url'] == 'http://image1.jpg':
    print("SUCCESS: Recovered from broken tuple.")
else:
    print("FAILURE: Did not recover correctly.")

# Test Garbage Fallback Rejection
print("\nTesting Garbage Rejection...")
garbage_result = process_menu("""('Garbage', [{'broken': 'list'""") # Incomplete
print(f"Garbage Result: {garbage_result}")
if garbage_result == []:
    print("SUCCESS: Rejected garbage.")
else:
    print("FAILURE: Accepted garbage.")
