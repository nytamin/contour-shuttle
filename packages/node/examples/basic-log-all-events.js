const { ShuttleWatcher } = require('shuttle-node')

/*
	This example connects to any connected Shuttle devices and logs
	whenever the mouse is moved or a button is pressed.
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
	// Listen to jog changes:
	shuttle.on('jog', (delta, value) => {
		console.log(`jog ${delta} ${value}`)
	})
	// Listen to shuttle changes:
	shuttle.on('shuttle', (value) => {
		console.log(`shuttle ${value}`)
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
