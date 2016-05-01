var qrcode = new QRCode("qrcode");

var marketData, tradebotBalance, btcAddress, btc, usd, flo, perBTC, bitcoinWebsocket, floAddress, startingBalance;

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
	getTradeBotBalance(function(data){ tradebotBalance = data; });
	getTradeBotBitcoinAddress(address, function(data){ btcAddress = data; $("#btcDisplayAddress").html(btcAddress); updateQR(); setupWebsocket(); })

	$('#tradebotModal').modal('show');
}

function setupWebsocket(){
	var restartWebSocket = true;

	bitcoinWebsocket = new WebSocket("wss://ws.blockchain.info/inv");

	bitcoinWebsocket.onopen = function(evt){
		console.log('Websocket Opened...');
		bitcoinWebsocket.send('{"op":"addr_sub", "addr":"' + btcAddress + '"}');
	}

	bitcoinWebsocket.onmessage = function(evt){
		var received_msg = evt.data;
		var message = JSON.parse(received_msg);
		if (message.op == "utx"){
			console.log(message);
			console.log("Recieved transaction, hash: " + message.x.hash);
			fade(document.getElementById("tradebotBuy"));
			setTimeout(function(){ unfade(document.getElementById("tradebotPending")); }, 229);
			var checkWalletInterval = setInterval(function(){
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
	if (getFloat(btc, 10) === getFloat(btcValueText.val(), 10))
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
	if (usd < 0.03){
		swal("Warning", "The minimum purchase is 3¢.", "warning");

		usd = 0.03;
		btc = usd/perBTC;
		flo = usd/marketData.USD;
	}

	btcValueText.val(btc);
	usdValueText.val(parseFloat(usd).toFixed(2));
	floValueText.val(parseInt(flo));

	$('#usdLabel').html(parseFloat(usd).toFixed(2));

	var qrstring = "bitcoin:" + btcAddress + "?amount=" + btc;
	console.log(qrstring);

    qrcode.makeCode(qrstring);
}

function getMarketData(callback){
	$.getJSON("http://libraryd.alexandria.io:41290/flo-market-data/v1/getAll", function(data){
		callback(data);
	})
}

function getTradeBotBitcoinAddress(floaddress, callback){
	$.get("http://tradebot.alexandria.io/depositaddress?floaddress=" + floaddress + "&raw", function(data){
		callback(data);
	})
}

function getTradeBotBalance(callback){
	$.get("http://tradebot.alexandria.io/flobalance", function(data){
		callback(data);
	})
}

function getFloat(num, points){
	return parseFloat(parseFloat(num).toFixed(points));
}

function cancelFloBuy(){
	bitcoinWebsocket.close();
}