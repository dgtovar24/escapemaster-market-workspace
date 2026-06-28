# Migración del marketplace hacia `manager/api` como sistema canónico

Este documento describe cómo retirar la deuda operativa actual en `marketplace`
sin romper la experiencia B2C. El objetivo es mover la autoridad de
organizaciones, salas, calendario, reservas y pagos a `manager/api` mientras
`marketplace/web` conserva su papel como canal de discovery, checkout y
experiencia jugador.

## Objetivo

La migración debe eliminar la doble escritura operativa y convertir a
`marketplace` en consumidor de contratos canónicos. Durante la transición, el
producto debe seguir pudiendo buscar salas, mostrar fichas públicas y procesar
checkouts sin perder trazabilidad.

## Deuda que se retira

La deuda principal está en que `marketplace` mezcla datos de lectura con estado
operativo. Estos puntos son los más sensibles:

- uso operativo de `marketplace_bookings`,
- validación local de disponibilidad antes del checkout,
- onboarding enterprise que depende de organización local o heurísticas,
- reconciliación de pagos fuera del ledger canónico,
- dependencia de `marketplace/master` para CRUD operativo.

## Principios de migración

La migración debe seguir estos principios para minimizar riesgos.

1. Primero se introduce el contrato canónico; después se redirige el tráfico.
2. No se borra una tabla heredada hasta que deje de participar en decisiones
   operativas.
3. Toda etapa debe poder verificarse con métricas y rollback.
4. El marketplace puede mantener read-models propios, pero ya no puede
   adjudicarse la autoridad del booking ni del pago.

## Fase 1: Preparación

En esta fase se introducen identificadores, flags y trazabilidad sin cambiar el
comportamiento visible para el usuario.

### Cambios

- Añadir referencias canónicas a los registros heredados del marketplace.
- Añadir `source_channel = marketplace` donde falte.
- Registrar `organization_id`, `room_id`, `booking_id` y `payment_id`
  canónicos cuando existan.
- Introducir feature flags para disponibilidad, hold y booking canónicos.

## Fase 2: Disponibilidad canónica

En esta fase `marketplace/web` deja de calcular por su cuenta la disponibilidad
que enseña al usuario.

### Resultado esperado

- El calendario visible se obtiene desde `manager/api`.
- El checkout se bloquea si no existe disponibilidad canónica.
- Las tablas heredadas del marketplace ya no participan en la decisión de si un
  slot está libre.

## Fase 3: Hold y booking canónicos

En esta fase se mueve la creación de la reserva operativa a `manager/api`.

### Resultado esperado

- `marketplace/web` crea holds canónicos antes del checkout.
- La confirmación final devuelve un `booking_id` canónico.
- `marketplace_bookings` pasa a ser espejo temporal, auditoría o compatibilidad
  heredada, pero no fuente de verdad.

## Fase 4: Pagos y conciliación canónicos

En esta fase el pago del marketplace se reconcilia siempre contra un booking
canónico y deja de cerrarse de forma aislada.

### Resultado esperado

- El webhook o callback del checkout actualiza `manager/api`.
- El ledger operativo de pagos vive en `manager/api`.
- Refunds y payouts se gestionan desde contratos canónicos.

## Fase 5: Retirada de flujos heredados

En esta fase se eliminan decisiones de negocio que siguen viviendo en
`marketplace`.

### Objetivos

- Retirar la lógica que usa `marketplace_bookings` para validar slots.
- Retirar la lógica que crea reservas finales fuera de `manager/api`.
- Reducir `marketplace/master` a funciones administrativas temporales o apagarlo
  si sus capacidades ya existen en `manager`.
- Sustituir heurísticas de enlace organizacional por provisioning canónico.

## Datos heredados

La migración necesita una política explícita para los datos ya existentes.

### `marketplace_bookings`

Los registros históricos no deben borrarse de inmediato. Primero deben
clasificarse en tres grupos:

- reservas ya reconciliadas con booking canónico,
- reservas pendientes de mapear,
- registros fallidos o solo analíticos.

### `marketplace_payments`

Los pagos heredados deben enlazarse al ledger canónico cuando exista una
equivalencia clara. Si no existe, deben marcarse como históricos y excluirse de
las decisiones operativas actuales.

## Compatibilidad temporal

La convivencia temporal es necesaria porque ambos repositorios seguirán
desplegándose por separado durante un tiempo.

### Reglas

- Los componentes de UI del marketplace pueden seguir leyendo estructuras
  heredadas mientras se alimenten con ids canónicos.
- Ninguna operación nueva debe nacer solo en tablas heredadas.
- Toda incidencia de conciliación debe poder trazarse desde `marketplace` hasta
  `manager/api`.

## Checklist de corte

El equipo no debe retirar las rutas heredadas hasta verificar estas señales:

- El 100% del calendario visible usa disponibilidad canónica.
- El 100% de las reservas nuevas tienen `booking_id` canónico.
- El 100% de los pagos nuevos reconcilian contra `manager/api`.
- Soporte puede ver reservas de marketplace desde `manager/gestor` o
  `manager/panel-admin`.
- Las métricas de ventas no dependen de `marketplace_bookings` como tabla
  primaria.

## Rollback

Cada fase debe tener un mecanismo de reversión rápido mientras dure la
convivencia.

- Feature flag para volver a lectura heredada del calendario.
- Feature flag para desactivar holds canónicos.
- Reprocesado de eventos desde colas o logs.
- Dashboard de conciliación para detectar diferencias tras rollback.

## Siguientes pasos

Después de esta migración documental, el siguiente paso de implementación es
crear los contratos en `manager/api`, introducir flags en `marketplace/web` y
mover cada flujo en el orden descrito arriba.
