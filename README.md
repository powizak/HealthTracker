# HealthTracker
Family health record tracking application.

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
- **Statistics:** Overview of illness frequency.

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

## How to Run on Synology (Docker)

1. Upload the entire project to your Synology NAS.
### Aktualizace na Synology (Troubleshooting)
Pokud po aktualizaci souborů a provedení **Action > Build** stále vidíte starou verzi aplikace, je to způsobeno agresivním cachováním Docker images.

**Řešení 1: Smazání starých Images (Doporučeno)**
1. V Container Manageru jděte do záložky **Image**.
2. Smažte obrazy `healthtracker-health-frontend` a `healthtracker-health-backend`.
3. Vraťte se do **Project** a zvolte **Action > Build**.

**Řešení 2: Verzování v docker-compose.yml**
V souboru `docker-compose.yml` můžete explicitně pojmenovat image s novou verzí:
```yaml
services:
  health-frontend:
    build: ./client
    image: health-frontend:v1.1  # Změňte verzi při každém update
```
Tím donutíte Docker vytvořit úplně nový image.2. Create a `.env` file in the same folder as `docker-compose.yml` (or set the variables in the Docker environment settings in Synology UI):
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=some_secret_string
   ```
3. Open **Container Manager** (or Docker) on Synology.
4. In the **Project** section, create a new project and select the path to the uploaded folder (where `docker-compose.yml` is located).
5. Ensure you select **"Build"** or **"Re-build"** when running/creating the project to load changes (including `.dockerignore`).
6. The application will run on port **8081** of your NAS (e.g., `http://192.168.1.100:8081`).

**Note:** If you update files, it is best to stop the old project in Container Manager, delete it, and create it again (or choose "Build" in the action menu) to ensure new images are built without errors.

## Local Development

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

## Google Account
Don't forget to add your NAS URL (e.g., `http://192.168.1.100:8081`) to "Authorized JavaScript origins" and "Authorized redirect URIs" in the Google Cloud Console, otherwise login will not work!

## How to Update on Synology
To update the application with new features (Family Sharing, Vaccinations, etc.):

1. **Stop the Container**: Go to Synology Container Manager, select the project, and click **Stop**.
2. **Update Files**: Upload the new/modified files to your NAS, overwriting the existing ones (specifically `server/`, `client/`, and `package.json` files).
3. **Rebuild**:
   - In Container Manager > Projects, select your project.
   - Click **Action** > **Build**.
   - **Important**: This ensures the new code is baked into the Docker image.
4. **Start**: Once the build is complete, the project will start automatically. The database will migrate automatically on the first run.
