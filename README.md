# GreenShare

GreenShare is a not-for-profit platform that promotes a sustainable sharing economy by enabling local communities to exchange goods online securely and efficiently.

---

## 🚀 Getting Started

### 1. Start the Full Development Environment

This command starts the backend (`flaskapp`), frontend (`frontend`), and database (`db`) services:

```bash
docker compose up --build
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests

### 2. Run Tests Manually (On Demand)

Tests are located in the `/tests` directory and use `pytest`. To run tests manually:

```bash
docker compose run --rm tests
```

This starts a temporary container and runs all test cases in the `tests/` folder.

---

## 🙅 Prevent Tests from Running Automatically

The `tests` service is configured **not to start automatically** when using `docker compose up`.

### ✅ To confirm:

When running:

```bash
docker compose up
```

Only `frontend`, `flaskapp`, and `db` services will be started.

To bring up tests only when needed, always use:

```bash
docker compose run --rm tests
```

---

## 📁 Project Structure

```
GreenShare/
├── backend/             # Flask backend source
├── frontend/            # Next.js frontend source
├── tests/               # Pytest test suite
├── docker-compose.yml   # Multi-service Docker environment
└── README.md            # Project instructions
```

---

## 🔗 Useful Links

- API: [http://localhost:5000](http://localhost:4000)
- Frontend: [http://localhost:3000](http://localhost:3000)

For any issues or setup questions, please contact the project maintainer.