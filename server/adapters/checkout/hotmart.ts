// Adapter da Hotmart.
//
// CONFIANÇA DOS MAPEAMENTOS (não tenho a documentação oficial aberta agora — confirmar
// contra um payload real antes de considerar isso 100% validado em produção; o
// `webhook_events_raw` guarda o body bruto justamente para permitir esse ajuste depois):
//
// CONFIRMADO (formato amplamente documentado/conhecido do webhook "Postback" da Hotmart):
//   - `data.purchase.transaction`     -> externalOrderId
//   - `data.purchase.status`          -> status (normalizado)
//   - `data.purchase.price.value`     -> grossAmount
//   - `data.buyer.email`              -> buyer.email
//   - `data.buyer.name`               -> buyer.name
//   - `data.product.id`               -> externalProductId
//   - `data.purchase.order_date`      -> occurredAt (epoch ms)
//   - `hottok` (no corpo do payload)  -> token de verificação de assinatura
//
// INFERIDO (não tenho certeza do nome exato do campo; tentamos variações plausíveis e
// caímos para `undefined` se nenhuma existir — não falha o parse por causa disso):
//   - `data.buyer.checkout_phone` / `data.buyer.phone` -> buyer.phone
//   - `data.purchase.offer.price.value` como fallback de grossAmount em alguns formatos antigos
//   - UTMs/sck: a Hotmart historicamente manda parâmetros de tracking em
//     `data.purchase.tracking.source/medium/campaign` ou em `data.subscriber_anticipation`
//     dependendo da versão da API. Tentamos `data.purchase.tracking.*` e `data.tracking.*`.
//   - `src` (parâmetro customizado da Hotmart, equivalente a "src") -> tentamos
//     `data.purchase.tracking.source_sck` / `data.purchase.tracking.src`.
//   - feeAmount/netAmount: tentamos `data.purchase.commission.value` /
//     `data.purchase.price.value - data.purchase.commission.value`, mas sem confirmação —
//     deixamos undefined se não encontrarmos os campos diretos.
//
// Qualquer coisa não encontrada fica `undefined` (não derruba o parse inteiro).

import type { Request } from "express";
import type { CheckoutAdapter, NormalizedSale } from "./types";

function normalizeStatus(raw: string | undefined): string {
  const s = (raw || "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETE" || s === "COMPLETED") return "approved";
  if (s === "REFUNDED") return "refunded";
  if (s === "CANCELLED" || s === "CANCELED") return "cancelled";
  if (s === "CHARGEBACK") return "chargeback";
  if (s === "EXPIRED") return "expired";
  if (s === "WAITING_PAYMENT" || s === "PENDING" || s === "BILLET_PRINTED") return "pending";
  return s ? s.toLowerCase() : "unknown";
}

function get(obj: any, path: string[]): any {
  return path.reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj);
}

function firstDefined(...values: any[]): any {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

export const hotmart: CheckoutAdapter = {
  // A Hotmart envia o token de verificação (`hottok`) como um campo do próprio corpo JSON do
  // webhook, não em um header HTTP — por isso comparamos `body.hottok` contra o secret salvo,
  // em vez de calcular um HMAC sobre o raw body como fazemos com a Kiwify. Isso é coerente
  // com o que mapeamos em `parse`: o payload tem `data.*` e `hottok` no nível raiz.
  verifySignature(req: Request, secret: string): boolean {
    const hottok = req.body?.hottok;
    if (typeof hottok !== "string" || !hottok) return false;
    return hottok === secret;
  },

  parse(body: any): NormalizedSale | null {
    try {
      const purchase = body?.data?.purchase;
      const externalOrderId = purchase?.transaction;
      if (!externalOrderId || typeof externalOrderId !== "string") return null;

      const grossAmount = firstDefined(
        purchase?.price?.value,
        purchase?.offer?.price?.value
      );

      const occurredAtRaw = purchase?.order_date;
      const occurredAt = occurredAtRaw
        ? new Date(Number(occurredAtRaw)).toISOString()
        : new Date().toISOString();

      const tracking = firstDefined(purchase?.tracking, body?.data?.tracking) || {};

      const feeAmount = firstDefined(purchase?.commission?.value);
      const netAmount =
        typeof grossAmount === "number" && typeof feeAmount === "number"
          ? grossAmount - feeAmount
          : undefined;

      const sale: NormalizedSale = {
        externalOrderId,
        externalProductId: body?.data?.product?.id !== undefined
          ? String(body.data.product.id)
          : undefined,
        status: normalizeStatus(purchase?.status),
        grossAmount: typeof grossAmount === "number" ? grossAmount : undefined,
        netAmount,
        feeAmount: typeof feeAmount === "number" ? feeAmount : undefined,
        currency: purchase?.price?.currency_value || purchase?.offer?.price?.currency_value,
        buyer: {
          email: body?.data?.buyer?.email,
          name: body?.data?.buyer?.name,
          phone: firstDefined(body?.data?.buyer?.checkout_phone, body?.data?.buyer?.phone),
        },
        utm: {
          source: firstDefined(tracking?.source, tracking?.utm_source),
          medium: firstDefined(tracking?.medium, tracking?.utm_medium),
          campaign: firstDefined(tracking?.campaign, tracking?.utm_campaign),
          content: firstDefined(tracking?.content, tracking?.utm_content),
          term: firstDefined(tracking?.term, tracking?.utm_term),
        },
        fbclid: undefined,
        src: firstDefined(tracking?.source_sck, tracking?.src),
        items: [
          {
            externalProductId: body?.data?.product?.id !== undefined
              ? String(body.data.product.id)
              : undefined,
            name: body?.data?.product?.name,
            amount: typeof grossAmount === "number" ? grossAmount : undefined,
            quantity: 1,
          },
        ],
        occurredAt,
      };

      return sale;
    } catch (err) {
      console.error("hotmart adapter parse failed:", err);
      return null;
    }
  },
};
