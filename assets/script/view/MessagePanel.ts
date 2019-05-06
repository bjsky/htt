import PopUpBase from "../component/PopUpBase";
import ButtonEffect from "../component/ButtonEffect";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import { Farm } from "../game/farm/FarmController";

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
export enum MessagePanelType{
    gotoSlot = 1,
    plantFree, //免费种植
    pickImmediatly, //立即收获
    userInfo,       //用户授权
}


@ccclass
export default class MessagePanel extends PopUpBase {

    @property(cc.RichText) content: cc.RichText = null;
    @property(cc.Button) btnToSlot: cc.Button = null;
    @property(cc.Button) btnPlantFree: cc.Button = null;
    @property(cc.Button) btnPickImme: cc.Button = null;
    @property(cc.Button) btnUserInfo: cc.Button = null;
    
    @property(cc.Node) toSlotNode: cc.Node = null;
    @property(cc.Node) plantFreeNode: cc.Node = null;
    @property(cc.Node) pickImmeNode: cc.Node = null;
    @property(cc.Node) shouquanNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    // }

    private _type:MessagePanelType = 0;
    public setData(data:any){
        this._type = data.type;
    }

    onEnable(){
        super.onEnable();
        this.reset();
        this.btnToSlot.node.on(ButtonEffect.CLICK_END,this.toSureTouch,this);
        this.btnPlantFree.node.on(ButtonEffect.CLICK_END,this.toSureTouch,this);
        this.btnPickImme.node.on(ButtonEffect.CLICK_END,this.toSureTouch,this);
        this._sure = false;
    }
    onDisable(){
        super.onDisable();
        this.btnToSlot.node.off(ButtonEffect.CLICK_END,this.toSureTouch,this);
        this.btnPlantFree.node.off(ButtonEffect.CLICK_END,this.toSureTouch,this);
        this.btnPickImme.node.off(ButtonEffect.CLICK_END,this.toSureTouch,this);
    }
    protected onShowComplete(){
        this.closeBtn.node.active = true;
        if(this._type == MessagePanelType.gotoSlot){
            this.toSlotNode.active = true;
            this.content.string = "<color=#ffffff>金币不足！\n<color= #f6ff00>去转盘试试运气</c></c>";
            this.content.fontSize = 40;
            this.content.lineHeight = 50;
        }else if(this._type == MessagePanelType.plantFree){
            this.plantFreeNode.active = true;
            this.content.string = "<color=#ffffff>获得一次免费种植机会\n<color= #f6ff00>去农场种植吧</c></c>";
            this.content.fontSize = 40;
            this.content.lineHeight = 50;
        }else if(this._type == MessagePanelType.pickImmediatly){
            this.pickImmeNode.active = true;
            this.content.string = "<color=#ffffff>获得一次立即收获机会\n<color= #f6ff00>去农场收获吧</c></c>";
            this.content.fontSize = 40;
            this.content.lineHeight = 50;
        }else if(this._type == MessagePanelType.userInfo){
            this.shouquanNode.active = true;
            this.content.string = "<color=#ffffff>查看排行榜需要您的\n<color= #f6ff00>授权用户信息</c></c>";
            this.closeBtn.node.active = false;
        }
    }

    private reset(){
        this.content.string ='';
        this.toSlotNode.active = false;
        this.plantFreeNode.active = false;
        this.pickImmeNode.active = false;
        this.shouquanNode.active = false;
    }
    private _sure:boolean = false;
    private toSureTouch(e){
        this._sure = true;
        this.onClose(e);
    }

    protected onCloseComplete(){
        if(this._sure){
            if(this._type == MessagePanelType.gotoSlot){
                EVENT.emit(GameEvent.Scene_To_Slot);
            }else if(this._type == MessagePanelType.plantFree) {
                Farm.plantFree = true;
                EVENT.emit(GameEvent.Scene_To_Farm);
            }else if(this._type == MessagePanelType.pickImmediatly){
                Farm.pickImmediatly = true;
                EVENT.emit(GameEvent.Scene_To_Farm);
            }
            
        }
        super.onCloseComplete();
    }
    start () {

    }

    // update (dt) {}
}
