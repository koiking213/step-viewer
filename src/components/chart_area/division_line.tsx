import {Text, Container} from "@inlet/react-pixi";
import {Rectangle} from "./rectangle"
type DivisionLineProps = {y: number, division: number, arrowSize: number, divisionNumSpace: number};
export const DivisionLine = ({y, division, arrowSize, divisionNumSpace}: DivisionLineProps) => {
        const textXOfs = 8;
        const textYOfs = 8;
         return (
                <Container position={[textXOfs,y-textYOfs]}>
                        <Rectangle x={divisionNumSpace-textXOfs} y={textYOfs} color={0xffffff} height={1} width={arrowSize*4} />
                        <Text text={division.toString()} style={{fontSize:12, fill:"white"}}/>
                </Container>
         )
}