//inicialize Kaboom library, export its contest and use it elsewhere

import kaboom from "kaboom";
import { scale } from "./constants";

//initialize kaboom = create context
//k - function with object inside
export const k = kaboom({
  //size 16:9 ratio
  width: 256 * scale,
  height: 144 * scale,
  //image of Kirby has different size of pixels so "scale" - is a work around to fix this bug
  scale,
  //canvas will be responcive - scale regardless of the screen side
  letterbox: true,
  //use kaboom related fanction only from this constant
  global: false,
})