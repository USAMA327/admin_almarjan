import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    if (req.headers.get("content-type") !== "application/json") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const body = await req.json();
    const { uid, disable } = body;

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await auth.updateUser(uid, { disabled: disable });

    return NextResponse.json({ message: disable ? "User blocked" : "User unblocked" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

