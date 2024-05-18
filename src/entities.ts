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
      //what we change
      player.opacity,
      //target value
      0,
      //time from 1 to 0, sec
      0.05,
      (val) => (player.opacity = val),
      //what isthe rate of change - linear
      k.easings.linear
    );
    //opacity from 0 to 1
    await k.tween(
      player.opacity,
      1,
      0.05,
      (val) => (player.opacity = val),
      k.easings.linear
    );
  });

  //exit door
  player.onCollide("exit", () => {
    k.go("level-2");
  });

  //inhaling mechanic/effect
  //animation always playing, we tweak when it visible or not depends on situation
  const inhaleEffect = k.add([
    //Kirby object with animation
    k.sprite("assets", {anim: "kirbInhaleEffect"}),
    k.pos(),
    k.scale(scale),
    k.opacity(0),
    //give it a tag
    "inhaleEffect",
  ]);

  //inhaleZone - invisible box, where player can swallow enemy
  const inhaleZone = player.add([
    k.area({ shape: new k.Rect(k.vec2(0), 20, 40) }),
    //position is empty/deside later because of player direction
    k.pos(),
    //tag
    "inhaleZone",
  ]);

  //logic for inhale zone
  inhaleZone.onUpdate(() => {
    if (player.direction === "left") {
      //inhaleZone - child of player, so it is relative to player
      //we will pass this position to inhaleZone
      inhaleZone.pos = k.vec2(-14, 8);
      inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
      //our .png has inhale from left to right, so here flip = true
      inhaleEffect.flipX = true;
      return;
    }
    inhaleZone.pos = k.vec2(14, 8);
    inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
    inhaleEffect.flipX = false;
  });

  //if player falls(y goes down) = dead, reset everything (health, etc.)
  player.onUpdate(() => {
    if (player.pos.y > 2000) {
      k.go("level-1");
    }
  });

  return player;
}