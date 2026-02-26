package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type Role string

const (
	RoleF2P    Role = "F2P"
	RoleSultan Role = "SULTAN"
	RoleAdmin  Role = "ADMIN"
)

type User struct {
	ID              uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	WalletAddress   string          `gorm:"type:varchar(42);uniqueIndex;not null"`
	Role            Role            `gorm:"type:varchar(20);default:'F2P'"`
	Points          decimal.Decimal `gorm:"type:numeric(18,2);default:0"`
	GoldBalance     decimal.Decimal `gorm:"type:numeric(18,2);default:0;check:gold_balance >= 0"`
	DailyAdCount    int             `gorm:"default:0;check:daily_ad_count >= 0"`
	LastAdDate      *time.Time      // To reset DailyAdCount every 24h
	USDTBalance     decimal.Decimal `gorm:"type:numeric(18,2);default:0;check:usdt_balance >= 0"`
	Nonce           string          `gorm:"type:varchar(255);not null"`
	ReferrerID      *uuid.UUID      `gorm:"type:uuid;index"`
	LastAdWatchedAt *time.Time      // Web2 Care Mechanic (Vitamins)
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`

	Inventory      Inventory
	Cows           []Cow
	TxLogs         []TxLog         `gorm:"foreignKey:UserID"`
	MarketListings []MarketListing `gorm:"foreignKey:SellerID"`
	Web2Stakes     []Web2Stake     `gorm:"foreignKey:UserID"`
	Referrer       *User           `gorm:"foreignKey:ReferrerID"`
}

type Inventory struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
	Grass     int       `gorm:"default:0;check:grass >= 0"`
	Milk      int       `gorm:"default:0;check:milk >= 0"`
	LandSlots int       `gorm:"default:1;check:land_slots >= 1"` // Slots to grow grass
	HasBarn   bool      `gorm:"default:false"`                   // Starter House
}

type CowType string

const (
	TypeStandard   CowType = "STANDARD"
	TypeBabyGolden CowType = "BABY_GOLDEN"
	TypeGolden     CowType = "GOLDEN"
)

type Cow struct {
	ID               uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	OwnerID          uuid.UUID `gorm:"type:uuid;index;not null"`
	Type             CowType   `gorm:"type:varchar(20);default:'STANDARD'"`
	Level            int       `gorm:"default:1;check:level >= 1"`
	Happiness        int       `gorm:"default:100;check:happiness >= 0 AND happiness <= 100"`
	ExpectedLifespan time.Time `gorm:"not null"`
	LastFedAt        *time.Time
	LastHarvestedAt  *time.Time
	CreatedAt        time.Time
}

type TxStatus string

const (
	TxPending    TxStatus = "PENDING"
	TxSuccess    TxStatus = "SUCCESS"
	TxFailed     TxStatus = "FAILED"
	TxRolledBack TxStatus = "ROLLED_BACK"
)

type TxLog struct {
	ID          uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID      uuid.UUID       `gorm:"type:uuid;index;not null"`
	Type        string          `gorm:"type:varchar(50);not null"`
	Amount      decimal.Decimal `gorm:"type:numeric(18,2);not null"`
	Currency    string          `gorm:"type:varchar(10);not null"`
	Status      TxStatus        `gorm:"type:varchar(20);default:'PENDING'"`
	ReferenceID *string         `gorm:"type:varchar(255);uniqueIndex"` // Idempotency
	CreatedAt   time.Time
}

type MarketListing struct {
	ID        uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SellerID  uuid.UUID       `gorm:"type:uuid;index;not null"`
	ItemType  string          `gorm:"type:varchar(50);default:'GRASS'"`
	Quantity  int             `gorm:"not null;check:quantity > 0"`
	PriceUSDT decimal.Decimal `gorm:"type:numeric(18,4);not null;check:price_usdt >= 0.01 AND price_usdt <= 10000"`
	Status    string          `gorm:"type:varchar(20);default:'OPEN'"`
	CreatedAt time.Time
}

type Web2Stake struct {
	ID            uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID        uuid.UUID       `gorm:"type:uuid;index;not null"`
	AssetType     string          `gorm:"type:varchar(20);not null"` // GOLD or MILK
	Amount        decimal.Decimal `gorm:"type:numeric(18,2);not null"`
	StakedAt      time.Time
	LastClaimedAt time.Time
}
