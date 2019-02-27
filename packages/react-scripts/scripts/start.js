
//node的module遵循CommonJS规范，但是webpack的运行离开不了nodejs，所以就可用require
//require跟import区别，个人觉得：require是运行时加载，可以动态加载。而import是编译时加载，只能静态导入，必须在文件开始的时候导入
'use strict';

//process是nodejs提供的一个全局对象，可以不使用require全局使用
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 探测和跟踪promise被rejected
process.on('unhandledRejection', err => {
	throw err;
});

// Ensure environment variables are read.
// require('../config/env');

const fs = require('fs');
const chalk = require('chalk'); //用于命令行的颜色变换
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');//清掉console.log
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');//判断
const {
	choosePort,
	createCompiler,
	prepareProxy,
	prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const inquirer = require('inquirer');
const paths = require('../config/paths');
const config = require('../config/webpack.config.dev');
const createDevServerConfig = require('../config/webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);//是否用yarn(管理工具)
const isInteractive = process.stdout.isTTY;// 判断 Node.js 是否运行在 TTY 上下文
const cachedPath = './scripts/.cached';

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) { //多入口
	process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
let cachedProxySetting;
try {
	cachedProxySetting = fs.readFileSync(cachedPath, 'utf8');
} catch (err) {
	cachedProxySetting = 'http://opv2-beta.zuolin.com';
}

console.log(chalk.blue('===================== 我哈慈悲 ====================='));
console.log(chalk.green('                       _oo0oo_                      '));
console.log(chalk.green('                      o8888888o                     '));
console.log(chalk.green('                      88" . "88                     '));
console.log(chalk.white('                      (| -_- |)                     '));
console.log(chalk.white('                      0\\  =  /0                     '));
console.log(chalk.white('                    ___/‘---’\\___                   '));
console.log(chalk.white('                  .\' \\|       |/ \'.                 '));
console.log(chalk.white('                / \\\\||||'), chalk.green('Aha'), chalk.white('|||// \\                '));
console.log(chalk.white('                / _||||- '), chalk.yellow('卍'), chalk.white('-|||||_\\               '));
console.log(chalk.white('               |   | \\\\\\  -  /// |   |              '));
console.log(chalk.white('               | \\_|  \'\'\\---/\'\'  |_/ |              '));
console.log(chalk.white('               \\  .-\\__  \'-\'  ___/-. /              '));
console.log(chalk.white('             ___\'. .\'  /--.--\\  \'. .\'___            '));
console.log(chalk.white('          ."" ‘<  ‘.___\\_<|>_/___.’ >’ "".          '));
console.log(chalk.white('         | | :  ‘- \\‘.;‘\\ _ /’;.’/ - ’ : | |        '));
console.log(chalk.white('         \\  \\ ‘_.   \\_ __\\ /__ _/   .-’ /  /        '));
console.log(chalk.white('     =====‘-.____‘.___ \\_____/___.-’___.-’=====     '));
console.log(chalk.white('                       ‘=---=’                      '));
console.log(chalk.white('                                                    '));
console.log(chalk.blue('=================== 哈哥开光,永无BUG ==============='));
console.log();
console.log();
inquirer
	.prompt([
		  {
			type: 'input',
			name: 'proxy',
			message: '需要代理的服务器地址？',
			default: cachedProxySetting,
			validate: function (value) {
				var pass = value.match(/^https?:\/\/+./i);
				if (pass) return true;
				return '服务器地址格式错误';
			}
		}
	]).then((answers) => {
		fs.writeFileSync(cachedPath, answers.proxy);

		choosePort(HOST, DEFAULT_PORT)
			.then(port => {
				if (port == null) {
					// We have not found a port.
					return;
				}
				const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
				const appName = require(paths.appPackageJson).name; // appName = resource-rental,取得是package.json里的name，require返回的是obj
				const urls = prepareUrls(protocol, HOST, port); //obj {lanUrlForConfig:'10.1.10.96',lanUrlForTerminal:'10.1.10.96:3000',localUrlForTerminal:'localhost:3000',localUrlForBrower:'localhost:3000'}
				// Create a webpack compiler that is configured with custom messages.
				const compiler = createCompiler(webpack, config, appName, urls, useYarn);//创建的程序
				// Load proxy config
				// const proxySetting = require(paths.appPackageJson).proxy;  //不从package里头拿proxy了

				const proxySetting = answers.proxy;
				const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
				// Serve webpack assets generated by the compiler over a web sever.
				const serverConfig = createDevServerConfig(
					proxyConfig,
					urls.lanUrlForConfig
				);
				const devServer = new WebpackDevServer(compiler, serverConfig);
				// Launch WebpackDevServer.
				devServer.listen(port, HOST, err => {
					if (err) {
						return console.log(err);
					}
					if (isInteractive) {
						clearConsole();
					}

					console.log(chalk.cyan('Starting the development server===\n'));
					openBrowser(urls.localUrlForBrowser);
				});

				['SIGINT', 'SIGTERM'].forEach(function (sig) {
					process.on(sig, function () {
						devServer.close();
						process.exit();
					});
				});
			})
			.catch(err => {
				if (err && err.message) {
					console.log(err.message);
				}
				process.exit(1);
			});
	});

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
