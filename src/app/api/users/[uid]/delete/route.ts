import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// ✅ Delete a user
export async function DELETE(req: Request, { params }: { params: any}) {
  try {
    await auth.deleteUser(params.uid);
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
