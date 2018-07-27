import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import "rxjs/add/operator/timeout";
import { Observable } from 'rxjs/Observable';

/**
 * serviço que prove acesso a devices ble proximas
 * @method zz #TODO
 *
 */
@Injectable()
export class BleDevicesProvider {


	public autoConecta(id, connectCallback, disconnectCallback){
		this.ble.autoConnect(id, connectCallback, disconnectCallback);
	}

  /**
  * metodo de teste. o objetivo aqui é tentar uma conexão sem scan;
  * ele tenta em 5s conectar com a placa ble do carsharing e pra verificar se 
  * funcionou envia um comando de abrir porta, que na placa acende o led vermelho
  * 
  */
	public force(){
		let conec = this.ble.connect("54:6C:0E:9B:4E:0B").timeout(5000).subscribe( 
			suc =>{
				let data = new Uint8Array(1)
				data[0] = 1 //se vc mudar para 2 acende o led verde ;)
				this.ble.write("54:6C:0E:9B:4E:0B","f0001110-0451-4000-b000-000000000000","f0001111-0451-4000-b000-000000000000",data.buffer)
        .then(//comando que acende o led da placa
					ok=>{//neste momento o led deve ter acendido na placa
						console.log("forcei ok", ok)
						this.ble.disconnect("54:6C:0E:9B:4E:0B")//para a placa voltar a advertise
						conec.unsubscribe()//evita erro de timeout
					}
					
				)
        .catch(
					err =>{
						console.log("erro ao forçar(erro no comando ble.write)", err)
					}
				)
				
			},
			err =>{
				console.log("erro ao forçar(conexão)", err)
			})
	}

	/**
	 * retorna observavel com devices que nos interessam:
	 * as que possuem name e id. opcionalmente pode ser passado um 
	 * timeout em segundos. o padrão é 5 segundos
	 * @param timeout? timeout em segundos
	 */
	public getDevicesProximas(timeout? : number): Observable<any>{
		return Observable.create(
			dev =>{
				if (!timeout) timeout = 5;
				this.ble.scan([],timeout).subscribe(
					ok => {
						if(ok.name) dev.next(ok)
					},
					err =>{
						dev.error(err)
					},
					()=>{
						dev.complete()
					}
				)	
			}
		) 
	}

	/**
	 *  recebe um id de device (que pode ser um MAC ou UUID, ou outro indentificador)
	 *  e retorna lista de serviços deste device
	 *  opcionalmente recebe um timeout em segundos, que por padrão é 5s.
	 * o metodo conecta no device para obter os serviços e logo apos desconecta
	 * 	@param deviceId identificador do device
	 *  @param timeout opcional timeout em segundos
	 *  @returns observavel com json de serviços no formato { service: string,	characteristic: string, properties: Array<any>}
	 */
	public getDeviceServices(deviceId : string, timeout? : number) : Observable<any>{
		if(!timeout) timeout = 5
		return Observable.create(
			o=>{
				this.ble.connect(deviceId).timeout(timeout * 1000).subscribe(
					ok =>{
						o.next(ok.characteristics)
					},
					err=>{
						console.log("erro ao conectar no device :(")
						o.error(err)
					},
					()=>{
						this.ble.disconnect(deviceId).catch(err=>{console.log("erro ao encerrar conexão", err)})
						o.complete();
					}
				)
			}
		)
	}
	/**
	 * estabelece conexão com device. se ja estiver conectado com 
	 * um device quando chamado, desconecta dele antes
	 * @param deviceId identificador do device
	 * @returns observavel com device conectado
	 */
	public conectaDevice(deviceId :string):Observable<any>{

		return Observable.create(
			o=>{
				if(this._deviceConectado){
					this.desconecta();
				}
		
				this.ble.connect(deviceId).subscribe(
					ok => {
						this._deviceConectado = ok;
						o.next(ok);
						o.complete();	
					},
					err =>{
						this._deviceConectado = null;
						o.error(err);		
					}
				)
			}
		)		
	}
	/**
	 * retorna o device conectado. se não estiver conectado a nenhum retorna null
	 * @returns device conectado ou null caso não esteja conectado
	 */
	public getDeviceConectado(){
		return this._deviceConectado;
	}

	
	/**
	 * desconecta a qualquer device que esteja conectado, se não estiver conectado 
	 * a nenhum não faz nada
	 */
	public desconecta(){
		if(this._deviceConectado){
			this.ble.disconnect(this._deviceConectado.id)
			.then(this._deviceConectado = null)
			.catch(err=>{
				console.log("erro ao desconectar")
			})
		}
	}



	/**
	 * le de um serviço do device conectado
	 * @param service serviço do device a ser lido
	 * @returns observavel com valor de retorno  
	 */
	public readService(
		service : {
			service: string,
			characteristic: string,
			properties?: Array<any>
		}
	):Observable<any>{
		return Observable.create(
			o=>{
				//se não estiver conectado a um device lança um erro
				if(!this._deviceConectado){
					o.error({message: "nenhum device conectado, use conectaDevice"})
				}
				// if(service.properties && service.properties.includes("Read")){
				// 	o.error({message: "não é serviço de leitura"})
				// }
				this.ble.read( this._deviceConectado.id, service.service, service.characteristic)
				.then(
					ok=>{
						o.next(ok)
						o.complete();
					}
				)
				.catch(
					err=>{
						o.error(err)
					}
				)
			}
		)

	}


	/**
	 *  escreve em um serviço de um device conectado.
	 * @param service serviço no qual será escrito
	 * @param value valor a ser escrito
   * @param timeout? timeout em segundos (padrão 5)
	 * @returns valor retornado pelo device
	 */
	public writeService(
		service : {
			service: string,
			characteristic: string,
			properties?: Array<string>
		},
		value : number,
    timeout? : number,
	): Observable<any>{
    if(!timeout) timeout = 5
		//ajustando o dado para mandar		
		let data = new Uint8Array(1)//isso vai dar problema alguma hora
		data[0] = value// % 2**8;
		return Observable.create(
			o =>{
				if(!this._deviceConectado){
					o.error({message: "nenhum device conectado, use conectaDevice("})
				}
				this.ble.write(this._deviceConectado.id, service.service, service.characteristic, data.buffer)
				.then(
					ok =>{
						console.log("enviei com sucesso")
						o.next(ok)
						o.complete()
					}
				)
				.catch(
					err=>{
						console.log("ble-devices: erro ao enviar comando")
						o.error(err)
					}
				)

			}
		).timeout(5)

	}

	private _deviceConectado = null;
	constructor(
		private ble : BLE
	) {
	}

}
