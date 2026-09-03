# Rebuild architecture

This project uses a clean runtime graph: entrypoint -> boot -> menu/game/finale. Game state is plain data; World owns terrain; LevelBuilder owns pickups; Player owns movement; HorrorDirector owns escalation; HUD owns display; AudioEngine owns generated sound; Storage owns persistence.
