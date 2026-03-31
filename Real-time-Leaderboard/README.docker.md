Quick Docker run
----------------

Prerequisites: Docker and Docker Compose installed.

From the project folder (the folder containing `API` and `UI`), run:

```bash
docker compose up --build

docker compose up 
```

After startup:

- UI: http://localhost:7034
- API: http://localhost:5000
- SQL Server: localhost:1433 (SA / Your_strong!Passw0rd)
- Redis: localhost:6379

Notes:
- Change `Your_strong!Passw0rd` in `docker-compose.yml` before using in production.
- The API will attempt to apply EF Core migrations automatically and seed data on first run.
