package handler

import (
	"net/http"

	"cashcowvalley/backend/internal/usecase"
	"cashcowvalley/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AdminHandler struct {
	adminUC *usecase.AdminUsecase
}

func NewAdminHandler(adminUC *usecase.AdminUsecase) *AdminHandler {
	return &AdminHandler{adminUC: adminUC}
}

// TransferHandler transfers in-app items from admin to a target user.
// POST /admin/transfer
func (h *AdminHandler) TransferHandler(c *gin.Context) {
	adminIDStr := c.GetString("user_id")
	adminID, err := uuid.Parse(adminIDStr)
	if err != nil {
		utils.SendError(c, http.StatusUnauthorized, "Admin ID tidak valid", nil)
		return
	}

	var req struct {
		TargetWallet string `json:"target_wallet" binding:"required"`
		ItemType     string `json:"item_type" binding:"required"`
		Amount       string `json:"amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Format payload salah", nil)
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Format amount tidak valid", nil)
		return
	}

	if err := h.adminUC.TransferItem(c.Request.Context(), adminID, req.TargetWallet, req.ItemType, amount); err != nil {
		utils.SendError(c, http.StatusUnprocessableEntity, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Transfer berhasil!", nil, nil)
}

// ListUsersHandler returns all registered users.
// GET /admin/users
func (h *AdminHandler) ListUsersHandler(c *gin.Context) {
	users, err := h.adminUC.ListUsers(c.Request.Context())
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Gagal mengambil data users", nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Users berhasil diambil", users, nil)
}

// StatsHandler returns platform statistics.
// GET /admin/stats
func (h *AdminHandler) StatsHandler(c *gin.Context) {
	stats, err := h.adminUC.GetPlatformStats(c.Request.Context())
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Gagal mengambil statistik", nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Stats berhasil diambil", stats, nil)
}
