
import { Color, Direction } from "../../types/index";
import { Container, Sprite, AnimatedSprite } from "@inlet/react-pixi";
import { Texture, BaseTexture, Rectangle } from "pixi.js";

function dir2lane(dir: Direction): number {
  switch (dir) {
    case "left": return 0;
    case "down": return 1;
    case "up": return 2;
    case "right": return 3;
  }
}

const textureFreezeBody = [
  new BaseTexture(`/skin/left_freeze_body.png`),
  new BaseTexture(`/skin/down_freeze_body.png`),
  new BaseTexture(`/skin/up_freeze_body.png`),
  new BaseTexture(`/skin/right_freeze_body.png`)
];

const textureFreezeEnd = [
  new BaseTexture(`/skin/left_freeze_end.png`),
  new BaseTexture(`/skin/down_freeze_end.png`),
  new BaseTexture(`/skin/up_freeze_end.png`),
  new BaseTexture(`/skin/right_freeze_end.png`)
];

type FreezeArrowProps = { dir: Direction; offset: number; length: number; arrowSize: number; yMultiplier: number };
export function FreezeArrow({ dir, offset, length, arrowSize, yMultiplier }: FreezeArrowProps) {
  const x = dir2lane(dir) * arrowSize;
  const y = offset * yMultiplier;
  const effectiveLength = length * yMultiplier;
  const bodyLength = effectiveLength - arrowSize / 2;
  const imageHeight = 128;
  const imageWidth = 60;
  const textureOfs = (bodyLength * (imageHeight / arrowSize / 2)) % imageHeight;
  const ofs = bodyLength % (imageHeight / (imageHeight / arrowSize / 2));
  const texture = new Texture(textureFreezeBody[dir2lane(dir)], new Rectangle(0, imageHeight - textureOfs, imageWidth, textureOfs));
  const bodyHead = ofs < 0 ? <></> :
    <Sprite texture={texture} x={x + (arrowSize / 32)} y={y + arrowSize / 2} height={ofs} width={arrowSize - (arrowSize / 32 * 2)} />
  // TODO: なんか便利なやつないの
  const bodyTail = (bodyLength < arrowSize) ? (<></>) :
    Array.from(Array(Math.floor(bodyLength / arrowSize / 2)), (v, k) =>
      <Sprite image={`/skin/${dir}_freeze_body.png`} x={x + (arrowSize / 32)} y={ofs + y + arrowSize / 2 + k * arrowSize * 2} height={arrowSize * 2} width={arrowSize - (arrowSize / 32 * 2)} key={k} />
    )
  const endHeight = 64;
  const endWidth = 64;
  const pureArrowHeight = 36;
  const endTextureLength = Math.min(endWidth, pureArrowHeight + effectiveLength * (endWidth / arrowSize));
  const endOffset = (endWidth - endTextureLength) / (endWidth / arrowSize);
  const endTexture = new Texture(textureFreezeEnd[dir2lane(dir)], new Rectangle(0, endHeight - endTextureLength, endWidth, endTextureLength));
  const end =
    <Sprite texture={endTexture} x={x} y={y + effectiveLength + endOffset} height={endTextureLength / (endHeight / arrowSize)} width={arrowSize} />
  return (
    <Container position={[0, 0]}>
      {end}
      {bodyTail}
      {bodyHead}
      <Sprite image={`/skin/${dir}_freeze_start.png`} x={x} y={y} height={arrowSize} width={arrowSize} />
    </Container>
  );
}

type MineProps = { dir: Direction; offset: number; arrowSize: number, noteTextures: { [name: string]: Texture[] }, playing: boolean, yMultiplier: number };
export const Mine = ({ dir, offset, arrowSize, noteTextures, playing, yMultiplier }: MineProps) => {
  const x = dir2lane(dir) * arrowSize;
  const y = offset * yMultiplier;
  return <AnimatedSprite isPlaying={playing} initialFrame={3} animationSpeed={0.1} textures={noteTextures[`${dir}_mine`]} x={x} y={y} height={arrowSize} width={arrowSize} />;
};

type ArrowProps = { dir: Direction; color: Color; offset: number; arrowSize: number, noteTextures: { [name: string]: Texture[] }, playing: boolean, freeze: boolean, yMultiplier: number };
export const Arrow = ({ dir, color, offset, arrowSize, noteTextures, playing, freeze, yMultiplier }: ArrowProps) => {
  const x = dir2lane(dir) * arrowSize;
  const y = offset * yMultiplier;
  const rot = dir === "left" ? 90 : dir === "down" ? 0 : dir === "up" ? 180 : 270;
  if (freeze) {
    return <Sprite image={`/skin/${dir}_freeze_start.png`} x={x} y={y} height={arrowSize} width={arrowSize} />
  } else {
    return <AnimatedSprite anchor={0.5} angle={rot} isPlaying={playing} initialFrame={3} animationSpeed={0.1} textures={noteTextures[`${dir}_${color}`]} x={x + arrowSize / 2} y={y + arrowSize / 2} height={arrowSize} width={arrowSize} />;
  }
};

