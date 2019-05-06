import { SFarmlandInfo } from "./message/MsgLogin";
import { CFG } from "./core/ConfigManager";
import { ConfigConst } from "./GlobalData";

export default class FarmlandInfo{
    
    //地格索引
    public index:number = 0 ;
    //typeid
    public treeType:number =0;
    // //采摘次数
    // public pickTimes:number = 0;

    //生长时间
    public growthStartTime:number = 0;

    //等级
    public level:number = 0;
    //鲜花等级
    public flowerLevel:number = 0;
    //积累金币
    public stageGold:number = 0;

    public initFromServer(stree:SFarmlandInfo){
        this.index = stree.index;
        if(stree.treeType<1){   //不可能小于1
            stree.treeType = 1;
        }
        this.treeType = stree.treeType;
        // this.pickTimes = stree.pickTimes;
        this.growthStartTime = stree.growthStartTime;

        this.level = stree.level;
        this.stageGold = stree.stageGold;

        if(this.treeType>0){
            var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,this.treeType);
            this.flowerLevel = Number(cfg.flower);
        }
    }
    // public updateServer(stree:SFarmlandInfo){
    //     this.pickTimes = stree.pickTimes;
    //     this.growthTime = 0;
    // }

    public cloneServerInfo():SFarmlandInfo{
        var info:SFarmlandInfo = new SFarmlandInfo();
        info.index = this.index;
        info.treeType = this.treeType;
        // info.pickTimes = this.pickTimes;
        info.growthStartTime = this.growthStartTime;
        info.level = this.level;
        info.stageGold = this.stageGold;
        return info;
    }
}
