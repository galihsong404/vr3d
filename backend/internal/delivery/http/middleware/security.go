package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders applies essential security headers (Helmet-equivalent) to prevent Clickjacking, XSS, and MIME-sniffing.
// It also applies strict CORS policies to protect against Cross-Site Request Forgery (CSRF).
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. CORS Policy
		origin := c.Request.Header.Get("Origin")
		allowedOrigin := os.Getenv("FRONTEND_URL")
		if allowedOrigin == "" {
			allowedOrigin = "http://localhost:3000"
		}

		// BUG FIX: Hanya izinkan origin yang PERSIS cocok atau localhost di dev mode
		// Sebelumnya ENV != production membuka CORS ke SEMUA origin (CSRF vector)
		isAllowed := origin == allowedOrigin
		if os.Getenv("ENV") != "production" {
			isAllowed = isAllowed ||
				origin == "http://localhost:3000" ||
				origin == "http://localhost:3001" ||
				origin == "http://127.0.0.1:3000"
		}

		if isAllowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			c.Header("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Ad-Signature")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Max-Age", "43200")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// 2. Security Headers
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()")

		// BUG FIX: Content-Security-Policy (Anti-XSS Layer Terakhir)
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.walletconnect.com wss://*.walletconnect.com")

		// BUG FIX: Referrer-Policy (Cegah kebocoran URL internal ke third-party)
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Next()
	}
}

// BodySizeLimiter prevents OOM (Out Of Memory) crashes by dropping oversized requests
// before they are parsed by JSON Unmarshal or read into memory.
func BodySizeLimiter(limit int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limit)
		c.Next()
	}
}
