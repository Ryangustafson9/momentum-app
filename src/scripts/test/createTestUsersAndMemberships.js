import "dotenv/config"; // Load environment variables from .env
import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase URL and anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const createTestUsersAndMemberships = async () => {
  const users = [
    {
      email: "basicuser@example.com",
      password: "Password",
      name: "Basic User",
      membershipId: "0dfddf5b-d123-4e81-9ab5-81d02708fcec", // Basic Membership ID
      systemMemberId: 8, // Basic User system_member_id
    },
    {
      email: "premiumuser@example.com",
      password: "Password",
      name: "Premium User",
      membershipId: "a9ea362b-50ef-4061-9a3a-a4a8ad8b2a31", // Premium Membership ID
      systemMemberId: 9, // Premium User system_member_id
    },
    {
      email: "vipuser@example.com",
      password: "Password",
      name: "VIP User",
      membershipId: "e000df5c-2a5c-404b-98d7-8115fec2a585", // VIP Membership ID
      systemMemberId: 10, // VIP User system_member_id
    },
    {
      email: "staffuser@example.com",
      password: "Password",
      name: "Staff User",
      membershipId: "27aeceee-bcec-47cb-b3b4-40af4fe23f99", // Staff Membership ID
      systemMemberId: 11, // Staff User system_member_id
    },
  ];

  try {
    for (const user of users) {
      // Step 1: Check if the user exists in the profiles table
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("id, system_member_id") // Fetch the UUID (id) and system_member_id from the profiles table
        .eq("email", user.email)
        .single();

      if (profileFetchError && profileFetchError.code !== "PGRST116") {
        console.error(`Error checking profile for ${user.email}:`, profileFetchError.message);
        continue;
      }

      let profileId;
      if (!existingProfile) {
        // Add the user to the profiles table if they don't exist
        const { data: insertedProfile, error: profileInsertError } = await supabase.from("profiles").insert([
          {
            email: user.email,
            name: user.name,
            role: user.membershipId === "27aeceee-bcec-47cb-b3b4-40af4fe23f99" ? "staff" : "nonmember", // Assign role based on membership
            system_member_id: user.systemMemberId, // Use the system_member_id
          },
        ]).select("id, system_member_id").single();

        if (profileInsertError) {
          console.error(`Error creating profile for ${user.email}:`, profileInsertError.message);
          continue;
        }

        profileId = insertedProfile.id; // Use the UUID from the inserted profile
        console.log(`Profile created for: ${user.email}`);
      } else {
        profileId = existingProfile.id; // Use the UUID from the existing profile
        console.log(`Profile already exists for: ${user.email}`);
      }

      // Step 2: Check if the user has the correct membership in the memberships table
      const { data: existingMembership, error: membershipFetchError } = await supabase
        .from("memberships")
        .select("id, current_membership_type_id, system_member_id")
        .eq("system_member_id", user.systemMemberId) // Match by system_member_id
        .single();

      if (membershipFetchError && membershipFetchError.code !== "PGRST116") {
        console.error(`Error checking membership for ${user.email}:`, membershipFetchError.message);
        continue;
      }

      if (!existingMembership) {
        // Add the membership if it doesn't exist
        const { error: membershipInsertError } = await supabase.from("memberships").insert([
          {
            system_member_id: user.systemMemberId, // Use the system_member_id
            current_membership_type_id: user.membershipId, // Use the membership ID directly
            join_date: new Date().toISOString(),
            status: "active",
          },
        ]);

        if (membershipInsertError) {
          console.error(`Error assigning membership to ${user.email}:`, membershipInsertError.message);
          continue;
        }

        console.log(`Membership assigned to: ${user.email}`);
      } else if (existingMembership.current_membership_type_id !== user.membershipId) {
        // Update the membership if it doesn't match
        const { error: membershipUpdateError } = await supabase.from("memberships").update({
          current_membership_type_id: user.membershipId, // Update to the correct membership ID
          status: "active",
        }).eq("id", existingMembership.id);

        if (membershipUpdateError) {
          console.error(`Error updating membership for ${user.email}:`, membershipUpdateError.message);
          continue;
        }

        console.log(`Membership updated for: ${user.email}`);
      } else {
        console.log(`Membership already exists for: ${user.email}`);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
};

createTestUsersAndMemberships();

