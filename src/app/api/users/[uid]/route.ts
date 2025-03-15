import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// ✅ Get a user by UID
export async function GET(req: Request, { params }: { params:any }) {
  try {
    // Fetch the user by UID
    const userRecord = await auth.getUser(params.uid);

    // Return the user details
    return NextResponse.json({ user: userRecord }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}