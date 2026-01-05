
#!/bin/bash
# next-clean-cache.sh
# Script pour supprimer le cache de Next.js

echo "Suppression du cache Next.js..."
if [ -d ".next/cache" ]; then
    rm -rf .next/cache
    echo "✅ Cache supprimé avec succès."
else
    echo "ℹ️ Aucun cache trouvé dans .next/cache."
fi
