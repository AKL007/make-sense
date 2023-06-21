import { ILine } from "../interfaces/ILine";
import { IPoint } from "../interfaces/IPoint";

export class LineUtil {
    public static getDistanceFromLine(l: ILine, p: IPoint): number {
        if (l.start.x !== l.end.x || l.start.y !== l.end.y) {
            const nom: number = Math.abs((l.end.y - l.start.y) * p.x - (l.end.x - l.start.x) * p.y + l.end.x * l.start.y - l.end.y * l.start.x);
            const denom: number = Math.sqrt(Math.pow(l.end.y - l.start.y, 2) + Math.pow(l.end.x - l.start.x, 2));
            return nom / denom;
        }
        return null;
    }

    public static getCenter(l: ILine): IPoint {
        return {
            x: (l.start.x + l.end.x) / 2,
            y: (l.start.y + l.end.y) / 2
        }
    }

    public static getPoints(l: ILine): IPoint[] {
        return [l.start, l.end]
    }

    public static getSlope(l: ILine): number {
        const dy = (l.end.y - l.start.y)
        const dx = (l.end.x - l.start.x)
        return Math.atan2(dy, dx)
    }

    public static getLength(l: ILine): number {
        const dy = (l.end.y - l.start.y)
        const dx = (l.end.x - l.start.x)
        return Math.sqrt(dy*dy + dx*dx)
    }

    private static isCounterClockWise(p1: IPoint, p2: IPoint, p3: IPoint): boolean {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x)
    }

    // https://stackoverflow.com/a/9997374
    public static doLinesIntersect(l1: ILine, l2: ILine): boolean {
        const A = l1.start
        const B = l1.end
        const C = l2.start
        const D = l2.end
        return (this.isCounterClockWise(A, C, D) != this.isCounterClockWise(B, C, D))
            && (this.isCounterClockWise(A, B, C) != this.isCounterClockWise(A, B, D))
    }
}