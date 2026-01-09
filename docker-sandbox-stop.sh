docker compose down
echo "Sandbox arrêtées."

docker container prune -f
echo "Conteneurs supprimées."

docker system prune -a -f
echo "Cache docker complètement effacé"
