#!/bin/bash
# Script d'installation Ubuntu 24.04 LTS pour BeninConnect

echo "🚀 Démarrage de l'installation de BeninConnect sur Ubuntu 24.04..."

# 1. Mise à jour du système
sudo apt update && sudo apt upgrade -y

# 2. Installation de NGINX, Git, et Certbot (Let's Encrypt)
sudo apt install nginx git certbot python3-certbot-nginx -y

# 3. Installation de Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Installation de PM2 en global
sudo npm install -g pm2

# 5. Création du dossier d'application
sudo mkdir -p /var/www/beninconnect
sudo chown -R $USER:$USER /var/www/beninconnect

echo "✅ Dépendances installées !"
echo ""
echo "📝 PROCHAINES ÉTAPES MANUELLES :"
echo "1. Clonez ce dépôt dans /var/www/beninconnect"
echo "2. Copiez deploy/nginx/emairie.conf vers /etc/nginx/sites-available/emairie.conf"
echo "3. Activez le site : sudo ln -s /etc/nginx/sites-available/emairie.conf /etc/nginx/sites-enabled/"
echo "4. Relancez NGINX : sudo systemctl reload nginx"
echo "5. Depuis /var/www/beninconnect, lancez 'npm install' puis 'npm run build'"
echo "6. Lancez le backend sécurisé avec : pm2 start ecosystem.config.cjs"
echo "7. Générez le SSL Wildcard avec Certbot (DNS challenge recommandé)"
