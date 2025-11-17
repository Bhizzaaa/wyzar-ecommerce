// In frontend/app/(auth)/sign-up/page.tsx
"use client"; // This must be a client component for forms

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 1. Define the API URL
// We'll move this to a .env file later
const API_URL = "http://localhost:5001/api/auth";

// 2. Define the form schema with Zod
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function SignUpForm() {
  // 3. Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. Define the submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post(`${API_URL}/register`, values);

      // Show success message
      toast.success("Account Created", {
        description: "Your account has been created successfully.",
        duration: 3000,
      });

      // Optionally, reset the form
      form.reset();

      // (Later, we will redirect the user to the login page or dashboard)

    } catch (error: any) {
      console.error("Registration failed:", error);

      // Show error message
      let errorMessage = "Registration failed. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.msg || errorMessage;
      }

      toast.error("Registration Failed", {
        description: errorMessage,
        duration: 3000,
      });
    }
  }

  // 5. Build the form component
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create your Account</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}