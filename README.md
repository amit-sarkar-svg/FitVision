# FitVision

FitVision is a React/Vite fitness learning application with an Express, MongoDB, and Mongoose backend.

## Local development

Start the local MongoDB container:

```bash
docker start fitvision-mongodb
```

Start the backend:

```bash
cd Backend
npm install
npm run dev
```

Start the frontend in a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The MongoDB database is `fitvision` and the development connection is `mongodb://127.0.0.1:27017/fitvision`.

## Configuration

Copy `Backend/.env.example` to `Backend/.env` and set a strong, private `JWT_SECRET`. Never commit the `.env` file.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fitvision
JWT_SECRET=replace_with_a_secure_secret
```

Seed the existing Dumbbell Bench Press record:

```bash
cd Backend
npm run seed:exercises
```

## Create the first admin

Public registration always creates a `user`. Create an admin only through the backend script:

```bash
cd Backend
ADMIN_NAME="Admin Name" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="use-a-strong-password" \
npm run create-admin
```

The script hashes the password, refuses an existing email, and never prints the password.

## API

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)

Public exercises:

- `GET /api/exercises`
- `GET /api/exercises/:id`

Admin API (Bearer token with `admin` role required):

- `GET /api/admin/exercises`
- `POST /api/admin/exercises`
- `PUT /api/admin/exercises/:id`
- `DELETE /api/admin/exercises/:id`
- `GET /api/admin/users`

## Exercise media

Admin exercise uploads are stored locally under `Backend/uploads/exercises/<generated-folder>/`. MongoDB stores only the relative `/uploads/...` URLs; the backend serves those files at `/uploads`.
