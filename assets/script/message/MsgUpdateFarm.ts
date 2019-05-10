import MessageBase from "../core/net/MessageBase";
import { SResInfo, SFarmlandInfo } from "./MsgLogin";
import NetConst from "../NetConst";
import { Common } from "../CommonData";

export class CSUpdateFarm{
    //升级的花田index
    public index:number = 0;
    //花田类型
    public treeType:number = 0;
    //花田的开始时间
    public startTime:number = 0;
    //等级
    public level:number = 0;
    //积累金币
    public stageGold:number = 0;
    //消耗的金币
    public costGold:number = 0;
    //增加的鲜花
    public addFlower:number = 0;
}
export class SCUpdateFarm{

    //升级后的资源信息
    public resInfo:SResInfo = null;
    //升级后的农田信息
    public farmland:SFarmlandInfo = null;
    
    public static parse(obj:any):SCUpdateFarm{
        var info:SCUpdateFarm = new SCUpdateFarm();
        info.resInfo = SResInfo.parse(obj.resInfo);
        info.farmland = SFarmlandInfo.parse(obj.farmland);
        return info;
    }
}
export default class MsgUpdateFarm extends MessageBase{
    public param:CSUpdateFarm;
    public resp:SCUpdateFarm;

    constructor(){
        super(NetConst.UpdateFarm);
        // this.isLocal = true;
    }

    public static create(index:number,treeType:number,level:number,startTime:number,stageGold:number,cost:number,addFlower:number){
        var msg = new MsgUpdateFarm();
        msg.param = new CSUpdateFarm();
        msg.param.index = index;
        msg.param.treeType = treeType;
        msg.param.startTime = startTime;
        msg.param.level = level;
        msg.param.stageGold = stageGold;
        msg.param.costGold = cost;
        msg.param.addFlower = addFlower;
        return msg;
    }

    public respFromLocal(){
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        resInfo.gold -= this.param.costGold;
        resInfo.flower += this.param.addFlower;
        var farmland:SFarmlandInfo = new SFarmlandInfo();
        farmland.index = this.param.index;
        farmland.treeType = this.param.treeType;
        farmland.growthStartTime = this.param.startTime;
        farmland.level = this.param.level;
        farmland.stageGold = this.param.stageGold;
        var json = {
            resInfo:resInfo,
            farmland:farmland
        }
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCUpdateFarm.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
