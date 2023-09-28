const PikaSDK = require("@pikaprotocol/sdk")

async function run(){
    // const position = await PikaSDK.getPosition(1, true);
    console.log( await PikaSDK.getMarkPrice(1))
}
run();

// available functions

// getMarkPrice(1) //(productId)

// approveAllowance(100) //(approve amount)
// enableTrading()

// getPositionId(1, false) //(productId, isLong)
// getPosition(1, false) //(productId, isLong)
// openPosition(1, true, 1, 30, 1850, '0x') //(productId, isLong, leverage, margin, acceptablePrice, referralCode) **referralCode can be passed as "0x"
// createOpenMarketOrderWithCloseTriggerOrders(1, true, 100, 100, 1850, 1500, 2000, '0x') //(productId, isLong, leverage, margin, acceptablePrice, SLPrice, TPPrice, referralCode)
// modifyMargin(1, 30, 1, true) //(positionId, margin, productId, shouldIncrease)
// getActiveOrders()
// getActiveOrders(0xaaa...) //(address)
// getActivePositions()
// getActivePositionsFor(0xaaa...) //(address)
// createOpenOrder(1, false, 1, 30, 2000, true) //(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold)
// closePosition(1, 30, true, 1850) //(productId, margin, isLong, acceptablePrice)
// cancelOrder(0, true) //(index, isOpen)
// cancelMultipleOrders([], []) //(openOrderIndexes, closeOrderIndexes)
// cancelAllOrders()
// createCloseTriggerOrders(1, 30, 1, true, 1600, 2000) //(productId, margin, leverage, isLong, SLPrice, TPPrice)
// createCloseOrder(1, 30, true, 2000, true) //(productId, size, isLong, triggerPrice, triggerAboveThreshold)
// updateOpenOrder(1, 1, 1850, true, true) //(index, leverage, triggerPrice, triggerAboveThrehold, isOpen)
// updateCloseOrder(1, 30, 1850, true, true) //(index, size, triggerPrice, triggerAboveThrehold, isOpen)