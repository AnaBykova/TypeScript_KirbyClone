//file for logic for a player, maps, enemy
import { scale } from "./constants";
import { GameObj, KaboomCtx } from "kaboom";

//create game object for the player
export function makePlayer(k: KaboomCtx, posX: number, posY: number) {
  const player = k.make([
    //which animation (from main.ts - gameSetup) start by default
    k.sprite("assets", { anim: "kirbIdle"}),

    //create rectangle 8*10, placed ib x=4 and y=5.9 relative to sprite - character
    k.area ({ shape: new k.Rect(k.vec2(4, 5.9), 8, 10) }),

    //player can be collide with other objects + gravity
    k.body(),

    k.pos(posX * scale, posY * scale),

    //scale sprite - character takes the correct amount of space
    k.scale(scale),
    k.doubleJump(10),
    
    //specify health value, we can you HP later (line 52)
    k.health(3),

    //fully visable if 1. When player was hit, it will be 0 = looks like it's flashing
    k.opacity(1),

    //in Kaboom.js we can pass object as a components, available immidiatly from player.<...>
    {
      speed: 300,
      direction: "right",
      isInhaling: false,
      isFull: false,
    },
    
    //tag
    "player",
  ]);

  //logic for collision: "enemy" - tag object, test/listen to collision with
  player.onCollide("enemy", async (enemy : GameObj) => {
    //if player inhaling enemy, we destroy enemy
    if (player.isInhaling && enemy.isInhalable) {
      player.isInhaling = false;
      k.destroy(enemy);
      player.isFull = true;
      return;
    }

    //if player dead/health=0, destroy player and back to start
    if (player.hp() === 0) {
      k.destroy(player);
      k.go("level-1");
      return;
    }
    //reduse player health, -1 by default
    player.hurt();

    //logic to make player Flash/blink
    //tween lets change gradually from one value to another; await - becuse tween needs to be completed before move to next tween
    await k.tween(

    )

  });
}