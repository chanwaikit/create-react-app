const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const alias = require('./alias');
const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const externals = require('./externals.js');

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: {
		common: [
			require.resolve('react-dev-utils/webpackHotDevClient'),
			require.resolve('./polyfills'),
			require.resolve('react-error-overlay'),
			paths.appIndexJs
		],
		intro: [
			require.resolve('react-dev-utils/webpackHotDevClient'),
			require.resolve('./polyfills'),
			require.resolve('react-error-overlay'),
			paths.appIntroJs
		],
		visit: [
			require.resolve('react-dev-utils/webpackHotDevClient'),
			require.resolve('./polyfills'),
			require.resolve('react-error-overlay'),
			paths.appVisitJs
		]
	},
	output: {
		path: paths.appBuild,
		pathinfo: true,
		filename: 'static/js/[name].js',
		chunkFilename: 'static/js/[name].chunk.js',
		publicPath: publicPath,
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath),
	},
	externals: externals,
	resolve: {
		modules: ['node_modules', paths.appNodeModules, paths.appSrc].concat(
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),
		extensions: ['.web.js', '.js', '.json', '.jsx'],

		alias,
		plugins: [
			new ModuleScopePlugin(paths.appSrc),
		],
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				exclude: [
					/\.html$/,
					/\.(js|jsx)$/,
					/\.css$/,
					/\.less$/,
					/\.json$/,
					/\.bmp$/,
					/\.gif$/,
					/\.jpe?g$/,
					/\.png$/,
					/\.svg$/,
				],
				loader: require.resolve('file-loader'),
				options: {
					name: 'static/media/[name].[hash:8].[ext]',
				},
			},
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: require.resolve('url-loader'),
				options: {
					limit: 10000,
					name: 'static/media/[name].[hash:8].[ext]',
				},
			},
			{
				test: /\.(js|jsx)$/,
				include: paths.appSrc,
				loader: require.resolve('babel-loader'),
				options: {
					plugins: [
						['import', { libraryName: 'antd-mobile', style: true }],
						['ehome']
					],
					cacheDirectory: true,
				},
			},
			{
				test: /\.css$/,
				use: [
					require.resolve('style-loader'),
					{
						loader: require.resolve('css-loader'),
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: require.resolve('postcss-loader'),
						options: {
							ident: 'postcss',
							plugins: () => [
								require('postcss-flexbugs-fixes'),
								autoprefixer({
									browsers: [
										'>1%',
										'last 4 versions',
										'Firefox ESR',
										'not ie < 9',
									],
									flexbox: 'no-2009',
								}),
							],
						},
					},
				],
			},

			{
				test: /\.(svg)$/i,
				loader: 'svg-sprite-loader',
				include: [
					require.resolve('antd-mobile').replace(/warn\.js$/, ''),
				]
			},
			{
				test: /\.less$/,
				use: [
					require.resolve('style-loader'),
					require.resolve('css-loader'),
					{
						loader: require.resolve('postcss-loader'),
						options: {
							ident: 'postcss',
							plugins: () => [
								autoprefixer({
									browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
								}),
								pxtorem({ rootValue: 100, propWhiteList: [] })
							],
						},
					},
					{
						loader: require.resolve('less-loader'),
						options: {
							modifyVars: {
								'hd': '2px',
								'fill-body': '#f8f8f8'
							},
						},
					},
				],
			},
		],
	},
	plugins: [
		new InterpolateHtmlPlugin(env.raw),

		new HtmlWebpackPlugin({
			chunksSortMode: function (entry1, entry2) {
				return 1; // <-- your fancy array sort method goes here :)
			},
			inject: true,
			template: paths.appHtml,
			filename: 'index.html',
			chunks: ['common']
		}),

		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appIntroHtml,
			filename: 'intro.html',
			chunks: ['intro'],
			chunksSortMode: function (entry1, entry2) {
				return 1; // <-- your fancy array sort method goes here :)
			},
		}),

		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appVisitHtml,
			filename: 'visit.html',
			chunks: ['visit'],
			chunksSortMode: function (entry1, entry2) {
				return 1; // <-- your fancy array sort method goes here :)
			},
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.DefinePlugin(env.stringified),
		new webpack.HotModuleReplacementPlugin(),
		new CaseSensitivePathsPlugin(),
		new WatchMissingNodeModulesPlugin(paths.appNodeModules),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
	performance: {
		hints: false,
	},
};
