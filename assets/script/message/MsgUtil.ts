import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import MsgLogin from "./MsgLogin";
import MsgHeartBeat from "./MsgHeartBeat";
import MsgSlot from "./MsgSlot";
import MsgSlotWin from "./MsgSlotWin";
import MsgPlant from "./MsgPlant";
import MsgPick from "./MsgPick";
import MsgShare from "./MsgShare";
import MsgUpdateUnlock from "./MsgUpdateUnlock";
import MsgWaterTree from "./MsgWaterTree";
import MsgAddRes from "./MsgAddRes";

/**
 * 太特么坑了，父类中还不能导入子类
 */
export default class MsgUtil{
    
    //创建response message
    public static createMessage(id:number):MessageBase{
        var message:MessageBase = null;
        switch(id){
            case NetConst.Login:{
                message = new MsgLogin();
            }break;
            case NetConst.Heart:
                message = new MsgHeartBeat();
            break;
            case NetConst.Slot:
                message = new MsgSlot();
            break;
            case NetConst.SlotWin:
                message = new MsgSlotWin();
            break;
            case NetConst.Plant:
                message = new MsgPlant();
            break;
            case NetConst.Pick:
                message = new MsgPick();
            break;
            case NetConst.Share:
                message = new MsgShare();
            break;
            case NetConst.UpdateUnlock:
            message = new MsgUpdateUnlock();
            break;
            case NetConst.WaterTree:
            message = new MsgWaterTree();
            break;
            case NetConst.AddRes:
            message = new MsgAddRes();
            break;

            default:
            message = null;
            break;
        }
        return message;
    }
}