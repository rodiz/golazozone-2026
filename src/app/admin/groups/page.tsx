"use client";

import { useState, useEffect } from "react";
import { Search, Users, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupMember {
  id: string;
  groupRank: number;
  groupPoints: number;
  joinedAt: string;
  user: { id: string; name: string | null; email: string };
}

interface AdminGroup {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; name: string | null; email: string };
  members: GroupMember[];
  _count: { members: number };
}

function fmtDate(iso: string, short = false) {
  return new Date(iso).toLocaleDateString("es-CO", short
    ? { day: "2-digit", month: "short" }
    : { day: "2-digit", month: "short", year: "numeric" }
  );
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.code.toLowerCase().includes(q) ||
      (g.owner.name ?? g.owner.email).toLowerCase().includes(q)
    );
  });

  const totalMembers = groups.reduce((acc, g) => acc + g._count.members, 0);

  return (
    <div className="page-stack">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
          Grupos de Usuarios 👥
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          {groups.length} grupos · {totalMembers} participaciones totales
        </p>
      </div>

      {/* Stats strip */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Total grupos",    value: groups.length },
            { label: "Grupos activos",  value: groups.filter((g) => g.isActive).length },
            { label: "Promedio miembros", value: groups.length ? (totalMembers / groups.length).toFixed(1) : "0" },
            { label: "Mayor grupo",     value: Math.max(0, ...groups.map((g) => g._count.members)) },
          ].map((s) => (
            <div key={s.label} className="card">
              <div className="card-content" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{s.label}</p>
                <p className="font-display font-bold" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          className="form-input"
          style={{ paddingLeft: "2.375rem" }}
          placeholder="Buscar por nombre, código o dueño..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Groups list */}
      {loading ? (
        <div className="page-stack-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "5rem" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
          <Users size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p>No se encontraron grupos</p>
        </div>
      ) : (
        <div className="page-stack-sm">
          {filtered.map((group) => {
            const isExpanded = expandedId === group.id;
            return (
              <div key={group.id} className="card">

                {/* Group header row — clickable to expand */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                  style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", userSelect: "none" }}
                >
                  {/* Avatar */}
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-sm)", background: group.isActive ? "var(--primary)" : "var(--border)", color: group.isActive ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={16} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{group.name}</p>
                      <Badge variant={group.isActive ? "success" : "muted"}>
                        {group.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Código:{" "}
                      <code style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)", background: "var(--bg-card-hover)", padding: "0.0625rem 0.25rem", borderRadius: "2px" }}>
                        {group.code}
                      </code>
                      {" · "}Dueño: <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{group.owner.name ?? group.owner.email}</strong>
                      {" · "}{fmtDate(group.createdAt)}
                    </p>
                    {group.description && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Member count + chevron */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <p className="font-display font-bold" style={{ fontSize: "1.25rem", color: "var(--accent)" }}>
                        {group._count.members}
                      </p>
                      <p style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>miembros</p>
                    </div>
                    <ChevronDown
                      size={18}
                      style={{ color: "var(--text-muted)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                    />
                  </div>
                </div>

                {/* Members table — expanded */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {group.members.length === 0 ? (
                      <p style={{ padding: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        Este grupo no tiene miembros aún
                      </p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                          <thead>
                            <tr style={{ background: "var(--bg-card-hover)", borderBottom: "1px solid var(--border)" }}>
                              {["Pos.", "Miembro", "Email", "Puntos grupo", "Se unió"].map((h) => (
                                <th key={h} style={{ textAlign: "left", padding: "0.5rem 1.25rem", fontSize: "0.675rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.members.map((member, i) => (
                              <tr
                                key={member.id}
                                className="table-row-hover"
                                style={{ borderBottom: i < group.members.length - 1 ? "1px solid var(--border)" : "none" }}
                              >
                                <td style={{ padding: "0.625rem 1.25rem", width: "3.5rem" }}>
                                  <span style={{ fontSize: "1.1rem" }}>
                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                                      <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.875rem" }}>{i + 1}</span>
                                    )}
                                  </span>
                                </td>
                                <td style={{ padding: "0.625rem 1.25rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                                      {member.user.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <span style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                                      {member.user.name ?? "Anónimo"}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: "0.625rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                  {member.user.email}
                                </td>
                                <td style={{ padding: "0.625rem 1.25rem" }}>
                                  <span className="font-display font-bold" style={{ color: "var(--accent)", fontSize: "0.9rem" }}>
                                    {member.groupPoints}
                                  </span>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>pts</span>
                                </td>
                                <td style={{ padding: "0.625rem 1.25rem", color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                  {fmtDate(member.joinedAt, true)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
