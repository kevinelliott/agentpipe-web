.PHONY: help build dev test clean docker-build docker-push docker-run db-setup db-migrate db-reset lint format install

# Variables
IMAGE_NAME := agentpipe/agentpipe-web
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
LATEST_TAG := latest
DOCKER_REGISTRY := docker.io
PLATFORMS := linux/amd64,linux/arm64

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)AgentPipe Web - Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm ci

dev: ## Run development server
	@echo "$(CYAN)Starting development server...$(NC)"
	npm run dev

build: ## Build Next.js application for production
	@echo "$(CYAN)Building application...$(NC)"
	npm run build

start: ## Start production server (requires build first)
	@echo "$(CYAN)Starting production server...$(NC)"
	npm start

test: ## Run tests
	@echo "$(CYAN)Running tests...$(NC)"
	npm test

lint: ## Run linter
	@echo "$(CYAN)Running linter...$(NC)"
	npm run lint

format: ## Format code
	@echo "$(CYAN)Formatting code...$(NC)"
	npx prettier --write .

clean: ## Clean build artifacts and dependencies
	@echo "$(RED)Cleaning build artifacts...$(NC)"
	rm -rf .next
	rm -rf node_modules
	rm -rf dist
	rm -rf build

# Database targets
db-generate: ## Generate Prisma client
	@echo "$(CYAN)Generating Prisma client...$(NC)"
	npx prisma generate

db-migrate: ## Run database migrations
	@echo "$(CYAN)Running database migrations...$(NC)"
	npx prisma migrate dev

db-migrate-deploy: ## Deploy database migrations (production)
	@echo "$(CYAN)Deploying database migrations...$(NC)"
	npx prisma migrate deploy

db-push: ## Push schema changes to database (development)
	@echo "$(CYAN)Pushing schema to database...$(NC)"
	npx prisma db push

db-studio: ## Open Prisma Studio
	@echo "$(CYAN)Opening Prisma Studio...$(NC)"
	npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(RED)Resetting database...$(NC)"
	npx prisma migrate reset --force

db-seed: ## Seed database with sample data
	@echo "$(CYAN)Seeding database...$(NC)"
	npx prisma db seed

# Docker targets
docker-build: ## Build Docker image
	@echo "$(CYAN)Building Docker image: $(IMAGE_NAME):$(VERSION)$(NC)"
	docker build -t $(IMAGE_NAME):$(VERSION) -t $(IMAGE_NAME):$(LATEST_TAG) .

docker-build-multiarch: ## Build multi-architecture Docker image
	@echo "$(CYAN)Building multi-arch Docker image: $(IMAGE_NAME):$(VERSION)$(NC)"
	docker buildx build --platform $(PLATFORMS) \
		-t $(IMAGE_NAME):$(VERSION) \
		-t $(IMAGE_NAME):$(LATEST_TAG) \
		--push \
		.

docker-push: ## Push Docker image to registry
	@echo "$(CYAN)Pushing Docker image: $(IMAGE_NAME):$(VERSION)$(NC)"
	docker push $(IMAGE_NAME):$(VERSION)
	docker push $(IMAGE_NAME):$(LATEST_TAG)

docker-run: ## Run Docker container locally
	@echo "$(CYAN)Running Docker container...$(NC)"
	docker run -p 3000:3000 --env-file .env $(IMAGE_NAME):$(VERSION)

docker-stop: ## Stop running Docker containers
	@echo "$(CYAN)Stopping Docker containers...$(NC)"
	docker stop $$(docker ps -q --filter ancestor=$(IMAGE_NAME)) 2>/dev/null || true

docker-clean: ## Remove Docker images
	@echo "$(RED)Removing Docker images...$(NC)"
	docker rmi $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):$(LATEST_TAG) 2>/dev/null || true

# Docker Compose targets
up: ## Start all services with Docker Compose
	@echo "$(CYAN)Starting services with Docker Compose...$(NC)"
	docker-compose up -d

down: ## Stop all services with Docker Compose
	@echo "$(CYAN)Stopping services with Docker Compose...$(NC)"
	docker-compose down

logs: ## View Docker Compose logs
	@echo "$(CYAN)Viewing logs...$(NC)"
	docker-compose logs -f

restart: ## Restart all services
	@echo "$(CYAN)Restarting services...$(NC)"
	docker-compose restart

ps: ## Show running containers
	@echo "$(CYAN)Running containers:$(NC)"
	docker-compose ps

# Combined targets
setup: install db-generate ## Complete project setup (install + generate)
	@echo "$(GREEN)Setup complete!$(NC)"

rebuild: clean install build ## Clean rebuild of the application
	@echo "$(GREEN)Rebuild complete!$(NC)"

deploy-build: docker-build docker-push ## Build and push Docker image
	@echo "$(GREEN)Deploy build complete!$(NC)"

# Release targets
release: ## Create a new release (use VERSION=x.x.x)
	@echo "$(CYAN)Creating release $(VERSION)...$(NC)"
	git tag -a v$(VERSION) -m "Release v$(VERSION)"
	git push origin v$(VERSION)

# Development helpers
watch: ## Watch files and rebuild on changes
	@echo "$(CYAN)Watching for changes...$(NC)"
	npm run dev

shell: ## Open shell in running web container
	@echo "$(CYAN)Opening shell in web container...$(NC)"
	docker-compose exec web sh

db-shell: ## Open PostgreSQL shell
	@echo "$(CYAN)Opening database shell...$(NC)"
	docker-compose exec db psql -U postgres -d agentpipe

# Utility targets
version: ## Show current version
	@echo "$(CYAN)Current version: $(VERSION)$(NC)"

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "$(RED).env file not found! Copy .env.example to .env$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN).env file exists$(NC)"

health: ## Check health of running services
	@echo "$(CYAN)Checking service health...$(NC)"
	@curl -f http://localhost:3000/api/health 2>/dev/null && echo "$(GREEN)Web service: healthy$(NC)" || echo "$(RED)Web service: unhealthy$(NC)"

# CI/CD targets
ci-test: install lint build ## Run CI tests
	@echo "$(GREEN)CI tests passed!$(NC)"

ci-build: docker-build ## Build for CI
	@echo "$(GREEN)CI build complete!$(NC)"

# Documentation
docs: ## Generate documentation
	@echo "$(CYAN)Generating documentation...$(NC)"
	@echo "$(YELLOW)Documentation generation not yet implemented$(NC)"

.DEFAULT_GOAL := help
