import {IRect} from '../interfaces/IRect';
import {IPoint} from '../interfaces/IPoint';
import {ISize} from '../interfaces/ISize';
import {RectAnchor} from '../data/RectAnchor';
import {NumberUtil} from './NumberUtil';
import {Direction} from '../data/enums/Direction';
import { LineUtil } from './LineUtil';

export class RectUtil {
    public static getRatio(rect: IRect): number {
        if (!rect) return null;

        return rect.width/rect.height
    }

    public static intersect(r1: IRect, r2: IRect) {
        if (!r1 || !r2) return null;
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }

    public static isPointInside(rect: IRect, point: IPoint): boolean {
        if (!rect || !point) return null;
        return (
            rect.x <= point.x &&
            rect.x + rect.width >= point.x &&
            rect.y <= point.y &&
            rect.y + rect.height >= point.y
        )
    }

    public static getRectWithCenterAndSize(centerPoint: IPoint, size: ISize): IRect {
        return {
            x: centerPoint.x - 0.5 * size.width,
            y: centerPoint.y - 0.5 * size.height,
            ...size
        }
    }

    public static fitInsideRectWithRatio(containerRect: IRect, ratio: number): IRect {
        const containerRectRatio = RectUtil.getRatio(containerRect);
        if (containerRectRatio < ratio) {
            const innerRectHeight = containerRect.width / ratio;
            return {
                x: containerRect.x,
                y: containerRect.y + (containerRect.height - innerRectHeight) / 2,
                width: containerRect.width,
                height: innerRectHeight
            }
        }
        else {
            const innerRectWidth = containerRect.height * ratio;
            return {
                x: containerRect.x + (containerRect.width - innerRectWidth) / 2,
                y: containerRect.y,
                width: innerRectWidth,
                height: containerRect.height
            }
        }
    }

    public static resizeRect(inputRect: IRect, rectAnchor: Direction, delta): IRect {
        const rect: IRect = {...inputRect};
        switch (rectAnchor) {
            case Direction.RIGHT:
                rect.width += delta.x;
                break;
            case Direction.BOTTOM_RIGHT:
                rect.width += delta.x;
                rect.height += delta.y;
                break;
            case Direction.BOTTOM:
                rect.height += delta.y;
                break;
            case Direction.TOP_RIGHT:
                rect.width += delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.TOP:
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.TOP_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                break;
            case Direction.BOTTOM_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.height += delta.y;
                break;
        }

        if (rect.width < 0) {
            rect.x = rect.x + rect.width;
            rect.width = -rect.width;
        }

        if (rect.height < 0) {
            rect.y = rect.y + rect.height;
            rect.height = -rect.height;
        }

        return rect;
    }

    public static rotateRect(rect: IRect, startAnchorPosition: IPoint, slope: number, dimension: number): IRect {
        debugger;
        const anchorSlope = LineUtil.getSlope({'start': this.getCenter(rect) , 'end': startAnchorPosition})
        const scaleFactor = 0.5
        // multiply by -1 since XY plane of image is with +Y downwards, while rect.rotation is with +ve Y upwards
        const torque = scaleFactor * dimension * Math.sin(anchorSlope - slope)
        const existingRotation = rect.rotation ? rect.rotation : 0
        const newAngle = existingRotation + torque*(2*Math.PI)/360
        return {
            ...rect,
            rotation: newAngle
        }
    }

    public static getRotatedRectVertices(rect: IRect): IPoint[] {
        if(!rect.rotation){
            rect.rotation = 0
        }
        const a = rect.width/2
        const b = rect.height/2
        const side = Math.sqrt(a*a + b*b)
        const alpha = Math.atan2(b, a)
        let rotatedVertices: IPoint[] = []
        for (let i=0; i < 4; i++){
            switch(i){
                case 0:
                    let angle1 = alpha + rect.rotation
                    rotatedVertices.push(
                        {
                            x: rect.x + rect.width/2 + (Math.cos(angle1) * side),
                            y: rect.y + rect.height/2 - (Math.sin(angle1) * side)
                        })
                    break;
                case 1:
                    let angle2 = Math.PI - alpha + rect.rotation
                    rotatedVertices.push(
                        {
                            x: rect.x + rect.width/2 + (Math.cos(angle2) * side),
                            y: rect.y + rect.height/2 - (Math.sin(angle2) * side)
                        })
                    break;
                case 2:
                    let angle3 = Math.PI + alpha + rect.rotation
                    rotatedVertices.push(
                        {
                            x: rect.x + rect.width/2 + (Math.cos(angle3) * side),
                            y: rect.y + rect.height/2 - (Math.sin(angle3) * side)
                        })
                    break;
                case 3:
                    let angle4 = -alpha + rect.rotation
                    rotatedVertices.push(
                        {
                            x: rect.x + rect.width/2 + (Math.cos(angle4) * side),
                            y: rect.y + rect.height/2 - (Math.sin(angle4) * side)
                        })
                    break;
            }
        }
        return rotatedVertices
    }

    public static translate(rect: IRect, delta: IPoint): IRect {
        return {
            ...rect,
            x: rect.x + delta.x,
            y: rect.y + delta.y
        }
    }

    public static expand(rect: IRect, delta: IPoint): IRect {
        return {
            x: rect.x - delta.x,
            y: rect.y - delta.y,
            width: rect.width + 2 * delta.x,
            height: rect.height + 2 * delta.y
        }
    }

    public static scaleRect(rect:IRect, scale: number): IRect {
        return {
            x: rect.x * scale,
            y: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
            rotation: rect.rotation
        }
    }

    public static mapRectToAnchors(rect: IRect): RectAnchor[] {
        if(!rect.rotation){
            return [
                {type: Direction.TOP_LEFT, position: {x: rect.x, y: rect.y}},
                {type: Direction.TOP, position: {x: rect.x + 0.5 * rect.width, y: rect.y}},
                {type: Direction.TOP_RIGHT, position: {x: rect.x + rect.width, y: rect.y}},
                {type: Direction.LEFT, position: {x: rect.x, y: rect.y + 0.5 * rect.height}},
                {type: Direction.RIGHT, position: {x: rect.x + rect.width, y: rect.y + 0.5 * rect.height}},
                {type: Direction.BOTTOM_LEFT, position: {x: rect.x, y: rect.y + rect.height}},
                {type: Direction.BOTTOM, position: {x: rect.x + 0.5 * rect.width, y: rect.y + rect.height}},
                {type: Direction.BOTTOM_RIGHT, position: {x: rect.x + rect.width, y: rect.y + rect.height}}
            ]
        }
        else {
            const rotatedRectVertices = this.getRotatedRectVertices(rect)
            return [
                {type: Direction.TOP_RIGHT, position: {x: rotatedRectVertices[0].x, y: rotatedRectVertices[0].y}},
                {type: Direction.TOP, position: LineUtil.getCenter({'start': rotatedRectVertices[0], 'end': rotatedRectVertices[1]})},
                {type: Direction.TOP_LEFT, position: {x: rotatedRectVertices[1].x, y: rotatedRectVertices[1].y}},
                {type: Direction.LEFT, position: LineUtil.getCenter({'start': rotatedRectVertices[1], 'end': rotatedRectVertices[2]})},
                {type: Direction.BOTTOM_LEFT, position: {x: rotatedRectVertices[2].x, y: rotatedRectVertices[2].y}},
                {type: Direction.BOTTOM, position: LineUtil.getCenter({'start': rotatedRectVertices[2], 'end': rotatedRectVertices[3]})},
                {type: Direction.BOTTOM_RIGHT, position: {x: rotatedRectVertices[3].x, y: rotatedRectVertices[3].y}},
                {type: Direction.RIGHT, position: LineUtil.getCenter({'start': rotatedRectVertices[3], 'end': rotatedRectVertices[0]})},
                
            ]
        }
        
    }

    public static snapPointToRect(point: IPoint, rect: IRect): IPoint {
        if (RectUtil.isPointInside(rect, point))
            return point;

        return {
            x: NumberUtil.snapValueToRange(point.x, rect.x, rect.x + rect.width),
            y: NumberUtil.snapValueToRange(point.y, rect.y, rect.y + rect.height)
        }
    }

    public static getCenter(rect: IRect): IPoint {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        }
    }

    public static getSize(rect: IRect): ISize {
        return {
            width: rect.width,
            height: rect.height
        }
    }

    public static getVertices(rect: IRect): IPoint[] {
        return [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ]
    }
}


