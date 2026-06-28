# Requisitos Pendientes de Desarrollo

Tras analizar detalladamente los documentos `Escape-Master corpotativa.pdf` y `EscapeMaster-Modelo-de-Niveles-Puntos-y-Recurrencia.pdf`, y contrastarlos con el código actual del proyecto, la infraestructura core (Marketplace, Reservas Base y Master Admin) está sentada, pero faltan por desarrollar los siguientes módulos y lógicas estructurales clave.

## 👥 Para Jugadores (Marketplace / B2C)

### 1. Sistema de Gamificación y Niveles Vitalicios (Prioridad Alta)
* **Puntos y Decay:** Sistema de puntos basado en acciones reales (reservas, reseñas), con un decay anual del 30%.
* **Niveles (1 al 5):** Lógica para subir de nivel cumpliendo hitos obligatorios (ej. Nivel 3 exige 10 reservas + 5 reseñas + 1 funcionalidad clave).
* **Beneficios Rolling (12 meses):** Separar el estatus histórico vitalicio de los beneficios económicos basados en la actividad reciente (últimos 12 meses).
* **Rankings y Recompensas:** Interfaz de rankings y sistema de recompensas para la comunidad.

### 2. Modelo Económico Dinámico por Recurrencia
* Calcular dinámicamente el fee de gestión al jugador en base a su actividad en los últimos 12 meses:
  * 0-5 reservas: **0,50€**
  * 6-20 reservas: **0,40€**
  * +20 reservas: **0,30€**
*(Actualmente el fee en `BookingWidget` está fijo a 0.30€).*

### 3. Pagos Individuales (Reservas por persona)
* Modificar el flujo de checkout actual (donde un usuario paga el grupo entero) para permitir pagos divididos, de modo que cada persona del equipo pague solo su parte (el pago puramente individual flexible).

### 4. Búsqueda Inmediata ("Qué hay libre ahora")
* Listado y filtros dedicados a disponibilidad real de "última hora", priorizando según la clasificación (Destacados > Nivel 2 > Nivel 3).

### 5. Servicios de Alto Valor (Fase 2)
* **Reventa de Reservas:** Mercado secundario para vender reservas que no se pueden usar (con retención de fee de gestión).
* **Ruta Completa:** Lógica de carrito o multipago para agrupar varias compras de Escape Rooms sucesivos en una sola transacción ("Ruta").
* **Completar Equipo / Matchmaking:** Funcionalidad para que usuarios sin grupo se unan a reservas con huecos disponibles.

---

## 🏢 Para Propietarios (Master Admin / B2B)

### 1. Modelo de Negocio B2B
* **Sistema de Pujas (Destacados):** Desarrollar un modelo donde las salas pujen económicamente para tener visibilidad premium regional.
* **Comisiones B2B Escalonadas:** Incluir motor de cobro reteniendo un **5%** a afiliados que usen el calendario propio nativo y **8%** a las reservas con integraciones de calendarios externos.

### 2. Estados y Clasificación de ERs
* Clasificar legalmente las salas no solo en activa/inactiva, sino en **Nivel 1 (Destacados), Nivel 2 (Con Acuerdo) y Nivel 3 (Sin Acuerdo)**.

### 3. Gestión Financiera Exhaustiva (Implementado)
* **Liquidaciones:** Módulo funcional de Payouts para seguimiento de saldos.
* **Reportes:** Generador de reportes financieros y de reservas (CSV/PDF).

### 4. Dashboards de Métricas Clave (Implementado)
* **Dashboard v2:** Widgets de MRR, Proyección de ingresos y Heatmap de 
  actividad global.
  * Reservas por usuario activo (últimos 12m).
  * Porcentaje de usuarios recurrentes (≥2 reservas).
  * GMV (Valor bruto) por usuario.
  * Distribución de base de datos de usuarios por niveles.
  * Adopción de servicios Fase 2.
  * Margen neto por reserva.
