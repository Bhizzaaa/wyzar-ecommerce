// In frontend/app/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/context/AuthContent";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";

// --- 1. Import Carousel Components ---
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Get the backend URL from our environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart(); // Get the function

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- Loading and Error States ---
  if (loading) {
    return <div className="container mx-auto py-12 text-center"><p>Loading product...</p></div>;
  }
  if (error || !product) {
    return <div className="container mx-auto py-12 text-center text-red-600"><p>{error || "Product not found."}</p></div>;
  }

  // --- Add to Cart Handler ---
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  // --- Render Page ---
  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- 2. Replaced Image with Carousel --- */}
        <Carousel className="w-full">
          <CarouselContent>
            {/* Loop through all images */}
            {product.images.map((imagePath, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={`${API_BASE_URL}/${imagePath.replace(/\\/g, '/')}`}
                    alt={`${product.name} image ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized={true}
                    priority={index === 0} // Load the first image faster
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Add Previous/Next buttons */}
          <CarouselPrevious className="ml-14" />
          <CarouselNext className="mr-14" />
        </Carousel>
        {/* --- End of Carousel --- */}


        {/* Product Info (no changes here) */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-700">
              Sold by: {product.seller.sellerDetails.businessName}
            </span>
            <Badge variant="outline">{product.category}</Badge>
          </div>

          <p className="text-3xl font-semibold text-primary">
            ${product.price.toFixed(2)}
          </p>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {product.description}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Stock: {product.quantity > 0 ? 
                <span className="text-green-600">{product.quantity} available</span> :
                <span className="text-red-600">Out of Stock</span>
              }
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button 
            size="lg" 
            className="w-full"
            disabled={product.quantity === 0}
            onClick={handleAddToCart}
          >
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>

      </div>
    </div>
  );
}