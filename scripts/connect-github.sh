#!/bin/bash

# 1. PROTEKSI ANTI-SUDO
if [ "$EUID" -eq 0 ]; then
   echo "========================================================================="
   echo "    ERROR: JANGAN JALANKAN SKRIP INI MENGGUNAKAN 'sudo'!"
   echo "    GitHub Actions Runner melarang keras konfigurasi sebagai root/sudo."
   echo "    Silakan jalankan ulang murni sebagai user biasa: ./connect-github.sh"
   echo "========================================================================="
   exit 1
fi

# 2. Otomatis mengunci direktori kerja ke folder biner runner
cd /home/vivere/actions-runner || { echo "[-] Error: Folder actions-runner tidak ditemukan!"; exit 1; }

clear
echo "========================================================================="
echo "   Connect Github runner ini ke repository/organization GitHub Anda     "
echo "========================================================================="
echo "    PASTIKAN ANDA RUN INI DI MANAGEMENT VM!"
echo "========================================================================="
echo ""
read -p "1. Masukkan URL Repository/Org GitHub kamu : " REPO_URL
read -p "2. Masukkan Registration Token dari GitHub : " RUNNER_TOKEN
echo ""

if [ -z "$REPO_URL" ] || [ -z "$RUNNER_TOKEN" ]; then
    echo "[-] Error: URL dan Token tidak boleh kosong!"
    exit 1
fi

echo "[+] Memulai registrasi ke GitHub..."
./config.sh --url "$REPO_URL" --token "$RUNNER_TOKEN" --unattended

echo "[+] Menginstal Runner sebagai Systemd Background Service..."
# Bagian ini otomatis minta password sudo secara aman hanya untuk daftarin service OS
sudo ./svc.sh install
sudo ./svc.sh start

echo ""
echo "========================================================================="
echo "   [✓] RUNNER BERHASIL DAFTAR & TERHUBUNG KE GITHUB!                     "
echo "========================================================================="