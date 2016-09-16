// Recieve message if purchase failed or succeeded. 
function receiveMessage(event) {
	// Only trust Coinbase with messages
	if (event.origin !== "https://buy.coinbase.com")
		return;
	console.log(event.data);
}
function fillCoinbaseBuyWidget(bitcoinAddress, amount){
	console.log(bitcoinAddress);
	$('#coinbase_button').attr('data-address', bitcoinAddress);
	$('#coinbase_button').attr('data-amount', 123);
	console.log($('#coinbase_widget'));
}
function testDomain(){
	if(location.hostname != "alexandria.io" && location.hostname != "localhost:5757"){
		$('#coinbase_button_iframe').hide();
	}
}

function openCoinbaseModal(bitcoinAddress, amount) {
	var a = function i(){
		var n = document.getElementById("coinbase_widget");
		console.log(n);
		var tmp = this;
		this.init = function() {
			n.domain = "https://buy.coinbase.com", 
			n.link = document.getElementById("coinbase_widget"), 
			n.button = tmp.generateIframe(tmp.buttonIframe()), 
			n.link.parentNode.appendChild(n.button), 
			n.modal = tmp.generateIframe(tmp.modalIframe()), 
			document.body.appendChild(n.modal), 
			n.link.onclick = function(e) {
				e.preventDefault(), n.modal.style.display = "block"
			}, window.addEventListener("message", n.handleMessage, !1)
		}, this.generateIframe = function(n) {
			var e = document.createElement("div");
			return e.innerHTML = n, e.firstChild
		}, this.generateParams = function(n) {
			return "?address=" + encodeURIComponent(n.address) + ("&amount=" + encodeURIComponent(n.amount)) + ("&code=" + encodeURIComponent(n.code)) + ("&currency=" + encodeURIComponent(n.currency)) + ("&prefill_name=" + encodeURIComponent(n.prefill_name)) + ("&prefill_phone=" + encodeURIComponent(n.prefill_phone)) + ("&prefill_email=" + encodeURIComponent(n.prefill_email)) + ("&crypto_currency=" + encodeURIComponent(n.crypto_currency)) + ("&state=" + encodeURIComponent(n.state))
		}, this.modalIframeStyle = function() {
			return "\n      transition: all 0.3s ease-out;\n      background-color: transparent;\n      border: 0px none transparent;\n      display: none;\n      position: fixed;\n      visibility: visible;\n      margin: 0px;\n      padding: 0px;\n      left: 0px;\n      top: 0px;\n      width: 100%;\n      height: 100%;\n      z-index: 9999;\n    "
		}, this.modalIframe = function() {
			var e = tmp.generateParams(n.link.dataset);
			return "<iframe src='" + n.domain + "/" + e + "'\n                    id='coinbase_modal_iframe'\n                    name='coinbase_modal_iframe'\n                    style='" + tmp.modalIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true' frameborder='0'>\n      </iframe>"
		}, this.buttonIframeStyle = function() {
			return "\n      width: 273px;\n      height: 53px;\n      border: none;\n      overflow: hidden;\n      display: none;\n      border-radius: 5px;\n    "
		}, this.buttonParams = function(n) {
			return "?crypto_currency=" + encodeURIComponent(n.crypto_currency)
		}, this.buttonIframe = function() {
			var e = tmp.buttonParams(n.link.dataset);
			return "<iframe src='" + n.domain + "/button" + e + "'\n                    id='coinbase_button_iframe'\n                    name='coinbase_button_iframe'\n                    style='" + tmp.buttonIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true'\n                    frameborder='0'>\n      </iframe>"
		}, this.handleMessage = function(e) {
			switch (e.data.event) {
				case "modal_closed":
					n.modal.style.display = "none", n.modal.src = n.modal.src;
					break;
				case "button_loaded":
					n.link.parentNode.removeChild(n.link), n.button.style.display = null;
					break;
				case "button_clicked":
					n.modal.style.display = "block"
			}
		}
	}
	var r = new a;
	r.init();
}