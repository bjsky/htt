import LoadSprite from "../../component/LoadSprite";
import DListItem from "../../component/DListItem";
import { FlowerMapdata, FlowerDescInfo } from "../FlowerDesc";
import { Farm2 } from "../../game/farm2/Farm2Controller";
import PathUtil from "../../utils/PathUtil";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class FlowerDescItem extends DListItem {

    @property(cc.Label) mapName: cc.Label = null;

    @property([cc.RichText]) flowerDESCs:cc.RichText[] = [];
    @property([LoadSprite]) flowerICONs:LoadSprite[] = [];
    
    public Flower_Count:number = 6; 

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private _mapData:FlowerMapdata = null;

    public setData(data:any){
        super.setData(data);
        this._mapData = data as FlowerMapdata;
    }

    public onEnable(){
        super.onEnable();
        this.mapName.string = this._mapData.mapName;
        var isMapLock:boolean = Farm2.isMapLock(this._mapData.mapId);
        var descInfo:FlowerDescInfo ;
        for(var i:number = 0 ;i<this.Flower_Count;i++){
            descInfo = this._mapData.flowers[i];
            var loadIcon:string = isMapLock?PathUtil.getLockFlowerUrl():descInfo.flowerIcon;
            this.flowerICONs[i].load(loadIcon);
            if(descInfo.isPlant){

            }
            var namestr:string = "<color=#ffffff>"+descInfo.flowerName;
            if(!descInfo.isPlant){
                namestr+="<color =#F01B1B> (未种植）</c>"
            }
            var descStr:string =namestr + "<br /><color=#942F00>"+descInfo.desc+"</color></c>";
            this.flowerDESCs[i].string = descStr;
        }
    }

    public updatePlant(){
        var descInfo:FlowerDescInfo ;
        for(var i:number = 0 ;i<this.Flower_Count;i++){
            descInfo = this._mapData.flowers[i];
            descInfo.isPlant = Farm2.getFlowerisPlant(this._mapData.mapId,Number(descInfo.flowerId));
            var namestr:string = "<color=#ffffff>"+descInfo.flowerName;
            if(!descInfo.isPlant){
                namestr+="<color =#F01B1B> (未种植）</c>"
            }
            var descStr:string =namestr + "<br /><color=#942F00>"+descInfo.desc+"</color></c>";
            this.flowerDESCs[i].string = descStr;
        }
    }

    public onDisable(){
        super.onDisable();
    }

    start () {

    }

    // update (dt) {}
}
