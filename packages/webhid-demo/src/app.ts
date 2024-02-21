import { getOpenedDevices, requestAccess, setupShuttle, Shuttle } from 'shuttle-webhid'

function appendLog(str: string) {
	const logElm = document.getElementById('log')
	if (logElm) {
		logElm.textContent = `${str}\n${logElm.textContent}`
	}
}

let currentShuttle: Shuttle | null = null

async function openDevice(device: HIDDevice): Promise<void> {
	const shuttle = await setupShuttle(device)

	currentShuttle = shuttle

	appendLog(`Connected to "${shuttle.info.name}"`)

	shuttle.on('error', (error) => {
		appendLog(`Error: ${error}`)
	})
	shuttle.on('disconnected', () => {
		appendLog(`disconnected`)
	})
	shuttle.on('down', (keyIndex: number) => {
		appendLog(`Button ${keyIndex} down`)
	})
	shuttle.on('up', (keyIndex: number) => {
		appendLog(`Button ${keyIndex} up`)
	})
	shuttle.on('jog', (delta, value) => {
		appendLog(`jog ${delta} ${value}`)
	})
	shuttle.on('shuttle', (value) => {
		appendLog(`shuttle ${value}`)
	})
}

window.addEventListener('load', () => {
	appendLog('Page loaded')
	// Attempt to open a previously selected device:
	getOpenedDevices()
		.then((devices) => {
			if (devices.length > 0) {
				appendLog(`"${devices[0].productName}" already granted in a previous session`)
				console.log(devices[0])
				openDevice(devices[0]).catch(console.error)
			}
		})
		.catch(console.error)
})

const consentButton = document.getElementById('consent-button')
consentButton?.addEventListener('click', () => {
	if (currentShuttle) {
		appendLog('Closing device')
		currentShuttle
			.close()
			.then(() => appendLog('Closed'))
			.catch(console.error)
		currentShuttle = null
	}
	// Prompt for a device

	appendLog('Asking user for permissions...')
	requestAccess()
		.then((devices) => {
			if (devices.length === 0) {
				appendLog('No device was selected')
				return
			}
			appendLog(`Access granted to "${devices[0].productName}"`)
			openDevice(devices[0]).catch(console.error)
		})
		.catch((error) => {
			appendLog(`No device access granted: ${error}`)
		})
})

const closeButton = document.getElementById('close-button')
closeButton?.addEventListener('click', () => {
	if (currentShuttle) {
		appendLog('Closing device')
		currentShuttle
			.close()
			.then(() => appendLog('Closed'))
			.catch(console.error)
		currentShuttle = null
	}
})
