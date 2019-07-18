import {IAlice_S1,IAlice_Done,executeProtocol} from './Alice';
import {ADD,BYE} from './Message';

async function protocol(s1:IAlice_S1):Promise<IAlice_Done> {
   for(let i=0;i<13;i++) {
      let add = new ADD(Math.floor(Math.random() * 8),Math.floor(Math.random() * 8));
      let s2 = s1.sendAdd(add);
      s1 = await s2.getRes();
      if (s1.res) console.log(`RES heeft waarde van ${s1.res.sum}`);
   }
   let bye=new BYE();
   let done=s1.sendBye(bye);
   return new Promise( resolve => resolve( done ) );
}

async function start(){
   await executeProtocol(protocol);
}

start();