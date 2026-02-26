package usecase

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"cashcowvalley/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AdWebhookUsecase struct {
	db *gorm.DB
}

func NewAdWebhookUsecase(db *gorm.DB) *AdWebhookUsecase {
	return &AdWebhookUsecase{db: db}
}

// ProcessAdReward validates the SSV signature from the Ad Network and grants the reward.
// This prevents users from using Postman to spoof "I just watched an ad" payloads.
// eventID is used as an Idempotency Key to prevent REPLAY ATTACKS.
func (uc *AdWebhookUsecase) ProcessAdReward(ctx context.Context, rawPayload string, signature string, userID string, eventID string) error {
	secret := os.Getenv("AD_NETWORK_SECRET")
	if secret == "" {
		return errors.New("konfigurasi ad secret tidak ditemukan")
	}

	if eventID == "" {
		return errors.New("event_id tidak disertakan, ditolak karena tidak ada jaminan idempotensi")
	}

	// 1. Verify HMAC SHA256 Signature using RAW PAYLOAD (Zero Format Tampering)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(rawPayload))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expectedSignature)) {
		return errors.New("SSV Signature tidak valid. Payload dimanipulasi")
	}

	// 2. Eksekusi Reward (Database Transaction)
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("Format UserID tidak valid")
	}

	// BUG FIX: Tambahkan timeout agar DB transaction tidak menggantung selamanya (Zombie Transaction)
	ctxDB, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()

	return uc.db.WithContext(ctxDB).Transaction(func(tx *gorm.DB) error {
		// BUG FIX: Pindahkan INSERT ke awal transaksi untuk membunuh kembaran Asynchronous (TOCTOU Race Condition)
		txLog := domain.TxLog{
			UserID:      uid,
			Type:        "AD_REWARD",
			Amount:      decimal.NewFromInt(50),
			Currency:    "HAPPINESS",
			Status:      domain.TxSuccess,
			ReferenceID: &eventID, // Idempotency Key disimpan di sini
		}
		// Jika 100 Request masuk bersamaan, 1 akan menang, 99 kalah terkena Unique Index Violation di database langsung!
		if err := tx.Create(&txLog).Error; err != nil {
			return errors.New("Webhook sudah pernah diproses (Replay Attack/Parallel Race dicegah)")
		}

		// Update User's Ad tracking and Gold balance
		var user domain.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ?", uid).First(&user).Error; err != nil {
			return errors.New("User tidak ditemukan")
		}

		// Daily Limit Logic (Max 50 Ads)
		now := time.Now()
		if user.LastAdDate == nil || user.LastAdDate.Format("2006-01-02") != now.Format("2006-01-02") {
			user.DailyAdCount = 0
			user.LastAdDate = &now
		}

		if user.DailyAdCount >= 50 {
			return errors.New("Daily ad limit reached (Max 50/day)")
		}

		user.DailyAdCount++
		user.LastAdWatchedAt = &now

		// Reward Gold
		goldReward := decimal.NewFromInt(10) // 10 Gold per ad
		user.GoldBalance = user.GoldBalance.Add(goldReward)

		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		// Temukan sapi pertama milik user yang butuh di-boost
		var cow domain.Cow
		errCow := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("owner_id = ? AND type = ?", uid, domain.TypeStandard).Order("created_at ASC").First(&cow).Error

		if errCow == nil && cow.Happiness < 100 {
			cow.Happiness += 50
			if cow.Happiness > 100 {
				cow.Happiness = 100
			}
			if err := tx.Save(&cow).Error; err != nil {
				return err
			}
		} else {
			// BUG FIX (DL3): Jika sapi sudah 100% bahagia atau tidak ada sapi standar, berikan Grass sebagai reward
			var inv domain.Inventory
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				Where("user_id = ?", uid).First(&inv).Error; err != nil {
				return errors.New("Inventory tidak ditemukan")
			}
			inv.Grass += 5
			if err := tx.Save(&inv).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
