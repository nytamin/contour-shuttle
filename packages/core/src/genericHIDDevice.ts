import type { EventEmitter } from 'eventemitter3'

/**
 * The expected interface for a HIDDevice.
 * This is to be implemented by any wrapping libraries to translate their platform specific devices into a common and simpler form
 */
export interface HIDDevice extends EventEmitter<HIDEvents> {
	write(data: number[]): void

	close(): Promise<void>
}

export interface HIDEvents {
	error: [err: any]
	data: [data: Uint8Array]
}
