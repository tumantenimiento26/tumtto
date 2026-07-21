# Tumantenimiento — Product decisions (canonical)

Confirmed by JL · 2026-07-21. These override anything contradictory in the PRD or design prototypes.

## 1. Payments variant
**Payments ON.** In-app payments are part of the MVP (not a directory/lead-gen variant).

## 2. Commission
Base rate **15%**, authoritative platform-wide default. **Admin-editable** from the admin console (Config). Changes apply to new services, not retroactively.

## 3. Service lifecycle
Canonical statuses: `solicitado → aceptado → en_camino → en_ejecucion → completado → pagado/cerrado`.
- **`pagado/cerrado` is a real terminal state after `completado`** (confirmed).
- **`disputa` is NOT a status** — it is an overlay flag on a live order; the underlying status keeps its place in the lifecycle while the dispute is open.
- Cancellation paths (`cancelado`) exit the lifecycle before `completado`.

## 4. Request routing
- **Always tech-first / direct assignment** with a **30-min accept window**. No broadcast pool in MVP.
- On reject/expire: the client picks / is offered another técnico (no auto-broadcast).
- **Urgent requests**: client may flag a request as urgent, which applies a **higher rate set by the admin** (multiplier/fee configured in admin Config).
- `REQ-` and `SVC-` are the **same row/entity**: a request promotes in place to a service on acceptance (no separate table).

## 5. Identity & roles
- **One person CAN be both cliente and técnico** (same auth identity, role-scoped profiles).
- Admins live in the **same auth pool**, gated by RBAC.
- Roles confirmed: Super Admin / Admin Soporte / Onboarding / Legal. Capability rows below are the working proposal (derived from the admin screens) — flag any cell to change:

| Capability | Super Admin | Admin Soporte | Onboarding | Legal |
|---|---|---|---|---|
| Config (commission, urgent rate, regiones, catálogo) | ✅ | — | — | — |
| User management (block/suspend) | ✅ | ✅ | — | — |
| Disputes / soporte tickets | ✅ | ✅ | — | view |
| KYC review & approval | ✅ | — | ✅ | ✅ |
| Finanzas / payouts | ✅ | — | — | — |
| Reportes (read) | ✅ | ✅ | ✅ | ✅ |

## 6. Money
- **Integer centavos** everywhere (DB + API). Format to pesos only at the UI edge.
- Commission rounding: round half-up to the nearest centavo.
- **MXN only for MVP.**

## 7. Técnico KYC capture
Comprobante de domicilio, selfie, and bank/CLABE are collected **during técnico onboarding** — new step 4 "Verificación y cobro" (see `Tumantenimiento/tech-onboarding.jsx`, artboard 06), between Identificación (INE) and Certificaciones. Onboarding is now a 6-step flow.
