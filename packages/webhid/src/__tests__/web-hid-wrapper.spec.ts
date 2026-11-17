// Device methods are Jest mocks, inspected rather than called unbound.
/* eslint-disable @typescript-eslint/unbound-method */
import { WebHIDDevice } from '../web-hid-wrapper.js'

function createDevice(): HIDDevice {
	return {
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		close: jest.fn().mockResolvedValue(undefined),
	} as unknown as HIDDevice
}

describe('WebHIDDevice disconnect handling', () => {
	const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
	let disconnect: (event: HIDConnectionEvent) => void
	let hid: { addEventListener: jest.Mock; removeEventListener: jest.Mock }

	beforeEach(() => {
		hid = {
			addEventListener: jest.fn((type: string, listener: typeof disconnect) => {
				if (type === 'disconnect') disconnect = listener
			}),
			removeEventListener: jest.fn(),
		}
		Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { hid } })
	})

	afterEach(() => {
		if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator)
		else Reflect.deleteProperty(globalThis, 'navigator')
	})

	test('keeps listening when an unrelated HID device disconnects', async () => {
		const device = createDevice()
		const wrapped = new WebHIDDevice(device)
		const onError = jest.fn()
		wrapped.on('error', onError)

		disconnect({ device: createDevice() } as HIDConnectionEvent)

		expect(onError).not.toHaveBeenCalled()
		expect(device.removeEventListener).not.toHaveBeenCalled()
		expect(hid.removeEventListener).not.toHaveBeenCalled()

		// The same listener must still handle a subsequent matching disconnect.
		disconnect({ device } as HIDConnectionEvent)
		expect(onError).toHaveBeenCalledWith('WebHID disconnected')
		expect(device.removeEventListener).toHaveBeenCalledTimes(2)
		expect(hid.removeEventListener).toHaveBeenCalledWith('disconnect', disconnect)
		await wrapped.close()
	})

	test('emits the existing error and cleans up when its own device disconnects', () => {
		const device = createDevice()
		const wrapped = new WebHIDDevice(device)
		const onError = jest.fn()
		wrapped.on('error', onError)

		disconnect({ device } as HIDConnectionEvent)

		expect(onError).toHaveBeenCalledTimes(1)
		expect(onError).toHaveBeenCalledWith('WebHID disconnected')
		expect(device.removeEventListener).toHaveBeenCalledWith('inputreport', expect.any(Function))
		expect(device.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function))
		expect(hid.removeEventListener).toHaveBeenCalledWith('disconnect', disconnect)
	})
})
