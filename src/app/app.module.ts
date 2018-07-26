import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BLE } from '@ionic-native/ble';
import { DevicesNamesProvider } from '../providers/devices-names/devices-names';
import { BleDevicesProvider } from '../providers/ble-devices/ble-devices';

import { CardDeviceComponent } from '../components/card-device/card-device'


@NgModule({
  declarations: [
    MyApp,   
    HomePage,
    CardDeviceComponent

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CardDeviceComponent
  ],
  providers: [
    BLE,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DevicesNamesProvider,
    BleDevicesProvider
  ]
})
export class AppModule {}
