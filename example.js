const pikaSDK = require("@pikaprotocol/sdk")

async function run(){

  // approve the contracts to spend your tokens, it will send 4 txs to approve contracts: PikaPerpV4, PositionManager, OrderBook, PositionRouter
  await pikaSDK.approveAllowance(100) //(approve amount)
  // enable market and limit orders(it will send 4 txs)
  await pikaSDK.enableTrading()

  // get current mark price of a productId, product id of each pair can be found at https://raw.githubusercontent.com/PikaProtocol/PikaTradingSDK/master/priceFeeds.json
  const markPrice = await pikaSDK.getMarkPrice(1)
  console.log("mark price", markPrice)

  // open a long ETH-USD position with 1x leverage and 30 USDC margin with 0.3% slippage allowance
  // (the order will be cancelled if the executed price is above the slippage allowance). You can also input any acceptable price you want.
  await pikaSDK.openPosition(1, true, 1, 30, markPrice * (1 + 0.003), '0x') //(productId, isLong, leverage, margin, acceptablePrice, referralCode) **referralCode can be passed as "0x"
  // check if your position is open(recommend to wait for 15 seconds after the position is opened)
  const position = await pikaSDK.getPosition(1, true); //(productId, isLong)
  console.log(position);
  // query all your active positions
  const positions = await pikaSDK.getActivePositions()
  console.log("all active positions", positions)
  
  // increase margin of your long ETH position by 30 USDC
  await pikaSDK.modifyMargin(pikaSDK.getPositionId(1, true), 30, 1, true) //(positionId, margin, shouldIncrease)

  // close your entire long ETH position with 0.3% slippage. (the order will be cancelled if the executed price is below $1600)
  await pikaSDK.closePosition(1, 60, true, markPrice * (1 - 0.003)) //(productId, margin, isLong, acceptablePrice)

  // create an open ETH long limit order which will trigger when the price falls below $1500
  await pikaSDK.createOpenOrder(1, true, 1, 30, 1500, false) //(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold)
  // cancel all the active orders
  await pikaSDK.cancelAllOrders()

  // open a short ETH-USD position with 1x leverage and 30 USDC margin with 0.3% slippage allowance
  await pikaSDK.openPosition(1, false, 1, 30, markPrice * (1 - 0.003), '0x') //(productId, isLong, leverage, margin, acceptablePrice, referralCode) **referralCode can be passed as "0x"
  // create a close ETH short limit order which will get triggerred when the price is below $1500
  await pikaSDK.createCloseOrder(1, 30, true, 1500, true) //(productId, size, isLong, triggerPrice, triggerAboveThreshold)

  // query all the active orders
  const orders = await pikaSDK.getActiveOrders() // the active orders may only show up after 10 seconds of creating the orders
  console.log("active orders", orders)

  // update one of the above active order's trigger price, you can also update open order by calling updateOpenOrder
  await pikaSDK.updateCloseOrder(2, 30, 1510, false) //(index, size, triggerPrice, triggerAboveThreshold)

  // cancel an order by inputting the index and isOpen parameter
  await pikaSDK.cancelOrder( 0, false) //(orderType, index, isOpen) **orderType is "limit" or "stop"
  //// you can also cancel multiple orders by inputting the open order indexes and close order indexes
  // await pikaSDK.cancelMultipleOrders([0], []) //(openOrderIndexes, closeOrderIndexes)

  // create stop-loss and take-profit orders for the existing ETH-USD long position(stop loss price at 1500 and take profit price at 1700)
  await pikaSDK.createCloseTriggerOrders(1, 30, 1, true, 1500, 1700) //(productId, margin, leverage, isLong, SLPrice, TPPrice)

  // create a market ETH-USD Long position with stop-loss price at 1500 and take-profit price at 1800
  await pikaSDK.createOpenMarketOrderWithCloseTriggerOrders(1, true, 10, 30, 1650, 1500, 1800, '0x') //(productId, isLong, leverage, margin, acceptablePrice, SLPrice, TPPrice, referralCode

}
run();
