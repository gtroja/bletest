import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController } from 'ionic-angular';  
import { INFERRED_TYPE } from '@angular/compiler/src/output/output_ast';
/**
 * Card para device.
 * recebe um nome,id e opcionalemente um Json com array de serviços.
 * se não tiver a lista de serviços entende-se que é um device desconectado,
 * portando instancia um botão de conectar neste caso
 * instancia botões para ler ou escrever em serviços e desconectar
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
    return (this.deviceServices != null) //se tem serviço deve estar conectado
  };

  desconecta(){
    this.desconectar.emit();
  }
  
  /*
  *   callback do click no botão de conectar
  *   verifica se esta desconectado para de fato emitir um evento
  *  
  */
  conecta(){
    if(!this._conectado()){
      this.conectar.emit()
    }

  }

  
  /*
  * é o mesmo callback para os botões de todos os tipos de serviço (leitura, escrita, escrita sem retorno)
  */
  doService(service){
    //se é só de leitura
    if(service.properties.indexOf('WriteWithoutResponse') == -1 && service.properties.indexOf('Write') == -1){
      this.read.emit({name: this.name, id: this.id, service})
    }
    else{//aqui cabem os dois casos (talvez um switch deixe isso mais bonito)
      let value; // valor a ser enviado para o device
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
          },
          {
            text: 'Ok',
            handler: data => {
              console.log("clickei ok", data)
              value = Number(data.valueInserido)// parse tosco
            }
          }
        ]
      });
      popup.present();
      popup.onDidDismiss((data)=>this.write.emit({name: this.name, id: this.id, service: service,value: value}))//manda para a home um request de escrita
    }
  }
}


