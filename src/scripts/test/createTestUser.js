import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:54321", // Supabase API URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Replace with your anon key
);

const createTestUser = async () => {
  // Create the user in the auth table
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: "testuser@example.com",
    password: "Password", // Updated password
  });

  if (authError) {
    console.error("Error creating user:", authError.message);
    return;
  }

  console.log("User created:", authData.user);

  // Add the user to the profiles table with additional fields
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: authData.user.id, // Use the user's ID from the auth table
      email: "testuser@example.com", // Add the email
      name: "Test User", // Add a default name
      role: "nonmember", // Default role is nonmember
      phone: "123-456-7890", // Example phone number
      address: "123 Test Street", // Example address
      dob: "1990-01-01", // Example date of birth
      emergency_contact_name: "John Doe", // Example emergency contact
      emergency_contact_phone: "987-654-3210", // Example emergency contact phone
    },
  ]);

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    return;
  }

  console.log("Profile created successfully!");

  // Simulate members data and store it in localStorage
  const generatedMembers = [
    {
      id: authData.user.id,
      name: "Test User",
      email: "testuser@example.com",
      role: "nonmember",
      phone: "123-456-7890",
      address: "123 Test Street",
      dob: "1990-01-01",
      emergency_contact_name: "John Doe",
      emergency_contact_phone: "987-654-3210",
    },
  ];

  localStorage.setItem('members_v2', JSON.stringify(generatedMembers));
  console.log("members_v2 stored in localStorage:", generatedMembers);
};

createTestUser();

