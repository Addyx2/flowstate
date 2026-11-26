# Ecosystem — where Flowstate fits

Flowstate is one of Aultrum's products and shares services with the others.

| Service | What it is | Relation to Flowstate |
|---|---|---|
| **Pleasant** | Shifts, timesheets, payroll and billing for care staffing agencies | Reference implementation (D3). Flowstate's Supply requests workers from agencies on Pleasant |
| **Aultrum ID** | One sign-in account per person across Aultrum products (OpenID Connect) | Flowstate's sign-in (D5) |
| **Aultrum carer app** | The carer's own app, shared across Aultrum products | Flowstate's carers use it; Flowstate serves it through Carer API v1 (D10) — built, live once Flowstate is registered with Aultrum ID |
| **Canvas** | Runs the Elements add-ons — Gateway (calls, texts) and Peak (rewards) — once, and shows them inside products | Flowstate's Elements section (D13) |

```
        Aultrum ID (sign-in)
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
Flowstate  Pleasant   Aultrum carer app
   │          │       (reads each product's Carer API)
   └─► Canvas ◄┘  Gateway · Peak
```

Rules that apply across all of them:
- Flowstate never sends care records or personal details to shared services.
- Elements never change Flowstate data directly; they ask Flowstate to run an
  action, which applies Flowstate's own permissions and audit log.
