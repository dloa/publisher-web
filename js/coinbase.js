var buyWidgetSettings = {
	code: '169c6c3a-d404-55f4-82f4-24cd25f5c5f6',
	currency: 'USD',
	crypto_currency: 'BTC',
	state: 123
}
// Default create the coinbase modal
createCoinbaseModal('', 0);

// Recieve message if purchase failed or succeeded. 
function receiveMessage(event) {
	// Only trust Coinbase with messages
	if (event.origin !== "https://buy.coinbase.com")
		return;
	console.log(event.data);
}
function fillCoinbaseBuyWidget(bitcoinAddress, amount){
	if (document.getElementById("coinbase_widget") == null)
		updateCoinbaseModal(bitcoinAddress, amount);
}
function testDomain(){
	if(location.hostname != "alexandria.io" && location.hostname != "localhost:5757"){
		$('#coinbase_button_iframe').hide();
	}
}

function createCoinbaseModal(bitcoinAddress, amount) {
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
				e.preventDefault(), document.getElementById('coinbase_modal_iframe').style.display = "block"
			}, window.addEventListener("message", tmp.handleMessage, !1)
		}, this.generateIframe = function(n) {
			var e = document.createElement("div");
			return e.innerHTML = n, e.firstChild
		}, this.generateParams = function(n) {
			return "?address=" + encodeURIComponent(bitcoinAddress) + ("&amount=" + encodeURIComponent(amount)) + ("&code=" + encodeURIComponent(buyWidgetSettings.code)) + ("&currency=" + encodeURIComponent(buyWidgetSettings.currency)) + ("&crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)) + ("&state=" + encodeURIComponent(buyWidgetSettings.state))
		}, this.modalIframeStyle = function() {
			return "\n      transition: all 0.3s ease-out;\n      background-color: transparent;\n      border: 0px none transparent;\n      display: none;\n      position: fixed;\n      visibility: visible;\n      margin: 0px;\n      padding: 0px;\n      left: 0px;\n      top: 0px;\n      width: 100%;\n      height: 100%;\n      z-index: 9999;\n    "
		}, this.modalIframe = function() {
			var e = tmp.generateParams(n.link.dataset);
			return "<iframe src='" + n.domain + "/" + e + "'\n                    id='coinbase_modal_iframe'\n                    name='coinbase_modal_iframe'\n                    style='" + tmp.modalIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true' frameborder='0'>\n      </iframe>"
		}, this.buttonIframeStyle = function() {
			return "\n      width: 273px;\n      height: 53px;\n      border: none;\n      overflow: hidden;\n      display: none;\n      border-radius: 5px;\n    "
		}, this.buttonParams = function(n) {
			return "?crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)
		}, this.buttonIframe = function() {
			var e = tmp.buttonParams(n.link.dataset);
			return "<iframe src='" + n.domain + "/button" + e + "'\n                    id='coinbase_button_iframe'\n                    name='coinbase_button_iframe'\n                    style='" + tmp.buttonIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true'\n                    frameborder='0'>\n      </iframe>"
		}, this.handleMessage = function(e) {
			switch (e.data.event) {
				case "modal_closed":
					document.getElementById('coinbase_modal_iframe').style.display = "none", document.getElementById('coinbase_modal_iframe').src = document.getElementById('coinbase_modal_iframe').src;
					break;
				case "button_loaded":
					n.link.parentNode.removeChild(n.link), n.button.style.display = null;
					break;
				case "button_clicked":
					document.getElementById('coinbase_modal_iframe').style.display = "block"
			}
		}
	}
	var r = new a;
	r.init();
}

function updateCoinbaseModal(bitcoinAddress, amount){
	$('#coinbase_modal_iframe').remove();
	var e = document.createElement("div");
	e.innerHTML = "<iframe src='https://buy.coinbase.com?address=" + encodeURIComponent(bitcoinAddress) + ("&amount=" + encodeURIComponent(amount)) + ("&code=" + encodeURIComponent(buyWidgetSettings.code)) + ("&currency=" + encodeURIComponent(buyWidgetSettings.currency)) + ("&crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)) + ("&state=" + encodeURIComponent(buyWidgetSettings.state)) + "'\n                    id='coinbase_modal_iframe'\n                    name='coinbase_modal_iframe'\n                    style='" + "\n      transition: all 0.3s ease-out;\n      background-color: transparent;\n      border: 0px none transparent;\n      display: none;\n      position: fixed;\n      visibility: visible;\n      margin: 0px;\n      padding: 0px;\n      left: 0px;\n      top: 0px;\n      width: 100%;\n      height: 100%;\n      z-index: 9999;\n    " + "'\n                    scrolling='no'\n                    allowtransparency='true' frameborder='0'>\n      </iframe>";
	document.body.appendChild(e.firstChild);
}