import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Activity, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdsData } from "../../hooks/useAdsData";

interface EventRow {
  id: string;
  event_id: string | null;
  event_name: string;
  source: string;
  fb_pixel_id: string | null;
  url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
  client_ip: string | null;
  user_agent: string | null;
  email_hash: string | null;
  value: number | null;
  currency: string | null;
  sale_id: string | null;
  capi_sent: boolean | null;
  capi_response: unknown;
  occurred_at: string;
  created_at: string;
}

const SOURCE_OPTIONS = ["pixel", "capi", "webhook"];

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  pixel: { label: "Pixel", className: "bg-systemBlue/15 text-systemBlue" },
  capi: { label: "CAPI", className: "bg-primary/15 text-primary" },
  webhook: { label: "Webhook", className: "bg-systemYellow/15 text-systemYellow" }
};

function sourceBadge(source: string) {
  return (
    SOURCE_BADGE[source] || {
      label: source ? source.charAt(0).toUpperCase() + source.slice(1) : "Desconhecido",
      className: "bg-ink-tertiary/15 text-ink-tertiary"
    }
  );
}

// Extrai uma string de erro razoável de `capi_response` (jsonb arbitrário vindo da Graph API)
// sem assumir um shape fixo — a Graph API pode devolver `error.message`, ou qualquer outra
// coisa em casos inesperados. Sempre cai para um JSON truncado se nada reconhecível existir.
function describeCapiResponse(response: unknown): string {
  if (response === null || response === undefined) return "—";
  try {
    if (typeof response === "object") {
      const obj = response as Record<string, any>;
      if (obj.error && typeof obj.error === "object") {
        const msg = obj.error.message || obj.error.error_user_msg || obj.error.type;
        if (typeof msg === "string" && msg) return msg;
      }
      if (typeof obj.message === "string" && obj.message) return obj.message;
    }
    return JSON.stringify(response).slice(0, 200);
  } catch {
    return "Erro desconhecido (resposta não serializável).";
  }
}

function capiBadge(event: EventRow): { label: string; className: string; tooltip?: string } {
  if (event.capi_sent) {
    return { label: "Enviado", className: "bg-systemGreen/15 text-systemGreen" };
  }
  if (event.capi_response !== null && event.capi_response !== undefined) {
    return {
      label: "Falhou",
      className: "bg-systemRed/15 text-systemRed",
      tooltip: describeCapiResponse(event.capi_response)
    };
  }
  return { label: "Não enviado", className: "bg-ink-tertiary/15 text-ink-tertiary" };
}

function formatValue(value: number | null, currency: string | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL"
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const PAGE_SIZE = 20;

export function AdsEvents() {
  const { useAdsTable } = useAdsData();
  const eventsTable = useAdsTable<EventRow>("tracking_events");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eventNameFilter, setEventNameFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await eventsTable.list("*", (q) => q.order("occurred_at", { ascending: false }));
    if (res.success) {
      setEvents(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [eventsTable]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventNameFilter, sourceFilter, dateFrom, dateTo]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (eventNameFilter && event.event_name !== eventNameFilter) return false;
      if (sourceFilter && event.source !== sourceFilter) return false;
      if (dateFrom && new Date(event.occurred_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(event.occurred_at) > new Date(`${dateTo}T23:59:59`)) return false;
      return true;
    });
  }, [events, eventNameFilter, sourceFilter, dateFrom, dateTo]);

  const eventNameOptions = useMemo(
    () => Array.from(new Set(events.map((e) => e.event_name))).sort(),
    [events]
  );

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
          {filteredEvents.length} evento{filteredEvents.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mac-card rounded-mac-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
            Evento
          </label>
          <select
            value={eventNameFilter}
            onChange={(e) => setEventNameFilter(e.target.value)}
            className="w-full mac-input px-2.5 py-2 rounded-mac-sm text-xs font-sans outline-none cursor-pointer"
          >
            <option value="">Todos</option>
            {eventNameOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
            Origem
          </label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full mac-input px-2.5 py-2 rounded-mac-sm text-xs font-sans outline-none cursor-pointer"
          >
            <option value="">Todas</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {sourceBadge(s).label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 col-span-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
            Período
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full mac-input px-2 py-2 rounded-mac-sm text-[11px] font-sans outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full mac-input px-2 py-2 rounded-mac-sm text-[11px] font-sans outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 text-systemRed text-xs bg-systemRed/10 border border-systemRed/25 rounded-mac-md px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="mac-card rounded-mac-lg p-12 flex items-center justify-center text-ink-tertiary text-xs font-sans">
          Carregando eventos...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="mac-card rounded-mac-lg p-12 flex flex-col items-center justify-center text-center gap-2 select-none">
          <Activity className="w-6 h-6 text-ink-tertiary" />
          <span className="text-xs text-ink-secondary font-sans font-semibold">
            Nenhum evento encontrado.
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
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">CAPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-ink-secondary">
                  {paginatedEvents.map((event) => {
                    const srcBadge = sourceBadge(event.source);
                    const cBadge = capiBadge(event);
                    return (
                      <tr key={event.id} className="hover:bg-surface-raised/50 transition-all">
                        <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                          {formatDate(event.occurred_at)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">{event.event_name}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-mac-sm text-[10px] font-bold font-mono uppercase ${srcBadge.className}`}
                          >
                            {srcBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {formatValue(event.value, event.currency)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            title={cBadge.tooltip}
                            className={`inline-flex items-center px-2 py-0.5 rounded-mac-sm text-[10px] font-bold font-mono uppercase ${cBadge.className} ${
                              cBadge.tooltip ? "cursor-help" : ""
                            }`}
                          >
                            {cBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-hairline select-none">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="mac-btn-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <span className="text-[10px] text-ink-tertiary font-mono font-bold uppercase tracking-wider">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="mac-btn-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile: cards */}
          <div className="block md:hidden space-y-3">
            {paginatedEvents.map((event) => {
              const srcBadge = sourceBadge(event.source);
              const cBadge = capiBadge(event);
              return (
                <div key={event.id} className="mac-card rounded-mac-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{event.event_name}</p>
                      <p className="text-[10px] font-mono text-ink-tertiary">
                        {formatDate(event.occurred_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-mac-sm text-[10px] font-bold font-mono uppercase shrink-0 ${srcBadge.className}`}
                    >
                      {srcBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-zinc-100">
                      {formatValue(event.value, event.currency)}
                    </span>
                    <span
                      title={cBadge.tooltip}
                      className={`inline-flex items-center px-2 py-0.5 rounded-mac-sm text-[10px] font-bold font-mono uppercase ${cBadge.className} ${
                        cBadge.tooltip ? "cursor-help" : ""
                      }`}
                    >
                      {cBadge.label}
                    </span>
                  </div>
                  {cBadge.tooltip && (
                    <p className="pt-2 border-t border-hairline text-[10px] text-systemRed font-semibold break-words">
                      {cBadge.tooltip}
                    </p>
                  )}
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-2 py-2 select-none">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="mac-btn-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <span className="text-[10px] text-ink-tertiary font-mono font-bold uppercase tracking-wider">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="mac-btn-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
