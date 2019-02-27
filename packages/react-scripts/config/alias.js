var path = require('path');
module.exports = {
	'babel-runtime': path.dirname(
		require.resolve('babel-runtime/package.json')
	),
	'components': path.join(__dirname, '../src/components'),
};
