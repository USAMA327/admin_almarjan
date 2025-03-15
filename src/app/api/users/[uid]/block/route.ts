import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: any}) {
  try {
    const { disabled } = await req.json(); // Get new status from request body
    await auth.updateUser(params.uid, { disabled });
    return NextResponse.json({ message: `User ${disabled ? "blocked" : "unblocked"} successfully` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error updating user status" }, { status: 500 });
  }
}
