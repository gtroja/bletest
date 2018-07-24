import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { text } from '@angular/core/src/render3/instructions';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private texto : string = "" // texto que aparece na tela
  private titulo : string = "" // titulo, texto acima do texto
  private devices = [] // lista de devices scanneadas que tem nome
  private selecionado = null // item selecionado da lista
  public conectado = false //estou conectado a algum dispositivo?
  public deviceConectado = null; // dispositivo que estou conectado


  constructor(
    public navCtrl: NavController,
    private ble : BLE
  )
  {
    this.titulo = "home"
    this.texto += "teste\n"

    this.scan()

  }

  scan(){
    this.devices = []
    this.ble.scan([], 5).subscribe(
      suc=>{
        console.log("encontrei", suc)
        if(suc.name){
          console.log("adicionarei a lista de devs")
          this.devices.push(suc)
          console.log( this.devices )
        }
      },
      err=>{
        console.log("erro ao scannear devices", err)
      }
    )
  }

  onConect(){
    if (!this.selecionado) return
    console.log("chamei o botao")
    console.log("vou tentar conectar com ", this.selecionado)
    this.ble.connect(this.selecionado).subscribe(
      (suc)=>{
        this.texto += "consegui me conectar!\n"
        console.log("consegui conexão", suc)
        this.conectado = true
        this.deviceConectado = suc;
        this.texto = "device conectado:\n"+ JSON.stringify(this.deviceConectado).replace(",","\n")
      },
      (err)=>{
        this.texto += "aconteceu algum erro\n"
        console.log("erro:", err)
        this.conectado = false
      }
    )


    // this.ble.autoConnect(UUID.UUID, 
    //   ()=>{
    //     this.texto += "conectei\n"

    //   },
    //   ()=>{
    //     this.texto += "desconectei\n"

    //   }
    
    // )
    
  }
  onRead(){
      
  }

  onWrite(){

    let charac = "f0001111-0451-4000-b000-000000000000"
    let service =  "f0001110-0451-4000-b000-000000000000"

    var data = new Uint8Array(1);
    data[0] = 0x01;
    this.ble.write(
      this.deviceConectado.id,
      service,
      charac,
       data.buffer
    )

  }
}
