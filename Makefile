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

# Target to build the project
all: $(NAME)

# Target to bring up the project, creating volumes if necessary
$(NAME): env
	@$(COMPOSE) up --build

# Target to create the .env files for the project
env:
	@cat ./frontend/.env.sample | $(SED_CMD) > ./frontend/.env
	@cat ./backend/.env.sample ./backend/.env.local | $(SED_CMD) > ./backend/.env

# Target to build the project services
build: env
	@$(COMPOSE) build

# Target to start the project services
up:
	@$(COMPOSE) up

# Target to show the status of the project services
ps:
	@$(COMPOSE) ps

# Target to stop the project services
down:
	@$(COMPOSE) down

# Target to stop the project services and remove volumes
clean:
	@$(COMPOSE) down --volumes

# Target to remove the project volumes and clean up the project directory
fclean: clean
	@$(COMPOSE) rm -v -f
	@read -n 1 -p "Do you want to delete the contents of the 'db' folder? (y/n): " answer; \
	if [ "$$answer" == "y" ]; then \
		find ./db -mindepth 1 -delete; \
	fi

# Target to perform a full rebuild of the project
re: fclean $(NAME)

# Declare these targets as phony, meaning they don't correspond to actual files
.PHONY: all env build up ps down clean fclean re
