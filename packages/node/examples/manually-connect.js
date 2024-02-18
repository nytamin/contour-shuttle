const { setupShuttle, listAllConnectedDevices } = require('shuttle-node')

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
		// Listen to jog changes:
		shuttle.on('jog', (delta, value) => {
			console.log(`jog ${delta} ${value}`)
		})
		// ...
	})
	.catch(console.log) // Handle error

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
})
