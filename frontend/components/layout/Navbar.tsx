// In frontend/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContent";
import CartSheet from "./CartSheet";
import { LogOut, User, LayoutDashboard, ShoppingBag, Settings } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="border-b bg-background w-full z-20 top-0 left-0 border-gray-200">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">

        {/* 1. Logo/Brand Name */}
        <Link href="/" className="flex items-center space-x-3">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            WyZar
          </span>
        </Link>

        {/* 2. Main Navigation Links */}
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/products">All Products</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 3. Auth Links & Cart */}
        <div className="flex items-center md:order-2 space-x-3">
          {isAuthenticated && user ? (
            // --- Show if LOGGED IN ---
            <>
              {/* "Become a Seller" Button */}
              {!user.isSeller && (
                <Link href="/become-a-seller">
                  <Button variant="default" size="sm">
                    Become a Seller
                  </Button>
                </Link>
              )}

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none">
                      Logged in as
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Seller Dashboard Link */}
                  {user.isSeller && (
                    <Link href="/dashboard" passHref>
                      <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {/* My Orders Link */}
                  <Link href="/my-orders" passHref>
                    <DropdownMenuItem>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                  </Link>

                  {/* --- 2. ADD THIS LINK --- */}
                {/* Seller Settings Link */}
                {user.isSeller && (
                  <Link href="/dashboard/settings" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Seller Settings</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // --- Show if LOGGED OUT ---
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="default" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
          <ThemeToggle />

          {/* Cart Sheet (always shown) */}
          <div className="border-l pl-3 ml-3">
            <CartSheet />
          </div>
        </div>

      </div>
    </nav>
  );
}