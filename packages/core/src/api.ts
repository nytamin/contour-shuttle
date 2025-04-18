import type { ProductModelId } from './products.js'

/*
 * This file contains public type interfaces.
 * If changing these, consider whether it might be a breaking change.
 */
export type ButtonStates = Map<number, boolean>

export interface ShuttleEvents {
	// Note: This interface defines strong typings for any events that are emitted by the Shuttle class.

	disconnected: []
	error: [err: any]

	shuttle: [
		/** Shuttle value. Range: -7 - 7 */
		shuttle: number,
	]
	jog: [
		/** Value difference from last emitted event  */
		delta: number,
		/** Jog value, range: 0-255 */
		jogValue: number,
	]

	down: [buttonIndex: number]
	up: [buttonIndex: number]
}
export interface ShuttleInfo {
	/** Id of the product */
	productModelId: ProductModelId
	/** Name of the device */
	name: string

	/** Vendor id of the HID device */
	vendorId: number
	/** Product id of the HID device */
	productId: number
	/** Interface number of the HID device */
	interface: number
}
