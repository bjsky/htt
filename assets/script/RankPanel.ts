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
    @property(cc.Node) btnShare: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onEnable(){
        super.onEnable();
        this.btnShare.on(ButtonEffect.CLICK_END,this.onShareFriend,this);
        
    }

    onDisable(){
        super.onDisable();
        this.btnShare.off(ButtonEffect.CLICK_END,this.onShareFriend,this);
    }

    private onShareFriend(e){
        Share.shareAppMessage(()=>{
            this.onClose(e);
        },()=>{
            UI.showTip("成功分享到群才能查看群排行");
            this.onClose(e);
        });
    }

    protected onShowComplete(){
        super.onShowComplete();
        this.showRankList();
    }
    private showRankList(){
        UI.main.subContent.active = true;

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
