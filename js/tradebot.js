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
getTradeBotBitcoinAddress('F6daaF5j69yAxgKEYumm8HEkC9PDzdmMM9', function(data){ btcAddress = data; $("#btcDisplayAddress").html(btcAddress); })

btcValueText = $("#btcValue");
usdValueText = $("#usdValue");
floValueText = $("#floValue");


function updateBTC(){
	btc = btcValueText.val();
	usd = perBTC*btc;
	flo = usd/marketData.USD;

	updateQR();
}

function updateUSD(){
	usd = usdValueText.val();
	btc = usd/perBTC;
	flo = usd/marketData.USD;

	updateQR();
}

function updateFLO(){
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
		usd = tradebotBalance*marketData.USD;
	}
	if (usd < 0.03){
		swal("Warning", "The minimum purchase is 3¢.", "warning");

		usd = 0.03;
		btc = usd/perBTC;
		flo = usd/marketData.USD;
	}

	btcValueText.val(btc);
	usdValueText.val(usd.toFixed(2));
	floValueText.val(flo.toFixed(0));

	$('#usdLabel').html(usd.toFixed(2));

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