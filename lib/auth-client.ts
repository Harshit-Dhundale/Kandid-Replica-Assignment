// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Helper for Google sign-in with an optional post-login redirect
export const signInWithGoogle = (callbackURL: string = "/dashboard") =>
  signIn.social({ provider: "google", callbackURL });
