package redis

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	redisLib "github.com/redis/go-redis/v9"
)

var Client *redisLib.Client

func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Println("[REDIS] WARNING: REDIS_URL kosong. Mode DEV: Menjalankan tanpa Redis.")
		return
	}

	opt, err := redisLib.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("[REDIS] Format REDIS_URL salah: %v", err)
	}

	Client = redisLib.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := Client.Ping(ctx).Err(); err != nil {
		log.Fatalf("[REDIS] Gagal terhubung ke Redis: %v", err)
	}

	log.Println("[REDIS] Koneksi berhasil!")
}

// AcquireLock implements a simple distributed lock.
// In a true cluster, use Redsync. For single instance Redis, SETNX is sufficient.
func AcquireLock(ctx context.Context, key string, expiration time.Duration) (string, bool) {
	if Client == nil {
		return "dummy-lock-no-redis", true
	}

	token := uuid.New().String()
	success, err := Client.SetNX(ctx, "lock:"+key, token, expiration).Result()
	if err != nil {
		return "", false
	}
	return token, success
}

// ReleaseLock releases the lock using a Lua script to ensure atomicity.
func ReleaseLock(ctx context.Context, key, token string) bool {
	if Client == nil {
		return true
	}

	script := `
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			return 0
		end
	`
	res, err := Client.Eval(ctx, script, []string{"lock:" + key}, token).Result()
	if err != nil {
		return false
	}
	return res.(int64) == 1
}
