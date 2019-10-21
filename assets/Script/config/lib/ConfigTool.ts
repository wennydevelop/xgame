
import { Mencrypt } from './encrypt';

export { SafeClass } from './SafeData';

export default class ConfigTool {

	static decryptTable(objf: () => object, ekey: string, datastr: string): any[] {
		let data = JSON.parse(
			Mencrypt.decrypt2(datastr, ekey)
		)
		let config: any[] = []
		for (let record of data) {
			let obj = objf()
			for (let key in record) {
				obj[key] = record[key]
			}
			config.push(obj)
		}
		return config
	}
}

export function merge<T>(cls: new () => T, data: Object): T {
	let store = new cls()
	for (let key in data) {
		store[key] = data[key]
	}
	return store
}

export function mergelist<T>(cls: new () => T, data: Object[]): T[] {
	let stores: T[] = []
	for (let i = 0; i < data.length; i++) {
		stores.push(merge(cls, data[i]))
	}
	return stores
}
