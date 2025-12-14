import React from "react";
import { Link } from "react-router-dom";

const collections = [
  {
    title: "Hẹn hò lãng mạn",
    subtitle: "Không gian ấm cúng",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    link: "/collections/romantic",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Quán nhậu vỉa hè",
    subtitle: "Ngon bổ rẻ",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    link: "/collections/street-food",
    color: "from-amber-500 to-orange-600",
  },
];

const CollectionBanner = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col, idx) => (
            <Link to={col.link} key={idx} className="block group relative overflow-hidden rounded-2xl h-48 shadow-md">
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${col.color} opacity-80 mix-blend-multiply`}></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
                <span className="text-sm font-medium uppercase tracking-wider opacity-90 mb-1">BST</span>
                <h3 className="text-2xl font-bold mb-1">{col.title}</h3>
                <p className="text-white/80">{col.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;
