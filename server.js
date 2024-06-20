// server.js
const WebSocket = require('ws');
const express = require('express');

const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const ws = new WebSocket('wss://pumpportal.fun/api/data');

//CSV
const csvFilePath = path.join(__dirname, 'payloads.csv');
if (!fs.existsSync(csvFilePath)) {
    const headers = ['date', 'signature', 'mint', 'traderPublicKey', 'txType', 'initialBuy', 'bondingCurveKey', 'vTokensInBondingCurve', 'vSolInBondingCurve', 'marketCapSol', 'link'];
    fs.writeFileSync(csvFilePath, headers.join(',') + '\n');
}

const tokensToWatch = [];

ws.on('open', function open() {
    // Subscribing to token creation events
    const payloadNewTokens = {
        method: "subscribeNewToken",
    }
    ws.send(JSON.stringify(payloadNewTokens));

    // Subscribing to trades made by accounts
    // payload = {
    //     method: "subscribeAccountTrade",
    //     keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    // }
    // ws.send(JSON.stringify(payload));



    // Subscribing to trades on tokens
    // const payloadTradeToken = {
    //     method: "subscribeTokenTrade",
    //     keys: ['43cWbojkBv1PfE7oHzrvQGNRh5z1AHkxGh9WtBhuEZds'] // array of token CAs to watch
    // }
    // ws.send(JSON.stringify(payloadTradeToken));
});

ws.on('message', function message(data) {
    try {
        const payload = JSON.parse(data);
        const date = new Date().toISOString();

        const csvRow = [
            date,
            payload.signature,
            payload.mint,
            payload.traderPublicKey,
            payload.txType,
            payload.initialBuy,
            payload.bondingCurveKey,
            payload.vTokensInBondingCurve,
            payload.vSolInBondingCurve,
            payload.marketCapSol,
            `https://photon-sol.tinyastro.io/en/lp/${payload.mint}`
        ].join(',');

        if (!payload.signature)
            return;

        // Append the row to the CSV file
        fs.appendFileSync(csvFilePath, csvRow + '\n');
        console.log(`${date}: wrote to CSV`)

        // if (payload.marketCapSol < 35) {
        //     console.log(payload);
        //     //tokensToWatch.push(payload.mint);
        //     console.log(`https://photon-sol.tinyastro.io/en/lp/${payload.mint}?handle=475121e34ecac6acea2bc`)
        // }
    } catch (err) {
        console.error(err);
    }
});

// Define a route for the home page
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// {
//     signature: '2C87UoRip2NfLVn1EqxEamH2h3rdiKByXZKXxK3e4CPr4ohrGmjLAMHZreCyjvimjhxcHpg7nZBvdzZzYiLwtD71',
//     mint: '3Lngq6T2rGJ9Fjydw8LREoeiovQ89TGr74QQ4joUpump',
//     traderPublicKey: 'J9DSkkth8imCwpTtMTdTxp9zBVn98eBKtg5jrmF62mjt',
//     txType: 'create',
//     initialBuy: 56131159.969673,
//     bondingCurveKey: '7dTHRF2HWzSK6LJdoL7Usp88gspTYDcSnswwxmWiZPWt',
//     vTokensInBondingCurve: 1016868840.030327,
//     vSolInBondingCurve: 31.65599999999997,
//     marketCapSol: 31.130858527492954
// }
