import { OfferHit } from "../types";

export const SIMULATED_OFFERS_DB: Record<string, Array<{
  url: string;
  title: string;
  nicho: string;
  type: string;
  score: number;
  rank: string;
}>> = {
  utmify: [
    { url: "https://metodoratodecomisao.com", title: "Rato de Comissão - Método Secreto de Comissões Rápidas", nicho: "renda_extra", type: "VSL", score: 15, rank: "S" },
    { url: "https://protocolofigadogordo.com", title: "Protocolo Fígado Saudável: Reverta Acúmulo de Gordura Naturalmente com Chás", nicho: "emagrecimento", type: "QUIZ", score: 14, rank: "S" },
    { url: "https://desafiodas3semanas.online", title: "Desafio 21 Dias Emagrecimento Extra - Guia de Nutrição Termogênica", nicho: "emagrecimento", type: "LOW_TICKET", score: 13, rank: "S" },
    { url: "https://rendarapitasegredo.com", title: "Lucrando com Inteligência Artificial no Celular - Método Prático", nicho: "renda_extra", type: "VSL", score: 12, rank: "A" }
  ],
  hotmart: [
    { url: "https://formulanegocioonline.com", title: "Fórmula Negócio Online - O Maior Treinamento do Mercado", nicho: "renda_extra", type: "VSL", score: 14, rank: "S" },
    { url: "https://segredosdaaudiencia.com.br", title: "Mentoria Segredos da Audiência - Tráfego Orgânico e Pago", nicho: "renda_extra", type: "DIRECT_SALES", score: 13, rank: "S" },
    { url: "https://viverdeblog.com", title: "Como Criar um Blog de Sucesso de Alto Giro com SEO Inteligente", nicho: "renda_extra", type: "LOW_TICKET", score: 12, rank: "S" }
  ],
  kiwify: [
    { url: "https://tiagoorganico.com.br", title: "Protocolo Vitalidade Verde Completo com Tiago Orgânico", nicho: "saude_bem_estar", type: "VSL", score: 12, rank: "A" },
    { url: "https://financeone.com.br", title: "O Segredo do Investimento Acelerado - Portal Finance One", nicho: "financas", type: "QUIZ", score: 11, rank: "A" },
    { url: "https://mepoupe.com", title: "Desfudendo suas Finanças Pessoais com Canal Me Poupe", nicho: "financas", type: "LOW_TICKET", score: 13, rank: "S" }
  ],
  eduzz: [
    { url: "https://www.infomoney.com.br", title: "InfoMoney - Carteira Recomendada e Estratégias Secretas", nicho: "financas", type: "DIRECT_SALES", score: 11, rank: "A" },
    { url: "https://jovensdenegocios.com", title: "Jovens de Negócios PLR Academy: Como faturar na internet", nicho: "renda_extra", type: "VSL", score: 12, rank: "A" }
  ],
  monetizze: [
    { url: "https://www.natura.com.br", title: "Seja um Consultor de Alta Perfomance e Monte seu Império Natura", nicho: "beleza", type: "LOW_TICKET", score: 11, rank: "A" },
    { url: "https://www.belezanaweb.com.br", title: "Beleza na Web - Cosméticos Importados de Alta Escala", nicho: "beleza", type: "DIRECT_SALES", score: 10, rank: "B" }
  ],
  kirvano: [
    { url: "https://viverdeblog.com", title: "Desafio Cashback Organico - Venda todos os dias na internet", nicho: "renda_extra", type: "VSL", score: 11, rank: "A" },
    { url: "https://formulanegocioonline.com", title: "Plano de Marketing Digital Acelerado e Funil de Vendas", nicho: "renda_extra", type: "LOW_TICKET", score: 14, rank: "S" }
  ],
  cakto: [
    { url: "https://exame.com", title: "Exame Pro - Planejamento Estratégico e Finanças Corporativas", nicho: "financas", type: "DIRECT_SALES", score: 11, rank: "A" },
    { url: "https://www.tuasaude.com", title: "Tua Saúde Portal - Como Emagrecer Saudável com Alimentos Naturais", nicho: "emagrecimento", type: "VSL", score: 12, rank: "S" }
  ],
  greenn: [
    { url: "https://empiricus.com.br", title: "Estratégia Dividendos Secretos de Renda Passiva - Empiricus", nicho: "financas", type: "LOW_TICKET", score: 13, rank: "S" }
  ],
  lastlink: [
    { url: "https://segredosdaaudiencia.com.br", title: "Clube da Audiência Exclusiva com Alex Vargas e Tiago", nicho: "renda_extra", type: "DIRECT_SALES", score: 12, rank: "S" }
  ],
  braip: [
    { url: "https://www.minhavida.com.br", title: "Minha Vida Saudável - Guia Completo Alimentar e Fitoterápico", nicho: "saude_bem_estar", type: "QUIZ", score: 12, rank: "S" },
    { url: "https://www.tuasaude.com", title: "Tua Saúde Alimentação Inteligente - Guia Prático da Nutrição", nicho: "emagrecimento", type: "DIRECT_SALES", score: 11, rank: "A" }
  ],
  perfectpay: [
    { url: "https://mepoupe.com", title: "Protocolo Finanças do Zero: Defina sua Renda em Poucos Passos", nicho: "financas", type: "LOW_TICKET", score: 12, rank: "A" }
  ],
  ticto: [
    { url: "https://formulanegocioonline.com", title: "Renda Passiva Imediata: Guia Prático do Alex Vargas", nicho: "renda_extra", type: "LOW_TICKET", score: 14, rank: "S" }
  ],
  ampliopay: [
    { url: "https://exame.com", title: "Curso de Negócios e Inglês Corporativo para Alta Gestão", nicho: "outros", type: "DIRECT_SALES", score: 10, rank: "A" }
  ],
  ggcheckout: [
    { url: "https://segredosdaaudiencia.com.br", title: "Tráfego Acelerado para Dropshipping e E-commerce sem Estoque", nicho: "renda_extra", type: "VSL", score: 11, rank: "A" }
  ],
  pepper: [
    { url: "https://www.belezanaweb.com.br", title: "Almanaque da Beleza Masculina e Cosméticos High End", nicho: "beleza", type: "LOW_TICKET", score: 11, rank: "A" }
  ],
  clickbank: [
    { url: "https://www.clickbank.com", title: "ClickBank Marketplace - Evergreen International Affiliate Program", nicho: "renda_extra", type: "VSL", score: 13, rank: "S" },
    { url: "https://www.digistore24.com", title: "Digistore24 Partner Global Network Integration Page", nicho: "renda_extra", type: "DIRECT_SALES", score: 12, rank: "S" }
  ],
  digistore24: [
    { url: "https://www.digistore24.com", title: "The Ultimate Guide to Digital Marketplace Success on Digistore24", nicho: "renda_extra", type: "DIRECT_SALES", score: 12, rank: "S" }
  ],
  warriorplus: [
    { url: "https://www.clickbank.com", title: "Digital Traffic Storm Systems & Funnels Strategy Guide", nicho: "renda_extra", type: "DIRECT_SALES", score: 11, rank: "B" }
  ],
  jvzoo: [
    { url: "https://www.digistore24.com", title: "Funnel Builder Secret Guide - Optimize Checkout Converters", nicho: "renda_extra", type: "VSL", score: 11, rank: "S" }
  ],
  cartpanda: [
    { url: "https://www.belezanaweb.com.br", title: "Beleza Pro - Guia de Maquiagem e Cosméticos", nicho: "beleza", type: "QUIZ", score: 10, rank: "A" }
  ],
  yampi: [
    { url: "https://www.natura.com.br", title: "Consultoria Premium Natura e Checkout de Alta Performance", nicho: "beleza", type: "VSL", score: 11, rank: "B" }
  ],
  doppus: [
    { url: "https://financeone.com.br", title: "Portal de Educação Financeira Integrada - Planejamento Familiar", nicho: "financas", type: "QUIZ", score: 10, rank: "B" }
  ],
  kiwipay: [
    { url: "https://mepoupe.com", title: "Trabalho Remoto e Planejamento Tributário Simplificado", nicho: "financas", type: "LOW_TICKET", score: 11, rank: "C" }
  ],
  lowify: [
    { url: "https://receitadesecarrapido.com", title: "Protocolo Secar em 30 Dias - Checkout Exclusivo Lowify", nicho: "emagrecimento", type: "LOW_TICKET", score: 14, rank: "S" },
    { url: "https://guiadefinitivorun.com", title: "Guia da Hipertrofia Acelerada - Método Lowify", nicho: "saude_bem_estar", type: "LOW_TICKET", score: 12, rank: "A" }
  ],
  buckpay: [
    { url: "https://ganhedigitando-br.site", title: "Avaliador Recompensado Oficial - Receba via Buckpay", nicho: "renda_extra", type: "QUIZ", score: 15, rank: "S" },
    { url: "https://rejuvenescimento-natural.com", title: "Manual Jovialidade Instantânea - Sistema Buckpay", nicho: "beleza", type: "LOW_TICKET", score: 12, rank: "A" }
  ],
  wiapy: [
    { url: "https://comochegaraotopo.online", title: "Formula Monte seu Negocio Digital - Processado Wiapy", nicho: "renda_extra", type: "VSL", score: 13, rank: "S" },
    { url: "https://libido-turbinada.site", title: "Protocolo Ereção Máxima de 21 Dias - Wiapy Checkout", nicho: "saude_masculina", type: "DIRECT_SALES", score: 12, rank: "A" }
  ],
  xpages: [
    { url: "https://emagreca-com-ia.xpages.co", title: "Personal Trainer de Inteligência Artificial Inteligente", nicho: "emagrecimento", type: "VSL", score: 14, rank: "S" },
    { url: "https://lucrando-automatizado.xpages.co", title: "Método Renda Online com Robôs de Conversação Inteligentes", nicho: "renda_extra", type: "QUIZ", score: 13, rank: "S" }
  ],
  vercel: [
    { url: "https://desafio-bumbum-na-nuca.vercel.app", title: "Bumbum Ativo: Projeto 4 Semanas de Tonificação Rápida", nicho: "beleza", type: "DIRECT_SALES", score: 13, rank: "S" },
    { url: "https://calculadora-investimentos-lucro.vercel.app", title: "Simulador de Dividendos Críticos - Alcance Liberdade", nicho: "financas", type: "QUIZ", score: 12, rank: "A" }
  ],
  lovable: [
    { url: "https://metodo-virilidade-plena.lovable.app", title: "Segredo da Testosterona Elevada aos 50 Anos", nicho: "saude_masculina", type: "VSL", score: 14, rank: "S" },
    { url: "https://cronograma-capilar-ia.lovable.app", title: "Cronograma Capilar Inteligente - Guia para Fios Brilhantes", nicho: "beleza", type: "LOW_TICKET", score: 12, rank: "A" }
  ],
  bolthost: [
    { url: "https://mentoria-sinais-vip.bolt.host", title: "Sala de Sinais de Criptografia Automática via Telegram", nicho: "cripto", type: "VSL", score: 15, rank: "S" },
    { url: "https://guia-anti-ansiedade.bolt.host", title: "Respire Calmo: Segredos para Eliminar Crises de Ansiedade", nicho: "saude_bem_estar", type: "LOW_TICKET", score: 13, rank: "A" }
  ],
  replit: [
    { url: "https://metodo-espanhol-acelerado.replit.app", title: "Fluência em Espanhol com Diálogos Reais com IA", nicho: "outros", type: "DIRECT_SALES", score: 12, rank: "A" }
  ],
  keyword_pdf_wa: [
    { url: "https://detoxsecreto.site", title: "Aprenda como emagrecer por apenas R$10 obtendo o PDF direto no Whatsapp!", nicho: "emagrecimento", type: "LOW_TICKET", score: 14, rank: "S" }
  ],
  keyword_pdf_10: [
    { url: "https://metodorendaautomatica.online", title: "Esquema de revenda de canais - Adquira o PDF apenas 10 reais", nicho: "renda_extra", type: "LOW_TICKET", score: 12, rank: "A" }
  ],
  keyword_curso_27: [
    { url: "https://confeitaria-lucrativa-passo27.com", title: "Curso Completo de Sobremesas de Pote - Curso apenas 27 reais hoje", nicho: "outros", type: "LOW_TICKET", score: 11, rank: "A" }
  ],
  keyword_receba_wa: [
    { url: "https://protocolofibrasvivas.online", title: "Suplemento Termogênico Especial: Faça seu pedido e receba tudo pelo WhatsApp!", nicho: "saude_bem_estar", type: "DIRECT_SALES", score: 13, rank: "S" }
  ]
};

export function simulateScanInClient(trackerId: string, trackerName: string, trackerDomain: string, trackerMarket: 'BR' | 'Gringa'): OfferHit[] {
  const simulatedList = SIMULATED_OFFERS_DB[trackerId] || [];
  return simulatedList.map((item, idx) => {
    return {
      id: `sim-client-${trackerId}-${idx}-${Date.now()}`,
      url: item.url,
      domain: item.url.replace(/^https?:\/\//i, "").split("/")[0],
      title: item.title,
      tracker: trackerDomain,
      platformName: trackerName,
      market: trackerMarket,
      nicho: item.nicho as any,
      type: item.type as any,
      score: item.score,
      rank: item.rank as any,
      scannedAt: new Date(Date.now() - idx * 3600000).toISOString()
    };
  });
}
