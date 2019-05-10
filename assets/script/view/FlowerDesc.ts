import PopUpBase from "../component/PopUpBase";
import DList, { DListDirection } from "../component/DList";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { Farm2 } from "../game/farm2/Farm2Controller";
import FlowerDescItem from "./farm2/FlowerDescItem";

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

export class FlowerMapdata{
    public mapId:number = 0;
    public mapName:string = "";
    public flowers:Array<FlowerDescInfo> = [];
}
export class FlowerDescInfo{
    public flowerId:number = 0;
    public flowerName:string ="";
    public flowerIcon:string ="";
    public isPlant:boolean = false;
    public desc:string ="";
}
@ccclass
export default class FlowerDesc extends PopUpBase {

    @property(DList) list: DList = null;
    // update (dt) {}
    onLoad(){
        this.list.direction = DListDirection.Horizontal;
    }

    onEnable(){
        super.onEnable();

    }
    public onShowComplete(){
        this.initFlowerList();
    }

    onDisable(){
        super.onDisable();
    }

    private _listData:Array<any> = null;
    private initFlowerList(){
        var mapNames:string = CFG.getCfgByKey(ConfigConst.Constant,"key","mapNames")[0].value;
        var mapArr:Array<any> = mapNames.split("|");
        var mapObj:FlowerMapdata;
        if(this._listData == null){
            this._listData = [];
            for(var i:number = 0;i<mapArr.length;i++){
                var mapstr = mapArr[i];
                mapObj = new FlowerMapdata();
                mapObj.mapId = Number(mapstr.split(";")[0]);
                mapObj.mapName = mapstr.split(";")[1];
                mapObj.flowers = [];
                var descInfo:FlowerDescInfo;
                var flowers:any = CFG.getCfgByKey(ConfigConst.Flower,"mapId",mapObj.mapId);
                for(var key in flowers){
                    var flower = flowers[key];
                    descInfo = new FlowerDescInfo();
                    descInfo.flowerId = flower.id;
                    descInfo.flowerName = flower.name;
                    descInfo.flowerIcon = flower.icon;
                    descInfo.desc = flower.desc;
                    descInfo.isPlant = Farm2.getFlowerisPlant(mapObj.mapId,Number(descInfo.flowerId));
                    mapObj.flowers.push(descInfo);
                }
                this._listData.push(mapObj);
            }
            this.list.setListData(this._listData)
        }else{
            var item:FlowerDescItem;
            for(var i:number = 0;i<this._listData.length;i++){
                item = this.list.getItemAt(i) as FlowerDescItem;
                if(item){
                    item.updatePlant();
                }
            }
        }
    }
}
