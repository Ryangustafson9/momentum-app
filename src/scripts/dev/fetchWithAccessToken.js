import "dotenv/config"; // Load environment variables from .env
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, // Your Supabase project URL
  process.env.SUPABASE_ANON_KEY // Your Supabase anon key
);

const fetchDataWithAccessToken = async (accessToken) => {
  // Create a new Supabase client with the access token
  const supabaseWithAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  // Fetch data from the "profiles" table
  const { data, error } = await supabaseWithAuth
    .from("profiles")
    .select("*");

  if (error) {
    console.error("Error fetching data:", error.message);
  } else {
    console.log("Data fetched successfully:", data);
  }
};

const testAccessToken = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "premiumuser@example.com",
    password: "Password",
  });

  if (error) {
    console.error("Login failed:", error.message);
  } else {
    console.log("Login successful:", data);
    const accessToken = data.session.access_token;
    await fetchDataWithAccessToken(accessToken);
  }
};

testAccessToken();

