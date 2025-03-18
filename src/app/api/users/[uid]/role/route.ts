import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

interface Context {
  params: { uid: string };
}

export async function PUT(req: Request, context: Context) {
  try {
    const { uid } = await context.params; // Correct way to access dynamic route params
    const { role } = await req.json(); // Get the role from the request body

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { role });

    return NextResponse.json(
      { message: `Role "${role}" assigned successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: "Error assigning role" },
      { status: 500 }
    );
  }
}
