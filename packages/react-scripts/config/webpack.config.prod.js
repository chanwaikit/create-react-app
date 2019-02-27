const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const paths = require('./paths');
const getClientEnvironment = require('./env');
const alias = require('./alias');
const externals = require('./externals.js');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name].[contenthash:8].css';

const extractTextPluginOptions = shouldUseRelativeAssetPaths
	? { publicPath: Array(cssFilename.split('/').length).join('../') }
	: {};

module.exports = {
	bail: true,
	devtool: 'source-map',
	entry: {
		'app': [
			require.resolve('./polyfills'),
			paths.appIndexJs
		],
		'intro': [
			require.resolve('./polyfills'),
			paths.appIntroJs
		],
		'visit': [
			require.resolve('./polyfills'),
			paths.appVisitJs
		]
	},
	output: {
		path: paths.appBuild,
		filename: 'static/js/[name].[chunkhash:8].js',
		chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
		publicPath: publicPath,
		devtoolModuleFilenameTemplate: info =>
			path.relative(paths.appSrc, info.absoluteResourcePath),
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
				}
			},

			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract(
					Object.assign(
						{
							fallback: require.resolve('style-loader'),
							use: [
								{
									loader: require.resolve('css-loader'),
									options: {
										importLoaders: 1,
										minimize: true,
										sourceMap: true,
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
						extractTextPluginOptions
					)
				),
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
				loader: ExtractTextPlugin.extract(
					Object.assign(
						{
							fallback: require.resolve('style-loader'),
							use: [
								{
									loader: require.resolve('css-loader'),
									options: {
										root: path.resolve(paths.appSrc, 'images')
									}
								},
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
										}
									},
								}
							]
						},
						extractTextPluginOptions
					)
				)
			},

		],
	},
	plugins: [
		new InterpolateHtmlPlugin(env.raw),
		new BundleAnalyzerPlugin(),

		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			filename: 'index.html',
			chunks: ['vendor', 'app'],
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			}
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appIntroHtml,
			filename: 'intro.html',
			chunks: ['vendor', 'intro'],
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			}
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appVisitHtml,
			filename: 'visit.html',
			chunks: ['vendor', 'visit'],
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			}
		}),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: path.resolve('dll', 'antd.manifest.json')
		}),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: path.resolve('dll', 'antd1.manifest.json')
		}),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: path.resolve('dll', 'lib.manifest.json')
		}),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: path.resolve('dll', 'lodash.manifest.json')
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity
		}),

		new AddAssetHtmlPlugin([
			{ filepath: path.resolve('dll/antd.js'), hash: true, includeSourcemap: false },
			{ filepath: path.resolve('dll/antd1.js'), hash: true, includeSourcemap: false },
			{ filepath: path.resolve('dll/lib.js'), hash: true, includeSourcemap: false },
			// Glob to match all of the dll file
			{ filepath: path.resolve('dll/lodash.js'), hash: true, includeSourcemap: false },

		]),

		new webpack.DefinePlugin(env.stringified),
		// Minify the code.
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				comparisons: false,
			},
			output: {
				comments: false,
			},
			sourceMap: true,
		}),
		new ExtractTextPlugin({
			filename: cssFilename,
			allChunks: true
		}),

		new ManifestPlugin({
			fileName: 'asset-manifest.json',
		}),
		new SWPrecacheWebpackPlugin({
			dontCacheBustUrlsMatching: /\.\w{8}\./,
			filename: 'service-worker.js',
			logger (message) {
				if (message.indexOf('Total precache size is') === 0) {
					//
				}
				// console.log(message);
			},
			minify: true,
			navigateFallback: publicUrl + '/index.html',
			navigateFallbackWhitelist: [/^(?!\/__).*/],
			staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
			stripPrefix: paths.appBuild.replace(/\\/g, '/') + '/',
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
};
