import MessageBase from "../core/net/MessageBase";
import { SResInfo, SFarmlandInfo, SUserInfo } from "./MsgLogin";
import NetConst from "../NetConst";
import { Common } from "../CommonData";
import { Farm2 } from "../game/farm2/Farm2Controller";
import { Global } from "../GlobalData";

export class CSPickFarm{
    //采摘的位置，stageGold设为0
    public index:number = 0;
    //开始时间更新
    public startTime:number = 0;
    //增加的金币
    public addGold:number = 0;
}

export class SCPickFarm{

    //更新后的资源
    public resInfo:SResInfo = null;
    //更新后的农场信息
    public farmland:SFarmlandInfo = null;

    public static parse(obj:any):SCPickFarm{
        var info:SCPickFarm = new SCPickFarm();
        info.resInfo = SResInfo.parse(obj.resInfo);
        info.farmland = SFarmlandInfo.parse(obj.farmland);
        return info;
    }
}
export default class MsgPickFarm extends MessageBase{
    public param:CSPickFarm;
    public resp:SCPickFarm;

    constructor(){
        super(NetConst.PickFarm);
        // this.isLocal = true;
    }

    public static create(index:number,starttime:number,addGold:number){
        var msg = new MsgPickFarm();
        msg.param = new CSPickFarm();
        msg.param.index = index;
        msg.param.startTime = starttime;
        msg.param.addGold = addGold;
        return msg;
    }

    public respFromLocal(){
        // var userInfo:SUserInfo = Common.userInfo.cloneAddExpServerInfo(this.param.addExp);
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        resInfo.gold+= this.param.addGold;
        // resInfo.flower += this.param.addFlower;
        var farmland:SFarmlandInfo = Farm2.getFarmlandAtIndex(this.param.index).cloneServerInfo();
        farmland.growthStartTime = this.param.startTime;
        farmland.stageGold =0;
        // var json:any = userInfo;
        var json:any ={
            resInfo:resInfo,
            // userInfo:userInfo,
            farmland:farmland
        };
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCPickFarm.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
