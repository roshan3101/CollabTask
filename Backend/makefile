run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

redis:
	@echo "Starting Redis server..."
	@redis-server || echo "Redis not found. Install Redis or use Docker: make docker-up"

celery:
	celery -A app.core.celery_app worker --loglevel=info --reload

# Local dev (Postgres+Redis in Docker, backend+celery on host)
dev-deps:
	docker-compose up -d postgres redis

dev-migrate:
	aerich upgrade

dev-celery:
	celery -A app.core.celery_app worker --loglevel=info --pool=solo

# Docker commands
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-restart:
	docker-compose restart

docker-clean:
	docker-compose down -v
	docker-compose rm -f

docker-migrate:
	docker-compose exec backend aerich upgrade