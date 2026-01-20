# Notu API

Express TypeScript API untuk Notu Notes Extension dengan MongoDB Atlas dan Cloudinary.

## Credentials yang Dibutuhkan

### 1. MongoDB Atlas
1. Buka https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create Cluster (pilih FREE tier)
4. Database Access > Add Database User (catat username & password)
5. Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)
6. Clusters > Connect > Connect your application
7. Copy connection string, ganti `<password>` dengan password user

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notu?retryWrites=true&w=majority
```

### 2. Cloudinary
1. Buka https://cloudinary.com
2. Sign up / Login
3. Dashboard > Copy credentials:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Deploy ke Vercel
1. Push folder `api` ke GitHub repository
2. Buka https://vercel.com
3. Import repository
4. Set Environment Variables di Vercel:
   - MONGODB_URI
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - CORS_ORIGIN (set ke `*` atau extension ID)
5. Deploy

### 4. Update Extension
Setelah deploy, update `.env` di root folder:
```
REACT_APP_API_URL=https://your-api.vercel.app/api
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/notes | Get all notes |
| GET | /api/notes/:id | Get single note |
| POST | /api/notes | Create note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |
| POST | /api/notes/upload | Upload image |

## Development

```bash
cd api
npm install
cp .env.example .env
# Edit .env dengan credentials
npm run dev
```
