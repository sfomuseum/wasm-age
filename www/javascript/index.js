window.addEventListener("load", function load(event){

    var encrypt_wrapper = document.getElementById("encrypt-wrapper");
    var encrypt_toggle = document.getElementById("encrypt-toggle");        
    var encrypt_text = document.getElementById("encrypt");
    var encrypt_key = document.getElementById("encrypt-key");    
    var encrypt_button = document.getElementById("encrypt-button");
    var encrypt_result = document.getElementById("encrypt-result");
    var encrypt_result_data = document.getElementById("encrypt-result-data");    
    var encrypt_feedback = document.getElementById("encrypt-feedback");
    var encrypt_spinner = document.getElementById("encrypt-spinner-svg");
    
    var encrypt_hide = document.getElementById("encrypt-hide");
    var encrypt_show = document.getElementById("encrypt-show");    
    var encrypt_copy = document.getElementById("encrypt-copy");
    
    var decrypt_wrapper = document.getElementById("decrypt-wrapper");
    var decrypt_toggle = document.getElementById("decrypt-toggle");            
    var decrypt_text = document.getElementById("decrypt");
    var decrypt_key = document.getElementById("decrypt-key");        
    var decrypt_button = document.getElementById("decrypt-button");
    var decrypt_result = document.getElementById("decrypt-result");    
    var decrypt_result_data = document.getElementById("decrypt-result-data");
    var decrypt_feedback = document.getElementById("decrypt-feedback");
    var decrypt_spinner = document.getElementById("decrypt-spinner-svg");
    
    var decrypt_hide = document.getElementById("decrypt-hide");
    var decrypt_show = document.getElementById("decrypt-show");
    var decrypt_copy = document.getElementById("decrypt-copy");        
    
    encrypt_text.value = "";
    encrypt_key.value = "";
    encrypt_result_data.innerHTML = "";
    
    decrypt_text.value = "";
    decrypt_key.value = "";        
    decrypt_result_data.innerHTML = "";
    
    sfomuseum.golang.wasm.fetch("wasm/age.wasm").then((rsp) => {

	let hide_to_encrypt = true;

	// The data to encrypt
	let to_encrypt = "";

	let encrypted_text = "";
	
	// The data that has been decrypted
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

	    encrypt_feedback.innerText = "";
	    encrypted_text = "";
	    
	    const key = encrypt_key.value;

	    if (! key){
		encrypt_feedback.innerText = "Missing key to encrypt message with.";		
		console.error("Missing key");
		return false;
	    }

	    // Remember we are reading the value to encrypt from the data
	    // that is compiled from the encrypt_text.oninput event.
	    
	    const body = to_encrypt;
	    
	    if (! body){
		encrypt_feedback.innerText = "Message (to encrypt) body is empty.";
		console.error("Missing body");
		return false;
	    }

	    encrypt_result_data.innerHTML = "";		
	    encrypt_result.style.display = "none";
	    encrypt_copy.style.display = "none";
	    
	    encrypt_spinner.style.display = "inline-block";

	    setTimeout(function(){
		
		age_encrypt(key, body).then((rsp) => {

		    encrypted_text = rsp;
		    
		    encrypt_spinner.style.display = "none";
		    encrypt_result_data.innerHTML = "";		
		    encrypt_result_data.appendChild(document.createTextNode(encrypted_text));
		    encrypt_result.style.display = "block";

		    if (navigator.clipboard){
			encrypt_copy.style.display = "inline-block";
		    }
		    
		}).catch((err) => {
		    encrypt_spinner.style.display = "none";		
		    encrypt_feedback.innerText = "Failed to encrypt text," + err;				
		    console.error("Failed to encrypt body", err);
		});
		
	    }, 100);
	    
	    return false;
	};

	if (navigator.clipboard){

	    encrypt_copy.onclick = function(){
		
		navigator.clipboard.writeText(encrypted_text).then((rsp) => {
		    encrypt_feedback.innerText = "Encrypted message copied to clipboard.";

		    setTimeout(function(){
			encrypt_feedback.innerText = "";
		    }, 3000);
		    
		}).catch((err) => {
		    encrypt_feedback.innerText = "Failed to copy message to clipboard, " + err;		    
		    console.error("sad", err);
		});
	    }
	}
	
	decrypt_button.onclick = function(){

	    decrypt_feedback.innerText = "";
	    decrypted_text = "";
	    
	    const key = decrypt_key.value;

	    if (! key){
		decrypt_feedback.innerText = "Missing key to encrypt message with.";				
		console.error("Missing key");
		return false;
	    }
	    
	    const body = decrypt_text.value;

	    decrypt_result_data.innerHTML = "";		
	    decrypt_result.style.display = "none";
	    decrypt_copy.style.display = "none";
	    
	    decrypt_spinner.style.display = "inline-block";

	    setTimeout(function(){
		
		age_decrypt(key, body).then((rsp) => {
		    
		    decrypt_spinner.style.display = "none";		
		    decrypted_text = rsp;
		    
		    decrypt_result_data.innerHTML = "";		
		    decrypt_result_data.appendChild(document.createTextNode("****"));
		    decrypt_result.style.display = "block";
		    
		    decrypt_show.style.display = "inline-block";
		    
		    if (navigator.clipboard){
			decrypt_copy.style.display = "inline-block";
		    }
		    
		}).catch((err) => {
		    decrypt_spinner.style.display = "none";			
		    decrypt_feedback.innerText = "Failed to decrypt message, " + err;
		    console.error("Failed to decrypt body", err);
		});
		
	    }, 100);
	    
	    return false;
	};

	if (navigator.clipboard){

	    decrypt_copy.onclick = function(){
		
		navigator.clipboard.writeText(decrypted_text).then((rsp) => {
		    decrypt_feedback.innerText = "Decrypted message copied to clipboard.";

		    setTimeout(function(){
			decrypt_feedback.innerText = "";
		    }, 3000);
		    
		}).catch((err) => {
		    decrypt_feedback.innerText = "Failed to copy message to clipboard, " + err;		    
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
	alert("Failed to load age WebAssembly functions");
	console.error("Failed to load WASMbinary", err);
        return;
    });
});
