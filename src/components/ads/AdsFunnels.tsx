import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BarChart3
} from "lucide-react";
import { useAdsData } from "../../hooks/useAdsData";
import { useOperator } from "../../contexts/OperatorContext";

interface FunnelRow {
  id: string;
  operator: string;
  name: string;
  product_id: string | null;
  created_at: string;
}

interface FunnelStepRow {
  id: string;
  operator: string;
  funnel_id: string;
  name: string;
  event_name: string | null;
  step_order: number;
  created_at: string;
}

interface FunnelStepStat {
  stepId: string;
  name: string;
  eventName: string | null;
  count: number;
}

// --- CRUD do funil (nome) -------------------------------------------------

interface FunnelFormModalProps {
  initialName: string;
  isEdit: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

function FunnelFormModal({ initialName, isEdit, saving, onClose, onSave }: FunnelFormModalProps) {
  const [name, setName] = useState(initialName);
  const [errorInput, setErrorInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorInput("Nome do funil é obrigatório.");
      return;
    }
    try {
      await onSave(trimmed);
    } catch (err: any) {
      setErrorInput(err.message || "Erro desconhecido ao salvar o funil.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-[#050506]/92 backdrop-blur-md cursor-pointer" />
      <div className="relative w-full max-w-md mac-card rounded-mac-lg overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col">
        <div className="h-1 bg-gradient-to-r from-red-500 via-primary to-orange-500" />
        <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface-base">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEdit ? "Renomear Funil" : "Novo Funil"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorInput && (
            <div className="p-3.5 rounded-mac-md bg-systemRed/10 border border-systemRed/25 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-systemRed shrink-0 mt-0.5" />
              <div className="text-[11px] text-red-200 leading-normal font-medium">{errorInput}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
              Nome do Funil <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Funil Lançamento Curso X"
              className="w-full mac-input px-3 py-2.5 rounded-mac-sm text-xs font-sans outline-none"
              disabled={saving}
            />
          </div>
        </form>

        <div className="p-5 border-t border-hairline bg-surface-base flex items-center justify-end gap-3 select-none">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mac-btn-secondary text-white rounded-mac-sm text-xs font-bold tracking-wide transition-all cursor-pointer"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 mac-btn-primary text-white rounded-mac-sm text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              "Salvando..."
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> {isEdit ? "Salvar" : "Criar Funil"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Visualização de drop-off ---------------------------------------------

function FunnelDropoff({ stats }: { stats: FunnelStepStat[] }) {
  if (stats.length === 0) {
    return (
      <div className="mac-card rounded-mac-lg p-8 flex flex-col items-center justify-center text-center gap-2 select-none">
        <BarChart3 className="w-5 h-5 text-ink-tertiary" />
        <span className="text-xs text-ink-secondary font-sans font-semibold">
          Adicione etapas ao funil para ver a visualização.
        </span>
      </div>
    );
  }

  const firstCount = stats[0].count;
  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  const hasAnyData = stats.some((s) => s.count > 0);

  return (
    <div className="mac-card rounded-mac-lg p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
          Drop-off do Funil
        </span>
      </div>

      {!hasAnyData ? (
        <div className="py-6 flex flex-col items-center justify-center text-center gap-2 select-none">
          <span className="text-xs text-ink-secondary font-sans font-semibold">
            Nenhum evento registrado ainda para as etapas deste funil no período selecionado.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map((step, idx) => {
            const pctOfFirst = firstCount > 0 ? (step.count / firstCount) * 100 : 0;
            const prevCount = idx > 0 ? stats[idx - 1].count : null;
            const pctOfPrev = prevCount && prevCount > 0 ? (step.count / prevCount) * 100 : null;
            const barWidth = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

            return (
              <div key={step.stepId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-white truncate">
                    {idx + 1}. {step.name}
                  </span>
                  <span className="font-mono text-ink-tertiary shrink-0">
                    {step.count.toLocaleString("pt-BR")}
                    {idx > 0 && (
                      <span className="ml-2 text-ink-secondary">
                        {pctOfPrev !== null ? `${pctOfPrev.toFixed(1)}% da etapa anterior` : "—"}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-ink-tertiary">
                  {pctOfFirst.toFixed(1)}% da primeira etapa
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Editor de etapas -------------------------------------------------

interface StepEditorProps {
  funnel: FunnelRow;
  eventNameOptions: string[];
}

function StepEditor({ funnel, eventNameOptions }: StepEditorProps) {
  const { useAdsTable } = useAdsData();
  const stepsTable = useAdsTable<FunnelStepRow>("funnel_steps");
  const operator = useOperator();

  const [steps, setSteps] = useState<FunnelStepRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingStepId, setSavingStepId] = useState<string | null>(null);

  const [newStepName, setNewStepName] = useState("");
  const [newStepEvent, setNewStepEvent] = useState("");
  const [newStepEventCustom, setNewStepEventCustom] = useState("");
  const [isAddingStep, setIsAddingStep] = useState(false);

  const [stats, setStats] = useState<FunnelStepStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadSteps = useCallback(async () => {
    setIsLoading(true);
    const res = await stepsTable.list("*", (q) =>
      q.eq("funnel_id", funnel.id).order("step_order", { ascending: true })
    );
    if (res.success) {
      setSteps(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [stepsTable, funnel.id]);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch(
        `/api/ads/funnel/${funnel.id}/stats?operator=${encodeURIComponent(operator)}`
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Erro ao buscar estatísticas do funil.");
      }
      setStats(data.steps || []);
    } catch (err: any) {
      setError(err.message || "Erro de rede ao buscar estatísticas do funil.");
    } finally {
      setIsLoadingStats(false);
    }
  }, [funnel.id, operator]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = newStepName.trim();
    if (!trimmedName) {
      setError("Nome da etapa é obrigatório.");
      return;
    }
    const eventName = (newStepEvent === "__custom__" ? newStepEventCustom : newStepEvent).trim();

    setIsAddingStep(true);
    try {
      const nextOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.step_order)) + 1 : 0;
      const res = await stepsTable.insert({
        funnel_id: funnel.id,
        name: trimmedName,
        event_name: eventName || null,
        step_order: nextOrder
      } as Partial<FunnelStepRow>);
      if (!res.success) throw new Error(res.error);
      setNewStepName("");
      setNewStepEvent("");
      setNewStepEventCustom("");
      await loadSteps();
      await loadStats();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar etapa.");
    } finally {
      setIsAddingStep(false);
    }
  };

  const handleDeleteStep = async (step: FunnelStepRow) => {
    const confirmed = window.confirm(`Excluir a etapa "${step.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setSavingStepId(step.id);
    setError(null);
    try {
      const res = await stepsTable.remove(step.id);
      if (!res.success) throw new Error(res.error);
      await loadSteps();
      await loadStats();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir etapa.");
    } finally {
      setSavingStepId(null);
    }
  };

  const handleMove = async (step: FunnelStepRow, direction: "up" | "down") => {
    const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
    const idx = sorted.findIndex((s) => s.id === step.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    setSavingStepId(step.id);
    setError(null);
    try {
      const res1 = await stepsTable.update(step.id, { step_order: other.step_order });
      if (!res1.success) throw new Error(res1.error);
      const res2 = await stepsTable.update(other.id, { step_order: step.step_order });
      if (!res2.success) throw new Error(res2.error);
      await loadSteps();
    } catch (err: any) {
      setError(err.message || "Erro ao reordenar etapa.");
    } finally {
      setSavingStepId(null);
    }
  };

  const sortedSteps = useMemo(() => [...steps].sort((a, b) => a.step_order - b.step_order), [steps]);

  return (
    <div className="space-y-4 p-4 sm:p-5 border-t border-hairline bg-surface-base/40">
      {error && (
        <div className="flex items-center gap-2.5 text-systemRed text-xs bg-systemRed/10 border border-systemRed/25 rounded-mac-md px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Lista de etapas */}
      {isLoading ? (
        <div className="text-xs text-ink-tertiary font-sans">Carregando etapas...</div>
      ) : sortedSteps.length === 0 ? (
        <div className="text-xs text-ink-secondary font-sans font-semibold py-2">
          Nenhuma etapa cadastrada ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSteps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center gap-2 mac-card rounded-mac-sm px-3 py-2.5"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMove(step, "up")}
                  disabled={idx === 0 || savingStepId === step.id}
                  title="Mover para cima"
                  className="p-0.5 rounded-mac-sm text-ink-tertiary hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMove(step, "down")}
                  disabled={idx === sortedSteps.length - 1 || savingStepId === step.id}
                  title="Mover para baixo"
                  className="p-0.5 rounded-mac-sm text-ink-tertiary hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {idx + 1}. {step.name}
                </p>
                <p className="text-[10px] font-mono text-ink-tertiary truncate">
                  {step.event_name || "(sem evento definido)"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteStep(step)}
                disabled={savingStepId === step.id}
                title="Excluir etapa"
                className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-systemRed hover:bg-systemRed/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form de nova etapa */}
      <form onSubmit={handleAddStep} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
            Nome da Etapa
          </label>
          <input
            type="text"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder="Ex: Visitou a página"
            className="w-full mac-input px-2.5 py-2 rounded-mac-sm text-xs font-sans outline-none"
            disabled={isAddingStep}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
            Evento
          </label>
          <select
            value={newStepEvent}
            onChange={(e) => setNewStepEvent(e.target.value)}
            className="w-full mac-input px-2.5 py-2 rounded-mac-sm text-xs font-sans outline-none cursor-pointer"
            disabled={isAddingStep}
          >
            <option value="">Sem evento</option>
            {eventNameOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__custom__">Digitar novo...</option>
          </select>
        </div>
        {newStepEvent === "__custom__" && (
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
              Nome do Evento
            </label>
            <input
              type="text"
              value={newStepEventCustom}
              onChange={(e) => setNewStepEventCustom(e.target.value)}
              placeholder="Ex: Lead"
              className="w-full mac-input px-2.5 py-2 rounded-mac-sm text-xs font-sans outline-none"
              disabled={isAddingStep}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isAddingStep}
          className="px-3.5 py-2 bg-primary hover:bg-red-650 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </form>

      {/* Drop-off */}
      {isLoadingStats ? (
        <div className="mac-card rounded-mac-lg p-8 flex items-center justify-center text-ink-tertiary text-xs font-sans">
          Carregando estatísticas...
        </div>
      ) : (
        <FunnelDropoff stats={stats} />
      )}
    </div>
  );
}

// --- Componente principal -------------------------------------------------

export function AdsFunnels() {
  const { useAdsTable } = useAdsData();
  const funnelsTable = useAdsTable<FunnelRow>("funnels");
  const eventsTable = useAdsTable<{ event_name: string }>("tracking_events");

  const [funnels, setFunnels] = useState<FunnelRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<FunnelRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [eventNameOptions, setEventNameOptions] = useState<string[]>([]);

  const loadFunnels = useCallback(async () => {
    setIsLoading(true);
    const res = await funnelsTable.list("*", (q) => q.order("created_at", { ascending: false }));
    if (res.success) {
      setFunnels(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [funnelsTable]);

  // Busca os `event_name` distintos já vistos em `tracking_events` do operador, para
  // popular o <select> do editor de etapas. O cliente Supabase não tem um helper de DISTINCT,
  // então buscamos a coluna e deduplicamos em JS — aceitável dado o volume esperado.
  const loadEventNames = useCallback(async () => {
    const res = await eventsTable.list("event_name");
    if (res.success) {
      const names = Array.from(new Set(res.data.map((r) => r.event_name).filter(Boolean))).sort();
      setEventNameOptions(names);
    }
  }, [eventsTable]);

  useEffect(() => {
    loadFunnels();
    loadEventNames();
  }, [loadFunnels, loadEventNames]);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openCreateForm = () => {
    setEditingFunnel(null);
    setIsFormOpen(true);
  };

  const openEditForm = (funnel: FunnelRow) => {
    setEditingFunnel(funnel);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingFunnel(null);
  };

  const handleSave = async (name: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = editingFunnel
        ? await funnelsTable.update(editingFunnel.id, { name })
        : await funnelsTable.insert({ name });
      if (!res.success) throw new Error(res.error);
      closeForm();
      await loadFunnels();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (funnel: FunnelRow) => {
    const confirmed = window.confirm(`Excluir o funil "${funnel.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setDeletingId(funnel.id);
    setError(null);
    try {
      const res = await funnelsTable.remove(funnel.id);
      if (!res.success) throw new Error(res.error);
      if (expandedId === funnel.id) setExpandedId(null);
      await loadFunnels();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir funil.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
          {funnels.length} funil{funnels.length === 1 ? "" : "is"}
        </span>
        <button
          onClick={openCreateForm}
          className="px-3.5 py-2 bg-primary hover:bg-red-650 text-white text-[11px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Funil
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 text-systemRed text-xs bg-systemRed/10 border border-systemRed/25 rounded-mac-md px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="mac-card rounded-mac-lg p-12 flex items-center justify-center text-ink-tertiary text-xs font-sans">
          Carregando funis...
        </div>
      ) : funnels.length === 0 ? (
        <div className="mac-card rounded-mac-lg p-12 flex flex-col items-center justify-center text-center gap-2 select-none">
          <GitBranch className="w-6 h-6 text-ink-tertiary" />
          <span className="text-xs text-ink-secondary font-sans font-semibold">
            Nenhum funil cadastrado. Clique em "Novo Funil".
          </span>
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block mac-card rounded-mac-lg overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-surface-raised border-b border-hairline text-[10px] text-ink-tertiary font-bold uppercase tracking-widest font-mono">
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-ink-secondary">
                  {funnels.map((funnel) => (
                    <React.Fragment key={funnel.id}>
                      <tr className="hover:bg-surface-raised/50 transition-all">
                        <td className="px-4 py-3.5 font-bold text-white">{funnel.name}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleExpanded(funnel.id)}
                              title="Ver etapas"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                              {expandedId === funnel.id ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditForm(funnel)}
                              title="Renomear funil"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(funnel)}
                              disabled={deletingId === funnel.id}
                              title="Excluir funil"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-systemRed hover:bg-systemRed/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === funnel.id && (
                        <tr>
                          <td colSpan={2} className="p-0">
                            <StepEditor funnel={funnel} eventNameOptions={eventNameOptions} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="block md:hidden space-y-3">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="mac-card rounded-mac-lg overflow-hidden">
                <div className="p-4 space-y-3">
                  <p className="text-sm font-bold text-white truncate">{funnel.name}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                    <button
                      onClick={() => toggleExpanded(funnel.id)}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      Etapas
                      {expandedId === funnel.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditForm(funnel)}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(funnel)}
                      disabled={deletingId === funnel.id}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-systemRed/40 hover:text-systemRed disabled:opacity-40 disabled:cursor-not-allowed text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
                {expandedId === funnel.id && (
                  <StepEditor funnel={funnel} eventNameOptions={eventNameOptions} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {isFormOpen && (
        <FunnelFormModal
          initialName={editingFunnel?.name || ""}
          isEdit={!!editingFunnel}
          saving={isSaving}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
