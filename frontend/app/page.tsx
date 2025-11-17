// In frontend/app/page.tsx
"use client"; // We need to fetch data on the client

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/context/AuthContent";
import ProductCard, { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products, but we'll only show a few
        const response = await api.get("/products");
        // Get the first 8 products for the homepage
        setProducts(response.data.slice(0, 8)); 
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[50vh] bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto h-full flex flex-col items-center justify-center relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to WyZar
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Your one-stop shop for local and international goods.
          </p>
          <Link href="/products" passHref>
            <Button size="lg">Shop All Products</Button>
          </Link>
        </div>
        {/* You can add a background image here later */}
      </section>

      {/* 2. Featured Products Section */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Products
        </h2>
        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}