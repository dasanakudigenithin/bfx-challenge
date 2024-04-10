'use strict'

const { PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

const clientId = "client1";

const link = new Link({
    grape: 'http://127.0.0.1:30001',
    requestTimeout: 10000
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

const payload = [{
    type: "BUY",
    price: 1190190190191.1919191919,
    quantity: 10,
    clientId
},
{
    type: "BUY",
    price: 1190190190191.1919191919,
    quantity: 10,
    clientId
},
{
    type: "SELL",
    price: 1190190190191.1919191919,
    quantity: 10,
    clientId
},
{
    type: "SELL",
    price: 1190190.1919191919,
    quantity: 2,
    clientId
},
{
    type: "BUY",
    price: 1190190190191.1919191919,
    quantity: 10,
    clientId
},
{
    type: "BUY",
    price: 1190190.1919191919,
    quantity: 10,
    clientId
},
{
    type: "SELL",
    price: 1190190.1919191919,
    quantity: 2,
    clientId
}
];
let i = 0;
const interval = setInterval(() => {
    if (i === payload.length) {
        clearInterval(interval);
        return;
    }
    peer.request('bfx_worker', payload[i++], { timeout: 100000 }, (err, result) => {
        if (err) throw err;
        console.log(
            'Order Received : ',
            result.id,
            'Status : ',
            result.status
        );
    })
}, 2000);
