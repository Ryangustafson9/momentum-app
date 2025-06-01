import "dotenv/config"; // Load environment variables from .env
import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase URL and anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const createTestMemberships = async () => {
  const memberships = [
    {
      name: "Basic Membership",
      price: 20,
      duration_months: 1,
      billing_type: "monthly",
      features: ["Access to gym equipment"],
      available_for_sale: true,
      category: "Standard",
      color: "#00FF00",
    },
    {
      name: "Premium Membership",
      price: 50,
      duration_months: 3,
      billing_type: "quarterly",
      features: ["Access to gym equipment", "Free group classes"],
      available_for_sale: true,
      category: "Premium",
      color: "#FFD700",
    },
    {
      name: "VIP Membership",
      price: 100,
      duration_months: 12,
      billing_type: "yearly",
      features: ["Access to gym equipment", "Free group classes", "Personal trainer"],
      available_for_sale: true,
      category: "VIP",
      color: "#FF4500",
    },
    {
      name: "Staff Membership",
      price: 0, // Free for staff
      duration_months: null, // No expiration
      billing_type: "none",
      features: ["Full access to all facilities", "Staff-only perks"],
      available_for_sale: false, // Not available for sale
      category: "Staff",
      color: "#0000FF",
    },
  ];

  try {
    const { data, error } = await supabase.from("membership_types").insert(memberships);

    if (error) {
      console.error("Error creating memberships:", error.message);
    } else {
      console.log("Test memberships created successfully:", data);
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
};

createTestMemberships();

