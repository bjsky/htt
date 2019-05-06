
/**
 *全局 事件控制器
 */
export default class EventController extends cc.EventTarget{

    private static _instance: EventController = null;
    public static getInstance(): EventController {
        if (EventController._instance == null) {
            EventController._instance = new EventController();
        }
        return EventController._instance;
    }
}
export var EVENT = EventController.getInstance();
