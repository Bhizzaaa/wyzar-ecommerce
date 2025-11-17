// In frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // --- Page Protection ---
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login"); // Not logged in
      } else if (!user?.isSeller) {
        router.push("/become-a-seller"); // Not a seller
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // --- Show Loading State ---
  if (loading || !user || !user.isSeller) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // --- Main Dashboard Content ---
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.email}
      </h1>
      
      {/* We'll add a check for verification later */}
      <div className="border p-4 border-blue-300 rounded-md mb-6">
        <p className="font-semibold">Your Seller Account</p>
        <p className="text-sm">
          Status: {user.isVerified ? 
            <span className="text-green-600 font-bold">Verified</span> : 
            <span className="text-yellow-600 font-bold">Pending Approval</span>
          }
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Seller Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Add Product */}
        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Manage Products</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add new products or view your existing inventory.
          </p>
          <div className="flex gap-2"> {/* Added flex wrapper */}
            <Link href="/dashboard/products/new" passHref>
              <Button>Add New</Button>
            </Link>
            <Link href="/dashboard/products" passHref> {/* <-- ADD THIS LINK */}
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </div>

        {/* Card 2: View Orders (Coming Soon) */}
        <div className="border p-4 rounded-lg shadow-sm ">
          <h3 className="font-semibold text-lg mb-2">View Orders</h3>
          <p className="text-sm text-gray-600 mb-4">
            (Coming Soon) See and manage all your customer orders.
          </p>
          <Button disabled>View Orders</Button>
        </div>

        {/* Card 3: Earnings (Coming Soon) */}
        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Earnings Summary</h3>
          <p className="text-sm text-gray-600 mb-4">
            (Coming Soon) Track your sales and pending payments.
          </p>
          <Button disabled>View Earnings</Button>
        </div>

      </div>
    </div>
  );
}