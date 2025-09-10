"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

type Requirement = {
  key: string;
  label: string;
  pass: boolean;
};

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Live password checks
  const requirements: Requirement[] = useMemo(() => {
    const length  = password.length >= 8;              // min length
    const upper   = /[A-Z]/.test(password);            // uppercase
    const lower   = /[a-z]/.test(password);            // lowercase
    const number  = /[0-9]/.test(password);            // number
    const special = /[^A-Za-z0-9]/.test(password);     // special char

    return [
      { key: "length",  label: "At least 8 characters", pass: length },
      { key: "upper",   label: "At least one uppercase letter (A–Z)", pass: upper },
      { key: "lower",   label: "At least one lowercase letter (a–z)", pass: lower },
      { key: "number",  label: "At least one number (0–9)", pass: number },
      { key: "special", label: "At least one special character (!@#$…)", pass: special },
    ];
  }, [password]);

  const allPass = useMemo(
    () => requirements.every(r => r.pass),
    [requirements]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side guard
    if (!allPass) {
      toast({
        title: "Password requirements not met",
        description: "Please satisfy all password rules before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
      });

      if (result.error) {
        toast({
          title: "Sign up failed",
          description: result.error.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Account created",
        description: "Welcome! Redirecting to your dashboard…",
      });
      router.push("/dashboard");
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">Register with email</CardTitle>
          <CardDescription>Register using your email address.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  aria-describedby="password-requirements"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Live checklist */}
              <ul id="password-requirements" className="mt-2 space-y-1 text-sm">
                {requirements.map((req) => (
                  <li
                    key={req.key}
                    className={`flex items-center gap-2 ${
                      req.pass ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {req.pass ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden />
                    )}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !allPass}
            >
              {isLoading ? "Creating account..." : "Create my account"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
