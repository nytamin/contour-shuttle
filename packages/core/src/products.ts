/*
 * This file contains information about the various Shuttle devices
 */

export const VENDOR_IDS = [0x0b33]

export interface Product {
	/** Name / Identifier of the device */
	name: string
	vendorId: number
	productId: number

	/** Which bit corresponds to a button */
	buttonBits: number[]
}

export const PRODUCTS: { [name: string]: Product } = {
	shuttlepro_v1: {
		name: 'ShuttlePro v1',
		vendorId: VENDOR_IDS[0],
		productId: 0x0010,
		buttonBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	},
	shuttlexpress: {
		name: 'ShuttleXpress',
		vendorId: VENDOR_IDS[0],
		productId: 0x0020,
		buttonBits: [4, 5, 6, 7, 8],
	},
	shuttlepro_v2: {
		name: 'ShuttlePro v2',
		vendorId: VENDOR_IDS[0],
		productId: 0x0030,
		buttonBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	},
}
