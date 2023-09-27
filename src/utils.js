const ethers = require('ethers');

function parseUnits(number, units = 8) {
	if (typeof (number) == 'number') {
		number = Math.floor(number * 10 ** units) / 10 ** units;
		number = number.toString();
	}
	const value = ethers.utils.parseUnits(number, units || 8);
	return value.toString();
}
function formatUnits(number, units) {
	return ethers.utils.formatUnits(number || 0, units || 8);
}
module.exports = {
	parseUnits,
	formatUnits
}