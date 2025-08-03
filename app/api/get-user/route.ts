import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // check if the user is logged in
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId)));
    if (!response) {
      return;
    }
    console.log(response);
    return NextResponse.json({ user: response });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "error finding the user",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
