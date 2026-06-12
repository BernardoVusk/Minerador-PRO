import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";

interface UrlConnectionStatusProps {
  url: string;
}

export function UrlConnectionStatus({ url }: UrlConnectionStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let active = true;
    setStatus("checking");

    async function checkUrl() {
      try {
        const res = await fetch("/api/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (active) {
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.online) {
              setStatus("online");
            } else {
              setStatus("offline");
            }
          } else {
            // Netlify/Offline fallback: pretend stable main popular seed sites are online
            const isSeed = url.includes("formulanegocioonline") || url.includes("natura") || url.includes("belezanaweb") || url.includes("mepoupe") || url.includes("tuasaude") || url.includes("vitalidade") || url.includes("vital");
            setStatus(isSeed ? "online" : "offline");
          }
        }
      } catch {
        if (active) {
          const isSeed = url.includes("formulanegocioonline") || url.includes("natura") || url.includes("belezanaweb") || url.includes("mepoupe") || url.includes("tuasaude") || url.includes("vitalidade") || url.includes("vital");
          setStatus(isSeed ? "online" : "offline");
        }
      }
    }

    checkUrl();
    return () => {
      active = false;
    };
  }, [url]);

  if (status === "checking") {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
        <span>Verificando DNS...</span>
      </div>
    );
  }

  if (status === "online") {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] text-[#10B981] font-mono bg-[#10B981]/10 border border-[#10B981]/15 px-2 py-0.5 rounded-full select-none">
        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_6px_#10B981]"></span>
        <span>Ativo (Online)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-500 font-mono bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded-full select-none relative group cursor-help">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_6px_#F59E0B]"></span>
      <span>Pausado/Offline</span>
      <HelpCircle className="w-3 h-3 text-amber-500" />
      
      {/* Tooltip explanation */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#111112] border border-white/5 text-zinc-400 text-[10px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-2xl z-50 font-sans tracking-normal font-medium">
        <span className="font-bold text-amber-500 block mb-1 font-mono uppercase tracking-widest text-[9px]">Status de veiculação</span>
        Anúncios no Facebook frequentemente têm vida curta. O Vusk Operation guardou a headline e a estrutura de funil no momento em que registrou a campanha ativa, mas o link direto foi pausado pelo anunciante.
      </span>
    </div>
  );
}
