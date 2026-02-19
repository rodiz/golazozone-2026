"use client";

import { useState, useEffect } from "react";
import { Users, Plus, LogIn, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  code: string;
  memberCount: number;
  currentUserRank: number;
  currentUserPoints: number;
}

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
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((p) => [...p, data.group]);
      setShowCreate(false);
      setCreateName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((p) => [...p, data.group]);
      setShowJoin(false);
      setJoinCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
            Grupos de Amigos
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Compite con tu polla privada · invita con código
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
            <LogIn className="w-4 h-4" /> Unirme
          </Button>
          <Button variant="accent" size="sm" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
            <Plus className="w-4 h-4" /> Crear
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Crear grupo</h3>
            <Input
              label="Nombre del grupo"
              placeholder="Ej: Los Craks del Trabajo"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="accent" size="sm" onClick={createGroup} loading={submitting}>
                Crear grupo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join form */}
      {showJoin && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Unirse a grupo</h3>
            <Input
              label="Código de invitación (6 caracteres)"
              placeholder="ABCD12"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <div className="flex gap-2">
              <Button variant="accent" size="sm" onClick={joinGroup} loading={submitting}>
                Unirme
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowJoin(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--bg-card)] rounded-[var(--radius)] animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-[var(--text-primary)]">Aún no perteneces a ningún grupo</p>
          <p className="text-sm mt-1">Crea uno o únete con un código de invitación</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.id} className="hover:border-[var(--accent)] transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)]">{g.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {g.memberCount} miembro{g.memberCount !== 1 ? "s" : ""}
                    </p>
                    {g.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{g.description}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-2xl text-[var(--accent)]">#{g.currentUserRank}</p>
                    <p className="text-xs text-[var(--text-muted)]">{g.currentUserPoints} pts</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Código:</span>
                    <code className="text-sm font-mono font-bold text-[var(--accent)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">
                      {g.code}
                    </code>
                    <button
                      onClick={() => copyCode(g.code)}
                      className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      {copied === g.code ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver ranking →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
