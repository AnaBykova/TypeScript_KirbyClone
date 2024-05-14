//making a map, loading maps

import { KaboomCtx } from "kaboom";
import { scale } from "./constants";


//k:KaboomCtx - 1st parametr = Kaboom context; name = name of the map
export async function makeMap(k:KaboomCtx, name: string) {
  //map data; The await` keyword ensures that the fetch operation completes before moving on to the next line
  const mapData = await(await fetch(`./${name}.json`)).json();

  //create game object but not display, we will pass it with map to main scene: pos - position
  const map = k.make([k.sprite(name), k.scale(scale), k.pos(0)])

  //define X and Y where to place enemies/guys/players + defind what type of the key is going to be
  const spawnPoints: { [key: string] : {x:number; y: number} [] } = {}

  //loop taking layer from level-1.json
  for (const layer of mapData.layers) {
    //we need only "colliders" - see level-1.json
    if (layer.name === "colliders") {
      for (const collider of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), collider.width, collider.height),
            //add tag for game object - to differentiate our behavior
            collisionIgnore: ["platform", "exit"],
          }),
          //if object not exit it will be static, when game object collide with them, they are not going to move
          collider.name !== "exit" ? k.body({isStatic: true}) : null,
          //defind the position
          k.pos(collider.x, collider.y),
          collider,name !== "exit" ? "platform" : "exit"
        ]);
      }
      continue;
    }

    //check if we have this spawnPoint
    if (layer.name === "spawnpoints") {
      //layer.object - from level-1.json, *player or guy
      for (const spawnPoint of layer.objects) {
        //if key exist in spawnPoint object, we add it to exist array
        if (spawnPoints[spawnPoint.name]) {
          spawnPoints[spawnPoint.name].push({
            x: spawnPoint.x,
            y: spawnPoint.y,
          })
          continue
        }

        //if key not exist in spawnPoint object, we create this array and pass it
        spawnPoints[spawnPoint.name] = [{ x: spawnPoint.x, y: spawnPoint.y}];

      }
    }
  }

  return {map, spawnPoints};

}