// src/pages/SearchPage.jsx
import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [rating, setRating] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // TODO: sau này bạn chỉnh API backend nhận thêm filter ở đây
  async function handlePostQuery() {
    if (!query.trim()) {
      setError("Hãy nhập từ khóa trước khi tìm kiếm.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const baseUrl = "https://nemo-chewz.hf.space/api/v1/search/";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          // Sau này có thể gửi thêm:
          // priceRange,
          // category,
          // district,
          // rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Không gọi được API tìm kiếm. Vui lòng thử lại.");
      }

      const data = await response.json();
      console.log("Kết quả trả về:", data);

      // Nếu backend trả về { results: [...] } thì dùng data.results
      // Nếu trả về trực tiếp array thì dùng data
      const list = Array.isArray(data) ? data : data.results || [];
      setResults(list);
    } catch (err) {
      console.error("Lỗi gửi query:", err);
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />

      <main
        className="container main-content"
        style={{ paddingTop: "30px", paddingBottom: "40px" }}
      >
        {/* HERO TITLE */}
        <section
          style={{
            marginBottom: "25px",
            padding: "20px 24px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, #FFE0B2 0%, #FFF3E0 50%, #FFF 100%)",
            border: "1px solid #FFE0B2",
          }}
        >
          <h1
            style={{ fontSize: "26px", marginBottom: "6px", color: "#E65100" }}
          >
            🔍 Tìm kiếm nâng cao
          </h1>
          <p style={{ color: "#555", marginBottom: "8px" }}>
            Lọc nhà hàng theo nhiều tiêu chí: món ăn, khu vực, giá, đánh giá…
          </p>
          <p style={{ fontSize: "12px", color: "#999" }}>
            (Hiện tại backend đang dùng trường <b>query</b>, các bộ lọc khác bạn
            có thể nối thêm sau.)
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "24px",
          }}
        >
          {/* CỘT TRÁI – BỘ LỌC */}
          <aside
            style={{
              background: "#FFF",
              borderRadius: "16px",
              padding: "18px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              border: "1px solid #F0F0F0",
              alignSelf: "flex-start",
              position: "sticky",
              top: "80px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                color: "#E65100",
              }}
            >
              Bộ lọc tìm kiếm
            </h2>

            {/* TỪ KHÓA CHÍNH */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Từ khóa
              </label>
              <input
                type="text"
                placeholder="Ví dụ: lẩu thái, cơm tấm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "999px",
                  border: "1px solid #DDD",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* DANH MỤC */}
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid #DDD",
                  fontSize: "14px",
                }}
              >
                <option value="">Tất cả</option>
                <option value="Lẩu">Lẩu</option>
                <option value="BBQ">BBQ</option>
                <option value="Cơm">Cơm</option>
                <option value="Trà sữa">Trà sữa</option>
                <option value="Ăn vặt">Ăn vặt</option>
                <option value="Pizza">Pizza</option>
              </select>
            </div>

            {/* KHOẢNG GIÁ */}
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Giá trung bình / người
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid #DDD",
                  fontSize: "14px",
                }}
              >
                <option value="">Không lọc</option>
                <option value="1">&lt; 50.000đ</option>
                <option value="2">50.000 - 150.000đ</option>
                <option value="3">150.000 - 300.000đ</option>
                <option value="4">&gt; 300.000đ</option>
              </select>
            </div>

            {/* KHU VỰC */}
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Khu vực (Quận)
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid #DDD",
                  fontSize: "14px",
                }}
              >
                <option value="">Tất cả</option>
                <option value="1">Quận 1</option>
                <option value="3">Quận 3</option>
                <option value="5">Quận 5</option>
                <option value="10">Quận 10</option>
                <option value="BinhThanh">Bình Thạnh</option>
              </select>
            </div>

            {/* ĐÁNH GIÁ */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Điểm đánh giá tối thiểu
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid #DDD",
                  fontSize: "14px",
                }}
              >
                <option value="">Không lọc</option>
                <option value="9">⭐ 9.0 trở lên</option>
                <option value="8">⭐ 8.0 trở lên</option>
                <option value="7">⭐ 7.0 trở lên</option>
              </select>
            </div>

            {/* NÚT TÌM KIẾM */}
            <button
              type="button"
              onClick={handlePostQuery}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: "999px",
                border: "none",
                background: "#FF8B3D",
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(230,81,0,0.4)",
              }}
            >
              🔍 BẮT ĐẦU TÌM KIẾM
            </button>
          </aside>

          {/* CỘT PHẢI – KẾT QUẢ */}
          <section>
            {/* Thanh info nhỏ */}
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: "14px", color: "#555" }}>
                {results.length > 0 ? (
                  <>
                    Tìm thấy <b>{results.length}</b> kết quả cho{" "}
                    <span style={{ color: "#E65100" }}>"{query}"</span>
                  </>
                ) : (
                  <>Nhập từ khóa và bấm tìm kiếm để bắt đầu.</>
                )}
              </div>

              <div style={{ fontSize: "12px", color: "#999" }}>
                Kết quả ưu tiên theo độ liên quan và điểm đánh giá.
              </div>
            </div>

            {/* ERROR / LOADING */}
            {error && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "#FFEBEE",
                  color: "#C62828",
                  fontSize: "13px",
                }}
              >
                ⚠ {error}
              </div>
            )}
            {loading && (
              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                ⏳ Đang tìm kiếm, vui lòng đợi...
              </div>
            )}

            {/* DANH SÁCH KẾT QUẢ */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {!loading && results.length === 0 && !error && query && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#777",
                    padding: "12px",
                    background: "#FAFAFA",
                    borderRadius: "10px",
                    border: "1px dashed #DDD",
                  }}
                >
                  Không tìm thấy kết quả phù hợp. Hãy thử từ khóa khác hoặc nới
                  lỏng bộ lọc.
                </div>
              )}

              {results.map((item, index) => {
                const title =
                  item.name ||
                  item.title ||
                  item.restaurant_name ||
                  `Kết quả #${index + 1}`;
                const address =
                  item.address ||
                  item.location ||
                  item.district ||
                  "Địa chỉ đang cập nhật";
                const cate = item.category || item.cuisine || item.type;
                const score =
                  item.score ||
                  item.similarity ||
                  item.rating ||
                  item.avg_rating ||
                  null;
                const description =
                  item.snippet ||
                  item.description ||
                  item.preview ||
                  item.highlight ||
                  "";

                // N\u1ebfu backend c\u00f3 id - link sang trang chi ti\u1ebft
                const hasId = item.id || item._id;

                const card = (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: "#FFF",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
                      border: "1px solid #F2F2F2",
                    }}
                  >
                    {/* Avatar chữ cái nếu không có hình */}
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        background: "#FFF3E0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {title.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "10px",
                          marginBottom: "4px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            margin: 0,
                            color: "#333",
                          }}
                        >
                          {title}
                        </h3>
                        {score && (
                          <div
                            style={{
                              fontSize: "12px",
                              padding: "3px 8px",
                              borderRadius: "999px",
                              background: "#FFF3E0",
                              color: "#E65100",
                              fontWeight: 600,
                            }}
                          >
                            ⭐{" "}
                            {typeof score === "number"
                              ? score.toFixed(2)
                              : score}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#777",
                          marginBottom: "4px",
                        }}
                      >
                        📍 {address}
                        {cate && <> • {cate}</>}
                      </div>

                      {description && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#555",
                            margin: 0,
                          }}
                        >
                          {description.length > 160
                            ? description.slice(0, 160) + "..."
                            : description}
                        </p>
                      )}
                    </div>
                  </div>
                );

                return hasId ? (
                  <Link
                    key={item.id || item._id}
                    to={`/restaurant/${item.id || item._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={index}>{card}</div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
