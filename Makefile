DC_DIR_PATH = ./infra/docker-compose

## dc_up: Run docker-compose up
dc_up:
	@echo "Running docker-compose up"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml up -d

## dc_up_dev: Run docker-compose up for development
dc_up_dev:
	@echo "Running docker-compose up for development"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml -f ${DC_DIR_PATH}/docker-compose.yaml up --build -d

## dc_down: Run docker-compose down
dc_down:
	@echo "Running docker-compose down"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml down

## dc_down_v: Run docker-compose down with volumes
dc_down_v:
	@echo "Running docker-compose down with volumes"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml down -v

## dc_logs_all: Show docker-compose logs for all services
dc_logs_all:
	@echo "Showing docker-compose logs for all services"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml logs

## dc_logs_all_f: Show docker-compose logs for all services with follow
dc_logs_all_f:
	@echo "Showing docker-compose logs for all services with follow"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml logs -f

## dc_logs_app: Show docker-compose logs for app service
dc_logs:
	@echo "Showing docker-compose logs for ${service}"
	docker-compose -f ${DC_DIR_PATH}/docker-compose.yaml logs ${service}