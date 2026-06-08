#!/bin/bash

# 1. Update system & Install Docker Engine
apt-get update -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
systemctl enable docker
systemctl start docker
usermod -aG docker vivere

# 2. Siapkan Folder SSH untuk user vivere
USER_HOME="/home/vivere"
mkdir -p $USER_HOME/.ssh

# 3. INJEKSI PUBLIC KEY VM Apps
PUBLIC_KEY_VM1="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJMZ5aPPlGhbjJX4gT0OZZuHfnCElSn/MNdpC1e8TIvT vivere@management"

echo "$PUBLIC_KEY_VM1" >> $USER_HOME/.ssh/authorized_keys

# 4. ATUR HAK AKSES & KEPEMILIKAN 
chmod 700 $USER_HOME/.ssh
chmod 600 $USER_HOME/.ssh/authorized_keys
chown -R vivere:vivere $USER_HOME/.ssh