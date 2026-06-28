# Email Configuration Guide — web/api (AWS SES)

Guide for sending transactional emails from `web/api` using **AWS SES** (Simple Email Service).

---

## Providers & Sender Addresses

| Provider | Service | Sender Addresses |
|----------|---------|-----------------|
| AWS SES | `web/api` (port 8000) | `noreply@escapemaster.es`, `support@escapemaster.es`, `reservas@escapemaster.es` |

---

## AWS SES Credentials

```
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=<REDACTED_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<REDACTED_AWS_SECRET_KEY>
```

> **Region:** `eu-west-3` (Paris) — all SES identities (domain + email addresses) must be verified in this region.

---

## Sender Addresses (Verified in AWS SES)

All three addresses are verified under the `escapemaster.es` domain in SES:

```env
EMAIL_FROM_NOREPLY=noreply@escapemaster.es   # Account verification, password reset
EMAIL_FROM_SUPPORT=support@escapemaster.es    # Reply-to for customer-facing emails
EMAIL_FROM_RESERVAS=reservas@escapemaster.es  # Booking confirmations, reminders
```

### Address Verification Status
- `escapemaster.es` domain is verified (DKIM + SPF configured)
- Individual addresses `noreply@`, `support@`, `reservas@` are verified individually
- To add or verify addresses: AWS Console → SES → Identity Management → Email Addresses

---

## Code — `/Users/dgtovar/Work/marketplace/web/api/src/lib/email.ts`

```typescript
import { SESClient, SendEmailCommand, type SendEmailCommandInput } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: import.meta.env.AWS_REGION ?? "eu-west-3",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<string> {
  const {
    to,
    subject,
    html,
    text,
    from = import.meta.env.EMAIL_FROM_NOREPLY,
    replyTo,
  } = options;

  const toAddresses = Array.isArray(to) ? to : [to];

  const params: SendEmailCommandInput = {
    Source: from,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        ...(text && { Text: { Data: text, Charset: "UTF-8" } }),
      },
    },
    ...(replyTo && { ReplyToAddresses: [replyTo] }),
  };

  const command = new SendEmailCommand(params);
  const result = await sesClient.send(command);
  return result.MessageId!;
}
```

---

## Environment Variables (`.env`)

Full email block in `web/api/.env`:

```env
# ─────────────────────────────────────────────
# EMAIL — AWS SES
# ─────────────────────────────────────────────
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=<REDACTED_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<REDACTED_AWS_SECRET_KEY>
EMAIL_FROM_NOREPLY=noreply@escapemaster.es
EMAIL_FROM_SUPPORT=support@escapemaster.es
EMAIL_FROM_RESERVAS=reservas@escapemaster.es
```

---

## Email Types Sent

| Function | From | Subject | Purpose |
|----------|------|---------|---------|
| `sendVerificationEmail` | `noreply@escapemaster.es` | Verifica tu cuenta de EscapeMaster | Account verification code (6 digits, 15 min expiry) |
| `sendPasswordResetEmail` | `noreply@escapemaster.es` | Recupera tu contraseña de EscapeMaster | Password reset code |
| `sendBookingConfirmationEmail` | `reservas@escapemaster.es` + reply-to `support@escapemaster.es` | ✅ Reserva confirmada – {sala} | Booking confirmation with details |
| `sendBookingReminderEmail` | `reservas@escapemaster.es` + reply-to `support@escapemaster.es` | ⏰ Recordatorio: Tu reserva en {sala} es mañana | Day-before reminder |

---

## SES Configuration Checklist

- [ ] Domain `escapemaster.es` verified in SES (eu-west-3)
- [ ] DKIM signing enabled (improves deliverability)
- [ ] SPF record configured
- [ ] All three sender addresses verified individually
- [ ] Production access requested (SES starts in sandbox — emails only go to verified addresses until you request production access)
- [ ] `EMAIL_FROM_SUPPORT` set as Reply-To on booking emails so replies go to support

---

## Troubleshooting

**Emails not sending:**
- Check SES sandbox mode — in sandbox, you can only send to *verified* email addresses
- Request production access: AWS Console → SES → Account Dashboard → Request Production Access
- Verify the `From` address is exactly as registered (case-sensitive)

**Soft bounce / complaints:**
- Check SES reputation metrics in AWS Console
- Configure SPF/DKIM properly
- Consider enabling SNS bounce/complaint notifications

**Wrong region:**
- Always use `eu-west-3` — SES identities are region-specific
- If you recreate SESClient with wrong region, it will fail silently or return 404

---

## Related Docs

- [API README](../api/README.md) — full API overview
- [Database Schema](../api/database-schema.md) — bookings, users tables