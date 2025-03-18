import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

interface Context {
  params: {
    uid: string;
  };
}

export async function PUT(req: Request, context: Context) {
  const { uid } = context.params; // Correct way to access route parameters
  if (!uid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { disabled } = await req.json();
    if (typeof disabled !== "boolean") {
      return NextResponse.json({ error: "Invalid 'disabled' value" }, { status: 400 });
    }

    await auth.updateUser(uid, { disabled });

    return NextResponse.json({ message: `User ${disabled ? "blocked" : "unblocked"} successfully` });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Error updating user status" }, { status: 500 });
  }
}
