
const {ccclass, property} = cc._decorator;

 const enum WallType {
    Left = 0,
    Right = 1,
    Top = 2,
    Bottom = 3
 };

@ccclass
export default class Helloworld extends cc.Component{

   @property width:number = 6;
   @property type:WallType = WallType.Left;

    onload(){
        
    }

    start () {
        let collider = this.getComponent(cc.BoxCollider);
        if (!collider) {
            return;
        }
        
        let node = this.node;
        let type = this.type;
        
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        
        let wallWidth = this.width;
        /*
        if (type === WallType.Left) {
            node.height = height;
            node.width = wallWidth;
            node.x = 0;
            node.y = height/2;
        }
        else if (type === WallType.Right) {
            node.height = height;
            node.width = wallWidth;
            node.x = width;
            node.y = height/2;
        }
        else if (type === WallType.Top) {
            node.width = width;
            node.height = wallWidth;
            node.x = width/2;
            node.y = height;
        }
        else if (type === WallType.Bottom) {
            node.width = width;
            node.height = wallWidth;
            node.x = width/2;
            node.y = 0;
        }
        */
        collider.size = node.getContentSize();
    }

    update(dt){
        // 
    }

    onDestroy(){

    }

}