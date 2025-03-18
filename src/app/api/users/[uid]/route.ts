import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

interface Context {
  params: { uid: string };
}

// ✅ Get a user by UID
export async function GET(req: Request, context: Context) {
  try {
    const { uid } = context.params; // Correct way to access dynamic route params

    // Fetch the user by UID
    const userRecord = await auth.getUser(uid);

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user details
    return NextResponse.json({ user: userRecord }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
