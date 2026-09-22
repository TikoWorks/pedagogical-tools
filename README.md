# Pedagogical tools

## Teknologiat

- Next.js
- TypeScript
- Supabase
- PostgreSQL
- Supabase Realtime
- Vitest
- Cypress

## Kehitysympäristön pystytys

### 1. Kloonaa repository

git clone <repository-url>

cd <projektin-nimi>

### 2. Asenna riippuvuudet

npm install

### 3. Ympäristömuuttujat

Luo projektin juureen `.env.local` `.env.example`-tiedoston pohjalta.

Tarvittavat Supabase-arvot saat tiimiltä.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

`.env.local`-tiedostoa ei commitoida GitHubiin.

### 4. Käynnistä sovellus

npm run dev

Sovellus käynnistyy oletuksena osoitteeseen `http://localhost:3000`.

## Supabase

Sovellus käyttää yhteistä Supabase-kehitysprojektia. Next.js-yhteys Supabaseen on valmiiksi konfiguroitu.

Supabase CLI:tä tai Supabase Dashboard -käyttöoikeutta ei tarvita tavalliseen frontend-kehitykseen tai sovelluksen ajamiseen.
