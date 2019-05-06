import PopUpBase from "./component/PopUpBase";
import BuyLifeUI from "./view/BuyLifeUI";
import ButtonEffect from "./component/ButtonEffect";
import { UI } from "./core/UIManager";
import { Share } from "./ShareController";

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
export enum RankPanelView{
    Rank = 1,       //排行榜
    Help = 2,       //帮组
    Friend = 3      //好友
}

@ccclass
export default class RankPanel extends PopUpBase {

    @property(cc.Node) nodeRank: cc.Node = null;
    @property(cc.Node) nodeHelp: cc.Node = null;

    @property(cc.Node) btnHelp: cc.Node = null;
    @property(cc.Node) btnRank: cc.Node = null;
    @property(cc.Node) btnShare: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onEnable(){
        super.onEnable();
        this.btnHelp.on(ButtonEffect.CLICK_END,this.onHelpClick,this);
        this.btnRank.on(ButtonEffect.CLICK_END,this.onRankClick,this);
        this.btnShare.on(ButtonEffect.CLICK_END,this.onShareFriend,this);
        
    }

    onDisable(){
        super.onDisable();
        this.btnHelp.off(ButtonEffect.CLICK_END,this.onHelpClick,this);
        this.btnRank.off(ButtonEffect.CLICK_END,this.onRankClick,this);
        this.btnShare.off(ButtonEffect.CLICK_END,this.onShareFriend,this);
    }

    private onHelpClick(e){
        this.setView(RankPanelView.Help)
    }

    private onRankClick(e){
        this.setView(RankPanelView.Rank);
    }

    private onShareFriend(e){
        Share.shareAppMessage(()=>{
            this.onClose(e);
        },()=>{
            UI.showTip("分享失败!");
            this.onClose(e);
        });
    }

    protected onShowComplete(){
        super.onShowComplete();
        this.setView(RankPanelView.Rank);
    }

    private _viewType:RankPanelView =0;
    private setView(type:RankPanelView){
        if(type == RankPanelView.Rank){
            UI.main.subContent.active = true;
            console.log("sub content open")
        }else{
            console.log("sub content close")
            UI.main.subContent.active = false;
        }
        if(type == this._viewType) 
            return;
        this._viewType = type;

        this.nodeRank.active = false;
        this.nodeHelp.active = false;
        if(type == RankPanelView.Rank){
            this.nodeRank.active = true;
        }else if(type == RankPanelView.Help){
            this.nodeHelp.active = true;
        }
    }

    public onClose(e){
        console.log("sub content close")
        UI.main.subContent.active = false;
        super.onClose(e);
    }
    start () {

    }

    // update (dt) {}
}
