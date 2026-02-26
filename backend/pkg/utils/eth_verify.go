package utils

import (
	"errors"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// VerifyEthSignature verifies that the given Ethereum personal_sign signature
// was produced by the owner of the given address.
// message: the original plaintext message
// sigHex: the 0x-prefixed hex-encoded signature (65 bytes = r + s + v)
// address: the expected 0x-prefixed Ethereum address
func VerifyEthSignature(message string, sigHex string, address string) error {
	// 1. Hash the message with Ethereum Signed Message prefix
	prefixedMsg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	hash := crypto.Keccak256Hash([]byte(prefixedMsg))

	// 2. Decode the signature
	sigBytes, err := hexutil.Decode(sigHex)
	if err != nil {
		return fmt.Errorf("invalid signature hex encoding: %w", err)
	}

	// Signature must be exactly 65 bytes (r, s, v)
	if len(sigBytes) != 65 {
		return errors.New("signature must be 65 bytes")
	}

	// 3. Normalize the V value
	// For EIP-191 signatures (personal_sign), some clients (like old MetaMask)
	// return V values ending in 27 or 28, but crypto.SigToPub expects 0 or 1.
	if sigBytes[64] == 27 || sigBytes[64] == 28 {
		sigBytes[64] -= 27
	}

	// 4. Recover the public key from the signature and hash
	pubKey, err := crypto.SigToPub(hash.Bytes(), sigBytes)
	if err != nil {
		return fmt.Errorf("signature recovery failed: %w", err)
	}

	// 5. Derive the expected address from the recovered public key
	recoveredAddr := crypto.PubkeyToAddress(*pubKey)

	// 6. Compare with the provided address
	if !strings.EqualFold(recoveredAddr.Hex(), address) {
		return fmt.Errorf("signature mismatch: recovered %s, expected %s", recoveredAddr.Hex(), address)
	}

	return nil
}
