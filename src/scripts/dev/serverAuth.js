import "dotenv/config"; // Load environment variables from .env
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Log Supabase URL and Anon Key (for debugging purposes)
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.SUPABASE_ANON_KEY);

// In-memory token storage
let tokens = {
  access_token: null,
  refresh_token: null,
  expiry_time: null, // Store the expiry time of the access token
};

const loginAndStoreTokens = async (email, password) => {
  // Debug log: Print the email and password being used for login
  console.log("Attempting login with email:", email);
  console.log("Using password:", password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Debug log: Print the error message if login fails
    console.error("Login failed:", error.message);
    return;
  }

  // Debug log: Print the successful login data
  console.log("Login successful:", data);

  // Store tokens in memory
  tokens.access_token = data.session.access_token;
  tokens.refresh_token = data.session.refresh_token;

  // Decode the JWT to get the expiry time
  const payload = JSON.parse(
    Buffer.from(tokens.access_token.split(".")[1], "base64").toString()
  );
  tokens.expiry_time = payload.exp * 1000; // Convert to milliseconds

  // Debug log: Print the stored tokens
  console.log("Tokens stored in memory:", tokens);

  // Set up automatic token refresh
  setupAutoRefresh();
};

const refreshAccessToken = async () => {
  if (!tokens.refresh_token) {
    console.error("No refresh token found.");
    return;
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: tokens.refresh_token,
  });

  if (error) {
    console.error("Error refreshing session:", error.message);
    return;
  }

  console.log("Session refreshed:", data);

  // Update tokens in memory
  tokens.access_token = data.session.access_token;
  tokens.refresh_token = data.session.refresh_token;

  // Decode the JWT to get the new expiry time
  const payload = JSON.parse(
    Buffer.from(tokens.access_token.split(".")[1], "base64").toString()
  );
  tokens.expiry_time = payload.exp * 1000; // Convert to milliseconds

  console.log("Tokens updated in memory:", tokens);

  // Reset the auto-refresh timer
  setupAutoRefresh();
};

const setupAutoRefresh = () => {
  if (!tokens.expiry_time) {
    console.error("No expiry time found for the access token.");
    return;
  }

  const currentTime = Date.now();
  const timeUntilExpiry = tokens.expiry_time - currentTime;

  console.log(`Access token will expire in ${timeUntilExpiry / 1000} seconds.`);

  // Set a timer to refresh the token 1 minute before it expires
  setTimeout(() => {
    refreshAccessToken();
  }, timeUntilExpiry - 60000); // Refresh 1 minute before expiry
};

// Example usage
const main = async () => {
  await loginAndStoreTokens("premiumuser@example.com", "Password");

  // Example of using the access token for an authenticated API request
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", "premiumuser@example.com");

  if (error) {
    console.error("Error fetching data:", error.message);
  } else {
    console.log("Fetched data:", data);
  }
};

main();

