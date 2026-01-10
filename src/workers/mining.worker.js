import CryptoJS from 'crypto-js';

self.onmessage = (e) => {
    const { index, previousHash, timestamp, dataString, difficulty } = e.data;
    let nonce = 0;
    let hash = "";

    const target = Array(difficulty + 1).join("0");
    const startTime = Date.now();

    // Loop Mining
    while (true) {
        hash = CryptoJS.SHA256(
            index +
            previousHash +
            timestamp +
            dataString +
            nonce
        ).toString();

        if (hash.substring(0, difficulty) === target) {
            break;
        }
        nonce++;
    }

    const endTime = Date.now();

    self.postMessage({
        nonce,
        hash,
        duration: endTime - startTime
    });
};
