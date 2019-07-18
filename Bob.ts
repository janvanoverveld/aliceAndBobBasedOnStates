import {receiveMessageServer,waitForMessage} from './receiveMessageServer';
import {ADD,BYE,RES} from './Message';
import {sendMessage} from './sendMessage';
import {roles, initialize, OneTransitionPossibleException} from './globalObjects';

interface IBob_S1 {
    readonly state: "S1";
    receive():Promise<IBob_S2|IBob_Done>;
}

interface IBob_S2 {
    readonly state: "S2";
    add:ADD;
    sendRes(res:RES):IBob_S1
}

interface IBob_Done {
    readonly state: "Done";
    bye:BYE
}

abstract class Bob{
    constructor ( protected transitionPossible:boolean=true ){};
    protected checkOneTransitionPossible(){
        if (!this.transitionPossible) throw new OneTransitionPossibleException('Only one transition possible from a state');
        this.transitionPossible=false;
    }
}

class Bob_S1 extends Bob implements IBob_S1 {
    public readonly state = "S1";
    async receive():Promise<IBob_S2|IBob_Done>{
        try{
            super.checkOneTransitionPossible();
        } catch (exc) {
            return new Promise( (resolve,reject) => reject(exc) );
        }
        let msg = await waitForMessage();
        return new Promise(
            (resolve) => {
                switch (msg.name) {
                    case ADD.name: {
                        resolve(new Bob_S2(<ADD>msg));
                        break;
                    }
                    case BYE.name: {
                        resolve(new Bob_Done(<BYE>msg));
                        break;
                    }
                }
            }
        );
    }
}

class Bob_S2 extends Bob implements IBob_S2 {
    public readonly state = "S2";
    constructor(public add:ADD){
        super();
    };
    sendRes(res:RES):IBob_S1{
        super.checkOneTransitionPossible();
        if (  this.add.from ) sendMessage(this.add.from,res);
        return new Bob_S1();
    }
}

class Bob_Done extends Bob implements IBob_Done {
    public readonly state = "Done";
    constructor(public bye:BYE){
        super();
        receiveMessageServer.terminate();
    };
}

export {IBob_S1,IBob_S2,IBob_Done}

export async function executeProtocol( f:(s1:IBob_S1)=>Promise<IBob_Done> ) {
    console.log(`${roles.bob} is gestart  ${new Date()}`);
    await initialize(roles.bob,30002,'localhost');
    let done = await f(new Bob_S1());
    return new Promise<IBob_Done> (
        resolve => resolve(done)
    )
}