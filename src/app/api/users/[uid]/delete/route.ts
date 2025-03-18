import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// ✅ Delete a user
export async function DELETE(req: Request, context: { params: { uid?: string } }) {
  const { uid } = await context.params; // Await params here
  if (!uid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await auth.deleteUser(uid);
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
