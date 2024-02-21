import { Shuttle, PRODUCTS, Product } from '@shuttle-lib/core'
import { WebHIDDevice } from './web-hid-wrapper'

/** Prompts the user for which Shuttle device to select */
export async function requestAccess(): Promise<HIDDevice[]> {
	return navigator.hid.requestDevice({
		filters: Object.values<Product>(PRODUCTS).map((product) => ({
			vendorId: product.vendorId,
			productId: product.productId,
		})),
	})
}
/**
 * Reopen previously selected devices.
 * The browser remembers what the user previously allowed your site to access, and this will open those without the request dialog
 */
export async function getOpenedDevices(): Promise<HIDDevice[]> {
	return await navigator.hid.getDevices()
}

/** Sets up a connection to a HID device (the Shuttle device) */
export async function setupShuttle(browserDevice: HIDDevice): Promise<Shuttle> {
	if (!browserDevice?.collections?.length) throw Error(`device collections is empty`)
	if (!browserDevice.productId) throw Error(`Device has no productId!`)

	if (!browserDevice.opened) {
		await browserDevice.open()
	}

	const deviceWrap = new WebHIDDevice(browserDevice)

	const shuttle = new Shuttle(
		deviceWrap,
		{
			product: browserDevice.productName,
			vendorId: browserDevice.vendorId,
			productId: browserDevice.productId,
			interface: null, // todo: Check what to use here (collection.usage?)
		},
		undefined
	)

	// Wait for the device to initialize:
	await shuttle.init()

	return shuttle
}
