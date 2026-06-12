import React, { useState } from "react";
import { 
  Users, Copy, Check, RotateCcw, Loader2, Sparkles, AlertCircle, Info, 
  ChevronRight, Package, Eye, ShieldAlert, HeartCrack, HelpCircle, 
  MessageSquareCode, Compass, DollarSign, Calendar, Landmark, MapPin, 
  Briefcase, Heart, Skull, Milestone, CheckCircle2, AlertTriangle, Zap,
  XCircle, CopyCheck
} from "lucide-react";

interface GatilhoEspecifico {
  nome: string;
  descricao: string;
  angulo_de_copy: string;
}

interface AttemptItem {
  tentativa: string;
  quanto_gastou: string;
  por_que_falhou: string;
  crenca_formada: string;
}

interface CultureItem {
  elemento: string;
  por_que_funciona?: string;
  por_que_repele?: string;
  como_usar?: string;
  alternativa?: string;
}

interface DossierData {
  produto: string;
  nicho: string;
  definicao_clinica: {
    titulo: string;
    descricao: string;
    gatilhos_especificos: GatilhoEspecifico[];
  };
  persona: {
    nome_ficticio: string;
    idade_range: string;
    genero: string;
    profissao: string;
    estado_civil: string;
    renda_mensal: string;
    onde_mora: string;
    rotina_destruida: string;
    momento_de_ruptura: string;
  };
  dor_latente: {
    dor_superficial: string;
    dor_real: string;
    dor_identitaria: string;
    vergonha_oculta: string;
  };
  falhas_do_mercado: {
    tentativas_anteriores: AttemptItem[];
    frustracao_acumulada: string;
  };
  fala_interna: {
    antes_de_dormir: string[];
    ao_acordar: string[];
    ao_ver_o_problema: string[];
    ao_ver_anuncio: string[];
  };
  medos_aterrorizantes: {
    medo_do_cenario_invisivel: { titulo: string; descricao: string; frase_de_copy: string };
    medo_social: { titulo: string; descricao: string; frase_de_copy: string };
    medo_de_dependencia: { titulo: string; descricao: string; frase_de_copy: string };
    medo_da_inacao: { titulo: string; descricao: string; frase_de_copy: string };
    medo_bonus: { titulo: string; descricao: string; frase_de_copy: string };
  };
  framework_cultural_br: {
    o_que_funciona: CultureItem[];
    o_que_evitar: CultureItem[];
    palavras_que_convertem: string[];
    palavras_que_afastam: string[];
  };
  arsenal_de_copy: {
    headlines_de_dor: string[];
    headlines_de_medo: string[];
    aberturas_de_vsl: string[];
    provas_sociais_ficticias: string[];
    cta_urgencia: string[];
  };
}

interface MockProduct {
  nome: string;
  nicho: string;
  promessa: string;
  problema: string;
  publico: string;
  preco: string;
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    nome: "Protocolo Detox 30 Dias",
    nicho: "emagrecimento",
    promessa: "Secar 7kg em 30 dias tomando 1 chá por dia",
    problema: "Gordura abdominal resistente que não sai com dieta tradicional",
    publico: "Mulheres 35-55 anos com metabolismo lento",
    preco: "R$19,90"
  },
  {
    nome: "Método Virilidade Plena",
    nicho: "saúde masculina",
    promessa: "Recuperar energia e libido em 21 dias com protocolo natural",
    problema: "Queda de disposition física e libido masculina com a idade",
    publico: "Homens 40-60 anos frustrados com cansaço crônico",
    preco: "R$27,00"
  },
  {
    nome: "Avaliador Recompensado",
    nicho: "renda extra",
    promessa: "Ganhar R$300/dia avaliando produtos internacionais pelo celular",
    problema: "Falta de renda complementar no fim do mês para pagar contas básicas",
    publico: "Pessoas comuns buscando renda extra sem sair de casa",
    preco: "R$9,90"
  },
  {
    nome: "LeadZap Automador",
    nicho: "SaaS",
    promessa: "Automar captação e envio de mensagens para 500 leads/dia 100% no piloto automático",
    problema: "Perda excessiva de tempo rodando processos manuais de vendas de forma lenta e ineficiente",
    publico: "Agências de marketing, donos de infoprodutos e assessores comerciais",
    preco: "R$47,00/mês"
  }
];

export function AudienceDossierPanel() {
  const [internalTab, setInternalTab] = useState<"manual" | "saved">("manual");
  
  // Fields state
  const [nome, setNome] = useState("");
  const [nicho, setNicho] = useState("emagrecimento");
  const [promessa, setPromessa] = useState("");
  const [problema, setProblema] = useState("");
  const [publico, setPublico] = useState("");
  const [preco, setPreco] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [dossier, setDossier] = useState<DossierData | null>(null);
  
  // Tracking copies feedback
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleSelectMock = async (prod: MockProduct) => {
    setNome(prod.nome);
    setNicho(prod.nicho);
    setPromessa(prod.promessa);
    setProblema(prod.problema);
    setPublico(prod.publico);
    setPreco(prod.preco);

    setInternalTab("manual");
    await generateDossier(prod);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !promessa.trim() || !problema.trim()) {
      setErrorText("Nome do produto, promessa principal e problema central são obrigatórios.");
      setStatus("error");
      return;
    }
    const current: MockProduct = {
      nome, nicho, promessa, problema, publico, preco
    };
    await generateDossier(current);
  };

  const generateDossier = async (prod: MockProduct) => {
    setStatus("loading");
    setErrorText("");

    try {
      const res = await fetch("/api/generate-audience-dossier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: prod.nome,
          nicho: prod.nicho,
          promessa: prod.promessa,
          problema: prod.problema,
          publico: prod.publico,
          preco: prod.preco
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro misterioso ao computar o dossiê.");
      }

      setDossier(data.dossier);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Erro de conexão com o servidor. Tente novamente.");
      setStatus("error");
    }
  };

  const handleCopySectionContent = (sectionId: string, plainText: string) => {
    navigator.clipboard.writeText(plainText.trim());
    setCopiedSection(sectionId);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  // Helper formatting for copies
  const getClinicaText = () => {
    if (!dossier) return "";
    let str = `--- DEFINIÇÃO CLÍNICA: ${dossier.definicao_clinica.titulo} ---\n\n`;
    str += `${dossier.definicao_clinica.descricao}\n\n`;
    str += `GATILHOS DE DETALHE:\n`;
    dossier.definicao_clinica.gatilhos_especificos.forEach((g, idx) => {
      str += `${idx + 1}. ${g.nome}\nDescrição: ${g.descricao}\nCopy Atack: "${g.angulo_de_copy}"\n\n`;
    });
    return str;
  };

  const getPersonaText = () => {
    if (!dossier) return "";
    return `--- PERSONA REVELADA: ${dossier.persona.nome_ficticio} ---\n
Demografia:
- Idade: ${dossier.persona.idade_range}
- Gênero: ${dossier.persona.genero}
- Profissão: ${dossier.persona.profissao}
- Estado Civil: ${dossier.persona.estado_civil}
- Renda Mensal: ${dossier.persona.renda_mensal}
- Onde mora: ${dossier.persona.onde_mora}\n
Rotina Destruída:
${dossier.persona.rotina_destruida}\n
Momento Crítico de Ruptura:
${dossier.persona.momento_de_ruptura}`;
  };

  const getDorText = () => {
    if (!dossier) return "";
    return `--- ANÁLISE PROFUNDA DE DOR ---\n
1. Dor Superficial (O que diz):
"${dossier.dor_latente.dor_superficial}"\n
2. Dor Real (O que sente):
"${dossier.dor_latente.dor_real}"\n
3. Dor Identitária (Reflexo de Autoimagem):
"${dossier.dor_latente.dor_identitaria}"\n
4. Vergonha Oculta (O segredo não compartilhado):
"${dossier.dor_latente.vergonha_oculta}"`;
  };

  const getFalhasText = () => {
    if (!dossier) return "";
    let str = `--- HISTÓRICO DE FALHAS DO MERCADO ---\n\n`;
    dossier.falhas_do_mercado.tentativas_anteriores.forEach((t, i) => {
      str += `TENTATIVA #${i + 1}: ${t.tentativa}\n- Gasto: ${t.quanto_gastou}\n- Motivo da Falha: ${t.por_que_falhou}\n- Crença resultante: "${t.crenca_formada}"\n\n`;
    });
    str += `Frustração Acumulada no Subconsciente:\n${dossier.falhas_do_mercado.frustracao_acumulada}`;
    return str;
  };

  const getFalasText = () => {
    if (!dossier) return "";
    let str = `--- MONÓLOGOS INTERNOS DO COMPRADOR ---\n\n`;
    str += `ANTES DE DORMIR:\n` + dossier.fala_interna.antes_de_dormir.map(f => `  - "${f}"`).join("\n") + "\n\n";
    str += `AO ACORDAR:\n` + dossier.fala_interna.ao_acordar.map(f => `  - "${f}"`).join("\n") + "\n\n";
    str += `AO CONFRONTAR O PROBLEMA (Espelho/Balança/Rotina):\n` + dossier.fala_interna.ao_ver_o_problema.map(f => `  - "${f}"`).join("\n") + "\n\n";
    str += `AO VER O ANÚNCIO DO PRODUTO:\n` + dossier.fala_interna.ao_ver_anuncio.map(f => `  - "${f}"`).join("\n");
    return str;
  };

  const getMedosText = () => {
    if (!dossier) return "";
    let str = `--- MEDOS VISCERAIS ATERRORIZANTES ---\n\n`;
    const m = dossier.medos_aterrorizantes;
    const items = [m.medo_do_cenario_invisivel, m.medo_social, m.medo_de_dependencia, m.medo_da_inacao, m.medo_bonus];
    items.forEach((item, i) => {
      str += `MEDO #${i + 1}: ${item.titulo}\nDescrição: ${item.descricao}\nCopy Pronta: "${item.frase_de_copy}"\n\n`;
    });
    return str;
  };

  const getCultureText = () => {
    if (!dossier) return "";
    let str = `--- FRAMEWORK CULTURAL BRASILEIRO ---\n\nO QUE FUNCIONA EM ALTA CONVERSÃO:\n`;
    dossier.framework_cultural_br.o_que_funciona.forEach(item => {
      str += `- ${item.elemento}\n  Por que converte: ${item.por_que_funciona}\n  Como usar: ${item.como_usar}\n\n`;
    });
    str += `O QUE DEVE SER EVITADO:\n`;
    dossier.framework_cultural_br.o_que_evitar.forEach(item => {
      str += `- ${item.elemento}\n  Por que repele: ${item.por_que_repele}\n  Alternativa: ${item.alternativa}\n\n`;
    });
    str += `Palavras de Alta Conversão: ${dossier.framework_cultural_br.palavras_que_convertem.join(", ")}\n\n`;
    str += `Palavras-gatilho de Bloqueio: ${dossier.framework_cultural_br.palavras_que_afastam.join(", ")}`;
    return str;
  };

  const getArsenalText = () => {
    if (!dossier) return "";
    let str = `--- ARSENAL COMPLETO DE COPY (PRONTO PARA CRIATIVOS) ---\n\n`;
    str += `HEADLINES DE DOR:\n` + dossier.arsenal_de_copy.headlines_de_dor.map((h, i) => `${i + 1}. "${h}"`).join("\n") + "\n\n";
    str += `HEADLINES DE MEDO:\n` + dossier.arsenal_de_copy.headlines_de_medo.map((h, i) => `${i + 1}. "${h}"`).join("\n") + "\n\n";
    str += `ABERTURAS HIPNÓTICAS DE VSL:\n` + dossier.arsenal_de_copy.aberturas_de_vsl.map((h, i) => `Opção ${i + 1}: "${h}"`).join("\n\n") + "\n\n";
    str += `PROVAS SOCIAIS INSPIRACIONAIS (ESTILO BRASILEIRO):\n` + dossier.arsenal_de_copy.provas_sociais_ficticias.map((h, i) => `Exemplo ${i + 1}:\n"${h}"`).join("\n\n") + "\n\n";
    str += `CHAMADAS PARA AÇÃO DE URGÊNCIA (LOW TICKET):\n` + dossier.arsenal_de_copy.cta_urgencia.map((h, i) => `${i + 1}. ${h}`).join("\n");
    return str;
  };

  const getDossierTotalText = () => {
    if (!dossier) return "";
    return `==========================================\n DOSSIÊ PSICOLÓGICO DE PÚBLICO: ${dossier.produto.toUpperCase()} \n==========================================\n\n`
      + getClinicaText() + "\n\n"
      + getPersonaText() + "\n\n"
      + getDorText() + "\n\n"
      + getFalhasText() + "\n\n"
      + getFalasText() + "\n\n"
      + getMedosText() + "\n\n"
      + getCultureText() + "\n\n"
      + getArsenalText();
  };

  const handleCopyBlock = (label: string, array: string[]) => {
    const formatted = array.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedSection(label);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleCopySingleText = (label: string, valStr: string) => {
    navigator.clipboard.writeText(valStr);
    setCopiedSection(label);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const resetForm = () => {
    setStatus("idle");
    setDossier(null);
    setErrorText("");
  };

  return (
    <div id="audience-dossier-panel" className="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2A2A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2A2A]"></span>
            </span>
            <span className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase">
              PSYCHOLOGICAL MAPPING ENGINE
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
            Dossiê Psicológico do Público-Alvo
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm mt-1 max-w-3xl font-medium leading-relaxed">
            Mapeie ganchos comportamentais clínicos e viscerais baseados nos maiores dores de seu prospecto brasileiro. Substitua objeções fracas por copy de alta conversão.
          </p>
        </div>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/20 border border-white/5 rounded-3xl min-h-[460px]">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
            <Users className="w-6 h-6 text-primary absolute animate-[pulse_1.5s_infinite]" />
          </div>
          <h3 className="text-sm font-sans font-extrabold text-zinc-100 uppercase tracking-widest">
            Decompondo Atitudes Humanas
          </h3>
          <p className="text-xs text-zinc-300 mt-2 font-mono text-center max-w-md px-4">
            Construindo dossiê psicológico visceral para "{nome || "seu produto"}"...
          </p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">
            Mapeando crenças limitantes e framework cultural BR. Isso pode levar alguns segundos.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="p-6 bg-[#1a0a0a] border border-[#FF2A2A]/20 rounded-3xl max-w-2xl mx-auto text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 bg-[#FF2A2A]/10 border border-[#FF2A2A]/20 text-[#FF2A2A] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider">Falha de Mapeamento</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{errorText}</p>
          </div>
          <button
            onClick={resetForm}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,42,0.3)] active:scale-95 cursor-pointer ml-auto mr-auto"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SELECTOR CARDS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-950/40 border border-white/5 p-1 rounded-2xl flex gap-1">
              <button
                type="button"
                onClick={() => setInternalTab("manual")}
                className={`flex-1 py-3 text-center rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  internalTab === "manual"
                    ? "bg-[#1f1f23] text-white border border-white/5"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Formulário Rápido
              </button>
              <button
                type="button"
                onClick={() => setInternalTab("saved")}
                className={`flex-1 py-3 text-center rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  internalTab === "saved"
                    ? "bg-[#1f1f23] text-white border border-white/5"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Produtos Salvos
              </button>
            </div>

            <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-2xl space-y-4 select-none">
              <div className="flex gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase font-mono text-zinc-200">
                    O Problema Clínico
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    Nossa IA decompõe o problema superficial em gatilhos específicos cruéis da rotina real. Se você entende o segredo vergonhoso do cliente, sua copy custa menos e converte 5x mais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMS BLOCK CONTAINER */}
          <div className="lg:col-span-8 bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl">
            {internalTab === "manual" ? (
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                      Nome do Produto <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Protocolo Detox 30 Dias"
                      className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                      Nicho <span className="text-primary">*</span>
                    </label>
                    <select
                      value={nicho}
                      onChange={(e) => setNicho(e.target.value)}
                      className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3.5 text-base text-white transition-all font-sans cursor-pointer"
                    >
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="saúde masculina">Saúde Masculina</option>
                      <option value="saúde e bem-estar">Saúde e Bem-Estar</option>
                      <option value="renda extra">Renda Extra</option>
                      <option value="relacionamento">Relacionamento</option>
                      <option value="finanças">Finanças</option>
                      <option value="beleza">Beleza</option>
                      <option value="SaaS">SaaS</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                    Promessa Principal <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    value={promessa}
                    onChange={(e) => setPromessa(e.target.value)}
                    placeholder="Ex: Emagrecer 7kg em 30 dias sem academia ou dietas malucas"
                    className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 transition-all font-sans min-h-[80px] resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                    Problema Central que Resolve <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    value={problema}
                    onChange={(e) => setProblema(e.target.value)}
                    placeholder="Ex: Gordura abdominal persistente que não some de jeito nenhum mesmo fechando a boca"
                    className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 transition-all font-sans min-h-[80px] resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                      Público-Alvo Inicial
                    </label>
                    <input
                      type="text"
                      value={publico}
                      onChange={(e) => setPublico(e.target.value)}
                      placeholder="Ex: Mulheres 35-55 anos com rotina corrida"
                      className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                      Preço do Produto (Ticket)
                    </label>
                    <input
                      type="text"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      placeholder="Ex: R$ 19,90"
                      className="w-full bg-[#141416] border border-white/5 focus:border-primary/50 focus:outline-none rounded-xl px-4 py-3 text-base text-white placeholder-zinc-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!nome.trim() || !promessa.trim() || !problema.trim() || status === "loading"}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer ${
                      !nome.trim() || !promessa.trim() || !problema.trim()
                        ? "bg-zinc-800 text-zinc-500 border border-transparent cursor-not-allowed"
                        : "bg-primary text-white border border-primary/20 shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_22px_rgba(255,42,42,0.5)] active:scale-95"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span>Gerar Dossiê Psicológico</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-mono text-zinc-200 uppercase tracking-wide">
                    Escolha de Produtos Rápidos
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Demonstre a ferramenta selecionando um dos produtos pré-avaliados. O dossiê é gerado em tempo recorde.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {MOCK_PRODUCTS.map((prod, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectMock(prod)}
                      className="p-4 bg-zinc-900/60 hover:bg-[#1f1f23]/60 border border-white/5 hover:border-primary/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all active:scale-[0.99] select-none text-left"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary shrink-0" />
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{prod.nome}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-mono font-bold text-primary uppercase">
                            {prod.nicho}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 font-sans line-clamp-1">
                          <strong className="text-zinc-400 text-[10px] font-mono uppercase">Promessa:</strong> "{prod.promessa}"
                        </p>
                        <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                          <strong className="text-zinc-400 text-[10px] font-mono uppercase">Problema:</strong> "{prod.problema}"
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end md:self-center text-primary font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
                        <span>Analisar Agora</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* PROMOTION PREVIEW FOOTER */}
                <div className="p-4 bg-primary/5 border border-primary/15 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-left space-y-0.5">
                    <p className="text-[11px] font-bold uppercase text-white font-mono tracking-wider">
                      Ficha de Oferta Em Breve
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans font-medium">
                      Em breve você poderá cadastrar seus produtos na Ficha de Oferta do Vusk Operation e salvá-los permanentemente no banco para geração recorrente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {status === "success" && dossier && (
        <div className="space-y-8 animate-fade-in text-left">
          {/* FLOATING ACTION RESULT OVERVIEW BAR */}
          <div className="bg-[#101012]/80 border border-white/5 p-4 md:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl">
            <div>
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest block mb-0.5">
                DOSSIÊ CLÍNICO ATIVO
              </span>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight">{dossier.produto}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-mono font-bold text-primary uppercase select-none">
                  {dossier.nicho}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Formato: Dossiê Psicológico de Resposta Direta • Elaborado por Inteligência Artificial
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCopySectionContent("total", getDossierTotalText())}
                className={`px-4 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer active:scale-95 ${
                  copiedSection === "total"
                    ? "bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-[#141416] hover:bg-zinc-900 border border-white/5 hover:border-white/10 text-white"
                }`}
              >
                {copiedSection === "total" ? (
                  <>
                    <CopyCheck className="w-3.5 h-3.5" />
                    <span>Dossiê Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Dossiê Completo</span>
                  </>
                )}
              </button>

              <button
                onClick={resetForm}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-white/5 text-zinc-400 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span>Analisar Outra Oferta</span>
              </button>
            </div>
          </div>

          {/* SEÇÃO 1 — DEFINIÇÃO CLÍNICA */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔬</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 1 — Definição Clínica
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("clinica", getClinicaText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "clinica" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-extrabold text-[#ededef] tracking-tight">
                {dossier.definicao_clinica.titulo}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-5xl font-medium">
                {dossier.definicao_clinica.descricao}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {dossier.definicao_clinica.gatilhos_especificos.map((gat, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-900/40 hover:bg-[#141416]/50 border border-white/5 hover:border-primary/20 transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono font-bold text-primary block uppercase tracking-wider">
                      GATILHO #{i + 1}
                    </span>
                    <h4 className="text-sm font-extrabold text-white tracking-snug">{gat.nome}</h4>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">{gat.descricao}</p>
                  </div>
                  
                  <div className="bg-[#141416] p-3 rounded-xl border border-white/[0.03] text-left">
                    <span className="text-[8px] font-mono font-extrabold text-primary uppercase block tracking-wider mb-1">
                      ÂNGULO DE COPY SUGERIDO:
                    </span>
                    <p className="text-xs text-zinc-300 italic font-sans font-medium line-clamp-2">
                      "{gat.angulo_de_copy}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 2 — PERSONA & ROTINA DESTRUÍDA */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👤</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 2 — Persona Mapeada
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("persona", getPersonaText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "persona" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column Profile metadata */}
              <div className="lg:col-span-4 bg-[#141416] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-xl font-extrabold select-none">
                  {dossier.persona.nome_ficticio.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">{dossier.persona.nome_ficticio}</h4>
                  <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    REPRESENTANTE GERAL
                  </p>
                </div>

                <div className="w-full border-t border-white/[0.05] pt-3 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">IDADE:</span>
                    <span className="text-zinc-300 font-bold">{dossier.persona.idade_range}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">GÊNERO:</span>
                    <span className="text-zinc-300 font-bold">{dossier.persona.genero}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">OCUPAÇÃO:</span>
                    <span className="text-zinc-300 font-bold">{dossier.persona.profissao}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">ESTADO CIVIL:</span>
                    <span className="text-zinc-300 font-bold">{dossier.persona.estado_civil}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">RENDA ESTIM.:</span>
                    <span className="text-zinc-300 font-bold">{dossier.persona.renda_mensal}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-mono font-bold uppercase tracking-wide">LOCALIDADE:</span>
                    <span className="text-[#96969a] font-bold line-clamp-1">{dossier.persona.onde_mora}</span>
                  </div>
                </div>
              </div>

              {/* Right Column details */}
              <div className="lg:col-span-8 text-left space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-extrabold text-primary uppercase tracking-widest block select-none">
                    A ROTINA DESTRUÍDA
                  </span>
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/[0.02] text-xs sm:text-sm text-zinc-300 leading-relaxed italic font-sans font-medium">
                    "{dossier.persona.rotina_destruida}"
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-extrabold text-primary uppercase tracking-widest block select-none">
                    O MOMENTO DE RUPTURA (GATILHO DE COMPRA)
                  </span>
                  <div className="border-l-2 border-primary pl-4 py-2 text-xs sm:text-sm text-zinc-150 leading-relaxed font-sans font-semibold">
                    {dossier.persona.momento_de_ruptura}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3 — DOR LATENTE */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💔</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 3 — A Dor Latente
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("dor", getDorText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "dor" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Dor Superficial */}
              <div className="bg-zinc-900/50 hover:bg-[#141416]/50 border border-white/5 p-4 rounded-2xl text-left flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase select-none">
                    DOR SUPERFICIAL
                  </span>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">O que ela diz verbalmente</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  "{dossier.dor_latente.dor_superficial}"
                </p>
              </div>

              {/* Card 2: Dor Real */}
              <div className="bg-zinc-900/50 hover:bg-[#141416]/50 border border-white/5 p-4 rounded-2xl text-left flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-red-500/10 border border-red-500/20 text-red-400 uppercase select-none">
                    DOR REAL
                  </span>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">O que realmente sente no íntimo</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  "{dossier.dor_latente.dor_real}"
                </p>
              </div>

              {/* Card 3: Dor Identitária */}
              <div className="bg-zinc-900/50 hover:bg-[#141416]/50 border border-white/5 p-4 rounded-2xl text-left flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase select-none">
                    DOR IDENTITÁRIA
                  </span>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">Como se enxerga como pessoa</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  "{dossier.dor_latente.dor_identitaria}"
                </p>
              </div>

              {/* Card 4: Vergonha Oculta */}
              <div className="bg-zinc-900/50 hover:bg-[#141416]/50 border border-white/5 p-4 rounded-2xl text-left flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-zinc-600/10 border border-white/5 text-zinc-300 uppercase select-none">
                    VERGONHA OCULTA
                  </span>
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">O que não confia a ninguém</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                  "{dossier.dor_latente.vergonha_oculta}"
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4 — FALHAS DO MERCADO */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚠️</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 4 — O Ciclo de Erros e Falhas do Mercado
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("falhas", getFalhasText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "falhas" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            {/* vertical timeline layout */}
            <div className="relative pl-6 sm:pl-8 space-y-6 text-left border-l border-primary/20">
              {dossier.falhas_do_mercado.tentativas_anteriores.map((tent, i) => (
                <div key={i} className="relative">
                  {/* Circle locator icon */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border border-primary bg-zinc-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                    <span className="w-1.5 h-1.5 bg-primary absolute rounded-full"></span>
                  </span>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                      <h4 className="text-sm font-extrabold text-white font-sans uppercase">
                        {i + 1}. {tent.tentativa}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold font-mono uppercase tracking-wider self-start sm:self-center">
                        Custo Estimado: {tent.quanto_gastou}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium leading-relaxed font-sans">
                      <div>
                        <span className="text-[9px] font-mono font-extrabold text-[#94949a] tracking-wider uppercase block">
                          POR QUE FALHOU DE VERDADE:
                        </span>
                        <p className="text-zinc-400 mt-0.5">{tent.por_que_falhou}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-extrabold text-[#94949a] tracking-wider uppercase block">
                          CRENÇA LIMITANTE QUE ESTABELECEU:
                        </span>
                        <p className="text-zinc-300 italic mt-0.5 font-semibold">"{tent.crenca_formada}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Frustração acumulada */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 text-left space-y-1 mt-4">
              <span className="text-[9px] font-mono font-extrabold text-primary uppercase tracking-widest block select-none">
                FRUSTRAÇÃO ACUMULADA NO SUBCONSCIENTE
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {dossier.falhas_do_mercado.frustracao_acumulada}
              </p>
            </div>
          </section>

          {/* SEÇÃO 5 — FALA INTERNA RECORRENTE */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💬</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 5 — Diálogos e Pensamentos Internos
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("falas", getFalasText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "falas" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Antes de Dormir */}
              <div className="bg-[#141416]/60 border border-white/5 rounded-2xl p-4 space-y-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌙</span>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Antes de Dormir (Escuridão)
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-400 font-medium italic">
                  {dossier.fala_interna.antes_de_dormir.map((f, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-primary font-mono select-none">"</span>
                      <span>{f}</span>
                      <span className="text-primary font-mono select-none">"</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ao Acordar */}
              <div className="bg-[#141416]/60 border border-white/5 rounded-2xl p-4 space-y-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base">☀️</span>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Ao Acordar (Fadiga)
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-400 font-medium italic">
                  {dossier.fala_interna.ao_acordar.map((f, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-primary font-mono select-none">"</span>
                      <span>{f}</span>
                      <span className="text-primary font-mono select-none">"</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ao Ver o Problema */}
              <div className="bg-[#141416]/60 border border-white/5 rounded-2xl p-4 space-y-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base">🪞</span>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Ao Confrontar o Problema
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-400 font-medium italic">
                  {dossier.fala_interna.ao_ver_o_problema.map((f, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-primary font-mono select-none">"</span>
                      <span>{f}</span>
                      <span className="text-primary font-mono select-none">"</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ao ver o anuncio */}
            <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-left space-y-2">
              <span className="text-[9px] font-mono font-extrabold text-primary uppercase tracking-widest block select-none">
                RELAÇÃO E CRÍTICA AO VER O ANÚNCIO DE SEU PRODUTO
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dossier.fala_interna.ao_ver_anuncio.map((f, i) => (
                  <div key={i} className="bg-zinc-950/30 p-3 rounded-xl border border-white/[0.02]">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold block mb-1">REAGENTE DE COMPRA #{i + 1}</span>
                    <p className="text-xs text-zinc-300 italic font-sans font-medium">"{f}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO 6 — MEDOS ATERRORIZANTES */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">😨</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 6 — Os 5 Medos Aterrorizantes e Viscerais
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("medos", getMedosText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "medos" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { emoji: "🌘", id: "invisivel", ...dossier.medos_aterrorizantes.medo_do_cenario_invisivel },
                { emoji: "🗣️", id: "social", ...dossier.medos_aterrorizantes.medo_social },
                { emoji: "🧬", id: "dependencia", ...dossier.medos_aterrorizantes.medo_de_dependencia },
                { emoji: "⌛", id: "inacao", ...dossier.medos_aterrorizantes.medo_da_inacao },
                { emoji: "💥", id: "bonus", ...dossier.medos_aterrorizantes.medo_bonus }
              ].map((m, idx) => (
                <div 
                  key={idx} 
                  className="bg-zinc-900/50 hover:bg-[#141416]/50 border border-white/5 hover:border-[#FF2A2A]/45 hover:-translate-y-1 transition-all duration-300 p-4 rounded-2xl flex flex-col justify-between text-left space-y-4"
                >
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-lg select-none">{m.emoji}</span>
                      <span className="text-[8px] font-mono font-bold bg-[#141416] px-2 py-0.5 rounded border border-white/5 text-zinc-500">
                        MEDO #{idx + 1}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-sans">{m.titulo}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{m.descricao}</p>
                  </div>

                  <div className="bg-[#141416] p-3 rounded-xl border border-white/[0.03] space-y-1 text-left">
                    <span className="text-[8px] font-mono font-extrabold text-primary uppercase block tracking-wider">
                      COPY COMPORTAMENTAL:
                    </span>
                    <p className="text-[11px] text-[#ededef] italic font-medium leading-relaxed">
                      "{m.frase_de_copy}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 7 — FRAMEWORK CULTURAL BR */}
          <section className="bg-zinc-950/40 border border-white/5 p-5 md:p-6 rounded-3xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🇧🇷</span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Seção 7 — Framework Comportamental BR
                </span>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("culture", getCultureText())}
                className="text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "culture" ? "Copiado! ✓" : "Copiar Seção"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* O que funciona */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 uppercase select-none">
                    O QUE FUNCIONA EM ALTA CONVERSÃO
                  </span>
                </div>

                <div className="space-y-3">
                  {dossier.framework_cultural_br.o_que_funciona.map((item, i) => (
                    <div key={i} className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-2xl text-left space-y-1">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">{item.elemento}</h4>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        <strong className="text-zinc-300 font-medium">Por que converte:</strong> {item.por_que_funciona}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-sans leading-relaxed">
                        <strong className="text-emerald-500/80 font-semibold uppercase font-mono text-[9px] tracking-wider block">Como operacionalizar em copy:</strong> "{item.como_usar}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* O que evitar */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF2A2A]/10 border border-[#FF2A2A]/20 text-[10px] font-mono font-bold text-[#FF2A2A] uppercase select-none">
                    O QUE EVITAR DE QUALQUER MANEIRA
                  </span>
                </div>

                <div className="space-y-3">
                  {dossier.framework_cultural_br.o_que_evitar.map((item, i) => (
                    <div key={i} className="p-3 bg-[#FF2A2A]/5 border border-[#FF2A2A]/10 rounded-2xl text-left space-y-1">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">{item.elemento}</h4>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        <strong className="text-zinc-300 font-medium font-sans">Por que destrói vendas:</strong> {item.por_que_repele}
                      </p>
                      <p className="text-[11px] text-[#FF2A2A] font-sans leading-relaxed">
                        <strong className="text-red-500/80 font-semibold uppercase font-mono text-[9px] tracking-wider block">O que fazer no lugar (Alternativa):</strong> {item.alternativa}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags de Palavras do Vocabulário do Prospecto */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="text-left space-y-2">
                <span className="text-[9px] font-mono font-extrabold text-[#a2a2a6] uppercase tracking-widest block">
                  VOCABULÁRIO DE CONEXÃO: PALAVRAS QUE ABREM A CARTEIRA
                </span>
                <div className="flex flex-wrap gap-2">
                  {dossier.framework_cultural_br.palavras_que_convertem.map((pal, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-xs font-medium font-sans bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg select-all"
                    >
                      {pal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left space-y-2">
                <span className="text-[9px] font-mono font-extrabold text-[#a2a2a6] uppercase tracking-widest block">
                  ALERTA VERMELHO: PALAVRAS QUE REPELEM E CRIAM SKEPTICISMO
                </span>
                <div className="flex flex-wrap gap-2">
                  {dossier.framework_cultural_br.palavras_que_afastam.map((pal, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-xs font-medium font-sans bg-zinc-800 border border-white/5 text-zinc-400 line-through rounded-lg select-all"
                    >
                      {pal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 8 — ARSENAL DE COPY (bônus com container destacado) */}
          <section className="bg-zinc-950/60 border border-white/10 p-5 md:p-6 rounded-3xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎁</span>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-white block">
                    Seção 8 — Arsenal Recomendado de Copy
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase select-none">
                    BÔNUS PRONTO PARA COPIAR E TESTAR
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleCopySectionContent("arsenal", getArsenalText())}
                className={`px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
                  copiedSection === "arsenal"
                    ? "bg-emerald-600/10 text-emerald-400"
                    : "text-zinc-400 hover:text-white bg-zinc-900 border border-white/5"
                }`}
              >
                {copiedSection === "arsenal" ? "Copiado! ✓" : "Copiar Arsenal Completo"}
              </button>
            </div>

            {/* BLOCK 1: headlines de dor */}
            <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 relative text-left">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-wide">
                  🔥 Headlines de Dor Extrema
                </span>
                <button
                  onClick={() => handleCopyBlock("headlines_dor", dossier.arsenal_de_copy.headlines_de_dor)}
                  className="px-2.5 py-1 text-[9px] font-mono uppercase border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-colors rounded text-zinc-400 hover:text-white cursor-pointer"
                >
                  {copiedSection === "headlines_dor" ? "Copiado! ✓" : "Copiar"}
                </button>
              </div>
              <ol className="space-y-2 text-xs sm:text-sm text-zinc-300 font-semibold leading-relaxed font-sans">
                {dossier.arsenal_de_copy.headlines_de_dor.map((item, id) => (
                  <li key={id} className="p-3 bg-zinc-950/20 rounded-xl border border-white/[0.02]">
                    <strong className="text-primary font-mono text-xs mr-1 rounded mr-2 bg-primary/5 px-2 py-0.5">#{id + 1}</strong> "{item}"
                  </li>
                ))}
              </ol>
            </div>

            {/* BLOCK 2: headlines de medo */}
            <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 relative text-left">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-wide">
                  😨 Headlines Atacando o Medo Futuro
                </span>
                <button
                  onClick={() => handleCopyBlock("headlines_medo", dossier.arsenal_de_copy.headlines_de_medo)}
                  className="px-2.5 py-1 text-[9px] font-mono uppercase border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-colors rounded text-zinc-400 hover:text-white cursor-pointer"
                >
                  {copiedSection === "headlines_medo" ? "Copiado! ✓" : "Copiar"}
                </button>
              </div>
              <ol className="space-y-2 text-xs sm:text-sm text-zinc-300 font-semibold leading-relaxed font-sans">
                {dossier.arsenal_de_copy.headlines_de_medo.map((item, id) => (
                  <li key={id} className="p-3 bg-zinc-950/20 rounded-xl border border-white/[0.02]">
                    <strong className="text-primary font-mono text-xs mr-1 rounded mr-2 bg-primary/5 px-2 py-0.5">#{id + 1}</strong> "{item}"
                  </li>
                ))}
              </ol>
            </div>

            {/* BLOCK 3: aberturas de vsl */}
            <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 relative text-left">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-wide">
                  📢 Ganchos de Abertura para VSL
                </span>
                <button
                  onClick={() => handleCopyBlock("aberturas_vsl", dossier.arsenal_de_copy.aberturas_de_vsl)}
                  className="px-2.5 py-1 text-[9px] font-mono uppercase border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-colors rounded text-zinc-400 hover:text-white cursor-pointer"
                >
                  {copiedSection === "aberturas_vsl" ? "Copiado! ✓" : "Copiar"}
                </button>
              </div>
              <div className="space-y-4 font-sans leading-relaxed text-xs sm:text-sm text-zinc-300">
                {dossier.arsenal_de_copy.aberturas_de_vsl.map((item, id) => (
                  <div key={id} className="p-3 bg-zinc-950/20 rounded-xl border border-white/[0.02] space-y-1">
                    <span className="text-[9px] font-mono text-primary font-bold tracking-widest block uppercase">GANCHO #{id + 1}</span>
                    <p className="italic font-medium">"{item}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* BLOCK 4: Provas Sociais */}
              <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 relative text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-wide">
                      ✅ Conversas e Depoimentos (WhatsApp Style)
                    </span>
                    <button
                      onClick={() => handleCopyBlock("provas_sociais", dossier.arsenal_de_copy.provas_sociais_ficticias)}
                      className="px-2.5 py-1 text-[9px] font-mono uppercase border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-colors rounded text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedSection === "provas_sociais" ? "Copiado! ✓" : "Copiar"}
                    </button>
                  </div>
                  <div className="space-y-3 font-sans leading-relaxed text-xs text-zinc-300">
                    {dossier.arsenal_de_copy.provas_sociais_ficticias.map((item, id) => (
                      <div key={id} className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.02]" style={{ contentVisibility: "auto" }}>
                        <p className="italic">"{item}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCK 5: CTAs urgência */}
              <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 relative text-left flex flex-col justify-betweenGranular">
                <div className="space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-wide">
                      ⚡ CTAs com Urgência e Garantias (Low Ticket)
                    </span>
                    <button
                      onClick={() => handleCopyBlock("cta_urgencia", dossier.arsenal_de_copy.cta_urgencia)}
                      className="px-2.5 py-1 text-[9px] font-mono uppercase border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-colors rounded text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedSection === "cta_urgencia" ? "Copiado! ✓" : "Copiar"}
                    </button>
                  </div>
                  <ul className="space-y-2 font-mono text-xs text-zinc-300 leading-relaxed">
                    {dossier.arsenal_de_copy.cta_urgencia.map((item, id) => (
                      <li key={id} className="p-2.5 bg-zinc-950/40 rounded-xl border border-white/[0.02] flex gap-2.5 items-start">
                        <span className="text-primary font-bold">▶</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
