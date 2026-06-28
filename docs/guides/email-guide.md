# Guía de Configuración de Email — Gestor de Reservas EscapeMaster

Documento técnico para implementar el envío de emails desde el gestor de reservas usando los servicios configurados en la plataforma.

---

## Servicios de Email Disponibles

La plataforma EscapeMaster utiliza dos proveedores según el servicio que envía el email:

| Servicio | Provider | Puerto | Dirección Remitente |
|----------|----------|--------|---------------------|
| `web/api` | AWS SES | 8000 | `noreply@escapemaster.es`, `support@escapemaster.es`, `reservas@escapemaster.es` |
| `master` (panel admin) | Resend | 4322 | `noreply@escapemaster.es` |

---

## Proveedor 1 — AWS SES (web/api)

### Credenciales

```
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=<REDACTED_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<REDACTED_AWS_SECRET_KEY>
```

### Direcciones de Remitente Verificadas

```
EMAIL_FROM_NOREPLY=noreply@escapemaster.es   # Verificación de cuenta, reset contraseña
EMAIL_FROM_SUPPORT=support@escapemaster.es    # Reply-To en emails de clientes
EMAIL_FROM_RESERVAS=reservas@escapemaster.es  # Confirmaciones y recordatorios de reserva
```

### Instalación del SDK

```bash
npm install @aws-sdk/client-ses
```

### Código — Cliente SES

```typescript
// web/api/src/lib/email.ts
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
    Destination: { ToAddresses: toAddresses },
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

### Tipos de Email Enviados (web/api)

| Función | Desde | Asunto | Propósito |
|---------|-------|--------|-----------|
| `sendVerificationEmail` | `noreply@escapemaster.es` | Verifica tu cuenta de EscapeMaster | Código de verificación de 6 dígitos (expira 15 min) |
| `sendPasswordResetEmail` | `noreply@escapemaster.es` | Recupera tu contraseña de EscapeMaster | Código de recuperación de contraseña |
| `sendBookingConfirmationEmail` | `reservas@escapemaster.es` + reply-to `support@escapemaster.es` | ✅ Reserva confirmada – {sala} | Confirmación con detalles completos |
| `sendBookingReminderEmail` | `reservas@escapemaster.es` + reply-to `support@escapemaster.es` | ⏰ Recordatorio: Tu reserva en {sala} es mañana | Recordatorio un día antes |

---

## Proveedor 2 — Resend (master / panel admin)

### Credenciales

```
RESEND_API_KEY=re_iMsFK5qD_48R1unRvvjBt3vKpyCFUCPX5
```

### Instalación del SDK

```bash
npm install resend
```

### Código — Cliente Resend

```typescript
// Uso directo con el SDK de Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<string> {
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

  const { data, error } = await resend.emails.send({
    from: options.from ?? "noreply@escapemaster.es",
    to: toAddresses,
    subject: options.subject,
    html: options.html,
    ...(options.replyTo && { replyTo: options.replyTo }),
  });

  if (error) throw new Error(error.message);
  return data!.id;
}
```

---

## Template HTML Base (usado en ambos servicios)

Todos los emails de la plataforma comparten el mismo diseño visual:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .value { font-weight: 600; }
    .code { font-family: monospace; font-size: 18px; color: #f39c12; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 EscapeMaster</h1>
    </div>
    <div class="body">{{contenido}}</div>
    <div class="footer">
      EscapeMaster · escapemaster.es<br>
      <a href="https://escapemaster.es" style="color:#0097b2">escapemaster.es</a> ·
      <a href="mailto:support@escapemaster.es" style="color:#0097b2">support@escapemaster.es</a>
    </div>
  </div>
</body>
</html>
```

### Templates Predefinidos

**Verificación de cuenta:**
```html
<h2>Verifica tu cuenta</h2>
<p>Hola <strong>{nombreUsuario}</strong>,</p>
<p>Gracias por registrarte en EscapeMaster. Tu código de verificación es:</p>
<div style="background:#e8f5f3;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
  <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0097b2;font-family:monospace">{codigo}</span>
</div>
<p style="color:#666;font-size:14px">Este código expira en <strong>15 minutos</strong>.</p>
```

**Confirmación de reserva:**
```html
<h2>¡Reserva confirmada! 🎉</h2>
<p>Hola <strong>{nombreUsuario}</strong>,</p>
<table>
  <tr><td class="label">Sala</td><td class="value">{nombreSala}</td></tr>
  <tr><td class="label">Fecha</td><td class="value">{fecha}</td></tr>
  <tr><td class="label">Hora</td><td class="value">{hora}</td></tr>
  <tr><td class="label">Jugadores</td><td class="value">{jugadores}</td></tr>
  <tr><td class="label">Precio Total</td><td class="value">{precioTotal}€</td></tr>
  <tr><td class="label">Dirección</td><td class="value">{direccion}</td></tr>
  <tr><td class="label">Código</td><td class="value code">{codigoReserva}</td></tr>
</table>
<a href="{urlReserva}" class="btn">Ver mi reserva</a>
```

**Recordatorio de reserva:**
```html
<div class="alert">¡Tu aventura es mañana! ⏰</div>
<p>Hola <strong>{nombreUsuario}</strong>,</p>
<table>
  <tr><td class="label">Sala</td><td class="value">{nombreSala}</td></tr>
  <tr><td class="label">Fecha</td><td class="value">{fecha}</td></tr>
  <tr><td class="label">Hora</td><td class="value">{hora}</td></tr>
  <tr><td class="label">Código</td><td class="value code">{codigoReserva}</td></tr>
</table>
<p>📍 <strong>{direccion}</strong></p>
<a href="{urlReserva}" class="btn">Ver detalles</a>
```

---

## Resumen de Credenciales

| Variable | Valor | Servicio |
|----------|-------|----------|
| `AWS_REGION` | `eu-west-3` | web/api (SES) |
| `AWS_ACCESS_KEY_ID` | `<REDACTED_AWS_ACCESS_KEY>` | web/api (SES) |
| `AWS_SECRET_ACCESS_KEY` | `<REDACTED_AWS_SECRET_KEY>` | web/api (SES) |
| `EMAIL_FROM_NOREPLY` | `noreply@escapemaster.es` | web/api (SES) |
| `EMAIL_FROM_SUPPORT` | `support@escapemaster.es` | web/api (SES) |
| `EMAIL_FROM_RESERVAS` | `reservas@escapemaster.es` | web/api (SES) |
| `RESEND_API_KEY` | `re_iMsFK5qD_48R1unRvvjBt3vKpyCFUCPX5` | master (Resend) |

---

## Configuración DNS / Autenticación

### AWS SES (eu-west-3)

- Dominio `escapemaster.es` verificado con DKIM y SPF
- Direcciones individuales (`noreply@`, `support@`, `reservas@`) verificadas
- **Importante:** SES comienza en modo sandbox — solo permite enviar a direcciones verificadas. Solicitar acceso de producción para enviar a cualquier destino.
- Panel: AWS Console → SES → Identity Management

### Resend

- Dominio `escapemaster.es` verificado (registro TXT en DNS)
- DKIM configurado (registros proporcionados por Resend)
- Panel: [resend.com](https://resend.com) → Domains

---

## Checklist de Implementación

- [ ] Instalar SDK según el proveedor (`@aws-sdk/client-ses` o `resend`)
- [ ] Configurar credenciales como variables de entorno (NUNCA hardcodear)
- [ ] Verificar que el dominio y direcciones están verificados con el provider
- [ ] Si es SES, verificar que está en modo producción (no sandbox)
- [ ] Implementar reintento en caso de error de envío
- [ ] Configurar logging (`console.log` con MessageId para trazabilidad)
- [ ] Definir Reply-To como `support@escapemaster.es` en emails de reserva

---

## Troubleshooting Común

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| Email no enviado (SES) | Modo sandbox activo | Request production access en AWS SES |
| Email no enviado (Resend) | Dominio no verificado | Completar verificación DNS |
| Error 403/404 | Region incorrecta | Usar `eu-west-3` para SES |
| Bounce alto | DNS / autenticación mal configurada | Verificar DKIM, SPF, DMARC |
| `MessageId` no retornado | Error en SES | Revisar logs, verificar permisos IAM |
| HTML se ve mal | CSS inline no soportado | El template usa estilos inline (correcto) |

---

## Referencias

- Código completo `web/api`: `web/api/src/lib/email.ts`
- Templates `web/frontend`: `web/frontend/src/lib/email-templates.ts`
- API README: `docs/api/README.md`
- Schema base de datos: `docs/api/database-schema.md`