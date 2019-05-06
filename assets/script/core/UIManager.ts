import UIBase from "../component/UIBase";
import PathUtil from "../utils/PathUtil";
import GameEvent from "../GameEvent";
import { EVENT } from "./EventController";
import { Global, ResConst } from "../GlobalData";
import { AlertBtnType } from "../view/AlertPanel";
import AnimUi, { SlotResultAnim } from "../view/AnimUi";
import MainUI from "../view/MainUI";
import Connect from "../scene/Connect";

/**
 * 管理各种界面单例,层级
 * 
 */
export default class UIManager{
    private static _instance: UIManager = null;
    public static getInstance(): UIManager {
        if (UIManager._instance == null) {
            UIManager._instance = new UIManager();
            
        }
        return UIManager._instance;
    }


    //ui层
    public UILayer:cc.Node = null;
    public main:MainUI = null;
    //弹窗层级
    public PopupLayer:cc.Node = null;
    public AnimLayer:cc.Node = null;
    public TipLayer:cc.Node = null;
    //剧情层级
    private _root:cc.Node = null;

    /**
     * 注册层级
     * @param root  ui根节点
     */
    public registerLayer(root:cc.Node){
        cc.game.addPersistRootNode(root);
        this._root = root;
        
        this.UILayer = root.getChildByName("UILayer");
        this.main = this.UILayer.getComponent(MainUI);
        this.PopupLayer = root.getChildByName("PopupLayer");
        this.AnimLayer = root.getChildByName("AnimLayer");
        this.TipLayer = root.getChildByName("TipLayer");

        this.initMaskLayer();
        this.initAnimLayer();
    }

    public adjustHeight(){
        if(Global.isIPhoneX){
            this._root.getComponent(cc.Widget).top = Global.statusBarHeight;
            this._mask.y = Global.statusBarHeight;
            this._mask.setContentSize(cc.winSize.width, cc.winSize.height+44);
        }
    }

    private _uiPool:UIPool = new UIPool();
    //获取ui池
    public get uiPool(){
        return this._uiPool;
    }
    //没存过的ui，取不到
    public getUI(res:string){
        var uiNode:cc.Node = this._uiPool.getUIFromPool(res);
        if(uiNode){
            return uiNode.getComponent(UIBase);
        }else{
            return null;
        }
    }

    // private _isLoading:boolean = false;
    public loadUI(res:string,data:any,parent:cc.Node,complete?:Function){
        // if(this._isLoading)
        //     return;
        // this._isLoading = true;
        var node:cc.Node = this._uiPool.getUIFromPool(res);
        if(node!=null){
            // this._isLoading = false;
            let ui = node.getComponent(UIBase);
            if (ui != undefined) {
                data!=null && ui.setData(data);
            }
            parent.addChild(node);
            complete && complete(ui);
        }else{
            cc.loader.loadRes(res,(err, prefab)=> {
                if (err) {
                    console.log(err.message || err);
                    return;
                }
                // this._isLoading = false;
                let node: cc.Node = cc.instantiate(prefab);
                let ui = node.getComponent(UIBase);
                if (ui != undefined) {
                    ui.name = res;
                    data!=null && ui.setData(data);
                }
                parent.addChild(node);
                complete && complete(ui);
            });
        }
    }

    public removeUI(node:cc.Node){
        let ui = node.getComponent(UIBase);
        if (ui != undefined) {
            this._uiPool.putUIToPool(ui);
        }else{
            node.destroy();
        }
    }

    /////////////////////////
    //  popUp
    ///////////////////////
    private _popups:Array<UIBase> = [];
    private _mask:cc.Node = null;
    private _curPopup:UIBase = null;

    private initMaskLayer() {
        if (this._mask != null) {
            return;
        }
        this._mask = new cc.Node();
        this._mask.setAnchorPoint(0.5, 0.5);
        this._mask.addComponent(cc.BlockInputEvents);
        let sp = this._mask.addComponent(cc.Sprite);
        cc.loader.loadRes(PathUtil.getMaskBgUrl(),cc.SpriteFrame,(error: Error, spr: cc.SpriteFrame) => {
            sp.spriteFrame = spr;
        })
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this._mask.opacity = 51;
        this._mask.color = cc.color(0, 0, 0);
        this._mask.zIndex = 0;
        this._mask.setContentSize(cc.winSize.width, cc.winSize.height);
        this._mask.parent = this.PopupLayer;
        this._mask.active = false;
        this._mask.on(cc.Node.EventType.TOUCH_START,this.onMaskClick,this);
    }

    private onMaskClick(e){
        EVENT.emit(GameEvent.Mask_touch);
    }

    private _popupCreating:boolean =false;
    public get hasPopup(){
        return this._popupCreating || this._popups.length>0;
    }
    public createPopUp(res:string,data:any,createComplete?:Function){
        this._mask.active = true;
        this._mask.zIndex = this._popups.length > 0?this._popups[this._popups.length -1].node.zIndex+1:0;
        console.log("createPopup,mask index:"+this._mask.zIndex)
        this._popupCreating = true;
        this.loadUI(res,data,this.PopupLayer,(ui:UIBase)=>{
            if(ui){
                this._popups.push(ui);
                this._curPopup = ui;
                ui.node.zIndex = this._popups.length * 2;
                this._mask.zIndex = this._popups.length > 0?this._popups[this._popups.length -1].node.zIndex-1:0;
                this._mask.opacity = ui.maskOpacity;
                console.log("createPopup,node index:"+ui.node.zIndex,"mask index:"+this._mask.zIndex)
                this._popupCreating = false;
                // this.checkMaskLayer();
                createComplete && createComplete(ui);
            }
        });
    }
    public closePopUp(node:cc.Node){
        var ui:UIBase = node.getComponent(UIBase);
        var allClosed:boolean = false;
        if(ui){
            var index:number = this._popups.indexOf(ui);
            if(index>-1){
                this._popups.splice(index, 1);
                for(var i:number = index;i<this._popups.length;i++){
                    this._popups[i].node.zIndex-=2;
                }
            }
            if(this._popups.length > 0){
                this._mask.active = true;
                this._mask.zIndex = this._popups[this._popups.length -1].node.zIndex-1;
                this._curPopup = this._popups[this._popups.length-1];
                this._mask.opacity = this._curPopup.maskOpacity;
            }else{
                this._mask.active = false;
                this._mask.zIndex = 0;
                this._curPopup = null;
                allClosed = true;
            }
            console.log("closePopup,mask index:"+this._mask.zIndex)
        }
        this.removeUI(node);
        if(allClosed){
            EVENT.emit(GameEvent.PopUp_AllClosed,{});
        }
    }

    /////////////////////////
    //  interface
    ///////////////////////

    // 转圈提示
    public addLoadingLayer()
    {
        let connectingLayer = this.TipLayer.getChildByName("connectingLayer");
        var connect:Connect = connectingLayer.getComponent("Connect");
        connect.showConnect(true);
    }

        // 转圈提示隐藏
    public removeLoadingLayer()
    {
        let connectingLayer = this.TipLayer.getChildByName("connectingLayer");
        var connect:Connect = connectingLayer.getComponent("Connect");
        connect.showConnect(false);
    }

    /**
     * 一个漂浮提示
     * @param content 内容
     * @param pos 位置
     */
    public showTip(content:string){
        this.loadUI(ResConst.TipPanel,{content:content},this.TipLayer);
    }

    public showAlert(content:string,okCallback?:Function,cancelCallback?:Function,btnType:number = AlertBtnType.OKButton){
        var data = {content:content,okCb:okCallback,cancelCb:cancelCallback,btnType:btnType};
        this.createPopUp(ResConst.AlertPanel,data);
    }

    private _animui:AnimUi;
    private initAnimLayer(){
        this.loadUI(ResConst.WinAnim,{},this.AnimLayer,(ui:UIBase)=>{
            this._animui = ui as AnimUi;
        })
    }
    public showWinAnim(anim:SlotResultAnim){
        if(this._animui){
            this._animui.showAnim(anim);
        }
    }
}

export class UIPool{

    private _uiPools:any ={};

    public getUIFromPool(res: string):cc.Node {
        let pool = this._uiPools[res];
        if (pool == null) {
            return null;
        }
        let node = pool.get();
        return node;
    }

    public putUIToPool(ui:UIBase) {
        let pool: cc.NodePool = this._uiPools[ui.name];
        if (pool == null) {
            pool = new cc.NodePool();
            this._uiPools[ui.name] = pool;
        }
        return pool.put(ui.node);
    }

}


export var UI = UIManager.getInstance();
