require("dotenv").config();
const Web3 = require("web3");
const axios = require("axios");
const { ethers } = require("ethers");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js")
const privateKey = process.env.PRIVATE_KEY;
const traderAddress = process.env.TRADER_ADDRESS;
const rpc = process.env.RPC_URL;
const MAX_ALLOWANCE = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
const EXECUTION_FEE = process.env.EXECUTION_FEE;
const PYTH_MAX_TIMEOUT = 3000;
const PYTH_MAX_RETRIES = 5;
const PYTH_ENDPOINT = "https://hermes.pyth.network";
const {
	parseUnits,
	formatUnits
} = require("./utils");

const GAS = 1000000;
const web3 = new Web3(new Web3.providers.HttpProvider(rpc));

const resourceURL = "https://raw.githubusercontent.com/PikaProtocol/PikaTradingSDK/master/priceFeeds.json";

const graph_url = "https://api.thegraph.com/subgraphs/name/ethandev0/pikaperpv4_optimism";

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

async function getMarkPrice(productId) {
	let products;
	const response = await axios.get(resourceURL);
	if (response.status === 200) {
		products = response.data;
	} else {
		throw new Error('Error: Unable to retrieve data from the URL.');
	}
	let product;
	for (const key in products) {
		if (products[key].productId == productId) {
			product = products[key];
		}
	}
	if (!product) {
		console.log('unknown product id');
		return;
	}
	const priceID = product.pythFeed;
	const pythConnection = new EvmPriceServiceConnection(PYTH_ENDPOINT, {
		httpRetries: PYTH_MAX_RETRIES,
		timeout: PYTH_MAX_TIMEOUT,
	});
	const priceFeeds = await pythConnection.getLatestPriceFeeds([priceID]);
	if (priceFeeds.length > 0) {
		return formatUnits(priceFeeds[0]['price']['price']);
	} else {
		console.log("unknown price id");
		return;
	}
}

async function approveAllowanceForPerp(amount) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = amount > 0 ? parseUnits(amount, 6) : MAX_ALLOWANCE;
		const tx = await USDCContractInstance.methods.approve(PikaPerpV4_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('approveAllowanceForPerp succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('approveAllowanceForPerp failed---', error)
	}
}

async function approveAllowanceForPositionManager(amount) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = amount > 0 ? parseUnits(amount, 6) : MAX_ALLOWANCE;
		const tx = await USDCContractInstance.methods.approve(PositionManager_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('approveAllowanceForPositionManager succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('approveAllowanceForPositionManager failed---', error)
	}
}

async function approveAllowanceForPositionRouter(amount) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = amount > 0 ? parseUnits(amount, 6) : MAX_ALLOWANCE;
		const tx = await USDCContractInstance.methods.approve(PositionRouter_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('approveAllowanceForPositionRouter succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('approveAllowanceForPositionRouter failed---', error)
	}
}

async function approveAllowanceForOrderBook(amount) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const amountToApprove = amount > 0 ? parseUnits(amount, 6) : MAX_ALLOWANCE;
		const tx = await USDCContractInstance.methods.approve(OrderBook_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('approveAllowanceForOrderBook succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('approveAllowanceForOrderBook failed---', error)
	}
}

async function enableMarketOrder() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PikaPerpV4ContractInstance.methods.setAccountManager(PositionManager_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('enableMarketOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('enableMarketOrder failed---', error)
	}
}

async function enablePositionManager() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PositionManagerContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('enablePositionManager succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('enablePositionManager failed---', error)
	}
}

async function enableOrderBook() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('enableOrderBook succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('enableOrderBook failed---', error)
	}
}

async function enableLimitOrder() {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PikaPerpV4ContractInstance.methods.setAccountManager(OrderBook_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('enableLimitOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('enableLimitOrder failed---', error)
	}
}

function getPositionId(address, productId, isLong) {
	const id = ethers.utils.formatUnits(ethers.utils.solidityKeccak256(
		['address', 'uint256', 'bool'],
		[address, productId, isLong]
	), 0);
	return id.toString();
}

async function getPosition(productId, isLong) {
	const id = getPositionId(traderAddress, productId, isLong);
	const positionArr = await PikaPerpV4ContractInstance.methods.getPositions([id]).call();
	return positionArr[0];
}

async function getPositionIds(address) {
	let products = {};
	const productIds = [];
	const positionIds = [];
	const response = await axios.get(resourceURL);
	if (response.status === 200) {
		products = response.data;
	} else {
		throw new Error('Error: Unable to retrieve data from the URL.');
	}
	for (const key in products) {
		if (products.hasOwnProperty(key)) {
			productIds.push(products[key].productId);
		}
	}
	for (const productId of productIds) {
		positionIds.push(getPositionId(address, productId, true));
		positionIds.push(getPositionId(address, productId, false));
	}
	return positionIds;
}

async function getActivePositions() {
	try {
		let positionIds = await getPositionIds(traderAddress);
		if (!positionIds.length) return;
		// unique
		positionIds = positionIds.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});
		let positions = await PikaPerpV4ContractInstance.methods.getPositions(positionIds).call();
		positions = positions.filter(item => item.productId && parseInt(item.productId) > 0);
		return positions
	} catch (error) {
		console.log('getActivePositions failed---', error)
	}
}

async function getActivePositionsFor(address) {
	try {
		let positionIds = await getPositionIds(address);
		if (!positionIds.length) return;
		// unique
		positionIds = positionIds.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});
		let positions = await PikaPerpV4ContractInstance.methods.getPositions(positionIds).call();
		positions = positions.filter(item => item.productId && parseInt(item.productId) > 0);
		return positions
	} catch (error) {
		console.log('getActivePositionsFor failed---', error)
	}
}

async function openPosition(productId, isLong, leverage, margin, acceptablePrice, referralCode) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PositionManagerContractInstance.methods.createOpenPosition(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('openPosition succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('openPosition failed---', error)
	}
}

async function getActiveOrders(){
	const response = await fetch(graph_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query {
					orders(
					  first: 1000
					  where: {account: "${traderAddress.toLocaleLowerCase()}", status: "open"}
					) {
					  account
					  createdTimestamp
					  isLong
					  isOpen
					  leverage
					  margin
					  size
					  status
					  productId
					  triggerAboveThreshold
					  triggerPrice
					  type
					  index
					}
				  }
			`
		})
	});
	const json = await response.json();
	return json.data.orders;
}

async function getActiveOrdersFor(address){
	const response = await fetch(graph_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query {
					orders(
					  first: 1000
					  where: {account: "${address.toLocaleLowerCase()}", status: "open"}
					) {
					  account
					  createdTimestamp
					  isLong
					  isOpen
					  leverage
					  margin
					  size
					  status
					  productId
					  triggerAboveThreshold
					  triggerPrice
					  type
					  index
					}
				  }
			`
		})
	});
	const json = await response.json();
	return json.data.orders;
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
		const tx = await PositionRouterContractInstance.methods.createOpenMarketOrderWithCloseTriggerOrders(productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8), ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('createOpenMarketOrderWithCloseTriggerOrders succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('createOpenMarketOrderWithCloseTriggerOrders failed---', error)
	}
}

async function createOpenOrder(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.createOpenOrder(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(triggerPrice, 8), triggerAboveThrehold, EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('createOpenOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('createOpenOrder failed---', error)
	}
}

async function createCloseOrder(productId, size, isLong, triggerPrice, triggerAboveThreshold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.createCloseOrder(traderAddress, productId, parseUnits(size), isLong, parseUnits(triggerPrice, 8), triggerAboveThreshold)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('createCloseOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('createCloseOrder failed---', error)
	}
}

async function updateOpenOrder(index, leverage, triggerPrice, triggerAboveThrehold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.updateOpenOrder(index, leverage, parseUnits(triggerPrice, 8), triggerAboveThrehold)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('updateOpenOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('updateOpenOrder failed---', error)
	}
}

async function updateCloseOrder(index, size, triggerPrice, triggerAboveThrehold) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.updateCloseOrder(index, size, parseUnits(triggerPrice, 8), triggerAboveThrehold)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('updateCloseOrder succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('updateCloseOrder failed---', error)
	}
}

async function cancelOrder(index, isOpen) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		if (isOpen) {
			const tx = await OrderBookContractInstance.methods.cancelOpenOrder(index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
			console.log('cancelOrder succeeded---', tx.transactionHash)
		} else {
			const tx = await OrderBookContractInstance.methods.cancelCloseOrder(traderAddress, index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					nouce: nouce + 1,
					maxPriorityFeePerGas: 3
				})
			console.log('cancelOrder succeeded---', tx.transactionHash)
		}
	} catch (error) {
		console.log('cancelOrder failed---', error)
	}
}

async function cancelMultipleOrders(openOrderIndexes, closeOrderIndexes) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.cancelMultiple(openOrderIndexes, closeOrderIndexes)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('cancelMultipleOrders succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('cancelMultipleOrders failed---', error)
	}
}

async function cancelAllOrders() {
	try {
		const orders = await getActiveOrders();
		let openOrderIndexes = [];
		let closeOrderIndexes = [];
		orders.map((order) => {
			if(order.isOpen){
				openOrderIndexes.push(order.index)
			} else{
				closeOrderIndexes.push(order.index)
			}
		})
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await OrderBookContractInstance.methods.cancelMultiple(openOrderIndexes, closeOrderIndexes)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('cancelAllOrders succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('cancelAllOrders failed---', error)
	}
}

async function modifyMargin(positionId, margin, productId, shouldIncrease) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PikaPerpV4ContractInstance.methods.modifyMargin(positionId, parseUnits(margin, 8), shouldIncrease)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('modifyMargin succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('modifyMargin failed---', error)
	}
}

async function closePosition(productId, margin, isLong, acceptablePrice) {
	try {
		const nouce = await web3.eth.getTransactionCount(traderAddress);
		const tx = await PositionManagerContractInstance.methods.createClosePosition(traderAddress, productId, parseUnits(margin), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('closePosition succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('closePosition failed---', error)
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
		const tx = await PositionRouterContractInstance.methods.createCloseTriggerOrders(productId, parseUnits(margin), parseUnits(leverage), isLong, EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				nouce: nouce + 1,
				maxPriorityFeePerGas: 3
			})
		console.log('createCloseTriggerOrders succeeded---', tx.transactionHash)
	} catch (error) {
		console.log('createCloseTriggerOrders failed---', error)
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
	getPositionId,
	getPosition,
	getActivePositions,
	getActivePositionsFor,
	openPosition,
	getActiveOrders,
	getActiveOrdersFor,
	createOpenMarketOrderWithCloseTriggerOrders,
	createOpenOrder,
	createCloseOrder,
	updateOpenOrder,
	updateCloseOrder,
	cancelOrder,
	cancelMultipleOrders,
	cancelAllOrders,
	modifyMargin,
	closePosition,
	createCloseTriggerOrders,
	approveAllowance,
	enableTrading
};