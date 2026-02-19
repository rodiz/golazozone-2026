import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { resetPasswordRequestSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });

  const { email } = parsed.data;

  // Always return success to avoid email enumeration
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.emailVerified) {
    const token = nanoid(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // Delete existing tokens
    await db.verificationToken.deleteMany({
      where: { email, type: "PASSWORD_RESET" },
    });

    await db.verificationToken.create({
      data: { userId: user.id, email, token, type: "PASSWORD_RESET", expires },
    });

    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ success: true });
}
