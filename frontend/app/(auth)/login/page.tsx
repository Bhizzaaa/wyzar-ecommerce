// In frontend/app/(auth)/login/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import { api, useAuth } from "@/context/AuthContent"; // <-- 1. Import
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ... (imports for Form, Input, Button, etc.)
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

// ... (formSchema remains the same)
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth(); // <-- 2. Get the login function

  // ... (form definition remains the same)
 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});

  // 4. Define the submit handler (UPDATED)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 3. Use the 'api' instance
      const response = await api.post('/auth/login', values);
      const { token } = response.data;

      // 4. Call the context 'login' function
      // This will save the token, fetch the user, and update state
      await login(token); 

      toast(
        "Success!",{
        description: "You are now logged in.",
      });

      router.push('/'); // Redirect to homepage

    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please try again.";

      // 5. Update error checking
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.msg || errorMessage;
      }

      toast(
         "Error",{
        description: errorMessage,
      });
    }
  }

  // 5. Build the form component
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
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
              Login
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}