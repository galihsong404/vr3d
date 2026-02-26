#!/bin/bash
# Cash Cow Valley - Unified Deployment Script
# Execution: ./deploy.sh

echo "🐄 [CASH COW VALLEY] Memulai Proses Deployment..."

# 1/5. Update system dependency
echo "📦 1/5 Menginstal Docker & Docker Compose (Jika belum ada)..."
if ! command -v docker &> /dev/null
then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# 2/5. Persiapan File Environment (Secrets)
echo "🔐 2/5 Memeriksa Kunci Rahasia (.env)..."
if [ ! -f .env ]; then
    # BUG FIX: JANGAN pernah auto-copy .env.example ke production!
    echo "❌ FATAL: File .env tidak ditemukan!"
    echo "   Buat file .env secara manual dengan secrets yang aman sebelum deploy."
    echo "   Contoh: cp .env.example .env && nano .env"
    exit 1
fi

# 3/5. Bangun Ulang Image DULU
echo "🏗️ 3/5 Membangun Image Docker di balik layar..."
docker-compose build

# 4/5. Pergantian Container (Zero-Downtime concept)
echo "🔄 4/5 Melakukan Injeksi Server Rilis Baru..."
docker-compose up -d --remove-orphans

# 5/5. Cleanup
echo "🧹 5/5 Membersihkan sampah Docker lama agar SSD VPS tidak penuh..."
docker system prune -f

echo "✅ SELESAI! Sistem Cash Cow Valley sekarang aktif tanpa Downtime berarti!"
echo "👉 Ketik 'docker-compose logs -f' untuk melihat log server secara real-time."
