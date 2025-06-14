GOMOD=$(shell test -f "go.work" && echo "readonly" || echo "vendor")
LDFLAGS=-s -w

MINIFY=minify
SERVER_URI=http://localhost:8080

debug:
	@make bundle
	fileserver -root www -server-uri=$(SERVER_URI)

bundle:
	@make bundle-qr

bundle-qr:
	$(MINIFY) -b -o www/javascript/qr.bundle.min.js \
		www/javascript/qrcode.js \
		www/javascript/jsQR.js

wasmjs:
	GOOS=js GOARCH=wasm \
		go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -tags wasmjs \
		-o www/wasm/age.wasm \
		cmd/wasm/main.go

