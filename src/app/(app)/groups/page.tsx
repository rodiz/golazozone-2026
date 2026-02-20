"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, LogIn, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  code: string;
  memberCount: number;
  currentUserRank: number;
  currentUserPoints: number;
}

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "var(--radius-sm)", padding: "0.625rem 0.875rem",
  fontSize: "0.85rem", color: "var(--danger)",
};

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "1.25rem",
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .finally(() => setLoading(false));
  }, []);

  const createGroup = async () => {
    if (!createName.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: createName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((p) => [...p, data.group]);
      setShowCreate(false); setCreateName("");
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/groups/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: joinCode.toUpperCase() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((p) => [...p, data.group]);
      setShowJoin(false); setJoinCode("");
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="page-stack">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Grupos de Amigos</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Compite con tu polla privada · invita con código</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <Button variant="outline" size="sm" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
            <LogIn size={16} /> Unirme
          </Button>
          <Button variant="accent" size="sm" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
            <Plus size={16} /> Crear
          </Button>
        </div>
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {/* Create form */}
      {showCreate && (
        <div style={cardStyle}>
          <div className="page-stack-sm">
            <h3 style={{ fontWeight: 600, color: "var(--text-primary)" }}>Crear grupo</h3>
            <Input label="Nombre del grupo" placeholder="Ej: Los Craks del Trabajo" value={createName} onChange={(e) => setCreateName(e.target.value)} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="accent" size="sm" onClick={createGroup} loading={submitting}>Crear grupo</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Join form */}
      {showJoin && (
        <div style={cardStyle}>
          <div className="page-stack-sm">
            <h3 style={{ fontWeight: 600, color: "var(--text-primary)" }}>Unirse a grupo</h3>
            <Input label="Código de invitación (6 caracteres)" placeholder="ABCD12" maxLength={6} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="accent" size="sm" onClick={joinGroup} loading={submitting}>Unirme</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowJoin(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Groups list */}
      {loading ? (
        <div className="page-stack-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "6rem" }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--text-muted)" }}>
          <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>Aún no perteneces a ningún grupo</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Crea uno o únete con un código de invitación</p>
        </div>
      ) : (
        <div className="page-stack-sm">
          {groups.map((g) => (
            <div key={g.id} style={{ ...cardStyle, transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{g.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                    {g.memberCount} miembro{g.memberCount !== 1 ? "s" : ""}
                  </p>
                  {g.description && <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{g.description}</p>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>#{g.currentUserRank}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{g.currentUserPoints} pts</p>
                </div>
              </div>

              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Código:</span>
                  <code style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--accent)", background: "var(--bg-card-hover)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-sm)", fontFamily: "monospace" }}>
                    {g.code}
                  </code>
                  <button onClick={() => copyCode(g.code)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: "0.125rem" }}>
                    {copied === g.code
                      ? <Check size={14} style={{ color: "var(--success)" }} />
                      : <Copy size={14} />}
                  </button>
                </div>
                <Link href={`/groups/${g.id}`}>
                  <Button variant="ghost" size="sm">Ver ranking →</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
