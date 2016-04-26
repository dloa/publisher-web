// Using a `wallet` from fluffy-enigma

var LibraryDJS = LibraryDJS || {};

function signPublisher(wallet, name, address) {
    // http://api.alexandria.io/#sign-publisher-announcement-message
    var toSign = name + "-" + address + "-" + unixTime();

    var signed = wallet.signMessage(address, toSign);

    return {
        status: "success",
        response: [
            signed
        ]
    }
}


LibraryDJS.announcePublisher = function (wallet, name, address, bitMessage, email, signature) {
    var data = {
        "alexandria-publisher": {
            "name": name,
            "address": address,
            "timestamp": unixTime(),
            "bitmessage": bitMessage,
            "email": CryptoJS.MD5(email).toString()
        },
        "signature": signature
    };

    return LibraryDJS.Send(JSON.stringify(data));
};

function unixTime() {
    // slice is to strip milliseconds
    return Date.now().toString().slice(0, -3);
}

LibraryDJS.Send = function (jsonData) {
    LibraryDJS.sendToBlockChain(jsonData);
};


LibraryDJS.sendToBlockChain = function (txComment, address, amount) {

    // set tx fee
    // feature non existent in js currently

    // get new address
    // change returns to sender currently

    // over sized?
    if (txComment.length > (CHOP_MAX_LEN * 10))
        return JSON.stringify({
            "success": false,
            "Response": "txComment is too large to fit within 10 multipart transactions. try making it smaller!"
        });


    var txIDs = [];
    if (txComment.length > TXCOMMENT_MAX_LEN) {
        txIDs = LibraryDJS.multiPart(txComment, address, amount);
    }
    else{
        txIDs[0] = wallet.sendCoins(address, address, amount, txComment);
    }
    return txIDs;
};

LibraryDJS.multiPart = function (txComment, address, amount) {
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

    var txID = wallet.sendCoins(address, address, amount, multiPart);

    // ToDo: get txID
    txIDs[txIDs.length] = txID;
    reference = txID;

    for (var i = 1; i <= max; ++i) {
        part = i;
        data = chop[part];
        preImage = part.toString() + "-" + max.toString() + "-" + address + "-" + reference + "-" + data;
        signature = wallet.signMessage(address, preImage);

        multiPart = multiPartPrefix + part.toString() + "," + max.toString() +
            "," + address + "," + reference + "," + signature + "," + "):" + data;

        txID = wallet.sendCoins(address, address, amount, multiPart);
        txIDs[txIDs.length] = txID;
    }

    return txIDs;
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

const CHOP_MAX_LEN = 3;
const TXCOMMENT_MAX_LEN = 528;