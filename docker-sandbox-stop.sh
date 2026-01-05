docker compose down
echo "Sandbox arrêtées."

docker container prune -f
echo "Conteneurs supprimées."