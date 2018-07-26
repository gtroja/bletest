import { Component, NgZone } from '@angular/core';
import { BleDevicesProvider } from '../../providers/ble-devices/ble-devices'
import "rxjs/add/operator/timeout";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private _listDevices = []
  private _deviceConectado = null;

  private message : string;
  
  private mock = [
    {name: "mobi7 car sharing 1", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 2", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 3", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 4", id: "54:6C:0E:9B:4E:0B"}
  ]
  

  constructor(
    private devices : BleDevicesProvider,
    private ngZone : NgZone ) {}

  ionViewDidEnter(){
      this.scan()
      this.devices.autoConecta("54:6C:0E:9B:4E:0B",
      ()=>{
          this.message = "conectado"

      },
      ()=>{
        this.message = "desconectado"

      }
    )
    //this._listDevices = this.mock

  }



  force(){
    this.devices.force()
  }
  
  scan(){
    this._listDevices = []
    this.devices.getDevicesProximas(10).subscribe(
      ok =>{
        console.log("device encontrada:", ok)
        console.log("lista de devices:", this._listDevices)
        this.ngZone.run(() => {
          this._listDevices.push(ok);
        });
      },
      err => {
        console.log(err);
      }
    )
  }

  
  readService(params){
    console.log("read",params)
    this.devices.readService(params.service).subscribe(
      ok =>{
        console.log(ok)
        this.message = ok;
      },
      err =>{
        console.log(err)
        this.message = err;

      }
    )
  }

  writeService(params){
    console.log("tentando escrever com", params)
    this.devices.writeService(params.service, params.value).subscribe(
      ok=>{
          console.log("escrito com sucesso", ok)
          this.message = ok
        
      },
      err=>{
        console.log("erro ao enviar comando", err)
        this.message = err
      }
    )
  }

  conectarAoDevice(device : {id : string}){
    console.log("chamei pra conectar")
    if(this._deviceConectado == null){
      this.devices.conectaDevice(device.id).subscribe(
        ok=>{
          console.log("conectei")
          this.ngZone.run(
            ()=>{
              console.log("consegui me conectar", ok)
              this._deviceConectado = ok
              let index = this._listDevices.indexOf(device);
              index === -1 ? this._listDevices.push(ok) :  this._listDevices[index] = ok
              console.log("lista esta assim:", this._listDevices)
            }
          )
          
        },
        err=>{
          console.log("erro ao conectar ao device", device, err)
        }
      )
    }
    else{
      console.log("ja estou conectado a outro device")
    }
  }

  desconecta(device){
    this.devices.desconecta()
    let index = this._listDevices.indexOf(device);
    this.ngZone.run(() => {
      this._deviceConectado = null
      delete this._listDevices[index].characteristics
    });

  }







  // private texto : string = "" // texto que aparece na tela
  // private titulo : string = "" // titulo, texto acima do texto
  // private devices = [] // lista de devices scanneadas que tem nome
  // private selecionado = null // item selecionado da lista
  // public conectado = false //estou conectado a algum dispositivo?
  // public deviceConectado = null; // dispositivo que estou conectado
  
  
  // abrePorta(){
    
    
    //   this.ble.connect("54:6C:0E:9B:4E:0B").timeout(2000).subscribe(
      //     dev =>{
        //       let data = new Uint8Array(1)
        //       data[0] = 0x01;
        //       this.ble.write(dev.id,"f0001110-0451-4000-b000-000000000000", "f0001111-0451-4000-b000-000000000000", data.buffer)
        //       .then(
          //         ()=>console.log("consegui!")
          //       )
          //       .catch(
            //         err=>{
              //           console.log("não consegui")
              //         }
              //       )
              //       .then(
                //         ()=>{
                  //           this.ble.disconnect(dev.id).then(()=>{console.log("desconectei")})
                  //         }
                  //       )
  //     },
  //     err=>{
  //         console.log("erro ao conectar ao device", err)
  //     } 


  //   )
  // }


  // scan(){
  //   this.devices = []
  //   this.ble.scan([], 5).subscribe(
  //     suc=>{
  //       console.log("encontrei", suc)
  //       if(suc.name){
  //         console.log("adicionarei a lista de devs")
  //         this.devices.push(suc)
  //         console.log( this.devices )
  //       }
  //     },
  //     err=>{
  //       console.log("erro ao scannear devices", err)
  //     }
  //   )
  // }



  // onConect(){
  //   if (!this.selecionado) return
  //   console.log("chamei o botao")
  //   console.log("vou tentar conectar com ", this.selecionado)
  //   this.ble.connect(this.selecionado).subscribe(
  //     (suc)=>{
  //       this.texto += "consegui me conectar!\n"
  //       console.log("consegui conexão", suc)
  //       this.conectado = true
  //       this.deviceConectado = suc;
  //       this.texto = "device conectado:\n"+ JSON.stringify(this.deviceConectado).replace(",","\n")
  //     },
  //     (err)=>{
  //       this.texto += "aconteceu algum erro\n"
  //       console.log("erro:", err)
  //       this.conectado = false
  //     }
  //   )


  //   // this.ble.autoConnect(UUID.UUID, 
  //   //   ()=>{
  //   //     this.texto += "conectei\n"

  //   //   },
  //   //   ()=>{
  //   //     this.texto += "desconectei\n"

  //   //   }
    
  //   // )
    
  // }
  // onRead(){
      
  // }

  // onWrite(){

  //   let charac = "f0001111-0451-4000-b000-000000000000"
  //   let service =  "f0001110-0451-4000-b000-000000000000"

  //   var data = new Uint8Array(1);
  //   data[0] = 0x01;
  //   this.ble.write(
  //     this.deviceConectado.id,
  //     service,
  //     charac,
  //      data.buffer
  //   )

  // }
}
