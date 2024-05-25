//file for logic for a player, maps, enemy
import { scale } from "./constants";
import { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";

// create type for the player so PlayerGameObj has all this compomemt
type PlayerGameObj = GameObj<
  SpriteComp &
  AreaComp &
  BodyComp &
  PosComp &
  ScaleComp &
  DoubleJumpComp &
  HealthComp &
  OpacityComp & {
    speed: number;
    direction: string;
    isInhaling: boolean;
    isFull: boolean;
  }

>;

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
    k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
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

//mechanics of the Kirby: moving, swallowing, floating, etc.
export function setControls(k: KaboomCtx, player: PlayerGameObj) {
  //we need inhaleEffect from makePlayer function, so make referance:
  const inhaleEffectRef = k.get("inhaleEffect")[0]

  //coding player movement
  k.onKeyDown((key) => {
    switch (key) {
      //character move left/right
      case "left":
        //from const player
        player.direction = "left";
        player.flipX = true;
        player.move(-player.speed, 0);
        break;
      case "right":
        player.direction = "right";
        player.flipX = false;
        player.move(player.speed, 0);
        break;

      //character inhale
      case "z":
        if(player.isFull) {
          //play inhale animation
          player.play("kirbFull");
          //hide inhale Effect
          inhaleEffectRef.opacity = 0;
          break;
        }
        //if player is not full, let it inhale
        player.isInhaling = true;
        player.play("kirbInhaling");
        inhaleEffectRef.opacity = 1;
        break;
      default:
    }
  });

  //jumping
  k.onKeyPress((key) => {
    if (key === "x") player.doubleJump();
  });

  //shooting stars
  k.onKeyRelease((key) => {
    if (key === "z") {
      if (player.isFull) {
        //playing inhaling animation because we use the same image for shooting and inhaling. Here animation for shooting
        player.play("kirbInhaling");
        const shootingStar = k.add([
          //(for future expand game: copy ability of Kirby - not only inhale enemy but use their power)
          k.sprite("assets", {
            anim: "shootingStar",
            //if player direction = right, flip Star image because it is for left direction
            flipX: player.direction === "right",
          }),
          //rectangle box of shooting area
          k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
          k.pos(
            //player.pos.x - 80 = position X relatively player
            player.direction === "left" ? player.pos.x - 80 : player.pos.x + 80,
            player.pos.y + 5
          ),
          //scale - to fix bug when 2nd pixel of image is taking 1.5pixels, not just 1
          k.scale(scale),
          //where shooting start will be sent
          player.direction === "left"
          ? k.move(k.LEFT, 800)
          : k.move(k.RIGHT, 800),
          //add a tag
          "shootingStar",
        ]);
        //destroy shooting star when it collide the platform
        shootingStar.onCollide("platform", () => k.destroy(shootingStar));

        //Kirby character just shoot star so change it status
        player.isFull = false;
        // wait 1 sec before playing kirbIdle animation
        k.wait(1, () => player.play("kirbIdle"));
        return;
      }

      //character done inhaling and we don't want to show this effect
      inhaleEffectRef.opacity = 0;
      //no longer inhaling anything
      player.isInhaling = false;
      player.play("kirbIdle");
    }
  });

}

export function makeInhalable(k: KaboomCtx, enemy: GameObj) {
  //when enemy inside inhale zone its parametre is true
  enemy.onCollide("inhaleZone", () => {
    enemy.isInhalable = true;
  });

  //if enemy outside inhale zone/move away, its param is false
  enemy.onCollideEnd("inhaleZone", () => {
    enemy.isInhalable = false;
  });

  //if enemy collide with shooting start they both will be destroyed
  enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
    k.destroy(enemy);
    k.destroy(shootingStar);
  });

  const playerRef = k.get("player")[0];
  //onUpdate - run every frame where object exist
  enemy.onUpdate(() => {
    // if player can inhale and enemy can be inhaled, move enemy
    if (playerRef.isInhaling && enemy.isInhalable) {
      if (playerRef.direction === "right") {
        enemy.move(-800, 0);
        return;
      }
      enemy.move(800, 0);
    }
  });
}


//flame enemies
export function makeFlameEnemy(k: KaboomCtx, posX: number, posY: number) {
  const flame = k.add([
    k.sprite("assets", {anim: "flame"}),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      //ignore collision with other enemy, * bird and flaimed enemy
      collisionIgnore: ["enemy"],
    }),
    k.body(),
    //for each state we add a behaveour: default state, all possible states
    k.state("idle", ["idle", "jump"]),
    { isInhalable: false },
    //add tag
    "enemy",
  ]);

  makeInhalable(k, flame);

  //defind state and what action we want
  flame.onStateEnter("idle", async () => {
    //wait 1 sec before moving on
    await k.wait(1);
    //arive in the jump state
    flame.enterState("jump");
  });

  //when we in jump state, we jump with force 1000
  flame.onStateEnter("jump", async () => {
    flame.jump(1000);
  });

  flame.onStateUpdate("jump", async () => {
    //if flame is on the ground 
    if (flame.isGrounded()) {
    flame.enterState("idle");
    }
  });
  return flame;
}

//create guy + his moves
export function makeGuyEnemy(k:KaboomCtx, posX: number, posY: number) {
  const guy = k.add([
    k.sprite("assets", { anim: "guyWalk"}),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(2, 3.9), 12, 12),
      collisionIgnore: ["enemy"],
    }),
    k.body(),
    k.state("idle", ["idle", "left", "right"]),
    { isInhalable: false, speed: 100 },
    "enemy",
  ]);

  makeInhalable(k, guy);

  guy.onStateEnter("idle", async () => {
    //wait 1 sec before moving on
    await k.wait(1);
    //arive in the left state
    guy.enterState("left");
  });

  guy.onStateEnter("left", async () => {
    guy.flipX = false;
    await k.wait(2);
    //arive in the right state
    guy.enterState("right");
  });

  guy.onStateUpdate("left", () => {
    //move to the left
    guy.move(-guy.speed, 0);
  });

  guy.onStateEnter("right", async () => {
    guy.flipX = true;
    await k.wait(2);
    guy.enterState("left");
  });

  guy.onStateUpdate("right", () => {
    //move to the right
    guy.move(guy.speed, 0);
  });

  return guy;  
}

export function makeBirdEnemy(
  k: KaboomCtx,
  posX: number,
  posY: number,
  speed: number
) {
  const bird = k.add([
    k.sprite("assets", { anim: "bird"}),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      collisionIgnore: ["enemy"],
    }),
    //bird needs to be not effected by gravity (fly, not fall down), so static = true
    k.body({ isStatic: true}),
    k.move(k.LEFT, speed),
    //if bird offscreen to far, so destroyed it because we want it start from the right and goes to the left
    k.offscreen({ destroy: true, distance: 400 }),
    "enemy",
  ]);

  makeInhalable(k, bird);

  return bird;
}