"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthProvider";

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
