import { EventEmitter } from 'eventemitter3'
import { ButtonStates, ShuttleEvents, ShuttleInfo } from './api.js'
import { Product, PRODUCTS, VENDOR_IDS } from './products.js'
import { getBit, literal, uint8ArrayToDataView } from './lib.js'
import { HIDDevice } from './genericHIDDevice.js'

export class Shuttle extends EventEmitter<ShuttleEvents> {
	private product: Product

	private _buttonStates: Map<number, boolean> = new Map()
	private _shuttleState = 0
	private _jogState = 0

	private _initialized = false
	private _disconnected = false

	/** Vendor ids for the Shuttle devices */
	static get vendorIds(): number[] {
		return VENDOR_IDS
	}

	constructor(
		private _device: HIDDevice,
		private _deviceInfo: DeviceInfo,
		private _devicePath: string | undefined
	) {
		super()

		this.product = this._setupDevice(_deviceInfo)
	}
	private _setupDevice(deviceInfo: DeviceInfo) {
		const findProduct = (): { product: Product; vendorId: number; productId: number; interface: number } => {
			for (const product of Object.values<Product>(PRODUCTS)) {
				if (
					product.vendorId === deviceInfo.vendorId &&
					product.productId === deviceInfo.productId &&
					product.interface === deviceInfo.interface
				) {
					return {
						product,
						vendorId: deviceInfo.vendorId,
						productId: deviceInfo.productId,
						interface: deviceInfo.interface,
					}
				}
			}
			// else:
			throw new Error(
				`Unknown/Unsupported Shuttle device: "${deviceInfo.product}" (vendorId: "${deviceInfo.vendorId}", productId: "${deviceInfo.productId}", interface: "${deviceInfo.interface}").\nPlease report this as an issue on our github page!`
			)
		}
		const found = findProduct()

		for (let i = 0; i < found.product.buttonBits.length; i++) {
			if (!this._buttonStates.has(i)) this._buttonStates.set(i, false)
		}

		this._device.on('data', (data: Uint8Array) => {
			const dataView = uint8ArrayToDataView(data)

			const shuttle = dataView.getInt8(0)
			if (shuttle !== this._shuttleState) {
				this._shuttleState = shuttle
				this.emit('shuttle', shuttle)
			}

			const jog = dataView.getUint8(1)
			if (jog !== this._jogState) {
				let delta: number = jog - this._jogState
				if (this._jogState > 250 && jog < 5) {
					delta += 256 // fix overflow
				} else if (this._jogState < 5 && jog > 250) {
					delta -= 256 // fix underflow
				}
				this._jogState = jog
				this.emit('jog', delta, jog)
			}
			const buttons = dataView.getUint16(3, true)
			for (let i = 0; i < found.product.buttonBits.length; i++) {
				const button = Boolean(getBit(buttons, found.product.buttonBits[i]))

				if (button !== this._buttonStates.get(i)) {
					this._buttonStates.set(i, button)

					if (button) this.emit('down', i)
					else this.emit('up', i)
				}
			}
		})

		this._device.on('error', (err) => {
			if ((err + '').match(/could not read from/)) {
				// The device has been disconnected
				this._triggerHandleDeviceDisconnected()
			} else if ((err + '').match(/WebHID disconnected/)) {
				this._triggerHandleDeviceDisconnected()
			} else {
				this.emit('error', err)
			}
		})

		return {
			...found.product,
			productId: found.productId,
			vendorId: found.vendorId,
		}
	}

	/** Initialize the device. This ensures that the essential information from the device about its state has been received. */
	public async init(): Promise<void> {
		// Nothing to do here, but keeping this as a placeholder for future use.

		this._initialized = true
	}
	/** Closes the device. Subsequent commands will raise errors. */
	public async close(): Promise<void> {
		await this._handleDeviceDisconnected()
	}

	/** Various information about the device and its capabilities */
	public get info(): ShuttleInfo {
		this.ensureInitialized()
		return literal<ShuttleInfo>({
			productModelId: this.product.productModelId,
			name: this.product.name,

			vendorId: this.product.vendorId,
			productId: this.product.productId,
			interface: this.product.interface,
		})
	}

	/**
	 * Returns an object with current Button states
	 */
	public getButtons(): ButtonStates {
		return new Map(this._buttonStates) // Make a copy
	}

	private _triggerHandleDeviceDisconnected(): void {
		this._handleDeviceDisconnected().catch((error) => {
			this.emit('error', error)
		})
	}
	/** (Internal function) Called when there has been detected that the device has been disconnected */
	public async _handleDeviceDisconnected(): Promise<void> {
		if (!this._disconnected) {
			this._disconnected = true
			await this._device.close()
			this.emit('disconnected')
		}
	}
	public get hidDevice(): HIDDevice {
		return this._device
	}
	public get deviceInfo(): DeviceInfo {
		return this._deviceInfo
	}
	public get devicePath(): string | undefined {
		return this._devicePath
	}

	/** Check that the .init() function has run, throw otherwise */
	private ensureInitialized() {
		if (!this._initialized) throw new Error('Shuttle.init() must be run first!')
	}
}
export interface DeviceInfo {
	product: string | undefined
	vendorId: number
	productId: number
	interface: number | null // null means "anything goes", used when interface isn't available
}
