# Contour Shuttle Xpress and ShuttlePro connection library

[![Node CI](https://github.com/nytamin/contour-shuttle/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/nytamin/contour-shuttle/actions/workflows/lint-and-test.yml)
[![npm](https://img.shields.io/npm/v/shuttle-node?label=npm%20-%20Node.js)](https://www.npmjs.com/package/shuttle-node)
[![npm](https://img.shields.io/npm/v/shuttle-webhid?label=npm%20-%20Browser)](https://www.npmjs.com/package/shuttle-webhid)

A Node.js module to interact with the [Contour devices](https://contourdesign.se), such as the Xpress and ShuttlePro.

This repository is not affiliated with Contour Design in any way.

License: MIT

## Demo

If you are using a [browser that supports WebHID](https://caniuse.com/webhid), you can try out the library right away, in the browser: [Demo](https://nytamin.github.io/contour-shuttle/).

## Supported devices

Some of the devices supported by this library are:

- Controller XPress
- Controller Pro v1
- Shuttle XPress
- Shuttle Pro

See the full list in [products.ts](packages/core/src/products.ts).

## Installation

### To use in Node.js

```bash
$ npm install --save shuttle-node
or
$ yarn add shuttle-node
```

### To use in browser

```bash
$ npm install --save shuttle-webhid
or
$ yarn add shuttle-webhid
```

### Linux

On linux, the `udev` subsystem blocks access for non-root users to the Shuttle without some special configuration. Save the following to `/etc/udev/rules.d/50-shuttle.rules` and reload the rules with `sudo udevadm control --reload-rules`

```bash
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0b33", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0b33", MODE="0666", GROUP="plugdev"
```

## Getting started - Node.js

### Watch for connected Contour devices (recommended)

This is the recommended way to use this library, to automatically be connected or reconnected to the device.

_Note: The watcher uses the [node-usb](https://github.com/node-usb/node-usb) library, which might be unsupported on some platforms. If it is not supported, it can use polling as fallback._

```javascript
const { ShuttleWatcher } = require('shuttle-node') // or shuttle-webhid in browser

/*
	This example connects to any connected Shuttle devices and logs
	whenever the jog/shuttle is moved or a button is pressed.
*/

// Set up the watcher for Shuttle:
const watcher = new ShuttleWatcher({
	// usePolling: false // To be used if node-usb is not supported
	// pollingInterval= 1000
})
watcher.on('error', (e) => {
	console.log('Error in ShuttleWatcher', e)
})
watcher.on('connected', (shuttle) => {
	console.log(`Shuttle device of type ${shuttle.info.name} connected`)

	shuttle.on('disconnected', () => {
		console.log(`Shuttle device of type ${shuttle.info.name} was disconnected`)
		// Clean up stuff
		shuttle.removeAllListeners()
	})
	shuttle.on('error', (...errs) => {
		console.log('Shuttle error:', ...errs)
	})
	// Listen to jog rotation changes:
	shuttle.on('jog', (delta, value) => {
		console.log(`jog ${delta} ${value}`)
	})
	// Listen to shuttle changes:
	shuttle.on('shuttle', (value) => {
		console.log(`Shuttle ${value}`)
	})
	// Listen to pressed buttons:
	shuttle.on('down', (keyIndex) => {
		console.log('Button pressed ', keyIndex)
	})
	// Listen to released buttons:
	shuttle.on('up', (keyIndex) => {
		console.log('Button released', keyIndex)
	})
})

// To stop watching, call
// watcher.stop().catch(console.error)
```

### Connect to a devices manually

```javascript
const { setupShuttle } = require('shuttle-node') // or shuttle-webhid in browser

/*
	This example shows how to use setupShuttle()
	directly, instead of going via ShuttleWatcher()
*/

// Connect to an Shuttle-device:
setupShuttle()
	.then((shuttle) => {
		console.log(`Connected to ${shuttle.info.name}`)
		shuttle.on('disconnected', () => {
			console.log(`Disconnected!`)
			shuttle.removeAllListeners()
		})
		shuttle.on('error', (...args) => {
			console.log('Shuttle error:', ...args)
		})
		// Listen to JOG  changes:
		shuttle.on('jog', (delta, value) => {
			console.log(`jog ${delta} ${value}`)
		})
		// ...
	})
	.catch(console.log) // Handle error
```

or

```javascript
const { listAllConnectedDevices, setupShuttle } = require('shuttle-node')

// List and connect to all Shuttle-devices:
listAllConnectedDevices().forEach((connectedDevice) => {
	setupShuttle(connectedDevice)
		.then((shuttle) => {
			console.log(`Connected to ${shuttle.info.name}`)
			shuttle.on('disconnected', () => {
				console.log(`Disconnected!`)
				shuttle.removeAllListeners()
			})
			shuttle.on('error', (...args) => {
				console.log('Shuttle error:', ...args)
			})

			// Listen to jog changes:
			shuttle.on('jog', (delta, value) => {
				console.log(`jog ${delta} ${value}`)
			})
			// ...
		})
		.catch(console.log) // Handle error
```

## Getting started - Browser (WebHID)

See the example implementation at [packages/webhid-demo](packages/webhid-demo).

### Demo

If you are using a Chromium v89+ based browser, you can try out the [webhid demo](https://nytamin.github.io/contour-shuttle/).

## API documentation

### ShuttleWatcher (Node.js only)

The ShuttleWatcher has a few different options that can be set upon initialization:

```javascript
const { ShuttleWatcher } = require('shuttle-node')
const watcher = new ShuttleWatcher({
	// usePolling: false
	// pollingInterval: 1000
})
watcher.on('error', (e) => {
	console.log('Error in ShuttleWatcher', e)
})
watcher.on('connected', (shuttle) => {
	// Shuttle connected...
})
```

#### usePolling

When this is set, the ShuttleWatcher will not use the `node-usb` library for detecting connected devices,
but instead resort to polling at an interval (`pollingInterval`).
This is compatible with more systems and OS:es, but might result in higher system usage, slower detection of new devices.

### Shuttle Events

```javascript
// Example:
shuttle.on('jog', (delta, value) => {
	console.log(`jog ${delta} ${value}`)
})
```

| Event            | Description                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"error"`        | Triggered on error.<br>Emitted with `(error)`.                                                                                                                                                                 |
| `"disconnected"` | Triggered when device is disconnected.                                                                                                                                                                         |
| `"jog"`          | Triggered when the jog wheel is rotated.<br>Emitted with `(delta: number, jogValue: number)`<br />`delta`: Value difference from last emitted event (usually -1 or 1)<br />`jogValue`: Jog value, range: 0-255 |
| `"shuttle"`      | Triggered when the shuttle wheel is rotated.<br>Emitted with `(value: number)`<br />`value`: Shuttle value. Range: -1 - 7                                                                                      |
| `"down"`, `"up"` | Triggered when a button is pressed / released.<br>Emitted with `(buttonIndex: number)`                                                                                                                         |

#### Other functionality

See [the Shuttle-class](packages/core/src/Shuttle.ts) for more functionality.

# For developers

This is a mono-repo, using [Lerna](https://github.com/lerna/lerna) and [Yarn](https://yarnpkg.com).

### Setting up your local environment

This repo is using [Yarn](https://yarnpkg.com). If you don't want to use it, replace `yarn xyz` with `npm run xyz` below.

To enable Yarn in Node.js, run `corepack enable`.

### Setting up the repo

- Clone the repo and `cd` into it.
- Install all dependencies: `yarn`.
- Do an initial build: `yarn build`

### Running and testing local changes

If you'd like to run and test your local changes, `yarn link` is a useful tool to symlink your local `shuttle` dependency into your test repo.

```bash
# To set up the Shuttle-repo for linking:
cd your/contour-shuttle/repo
yarn lerna exec yarn link # This runs "yarn link" in all of the mono-repo packages
yarn build

# Every time after you've made any changes to the Shuttle-repo you need to rebuild
cd your/contour-shuttle/repo
yarn build

# Set up your local test repo to used the linked Shuttle libraries:
cd your/test/repo
yarn add shuttle-node
yarn link shuttle-node
yarn link @shuttle-lib/core

# To unlink the shuttle-lib from your local test repo:
cd your/test/repo
yarn unlink shuttle-node
yarn unlink @shuttle-lib/core
yarn --force # So that it reinstalls the ordinary dependencies
```

### Contribution guidelines

If you have any questions or want to report a bug, [please open an issue at Github](https://github.com/nytamin/contour-shuttle/issues/new).

If you want to contribute a bug fix or improvement, we'd happily accept Pull Requests.
(If you're planning something big, [please open an issue](https://github.com/nytamin/contour-shuttle/issues/new) to announce it first, and spark discussions.

#### Coding style and tests

Please follow the same coding style as the rest of the repository as you type. :)

Before committing your code to git, be sure to run these commands:

```bash
yarn # To ensure the right dependencies are installed and yarn.lock is updated
yarn build # To ensure that there are no syntax or build errors
yarn lint # To ensure that the formatting follows the right rules
yarn test # To ensure that your code passes the unit tests.
```

If you're adding a new functionality, adding unit tests for it is much appreciated.

### Notes to maintainers

#### Making a nightly build

- Push your changes to any branch
- Trigger a run of [CI: publish-nightly](https://github.com/nytamin/contour-shuttle/actions/workflows/publish-nightly.yml)

#### Making a Pre-release

- Update the branch (preferably the master branch)
- `yarn release:bump-prerelease` and push the changes (including the tag)
- Trigger a run of [CI: publish-prerelease](https://github.com/nytamin/contour-shuttle/actions/workflows/publish-prerelease.yml)

#### Making a Release

- Update the the master branch
- `yarn release:bump-release` and push the changes (including the tag)
- Trigger a run of [CI: publish-release](https://github.com/nytamin/contour-shuttle/actions/workflows/publish-release.yml) to publish to NPM.
- Trigger a run of [CI: publish-demo](https://github.com/nytamin/contour-shuttle/actions/workflows/publish-demo.yml) to update the docs.

### License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
