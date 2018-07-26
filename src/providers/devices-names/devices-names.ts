import { Injectable } from '@angular/core';

/**
 * serviço simples que fornece nomes conhecidos de devices ble
 */
@Injectable()
export class DevicesNamesProvider {

	public getDeviceNameList(){
		return this._deviceNameList;
	}

	private _mock = [
		"mobi7 car sharing",
		"b13VOjC6xR8ka91D8",
		"Simple BLE Peripheral"
	]

	private _deviceNameList = []

	constructor() {
		this._deviceNameList = this._mock;  
	}

}
