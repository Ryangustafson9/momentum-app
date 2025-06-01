import "dotenv/config"; // Load environment variables from .env
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, // Your Supabase project URL
  process.env.SUPABASE_ANON_KEY // Your Supabase anon key
);

const testLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "premiumuser@example.com",
    password: "Password",
  });

  if (error) {
    console.error("Login failed:", error.message);
  } else {
    console.log("Login successful:", data);
  }
};

testLogin();


