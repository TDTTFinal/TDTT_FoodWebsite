import pandas as pd
import os

# Đường dẫn file
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_dir, "tat_ca_thong_tin_nha_hang.csv")

print(f"📂 Đang đọc file: {csv_path}")

try:
    # Đọc file CSV
    df = pd.read_csv(csv_path, encoding='utf-8-sig')
    print(df.info())


except FileNotFoundError:
    print("❌ Không tìm thấy file CSV!")
except Exception as e:
    print(f"❌ Lỗi khi đọc file: {e}")
