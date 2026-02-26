package config

import (
	"log"
	"os"
	"time"

	"cashcowvalley/backend/internal/domain"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")

	dbLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Silent,
			Colorful:      true,
		},
	)

	var db *gorm.DB
	var err error

	if dsn == "" {
		log.Println("[DB] WARNING: DATABASE_URL kosonng. Menggunakan SQLite Lokal (cashcow.db) untuk testing...")
		db, err = gorm.Open(sqlite.Open("cashcow.db"), &gorm.Config{Logger: dbLogger})
	} else {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: dbLogger})
	}

	if err != nil {
		log.Fatalf("[DB] Gagal menyambung ke database: %v", err)
	}

	// Connection Pool Settings
	// BUG FIX: Tangani error dari db.DB() — sebelumnya jika gagal, sqlDB nil dan panic crash
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("[DB] Gagal mendapatkan koneksi pool: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	// BUG FIX: Tutup koneksi idle yang terlalu lama menganggur agar pool tidak bocor
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	// Auto Migrate
	log.Println("[DB] Menjalankan Auto Migration...")
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Inventory{},
		&domain.Cow{},
		&domain.TxLog{},
		&domain.MarketListing{},
	)
	if err != nil {
		log.Fatalf("[DB] Gagal melakukan migrasi: %v", err)
	}

	log.Println("[DB] Koneksi ke PostgreSQL berhasil dan Migration Selesai!")
	return db
}
