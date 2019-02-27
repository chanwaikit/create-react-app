const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const paths = require('./paths');
const externals = require('./externals');
const path = require('path');
module.exports = {
	externals: externals,
	output: {
		path: path.resolve('dll'),
		filename: '[name].js',
		library: '[name]'
	},
	entry: {
		lib: [
			'store',
			'history',
			'superagent',
			'whatwg-fetch',
			'promise/lib/rejection-tracking',
			'promise/lib/es6-extensions.js',
			'object-assign'
		],
		lodash: [
			'lodash/each',
			'lodash/isEqual',
			'lodash/isPlainObject',
			'lodash/isArray',
			'lodash/indexOf'
		],
		antd: [
			'antd-mobile/lib/carousel',
			'antd-mobile/lib/list',
			'antd-mobile/lib/action-sheet',
			'antd-mobile/lib/toast',
			'antd-mobile/lib/calendar',
			'antd-mobile/lib/modal',
			'antd-mobile/lib/flex',
			'antd-mobile/lib/icon'
		],
		antd1: [
			'antd-mobile/lib/accordion',
			'antd-mobile/lib/white-space',
			'antd-mobile/lib/textarea-item',
			'antd-mobile/lib/tabs',
			'antd-mobile/lib/calendar',
			'antd-mobile/lib/checkbox',
			'antd-mobile/lib/wing-blank'
		]
	},
	plugins: [
		new webpack.DllPlugin({
			context: __dirname,
			path: path.resolve('dll', '[name].manifest.json'),
			name: '[name]', // 这里的命名要遵循变量命名规范，它是最终的包变量名
		}),
		new UglifyJSPlugin({
			cache: true,
			uglifyOptions: {
				output: {
					comments: false
				},
				compress: {
					warnings: false
				}
			}
		}),
		new BundleAnalyzerPlugin({
			// Can be `server`, `static` or `disabled`.
			// In `server` mode analyzer will start HTTP server to show bundle report.
			// In `static` mode single HTML file with bundle report will be generated.
			// In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by management `generateStatsFile` to `true`.
			analyzerMode: 'server',
			// Host that will be used in `server` mode to start HTTP server.
			analyzerHost: '127.0.0.1',
			// Port that will be used in `server` mode to start HTTP server.
			analyzerPort: 8888,
			// Path to bundle report file that will be generated in `static` mode.
			// Relative to bundles output directory.
			reportFilename: 'report.html',
			// Module sizes to show in report by default.
			// Should be one of `stat`, `parsed` or `gzip`.
			// See "Definitions" section for more information.
			defaultSizes: 'parsed',
			// Automatically open report in default browser
			openAnalyzer: true,
			// If `true`, Webpack Stats JSON file will be generated in bundles output directory
			generateStatsFile: false,
			// Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
			// Relative to bundles output directory.
			statsFilename: 'stats.json',
			// Options for `stats.toJson()` method.
			// For example you can exclude sources of your modules from stats file with `source: false` option.
			// See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
			statsOptions: {
				timings: true
			},
			// Log level. Can be 'info', 'warn', 'error' or 'silent'.
			logLevel: 'info'
		})
	]
};
