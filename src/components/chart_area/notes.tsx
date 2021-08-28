
import { useEffect } from "react";
import { Color, Direction } from "../../types/index";
import { Container, Sprite } from "@inlet/react-pixi";
import { Texture, BaseTexture, Rectangle } from "pixi.js";

function dir2lane(dir: Direction): number {
  switch (dir) {
    case "left": return 0;
    case "down": return 1;
    case "up": return 2;
    case "right": return 3;
  }
}


type FreezeArrowProps = { dir: Direction; y: number; length: number; arrowSize: number };
export function FreezeArrow({ dir, y, length, arrowSize }: FreezeArrowProps) {
  const x = dir2lane(dir) * arrowSize;
  useEffect(() => {
    //console.log("length:", length, "y:", y, dir, ", endTextureLen:", endTextureLength, "endofs:",endOffset);
  }, []);
  const key = `freeze-${dir}-${y}-${length}`;
  const bodyLength = length - arrowSize/2;
  const imageHeight = 128;
  const imageWidth = 60;
  const textureOfs = (bodyLength*(imageHeight/arrowSize/2)) % imageHeight;
  const ofs = bodyLength % (imageHeight/(imageHeight/arrowSize/2));
  const texture = new Texture(new BaseTexture(`${dir}_freeze_body.png`), new Rectangle(0, imageHeight-textureOfs, imageWidth, textureOfs));
  const bodyHead = ofs < 0 ? <></> : 
        <Sprite texture={texture} x={x+(arrowSize/32)} y={y  + arrowSize / 2} height={ofs} width={arrowSize-(arrowSize/32*2)} key={key+"-bodyhead"}/>
  // TODO: なんか便利なやつないの
  const bodyTail =  (bodyLength < arrowSize) ? (<></>) :
        Array.from(Array(Math.floor(bodyLength / arrowSize / 2)), (v, k) =>
          <Sprite image={`/${dir}_freeze_body.png`} x={x+(arrowSize/32)} y={ofs + y + arrowSize / 2 + k * arrowSize * 2} height={arrowSize * 2} width={arrowSize-(arrowSize/32*2)} key={key+"-bodytail"+k}/>
        )
  const endHeight = 64;
  const endWidth = 64;
  const pureArrowHeight = 36;
  const endTextureLength = Math.min(endWidth, pureArrowHeight+length*(endWidth/arrowSize));
  //const endTextureLength = endWidth
  const endOffset = (endWidth - endTextureLength) / (endWidth/arrowSize);
  const endTexture = new Texture(new BaseTexture(`${dir}_freeze_end.png`), new Rectangle(0, endHeight-endTextureLength, endWidth, endTextureLength));
  const end = 
      <Sprite texture={endTexture} x={x} y={y + length + endOffset} height={endTextureLength/(endHeight/arrowSize)} width={arrowSize} key={key+"-end"}/>
  return (
    <Container position={[0, 0]} key={key}>
      {end}
      {bodyTail}
      {bodyHead}
      <Sprite image={`/${dir}_freeze_start.png`} x={x} y={y} height={arrowSize} width={arrowSize} key={key+"-head"}/>
    </Container>
  );
}

type MineProps = { dir: Direction; y: number; arrowSize: number };
export const Mine = ({ dir, y, arrowSize }: MineProps) => {
  const key = `mine-${dir}-${y}`;
  const x = dir2lane(dir) * arrowSize;
  return <Sprite image={`/${dir}_mine.png`} x={x} y={y} height={arrowSize} width={arrowSize} key={key}/>;
};

type ArrowProps = { dir: Direction; color: Color; y: number; arrowSize: number };
export const Arrow = ({ dir, color, y, arrowSize }: ArrowProps) => {
  useEffect(() => {
    //console.log(key)
  }, []);
  const key = `arrow-${dir}-${y}-${color}`;
  const x = dir2lane(dir) * arrowSize;
  return <Sprite image={`/${dir}_${color}.png`} x={x} y={y} height={arrowSize} width={arrowSize} key={key}/>;
};

