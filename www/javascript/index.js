window.addEventListener("load", function load(event){

    var encrypt_wrapper = document.getElementById("encrypt-wrapper");
    var encrypt_toggle = document.getElementById("encrypt-toggle");        
    var encrypt_text = document.getElementById("encrypt");
    var encrypt_key = document.getElementById("encrypt-key");    
    var encrypt_button = document.getElementById("encrypt-button");
    var encrypt_result = document.getElementById("encrypt-result");
    var encrypt_result_data = document.getElementById("encrypt-result-data");    

    var encrypt_hide = document.getElementById("encrypt-hide");
    var encrypt_show = document.getElementById("encrypt-show");    

    var decrypt_wrapper = document.getElementById("decrypt-wrapper");
    var decrypt_toggle = document.getElementById("decrypt-toggle");            
    var decrypt_text = document.getElementById("decrypt");
    var decrypt_key = document.getElementById("decrypt-key");        
    var decrypt_button = document.getElementById("decrypt-button");
    var decrypt_result = document.getElementById("decrypt-result");    
    var decrypt_result_data = document.getElementById("decrypt-result-data");

    var decrypt_hide = document.getElementById("decrypt-hide");
    var decrypt_show = document.getElementById("decrypt-show");
    var decrypt_copy = document.getElementById("decrypt-copy");        
    
    encrypt_text.value = "";
    encrypt_key.value = "";
    
    decrypt_text.value = "";
    decrypt_key.value = "";        
    
    sfomuseum.golang.wasm.fetch("wasm/age.wasm").then((rsp) => {

	let to_encrypt = "";
	let hide_to_encrypt = true;

	let decrypted_text = "";
	
	encrypt_hide.onclick = function(){

	    to_encrypt = encrypt_text.value;
	    encrypt_text.value = "*".repeat(to_encrypt.length);
	    hide_to_encrypt = true;
	    
	    encrypt_hide.style.display = "none";
	    encrypt_show.style.display = "inline-block";
	};

	encrypt_show.onclick = function(){

	    hide_to_encrypt = false;	    
	    encrypt_text.value = to_encrypt;
	    to_encrypt = "";
	    
	    encrypt_hide.style.display = "inline-block";
	    encrypt_show.style.display = "none";
	};

	decrypt_hide.onclick = function(){
	    decrypt_hide.style.display = "none";
	    decrypt_show.style.display = "inline-block";	    
	    decrypt_result_data.innerHTML = "";
	    decrypt_result_data.appendChild(document.createTextNode("****"));
	};

	decrypt_show.onclick = function(){
	    decrypt_hide.style.display = "inline-block";
	    decrypt_show.style.display = "none";	    	    
	    decrypt_result_data.innerHTML = "";
	    decrypt_result_data.appendChild(document.createTextNode(decrypted_text));
	};
	
	encrypt_text.oninput = function(ev){
	    
	    const el = ev.target;
	    const value = el.value;

	    const prev_len = to_encrypt.length;
	    const current_len = value.length;
	    
	    if (! current_len){
		to_encrypt = "";
		return;
	    }

	    if (current_len == prev_len){
		return;
	    }

	    if (current_len < prev_len){
		to_encrypt = to_encrypt.substr(0, current_len);	    
	    } else {
		const update = value.substr(prev_len);
		to_encrypt += update;
	    }
	    
	    if (hide_to_encrypt){
		el.value = "*".repeat(to_encrypt.length);
	    }
	    
	    // console.log("WUT", value, to_encrypt)
	    
	};

	encrypt_toggle.onclick = function(){

	    encrypt_toggle.setAttribute("disabled", "disabled");
	    encrypt_wrapper.style.display = "block";
	    
	    decrypt_toggle.removeAttribute("disabled");
	    decrypt_wrapper.style.display = "none";
	    return false	    
	};

	decrypt_toggle.onclick = function(){

	    decrypt_toggle.setAttribute("disabled", "disabled");
	    decrypt_wrapper.style.display = "block";
	    
	    encrypt_toggle.removeAttribute("disabled");
	    encrypt_wrapper.style.display = "none";
	    return false	    
	};
	
	encrypt_button.onclick = function(){

	    const key = encrypt_key.value;

	    if (! key){
		console.error("Missing key");
		return false;
	    }

	    const body = to_encrypt;
	    // const body = encrypt_text.value;
	    // encrypt_text.value = "";
	    
	    if (! body){
		console.error("Missing body");
		return false;
	    }

	    encrypt_result_data.innerHTML = "";		
	    encrypt_result.style.display = "none";
	    
	    age_encrypt(key, body).then((rsp) => {

		encrypt_result_data.innerHTML = "";		
		encrypt_result_data.appendChild(document.createTextNode(rsp));
		encrypt_result.style.display = "block";
		
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

	    decrypt_result_data.innerHTML = "";		
	    decrypt_result.style.display = "none";

	    age_decrypt(key, body).then((rsp) => {

		decrypted_text = rsp;
		
		decrypt_result_data.innerHTML = "";		
		decrypt_result_data.appendChild(document.createTextNode("****"));
		decrypt_result.style.display = "block";

		decrypt_show.style.display = "inline-block";

		if (navigator.clipboard){
		    decrypt_copy.style.display = "inline-block";
		}
		
	    }).catch((err) => {
		console.error("Failed to decrypt body", err);
	    });
	    
	    return false;
	};

	if (navigator.clipboard){

	    decrypt_copy.onclick = function(){
		
		navigator.clipboard.writeText(decrypted_text).then((rsp) => {
		    console.log("OK");
		}).catch((err) => {
		    console.error("sad", err);
		});
	    }
	}
	
	encrypt_button.removeAttribute("disabled");
	decrypt_button.removeAttribute("disabled");

	encrypt_wrapper.style.display = "block";
	decrypt_toggle.removeAttribute("disabled");

	encrypt_show.style.display = "inline-block";
	
    }).catch((err) => {
	console.error("Failed to load WASMbinary", err);
        return;
    });
});
