import google.generativeai as genai
import json
from src.config import settings

class IntentParser:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')

    def parse(self, query: str) -> list[dict]:
        """
        Input: "tôi muốn ăn phở bò sau đó uống cafe gần chợ bến thành"
        Output: [
            {"keyword": "phở bò", "district": "Quận 1", "location_query": null}, 
            {"keyword": "cafe", "district": "Quận 1", "location_query": "chợ Bến Thành"}
        ]
        """
        prompt = f"""
        Đóng vai trò là một AI phân tích ý định tìm kiếm địa điểm (Intent Parser).
        Nhiệm vụ: Chuyển đổi câu nói tự nhiên thành danh sách các bước hành động (JSON).

        INPUT: "{query}"

        QUY TẮC XỬ LÝ:
        1. Tách câu thành các bước riêng biệt dựa trên thứ tự thời gian (sáng, trưa, tối, sau đó, rồi...).
        2. Trích xuất 'district':
           - Chuẩn hóa tên: "q1", "quận nhất" -> "Quận 1"; "bình thạnh" -> "Bình Thạnh".
           - Nếu một bước không nói rõ quận, lấy quận của bước khác hoặc null.
        3. Trích xuất 'location_query' (Địa điểm mốc/Landmark):
           - Là các địa danh, tòa nhà, chợ, trường học, công viên... đi kèm với "gần", "tại", "ở", "xung quanh".
           - VD: "gần chợ Bến Thành" -> "chợ Bến Thành"; "khu phố đi bộ" -> "phố đi bộ Nguyễn Huệ".
           - Nếu không có địa điểm cụ thể (chỉ có quận hoặc không có gì) -> null.
        4. Trích xuất 'keyword':
           - Giữ lại tên món/hoạt động (VD: "cơm tấm", "cafe", "mì cay").
           - Loại bỏ từ thừa: "tôi muốn", "kiếm", "tìm", "đi", "ăn", "uống", "gần".

        5. Định dạng Output: CHỈ trả về JSON Array, không Markdown, không giải thích.

        VÍ DỤ MẪU:
        - Input: "Sáng ăn cơm tấm gần chợ bến thành trưa mì cay gần cầu ba son tối cafe ở phố đi bộ nguyễn huệ"
          Output: [{{"keyword": "cơm tấm", "district": "Quận 1", "location_query": "chợ Bến Thành"}}, {{"keyword": "mì cay", "district": "Quận 1", "location_query": "cầu Ba Son"}}, {{"keyword": "cafe", "district": "Quận 1", "location_query": "phố đi bộ Nguyễn Huệ"}}]
        
        - Input: "Ăn phở bò q1 xong qua bình thạnh uống trà sữa gần đại học hutech"
          Output: [{{"keyword": "phở bò", "district": "Quận 1", "location_query": null}}, {{"keyword": "trà sữa", "district": "Bình Thạnh", "location_query": "đại học HUTECH"}}]

        - Input: "quán nhậu bình dân q3"
          Output: [{{"keyword": "quán nhậu bình dân", "district": "Quận 3", "location_query": null}}]

        YOUR OUTPUT:
        """

        try:
            response = self.model.generate_content(prompt)
            # Làm sạch chuỗi JSON phòng khi Gemini thêm ```json
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"❌ NLP Error: {e}")
            # Fallback cơ bản nếu lỗi: Trả về nguyên câu
            return [{"keyword": query, "district": None}]
# if __name__ == "__main__":
#     parser = IntentParser()
#     result = parser.parse("Sáng tôi ăn bánh mì sau đó ăn phở ở q3")
#     print(type(result))