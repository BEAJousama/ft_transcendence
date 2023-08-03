# Set the name of the project
NAME			:= ft_transcendence

# Define the Docker Compose command to use (`docker-compose` for v1 and `docker compose` for v2)
CMPS_CMD		:= docker compose

# Specify the path to the Docker Compose file
CMPS_FILE		:= ./docker-compose.yml

# Define the complete Docker Compose command with the specified project name and file
COMPOSE			:= $(CMPS_CMD) -f $(CMPS_FILE) -p $(NAME)

# Define the hostname command
HOSTNAME_CMD := $(shell hostname)

# Define the sed command to replace 'hostname' with the actual hostname
SED_CMD := sed -e "s/hostname/$(HOSTNAME_CMD)/g"

# Target to bring up the project, creating volumes if necessary
$(NAME): env
	@$(COMPOSE) up --build

# Target to build the project services
build: env
	@$(COMPOSE) build

env:
	@cat ./frontend/.env.sample | $(SED_CMD) > ./frontend/.env
	@cat ./backend/.env.sample ./backend/.env.local | $(SED_CMD) > ./backend/.env

# Target to show the status of the project services
ps:
	@$(COMPOSE) ps

# Target to start the project services
up:
	@$(COMPOSE) up

# Target to stop the project services
down:
	@$(COMPOSE) down

# Target to stop the project services and remove volumes
voldown:
	@$(COMPOSE) down --volumes

# Target to remove the project volumes and clean up the project directory
fclean: voldown
	@$(COMPOSE) rm -v
	@rm -rf ./backend/.env
	@rm -rf ./frontend/.env

clear: fclean
	@rm -rf ./backend/node_modules
	@rm -rf ./frontend/node_modules

# Target to perform a full rebuild of the project
re: fclean $(NAME)

# Declare these targets as phony, meaning they don't correspond to actual files
.PHONY: all build ps clear up down voldown fclean re