import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { SResInfo, SFarmlandInfo, SUserInfo } from "./MsgLogin";
import { Common } from "../CommonData";
import { Farm } from "../game/farm/FarmController";
export class CSWaterTree{
    //消耗水滴
    public waterCost:number = 0;
    //增加经验
    public addExp:number = 0;
    //更新地格index
    public index:number = 0;
    //更新开始种植时间
    public growthStartTime:number = 0;
}

export class SCWaterTree{
    //等级信息
    public userInfo:SUserInfo = null;
    //资源
    public resInfo:SResInfo = null;
    //地格信息
    public farmland:SFarmlandInfo = null;

    public static parse(obj:any):SCWaterTree{
        var info:SCWaterTree = new SCWaterTree();
        info.userInfo = SUserInfo.parse(obj.userInfo);
        info.resInfo = SResInfo.parse(obj.resInfo);
        info.farmland = SFarmlandInfo.parse(obj.farmland);
        return info;
    }
}
export default class MsgWaterTree extends MessageBase{
    public param:CSWaterTree;
    public resp:SCWaterTree;

    constructor(){
        super(NetConst.WaterTree);
        // this.isLocal = true;
    }

    public static create(cost:number,addExp:number,index:number,growthStartTime:number){
        var msg = new MsgWaterTree();
        msg.param = new CSWaterTree();
        msg.param.waterCost = cost;
        msg.param.addExp = addExp;
        msg.param.index = index;
        msg.param.growthStartTime = growthStartTime;
        return msg;
    }

    public respFromLocal(){
        var userInfo:SUserInfo = Common.userInfo.cloneAddExpServerInfo(this.param.addExp);
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        resInfo.water -= this.param.waterCost;
        var farmland = Farm.getFarmlandAtIndex(this.param.index).cloneServerInfo();
        farmland.growthStartTime = this.param.growthStartTime;
        var json:any = {
            userInfo:userInfo,
            resInfo:resInfo,
            farmland:farmland
        };
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCWaterTree.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
