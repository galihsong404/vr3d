package middleware

import (
	"log"
	"net/http"

	"cashcowvalley/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

// GlobalErrorHandler catches panics and formats them into the standard JSON Envelope
func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[CRITICAL PANIC] %v", err)
				
				// Standardized 500 Error
				utils.SendError(c, http.StatusInternalServerError, "Internal Server Error", nil)
				c.Abort()
			}
		}()
		c.Next()
	}
}
