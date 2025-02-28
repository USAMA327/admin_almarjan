import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const listUsers = await auth.listUsers();

    const users = listUsers.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      provider: user.providerData.length > 0 ? user.providerData[0].providerId : "unknown",
      photoURL: user.photoURL,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
