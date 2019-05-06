import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { SResInfo, SFarmlandInfo} from "./MsgLogin";
import { Common } from "../CommonData";

export class CSPlant{
    public treeType:number = 0;
    public index:number = 0;
    public costGold:number = 0;
}

export class SCPlant{
    public resInfo:SResInfo = null;
    public farmland:SFarmlandInfo = null;

    public static parse(obj:any):SCPlant{
        var info:SCPlant = new SCPlant();
        info.resInfo = SResInfo.parse(obj.resInfo);
        info.farmland = SFarmlandInfo.parse(obj.farmland);
        return info;
    }
}

export default class MsgPlant extends MessageBase {
    public param:CSPlant;
    public resp:SCPlant;

    constructor(){
        super(NetConst.Plant);
        // this.isLocal = true;
    }

    public static create(treeType:number,index:number,cost:number){
        var msg = new MsgPlant();
        msg.param = new CSPlant();
        msg.param.treeType = treeType;
        msg.param.index = index;
        msg.param.costGold = cost;

        return msg;
    }

    public respFromLocal(){
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        resInfo.gold -= this.param.costGold;
        var farmland:SFarmlandInfo = new SFarmlandInfo();
        farmland.index = this.param.index;
        farmland.treeType = this.param.treeType;

        // farmland.pickTimes = Number(seedCfg.growthCount);
        farmland.growthStartTime = Common.getServerTime();
        farmland.stageGold = 0;
        farmland.level = 1;
        var json:any = {
            resInfo:resInfo,
            farmland:farmland
        };
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCPlant.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
