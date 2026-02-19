import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "GolazoZone 2026 <noreply@golazozone.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Confirma tu cuenta en GolazoZone 2026 ⚽",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#C9A84C">GolazoZone 2026 🏆</h1>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Confirma tu email para empezar a pronosticar el Mundial FIFA 2026.</p>
        <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0F1117;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin:16px 0">
          Confirmar email
        </a>
        <p style="color:#94A3B8;font-size:12px">El link expira en 24 horas. Si no creaste esta cuenta, ignora este email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablecer contraseña — GolazoZone 2026",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#C9A84C">GolazoZone 2026 🏆</h1>
        <p>Solicitud de restablecimiento de contraseña.</p>
        <a href="${url}" style="display:inline-block;background:#1A3C6E;color:white;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin:16px 0">
          Restablecer contraseña
        </a>
        <p style="color:#94A3B8;font-size:12px">El link expira en 1 hora.</p>
      </div>
    `,
  });
}

export async function sendMatchReminderEmail(email: string, name: string, matchInfo: {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  time: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `⏰ ¡En 2 horas! ${matchInfo.homeTeam} vs ${matchInfo.awayTeam}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#C9A84C">GolazoZone 2026 🏆</h1>
        <p>Hola <strong>${name}</strong>,</p>
        <p>En 2 horas empieza:</p>
        <div style="background:#1A1A2E;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="font-size:20px;font-weight:bold;color:white">${matchInfo.homeTeam} vs ${matchInfo.awayTeam}</p>
          <p style="color:#94A3B8">${matchInfo.venue} · ${matchInfo.time}</p>
        </div>
        <p>¡Haz tu pronóstico antes que cierren!</p>
        <a href="${APP_URL}/fixture" style="display:inline-block;background:#C9A84C;color:#0F1117;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          Ver fixture
        </a>
      </div>
    `,
  });
}

export async function sendPointsAwardedEmail(email: string, name: string, data: {
  matchName: string;
  points: number;
  rank: number;
}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `+${data.points} pts en GolazoZone 2026 ⚽`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#C9A84C">GolazoZone 2026 🏆</h1>
        <p>Hola <strong>${name}</strong>,</p>
        <p>¡Ya están los resultados de <strong>${data.matchName}</strong>!</p>
        <div style="background:#1A1A2E;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="font-size:32px;font-weight:bold;color:#C9A84C">+${data.points} pts</p>
          <p style="color:#94A3B8">Posición actual: #${data.rank}</p>
        </div>
        <a href="${APP_URL}/leaderboard" style="display:inline-block;background:#1A3C6E;color:white;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          Ver ranking
        </a>
      </div>
    `,
  });
}
