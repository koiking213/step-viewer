import {
  PixiComponent,
} from "@inlet/react-pixi";
import { Graphics } from "pixi.js";

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export const Rectangle = PixiComponent<RectangleProps, Graphics>("Rectangle", {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    ins.beginFill(props.color);
    ins.drawRect(props.x, props.y, props.width, props.height);
    ins.endFill();
  },
});

