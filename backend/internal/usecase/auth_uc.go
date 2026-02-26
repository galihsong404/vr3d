package usecase

import (
	"context"
	"errors"
	"os"
	"time"

	"cashcowvalley/backend/internal/domain"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthUsecase struct {
	db *gorm.DB
}

func NewAuthUsecase(db *gorm.DB) *AuthUsecase {
	return &AuthUsecase{db: db}
}

// LoginOrRegister verifies a wallet. If new, demands a referrer code. Returns JWT.
func (uc *AuthUsecase) LoginOrRegister(ctx context.Context, walletAddress string, referrerWallet string) (string, error) {
	var user domain.User
	var isNewUser bool

	err := uc.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Try to find the user
		err := tx.Where("wallet_address = ?", walletAddress).First(&user).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				isNewUser = true
			} else {
				return err
			}
		}

		if isNewUser {
			// MANDATORY REFERRAL CHECK
			if referrerWallet == "" {
				return errors.New("A referral code (inviter's wallet address) is strictly required to register")
			}
			if referrerWallet == walletAddress {
				return errors.New("Cannot use your own wallet as a referral code")
			}

			var referrer domain.User
			if err := tx.Where("wallet_address = ?", referrerWallet).First(&referrer).Error; err != nil {
				return errors.New("Invalid referral code. Inviter not found")
			}

			// Create new user with the mandatory referrer
			user = domain.User{
				WalletAddress: walletAddress,
				ReferrerID:    &referrer.ID,
				Role:          domain.RoleF2P,
				Nonce:         uuid.NewString(), // A dummy nonce for future Web3 signature verification
			}

			if err := tx.Create(&user).Error; err != nil {
				return err
			}

			// Give new user a Starter Pack (Inventory with House and LandSlot)
			inv := domain.Inventory{
				UserID:    user.ID,
				Grass:     0,
				Milk:      0,
				LandSlots: 1,    // Basic plot to grow grass
				HasBarn:   true, // Basic House
			}
			if err := tx.Create(&inv).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return "", err
	}

	// Generate JWT
	return generateJWT(user)
}

func generateJWT(user domain.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super_secret_dev_key_123!" // Fallback for dev
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":        user.ID.String(),
		"wallet_address": user.WalletAddress,
		"role":           string(user.Role),
		"exp":            time.Now().Add(time.Hour * 24).Unix(), // 24 hours
	})

	return token.SignedString([]byte(secret))
}
