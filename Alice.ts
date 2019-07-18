import {roles,initialize,OneTransitionPossibleException} from './globalObjects';
import {receiveMessageServer,waitForMessage} from './receiveMessageServer';
import {ADD,BYE,RES} from './Message';
import {sendMessage} from './sendMessage';

interface IAlice_S1 {
    res?:RES;
    sendAdd(add:ADD):Alice_S2;
    sendBye(bye:BYE):Alice_Done;
}

interface IAlice_S2 {
    getRes():Promise<Alice_S1>;
}

interface IAlice_Done{};

abstract class Alice{
    constructor ( protected transitionPossible:boolean=true ){};
    protected checkOneTransitionPossible(){
       if (!this.transitionPossible) throw new OneTransitionPossibleException('Only one transition possible from a state');
       this.transitionPossible=false;
    }
}

class Alice_S1 extends Alice implements Alice_S1 {
    constructor ( public res?:RES ) {
        super();
     }
    sendAdd(add:ADD):Alice_S2{
        super.checkOneTransitionPossible();
        console.log(`stuur een add naar ${roles.bob} met waarden ${add.value1}  ${add.value2}`);
        add.from=roles.alice;
        sendMessage(roles.bob,add);
        return new Alice_S2();
    }
    sendBye(bye:BYE):Alice_Done{
        super.checkOneTransitionPossible();
        bye.from = roles.alice;
        sendMessage(roles.bob,bye);
        return new Alice_Done();
    }
}

class Alice_S2 extends Alice implements Alice_S2 {
    constructor ( ) {
        super();
    }
    async getRes():Promise<Alice_S1>{
        try{
            super.checkOneTransitionPossible();
        } catch (exc) {
            return new Promise( (resolve,reject) => reject(exc) );
        }
        let res = <RES> await waitForMessage();
        return new Promise( (resolve) => resolve(new Alice_S1(res) ) );
    }
}

class Alice_Done extends Alice implements Alice_Done {
    constructor ( ) {
        super();
        receiveMessageServer.terminate();
    }
}

export {IAlice_S1,IAlice_S2,IAlice_Done}

export async function executeProtocol( f:(s1:IAlice_S1)=>Promise<IAlice_Done> ) {
    console.log(`${roles.alice} is gestart  ${new Date()}`);
    await initialize(roles.alice, 30001,'localhost');
    let done = await f(new Alice_S1());
    return new Promise<IAlice_Done> (
        resolve => resolve(done)
    )
}