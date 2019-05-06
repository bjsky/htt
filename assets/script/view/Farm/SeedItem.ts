import DListItem from "../../component/DListItem";
import LoadSprite from "../../component/LoadSprite";
import PathUtil from "../../utils/PathUtil";
import { Common } from "../../CommonData";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst, ResConst } from "../../GlobalData";
import ButtonEffect from "../../component/ButtonEffect";
import FarmController, { Farm } from "../../game/farm/FarmController";
import DList from "../../component/DList";
import { UI } from "../../core/UIManager";
import { MessagePanelType } from "../MessagePanel";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { SOUND } from "../../core/SoundManager";

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
export default class SeedItem extends DListItem{
    @property(LoadSprite) sprFruit:LoadSprite = null;
    @property(cc.Label) lblSeedName:cc.Label = null;
    @property(cc.Label) lblSeedCost:cc.Label = null;
    @property(cc.Label) lblLockLv:cc.Label = null;
    @property(cc.Node) nodeLock:cc.Node = null;
    @property(cc.Node) nodeunLock:cc.Node = null;

    @property(cc.Button) btnPlant:cc.Button = null;
    @property(cc.Button) btnPlantFree:cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    private _seedId:number = 0;
    private _seedName:string = "";
    private _unlockLv:number = 0;
    private _cost:number = 0;
    private _icon:string =""
    public setData(data:any){
        super.setData(data);
        this._seedId = Number(data.id);
        this._seedName = data.name;
        this._unlockLv = Number(data.unlocklv);
        this._cost = Number(data.plantcost);
        this._icon = data.icon;
    }
    onEnable(){
        super.onEnable();

        EVENT.on(GameEvent.Plant_Free_Change,this.onPlantFreeChange,this);
        this.btnPlant.node.on(ButtonEffect.CLICK_END,this.onPlant,this);
        this.btnPlantFree.node.on(ButtonEffect.CLICK_END,this.onPlantFree,this);
        this.lblSeedName.string = this._seedName;
        this.sprFruit.load(this._icon);

        this.updateUnlock();
        this.showPlantFree(Farm.plantFree);
    }

    public updateUnlock(){
        this.nodeLock.active = this.nodeunLock.active = false;
        if(Common.userInfo.level>= this._unlockLv){
            this.nodeunLock.active = true;
            this.lblSeedCost.string = this._cost.toString();
        }else{
            this.nodeLock.active = true;
            var title:string = CFG.getCfgDataById(ConfigConst.Level,this._unlockLv).title;
            this.lblLockLv.string ="lv."+this._unlockLv +" 解锁";
        }
    }

    onDisable(){
        super.onDisable();
        EVENT.off(GameEvent.Plant_Free_Change,this.onPlantFreeChange,this);
        this.btnPlant.node.off(ButtonEffect.CLICK_END,this.onPlant,this);
        this.btnPlantFree.node.off(ButtonEffect.CLICK_END,this.onPlantFree,this);
    }

    private onPlantFreeChange(e){
        this.showPlantFree(Farm.plantFree);
    }

    private showPlantFree(bool:boolean){
        this.btnPlant.node.active = !bool;
        this.btnPlantFree.node.active = bool;
    }


    private onPlant(e){
        if(Common.userInfo.level<this._unlockLv){
            var title:string = CFG.getCfgDataById(ConfigConst.Level,this._unlockLv).title;
            UI.showTip(title + " 解锁");
            return;
        }
        if(Common.resInfo.gold<this._cost){
            UI.createPopUp(ResConst.MessgaePanel,{type:MessagePanelType.gotoSlot})
            SOUND.playBtnSound();
            return;
        }
        var index:number = Farm.getIdleFarmlandIndex();
        if(index<0){
            if(Farm.getPlantedFarmlandCount()>0){
                UI.showTip("没有空闲土地，滑动果树采摘");
            }else{
                UI.showTip("没有空闲土地，点击果树浇水");
            }
            SOUND.playBtnSound();
            return;
        }else{
            SOUND.playPlantSound();
            Farm.plantOnce(this._seedId,index);
        }
    }

    private onPlantFree(e){
        var index:number = Farm.getIdleFarmlandIndex();
        if(index<0){
            if(Farm.getPlantedFarmlandCount()>0){
                UI.showTip("没有空闲土地，滑动果树采摘");
            }else{
                UI.showTip("没有空闲土地，点击果树浇水");
            }
            return;
        }else{
            Farm.plantOnce(this._seedId,index,true);
            Farm.plantFree = false;
            EVENT.emit(GameEvent.Plant_Free_Change,{free:false});
        }
    }
    start () {

    }

    // update (dt) {}
}
