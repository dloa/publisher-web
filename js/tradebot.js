var qrcode = new QRCode("qrcode");

var marketData, tradebotBalance, btcAddress, btc, usd, flo, perBTC;
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
getTradeBotBitcoinAddress('FKR4rFKtMRuAx88i2nfRUoTYKpJtEtnWUT', function(data){ btcAddress = data; $("#btcDisplayAddress").html(btcAddress); })

btcValueText = $("#btcValue");
usdValueText = $("#usdValue");
floValueText = $("#floValue");


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

    qrcode.makeCode("bitcoin:1EV7zyqRK6qS2QnZdwXrgS2aKzXpi91jBn?amount=" + btc);
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