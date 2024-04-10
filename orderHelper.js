const { Order } = require("./Order");

/**
 * Handle new order request
 * @param {{type:'BUY'|'SELL',price:Number,quantity: Integer, clientId:string}} order Order
 * @param {Map<string, Order>} orderBook Order Book 
 * @returns 
 */
function handleNewOrder(order, orderBook) {
    const orderType = order.type?.toUpperCase();

    if (orderType !== 'BUY' && orderType !== "SELL") {
        // Invalid Order Type
        throw new Error(`Bad Request! Invalid order type ${orderType}`);
    }

    // Fixed to 8 for BTC, For any other crypto currency this needs to change.
    const orderPrice = parseFloat(order.price).toFixed(8);

    const orderId = order.type + "_" + order.clientId + "_" + orderPrice.toString() + "_" + new Date().getTime();

    const newOrder = new Order(
        orderId,
        order.type,
        order.price,
        order.quantity,
        order.clientId
    );
    orderBook.set(orderId, newOrder);
    return {
        id: orderId,
        status: matchOrder(newOrder, orderBook)
    };
}

/**
 * Try matching an order and settle
 * @param {Order} order 
 * @returns 
 */
function matchOrder(order, orderBook) {
    const oppositeType = order.orderType === 'BUY' ? 'SELL' : 'BUY';
    const matchedOppositeOrder = findWithSpread(orderBook, order, oppositeType, order.orderQuantity);
    if (!matchedOppositeOrder) {
        return 'No Matching Order. Pending Settlement! Will settle once matched.';
    }
    if (matchedOppositeOrder.orderQuantity === order.orderQuantity) {
        // If both matched, do the required transfers, since this is only book keeping, skippping the tranfer logic
        // Take out both orders from order book.
        orderBook.delete(order.orderId);
        orderBook.delete(matchedOppositeOrder.orderId);
        return 'Order settled!';
    }
    else if (matchedOppositeOrder.orderQuantity > order.orderQuantity) {
        // Enough to fill the current order
        // Delete the current order, update the matched order qunatity
        const updatedOrder = new Order(
            matchedOppositeOrder.orderId,
            matchedOppositeOrder.orderType,
            matchedOppositeOrder.orderPrice,
            matchedOppositeOrder.orderQuantity - order.orderQuantity,
            matchedOppositeOrder.orderClientId
        );
        orderBook.set(matchedOppositeOrder.orderId, updatedOrder);
        orderBook.delete(order.orderId);
        return 'Order settled!';
    }
    else if (matchedOppositeOrder.orderQuantity < order.orderQuantity) {
        // Enough to fill the opposite order
        // Delete the current order, update the matched order qunatity
        const updatedOrder = new Order(
            order.orderId,
            order.orderType,
            order.orderPrice,
            order.orderQuantity - matchedOppositeOrder.orderQuantity,
            order.orderClientId
        );
        orderBook.set(order.orderId, updatedOrder);
        orderBook.delete(matchedOppositeOrder.orderId);
        return 'Order partially filled!';
    }
}


/**
 * 
 * @param {Map} map Order Map
 * @param {Order} order 
 * @param {BUY|SELL} oppositeOrderType 
 * @param {Number} orderQuantity
 * @returns {Order | undefined} Matched Order
 */
const findWithSpread = function (map, order, oppositeOrderType, orderQuantity) {
    const allOrders = [...map.values()];

    let matchedOrder;
    matchedOrder = allOrders.find(entry => entry.orderType === oppositeOrderType
        && entry.orderPrice === order.orderPrice && entry.orderQuantity === orderQuantity);

    if (!matchedOrder) {
        matchedOrder = [...map.values()]
            .find(entry => entry.orderType === oppositeOrderType
                && entry.orderPrice === order.orderPrice);

    }
    return matchedOrder;
}

module.exports = {
    handleNewOrder
}