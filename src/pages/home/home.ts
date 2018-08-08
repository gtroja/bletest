import { Component, NgZone } from '@angular/core';
import { BleDevicesProvider } from '../../providers/ble-devices/ble-devices'
import "rxjs/add/operator/timeout";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private _listDevices = []         //é a lista que é plotada na tela com cards
  private _deviceConectado = null;  //objeto de device atualmente conectado 
                                    //e flag ao mesmo tempo (null sinaliza que o app esta disponivel para nova conexão)

  private message : string;         //texto acima da lista (estou usando como terminal de saida de comando bt)
  
  private mock = [// para teste
    {name: "mobi7 car sharing 1", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 2", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 3", id: "54:6C:0E:9B:4E:0B"},
    {name: "mobi7 car sharing 4", id: "54:6C:0E:9B:4E:0B"}
  ]
  

  
  constructor(
    private devices : BleDevicesProvider,
    private ngZone : NgZone )
    {
      console.log("vou tentar sobreescrever o log")
      console.log = (texto, add?)=>{
        this.message += texto + "\n";
        if(add){
          this.message += "\n" + JSON.stringify(add)
        }
    
      }
      console.log("teste")
    }

  ionViewDidEnter(){
      this.scan()
    
    //   //é para fins de testes. não tem funcionado bem  
    //   this.devices.autoConecta("54:6C:0E:9B:4E:0B",
    //   ()=>{//em caso de conexão
    //       this.message = "conectado"

    //   },
    //   ()=>{//em caso de desconexão
    //     this.message = "desconectado"

    //   }
    // )
    /*caso queira forjar uma lista de 
      devices para teste, use o mock.*/
    //this._listDevices = this.mock

  }


  /** 
  * para fins de teste, sem scan, tento conectar a placa de teste do ble carsharing, usando id hardcoded
  * e enviar um comando de fechar porta. o metodo de teste foi implementado no serviço, não esqueça
  * de remover de la também se for higienizar o codigo ;)
  */
  force(){
    this.devices.force()
  }
  
  
  /**
  * Limpa a lista de devices e readiciona a partir de um observavel.
  */
  scan(){

    //falta dar refresh no conectado #TODO
    this._listDevices = []
    this.devices.getDevicesProximas(10).subscribe(
      ok =>{
        console.log("device encontrada:", ok)
        console.log("lista de devices:", this._listDevices)
        this.ngZone.run(() => {// usei o ngZone aqui porque a lista de cards demora para atualizar sem.
          this._listDevices.push(ok);
        });
      },
      err => {
        console.log(err);
      },
      () => {
      }
    )
  }
  
  private _refreshCardConectado(device : {id : string}){
  /*transforma o card de desconectado passado por parametro em conectado (envia a lista de services pro card)
    se o device conectado não estiver na lista de devices, adiciona. */
    if(device.id == this._deviceConectado.id){
      let i = this._listDevices.indexOf(device)
      i === -1 ? this._listDevices.push(this._deviceConectado) :  this._listDevices[i].characterists = this._deviceConectado.characteristics //pra não deletar o card anterior, só mudo um pedaço do objeto
    }
  }
  

  /**
  * envia um comando de leitura para o device e imprime a resposta em message 
  * (tem que stringuifar o retorno do comando de leitura)#TODO
  */  
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
  
  
  /**
  * envia um comando de escrita para o device e imprime a resposta em message 
  * (tem que stringuifar o retorno do comando de leitura)
  */
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
  
  
  /**
  * só se conecta com um device por vez, e tem que finalizar manualmente a conexão pra 
  * abrir outra
  */
  conectarAoDevice(device : {id : string}){
    console.log("recebi requisiçao para conectar")
    if(this._deviceConectado == null){//estou livre para conectar
      this.devices.conectaDevice(device.id).subscribe(
        ok=>{//callback sucesso
          console.log("conectei")
          this.ngZone.run(// sempre que mexo com lista que vai pra tela, pra atualizar mais rapido, uso o ngzone
            ()=>{

              
              console.log("consegui me conectar", ok)

              //sem usar o metodo de refreshcard, que nao esta funionando no momento
              this._deviceConectado = ok
              let index = this._listDevices.indexOf(device);
              index === -1 ? this._listDevices.push(ok) :  this._listDevices[index] = ok
              console.log("lista esta assim:", this._listDevices)

              //this._refreshCardConectado(device)

              console.log("lista esta assim:", this._listDevices)
            }
          )//fim ngzone          
        },
        err=>{//callback erro
          console.log("erro ao conectar ao device", device, err)
        }
      )//fim observavel
    }
    else{
      console.log("ja estou conectado a outro device")
    }
  }

  /**
  * a pagina guarda um objeto do device conectado, e o serviço tem 
  * estado, então para conectar com outro device é preciso desconectar lá 
  * também.
  * @param device é objeto do card, que é recebido somente para remover a lista de\
serviços e tornar o card de device desconectado 
  **/
  desconecta(device){
    this.devices.desconecta()
    let index = this._listDevices.indexOf(device);
    this.ngZone.run(() => {//"""""""""""force refresh da lista de cards"""""""""""""" (note as aspas)
      this._deviceConectado = null
      delete this._listDevices[index].characteristics//volta a ser um card de device desconectado
    });

  }






//rip in piece :(
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
