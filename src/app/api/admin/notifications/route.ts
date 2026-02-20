import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();

        // Verify Admin rights
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Asunto y Mensaje son requeridos" }, { status: 400 });
        }

        // Get all users (except maybe admins themselves if desired, but broadcasting to everyone is fine)
        const users = await db.user.findMany({ select: { id: true } });

        if (users.length === 0) {
            return NextResponse.json({ error: "No hay usuarios registrados a quienes notificar" }, { status: 404 });
        }

        // Prepare notifications array
        const notifications = users.map((u) => ({
            userId: u.id,
            type: "SYSTEM" as const,
            title: subject,
            message,
        }));

        // Create notifications in bulk
        await db.notification.createMany({
            data: notifications,
        });

        // We also could log this action in AuditLog for transparency
        await db.auditLog.create({
            data: {
                action: "BROADCAST_NOTIFICATION",
                entity: "Notification",
                entityId: "ALL",
                userId: session.user.id,
                metadata: { subject, userCount: users.length },
            },
        });

        return NextResponse.json({
            success: true,
            sentTotal: users.length,
            message: `Notificación masiva enviada correctamente a ${users.length} usuarios.`,
        });
    } catch (error) {
        console.error("Error sending bulk notifications:", error);
        return NextResponse.json(
            { error: "Error de servidor al enviar notificaciones" },
            { status: 500 }
        );
    }
}
