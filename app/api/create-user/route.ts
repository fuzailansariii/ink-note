import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    //   check if the user already exist
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          message: "User already exist",
          user: user.emailAddresses[0].emailAddress,
        },
        { status: 200 },
      );
    }

    // create new user
    const newUser = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileData: {
          username: user.username,
          imageUrl: user.imageUrl,
          clerkId: user.id,
        },
      })
      .returning();
    return NextResponse.json(
      { message: "User created successfully", user: newUser[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating new user", error);
    return NextResponse.json(
      { error: "Failed to create new user" },
      { status: 500 },
    );
  }
}
