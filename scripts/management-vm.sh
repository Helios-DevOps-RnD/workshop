#!/bin/bash

DOMAIN_HARBOR="harbor-vivere.evanlwp.my.id"
EMAIL_ALERTS="admin@evanlwp.my.id"
USER_HOME="/home/vivere"

# 1. Update system & Install utility packages + Certbot Base
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git jq wget certbot

# 2. Install Docker Engine (Otomatis menyertakan Docker Compose Plugin terbaru)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker
usermod -aG docker vivere

# 3. OTOMATISASI PEMBUATAN SSH KEY UNTUK USER: vivere
mkdir -p $USER_HOME/.ssh
chmod 700 $USER_HOME/.ssh

sudo -u vivere ssh-keygen -t ed25519 -N "" -f $USER_HOME/.ssh/id_ed25519

chmod 600 $USER_HOME/.ssh/id_ed25519
chmod 644 $USER_HOME/.ssh/id_ed25519.pub
chown -R vivere:vivere $USER_HOME/.ssh

# 4. FIX KERNEL LIMIT UNTUK SONARQUBE (Wajib agar tidak crash)
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" >> /etc/sysctl.conf

# 5. GENERATE LET'S ENCRYPT SSL CERTIFICATE (Standalone Mode)
certbot certonly \
  --standalone \
  -d $DOMAIN_HARBOR \
  --non-interactive \
  --agree-tos \
  --email $EMAIL_ALERTS

# Siapkan direktori sertifikat resmi untuk Harbor
mkdir -p /data/cert
cp /etc/letsencrypt/live/$DOMAIN_HARBOR/fullchain.pem /data/cert/server.crt
cp /etc/letsencrypt/live/$DOMAIN_HARBOR/privkey.pem /data/cert/server.key

# 6. RUN SONARQUBE CONTAINER 
docker run -d --name sonarqube \
  -p 9000:9000 \
  --restart always \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community

# 7. DOWNLOAD & CONFIGURE HARBOR
cd $USER_HOME
wget https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz
tar xvzf harbor-offline-installer-v2.10.0.tgz
cd harbor

# Salin template konfigurasi dan injeksi parameter domain + SSL
cp harbor.yml.tmpl harbor.yml
sed -i "s/hostname: reg.mydomain.com/hostname: $DOMAIN_HARBOR/g" harbor.yml
sed -i "s|certificate: /your/certificate/path|certificate: /data/cert/server.crt|g" harbor.yml
sed -i "s|private_key: /your/private/key/path|private_key: /data/cert/server.key|g" harbor.yml

# 8. Jalankan Instalasi Komponen Harbor Containers (Native HTTPS 443)
./install.sh

# Atur hak kepemilikan folder ke user vivere
chown -R vivere:vivere $USER_HOME/harbor


# 9. PREPARE GITHUB ACTIONS RUNNER BINARIES & INTERACTIVE HELPER
RUNNER_DIR="$USER_HOME/actions-runner"
mkdir -p $RUNNER_DIR
cd $RUNNER_DIR

wget https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.317.0.tar.gz
rm ./actions-runner-linux-x64-2.317.0.tar.gz

# Install internal dependencies OS
./bin/installdependencies.sh
# kembalikan kepemilikan seluruh file ke user vivere
chown -R vivere:vivere $USER_HOME

