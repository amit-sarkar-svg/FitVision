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

Workout Plans API (Bearer token required, strictly scoped to authenticated user):

- `GET /api/workout-plans` — Get all plans belonging to the authenticated user
- `POST /api/workout-plans` — Create a new plan (`{ name, description }`)
- `GET /api/workout-plans/:id` — Get a specific plan by ID
- `PUT /api/workout-plans/:id` — Update plan name or description
- `DELETE /api/workout-plans/:id` — Delete a plan
- `POST /api/workout-plans/:id/exercises` — Add an exercise (`{ exerciseId }`)
- `DELETE /api/workout-plans/:id/exercises/:exerciseId` — Remove an exercise from plan

Favorites API (Bearer token required, strictly scoped to authenticated user):

- `GET /api/favorites` — Get all favorite exercises belonging to the authenticated user
- `POST /api/favorites/:exerciseId` — Add an exercise to current user's favorites
- `DELETE /api/favorites/:exerciseId` — Remove an exercise from current user's favorites

Workout History & Progress API (Bearer token required, strictly scoped to authenticated user):

- `GET /api/workout-history` — Get all completed workout history belonging to current user
- `POST /api/workout-history` — Record a completed workout session (`{ workoutPlanId, workoutName, exercises, duration }`)
- `GET /api/workout-history/:id` — Get specific workout history record by ID
- `DELETE /api/workout-history/:id` — Delete a workout history record
- `GET /api/progress` — Get calculated user progress statistics (total workouts, total exercises, workouts this week, weekly activity, recent history)

Admin API (Bearer token with `admin` role required):

- `GET /api/admin/exercises`
- `POST /api/admin/exercises`
- `PUT /api/admin/exercises/:id`
- `DELETE /api/admin/exercises/:id`
- `GET /api/admin/users`

## WorkoutPlan MongoDB Model

```javascript
{
  user: ObjectId -> User (required, indexed),
  name: String (required, trimmed),
  description: String (trimmed),
  exercises: [
    {
      exercise: ObjectId -> Exercise,
      order: Number
    }
  ],
  timestamps: true
}
```

Every workout plan operation derives user ownership directly from the verified JWT (`req.user.id`). Users cannot access, modify, or delete plans belonging to other users.

## Favorite MongoDB Model

```javascript
{
  user: ObjectId -> User (required, indexed),
  exercise: ObjectId -> Exercise (required),
  timestamps: true
}
```

Compound index: `{ user: 1, exercise: 1 }` with `{ unique: true }` prevents duplicate favorites. All operations strictly isolate user favorites using `req.user.id`.

## WorkoutHistory MongoDB Model

```javascript
{
  user: ObjectId -> User (required, indexed),
  workoutPlan: ObjectId -> WorkoutPlan (optional reference),
  workoutName: String (required, trimmed),
  exercises: [
    {
      exercise: ObjectId -> Exercise,
      exerciseName: String,
      completed: Boolean
    }
  ],
  totalExercises: Number (required),
  completedExercises: Number (required),
  duration: Number (in seconds),
  completedAt: Date (indexed),
  timestamps: true
}
```

Compound index: `{ user: 1, completedAt: -1 }` enables fast retrieval of recent workout history and weekly progress metrics. All operations derive user ownership from JWT (`req.user.id`).

## Exercise media

Admin exercise uploads are stored locally under `Backend/uploads/exercises/<generated-folder>/`. MongoDB stores only the relative `/uploads/...` URLs; the backend serves those files at `/uploads`.
