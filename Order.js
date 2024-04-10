class Order {
    constructor(
        orderId,
        orderType,
        orderPrice,
        orderQuantity,
        orderClientId,
    ) {
        this.orderId = orderId;
        this.orderType = orderType;
        this.orderPrice = orderPrice;
        this.orderQuantity = orderQuantity;
        this.orderClientId = orderClientId;
    }
}

module.exports = {
    Order
};