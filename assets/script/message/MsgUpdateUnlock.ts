import MessageBase from "../core/net/MessageBase";
import { SUnlockFarmland } from "./MsgLogin";
import NetConst from "../NetConst";

export class CSUpdateUnlock{
    //解锁的农田索引,服务器更新解锁信息
    public unlockIndex:number = 0;
    //解锁农田的种植个数,服务器更新解锁信息
    public unlockTreeCount:number = 0;
}
export class SCUpdateUnlock{
    //农田解锁信息
    public unlockFarmland:SUnlockFarmland = null;

    public static parse(obj:any):SCUpdateUnlock{
        var info:SCUpdateUnlock = new SCUpdateUnlock();
        info.unlockFarmland = SUnlockFarmland.parse(obj);
        return info;
    }
}
export default class MsgUpdateUnlock extends MessageBase {

    public param:CSUpdateUnlock;
    public resp:SCUpdateUnlock;

    constructor(){
        super(NetConst.UpdateUnlock);
        // this.isLocal = true;
    }

    public static create(index:number,count:number){
        var msg = new MsgUpdateUnlock();
        msg.param = new CSUpdateUnlock();
        msg.param.unlockIndex = index;
        msg.param.unlockTreeCount = count;
        return msg;
    }

    public respFromLocal(){
        var farmlandInfo:SUnlockFarmland = new SUnlockFarmland();
        farmlandInfo.index = this.param.unlockIndex;
        farmlandInfo.treeCount = this.param.unlockTreeCount;
        var json:any = farmlandInfo;
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCUpdateUnlock.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
