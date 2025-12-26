import pandas as pd

try:
    df = pd.read_csv('data/menu_chi_tiet.csv', encoding='utf-8-sig')
    
    # Filter suspicious names
    # Look for names containing [], or starting with quote
    def is_suspicious(val):
        s = str(val).strip()
        if '[]' in s: return True
        if s.startswith("'") or s.startswith('"'): return True
        if len(s) < 2: return True
        return False
        
    bad_rows = df[df['ten_mon'].apply(is_suspicious)]
    
    print(f"Found {len(bad_rows)} suspicious rows.")
    if not bad_rows.empty:
        print(bad_rows['ten_mon'].head(20).tolist())
        
except Exception as e:
    print(e)
