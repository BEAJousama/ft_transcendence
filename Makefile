# Set the name of the project
NAME			:= ft_transcendence

# Define the Docker Compose command to use (`docker-compose` for v1 and `docker compose` for v2)
CMPS_CMD		:= docker compose

# Specify the path to the Docker Compose file
CMPS_FILE		:= ./docker-compose.yml

# Define the complete Docker Compose command with the specified project name and file
COMPOSE			:= $(CMPS_CMD) -f $(CMPS_FILE) -p $(NAME)


# define sed cmd for macos and linux
ifeq ($(shell uname),Darwin)
SED := sed -i '' 's/hostname/'"`hostname`"'/g'
else
SED := sed -i 's/hostname/'"`hostname`"'/g'
endif

# Target to bring up the project, creating volumes if necessary
$(NAME): env
	@$(COMPOSE) up --build

# Target to build the project services
build: env
	@$(COMPOSE) build

env:
	@cp ./frontend/.env-sample ./frontend/.env
	@$(SED) ./frontend/.env
	@cp ./backend/.env-sample ./backend/.env
	@$(SED) ./backend/.env

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
	@rm -rf $(VOLUMES)

# Target to perform a full rebuild of the project
re: fclean $(NAME)

# Declare these targets as phony, meaning they don't correspond to actual files
.PHONY: all build ps up down voldown fclean re