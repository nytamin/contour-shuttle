/*
 * This file contains information about the various Shuttle devices
 */

export const VENDOR_IDS = [0x0b33]

export interface Product {
	/** Name / Identifier of the device */
	name: string
	vendorId: number
	productId: number

	buttonCount: number
}

export const PRODUCTS: { [name: string]: Product } = {
	shuttlepro_v1: {
		name: 'ShuttlePro v1',
		vendorId: VENDOR_IDS[0],
		productId: 0x0010,
		buttonCount: 13,
	},
	shuttlexpress: {
		name: 'ShuttleXpress',
		vendorId: VENDOR_IDS[0],
		productId: 0x0020,
		buttonCount: 5,
	},
	shuttlepro_v2: {
		name: 'ShuttlePro v2',
		vendorId: VENDOR_IDS[0],
		productId: 0x0030,
		buttonCount: 15,
	},
}
