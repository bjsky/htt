import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { Common } from "../CommonData";
import { SUserInfo, SResInfo } from "./MsgLogin";

export class CSSlot{
    public energy:number = 0;
    public energyStartTime:number = 0;
    public addExp:number = 0;
}
export class SCSlot{
    public userInfo:SUserInfo = null;

    public static parse(obj:any):SCSlot{
        var info:SCSlot = new SCSlot();
        info.userInfo = SUserInfo.parse(obj);
        return info;
    }
}
export default class MsgSlot extends MessageBase {
    public param:CSSlot;
    public resp:SCSlot;

    constructor(){
        super(NetConst.Slot);
        // this.isLocal = true;
    }

    public static create(cost:number,addExp:number){
        var msg = new MsgSlot();
        msg.param = new CSSlot();
        Common.resInfo.energy -=cost;
        msg.param.energy = Common.resInfo.energy;
        msg.param.energyStartTime = Common.resInfo.energyStartTime;
        msg.param.addExp = addExp;
        return msg;
    }

    public respFromLocal(){
        var userInfo:SUserInfo = Common.userInfo.cloneAddExpServerInfo(this.param.addExp);
        var json:any = userInfo;
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCSlot.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
