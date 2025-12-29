import { _decorator, BoxCollider2D, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

export interface ParamEquation {
    a: number,
    b: number,
    c: number
}
@ccclass('MColliderTransformSys')
export class MColliderTransformSys {
    private static instance: MColliderTransformSys = null;
    public static get Instance() {
        if (this.instance == null) {
            this.instance = new MColliderTransformSys();
        }
        return this.instance;
    }

    //#region base func
    public getVector(p1: Vec3, p2: Vec3): Vec2 {
        return new Vec2(p2.x - p1.x, p2.y - p1.y);
    }

    // Lấy vector pháp tuyến (vuông góc)
    public getNormal(vector: Vec2): Vec2 {
        return new Vec2(-vector.y, vector.x);
    }

    // Chiếu một điểm lên một trục
    public project(axis: Vec2, point: Vec2): number {
        return this.dotProduct(axis, point);
    }

    // Tính tích vô hướng của hai vector
    public dotProduct(v1: Vec2, v2: Vec2): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    // Kiểm tra xem hai đoạn có chồng lấn không
    public isOverlap(min1: number, max1: number, min2: number, max2: number): boolean {
        return !(min1 > max2 || min2 > max1);
    }

    //#endregion base func

    //======================================
    //======================================
    //======================================
    //======================================

    public CheckColliderBetweenTwoUITransform(ui1: UITransform, angleUI1: number, ui2: UITransform, angleUI2: number): boolean {
        let boundingBoxOfUI1 = ui1.getBoundingBoxToWorld();
        let boundingBoxOfUI2 = ui2.getBoundingBoxToWorld();
        return boundingBoxOfUI1.intersects(boundingBoxOfUI2);
    }

    //======================================
    //======================================
    //======================================
    //======================================
    // Separating Axis Theorem (Quick SAT)
    public doPolygonsIntersect(poly1: Vec3[], poly2: Vec3[]): boolean {
        // Lấy các cạnh của cả hai đa giác
        const edges: Vec2[] = [];

        // Thêm các cạnh của đa giác 1
        for (let i = 0; i < poly1.length; i++) {
            const point1 = poly1[i];
            const point2 = poly1[(i + 1) % poly1.length];
            edges.push(this.getVector(point1, point2));
        }

        // Thêm các cạnh của đa giác 2
        for (let i = 0; i < poly2.length; i++) {
            const point1 = poly2[i];
            const point2 = poly2[(i + 1) % poly2.length];
            edges.push(this.getVector(point1, point2));
        }

        // Kiểm tra từng trục pháp tuyến
        for (const edge of edges) {
            const axis = this.getNormal(edge);

            // Chiếu đa giác 1 lên trục
            let min1 = Infinity;
            let max1 = -Infinity;
            for (const point of poly1) {
                const projection = this.project(axis, new Vec2(point.x, point.y));
                min1 = Math.min(min1, projection);
                max1 = Math.max(max1, projection);
            }

            // Chiếu đa giác 2 lên trục
            let min2 = Infinity;
            let max2 = -Infinity;
            for (const point of poly2) {
                const projection = this.project(axis, new Vec2(point.x, point.y));
                min2 = Math.min(min2, projection);
                max2 = Math.max(max2, projection);
            }

            // Nếu có một trục không chồng lấn -> không giao nhau
            if (!this.isOverlap(min1, max1, min2, max2)) {
                return false;
            }
        }

        // Nếu tất cả các trục đều chồng lấn -> có giao nhau
        return true;
    }

    //======================================
    //======================================
    //======================================
    //======================================
    //CHECK E WAS IN tứ giác ABCD or not
    private getTriangleArea(A: Vec3, B: Vec3, C: Vec3): number {
        return Math.abs((A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2);
    }
    private isPointInTriangle(A: Vec3, B: Vec3, C: Vec3, pointCheck: Vec3): boolean {
        // Tính diện tích của tam giác lớn
        const totalArea = this.getTriangleArea(A, B, C);

        // Tính diện tích của 3 tam giác nhỏ được tạo bởi điểm cần kiểm tra
        const area1 = this.getTriangleArea(pointCheck, A, B);
        const area2 = this.getTriangleArea(pointCheck, B, C);
        const area3 = this.getTriangleArea(pointCheck, C, A);

        // Điểm nằm trong tam giác nếu tổng diện tích 3 tam giác nhỏ bằng diện tích tam giác lớn
        // Thêm hệ số epsilon để xử lý sai số của số thực
        const epsilon = 0.00001;
        return Math.abs(totalArea - (area1 + area2 + area3)) < epsilon;
    }

    private isPointInQuadrilateral(A: Vec3, B: Vec3, C: Vec3, D: Vec3, E: Vec3): boolean {
        return this.isPointInTriangle(A, B, C, E) && this.isPointInTriangle(A, C, D, E);
    }

    public CheckTwoNodeIsCollider(verticle1: Vec3[], vertices2: Vec3[]): boolean {
        console.log("data Check ", ...Array.from(arguments));

        let isCollider: boolean = false;
        for (let i = 0; i < verticle1.length; i++) {
            if (this.isPointInQuadrilateral(vertices2[0], vertices2[1], vertices2[2], vertices2[3], verticle1[i])) {
                isCollider = true;
                break;
            }
        }
        if (isCollider) return true;
        for (let i = 0; i < vertices2.length; i++) {
            if (this.isPointInQuadrilateral(verticle1[0], verticle1[1], verticle1[2], verticle1[3], vertices2[i])) {
                isCollider = true;
                break;
            }
        }
        return isCollider;
    }

    //======================================
    //======================================
    //======================================
    //======================================
    private getCustomBoundingBox(points: Vec3[]): { minX: number, minY: number, maxX: number, maxY: number } {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const point of points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        return {
            minX,
            minY,
            maxX,
            maxY
        };
    }


    public CheckTwoRectanglesIntersect(rect1: Vec3[], rect2: Vec3[]): boolean {
        const box1 = this.getCustomBoundingBox(rect1);
        const box2 = this.getCustomBoundingBox(rect2);

        if (box1.maxX < box2.minX || box1.minX > box2.maxX) return false;
        if (box1.maxY < box2.minY || box1.minY > box2.maxY) return false;

        return true;
    }
}


