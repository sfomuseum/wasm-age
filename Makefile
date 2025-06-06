GOMOD=$(shell test -f "go.work" && echo "readonly" || echo "vendor")
LDFLAGS=-s -w

MINIFY=minify

debug:
	@make bundle
	fileserver -root www

bundle:
	@make bundle-app
	@make bundle-qr

bundle-app:
	$(MINIFY) -b -o www/javascript/index.bundle.min.js \
		www/javascript/index.js

bundle-qr:
	$(MINIFY) -b -o www/javascript/qr.bundle.min.js \
		www/javascript/qrcode.js \
		www/javascript/jsQR.js

wasmjs:
	GOOS=js GOARCH=wasm \
		go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -tags wasmjs \
		-o www/wasm/age.wasm \
		cmd/wasm/main.go

