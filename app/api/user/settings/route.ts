import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const ALLOWED_THEMES = ["modern-dark", "one-dark-pro", "vs-dark", "vs"];
const ALLOWED_FONTS = ["default", "cascadia", "google-sans"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        editorTheme: true,
        editorFont: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { editorTheme, editorFont } = body;

    // Validation
    if (
      (editorTheme && !ALLOWED_THEMES.includes(editorTheme)) ||
      (editorFont && !ALLOWED_FONTS.includes(editorFont))
    ) {
      return NextResponse.json(
        { error: "Invalid settings values" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { email: session.user.email },
      data: {
        ...(editorTheme && { editorTheme }),
        ...(editorFont && { editorFont }),
      },
      select: {
        editorTheme: true,
        editorFont: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
