require("dotenv").config();
const Web3 = require("web3");
const { ethers } = require("ethers");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js")
const privateKey = process.env.PRIVATE_KEY;
const traderAddress = process.env.TRADER_ADDRESS;
const rpc = process.env.RPC_URL;
const MAX_ALLOWANCE = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
const EXECUTION_FEE = 25000;
const PYTH_MAX_TIMEOUT = 3000;
const PYTH_MAX_RETRIES = 5;
const PYTH_ENDPOINT = "https://hermes.pyth.network";
const {
	parseUnits,
	formatUnits
} = require("./utils");
const { Products, PYTH_PRICE_IDs} = require('./constants');

const GAS = 800000;
const web3 = new Web3(new Web3.providers.HttpProvider(rpc));

web3.eth.accounts.wallet.add({
	privateKey: privateKey,
	address: traderAddress
});

const PikaPerpV4_ABI = require("./abis/PikaPerpV4.json");
const PikaPerpV4_ADDR = "0x9b86B2Be8eDB2958089E522Fe0eB7dD5935975AB";

const OrderBook_ABI = require("./abis/OrderBook.json");
const OrderBook_ADDR = "0x835a179a9E1A57f15823eFc82bC460Eb2D9d2E7C";

const PositionManager_ABI = require("./abis/PositionManager.json");
const PositionManager_ADDR = "0xB67c152E69217b5aCB85A2e19dF13423351b0E27";

const PositionRouter_ABI = require("./abis/PositionRouter.json");
const PositionRouter_ADDR = "0xa78Cd820b198A943199deb0506E77d655b5078cC";

const USDC_ABI = require("./abis/USDC.json");
const USDC_ADDR = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

const PikaPerpV4ContractInstance = new web3.eth.Contract(PikaPerpV4_ABI, PikaPerpV4_ADDR);
const PositionManagerContractInstance = new web3.eth.Contract(PositionManager_ABI, PositionManager_ADDR);
const PositionRouterContractInstance = new web3.eth.Contract(PositionRouter_ABI, PositionRouter_ADDR);
const OrderBookContractInstance = new web3.eth.Contract(OrderBook_ABI, OrderBook_ADDR);
const USDCContractInstance = new web3.eth.Contract(USDC_ABI, USDC_ADDR);

async function getMarkPrice(productId){
	if(!Products[productId]) {
		console.log('unknown product id');
		return;
	}
	const priceID = PYTH_PRICE_IDs[Products[productId]];
	const pythConnection = new EvmPriceServiceConnection(PYTH_ENDPOINT, {
        httpRetries: PYTH_MAX_RETRIES,
        timeout: PYTH_MAX_TIMEOUT,
    });
    const priceFeeds = await pythConnection.getLatestPriceFeeds([priceID]);
	if(priceFeeds.length > 0){
		return formatUnits(priceFeeds[0]['price']['price']);
	} else{
		console.log("unknown price id");
		return;
	}
}

async function approveAllowanceForPerp(amount = MAX_ALLOWANCE) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(PikaPerpV4_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function approveAllowanceForPositionManager(amount = MAX_ALLOWANCE) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(PositionManager_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function approveAllowanceForPositionRouter(amount = MAX_ALLOWANCE) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(PositionRouter_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function approveAllowanceForOrderBook(amount = MAX_ALLOWANCE) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(OrderBook_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function enableMarketOrder() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PikaPerpV4ContractInstance.methods.setAccountManager(PositionManager_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function enablePositionManager() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PositionManagerContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function enableOrderBook() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await OrderBookContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function enableLimitOrder() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PikaPerpV4ContractInstance.methods.setAccountManager(OrderBook_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

function getPositionId(productId, isLong) {
	const id = ethers.utils.formatUnits(ethers.utils.solidityKeccak256(
		['address', 'uint256', 'bool'],
		[traderAddress, productId, isLong]
	), 0);
	return id.toString();
}

async function getPosition(productId, isLong) {
	const id = getPositionId(productId, isLong);
	const positionArr = await PikaPerpV4ContractInstance.methods.getPositions([id]).call();
	return positionArr[0];
}

async function openPosition(productId, isLong, leverage, margin, acceptablePrice, referralCode) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PositionManagerContractInstance.methods.createOpenPosition(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function createOpenMarketOrderWithCloseTriggerOrders(productId, isLong, leverage, margin, acceptablePrice, SLPrice, TPPrice, referralCode) {
	try {
		let totalExecutionFee = EXECUTION_FEE;
		if (SLPrice > 0 && TPPrice > 0) {
			totalExecutionFee = 3 * EXECUTION_FEE;
		} else if (SLPrice > 0 || TPPrice > 0) {
			totalExecutionFee = 2 * EXECUTION_FEE;
		}
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PositionRouterContractInstance.methods.createOpenMarketOrderWithCloseTriggerOrders(productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8), ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function openOrder(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await OrderBookContractInstance.methods.createOpenOrder(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(triggerPrice, 8), triggerAboveThrehold, EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function createCloseOrder(productId, size, isLong, triggerPrice, triggerAboveThreshold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const res = await OrderBookContractInstance.methods.createCloseOrder(traderAddress, productId, parseUnits(size), isLong, parseUnits(triggerPrice, 8), triggerAboveThreshold)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function updateOrder(index, leverage, size, triggerPrice, triggerAboveThrehold, isOpen) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		if (isOpen == true) {
			const res = await OrderBookContractInstance.methods.updateOpenOrder(index, leverage, parseUnits(triggerPrice, 8), triggerAboveThrehold)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
		} else {
			const res = await OrderBookContractInstance.methods.updateCloseOrder(index, size, parseUnits(triggerPrice, 8), triggerAboveThrehold)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
		}
	} catch (error) {
		console.log('error---', error)
	}
}

async function cancelOrder(orderType, index, isOpen) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		if (isOpen) {
			const res = await OrderBookContractInstance.methods.cancelOpenOrder(index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
		} else {
			const res = await OrderBookContractInstance.methods.cancelCloseOrder(traderAddress, index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
		}
	} catch (error) {
		console.log('error---', error)
	}
}

async function cancelOrderAll(openOrderIndexes, closeOrderIndexes) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await OrderBookContractInstance.methods.cancelMultiple(openOrderIndexes, closeOrderIndexes)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function modifyMargin(positionId, margin, productId, shouldIncrease) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PikaPerpV4ContractInstance.methods.modifyMargin(positionId, parseUnits(margin, 8), shouldIncrease)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function closePosition(productId, margin, isLong, acceptablePrice) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PositionManagerContractInstance.methods.createClosePosition(traderAddress, productId, parseUnits(margin), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function createCloseTriggerOrders(productId, margin, leverage, isLong, SLPrice, TPPrice) {
	try {
		let totalExecutionFee = 0;
		if (SLPrice > 0 && TPPrice > 0) {
			totalExecutionFee = 2 * EXECUTION_FEE;
		} else if (SLPrice > 0 || TPPrice > 0) {
			totalExecutionFee = 1 * EXECUTION_FEE;
		}
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		await PositionRouterContractInstance.methods.createCloseTriggerOrders(productId, parseUnits(margin), parseUnits(leverage), isLong, EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

async function approveAllowance(amount) {
	await approveAllowanceForPerp(amount)
	await approveAllowanceForPositionManager(amount)
	await approveAllowanceForPositionRouter(amount)
	await approveAllowanceForOrderBook(amount)
}

async function enableTrading() {
	await enableMarketOrder()
	await enablePositionManager()
	await enableOrderBook()
	await enableLimitOrder()
}

module.exports = {
	getMarkPrice,
	approveAllowanceForPerp,
	approveAllowanceForPositionManager,
	approveAllowanceForPositionRouter,
	approveAllowanceForOrderBook,
	enableMarketOrder,
	enablePositionManager,
	enableOrderBook,
	enableLimitOrder,
	getPosition,
	openPosition,
	createOpenMarketOrderWithCloseTriggerOrders,
	openOrder,
	createCloseOrder,
	updateOrder,
	cancelOrder,
	cancelOrderAll,
	modifyMargin,
	closePosition,
	createCloseTriggerOrders,
	approveAllowance,
	enableTrading
};