
import { auth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: any}) {
  try {
    const { role } = await req.json(); // Get the role from the request body

    // Set custom claims for the user
    await auth.setCustomUserClaims(params.uid, { role });

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