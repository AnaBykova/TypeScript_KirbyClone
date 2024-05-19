//entry point of project

import { makePlayer, setControls } from "./entities";
import { k } from "./kaboomCtx";
import { makeMap } from "./utils";

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

  //rename map and spawnPoints properties, later we will have a few levels
  const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap(
    k, 
    "level-1"
  );

  //create scene + function with logic executing when we go to the scene
  k.scene("level-1", () => {
    //set up gravity
    k.setGravity(2100);
    //background for scene - rectangle, game object - entity component system
    k.add([
      k.rect(k.width(), k.height()), 
      k.color(k.Color.fromHex("f7d7db")),
      //this object not affected by the camera
      k.fixed(),
    ]);

    //draw map
    k.add(level1Layout);

    //add kirb character
    const kirb = makePlayer(
      k,
      //we have only one plpayer so x and y = 0
      level1SpawnPoints.player[0].x,
      level1SpawnPoints.player[0].y
    );

    //call function for moving left/right
    setControls(k, kirb);

    //add kirb character to the scene
    k.add(kirb);

    //logic for camera, almost auto
    k.camScale(0.7, 0.7);
    //this onUpdate runs on every frame until object is destroyed, because not attached to any object
    k.onUpdate(() => {
      //make camera follow the player
      if (kirb.pos.x < level1Layout.pos.x + 432)
        //+500 = player on the left, lots of space on the right
        k.camPos(kirb.pos.x + 500, 800);
    });

  });

  //specify default scene
  k.go ("level-1");
}

gameSetup();