package age

import (
	"bufio"
	"io"
	"fmt"
	
	"filippo.io/age"
	"filippo.io/age/armor"	
)

func Decrypt(key string, r io.Reader, wr io.Writer) error {

	ii, err := age.NewScryptIdentity(key)
	
	if err != nil {
		return fmt.Errorf("Failed to create identity, %w", err)
	}

	buf_r := bufio.NewReader(r)
	
	var rr io.Reader
	
	if start, _ := buf_r.Peek(len(armor.Header)); string(start) == armor.Header {
		rr = armor.NewReader(buf_r)
	} else {
		rr = buf_r
	}
	
	dec_r, err := age.Decrypt(rr, ii)
	
	if err != nil {
		return fmt.Errorf("Failed to decrypt text, %w", err)
	}
	
	_, err = io.Copy(wr, dec_r)

	if err != nil {
		return fmt.Errorf("Failed to copy decrypted text to writer, %w", err)
	}

	return nil
}
