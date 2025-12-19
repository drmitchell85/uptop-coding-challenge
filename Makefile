.PHONY: help dev stop install clean

help: ## Show available commands
	@echo "Uptop Coding Challenge - Development Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev      - Start both frontend and backend"
	@echo "  make stop     - Stop all services"
	@echo "  make install  - Install all dependencies"
	@echo "  make clean    - Clean node_modules and build artifacts"

dev: ## Start both frontend and backend
	@echo "🚀 Starting backend on http://localhost:3001"
	@echo "🚀 Starting frontend on http://localhost:3000"
	@echo ""
	@echo "Press Ctrl+C to stop all services"
	@echo ""
	@$(MAKE) -j2 backend-dev frontend-dev

backend-dev:
	@cd backend && npm run start:dev

frontend-dev:
	@cd frontend && npm run dev

stop: ## Stop all services
	@echo "🛑 Stopping services..."
	@-pkill -f "nest start" 2>/dev/null || true
	@-pkill -f "next dev" 2>/dev/null || true
	@echo "✅ Services stopped"

install: ## Install dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Done!"

clean: ## Clean build artifacts
	@echo "🗑️  Cleaning..."
	@rm -rf backend/node_modules backend/dist
	@rm -rf frontend/node_modules frontend/.next
	@echo "✅ Done!"

.DEFAULT_GOAL := help
