# Backend Setup (Express + TypeScript + MongoDB Atlas)

## Prerequisites
- Node.js (v18+ recommended)
- Yarn or npm
- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)

## Getting Started

1. **Clone the repository and navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file:**
   Copy `.env.example` to `.env` and enter your MongoDB Atlas URI.
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```

4. **Run the backend in development:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Test the API:**
   - Visit [http://localhost:5000/api/example](http://localhost:5000/api/example)
   - You should see: `{ "message": "Hello from the backend!" }`

## Build and start in production

```bash
npm run build
npm start
```

---

## File structure
- `src/index.ts`: Main server file, MongoDB connection.
- `src/routes/example.ts`: Sample route.
- `.env.example`: Environment variable example.

---

## Next Steps

- Add your own routes and models in `src/`.
- Connect your frontend to the backend API endpoints.
