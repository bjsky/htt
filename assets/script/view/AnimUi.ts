import UIBase from "../component/UIBase";
import { UI } from "../core/UIManager";
import { NET } from "../core/net/NetController";
import MsgSlotWin from "../message/MsgSlotWin";
import { Common } from "../CommonData";
import { EVENT } from "../core/EventController";
import GameEvent from "../GameEvent";
import LoadSprite from "../component/LoadSprite";
import PathUtil from "../utils/PathUtil";
import { SOUND } from "../core/SoundManager";
import MsgAddRes, { ResType } from "../message/MsgAddRes";
import { Game } from "../GameController";

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

export enum SlotResultAniEnum{
    None = 1,
    Repeat = 2,
    Hevart,
    Expfly,
    BigWin,
    Share,
    PickTreeStand,
    PickTreefly,
    Plant,
    Pick,
    GoldFly,
    GetResFly,
    SlotGetRes,     //转盘抽资源
    PlantTreefly,       //种植得鲜花
}
export class SlotResultAnim{

    constructor(type:SlotResultAniEnum){
        this.type = type;
    }
    public type:SlotResultAniEnum;

    public muti:number =0;
    public addGold:number = 0;
    public flyCoin:number =0;
    public starTo:cc.Vec2 = null;
    public starFrom:cc.Vec2 = null;
    public coinTo:cc.Vec2 = null;
    public resType:ResType = 0;
    public addResCount:number = 0;
}

export enum FlyResType{
    Gold = 1,       //金币
    Flower = 2,     //鲜花
}
@ccclass
export default class AnimUi extends UIBase {

    @property(cc.Sprite)  sprBG: cc.Sprite = null;
    @property(cc.Sprite)  sprRepeat: cc.Sprite = null;
    @property(cc.Sprite)  sprBigWin: cc.Sprite = null;
    @property(cc.Sprite)  sprShare: cc.Sprite = null;
    @property(cc.Sprite)  sprPlant: cc.Sprite = null;
    @property(cc.Sprite)  sprPick: cc.Sprite = null;
    @property(cc.Node)  sprNode: cc.Node = null;
    @property(cc.Node)  nodeMuti: cc.Node = null;
    @property(cc.Sprite)  sprMuti: cc.Sprite = null;
    @property(cc.Label)  labelMuti: cc.Label = null;
    @property(cc.Node)  msStar: cc.Node = null;
    @property(cc.Node)  coinNode: cc.Node = null;
    @property(cc.Node)  starNode: cc.Node = null;
    @property(cc.Node)  nodeRes: cc.Node = null;
    @property(LoadSprite)  sprRes: LoadSprite = null;
    @property(cc.Label)  msResCount: cc.Label = null;
    @property(cc.Sprite)  sprWater: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.hideAll();
    }
    start () {

    }


    public showAnim(anim:SlotResultAnim){
        if(anim.type == SlotResultAniEnum.Repeat){
            this.showNotice(this.sprRepeat.node,anim);
        }else if(anim.type == SlotResultAniEnum.BigWin){
            this.showSpecialNotice(this.sprBigWin.node,anim);
        }else if(anim.type == SlotResultAniEnum.Share){
            this.showSpecialNotice(this.sprShare.node,anim);
        }else if(anim.type == SlotResultAniEnum.Plant){
            this.showSpecialNotice(this.sprPlant.node,anim);
        }else if(anim.type == SlotResultAniEnum.Pick){
            this.showSpecialNotice(this.sprPick.node,anim);
        }
        else if(anim.type == SlotResultAniEnum.Hevart){
            this.labelMuti.string = anim.addGold.toString();
            this.labelMuti["_updateRenderData"](true);
            var totalw:number = this.sprMuti.node.width+7+this.labelMuti.node.width;
            this.sprMuti.node.x = -totalw/2;
            this.labelMuti.node.x = totalw/2-this.labelMuti.node.width;
            this.sprBG.node.width = totalw + 50;
            this.showNotice(this.nodeMuti,anim);

            NET.send(MsgSlotWin.create(anim.addGold),(msg:MsgSlotWin)=>{
                if(msg && msg.resp){
                    Common.resInfo.updateInfo(msg.resp.resInfo);
                }
            },this)
        }else if(anim.type == SlotResultAniEnum.Expfly){
            // this.flyStar(anim.starFrom,anim.starTo);
        }else if(anim.type == SlotResultAniEnum.PickTreeStand){
            // this.addStar(anim.starFrom);
        }else if(anim.type == SlotResultAniEnum.PickTreefly){
            this.flyRes(FlyResType.Gold,anim.starFrom,anim.starTo);
        }else if(anim.type == SlotResultAniEnum.PlantTreefly){
            this.flyRes(FlyResType.Flower,anim.starFrom,anim.starTo);
        }else if(anim.type == SlotResultAniEnum.GetResFly){
            this.nodeRes.active = true;
            var moveFrom:cc.Vec2 = this.nodeRes.parent.convertToNodeSpaceAR(anim.starFrom);
            var moveTo:cc.Vec2 = this.nodeRes.parent.convertToNodeSpaceAR(anim.starTo);

            var moveCenter:cc.Vec2 = cc.v2(moveFrom.x+(moveTo.x - moveFrom.x)/2,moveFrom.y-(moveTo.y - moveFrom.y)/8);
            this.sprRes.load(PathUtil.getRESIcon(anim.resType));
            this.msResCount.string = " ";//+anim.addResCount;
            this.nodeRes.position = moveFrom;
            var move = cc.sequence(cc.bezierTo(0.6,[moveFrom,moveCenter,moveTo]).easing(cc.easeIn(1.5)),
                cc.callFunc(()=>{
                    EVENT.emit(GameEvent.Get_Res_Finish,{type:anim.resType});
                    this.nodeRes.active = false;
                }));
            this.nodeRes.runAction(move);
        }else if(anim.type == SlotResultAniEnum.GoldFly){
            this.showCoinFly(anim);
        }else if(anim.type == SlotResultAniEnum.SlotGetRes){
            if(anim.resType == ResType.Water){
                this.showNotice(this.sprWater.node,anim);
            }
        }
    }
    private hideAll(){
        this.msStar.active = false;
        this.sprNode.active = false;
        this.sprRepeat.node.active = false;
        this.sprBigWin.node.active = false;
        this.sprShare.node.active = false;
        this.sprPlant.node.active = false;
        this.sprPick.node.active = false;
        this.nodeMuti.active = false;
        this.nodeRes.active = false;
        this.sprWater.node.active = false;
    }

    private showNotice(spr:cc.Node,anim:SlotResultAnim){
        this.sprNode.active = true;
        this.sprBG.node.width = spr.width +50;
        spr.active =true;
        this.sprNode.scale = 0.7;
        this.sprNode.opacity = 255;
        var seqOut = cc.sequence(cc.scaleTo(0.15,1).easing(cc.easeBackOut()),
            cc.delayTime(0.5),
            cc.callFunc(()=>{
                if(anim.type == SlotResultAniEnum.Hevart){
                    this.showCoinFly(anim);
                }
            }),
            cc.fadeOut(0.5),
            cc.callFunc(()=>{
                this.sprNode.active = false;
                spr.active = false;
            }));
        this.sprNode.runAction(seqOut);
    }

    private showSpecialNotice(spr:cc.Node,anim:SlotResultAnim){
        this.sprNode.active = true;
        this.sprBG.node.width = spr.width +50;
        spr.active = true;
        this.sprNode.scale = 0.7;
        this.sprNode.opacity = 255;
        if(anim.type == SlotResultAniEnum.BigWin){
            SOUND.playBigWinLockSound();
        }
        var seqOut = cc.sequence(cc.scaleTo(0.15,1).easing(cc.easeBackOut()),
            cc.delayTime(0.5),
            cc.callFunc(()=>{
                if(anim.type == SlotResultAniEnum.BigWin){
                    SOUND.playBigWinBgSound();
                }
            }),
            cc.fadeOut(0.5),
            cc.callFunc(()=>{
                this.sprNode.active = false;
                spr.active = false;
            }));
        this.sprNode.runAction(seqOut);
    }

    private _delay:number = 0.06;
    private showCoinFly(anim:SlotResultAnim){
        this.clearCoins();

        SOUND.playCoinflySound(anim.flyCoin);
        for(var i:number = 0;i<anim.flyCoin;i++){
            var coin:cc.Node = this._coinPool.get();
            if(!coin){
                coin = new cc.Node();
                var spr:LoadSprite = coin.addComponent(LoadSprite);
                spr.load(PathUtil.getCoinUrl());
            }
            coin.parent = this.coinNode;
            coin.position = this.randomPos();
            coin.opacity = 0;
            var moveTo:cc.Vec2 = coin.parent.convertToNodeSpaceAR(anim.coinTo);
            var flyMotion = cc.sequence(cc.fadeIn(0.1),cc.delayTime(this._delay*i),
                cc.spawn(
                    cc.sequence(cc.scaleTo(0.07,-1,1),cc.scaleTo(0.07,1,1)).repeatForever(),
                    cc.moveTo(0.4,moveTo).easing(cc.easeIn(1.5))
                )
                ,cc.fadeOut(0.01)
                ,cc.callFunc(()=>{
                    UI.main.playGoldBounce();
                })
            );
            coin.runAction(flyMotion);
            this._coins.push(coin);
        }
        var delay:number = 0.5;
        this.scheduleOnce(()=>{
            // this.clearCoins();

            EVENT.emit(GameEvent.Show_Gold_Fly_End);
        },delay)
    }
    private randomPos():cc.Vec2{
        var center:cc.Vec2 = cc.v2(0,0);
        var x= center.x+(Math.random()-0.5)* 300;
        var y= center.y+(Math.random()-0.5)* 100;
        console.log("coin pos:"+x,y);
        return cc.v2(x,y);
    }

    private _coins:cc.Node[] = [];
    private _coinPool:cc.NodePool = new cc.NodePool();
    private clearCoins(){
        while(this._coins.length>0){
            var coin:cc.Node = this._coins.shift();
            coin.stopAllActions();
            this._coinPool.put(coin);
        }
    }

    private _starPool:cc.NodePool = new cc.NodePool();
    // private _stars:cc.Node[] = [];
    // private addStar(pos:cc.Vec2){
    //     var star:cc.Node = this._starPool.get();
    //     if(!star){
    //         star = new cc.Node();
    //         var spr:LoadSprite = star.addComponent(LoadSprite);
    //         spr.load(PathUtil.getStarUrl());
    //     }
    //     star.parent = this.starNode;
    //     star.position = this.starNode.convertToNodeSpaceAR(pos);
    //     star.opacity = 0;
        
    //     star.runAction(cc.sequence(cc.fadeIn(0.2),cc.rotateBy(2,360).repeatForever()));
    //     this._stars.push(star);
    // }

    private _starDelay:number = 0.07;
    private _starCount:number =0;
    private flyRes(res:FlyResType,fromPos:cc.Vec2,toPos:cc.Vec2){

        var star:cc.Node = this._starPool.get();
        if(!star){
            star = new cc.Node();
            var spr:LoadSprite = star.addComponent(LoadSprite);
        }
        star.getComponent(LoadSprite).load(PathUtil.getFlyResUrl(res));//(PathUtil.getStarUrl());
        this._starCount++;
        star.parent = this.starNode;
        var moveFrom = this.starNode.convertToNodeSpaceAR(fromPos);
        star.position = moveFrom;
        console.log(star.position);
        
        var moveTo = this.starNode.convertToNodeSpaceAR(toPos);
        if(res == FlyResType.Gold){
            var moveCenter:cc.Vec2 = cc.v2(moveFrom.x+30,moveFrom.y-(moveTo.y - moveFrom.y)/8);
        }else{
            var moveCenter:cc.Vec2 = cc.v2(moveFrom.x+(moveTo.x - moveFrom.x)/2,moveFrom.y-(moveTo.y - moveFrom.y)/8);
        }
            // var moveCenter = cc.v2(fromPos.x+200,fromPos.y+100);
        var move = cc.bezierTo(0.6,[moveFrom,moveCenter,moveTo]).easing(cc.easeIn(1.5))
        var seq = cc.sequence(
            cc.delayTime(this._starDelay*this._starCount),
            move//c.moveTo(0.4,this.starNode.convertToNodeSpaceAR(toPos))
            ,cc.callFunc(()=>{
                this._starCount--;
                this._starPool.put(star);
                EVENT.emit(GameEvent.Fly_Res_End,{type:res});
            }))
        star.runAction(seq);
    }
    // private clearStars(){
    //     while(this._stars.length>0){
    //         var star:cc.Node = this._stars.shift();
    //         star.stopAllActions();
    //         this._starPool.put(star);
    //     }
    // }
    // update (dt) {}
}
