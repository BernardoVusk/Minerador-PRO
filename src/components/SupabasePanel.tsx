import React, { useState } from "react";
import { Database, Unlink, CheckCircle, HelpCircle, Copy, Check, UploadCloud, RefreshCw, Terminal, Eye, AlertCircle } from "lucide-react";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, saveSupabaseCredentials, clearSupabaseCredentials, supabase } from "../lib/supabase";
import { SQL_CREATION_SCRIPT, batchUpsertOffersToSupabase, fetchOffersFromSupabase, SUPABASE_TABLE_NAME } from "../lib/databaseService";
import { OfferHit } from "../types";

interface SupabasePanelProps {
  offerHits: OfferHit[];
  setOfferHits: React.Dispatch<React.SetStateAction<OfferHit[]>>;
  onClose: () => void;
}

export function SupabasePanel({ offerHits, setOfferHits, onClose }: SupabasePanelProps) {
  const [urlInput, setUrlInput] = useState(supabaseUrl);
  const [keyInput, setKeyInput] = useState(supabaseAnonKey);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed' | 'not_found'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const handleSave = () => {
    if (!urlInput || !keyInput) {
      alert("Por favor, preencha a URL e a Chave Anon (anon key).");
      return;
    }
    saveSupabaseCredentials(urlInput.trim(), keyInput.trim());
  };

  const handleClear = () => {
    if (window.confirm("Deseja realmente desconectar e esquecer as credenciais do Supabase salvo na máquina?")) {
      clearSupabaseCredentials();
    }
  };

  const testConnection = async () => {
    if (!supabase) {
      setTestStatus('failed');
      setErrorMessage("Cliente do Supabase não inicializado. Salve as credenciais primeiro.");
      return;
    }
    setTestStatus('testing');
    setErrorMessage("");

    try {
      // Test basic connection by querying our table
      const { data, error } = await supabase
        .from(SUPABASE_TABLE_NAME)
        .select("id")
        .limit(1);

      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          setTestStatus('not_found');
          setErrorMessage("Conexão estabelecida com sucesso! Porém a tabela '" + SUPABASE_TABLE_NAME + "' ainda não existe no seu Supabase. Copie e execute o script SQL abaixo.");
        } else {
          setTestStatus('failed');
          setErrorMessage(error.message || JSON.stringify(error));
        }
      } else {
        setTestStatus('success');
      }
    } catch (err: any) {
      setTestStatus('failed');
      setErrorMessage(err.message || "Erro desconhecido de conexão ou CORS.");
    }
  };

  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured) return;
    setIsSyncing(true);
    setSyncStatus("Enviando histórico local...");

    const res = await batchUpsertOffersToSupabase(offerHits);
    if (res.success) {
      setSyncStatus(`Sucesso! ${res.count} ofertas sincronizadas.`);
      // Download merged list from Supabase
      try {
        const remoteHits = await fetchOffersFromSupabase();
        if (remoteHits.length > 0) {
          setOfferHits(remoteHits);
          localStorage.setItem("minerador_pro_hits", JSON.stringify(remoteHits));
        }
      } catch (err) {}
    } else {
      setSyncStatus(`Erro ao sincronizar: ${res.error}`);
    }
    setIsSyncing(false);
  };

  const handlePullFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    setIsSyncing(true);
    setSyncStatus("Baixando dados remotos...");

    try {
      const remoteHits = await fetchOffersFromSupabase();
      if (remoteHits.length > 0) {
        setOfferHits((prev) => {
          const localUrls = new Set(prev.map(h => h.url));
          const merged = [...prev];
          for (const item of remoteHits) {
            if (!localUrls.has(item.url)) {
              merged.push(item);
            }
          }
          localStorage.setItem("minerador_pro_hits", JSON.stringify(merged));
          return merged;
        });
        setSyncStatus(`Sucesso! ${remoteHits.length} ofertas importadas.`);
      } else {
        setSyncStatus("Nenhum dado encontrado no Supabase.");
      }
    } catch (err: any) {
      setSyncStatus(`Erro: ${err.message}`);
    }
    setIsSyncing(false);
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_CREATION_SCRIPT);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans text-white">
      <div className="relative bg-[#101011] border border-white/5 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-300 font-sans uppercase tracking-widest flex items-center gap-2 select-none">
            <Database className="w-4 h-4 text-primary" /> Integração de Dados Supabase (PostgreSQL)
          </h3>
          <button
            onClick={onClose}
            className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-none">
          
          {/* Top Status Badge Banner */}
          <div className="p-5 rounded-2xl border bg-white/[0.015] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Status do Ambiente</span>
              <div className="flex items-center gap-2">
                {isSupabaseConfigured ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></span>
                    <span className="text-sm font-extrabold text-white font-mono break-all max-w-[280px] sm:max-w-md truncate">
                       {supabaseUrl}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-zinc-400 text-xs font-semibold">Sem Conexão Ativa no Servidor</span>
                  </>
                )}
              </div>
            </div>

            {isSupabaseConfigured && (
              <button
                onClick={handleClear}
                className="text-[10px] text-red-400 hover:text-red-300 font-extrabold uppercase tracking-wider flex items-center gap-1 bg-red-500/10 hover:bg-red-500/15 border border-red-500/10 px-3 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <Unlink className="w-3 h-3" /> Desconectar
              </button>
            )}
          </div>

          {/* Credential Forms */}
          <div className="space-y-4">
            <h4 className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">Credenciais do Projeto</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-500 font-bold tracking-wider uppercase pl-1">URL (Project URL)</label>
                <input
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-[#0a0a0b] text-white border border-white/5 focus:border-primary/50 text-xs px-4 py-3 rounded-full outline-none transition-all placeholder:text-zinc-650 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-500 font-bold tracking-wider uppercase pl-1">Chave Anon (anon/public Key)</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YourAnonKey..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-[#0a0a0b] text-white border border-white/5 focus:border-primary/50 text-xs px-4 py-3 rounded-full outline-none transition-all placeholder:text-zinc-650 h-11"
                />
              </div>
            </div>

            {!isSupabaseConfigured && (
              <button
                onClick={handleSave}
                className="w-full bg-primary hover:bg-primary-hover active:bg-[#CC1F1F] text-white font-bold py-3 px-5 rounded-full text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,42,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Salvar Credenciais & Ativar
              </button>
            )}
          </div>

          {/* Connected Actions Panel */}
          {isSupabaseConfigured && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">Operações de Sincronia</h4>
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className="text-[10px] text-primary hover:text-white font-bold tracking-widest uppercase bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/5 rounded-full cursor-pointer flex items-center gap-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`} /> Testar Banco
                </button>
              </div>

              {/* Test response message wrapper */}
              {testStatus !== 'idle' && (
                <div className={`p-4 rounded-xl text-xs flex gap-2.5 items-start ${
                  testStatus === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                  testStatus === 'not_found' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                  testStatus === 'testing' ? 'bg-white/5 border border-white/5 text-zinc-400 animate-pulse' :
                  'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}>
                  {testStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Conexão Perfeita!</strong> A tabela foi identificada e está apta para transações de alta performance.
                      </div>
                    </>
                  ) : testStatus === 'not_found' ? (
                    <>
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        {errorMessage}
                      </div>
                    </>
                  ) : testStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-primary" />
                      <div>Testando conexão de latência de rede...</div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Falha de Conexão:</strong> {errorMessage}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sync Actions Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing || offerHits.length === 0}
                  className="p-5 bg-white/[0.012] hover:bg-white/[0.025] active:bg-[#151516] text-left rounded-xl border border-white/5 transition-all flex flex-col justify-between items-start gap-3 group disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div>
                    <UploadCloud className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-xs font-bold text-white mt-2">Enviar Dados para Supabase</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Grave {offerHits.length} ofertas do seu histórico local no PostgreSQL.</div>
                  </div>
                </button>

                <button
                  onClick={handlePullFromSupabase}
                  disabled={isSyncing}
                  className="p-5 bg-white/[0.012] hover:bg-white/[0.025] active:bg-[#151516] text-left rounded-xl border border-white/5 transition-all flex flex-col justify-between items-start gap-3 group disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div>
                    <Database className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-xs font-bold text-white mt-2">Importar do Supabase</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Substitua e sincronize novos registros salvos em rede para a máquina.</div>
                  </div>
                </button>
              </div>

              {syncStatus && (
                <div className="text-[11px] font-mono text-primary animate-pulse text-center font-bold">
                  ⚡ {syncStatus}
                </div>
              )}
            </div>
          )}

          {/* Quick SQL Editor copy guide */}
          <div className="border-t border-white/5 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-primary" /> Setup da Tabela no Supabase
              </span>
              <button
                onClick={copySql}
                className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 hover:border-white/10 rounded-full cursor-pointer transition-all h-7"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" /> Copiar SQL
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-medium">
              Abra o <strong className="text-white">SQL Editor</strong> do seu painel Supabase, crie uma consulta/query em branco, cole o código abaixo e clique em <strong className="text-white">RUN</strong> para construir o banco:
            </p>
            <div className="bg-[#050506] border border-white/5 rounded-xl p-4 overflow-x-auto text-[10px] font-mono text-zinc-400 leading-relaxed max-h-48 scrollbar-thin">
              <pre>{SQL_CREATION_SCRIPT}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
