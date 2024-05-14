//entry point of project

import { k } from "./kaboomCtx";

async function gameSetup() {
  k.loadSprite("assets", "./kirby-like.png", {
    //kirby-like.png image sliced to 16*16 horizontally and vertically
    sliceX: 9,
    sliceY: 10,
    //animaion, which key correcponded with which key
    anims: {
      //main Kirby image, start with 0
      kirbIdle: 0,
      kirbInhaling: 1,
      kirbFull: 2,
      //when start animation: from frame 3 to 8, speed = frames/sec, loop = repeat
      kirbInhaleEffect: { from: 3, to: 8, speed: 15, loop: true },
      shootingStar: 9,
      flame: { from: 36, to: 37, speed: 4, loop: true },
      guyIndle: 18,
      guyWalk: { from: 27, to: 28, speed: 4, loop: true },
      bird: { from: 27, to: 28, speed: 4, loop: true },
    },
  });

  k.loadSprite("level-1", "./level-1.png");

  //create scene + function with logic executing when we go to the scene
  k.scene("level-1", () => {
    //set up gravity
    k.setGravity(2100);
    //background for scene - rectangle, game object - entity component system
    k.add([
      k.rect(k.width(), k.height()), 
      k.color(k.Color.fromHex("f7d7db")),
      //this object not affected by the camera
      k.fixed()
    ]);
  })

  //specify default scene
  k.go ("level-1");
}

gameSetup();