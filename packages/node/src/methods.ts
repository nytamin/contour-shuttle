import { Shuttle, PRODUCTS, VENDOR_IDS, Product } from '@shuttle-lib/core'
import * as HID from 'node-hid'
import type { usb } from 'usb'
import { NodeHIDDevice } from './node-hid-wrapper.js'

import { isHID_Device, isHID_HID } from './lib.js'

import { HID_Device } from './api.js'

/** Sets up a connection to a HID device (the Shuttle device) */
export function setupShuttle(): Promise<Shuttle>
export function setupShuttle(HIDDevice: HID.Device): Promise<Shuttle>
export function setupShuttle(HIDDevice: HID.HIDAsync): Promise<Shuttle>
export function setupShuttle(devicePath: string): Promise<Shuttle>
export async function setupShuttle(devicePathOrHIDDevice?: HID.Device | HID.HIDAsync | string): Promise<Shuttle> {
	let devicePath: string
	let device: HID.HIDAsync
	let deviceInfo:
		| {
				product: string | undefined
				vendorId: number
				productId: number
				interface: number
		  }
		| undefined

	if (!devicePathOrHIDDevice) {
		// Device not provided, will then select any connected device:
		const connectedShuttle = await listAllConnectedDevices()
		if (!connectedShuttle.length) {
			throw new Error('Could not find any connected Shuttle devices.')
		}
		// Just select the first one:
		devicePath = connectedShuttle[0].path
		device = await HID.HIDAsync.open(devicePath)

		deviceInfo = {
			product: connectedShuttle[0].product,
			vendorId: connectedShuttle[0].vendorId,
			productId: connectedShuttle[0].productId,
			interface: connectedShuttle[0].interface,
		}
	} else if (isHID_Device(devicePathOrHIDDevice)) {
		// is HID.Device

		if (!devicePathOrHIDDevice.path) throw new Error('HID.Device path not set!')

		devicePath = devicePathOrHIDDevice.path
		device = await HID.HIDAsync.open(devicePath)

		deviceInfo = {
			product: devicePathOrHIDDevice.product,
			vendorId: devicePathOrHIDDevice.vendorId,
			productId: devicePathOrHIDDevice.productId,
			interface: devicePathOrHIDDevice.interface,
		}
	} else if (isHID_HID(devicePathOrHIDDevice)) {
		// is HID.HID

		device = devicePathOrHIDDevice
		devicePath = devicePathOrHIDDevice.devicePath
		// deviceInfo is set later
	} else if (typeof devicePathOrHIDDevice === 'string') {
		// is string (path)

		devicePath = devicePathOrHIDDevice
		device = await HID.HIDAsync.open(devicePath)
		// deviceInfo is set later
	} else {
		throw new Error(`setupShuttle: invalid arguments: ${JSON.stringify(devicePathOrHIDDevice)}`)
	}

	if (!deviceInfo) {
		// Look through HID.devices(), because HID.Device contains the productId
		for (const hidDevice of HID.devices()) {
			if (hidDevice.path === devicePath) {
				deviceInfo = {
					product: hidDevice.product,
					vendorId: hidDevice.vendorId,
					productId: hidDevice.productId,
					interface: hidDevice.interface,
				}
				break
			}
		}
	}

	if (!device) throw new Error('Error setting up Shuttle: device not found')
	if (!devicePath) throw new Error('Error setting up Shuttle: devicePath not found')
	if (!deviceInfo) throw new Error('Error setting up Shuttle: deviceInfo not found')

	const deviceWrap = new NodeHIDDevice(device)

	const shuttle = new Shuttle(deviceWrap, deviceInfo, devicePath)

	// Wait for the device to initialize:
	await shuttle.init()

	return shuttle
}
/** Returns a list of all connected Shuttle-HID-devices */
export async function listAllConnectedDevices(): Promise<HID_Device[]> {
	const hidDevices = await HID.devicesAsync()
	const connectedShuttle = hidDevices.filter((device) => {
		// Filter to only return the supported devices:
		return isAShuttleDevice(device)
	})
	return connectedShuttle as HID_Device[]
}
/** Returns a list of all connected Shuttle-HID-devices */
export function isAShuttleDevice(device: HID.Device | usb.Device): boolean {
	let vendorId: number
	let productId: number

	if (isUSBDevice(device)) {
		vendorId = device.deviceDescriptor.idVendor
		productId = device.deviceDescriptor.idProduct
	} else {
		vendorId = device.vendorId
		productId = device.productId
		if (!device.path) return false
	}

	if (!VENDOR_IDS.includes(vendorId)) return false

	for (const product of Object.values<Product>(PRODUCTS)) {
		if (product.productId === productId && product.vendorId === vendorId) {
			return true // break and return
		}
	}
	return false
}
export function isUSBDevice(device: HID.Device | usb.Device): device is usb.Device {
	return 'deviceDescriptor' in device
}
