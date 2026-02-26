package handler

import (
	"net/http"

	"cashcowvalley/backend/internal/usecase"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUC *usecase.AuthUsecase
}

func NewAuthHandler(authUC *usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{authUC: authUC}
}

// LoginOrRegisterHandler processes Web3 Wallet logins.
func (h *AuthHandler) LoginOrRegisterHandler(c *gin.Context) {
	var req struct {
		WalletAddress  string `json:"wallet_address" binding:"required"`
		ReferrerWallet string `json:"referrer_wallet"` // Client might try without it
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wallet address is required"})
		return
	}

	token, err := h.authUC.LoginOrRegister(c.Request.Context(), req.WalletAddress, req.ReferrerWallet)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"token":  token,
	})
}
