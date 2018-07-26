import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController } from 'ionic-angular';  
import { INFERRED_TYPE } from '@angular/compiler/src/output/output_ast';
/**
 * Card para device.
 * recebe um nome e opcionalemente um Json com device, services etc
 * instancia botões para ler ou escrever em serviços ou desconectar
 */
@Component({
  selector: 'card-device',
  templateUrl: 'card-device.html'
})
export class CardDeviceComponent {

  @Input() name : string;
  @Input() id : string;
  @Input() deviceServices : [{service:string, characteristic:string, properties:Array<any>}]


  @Output() read = new EventEmitter<any>();
  @Output() write = new EventEmitter<any>();
  @Output() desconectar = new EventEmitter<any>();
  @Output() conectar = new EventEmitter<any>();




  constructor(
    private alertCtrl: AlertController
  ) {
  }

  _conectado() : boolean{
    return this.deviceServices != null
  };

  desconecta(){
    this.desconectar.emit();
  }

  conecta(){
    console.log("chamado conecta", this._conectado())
    if(!this._conectado()){
      console.log("vou pedir pra conectar")
      this.conectar.emit()
    }

  }

  doService(service){
    //se é só de leitura
    if(service.properties.indexOf('WriteWithoutResponse') == -1 && service.properties.indexOf('Write') == -1){
      this.read.emit({name: this.name, id: this.id, service})
    }
    else{
      let value;
      let popup = this.alertCtrl.create({
        title: 'write',
        message: "Qual valor a escrever",
        inputs: [
          {
            name: 'valueInserido',
            placeholder: 'digite o valor aqui',
            type: 'number'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Ok',
            handler: data => {
              console.log("clickei ok", data)
              value = Number(data.valueInserido)
            }
          }
        ]
      });
      popup.present();
      popup.onDidDismiss((data)=>this.write.emit({name: this.name, id: this.id, service: service,value: value}))
    }
  }
}


