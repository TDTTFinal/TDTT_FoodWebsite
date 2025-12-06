import express from "express";
import fs from "fs/promises";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware phải đặt trước các route
app.use(cors());
app.use(express.json());

const RESTAURANT_FILE = path.join(
  process.cwd(),
  "server",
  "data",
  "restaurants.json"
);
const FOOD_FILE = path.join(process.cwd(), "server", "data", "foods.json");
const CATEGORY_FILE = path.join(
  process.cwd(),
  "server",
  "data",
  "categories.json"
);
async function readCategories() {
  try {
    const txt = await fs.readFile(CATEGORY_FILE, "utf-8");
    return JSON.parse(txt || "[]");
  } catch (err) {
    console.error("readCategories error", err);
    return [];
  }
}

async function writeCategories(data) {
  await fs.writeFile(CATEGORY_FILE, JSON.stringify(data, null, 2), "utf-8");
}
// CATEGORIES ENDPOINTS
app.get("/api/categories", async (req, res) => {
  const data = await readCategories();
  res.json(data);
});

app.post("/api/categories", async (req, res) => {
  const body = req.body;
  try {
    const data = await readCategories();
    const nextId = data.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
    const newItem = {
      id: nextId,
      name: body.name || "Untitled",
      description: body.description || "",
      foodIds: body.foodIds || [],
      visible: true,
    };
    data.push(newItem);
    await writeCategories(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data = await readCategories();
  const idx = data.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data[idx] = { ...data[idx], ...body };
  await writeCategories(data);
  res.json(data[idx]);
});

app.delete("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = await readCategories();
  const next = data.filter((r) => r.id !== id);
  await writeCategories(next);
  res.status(204).end();
});

async function readRestaurants() {
  try {
    const txt = await fs.readFile(RESTAURANT_FILE, "utf-8");
    return JSON.parse(txt || "[]");
  } catch (err) {
    console.error("readRestaurants error", err);
    return [];
  }
}

async function writeRestaurants(data) {
  await fs.writeFile(RESTAURANT_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function readFoods() {
  try {
    const txt = await fs.readFile(FOOD_FILE, "utf-8");
    return JSON.parse(txt || "[]");
  } catch (err) {
    console.error("readFoods error", err);
    return [];
  }
}

async function writeFoods(data) {
  await fs.writeFile(FOOD_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// RESTAURANT ENDPOINTS
app.get("/api/restaurants", async (req, res) => {
  const data = await readRestaurants();
  res.json(data);
});

app.post("/api/restaurants", async (req, res) => {
  const body = req.body;
  try {
    const data = await readRestaurants();
    const nextId = data.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
    const newItem = {
      id: nextId,
      image: body.image || "/src/assets/logo.png",
      name: body.name || "Untitled",
      tags: body.tags || "",
      description: body.description || "",
      address: body.address || "",
      opening: body.opening || "",
      rating: body.rating ?? null,
      for: body.for || "",
      priceRange: body.priceRange || "",
    };
    data.push(newItem);
    await writeRestaurants(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save" });
  }
});

app.put("/api/restaurants/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data = await readRestaurants();
  const idx = data.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data[idx] = { ...data[idx], ...body };
  await writeRestaurants(data);
  res.json(data[idx]);
});

app.delete("/api/restaurants/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = await readRestaurants();
  const next = data.filter((r) => r.id !== id);
  await writeRestaurants(next);
  res.status(204).end();
});

app.put("/api/restaurants/:id/hide", async (req, res) => {
  const id = Number(req.params.id);
  const data = await readRestaurants();
  const idx = data.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data[idx] = { ...data[idx], visible: false };
  await writeRestaurants(data);
  res.json(data[idx]);
});

// FOODS ENDPOINTS
app.get("/api/foods", async (req, res) => {
  const data = await readFoods();
  res.json(data);
});

app.post("/api/foods", async (req, res) => {
  const body = req.body;
  try {
    const data = await readFoods();
    const nextId = data.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
    const newItem = {
      id: nextId,
      name: body.name || "Untitled",
      description: body.description || "",
      price: body.price || 0,
      image: body.image || "",
      restaurantId: body.restaurantId || null,
      category: body.category || "",
    };
    data.push(newItem);
    await writeFoods(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save" });
  }
});

app.put("/api/foods/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data = await readFoods();
  const idx = data.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data[idx] = { ...data[idx], ...body };
  await writeFoods(data);
  res.json(data[idx]);
});

app.delete("/api/foods/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = await readFoods();
  const next = data.filter((r) => r.id !== id);
  await writeFoods(next);
  res.status(204).end();
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please free the port or set a different PORT environment variable.`
    );
    process.exit(1);
  }
  console.error("Server error", err);
  process.exit(1);
});
