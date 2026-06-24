import React, { useState, useEffect, useCallback } from "react";
import { Wallet, RefreshCw, AlertCircle, Star, CheckCircle2 } from "lucide-react";
import { useFacebookAuth } from "../../hooks/useFacebookAuth";
import { useAdsData } from "../../hooks/useAdsData";

interface AdAccountRow {
  id: string;
  operator: string;
  fb_account_id: string;
  name: string | null;
  currency: string | null;
  business_id: string | null;
  status: string | null;
  is_default: boolean;
  created_at: string;
}

// Status numérico vindo da Graph API (account_status): 1 = ACTIVE, demais = inativo/restrito.
function statusLabel(status: string | null): string {
  if (status === "1") return "ACTIVE";
  if (status === null || status === undefined) return "UNKNOWN";
  return "INATIVA";
}

export function AdsAccounts() {
  const { authState } = useFacebookAuth();
  const { useAdsTable } = useAdsData();
  const accountsTable = useAdsTable<AdAccountRow>("ad_accounts");

  const [accounts, setAccounts] = useState<AdAccountRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    const res = await accountsTable.list("*", (q) => q.order("name", { ascending: true }));
    if (res.success) {
      setAccounts(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [accountsTable]);

  const syncFromFacebook = useCallback(async () => {
    if (!authState.accessToken) return;
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/facebook/ad-accounts?accessToken=${encodeURIComponent(authState.accessToken)}`
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Erro ao carregar contas de anúncio do Facebook.");
      }

      const fbAccounts: Array<{ id: string; name?: string; currency?: string; account_status?: number | string }> =
        data.accounts || [];

      if (fbAccounts.length > 0) {
        const rows = fbAccounts.map((acc) => ({
          fb_account_id: acc.id,
          name: acc.name ?? null,
          currency: acc.currency ?? null,
          business_id: null,
          status: acc.account_status !== undefined ? String(acc.account_status) : null
        }));
        const upsertRes = await accountsTable.upsert(rows, "operator,fb_account_id");
        if (!upsertRes.success) {
          throw new Error(upsertRes.error);
        }
      }

      await loadAccounts();
    } catch (err: any) {
      setError(err.message || "Erro de rede ao sincronizar contas de anúncio.");
    } finally {
      setIsSyncing(false);
    }
  }, [authState.accessToken, accountsTable, loadAccounts]);

  // Carrega contas já salvas no banco ao montar.
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Sincroniza com o Facebook automaticamente quando há token disponível.
  useEffect(() => {
    if (authState.accessToken) {
      syncFromFacebook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.accessToken]);

  const handleSetDefault = async (account: AdAccountRow) => {
    if (account.is_default) return;
    setUpdatingId(account.id);
    setError(null);
    try {
      // Desmarca is_default em todas as outras contas do operador antes de marcar a nova.
      const others = accounts.filter((a) => a.id !== account.id && a.is_default);
      for (const other of others) {
        const res = await accountsTable.update(other.id, { is_default: false } as Partial<AdAccountRow>);
        if (!res.success) throw new Error(res.error);
      }
      const res = await accountsTable.update(account.id, { is_default: true } as Partial<AdAccountRow>);
      if (!res.success) throw new Error(res.error);
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || "Erro ao definir conta padrão.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!authState.accessToken) {
    return (
      <div className="mac-card rounded-mac-lg p-12 flex flex-col items-center justify-center text-center gap-3 select-none">
        <div className="h-12 w-12 rounded-mac-md bg-[#1877F2]/10 border border-[#1877F2]/25 flex items-center justify-center text-[#1877F2]">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="text-sm font-bold text-white tracking-wide font-sans">
            Conecte o Facebook primeiro
          </h4>
          <p className="text-[11px] text-ink-secondary font-sans leading-relaxed font-semibold">
            Vá até a aba de integração do Facebook e conecte sua conta para sincronizar suas
            contas de anúncio aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
          {accounts.length} conta{accounts.length === 1 ? "" : "s"} de anúncio
        </span>
        <button
          onClick={syncFromFacebook}
          disabled={isSyncing}
          className="px-3.5 py-2 bg-primary hover:bg-red-650 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          Sincronizar
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
          Carregando contas...
        </div>
      ) : accounts.length === 0 ? (
        <div className="mac-card rounded-mac-lg p-12 flex flex-col items-center justify-center text-center gap-2 select-none">
          <Wallet className="w-6 h-6 text-ink-tertiary" />
          <span className="text-xs text-ink-secondary font-sans font-semibold">
            Nenhuma conta de anúncio encontrada. Clique em "Sincronizar".
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
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Moeda</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Padrão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-ink-secondary">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-surface-raised/50 transition-all">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {account.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-ink-tertiary">
                        {account.fb_account_id}
                      </td>
                      <td className="px-4 py-3.5 font-mono">{account.currency || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase ${
                            statusLabel(account.status) === "ACTIVE" ? "text-systemGreen" : "text-ink-tertiary"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              statusLabel(account.status) === "ACTIVE" ? "bg-systemGreen" : "bg-ink-tertiary"
                            }`}
                          />
                          {statusLabel(account.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {account.is_default ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary font-mono uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Padrão
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(account)}
                            disabled={updatingId === account.id}
                            className="px-2.5 py-1.5 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wider ml-auto"
                          >
                            <Star className="w-3 h-3" />
                            Definir como padrão
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="block md:hidden space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="mac-card rounded-mac-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{account.name || "—"}</p>
                    <p className="text-[10px] font-mono text-ink-tertiary">{account.fb_account_id}</p>
                  </div>
                  {account.is_default && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary font-mono uppercase shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Padrão
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-tertiary font-mono">{account.currency || "—"}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase ${
                      statusLabel(account.status) === "ACTIVE" ? "text-systemGreen" : "text-ink-tertiary"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        statusLabel(account.status) === "ACTIVE" ? "bg-systemGreen" : "bg-ink-tertiary"
                      }`}
                    />
                    {statusLabel(account.status)}
                  </span>
                </div>
                {!account.is_default && (
                  <button
                    onClick={() => handleSetDefault(account)}
                    disabled={updatingId === account.id}
                    className="w-full px-3 py-2 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Star className="w-3 h-3" />
                    Definir como padrão
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
