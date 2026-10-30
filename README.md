# SoundSoul – Music Playlist Management System

**EC4307 Web Application Development – Mini Project**

A full-stack music platform where **Artists** upload tracks and **Listeners** discover music, create playlists, and stream audio in the browser.

**Live repo:** [https://github.com/Amindra-12345/Music-Platform](https://github.com/Amindra-12345/Music-Platform)

---

## Features

| Feature | Description |
|--------|-------------|
| **Auth & roles** | Register / login with JWT · roles: `artist`, `listener` |
| **Track CRUD** | Artists upload mp3, list catalog, update metadata, **delete** track + file |
| **Playlist CRUD** | Create, edit, delete playlists · add / remove tracks |
| **Discovery** | Community tracks (MongoDB) + Trending / Sinhala / Recommended (iTunes API) |
| **Player** | Play / pause, progress bar, volume, previous / next |
| **Search** | Filter by title, artist, genre |
| **UI** | Dark / light theme toggle · SoundSoul logo · responsive layout |
| **Mobile** | Bottom navigation on small screens |

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS 4
- Axios
- React state + localStorage

**Backend**
- Bun / Node.js + Express 5
- MongoDB + Mongoose 8
- JWT + bcryptjs
- Multer (audio uploads)

---

## Project Structure

```
Music-Platform/
├── client/                 # React frontend
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── Components/
│       │   ├── Logo.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ListenerView.jsx
│       │   ├── ArtistView.jsx
│       │   └── PlaylistView.jsx
│       ├── pages/
│       │   └── Register.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
└── server/                 # Express API
    ├── Config/
    ├── Middleware/
    ├── Models/
    ├── Routes/
    ├── controllers/
    ├── uploads/            # Audio files (gitignored)
    ├── server.js
    └── .env                # Not committed – create locally
```

---

## Prerequisites

- **Node.js 18+** or **Bun**
- **MongoDB** (local Community Server or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Git

---

## Setup & Run

### 1. Clone

```bash
git clone https://github.com/Amindra-12345/Music-Platform.git
cd Music-Platform
```

### 2. Backend

```bash
cd server
bun install          # or: npm install
```

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/musicapp
JWT_SECRET=your_strong_secret_here
PORT=5000
```

Start the API:

```bash
bun run dev          # or: npm start
# → http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

Open the Vite URL in your browser.

---

## Usage Guide

1. **Register as Artist** → Studio Uploader → upload an mp3 → manage catalog (play / delete).
2. **Register as Listener** → Home → browse Community / Trending / Sinhala tracks → play music.
3. **Playlists** → create a playlist → add community tracks → remove songs or delete the playlist.
4. **Theme** → use the sun / moon button in the header to switch dark / light mode.
5. **Search** → type in the top search bar to filter tracks.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login → JWT |
| `POST` | `/api/tracks/upload` | Artist | Upload audio |
| `GET` | `/api/tracks` | No | List community tracks |
| `GET` | `/api/tracks/my-catalog` | Artist | Own tracks |
| `PUT` | `/api/tracks/:id` | Artist | Update track |
| `DELETE` | `/api/tracks/:id` | Artist | Delete track + file |
| `POST` | `/api/playlists` | Yes | Create playlist |
| `GET` | `/api/playlists/me` | Yes | My playlists |
| `PUT` | `/api/playlists/:id` | Yes | Update playlist |
| `DELETE` | `/api/playlists/:id` | Yes | Delete playlist |
| `PUT` | `/api/playlists/:id/add` | Yes | Add track to playlist |
| `DELETE` | `/api/playlists/:id/songs/:songId` | Yes | Remove track from playlist |

Protected routes need header:

```http
Authorization: Bearer <token>
```

---

## Database (MongoDB)

- **users** – name, email, password (hashed), role  
- **tracks** – title, artist (ref User), genre, audioUrl, accessMode  
- **playlists** – name, description, user (ref), songs[] (ref Track), isPublic  

---

## Scripts

**Server**

```bash
bun run dev      # watch mode
bun start        # production-style start
```

**Client**

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview build
```

---

## Notes

- Audio files are stored under `server/uploads/` and served at `/uploads/...`.
- Do **not** commit `.env` or `node_modules`.
- iTunes Search API is used for trending / Sinhala / recommended previews (no key required for basic search).
- Default theme is **dark**; preference is saved in `localStorage`.

---

## Module info

| Item | Detail |
|------|--------|
| Module | EC4307 Web Application Development |
| GitHub | https://github.com/Amindra-12345/Music-Platform (older one )
https://github.com/Amindra-Edirisuriya/Music-Platform(new one because of changing username) |

---

## License

This project is submitted for academic purposes (EC4307).
