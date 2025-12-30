# HealthTracker
Aplikace pro sledování zdravotních záznamů rodiny.

- **Backend:** Node.js (Express) with `google-auth-library` and `googleapis`
- **Frontend:** React (Vite) with `react-router-dom` and `lucide-react`
- **Database:** SQLite (local file `health.db`)
- **Styling:** Tailwind CSS (configured for v3)
- **Deployment:** Docker & Docker Compose

## Features
- **User Authentication:** Sign in with Google (OAuth 2.0).
- **Family Management:** Create profiles for family members (name, color).
- **Health Records:** Track illnesses, symptoms, dates.
    - Assign records to specific family members.
    - Attach files (photos, PDFs) to records.
    - Sync records to Google Calendar (requires setup).
- **Treatments:** Log medications and therapies within records.
- **Dashboard:**
    - Filter by family member or search text.
    - Visualization of active/past illnesses.
- **Statistics:** overview of illness frequency.

## Getting Started

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Project and configure **OAuth consent screen**.
3. Create **OAuth 2.0 Client ID** (Web application).
   - **Authorized JavaScript origins:** `http://localhost:5173` (for dev), `http://localhost:3000`
   - **Authorized/redirect URIs:** `http://localhost:3000`, `postmessage`
4. Enable **Google Calendar API** for the project.
5. Copy the **Client ID** and **Client Secret**.

### 2. Backend Setup
1. Navigate to `/server`.
2. Create or update `.env`:
   ```env
   PORT=3000
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   SESSION_SECRET=your_secret_key
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm start
   ```

### 3. Frontend Setup
1. Navigate to `/client`.
2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## Jak spustit na Synology (Docker)

1. Nahrajte celý projekt na Synology NAS.
2. Vytvořte soubor `.env` ve stejné složce jako `docker-compose.yml` (nebo nastavte proměnné v prostředí Dockeru v Synology UI):
   ```
   GOOGLE_CLIENT_ID=vase_google_client_id
   ```
   GOOGLE_CLIENT_ID=vase_google_client_id
   GOOGLE_CLIENT_SECRET=vase_google_client_secret
   SESSION_SECRET=nejake_tajne_heslo
   ```
3. Otevřete **Container Manager** (nebo Docker) na Synology.
4. V sekci **Project** (Projekt) vytvořte nový projekt, vyberte cestu k nahrané složce (kde je `docker-compose.yml`).
5. Ujistěte se, že při spouštění/vytváření zvolíte možnost **"Build"** nebo **"Re-build"** (Sestavit znovu), aby se načetly změny (včetně `.dockerignore`).
6. Aplikace poběží na portu **8081** vašeho NASu (např. `http://192.168.1.100:8081`).

**Poznámka:** Pokud aktualizujete soubory, je nejlepší starý projekt v Container Manageru zastavit, smazat a vytvořit znovu (nebo v akci zvolit "Build"), aby se vytvořily nové obrazy bez chyb.

## Lokální Vývoj

### Backend
```bash
cd server
npm install
node server.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Účet Google
Nezapomeňte přidat URL vašeho NASu (např. `http://192.168.1.100:8081`) do "Authorized JavaScript origins" a "Authorized redirect URIs" v Google Cloud Console, jinak nebude fungovat přihlášení!
