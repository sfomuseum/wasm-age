//go:build wasmjs
package main

import (
	"syscall/js"
	"log"
	
	"github.com/sfomuseum/age/wasm"
)

func main() {

	encrypt_func := wasm.EncryptFunc()
	defer encrypt_func.Release()

	decrypt_func := wasm.DecryptFunc()
	defer decrypt_func.Release()

	js.Global().Set("age_encrypt", encrypt_func)
	js.Global().Set("age_decrypt", decrypt_func)

	c := make(chan struct{}, 0)

	log.Println("WASM age functions initialized")
	<-c
}
