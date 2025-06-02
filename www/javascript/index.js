window.addEventListener("load", function load(event){

    var encrypt_text = document.getElementById("encrypt");
    var encrypt_key = document.getElementById("encrypt-key");    
    var encrypt_button = document.getElementById("encrypt-button");
    var encrypt_result = document.getElementById("encrypt-result");

    var decrypt_text = document.getElementById("decrypt");
    var decrypt_key = document.getElementById("decrypt-key");        
    var decrypt_button = document.getElementById("decrypt-button");
    var decrypt_result = document.getElementById("decrypt-result");    

    encrypt_text.value = "";
    encrypt_key.value = "";
    
    decrypt_text.value = "";
    decrypt_key.value = "";        
    
    sfomuseum.golang.wasm.fetch("wasm/age.wasm").then((rsp) => {

	encrypt_button.onclick = function(){

	    const key = encrypt_key.value;

	    if (! key){
		console.error("Missing key");
		return false;
	    }

	    const body = encrypt_text.value;

	    age_encrypt(key, body).then((rsp) => {

		encrypt_result.innerHTML = "";		
		var pre = document.createElement("pre");
		pre.appendChild(document.createTextNode(rsp));
		encrypt_result.appendChild(pre);
		
	    }).catch((err) => {
		console.error("Failed to encrypt body", err);
	    });
	    
	    return false;
	};

	decrypt_button.onclick = function(){

	    const key = decrypt_key.value;

	    if (! key){
		console.error("Missing key");
		return false;
	    }
	    
	    const body = decrypt_text.value;

	    age_decrypt(key, body).then((rsp) => {

		decrypt_result.innerHTML = "";		
		var pre = document.createElement("pre");
		pre.appendChild(document.createTextNode(rsp));
		decrypt_result.appendChild(pre);
		
	    }).catch((err) => {
		console.error("Failed to decrypt body", err);
	    });
	    
	    return false;
	};
	
	encrypt_button.removeAttribute("disabled");
	decrypt_button.removeAttribute("disabled");
	
    }).catch((err) => {
	console.error("Failed to load WASMbinary", err);
        return;
    });
});
