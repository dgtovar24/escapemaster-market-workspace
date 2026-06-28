# Email Configuration Guide — master (Resend)

Guide for sending transactional emails from `master` panel using **Resend**.

---

## Provider & Sender Address

| Provider | Service | Sender Address |
|----------|---------|----------------|
| Resend | `master` (port 4322) | `noreply@escapemaster.es` (via Resend) |

> The `master` panel primarily uses Resend for outgoing email. All emails from master use the Resend API key below.

---

## Resend Credentials

```
RESEND_API_KEY=re_iMsFK5qD_48R1unRvvjBt3vKpyCFUCPX5
```

> Resend API key format: `re_` prefix. Get your key at [resend.com](https://resend.com) → API Keys.

---

## Environment Variables (`.env`)

Full email block in `master/.env`:

```env
# ─────────────────────────────────────────────
# EMAIL — Resend
# ─────────────────────────────────────────────
RESEND_API_KEY=re_iMsFK5qD_48R1unRvvjBt3vKpyCFUCPX5
```

---

## Code — How Resend is Used

The `master` app uses **Resend SDK** (`resend` npm package) to send emails.

### Master does NOT have its own email-sending library

The `master` panel has **no custom email library** in `src/lib/` — it sends emails directly through the Resend API.

The email functions are defined in **`web/frontend/src/lib/email.ts`** and **`web/frontend/src/lib/email-templates.ts`** — these are the canonical implementations.

### Resend Email Template (baseTemplate)

All emails share a consistent HTML template (defined in `web/frontend/src/lib/email-templates.ts`):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0097b2; padding: 24px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 8px 0 0; font-weight: 800; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .btn { display: inline-block; background: #0097b2; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .btn-orange { background: #f39c12; }
    .footer { background: #f9f9f9; padding: 16px 32px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .alert { background: #f39c12; color: #fff; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-weight: 600; }
    .code { font-family: monospace; font-size: 18px; color: #f39c12; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 EscapeMaster</h1></div>
    <div class="body">{{content}}</div>
    <div class="footer">
      EscapeMaster · escapemaster.es<br>
      <a href="https://escapemaster.es" style="color:#0097b2">escapemaster.es</a> ·
      <a href="mailto:support@escapemaster.es" style="color:#0097b2">support@escapemaster.es</a>
    </div>
  </div>
</body>
</html>
```

### Available Templates

| Template Function | Purpose |
|-----------------|---------|
| `verificacionCuentaTemplate` | Account verification (URL-based, 24h expiry) |
| `recuperarPasswordTemplate` | Password reset (URL-based, 1h expiry) |
| `confirmacionReservaTemplate` | Booking confirmation with full details |
| `recordatorioReservaTemplate` | Day-before booking reminder |
| `soporteTemplate` | Support ticket notification |
| `emailBaseTemplate` | Generic templated email |

---

## Comparison: web/api (SES) vs master (Resend)

| | **web/api** | **master** |
|--|------------|-----------|
| Provider | AWS SES | Resend |
| Region | `eu-west-3` (Paris) | Global (API-based) |
| Library | `@aws-sdk/client-ses` | `resend` npm package |
| Default sender | `noreply@escapemaster.es` | `noreply@escapemaster.es` |
| Booking emails | `reservas@escapemaster.es` (SES) | N/A (master doesn't send booking emails) |
| Support reply-to | `support@escapemaster.es` | N/A |
| Email library location | `web/api/src/lib/email.ts` | Uses `web/frontend/src/lib/email.ts` (shared) |

### When Each Service Sends Email

- **`web/api`** sends: verification codes, password reset codes, booking confirmations, booking reminders (all via SES)
- **`master`** is primarily an admin panel — it uses Resend for any transactional email it triggers (e.g., support notifications)

---

## Resend Setup Checklist

- [ ] Resend account created at [resend.com](https://resend.com)
- [ ] API key generated and stored in `master/.env` as `RESEND_API_KEY`
- [ ] Domain `escapemaster.es` added and verified in Resend (DNS TXT record)
- [ ] DKIM records added to your DNS
- [ ] Sender address `noreply@escapemaster.es` verified
- [ ] Check Resend dashboard for sent/delivered/bounce metrics

---

## Verifying DNS for Resend

Resend provides two DNS records to add:

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey.escapemaster.es` | `v=DMARC1; p= quarantine; rua=mailto:support@escapemaster.es` (optional) |
| MX | (depends on your domain setup) | Follow Resend's DNS instructions |

After adding DNS, Resend automatically verifies the domain (may take up to 24h).

---

## Troubleshooting

**Resend API errors:**
- Verify API key is correct and has not been revoked
- Check Resend dashboard → Logs for detailed error messages
- Ensure the domain is verified and DNS propagates

**Emails going to spam:**
- Add SPF record: `v=spf1 include:resend.com ~all`
- Add DKIM record from Resend dashboard
- Consider DMARC record

**Resend not configured on master:**
- Check that `RESEND_API_KEY` is present in `master/.env`
- If missing, add it and restart the master server

---

## Related Docs

- [Master README](../cms/) — master panel overview
- [web/frontend email templates](../../web/frontend/src/lib/email-templates.ts) — all email HTML templates