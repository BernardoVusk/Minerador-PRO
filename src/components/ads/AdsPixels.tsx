import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Code2,
  Copy,
  ListChecks,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAdsData } from "../../hooks/useAdsData";

interface PixelRow {
  id: string;
  operator: string;
  name: string | null;
  fb_pixel_id: string;
  fb_account_id: string | null;
  status: string | null;
  last_event_at: string | null;
  created_at: string;
}

interface PixelFormState {
  name: string;
  fb_pixel_id: string;
  fb_account_id: string;
}

const EMPTY_FORM: PixelFormState = {
  name: "",
  fb_pixel_id: "",
  fb_account_id: ""
};

const NATIVE_PIXEL_CHECKLIST = [
  "Hotmart — cole o mesmo Pixel ID nas configurações de Pixel/Facebook do produto.",
  "Kiwify — cole o mesmo Pixel ID nas integrações de pixel da oferta.",
  "Wiapy — cole o mesmo Pixel ID nas configurações de checkout/pixel.",
  "Lowify — cole o mesmo Pixel ID nas configurações de pixel da plataforma."
];

function formatLastEvent(lastEventAt: string | null): string {
  if (!lastEventAt) return "Nunca";
  return new Date(lastEventAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function buildSnippet(fbPixelId: string): string {
  return `<!-- Vusk Operation — Pixel Meta + Tracking Snippet -->
<script>
  (function () {
    var FB_PIXEL_ID = '${fbPixelId}';

    // Pixel base do Meta
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_PIXEL_ID);
    fbq('track', 'PageView');

    // Helpers
    function getCookie(name) {
      var match = document.cookie.match('(^|;)\\\\s*' + name + '\\\\s*=\\\\s*([^;]+)');
      return match ? decodeURIComponent(match.pop()) : null;
    }

    var params = new URLSearchParams(window.location.search);
    var utm_source = params.get('utm_source');
    var utm_medium = params.get('utm_medium');
    var utm_campaign = params.get('utm_campaign');
    var utm_content = params.get('utm_content');
    var utm_term = params.get('utm_term');

    var fbp = getCookie('_fbp');
    var fbc = getCookie('_fbc');
    var event_id = crypto.randomUUID();

    fetch('/api/track/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: event_id,
        event_name: 'PageView',
        fb_pixel_id: FB_PIXEL_ID,
        url: window.location.href,
        utm_source: utm_source,
        utm_medium: utm_medium,
        utm_campaign: utm_campaign,
        utm_content: utm_content,
        utm_term: utm_term,
        fbp: fbp,
        fbc: fbc
      })
    });
  })();
</script>`;
}

interface PixelFormModalProps {
  initial: PixelFormState;
  isEdit: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (form: PixelFormState) => Promise<void>;
}

function PixelFormModal({ initial, isEdit, saving, onClose, onSave }: PixelFormModalProps) {
  const [form, setForm] = useState<PixelFormState>(initial);
  const [errorInput, setErrorInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");

    const trimmedPixelId = form.fb_pixel_id.trim();
    if (!trimmedPixelId) {
      setErrorInput("Pixel ID (Meta) é obrigatório.");
      return;
    }

    try {
      await onSave({ ...form, fb_pixel_id: trimmedPixelId, name: form.name.trim() });
    } catch (err: any) {
      setErrorInput(err.message || "Erro desconhecido ao salvar o pixel.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050506]/92 backdrop-blur-md cursor-pointer"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg mac-card rounded-mac-lg overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col max-h-[85vh]"
      >
        <div className="h-1 bg-gradient-to-r from-red-500 via-primary to-orange-500" />

        <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface-base">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEdit ? "Editar Pixel" : "Novo Pixel"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          {errorInput && (
            <div className="p-3.5 rounded-mac-md bg-systemRed/10 border border-systemRed/25 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-systemRed shrink-0 mt-0.5" />
              <div className="text-[11px] text-red-200 leading-normal font-medium">{errorInput}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Pixel Curso Tráfego Pago"
              className="w-full mac-input px-3 py-2.5 rounded-mac-sm text-xs font-sans outline-none"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
              Pixel ID (Meta) <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={form.fb_pixel_id}
              onChange={(e) => setForm((f) => ({ ...f, fb_pixel_id: e.target.value }))}
              placeholder="Ex: 1234567890123456"
              className="w-full mac-input px-3 py-2.5 rounded-mac-sm text-xs font-sans outline-none"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
              ID da Conta de Anúncios
            </label>
            <input
              type="text"
              value={form.fb_account_id}
              onChange={(e) => setForm((f) => ({ ...f, fb_account_id: e.target.value }))}
              placeholder="Ex: act_1234567890"
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
                <Check className="w-3.5 h-3.5" /> {isEdit ? "Salvar Alterações" : "Criar Pixel"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface SnippetPanelProps {
  pixel: PixelRow;
}

function SnippetPanel({ pixel }: SnippetPanelProps) {
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(pixel.fb_pixel_id);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard pode falhar (permissão/contexto inseguro) — sem efeito além de não copiar.
    }
  }, [snippet]);

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
              Snippet de Tracking
            </h4>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-systemGreen" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copiar
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-ink-tertiary font-semibold">
          Cole este bloco na página (Google AI Studio, etc). Ele inicializa o pixel Meta,
          captura UTMs e cookies _fbp/_fbc, gera um event_id para dedup e envia para{" "}
          <code className="font-mono text-ink-secondary">/api/track/collect</code>.
        </p>
        <pre className="w-full overflow-x-auto bg-surface-base border border-hairline rounded-mac-sm p-3.5 text-[10.5px] font-mono text-ink-secondary leading-relaxed whitespace-pre">
          {snippet}
        </pre>
      </div>

      <div className="space-y-2 pt-3 border-t border-hairline">
        <div className="flex items-center gap-2">
          <ListChecks className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
            Cadastrar nativamente também
          </h4>
        </div>
        <ul className="space-y-1.5">
          {NATIVE_PIXEL_CHECKLIST.map((item) => (
            <li key={item} className="text-[10.5px] text-ink-secondary font-semibold flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AdsPixels() {
  const { useAdsTable } = useAdsData();
  const pixelsTable = useAdsTable<PixelRow>("pixels");

  const [pixels, setPixels] = useState<PixelRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPixel, setEditingPixel] = useState<PixelRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPixels = useCallback(async () => {
    setIsLoading(true);
    const res = await pixelsTable.list("*", (q) => q.order("created_at", { ascending: false }));
    if (res.success) {
      setPixels(res.data);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [pixelsTable]);

  useEffect(() => {
    loadPixels();
  }, [loadPixels]);

  const openCreateForm = () => {
    setEditingPixel(null);
    setIsFormOpen(true);
  };

  const openEditForm = (pixel: PixelRow) => {
    setEditingPixel(pixel);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPixel(null);
  };

  const handleSave = async (form: PixelFormState) => {
    setIsSaving(true);
    setError(null);
    try {
      const values: Partial<PixelRow> = {
        name: form.name || null,
        fb_pixel_id: form.fb_pixel_id,
        fb_account_id: form.fb_account_id || null
      };

      const res = editingPixel
        ? await pixelsTable.update(editingPixel.id, values)
        : await pixelsTable.insert(values);

      if (!res.success) throw new Error(res.error);

      closeForm();
      await loadPixels();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pixel: PixelRow) => {
    const confirmed = window.confirm(
      `Excluir o pixel "${pixel.name || pixel.fb_pixel_id}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(pixel.id);
    setError(null);
    try {
      const res = await pixelsTable.remove(pixel.id);
      if (!res.success) throw new Error(res.error);
      if (expandedId === pixel.id) setExpandedId(null);
      await loadPixels();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir pixel.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (pixelId: string) => {
    setExpandedId((current) => (current === pixelId ? null : pixelId));
  };

  const formInitial: PixelFormState = editingPixel
    ? {
        name: editingPixel.name || "",
        fb_pixel_id: editingPixel.fb_pixel_id,
        fb_account_id: editingPixel.fb_account_id || ""
      }
    : EMPTY_FORM;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase text-ink-tertiary tracking-wider font-mono">
          {pixels.length} pixel{pixels.length === 1 ? "" : "s"}
        </span>
        <button
          onClick={openCreateForm}
          className="px-3.5 py-2 bg-primary hover:bg-red-650 text-white text-[11px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Pixel
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
          Carregando pixels...
        </div>
      ) : pixels.length === 0 ? (
        <div className="mac-card rounded-mac-lg p-12 flex flex-col items-center justify-center text-center gap-2 select-none">
          <Target className="w-6 h-6 text-ink-tertiary" />
          <span className="text-xs text-ink-secondary font-sans font-semibold">
            Nenhum pixel cadastrado. Clique em "Novo Pixel".
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
                    <th className="px-4 py-3">Pixel ID</th>
                    <th className="px-4 py-3">Conta de Anúncios</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Último Evento</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-ink-secondary">
                  {pixels.map((pixel) => (
                    <React.Fragment key={pixel.id}>
                      <tr className="hover:bg-surface-raised/50 transition-all">
                        <td className="px-4 py-3.5 font-bold text-white">{pixel.name || "—"}</td>
                        <td className="px-4 py-3.5 font-mono">{pixel.fb_pixel_id}</td>
                        <td className="px-4 py-3.5 font-mono">{pixel.fb_account_id || "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase text-ink-tertiary">
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" />
                            {pixel.status || "unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono">{formatLastEvent(pixel.last_event_at)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleExpanded(pixel.id)}
                              title="Ver snippet"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                              {expandedId === pixel.id ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <Code2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditForm(pixel)}
                              title="Editar pixel"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(pixel)}
                              disabled={deletingId === pixel.id}
                              title="Excluir pixel"
                              className="p-1.5 rounded-mac-sm text-ink-secondary hover:text-systemRed hover:bg-systemRed/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === pixel.id && (
                        <tr>
                          <td colSpan={6} className="bg-surface-base/60 p-0">
                            <SnippetPanel pixel={pixel} />
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
            {pixels.map((pixel) => (
              <div key={pixel.id} className="mac-card rounded-mac-lg overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{pixel.name || "—"}</p>
                      <p className="text-[10px] font-mono text-ink-tertiary truncate">{pixel.fb_pixel_id}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase text-ink-tertiary shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" />
                      {pixel.status || "unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-ink-tertiary">{pixel.fb_account_id || "—"}</span>
                    <span className="font-mono text-ink-tertiary">{formatLastEvent(pixel.last_event_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                    <button
                      onClick={() => toggleExpanded(pixel.id)}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Code2 className="w-3 h-3" />
                      Snippet
                      {expandedId === pixel.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditForm(pixel)}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-primary/40 hover:text-white text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(pixel)}
                      disabled={deletingId === pixel.id}
                      className="flex-1 px-3 py-2 bg-surface-base border border-hairline hover:border-systemRed/40 hover:text-systemRed disabled:opacity-40 disabled:cursor-not-allowed text-ink-secondary text-[10px] font-bold rounded-mac-sm transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
                {expandedId === pixel.id && (
                  <div className="border-t border-hairline">
                    <SnippetPanel pixel={pixel} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {isFormOpen && (
        <PixelFormModal
          initial={formInitial}
          isEdit={!!editingPixel}
          saving={isSaving}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
