.DEFAULT_GOAL := help

.PHONY: help install dev build serve check eslint eslint_fix format formatcheck lint formatlint up down logs clean reset-db

help: ## list all targets
	@grep -E '^[a-z_-]+:.*##' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  \033[1m%-12s\033[0m %s\n", $$1, $$2}'

install: ## install dependencies (frozen lockfile)
	pnpm install --frozen-lockfile

dev: ## dev server (frontend + API) on http://localhost:3000
	pnpm dev

build: ## production build into dist/
	pnpm build

serve: build ## production server (dist/ + API) on http://localhost:3000
	pnpm serve

check: ## typecheck the whole project using tsc
	pnpm exec tsc --noEmit

eslint: ## lint code using eslint
	pnpm exec eslint .

eslint_fix: ## lint code using eslint with autofix enabled
	pnpm exec eslint --fix .

format: ## format code using prettier
	pnpm exec prettier --write .

formatcheck: ## check code formatting using prettier
	pnpm exec prettier --check .

lint: formatcheck check eslint ## check formatting, types and lint rules

formatlint: check eslint_fix format ## fix formatting and autofixable lint issues

up: ## build and start the Docker container on http://localhost:8080
	docker compose up -d --build

down: ## stop the Docker container
	docker compose down

logs: ## follow the Docker container logs
	docker compose logs -f

clean: ## remove build output
	rm -rf dist

reset-db: ## wipe the local dev database (names + queue state)
	rm -rf data
