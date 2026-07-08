"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthProvider";

/*
  Email/password sign in + sign up. When signed out this renders the Supabase
  Auth UI form (with a "Don't have an account? Sign up" link); when signed in
  it shows the user's email and a sign-out button.
*/
export default function AuthPanel() {
  const { session, loading, signOut } = useAuth();

  if (loading) return null;

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-700">
          Signed in as <strong>{session.user.email}</strong>
        </span>
        <button
          onClick={signOut}
          className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        view="sign_in"
      />
    </div>
  );
}
