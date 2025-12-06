import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Restaurants from "./pages/Restaurants";
import Categories from "./pages/Categories";

function routeForHash(hash) {
  if (!hash) return { name: "home" };
  if (hash.startsWith("#/restaurants")) return { name: "restaurants" };
  if (hash.startsWith("#/categories")) return { name: "categories" };
  return { name: "home" };
}

export default function App() {
  const [route, setRoute] = useState(routeForHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(routeForHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-white min-h-[calc(100vh-4rem)]">
          {route.name === "restaurants" ? (
            <Restaurants />
          ) : route.name === "categories" ? (
            <Categories />
          ) : (
            <div />
          )}
        </main>
      </div>
    </div>
  );
}
