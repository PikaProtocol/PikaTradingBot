const PikaSDK = require("@pikaprotocol/v1-sdk")

const position = await PikaSDK.getPosition(1, false);

//available functions
approveAllowance(100) //(approve amount)
enableTrading()

getPosition(1, false) //(productId, isLong)
openPosition(1, true, 1, 30, 1850, '0x') //(productId, isLong, leverage, margin, acceptablePrice, referralCode) **referralCode can be passed as "0x"
createOpenMarketOrderWithCloseTriggerOrders(1, true, 100, 100, 1850, 1500, 2000, '0x') //(productId, isLong, leverage, margin, acceptablePrice, SLPrice, TPPrice, referralCode)
modifyMargin(1, 30, 1, true) //(positionId, margin, productId, shouldIncrease)
openOrder(1, false, 1, 30, 2000, true) //(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold)
closePosition(1, 30, true, 1850) //(productId, margin, isLong, acceptablePrice)
cancelOrder('limit', 0, true) //(orderType, index, isOpen) **orderTyps is "limit" or "stop"
cancelOrderAll([], []) //(openOrderIndexes, closeOrderIndexes)
createCloseTriggerOrders(1, 30, 1, true, 1600, 2000) //(productId, margin, leverage, isLong, SLPrice, TPPrice)
createCloseOrder(1, 30, true, 2000, true) //(productId, size, isLong, triggerPrice, triggerAboveThreshold)
updateOrder(1, 1, 30, 1850, true, true) //(index, leverage, size, triggerPrice, triggerAboveThrehold, isOpen)