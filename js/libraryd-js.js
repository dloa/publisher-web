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
// callback is (errorString, response) response=http://api.alexandria.io/#publish-new-artifact
LibraryDJS.publishArtifact = function (wallet, ipfs, address, alexandriaMedia, callback) {
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
            "alexandria-media": alexandriaMedia, //test,
            signature: signature
    };

    data["alexandria-media"].timestamp = parseInt(time);
    data["alexandria-media"].publisher = address;

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

function unixTime() {
    // slice is to strip milliseconds
    return Date.now().toString().slice(0, -3);
}

// callback is (errorString, txIDs Array)
LibraryDJS.Send = function (wallet, jsonData, address, amount, callback) {
    LibraryDJS.sendToBlockChain(wallet, jsonData, address, amount, function (err, txIDs) {
        callback(err, txIDs);
    });
};

// callback is (errorString, txIDs Array)
LibraryDJS.sendToBlockChain = function (wallet, txComment, address, amount, callback) {

    // set tx fee
    // feature non existent in js currently

    // get new address
    // change returns to sender currently

    // over sized?
    if (txComment.length > (CHOP_MAX_LEN * 10))
        callback("txComment is too large to fit within 10 multipart transactions. try making it smaller!");


    if (txComment.length > TXCOMMENT_MAX_LEN) {
        LibraryDJS.multiPart(wallet, txComment, address, amount, callback);
    }
    else {
        wallet.sendCoins(address, address, amount, txComment, function (err, data) {
            callback(null, [data.txid]);
        });
    }
};

// callback is (errorString, txIDs Array)
LibraryDJS.multiPart = function (wallet, txComment, address, amount, callback) {
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
        "," + address + "," + reference + "," + signature + "," + "):" + data;

    wallet.sendCoins(address, address, amount, multiPart, function (err, data) {
        txIDs[txIDs.length] = data.txid;
        reference = data.txid;

        var count = 0;
        for (var i = 1; i <= max; ++i) {
            part = i;
            data = chop[part];
            preImage = part.toString() + "-" + max.toString() + "-" + address + "-" + reference + "-" + data;
            signature = wallet.signMessage(address, preImage);

            multiPart = multiPartPrefix + part.toString() + "," + max.toString() +
                "," + address + "," + reference + "," + signature + "," + "):" + data;

            (function (i, address, amount, multiPart) {
                setTimeout(function () {
                    wallet.sendCoins(address, address, amount, multiPart, function (err, data) {
                        txIDs[txIDs.length] = data.txid;
                        ++count;
                        if (count == max) {
                            callback(null, txIDs);
                        }
                    });
                }, i * 1000);
            })(i, address, amount, multiPart);
        }
    });
};

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

const CHOP_MAX_LEN = 270;
const TXCOMMENT_MAX_LEN = 528;