import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

export async function withAuth(
  req: NextRequest,
  requiredRole?: Role
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (requiredRole) {
    const roleOrder: Record<Role, number> = { USER: 1, ADMIN: 2, SUPERADMIN: 3 };
    const userRoleLevel = roleOrder[session.user.role as Role] ?? 0;
    const requiredLevel = roleOrder[requiredRole] ?? 0;

    if (userRoleLevel < requiredLevel) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return null; // proceed
}
