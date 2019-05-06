
export default class NumUtil{

    /**
     * 获得权重随机数
     * @param arr 权重数组
     */
    public static getRandomFruit(arr:Array<any>){
        
        var totalWeight:number = 0;
        var objs:Array<any> = [];
        arr.forEach(fruit => {
            var obj:any = {val:Number(fruit.id),weight:Number(fruit.weight)};
            objs.push(obj);
            totalWeight+=obj.weight;
        });
        var random:number = (Math.random()*totalWeight);
        var cur:number = 0;
        for(var i = 0;i<objs.length;i++){
            var obj = objs[i];
            cur+=obj.weight;
            if(random <= cur){
                return obj.val;
            }
        }
    }

    public static randomIndex(len:number):number{
        return Math.floor(Math.random()*len);
    }
}
