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

    var signature = LibraryDJS.signArtifact(wallet, ipfs, address, time);

    var data = {
        "media-data": {
            "alexandria-media": alexandriaMedia,
            "signature": signature
        }
    };

    data["media-data"]["alexandria-media"].timestamp = parseInt(time);

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

    LibraryDJS.Send(wallet, JSON.stringify(data), address, 0.002, function (err, txIDs) {
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

        var count = 1;
        for (var i = 1; i <= max; ++i) {
            part = i;
            data = chop[part];
            preImage = part.toString() + "-" + max.toString() + "-" + address + "-" + reference + "-" + data;
            signature = wallet.signMessage(address, preImage);

            multiPart = multiPartPrefix + part.toString() + "," + max.toString() +
                "," + address + "," + reference + "," + signature + "," + "):" + data;

            wallet.sendCoins(address, address, amount, multiPart, function (err, data) {
                txIDs[txIDs.length] = data.txid;
                ++count;
                if (count == max) {
                    callback(null, txIDs);
                }
            });

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