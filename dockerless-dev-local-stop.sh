
#!/bin/bash

echo "🛑 Arrêt des serveurs de développement..."

# Fonction pour arrêter un processus avec confirmation et option force
stop_process() {
    local name="$1"
    local pid="$2"

    if [ -n "$pid" ]; then
        echo "🔍 Processus $name trouvé (PID: $pid)."
        read -p "Voulez-vous arrêter $name ? (o/n) " confirm
        if [[ "$confirm" =~ ^[Oo]$ ]]; then
            kill "$pid"
            sleep 1
            if ps -p "$pid" > /dev/null; then
                echo "⚠️ $name ne s'est pas arrêté. Forcer l'arrêt ? (o/n)"
                read -p "" force
                if [[ "$force" =~ ^[Oo]$ ]]; then
                    kill -9 "$pid"
                    echo "✅ $name forcé à s'arrêter."
                else
                    echo "⏭ $name laissé en cours d'exécution."
                fi
            else
                echo "✅ $name arrêté avec succès."
            fi
        else
            echo "⏭ $name laissé en cours d'exécution."
        fi
    else
        echo "⚠️ Aucun processus $name trouvé."
    fi
}

# Trouver PID du serveur PHP
php_pid=$(ps aux | grep "[p]hp -S 127.0.0.1:8000" | awk '{print $2}')
stop_process "PHP Server" "$php_pid"

# Trouver PID du serveur npm run dev
npm_pid=$(ps aux | grep "[n]pm run dev" | awk '{print $2}')
stop_process "Frontend (npm run dev)" "$npm_pid"

echo "✅ Script terminé."