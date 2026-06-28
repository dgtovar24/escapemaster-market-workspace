# Guía de Configuración: Google Login

Esta guía detalla los pasos necesarios para habilitar el inicio de sesión con Google en la plataforma EscapeMaster.

## 1. Google Cloud Console

Debes crear un proyecto y configurar las credenciales OAuth 2.0.

1. Accede a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (ej: `escapemaster-prod`).
3. Ve a **API & Services** > **OAuth consent screen**:
   - Tipo de usuario: **External**.
   - Completa la información básica (Nombre, email de soporte).
   - En **Authorized domains**, añade `escapemaster.es`.
4. Ve a **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `EscapeMaster Web`.
   - **Authorized JavaScript origins**:
     - `http://localhost:4321` (Desarrollo)
     - `https://www.escapemaster.es` (Producción)
   - **Authorized redirect URIs**:
     - `https://www.escapemaster.es/api/auth/google`
5. Copia el **Client ID** y el **Client Secret**.

## 2. Variables de Entorno

Debes configurar las siguientes variables en Vercel (para el proyecto `escapemaster-rooms`):

| Variable | Valor | Destino |
|----------|-------|---------|
| `PUBLIC_GOOGLE_CLIENT_ID` | Tu Client ID | Frontend (Astro) |
| `GOOGLE_CLIENT_ID` | Tu Client ID | Backend (API) |
| `GOOGLE_CLIENT_SECRET` | Tu Client Secret | Backend (API) |

> [!IMPORTANT]
Las variables deben estar disponibles tanto en el entorno de **Production** como en **Preview**.

## 3. Verificación

Una vez configuradas las variables y redesplegado en Vercel:

1. Ve a la página de [Login](https://www.escapemaster.es/es/login).
2. El botón de Google debería estar habilitado (si no lo estaba antes).
3. Al hacer clic, se abrirá el selector de cuentas de Google.
4. Tras seleccionar una cuenta, serás redirigido a tu perfil de EscapeMaster.

## Solución de Problemas

- **"Google no está configurado en este entorno"**: Verifica que `PUBLIC_GOOGLE_CLIENT_ID` esté presente en el navegador.
- **"Error de configuración del servidor"**: Verifica que `GOOGLE_CLIENT_ID` esté presente en las variables de entorno de Vercel (Backend).
- **"audience mismatch"**: Asegura que el Client ID usado en el frontend sea exactamente el mismo que el configurado en el backend.
