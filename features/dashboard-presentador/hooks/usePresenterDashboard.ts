"use client";

import { useCallback, useEffect, useState } from "react";
import type { PresenterStats } from "@/features/dashboard-presentador/services/standService";
import {
  fetchPresenterStands,
  fetchPresenterStats,
  createOrUpdateStand,
  removeStand,
  fetchProposals,
  respondToProposal,
} from "@/features/dashboard-presentador/actions/presenterActions";
import type { Stand, StandFormData } from "@/features/dashboard-presentador/types/stand";
import type { Proposal, ProposalStatus } from "@/features/dashboard-presentador/types/proposal";

export function usePresenterDashboard() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<PresenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, st] = await Promise.all([
        fetchPresenterStands(),
        fetchProposals(),
        fetchPresenterStats(),
      ]);
      setStands(s);
      setProposals(p);
      setStats(st);
    } catch {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSaveStand(data: StandFormData, id?: string) {
    const updated = await createOrUpdateStand(data, id);
    setStands((prev) =>
      id ? prev.map((s) => (s.id === id ? updated : s)) : [...prev, updated]
    );
    const newStats = await fetchPresenterStats();
    setStats(newStats);
  }

  async function handleDeleteStand(id: string) {
    await removeStand(id);
    setStands((prev) => prev.filter((s) => s.id !== id));
    const newStats = await fetchPresenterStats();
    setStats(newStats);
  }

  async function handleUpdateProposal(id: string, status: ProposalStatus) {
    const updated = await respondToProposal(id, status);
    setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  return {
    stands,
    proposals,
    stats,
    loading,
    error,
    refresh: load,
    onSaveStand: handleSaveStand,
    onDeleteStand: handleDeleteStand,
    onUpdateProposal: handleUpdateProposal,
  };
}
