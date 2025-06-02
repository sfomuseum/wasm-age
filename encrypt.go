package age

import (
	"io"
	"fmt"
	
	"filippo.io/age"
	"filippo.io/age/armor"	
)

func Encrypt(key string, r io.Reader, wr io.WriteCloser) error {
	
	rcpt, err := age.NewScryptRecipient(key)

	if err != nil {
		return fmt.Errorf("Failed to create recipient, %w", err)
	}

	armor_wr := armor.NewWriter(wr)
	
	age_wr, err :=  age.Encrypt(armor_wr, rcpt)

	if err != nil {
		return fmt.Errorf("Failed to encrypt, %w", err)
	}

	_, err = io.Copy(age_wr, r)

	if err != nil {
		return fmt.Errorf("Failed to copy encrypted data, %w", err)
	}

	err = age_wr.Close()

	if err != nil {
		return fmt.Errorf("Failed to close encrypted data after writing, %w", err)
	}

	err = armor_wr.Close()

	if err != nil {
		return fmt.Errorf("Failed to close armor after writing, %w", err)
	}
	
	return nil
}
