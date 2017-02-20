var qrcode = new QRCode("qrcode");

// Maximum and minimum buys allowed in USD value
var MAX_BUY = 2.00; // $2
var MIN_BUY = 0.03; // 3¢

var marketData, tradebotBalance, btcAddress, btc, usd, flo, perBTC, bitcoinWebsocket, floAddress, startingBalance, restartWebSocket;

btcValueText = $("#btcValue");
usdValueText = $("#usdValue");
floValueText = $("#floValue");

function tradebot(address){
	console.log("Creating tradebot interface with address: " + address);

	// Save the address and starting balance
	floAddress = address;
	startingBalance = wallet.balances[floAddress];
	console.log("Starting wallet balance: " + startingBalance);

	getMarketData(function(data){ 
		console.log(data)
		marketData = data; 
		perBTC = marketData.USD/marketData.weighted;
		usd = 0.10;
		btc = usd/perBTC;
		flo = usd/marketData.USD;
		updateQR();
	});

	restartWebSocket = true;

	getTradeBotBalance(function(data){ tradebotBalance = data; });
	getTradeBotBitcoinAddress(address, function(data){ btcAddress = data; $("#btcDisplayAddress").html(btcAddress); updateQR(); setupWebsocket(); })

	$('#tradebotModal').modal('show');
}

function setupWebsocket(){
	bitcoinWebsocket = new WebSocket("wss://ws.blockchain.info/inv");

	bitcoinWebsocket.onopen = function(evt){
		console.log('Websocket Opened...');
		bitcoinWebsocket.send('{"op":"addr_sub", "addr":"' + btcAddress + '"}');
	}

	bitcoinWebsocket.onmessage = function(evt){
		var received_msg = evt.data;
		var message = JSON.parse(received_msg);
		if (message.op == "utx"){
			// Log the incoming transaction
			console.log(message);
			console.log("Recieved transaction, hash: " + message.x.hash);

			// Close coinbase modal if visible
			hideCoinbaseModal();
			
			fade(document.getElementById("tradebotBuy"));
			setTimeout(function(){ unfade(document.getElementById("tradebotPending")); }, 229);
			var checkWalletInterval = setInterval(function(){
				$.post("api.alexandria.io/tradebot/getsenttxid", {'btc_txid': message.x.hash}, function (response) {
					var inf = response.replace(/u'/g, "'").replace(/'/g, '"').replace(/Decimal\(\"/g, '').replace(/\"\)/g, '');
					var json = JSON.parse(inf);

					var tmpVout = 1;
					for (var i = 0; i < json.vout.length; i++){
						if (json.vout[i].scriptPubKey.addresses[0] == floAddress)
							tmpVout = txinfo.vout[i].n;
					}

					wallet.known_unspent.push({ address: floAddress, amount: 1, confirmations: 0, txid: res.txid, vout: tmpVout});
					console.log(wallet);
					console.log("doneeeeeee~!!!");
				});
				wallet.refreshBalances(function(data){
					console.log("wallet balance: " + wallet.balances[floAddress])
					if (wallet.balances[floAddress] > startingBalance){
						console.log("Recieved transaction from FLO Bot");
						clearInterval(checkWalletInterval);
						refreshWalletInfo();
						swal("Success!", "Your buy was successful, " + (wallet.balances[floAddress]-startingBalance).toFixed(2) + " FLO was deposited into your wallet.", "success");
						$('#tradebotModal').modal('hide');
					}
				});
			}, 6000);
			restartWebSocket = false;
			bitcoinWebsocket.close();
		}
	}

	bitcoinWebsocket.onclose = function(evt){
		console.log("Websocket Closed")
		if (restartWebSocket)
			setTimeout(function(){ setupWebsocket(); }, 200);
	}
}

function updateBTC(){
	if (getFloat(btc, 8) === getFloat(btcValueText.val(), 8))
		return;
	btc = btcValueText.val();
	usd = perBTC*btc;
	flo = usd/marketData.USD;

	updateQR();
}

function updateUSD(){
	if (getFloat(usd, 2) === getFloat(usdValueText.val(), 2))
		return;
	usd = parseFloat(usdValueText.val());
	btc = usd/perBTC;
	flo = usd/marketData.USD;

	updateQR();
}

function updateFLO(){
	if (getFloat(flo, 0) === getFloat(floValueText.val(), 0))
		return;
	flo = floValueText.val();
	usd = flo*marketData.USD;
	btc = flo*marketData.weighted;

	updateQR();
}

function updateQR(){
	// Check to make sure there is enough FLO
	if (tradebotBalance && flo > tradebotBalance){
		swal("Warning", "Amount is greater than the currently allowed maximum. Amounts have been set to the maximum allowed.", "warning");
		flo = tradebotBalance;
		btc = tradebotBalance*marketData.weighted;
		usd = parseFloat(tradebotBalance*marketData.USD);
	}
	if (usd < MIN_BUY){
		swal("Warning", "The minimum purchase allowed right now is $" + MIN_BUY.toFixed(2) + ".", "warning");

		usd = MIN_BUY;
		btc = usd/perBTC;
		flo = usd/marketData.USD;
	}
	if (usd > MAX_BUY){
		swal("Warning", "The maximum purchase allowed right now is $" + MAX_BUY.toFixed(2) + ".", "warning");

		usd = MAX_BUY;
		btc = usd/perBTC;
		flo = usd/marketData.USD;
	}

	// Force BTC to be only 8 long
	btc = parseFloat(btc).toFixed(8);

	btcValueText.val(btc);
	usdValueText.val(parseFloat(usd).toFixed(2));
	floValueText.val(parseInt(flo));

	$('#usdLabel').html(parseFloat(usd).toFixed(2));

	var qrstring = "bitcoin:" + btcAddress + "?amount=" + btc;
	console.log(qrstring);

	qrcode.makeCode(qrstring);

	// Fill in coinbase buy widget attributes
	fillCoinbaseBuyWidget(btcAddress, usd);
}

function getMarketData(callback){
	$.getJSON("https://api.alexandria.io/flo-market-data/v1/getAll", function(data){
		callback(data);
	})
}

function getTradeBotBitcoinAddress(floaddress, callback){
	$.get("https://api.alexandria.io/tradebot/depositaddress?floaddress=" + floaddress + "&raw", function(data){
		callback(data);
	})
}

function getTradeBotBalance(callback){
	$.get("https://api.alexandria.io/tradebot/flobalance", function(data){
		callback(data);
	})
}

function getFloat(num, points){
	return parseFloat(parseFloat(num).toFixed(points));
}

function cancelFloBuy(){
	restartWebSocket = false;
	bitcoinWebsocket.close();
}
