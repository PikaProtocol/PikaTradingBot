const ethers = require('ethers');

function parseUnits(number, units = 8) {
	if (typeof (number) == 'number') {
		number = Math.floor(number * 10 ** units) / 10 ** units;
		number = number.toString();
	}
	return ethers.utils.parseUnits(number, units || 8);
}
module.exports = {
	parseUnits
}