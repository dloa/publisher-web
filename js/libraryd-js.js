// Using a `wallet` from fluffy-enigma

var LibraryDJS = LibraryDJS || {};

// returns signature directly
LibraryDJS.signPublisher = function (wallet, name, address, time) {
	// http://api.alexandria.io/#sign-publisher-announcement-message
	var toSign = name + "-" + address + "-" + time;

	return wallet.signMessage(address, toSign);
};

// returns signature directly
LibraryDJS.signArtifact = function (wallet, ipfs, address, time) {
	// http://api.alexandria.io/#sign-publisher-announcement-message
	var toSign = ipfs + "-" + address + "-" + time;

	return wallet.signMessage(address, toSign);
};

// returns signature directly
LibraryDJS.signArtifactDeactivate = function (wallet, address, txid) {
	// https://api.alexandria.io/docs/#sign-an-artifact-deactivation-message
	var toSign = address + "-" + txid;

	return wallet.signMessage(address, toSign);
};

// callback is (errorString, response) response=http://api.alexandria.io/#publish-new-artifact
LibraryDJS.publishArtifact = function (wallet, ipfs, address, alexandriaMedia, publishFee, callback) {
	var time = unixTime();

	var test = {
		"torrent": "Qmeke1CyonqgKErvGhE18WLBuhrLaScbpSAS6vGLuoSCXM",
		"publisher": "F6yEsikfYQPRAEL8FfDzumLqPD9WDPmKtK",
		"timestamp": 0,
		"type": "music",
		"payment": {},
		"info": {
			"title": "Lady J",
			"description": "Lady J with a really long description so it goes into multiple parts and really tests stuff.",
			"year": 2003,
			"extra-info": {
				"filename": "320bit_mp3/10%20Lady%20J.mp3",
				"filetype": "album track",
				"displayname": "Lady J",
				"albumtrack": "10",
				"runtime": 241
			}
		}
	};
	//ipfs = "Qmeke1CyonqgKErvGhE18WLBuhrLaScbpSAS6vGLuoSCXM";

	var signature = LibraryDJS.signArtifact(wallet, ipfs, address, time);

	var data = {
			"oip-041": {"artifact": alexandriaMedia, //test,
			signature: signature}
	};

	data["oip-041"]["artifact"].timestamp = parseInt(time);
	data["oip-041"]["artifact"].publisher = address;

	LibraryDJS.Send(wallet, JSON.stringify(data), address, 0.001, publishFee, function (err, txIDs) {
		if (err != null)
			callback(err,
				JSON.stringify({
					status: "failure",
					response: err
				}));
		else
			callback(null,
				JSON.stringify({
					status: "success",
					response: txIDs
				}));
	});
};


// callback is (errorString, response) response=http://api.alexandria.io/#announce-new-publisher
LibraryDJS.registerPublisher = function (wallet, name, address, bitMessage, email, signature, callback) {
	LibraryDJS.announcePublisher(wallet, name, address, bitMessage, email, signature, callback);
};

// callback is (errorString, response) response=http://api.alexandria.io/#announce-new-publisher
LibraryDJS.announcePublisher = function (wallet, name, address, bitMessage, email, callback) {
	var time = unixTime();

	var signature = LibraryDJS.signPublisher(wallet, name, address, time);

	var data = {
		"alexandria-publisher": {
			"name": name,
			"address": address,
			"timestamp": parseInt(time),
			"bitmessage": bitMessage,
			"email": CryptoJS.MD5(email).toString()
		},
		"signature": signature
	};

	LibraryDJS.Send(wallet, JSON.stringify(data), address, 0.001, function (err, txIDs) {
		if (err != null)
			callback(err,
				JSON.stringify({
					status: "failure",
					response: err
				}));
		else
			callback(null,
				JSON.stringify({
					status: "success",
					response: txIDs
				}));
	});
};

// callback is (errorString, response) response=https://api.alexandria.io/docs/#deactivate-an-artifact
LibraryDJS.sendDeactivationMessage = function (wallet, address, txid, callback) {
	var time = unixTime();

	var signature = LibraryDJS.signArtifactDeactivate(wallet, address, txid);

	var data = {
		"alexandria-deactivation": {
			"address": address,
			"txid": txid
		},
		"signature": signature
	};

	LibraryDJS.Send(wallet, JSON.stringify(data), address, 0.001, function (err, txIDs) {
		if (err != null)
			callback(err,
				JSON.stringify({
					status: "failure",
					response: err
				}));
		else
			callback(null,
				JSON.stringify({
					status: "success",
					response: txIDs
				}));
	});
};

function unixTime() {
	// slice is to strip milliseconds
	return Date.now().toString().slice(0, -3);
}

// callback is (errorString, txIDs Array)
LibraryDJS.Send = function (wallet, jsonData, address, amount, publishFee, callback) {
	console.log(publishFee);
	if (typeof publishFee == 'function'){
		callback = publishFee;
		publishFee = 0.001;
	}
	LibraryDJS.sendToBlockChain(wallet, jsonData, address, amount, publishFee, function (err, txIDs) {
		callback(err, txIDs);
	});
};

// callback is (errorString, txIDs Array)
LibraryDJS.sendToBlockChain = function (wallet, txComment, address, amount, publishFee, callback) {
	console.log(publishFee);
	// set tx fee
	// feature non existent in js currently

	// get new address
	// change returns to sender currently

	// over sized?
	if (txComment.length > (CHOP_MAX_LEN * 10)) {
		callback("txComment is too large to fit within 10 multipart transactions. try making it smaller!");
	} else 	if (txComment.length > TXCOMMENT_MAX_LEN) {
		LibraryDJS.multiPart(wallet, txComment, address, amount, publishFee, callback);
	}
	else {
		wallet.sendCoins(address, address, amount, txComment, publishFee, function (err, data) {
			callback(null, [data.txid]);
		});
	}
};

// callback is (errorString, txIDs Array)
LibraryDJS.multiPart = function (wallet, txComment, address, amount, publishFee, callback) {
	console.log(publishFee);
    var txIDs = [];

    var multiPartPrefix = "alexandria-media-multipart(";

    var chop = LibraryDJS.chopString(txComment);

    var part = 0;
    var max = chop.length - 1;

    // the first reference tx id is always 64 zeros
    var reference = new Array(65).join("0");

    var data = chop[part];
    var preImage = part.toString() + "-" + max.toString() + "-" + address + "-" + reference + "-" + data;

    var signature = wallet.signMessage(address, preImage);

    var multiPart = multiPartPrefix + part.toString() + "," + max.toString() +
        "," + address + "," + reference + "," + signature + "):" + data;

    wallet.sendCoins(address, address, amount, multiPart, publishFee, function (err, data) {
        txIDs[txIDs.length] = data.txid;
        reference = data.txid;

        publishPart(chop, max, 0, reference, address, amount, multiPartPrefix, function(txids){
        	console.log("Completed publishing parts! Here ya go.")
        	callback(null, txids);
        })
    });
};

var txIDs = [];
// Callback contains txIDs
function publishPart(chopPieces, numberOfPieces, lastPiecesCompleted, reference, address, amount, multiPartPrefix, callback){
    var part = lastPiecesCompleted + 1;

    var data = chopPieces[part];
    var preImage = part.toString() + "-" + numberOfPieces.toString() + "-" + address + "-" + reference + "-" + data;

    var signature = wallet.signMessage(address, preImage);

    var multiPart = multiPartPrefix + part.toString() + "," + numberOfPieces.toString() +
        "," + address + "," + reference + "," + signature + "," + "):" + data;

    wallet.sendCoins(address, address, amount, multiPart, 1000000, function (err, data) {
    	txIDs[txIDs.length] = data.txid;

    	if (part < numberOfPieces){
        	publishPart(chopPieces, numberOfPieces, part, reference, address, amount, multiPartPrefix, callback);
    	} else {
    		callback(txIDs);
    	}
    });
}

LibraryDJS.chopString = function (input) {
	input = input.toString();

	var chunks = [];
	while (input.length > CHOP_MAX_LEN) {
		chunks[chunks.length] = input.slice(0, CHOP_MAX_LEN);
		input = input.slice(CHOP_MAX_LEN);
	}
	chunks[chunks.length] = input;

	return chunks;
};

const CHOP_MAX_LEN = 200;
const TXCOMMENT_MAX_LEN = 400;