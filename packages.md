# Přehled použitých balíčků

Tento soubor obsahuje srovnání aktuálně použitých verzí balíčků v projektu oproti jejich nejnovějším dostupným verzím.

## Client (`/client`)

| Balíček | Typ | Použitá verze | Nejnovější verze | Poznámka |
| :--- | :--- | :--- | :--- | :--- |
| `@react-oauth/google` | dependency | `^0.13.4` | `0.13.4` | Aktuální |
| `axios` | dependency | `^1.13.2` | `1.13.2` | Aktuální |
| `lucide-react` | dependency | `^0.562.0` | `0.562.0` | Aktuální |
| `react` | dependency | `^19.2.0` | `19.2.0` | Aktuální (Latest Stable) |
| `react-dom` | dependency | `^19.2.0` | `19.2.0` | Aktuální (Latest Stable) |
| `react-router-dom` | dependency | `^7.11.0` | `7.11.0` | Aktuální |
| `@eslint/js` | devDependency | `^9.39.1` | `9.39.1` | Aktuální |
| `@types/react` | devDependency | `^19.2.5` | `19.2.5` | Aktuální |
| `@types/react-dom` | devDependency | `^19.2.3` | `19.2.3` | Aktuální |
| `@vitejs/plugin-react` | devDependency | `^5.1.1` | `5.1.1` | Aktuální |
| `autoprefixer` | devDependency | `^10.4.17` | `10.4.23` | Minor update available |
| `eslint` | devDependency | `^9.39.1` | `9.39.1` | Aktuální |
| `globals` | devDependency | `^16.5.0` | `17.0.0` | Major update available |
| `postcss` | devDependency | `^8.4.35` | `8.4.35` | Aktuální |
| `tailwindcss` | devDependency | `^3.4.17` | `3.4.19` (v4 alpha: `4.1.x`) | Aktuální pro v3 |
| `vite` | devDependency | `^5.4.10` | `6.4.1` / `7.x` | **Downgradováno** kvůli kompatibilitě na Windows (Rollup issue) |
| `@rollup/rollup-win32-x64-msvc` | devDependency | `^4.22.4` | `4.x` | Přidáno manuálně pro Windows fix |

## Server (`/server`)

| Balíček | Typ | Použitá verze | Nejnovější verze | Poznámka |
| :--- | :--- | :--- | :--- | :--- |
| `cookie-session` | dependency | `^2.1.1` | `2.1.1` | Aktuální |
| `cors` | dependency | `^2.8.5` | `2.8.5` | Aktuální |
| `dotenv` | dependency | `^17.2.3` | `17.2.3` | Aktuální |
| `express` | dependency | `^5.2.1` | `5.2.1` | Aktuální (v5 beta/stable) |
| `google-auth-library` | dependency | `^10.5.0` | `10.5.0` | Aktuální |
| `googleapis` | dependency | `^169.0.0` | `169.0.0` | Aktuální |
| `multer` | dependency | `^2.0.2` | `2.0.2` | Aktuální |
| `sqlite` | dependency | `^5.1.1` | `5.1.1` | Aktuální |
| `sqlite3` | dependency | `^5.1.7` | `5.1.7` | Aktuální |

*Poznámka: Stav "Aktuální" vychází z kontroly provedené 3.1.2026. U některých balíčků může existovat novější "Major" verze, která ale není kompatibilní s aktuálním nastavením projektu (např. Vite v6+).*
