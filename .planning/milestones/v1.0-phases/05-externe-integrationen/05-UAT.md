---
status: testing
phase: 05-externe-integrationen
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: 2026-03-10T10:00:00Z
updated: 2026-03-10T10:00:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Server und N8N von Null starten. Kill alle laufenden Prozesse. `pnpm dev` starten — Server bootet ohne Fehler, Payload Admin unter /admin erreichbar, keine Startup-Crashes.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Server und N8N von Null starten. Kill alle laufenden Prozesse. `pnpm dev` starten — Server bootet ohne Fehler, Payload Admin unter /admin erreichbar, keine Startup-Crashes.
result: [pending]

### 2. Stripe "Jetzt bezahlen" Button sichtbar
expected: Im Kunden-Dashboard eine Anfrage mit Status "bestaetigt" oeffnen. Ein aktiver "Jetzt bezahlen"-Button ist sichtbar (nicht ausgegraut). Der Button zeigt den Gesamtpreis der Anfrage.
result: [pending]

### 3. Stripe Checkout Redirect
expected: Klick auf "Jetzt bezahlen" leitet zu Stripe Checkout weiter (stripe.com Domain). Die Checkout-Seite zeigt den korrekten Betrag in EUR. Zurueck-Navigation fuehrt wieder zur Anfrage.
result: [pending]

### 4. Stripe Webhook Status-Update
expected: Nach erfolgreicher Testbezahlung (Stripe Test-Karte 4242424242424242) wechselt der Anfrage-Status automatisch auf "bezahlt". Kein manuelles Seiten-Reload noetig bei erneutem Aufrufen der Anfrage.
result: [pending]

### 5. N8N Docker Container startet
expected: `docker compose -f docker-compose.n8n.yml up` startet N8N erfolgreich. N8N UI erreichbar unter http://localhost:5678. Keine Fehler in Docker Logs.
result: [pending]

### 6. Webhook-Fehler Badge im Admin
expected: In Payload Admin (/admin) ist in der Sidebar ein Badge/Indikator fuer Webhook-Fehler sichtbar. Wenn keine Fehler vorliegen: Badge zeigt 0 oder ist versteckt. Wenn Fehler vorliegen: Badge zeigt Anzahl in Rot.
result: [pending]

### 7. Env-Variablen dokumentiert
expected: `.env.example` enthaelt alle neuen Variablen: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET — jeweils mit Platzhalter-Werten.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
