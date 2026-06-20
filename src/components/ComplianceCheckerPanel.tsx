import React, { useRef, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Upload, X, Loader2, AlertCircle, Copy, Check, Sparkles } from "lucide-react";

interface ComplianceFlag {
  trecho: string;
  categoria: string;
  motivo: string;
  sugestao: string;
}

interface ComplianceResult {
  riskLevel: string;
  summary: string;
  flags: ComplianceFlag[];
  rewriteSugerido?: string | null;
}

export function ComplianceCheckerPanel() {
  const [copyText, setCopyText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [isRewriteCopied, setIsRewriteCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runCheck = async () => {
    if (!copyText.trim() && !imagePreview) {
      setErrorMessage("Cole um texto de copy ou envie uma imagem de criativo para analisar.");
      return;
    }

    setIsChecking(true);
    setErrorMessage("");
    setResult(null);

    try {
      const customKey = localStorage.getItem("vusk_custom_gemini_key") || "";
      const res = await fetch("/api/compliance-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": customKey
        },
        body: JSON.stringify({
          text: copyText.trim() || undefined,
          imageBase64: imagePreview || undefined,
          imageMimeType: imageFile?.type || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro desconhecido ao verificar compliance.");
      }

      setResult(data.result);
      setSimulated(Boolean(data.simulated));
    } catch (err: any) {
      console.error("Compliance check failed:", err);
      setErrorMessage(err.message || "Erro de conexão. Verifique se o servidor local está operacional.");
    } finally {
      setIsChecking(false);
    }
  };

  const copyRewrite = () => {
    if (!result?.rewriteSugerido) return;
    navigator.clipboard.writeText(result.rewriteSugerido);
    setIsRewriteCopied(true);
    setTimeout(() => setIsRewriteCopied(false), 2000);
  };

  const riskStyle = (() => {
    const level = (result?.riskLevel || "").toLowerCase();
    if (level === "alto") {
      return { Icon: ShieldX, color: "text-systemRed", bg: "bg-systemRed/10 border-systemRed/25" };
    }
    if (level === "médio" || level === "medio") {
      return { Icon: ShieldAlert, color: "text-systemYellow", bg: "bg-systemYellow/10 border-systemYellow/25" };
    }
    return { Icon: ShieldCheck, color: "text-systemGreen", bg: "bg-systemGreen/10 border-systemGreen/25" };
  })();

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="p-6 mac-card space-y-1 select-none">
        <span className="text-[9px] text-primary font-bold uppercase tracking-widest block font-sans">MÓDULO COMPLIANCE</span>
        <h2 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" /> Compliance Pre-Flight Checker
        </h2>
        <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
          Analisa copy e/ou criativo contra as categorias de risco mais comuns de reprovação nas políticas do Meta/Google Ads (claims de saúde, garantias de resultado, antes/depois, urgência falsa) e sugere reescrita compliant — antes de publicar, não depois de reprovado.
        </p>
      </div>

      <div className="mac-card p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider pl-1">Texto de copy (headline, anúncio, página)</label>
          <textarea
            value={copyText}
            onChange={(e) => setCopyText(e.target.value)}
            placeholder="Cole aqui a copy que você quer verificar antes de publicar..."
            rows={6}
            className="w-full mac-input text-white text-xs px-4 py-3 outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider pl-1">Imagem do criativo (opcional)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Criativo para análise" className="max-h-40 rounded-mac-md border border-hairline object-contain" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-systemRed border border-systemRed/40 rounded-full flex items-center justify-center text-white cursor-pointer"
                title="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-hairline hover:border-primary/40 rounded-mac-md p-6 flex items-center justify-center gap-2 cursor-pointer text-ink-tertiary hover:bg-surface-raised transition-all"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <Upload className="w-4 h-4" />
              <span className="text-xs font-semibold">Clique para enviar uma imagem do criativo</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-systemRed/10 border border-systemRed/25 rounded-xl text-systemRed text-xs flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={runCheck}
          disabled={isChecking}
          className="mac-btn-primary text-white font-bold py-3.5 px-6 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Verificar Compliance
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mac-card p-6 space-y-5 animate-scale-in">
          <div className={`flex items-start gap-3 p-4 rounded-mac-md border ${riskStyle.bg}`}>
            <riskStyle.Icon className={`w-6 h-6 shrink-0 ${riskStyle.color}`} />
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider ${riskStyle.color}`}>
                Risco {result.riskLevel}
              </div>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{result.summary}</p>
              {simulated && (
                <p className="text-[10px] text-ink-tertiary mt-1.5 font-mono">
                  Análise simulada (configure GEMINI_API_KEY para verificação completa com IA).
                </p>
              )}
            </div>
          </div>

          {result.flags.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-widest block font-mono">Pontos identificados</span>
              {result.flags.map((flag, i) => (
                <div key={i} className="p-4 bg-surface-raised border border-hairline rounded-mac-md space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-mac-sm bg-primary/10 border border-primary/25 text-primary">
                      {flag.categoria}
                    </span>
                  </div>
                  <p className="text-xs text-white font-semibold font-mono break-words">"{flag.trecho}"</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">{flag.motivo}</p>
                  <p className="text-xs text-systemGreen leading-relaxed"><span className="font-bold">Sugestão:</span> {flag.sugestao}</p>
                </div>
              ))}
            </div>
          )}

          {result.rewriteSugerido && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-widest block font-mono">Reescrita sugerida (compliant)</span>
                <button
                  onClick={copyRewrite}
                  className="text-[10px] text-white font-bold uppercase tracking-wider px-3 py-1.5 mac-btn-secondary flex items-center gap-1.5 cursor-pointer"
                >
                  {isRewriteCopied ? <Check className="w-3 h-3 text-systemGreen" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <p className="text-xs text-white bg-surface-raised border border-hairline rounded-mac-md p-4 leading-relaxed whitespace-pre-wrap">
                {result.rewriteSugerido}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
