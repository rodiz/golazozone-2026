import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { token, password } = parsed.data;

  const verifyToken = await db.verificationToken.findUnique({ where: { token } });
  if (!verifyToken || verifyToken.type !== "PASSWORD_RESET" || new Date() > verifyToken.expires) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { email: verifyToken.email },
    data: { password: hashedPassword },
  });

  await db.verificationToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
