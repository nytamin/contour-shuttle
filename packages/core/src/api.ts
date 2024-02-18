/*
 * This file contains public type interfaces.
 * If changing these, consider whether it might be a breaking change.
 */
export type ButtonStates = Map<number, boolean>

export interface ShuttleEvents {
	// Note: This interface defines strong typings for any events that are emitted by the Shuttle class.

	disconnected: () => void
	error: (err: any) => void

	shuttle: (shuttle: number) => void
	jog: (delta: number, jogValue: number) => void

	down: (buttonIndex: number) => void
	up: (buttonIndex: number) => void
}
export interface ShuttleInfo {
	/** Name of the device */
	name: string

	/** Vendor id of the HID device */
	vendorId: number
	/** Product id of the HID device */
	productId: number
	/** Interface number of the HID device */
	interface: number
}
