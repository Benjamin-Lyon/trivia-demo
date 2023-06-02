import { NextResponse } from "next/server";
import { db, seed, sql } from "../../../schema";

export async function POST(request: Request) {
  const res = await request.json();
  let existingUser = await db
    .selectFrom("users")
    .where("email", "=", res.email)
    .selectAll()
    .executeTakeFirst();
  if (!existingUser) {
    existingUser = await db
      .insertInto("users")
      .values([{ email: res.email, name: res.email }])
      .returningAll()
      .executeTakeFirst();
  }

  const updatedUser = await db
    .updateTable("users")
    .where("id", "=", existingUser.id)
    .set({ wins: (existingUser.wins ?? 0) + res.score })
    .returningAll()
    .executeTakeFirst();

  return NextResponse.json(updatedUser);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const fetchUserWins = await db
    .selectFrom("users")
    .where("email", "=", email)
    .select("wins")
    .executeTakeFirst();

  const count = fetchUserWins?.wins ?? 0;
  return NextResponse.json({ count });
}
