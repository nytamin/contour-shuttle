/*
 * This file contains information about the various Shuttle devices
 */

export const VENDOR_IDS = [0x0b33, 0x5F3]

export enum ProductModelId {
	ShuttleProV1 = 'shuttlepro_v1',
	ShuttleProV1a = 'shuttlepro_v1_older',
	ShuttleXpress = 'shuttlexpress',
	ShuttleProV2 = 'shuttlepro_v2',
}

export interface Product {
	/** Name / Identifier of the device */
	productModelId: ProductModelId
	name: string
	vendorId: number
	productId: number
	interface: number

	/** Which bit corresponds to a button */
	buttonBits: number[]
}

export const PRODUCTS: Record<ProductModelId, Product> = {
	[ProductModelId.ShuttleProV1]: {
		productModelId: ProductModelId.ShuttleProV1,
		name: 'ShuttlePro v1',
		vendorId: VENDOR_IDS[0],
		productId: 0x0010,
		interface: 0,
		buttonBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	},
	[ProductModelId.ShuttleProV1a]: { // S/N lower than 00100000
		productModelId: ProductModelId.ShuttleProV1,
		name: 'ShuttlePro v1',
		vendorId: VENDOR_IDS[1],
		productId: 0x0240,
		interface: 0,
		buttonBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	},
	[ProductModelId.ShuttleXpress]: {
		productModelId: ProductModelId.ShuttleXpress,
		name: 'ShuttleXpress',
		vendorId: VENDOR_IDS[0],
		productId: 0x0020,
		interface: 0,
		buttonBits: [4, 5, 6, 7, 8],
	},
	[ProductModelId.ShuttleProV2]: {
		productModelId: ProductModelId.ShuttleProV2,
		name: 'ShuttlePro v2',
		vendorId: VENDOR_IDS[0],
		productId: 0x0030,
		interface: 0,
		buttonBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	},
}
