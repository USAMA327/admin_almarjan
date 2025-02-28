import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function DELETE(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    await auth.deleteUser(uid);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
