package middleware

import (
	"log"
	"net/http"

	"cashcowvalley/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	redisLib "github.com/redis/go-redis/v9"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	sredis "github.com/ulule/limiter/v3/drivers/store/redis"
)

// RateLimiter returns a Gin middleware that limits requests by IP.
// Useful for preventing DoS/BruteForce attacks before they hit the Database/Redlock.
func RateLimiter(redisClient *redisLib.Client) gin.HandlerFunc {
	if redisClient == nil {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	// 100 requests per 15 minutes limit strategy
	rate, err := limiter.NewRateFromFormatted("100-M")
	if err != nil {
		log.Fatalf("Kesalahan format rate limiter: %v", err)
	}

	// Buat store di Redis, bukan In-Memory (Sempurna buat Load Balancing)
	store, err := sredis.NewStoreWithOptions(redisClient, limiter.StoreOptions{
		Prefix:   "limiter_api:",
		MaxRetry: 3,
	})
	if err != nil {
		log.Fatalf("Kesalahan store rate limiter: %v", err)
	}

	instance := limiter.New(store, rate)

	middleware := mgin.NewMiddleware(instance, mgin.WithLimitReachedHandler(func(c *gin.Context) {
		utils.SendError(c, http.StatusTooManyRequests, "Terlalu banyak request. Harap tunggu beberapa saat.", nil)
		c.Abort()
	}))

	return middleware
}
