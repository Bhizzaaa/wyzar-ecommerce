// In frontend/app/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/context/AuthContent"; // We can use the public 'api'

import ProductCard, { Product } from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function fetches the products
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // We're calling our public GET /api/products route
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // The empty array [] means this runs once when the page loads

  // --- Show Loading State ---
  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading products...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  // --- Show Error State ---
  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // --- Show Products Grid ---
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      {products.length === 0 ? (
        <p className="text-center text-gray-600">
          No products found. Please check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}