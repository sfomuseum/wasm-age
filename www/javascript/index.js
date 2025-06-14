window.addEventListener("load", function load(event){

    var encrypt_wrapper = document.getElementById("encrypt-wrapper");
    var encrypt_toggle = document.getElementById("encrypt-toggle");        
    var encrypt_text = document.getElementById("encrypt");
    var encrypt_key = document.getElementById("encrypt-key");    
    var encrypt_button = document.getElementById("encrypt-button");
    var encrypt_result = document.getElementById("encrypt-result");
    var encrypt_result_data = document.getElementById("encrypt-result-data");
    var encrypt_result_qr = document.getElementById("encrypt-result-qr");        
    var encrypt_feedback = document.getElementById("encrypt-feedback");
    var encrypt_spinner = document.getElementById("encrypt-spinner-svg");

    var encrypt_hide = document.getElementById("encrypt-hide");
    var encrypt_show = document.getElementById("encrypt-show");    
    var encrypt_copy = document.getElementById("encrypt-copy");
    var encrypt_load = document.getElementById("encrypt-load");        
    var encrypt_save = document.getElementById("encrypt-save");    
    var encrypt_qr = document.getElementById("encrypt-qr");
    
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
    var decrypt_load = document.getElementById("decrypt-load");
    var decrypt_save = document.getElementById("decrypt-save");            
    var decrypt_qr = document.getElementById("decrypt-qr");        

    var decrypt_qr_video;
    
    var decrypt_qr_canvas;
    var decrypt_qr_canvas_el;

    encrypt_text.value = "";
    encrypt_key.value = "";
    encrypt_result_data.innerHTML = "";
    
    decrypt_text.value = "";
    decrypt_key.value = "";        
    decrypt_result_data.innerHTML = "";

    sfomuseum.golang.wasm.fetch("wasm/age.wasm").then((rsp) => {

	if (document.body.getAttribute("offline")){
	    
	    const scope = location.pathname;
	    console.debug("Register offline application", scope);
	    
	    offline.application.init(scope).then((rsp) => {

		const footer = document.getElementById("footer");
		offline.application.add_purge_button(footer);		
		
	    }).catch((err) => {
		console.error("Failed to initialize offline application", err);
		alert("Failed to initialize offline application");
	    });
	}
	
	let hide_to_encrypt = true;

	// The data to encrypt
	let to_encrypt = "";

	// The encrypted (and armor-ed) version of the data
	let encrypted_text = "";
	
	// The data that has been decrypted
	let decrypted_text = "";

	// START OF put me in a library

	const choose_filename = function(stream){

	    return new Promise((resolve, reject) => {
		
		var d = document.createElement("dialog");
		d.setAttribute("class", "dialog");		
		
		const exit = function(){
		    d.close();
		    document.body.removeChild(d);
		};
		
		var close = document.createElement("div");
		close.setAttribute("class", "dialog-close");
		
		close.onclick = function(){
		    exit();
		    return false;
		};
		
		close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';
		
		d.appendChild(close);
		
		const form = document.createElement("form");
		form.setAttribute("class", "form");
		
		const input = document.createElement("input")
		input.setAttribute("class", "form-control");
		input.setAttribute("type", "text");
		input.setAttribute("id", "filename");
		
		const label = document.createElement("label");
		label.setAttribute("class", "form-label");
		label.setAttribute("for", "filename");
		label.appendChild(document.createTextNode("Choose a new filename"));
		
		const btn = document.createElement("button");
		btn.setAttribute("class", "btn btn-primary");
		btn.appendChild(document.createTextNode("Okay"));
		
		const wrapper = document.createElement("div");
		wrapper.setAttribute("class", "mb-3");
		wrapper.appendChild(label);
		wrapper.appendChild(input);
		
		form.appendChild(wrapper);
		form.appendChild(btn);
		
		btn.onclick = function(){
		    
		    if (! input.value){
			return false;
		    }

		    resolve(input.value);
		    exit();
		};
	    
		d.appendChild(form);
		document.body.append(d);
		d.showModal();
	    });
	};

	const save_file = function(data, type){

	    return new Promise((resolve, reject) => {

		choose_filename().then((filename) => {
		    
		    const blob = new Blob([data], { type: 'text/plain' });
		    const url = URL.createObjectURL(blob);
		    
		    const a = document.createElement('a');
		    a.href = url;
		    
		    a.download = filename;
		    document.body.appendChild(a);
		    a.click();
		    
		    document.body.removeChild(a);
		    URL.revokeObjectURL(url);
		    
		    resolve();
		    
		}).catch((err) => {
		    reject(err);
		    return;
		});
		
	    });
	};
	
	const load_file = function(stream){

	    return new Promise((resolve, reject) => {
		
		var d = document.createElement("dialog");
		d.setAttribute("class", "dialog");
		
		const exit = function(){
		    d.close();
		    document.body.removeChild(d);
		};
		
		var close = document.createElement("div");
		close.setAttribute("class", "dialog-close");
		
		close.onclick = function(){
		    exit();
		    return false;
		};
		
		close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';
		
		d.appendChild(close);
		
		const form = document.createElement("form");
		form.setAttribute("class", "form");
		
		const input = document.createElement("input")
		input.setAttribute("class", "form-control");
		input.setAttribute("type", "file");
		input.setAttribute("id", "upload");
		
		const label = document.createElement("label");
		label.setAttribute("class", "form-label");
		label.setAttribute("for", "upload");
		label.appendChild(document.createTextNode("Upload file"));
		
		const btn = document.createElement("button");
		btn.setAttribute("class", "btn btn-primary");
		btn.appendChild(document.createTextNode("Upload"));
		
		const wrapper = document.createElement("div");
		wrapper.setAttribute("class", "mb-3");
		wrapper.appendChild(label);
		wrapper.appendChild(input);
		
		form.appendChild(wrapper);
		form.appendChild(btn);
		
		btn.onclick = function(){
		    
		    if (! input.files.length){
			return false;
		    }
		    
		    try {
			
			const file = input.files[0];
			const reader = new FileReader();
			
			reader.onload = function(e) {
			    resolve(e.target.result);
			    exit();
			};
			
			reader.onerror = function() {
			    console.error("Failed to read file");
			    reject("Unable to read file");
			    exit();
			};
			
			reader.readAsText(file);
			return false;
			
		    } catch (err) {
			console.error("Failed to load file", err);
			reject(err);
			exit();
		    }
		
		};
	    
		d.appendChild(form);
		document.body.append(d);
		d.showModal();
	    });
	};

	// END OF put me in a library
	
	const decrypt_load_dialog = function(){

	    load_file().then((rsp) => {
		decrypt_text.value = rsp;
	    }).catch((err) => {
		decrypt_feedback.innerText = err;
	    });
	};
	
	decrypt_load.onclick = function(){
	    decrypt_load_dialog();
	};

	decrypt_save.onclick = function(){

	    save_file(decrypted_text).then((rsp) => {
		encrypt_feedback.innerText = "Save data to file";
	    }).catch((err) => {
		encrypt_feedback.innerText = "Failed to save data to file, " + err;
	    });

	    return false;
	};

	const encrypt_load_dialog = function(){

	    load_file().then((rsp) => {
		to_encrypt = rsp;
		encrypt_text.value = "*".repeat(rsp.length);
	    }).catch((err) => {
		encrypt_feedback.innerText = err;
	    });
	};
	
	encrypt_load.onclick = function(){
	    encrypt_load_dialog();
	};
	
	encrypt_save.onclick = function(){

	    save_file(encrypted_text).then((rsp) => {
		encrypt_feedback.innerText = "Save data to file";
	    }).catch((err) => {
		encrypt_feedback.innerText = "Failed to save data to file, " + err;
	    });

	    return false;
	};

	encrypt_qr.onclick = function(){

	    try {

		var qrcode = new QRCode(encrypt_result_qr, {
		    width : 275,
		    height : 275
		});

		qrcode.makeCode(encrypted_text);
		
	    } catch (err) {
		console.log("Failed to generate QR code", err);
		encrypt_feedback.innerText = "Failed to generate QR code, " + err;
	    }
	};

	decrypt_qr_tick = function(){
	    
	    if (!decrypt_qr_video){
		return;
	    }

	    // view-source:https://cozmo.github.io/jsQR/
	    
	    if (decrypt_qr_video.readyState === decrypt_qr_video.HAVE_ENOUGH_DATA) {
		decrypt_qr_canvas_el.height = decrypt_qr_video.videoHeight;
		decrypt_qr_canvas_el.width = decrypt_qr_video.videoWidth;
		decrypt_qr_canvas.drawImage(decrypt_qr_video, 0, 0, decrypt_qr_canvas_el.width, decrypt_qr_canvas_el.height);

		var im = decrypt_qr_canvas.getImageData(0, 0, decrypt_qr_canvas_el.width, decrypt_qr_canvas_el.height);
		
		var code = jsQR(im.data, im.width, im.height, {
		    inversionAttempts: "dontInvert",
		});

		if (code){

		    drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
		    drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
		    drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
		    drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

		    decrypt_text.value = code.data;

		    var feedback_el = document.getElementById("decrypt-qr-video-feedback");

		    if (feedback_el){
			feedback_el.innerText = "Found QR code, wrote data to input field";
		    }
		}
		
	    }

	    requestAnimationFrame(decrypt_qr_tick);
	};

	drawLine = function(begin, end, color) {
	    decrypt_qr_canvas.beginPath();
	    decrypt_qr_canvas.moveTo(begin.x, begin.y);
	    decrypt_qr_canvas.lineTo(end.x, end.y);
	    decrypt_qr_canvas.lineWidth = 8;
	    decrypt_qr_canvas.strokeStyle = color;
	    decrypt_qr_canvas.stroke();
	}
	
	decrypt_qr_dialog = function(stream){

	    decrypt_qr_video = document.createElement("video");
	    decrypt_qr_video.srcObject = stream;
	    decrypt_qr_video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
	    decrypt_qr_video.play();
	    
	    requestAnimationFrame(decrypt_qr_tick);

	    decrypt_qr_canvas_el = document.createElement("canvas");
	    decrypt_qr_canvas = decrypt_qr_canvas_el.getContext("2d");
	    
	    var d = document.createElement("dialog");
	    d.setAttribute("style", "min-width:50vw;");
	    
	    var close = document.createElement("div");
	    close.setAttribute("id", "decrypt-qr-video-close");
	    
	    close.onclick = function(){
		
		decrypt_qr_video.pause();

		stream.getTracks().forEach((track) => {
		    if (track.readyState == 'live') {
			track.stop();
		    }
		});

		d.close();
		document.body.removeChild(d);
		return false;
	    };
	    
	    close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';
	    
	    d.appendChild(close);

	    var feedback = document.createElement("div");
	    feedback.setAttribute("class", "feedback");	    
	    feedback.setAttribute("id", "decrypt-qr-video-feedback");
	    d.appendChild(feedback);
	    
	    var grid = document.createElement("div");
	    grid.setAttribute("id", "decrypt-qr-video-grid");

	    grid.appendChild(decrypt_qr_video);
	    grid.appendChild(decrypt_qr_canvas_el);
	    
	    d.appendChild(grid);
	    document.body.append(d)
	    d.showModal();
	};
	
	decrypt_qr.onclick = function(){

	    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
		decrypt_qr_dialog(stream);
	    }).catch((err) => {
		console.error(err);
	    });
	};
	
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
	    encrypt_result_qr.innerHTML = "";			    
	    encrypt_result.style.display = "none";
	    encrypt_copy.style.display = "none";
	    encrypt_qr.style.display = "none";
	    encrypt_save.style.display = "none";
	    
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

		    encrypt_qr.style.display = "inline-block";
		    encrypt_save.style.display = "inline-block";		    
		    
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

		    decrypt_save.style.display = "inline-block";
		    
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
	encrypt_load.style.display = "inline-block";
	
	decrypt_qr.style.display = "inline-block";
	decrypt_load.style.display = "inline-block";	
    	
    }).catch((err) => {
	alert("Failed to load age WebAssembly functions");
	console.error("Failed to load WASMbinary", err);
        return;
    });
});
