import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, disable } = await req.json(); // `disable: true` blocks, `disable: false` unblocks
    if (!uid) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    await auth.updateUser(uid, { disabled: disable });

    return NextResponse.json({ message: disable ? "User blocked" : "User unblocked" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
