//go:build wasmjs
package wasm

import (
	"strings"
	"fmt"
	"bytes"
	"bufio"
	"syscall/js"
	
	"github.com/sfomuseum/age"
)

type MyWriteCloser struct {
    *bufio.Writer
}

func (mwc *MyWriteCloser) Close() error {
    // Noop
    return nil
}

func EncryptFunc () js.Func {

	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {

		key := args[0].String()
		body := args[1].String()		

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {

			resolve := args[0]
			reject := args[1]

			r := strings.NewReader(body)
			
			var buf bytes.Buffer
			wr := bufio.NewWriter(&buf)

			err := age.Encrypt(key, r, &MyWriteCloser{ wr })

			if err != nil {
				reject.Invoke(fmt.Errorf("Failed to encrypt body, %w", err))
				return nil
			}

			wr.Flush()

			resolve.Invoke(buf.String())
			return nil
		})

		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}
