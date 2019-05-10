import { ResType } from "../message/MsgAddRes";
import { FlyResType } from "../view/AnimUi";

export default class PathUtil {
    public static getMaskBgUrl():string{
        return "ui/maskbg";
    }

    public static getCoinUrl():string{
        return "ui/coin_icon";
    }
    public static getStarUrl():string{
        return "ui/xx";
    }
    public static getRESIcon(type:ResType):string{
        if(type == ResType.Energy){
            return "ui/icon_xin";
        }else if(type == ResType.Water){
            return "ui/water";
        }
        return "ui/icon_xin";
    }

    public static getFlyResUrl(type:FlyResType):string{
        if(type == FlyResType.Gold){
            return "ui/coin_icon";
        }else if(type == FlyResType.Flower){
            return "ui/xh";
        }
    }

    public static getLockFlowerUrl():string{
        return "ui/flower/lockFlower"
    }
}
