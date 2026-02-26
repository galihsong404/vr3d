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
	ID              uuid.UUID       `gorm:"type:text;primaryKey"`
	WalletAddress   string          `gorm:"type:varchar(42);uniqueIndex;not null"`
	Role            Role            `gorm:"type:varchar(20);default:'F2P'"`
	Points          decimal.Decimal `gorm:"type:numeric(18,2);default:0"`
	GoldBalance     decimal.Decimal `gorm:"type:numeric(18,2);default:0"`
	DailyAdCount    int             `gorm:"default:0"`
	LastAdDate      *time.Time      // To reset DailyAdCount every 24h
	USDTBalance     decimal.Decimal `gorm:"type:numeric(18,2);default:0"`
	Nonce           string          `gorm:"type:varchar(255);not null"`
	ReferrerID      *uuid.UUID      `gorm:"type:text;index"`
	LastAdWatchedAt *time.Time      // Web2 Care Mechanic (Vitamins)
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`

	Inventory      Inventory       `gorm:"foreignKey:UserID"`
	Cows           []Cow           `gorm:"foreignKey:OwnerID"`
	TxLogs         []TxLog         `gorm:"foreignKey:UserID"`
	MarketListings []MarketListing `gorm:"foreignKey:SellerID"`
	Web2Stakes     []Web2Stake     `gorm:"foreignKey:UserID"`
	Referrer       *User           `gorm:"foreignKey:ReferrerID"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Inventory struct {
	ID        uuid.UUID `gorm:"type:text;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:text;uniqueIndex;not null" json:"user_id"`
	Grass     int       `gorm:"default:0" json:"grass"`
	Milk      int       `gorm:"default:0" json:"milk"`
	LandSlots int       `gorm:"default:1" json:"land_slots"`
	HasBarn   bool      `gorm:"default:false" json:"has_barn"`
}

func (i *Inventory) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

type CowType string

const (
	TypeStandard   CowType = "STANDARD"
	TypeBabyGolden CowType = "BABY_GOLDEN"
	TypeGolden     CowType = "GOLDEN"
)

type Cow struct {
	ID               uuid.UUID `gorm:"type:text;primaryKey"`
	OwnerID          uuid.UUID `gorm:"type:text;index;not null"`
	Type             CowType   `gorm:"type:varchar(20);default:'STANDARD'"`
	Level            int       `gorm:"default:1"`
	Happiness        int       `gorm:"default:100"`
	ExpectedLifespan time.Time `gorm:"not null"`
	LastFedAt        *time.Time
	LastHarvestedAt  *time.Time
	CreatedAt        time.Time
}

func (c *Cow) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

type TxStatus string

const (
	TxPending    TxStatus = "PENDING"
	TxSuccess    TxStatus = "SUCCESS"
	TxFailed     TxStatus = "FAILED"
	TxRolledBack TxStatus = "ROLLED_BACK"
)

type TxLog struct {
	ID          uuid.UUID       `gorm:"type:text;primaryKey"`
	UserID      uuid.UUID       `gorm:"type:text;index;not null"`
	Type        string          `gorm:"type:varchar(50);not null"`
	Amount      decimal.Decimal `gorm:"type:numeric(18,2);not null"`
	Currency    string          `gorm:"type:varchar(10);not null"`
	Status      TxStatus        `gorm:"type:varchar(20);default:'PENDING'"`
	ReferenceID *string         `gorm:"type:varchar(255);uniqueIndex"` // Idempotency
	CreatedAt   time.Time
}

func (t *TxLog) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

type MarketListing struct {
	ID        uuid.UUID       `gorm:"type:text;primaryKey"`
	SellerID  uuid.UUID       `gorm:"type:text;index;not null"`
	ItemType  string          `gorm:"type:varchar(50);default:'GRASS'"`
	Quantity  int             `gorm:"not null"`
	PriceUSDT decimal.Decimal `gorm:"type:numeric(18,4);not null"`
	Status    string          `gorm:"type:varchar(20);default:'OPEN'"`
	CreatedAt time.Time
}

func (m *MarketListing) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

type Web2Stake struct {
	ID            uuid.UUID       `gorm:"type:text;primaryKey"`
	UserID        uuid.UUID       `gorm:"type:text;index;not null"`
	AssetType     string          `gorm:"type:varchar(20);not null"` // GOLD or MILK
	Amount        decimal.Decimal `gorm:"type:numeric(18,2);not null"`
	StakedAt      time.Time
	LastClaimedAt time.Time
}

func (w *Web2Stake) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}
