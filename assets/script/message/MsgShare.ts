import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { SResInfo, SUserInfo } from "./MsgLogin";
import ResInfo from "../ResInfo";
import { Common } from "../CommonData";

export class CSShare{
    public addGold:number = 0;
    public energy:number = 0;
    public energyStartTime:number = 0;
}
export class SCShare{
    //增加金币或者更新能量后的资源信息
    public resInfo:SResInfo = null;

    public static parse(obj:any):SCShare{
        var info:SCShare = new SCShare();
        info.resInfo = SResInfo.parse(obj);
        return info;
    }
}

export default class MsgShare extends MessageBase{

    public param:CSShare;
    public resp:SCShare;

    constructor(){
        super(NetConst.Share);
        // this.isLocal = true;
    }

    public static create(addGold:number,energy:number,energyStartTime:number){
        var msg = new MsgShare();
        msg.param = new CSShare();
        msg.param.addGold = addGold;
        msg.param.energy = energy;
        msg.param.energyStartTime = energyStartTime;
        return msg;
    }

    public respFromLocal(){
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        resInfo.energy= this.param.energy;
        resInfo.energyStartTime= this.param.energyStartTime;
        resInfo.gold+= this.param.addGold;
        var json:any = resInfo;
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCShare.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
