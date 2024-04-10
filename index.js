'use strict'

const { PeerRPCServer } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const { handleNewOrder } = require('./orderHelper');

const orderBook = new Map();

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})

link.start();

const peer = new PeerRPCServer(link, {});
peer.init();

const service = peer.transport('server');
service.listen(1337);

setInterval(() => {
  link.announce('bfx_worker', service.port, {});
}, 1000);

service.on('request', (rid, key, payload, handler) => {
  let result = null, error = null;
  try {
    result = handleNewOrder(payload, orderBook);
  } catch (e) {
    error = e;
  }
  handler.reply(error, result);
});

