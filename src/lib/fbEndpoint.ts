// No domínio da Netlify usamos as Netlify Functions; em qualquer outro (ex: Vercel),
// as mesmas rotas estão expostas via Express em /api/facebook/*
export const isNetlifyHost = () => window.location.hostname.endsWith("netlify.app");

export const fbEndpoint = (netlifyFn: string, apiPath: string) =>
  isNetlifyHost() ? `/.netlify/functions/${netlifyFn}` : `/api/facebook/${apiPath}`;
