// Tipos compartilhados pelos adapters de checkout (Hotmart, Kiwify, e futuramente
// Wiapy/Lowify na Task 12). Cada adapter normaliza o payload da sua plataforma para
// `NormalizedSale`, que é o formato consumido pela rota de webhook em server.ts.

import type { Request } from "express";

export interface NormalizedSale {
  externalOrderId: string;
  externalProductId?: string;
  status: string;
  grossAmount?: number;
  netAmount?: number;
  feeAmount?: number;
  currency?: string;
  buyer: {
    email?: string;
    name?: string;
    phone?: string;
  };
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  fbclid?: string;
  src?: string;
  items: {
    externalProductId?: string;
    name?: string;
    amount?: number;
    quantity?: number;
  }[];
  occurredAt: string;
}

export interface CheckoutAdapter {
  /** Verifica a assinatura/autenticidade do webhook contra o secret salvo do operador. */
  verifySignature(req: Request, secret: string): boolean;
  /** Mapeia o payload bruto da plataforma para o formato normalizado. Retorna `null` se o
   * payload não tiver o formato esperado (em vez de lançar exceção). */
  parse(body: any): NormalizedSale | null;
}
