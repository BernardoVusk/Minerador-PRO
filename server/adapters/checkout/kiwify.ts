// Adapter da Kiwify.
//
// CONFIANÇA DOS MAPEAMENTOS (não tenho a documentação oficial aberta agora — confirmar
// contra um payload real antes de considerar isso validado em produção; o
// `webhook_events_raw` guarda o body bruto para permitir esse ajuste depois):
//
// CONFIRMADO (mecanismo de assinatura é documentado pela Kiwify: HMAC-SHA1 do raw body,
// comparado contra `?signature=` na query string da URL do webhook):
//   - assinatura: HMAC-SHA1(rawBody, secret) === query.signature
//
// INFERIDO (nomes de campos plausíveis com base no formato "order" típico de checkouts
// brasileiros — não 100% confirmados):
//   - `order_id`                          -> externalOrderId
//   - `order_status`                      -> status (normalizado)
//   - `Commissions.charge_amount` (centavos) ou `payment.amount` -> grossAmount (tentamos ambos)
//   - `Customer.email/full_name/mobile`   -> buyer.*
//   - `Product.product_id`                -> externalProductId
//   - `created_at` / `order_date`          -> occurredAt
//   - `TrackingParameters.utm_source/utm_medium/utm_campaign/utm_content/utm_term` -> utm.*
//   - `TrackingParameters.src`             -> src
//   - `Commissions.my_commission` ou `Commissions.kiwify_fee` -> feeAmount (tentativa)
//
// Qualquer campo não encontrado fica `undefined` (não derruba o parse inteiro).

import crypto from "crypto";
import type { Request } from "express";
import type { CheckoutAdapter, NormalizedSale } from "./types";

function normalizeStatus(raw: string | undefined): string {
  const s = (raw || "").toLowerCase();
  if (s === "paid" || s === "approved" || s === "completed") return "approved";
  if (s === "refunded" || s === "refused") return "refunded";
  if (s === "chargedback" || s === "chargeback") return "chargeback";
  if (s === "canceled" || s === "cancelled") return "cancelled";
  if (s === "waiting_payment" || s === "pending") return "pending";
  return s || "unknown";
}

function firstDefined(...values: any[]): any {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

// Kiwify costuma enviar valores monetários em centavos (inteiro). Convertemos para reais
// quando o valor parece estar em centavos (heurística: campo termina em "_cents" ou é um
// inteiro vindo de `charge_amount`/`amount` documentado em centavos pela Kiwify).
function centsToAmount(value: any): number | undefined {
  if (typeof value !== "number") return undefined;
  return value / 100;
}

export const kiwify: CheckoutAdapter = {
  verifySignature(req: Request, secret: string): boolean {
    const signature = req.query?.signature;
    if (typeof signature !== "string" || !signature) return false;

    const raw = (req as any).rawBody as Buffer | undefined;
    if (!raw) return false;

    const computed = crypto.createHmac("sha1", secret).update(raw).digest("hex");

    // timingSafeEqual exige buffers do mesmo tamanho; se os tamanhos diferirem a assinatura
    // já está incorreta.
    const computedBuf = Buffer.from(computed, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");
    if (computedBuf.length !== signatureBuf.length) return false;

    return crypto.timingSafeEqual(computedBuf, signatureBuf);
  },

  parse(body: any): NormalizedSale | null {
    try {
      const externalOrderId = firstDefined(body?.order_id, body?.id);
      if (!externalOrderId || typeof externalOrderId !== "string") return null;

      const tracking = body?.TrackingParameters || body?.tracking_parameters || {};
      const customer = body?.Customer || body?.customer || {};
      const product = body?.Product || body?.product || {};
      const commissions = body?.Commissions || body?.commissions || {};

      const grossAmount = firstDefined(
        centsToAmount(commissions?.charge_amount),
        body?.payment?.amount,
        centsToAmount(body?.charge_amount)
      );

      const feeAmount = firstDefined(
        centsToAmount(commissions?.kiwify_fee),
        centsToAmount(commissions?.my_commission)
      );

      const netAmount =
        typeof grossAmount === "number" && typeof feeAmount === "number"
          ? grossAmount - feeAmount
          : undefined;

      const occurredAtRaw = firstDefined(body?.created_at, body?.order_date);
      const occurredAt = occurredAtRaw ? new Date(occurredAtRaw).toISOString() : new Date().toISOString();

      const externalProductId = firstDefined(product?.product_id, product?.id);

      const sale: NormalizedSale = {
        externalOrderId,
        externalProductId: externalProductId !== undefined ? String(externalProductId) : undefined,
        status: normalizeStatus(body?.order_status),
        grossAmount: typeof grossAmount === "number" ? grossAmount : undefined,
        netAmount,
        feeAmount: typeof feeAmount === "number" ? feeAmount : undefined,
        currency: firstDefined(body?.product_currency, body?.currency),
        buyer: {
          email: customer?.email,
          name: firstDefined(customer?.full_name, customer?.name),
          phone: firstDefined(customer?.mobile, customer?.phone),
        },
        utm: {
          source: tracking?.utm_source,
          medium: tracking?.utm_medium,
          campaign: tracking?.utm_campaign,
          content: tracking?.utm_content,
          term: tracking?.utm_term,
        },
        fbclid: undefined,
        src: tracking?.src,
        items: [
          {
            externalProductId: externalProductId !== undefined ? String(externalProductId) : undefined,
            name: product?.product_name || product?.name,
            amount: typeof grossAmount === "number" ? grossAmount : undefined,
            quantity: 1,
          },
        ],
        occurredAt,
      };

      return sale;
    } catch (err) {
      console.error("kiwify adapter parse failed:", err);
      return null;
    }
  },
};
