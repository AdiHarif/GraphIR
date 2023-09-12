
import { VertexBase, VertexCategory, VertexKind } from "./vertex";
import { DataVertex, PhiVertex } from "./data_vertex";
import { VertexVisitor } from "./vertex_visitor";
import { Edge, EdgeCategory } from "../edge"


export abstract class ControlVertex extends VertexBase {
    get category() { return VertexCategory.Control; }
    get label(): string { return this.kind; }
}


export interface NonInitialControlVertex extends ControlVertex {
    get previous(): NonTerminalControlVertex | undefined;
    /*@internal*/
    set previous(vertex: NonTerminalControlVertex | undefined);
}


export abstract class NonTerminalControlVertex extends ControlVertex {
    private _nextEdge?: Edge;

    constructor(next?: NonInitialControlVertex) {
        super();
        this.next = next;
    }

    public get next(): NonInitialControlVertex | undefined {
        return this._nextEdge?.target as NonInitialControlVertex | undefined;
    }

    public set next(vertex: NonInitialControlVertex | undefined) {
        if (this._nextEdge) {
            this._nextEdge.target.removeInEdge(this._nextEdge);
            (this._nextEdge.target as NonInitialControlVertex).previous = undefined;
            this._nextEdge = undefined;
        }
        if (vertex) {
            this._nextEdge = new Edge(this, vertex, 'next', EdgeCategory.Control);
            vertex.previous = this;
            vertex.pushInEdge(this._nextEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._nextEdge) {
            out.push(this._nextEdge);
        }
        return out;
    }
}

export class BlockBeginVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.BlockStart; }

    private _previous?: BranchVertex;

    public get previous(): BranchVertex | undefined {
        return this._previous;
    }

    /*@internal*/
    public set previous(vertex: BranchVertex | undefined) {
        this._previous = vertex;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitBlockBeginVertex(this);
    }
}

export class BlockEndVertex extends ControlVertex implements NonInitialControlVertex {
    get kind() { return VertexKind.BlockEnd; }

    private _nextEdge?: Edge;
    private _previous?: NonTerminalControlVertex;

    constructor(next?: MergeVertex) {
        super();
        this.next = next;
    }

    public get next(): MergeVertex | undefined {
        return this._nextEdge?.target as MergeVertex | undefined;
    }

    public set next(vertex: MergeVertex | undefined) {
        if (this._nextEdge) {
            this._nextEdge.target.removeInEdge(this._nextEdge);
            this._nextEdge = undefined;
        }
        if (vertex) {
            this._nextEdge = new Edge(this, vertex, 'next', EdgeCategory.Control);
            vertex.pushInEdge(this._nextEdge);
        }
    }

    public get previous(): NonTerminalControlVertex | undefined {
        return this._previous;
    }

    /*@internal*/
    public set previous(vertex: NonTerminalControlVertex | undefined) {
        this._previous = vertex;
    }

    get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._nextEdge) {
            out.push(this._nextEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitBlockEndVertex(this);
    }
}

export class StartVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Start; }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitStartVertex(this);
    }
}


export class ReturnVertex extends ControlVertex implements NonInitialControlVertex{
    get kind() { return VertexKind.Return; }

    private _valueEdge?: Edge;

    constructor(value?: DataVertex) {
        super();
        this.value = value;
    }

    public get value(): DataVertex | undefined {
        return this._valueEdge?.target as DataVertex | undefined;
    }

    public set value(v: DataVertex | undefined) {
        if (this._valueEdge) {
            this._valueEdge.target.removeInEdge(this._valueEdge);
            this._valueEdge = undefined;
        }
        if (v) {
            this._valueEdge = new Edge(this, v, 'value', EdgeCategory.Data);
            v.pushInEdge(this._valueEdge);
        }
    }

    private _previous?: NonTerminalControlVertex;

    public get previous(): NonTerminalControlVertex | undefined {
        return this._previous;
    }

    /*@internal*/
    public set previous(vertex: NonTerminalControlVertex | undefined) {
        this._previous = vertex;
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._valueEdge) {
            out.push(this._valueEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitReturnVertex(this);
    }
}


export class BranchVertex extends ControlVertex implements NonInitialControlVertex {
    get kind() { return VertexKind.Branch; }

    private _previous?: NonTerminalControlVertex;
    private _conditionEdge?: Edge;
    private _trueEdge?: Edge;
    private _falseEdge?: Edge;

    constructor(condition?: DataVertex, trueNext?: BlockBeginVertex, falseNext?: BlockBeginVertex) {
        super();
        this.condition = condition;
        this.trueNext = trueNext;
        this.falseNext = falseNext;
    }

    get previous(): NonTerminalControlVertex | undefined {
        return this._previous;
    }

    /*@internal*/
    set previous(vertex: NonTerminalControlVertex | undefined) {
        this._previous = vertex;
    }

    get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._conditionEdge) {
            out.push(this._conditionEdge);
        }
        if (this._trueEdge) {
            out.push(this._trueEdge);
        }
        if (this._falseEdge) {
            out.push(this._falseEdge);
        }
        return out;
    }

    get condition(): DataVertex | undefined {
        return this._conditionEdge?.target as DataVertex | undefined;
    }

    set condition(v: DataVertex | undefined) {
        if (this._conditionEdge) {
            this._conditionEdge.target.removeInEdge(this._conditionEdge);
            this._conditionEdge = undefined;
        }
        if (v) {
            this._conditionEdge = new Edge(this, v, 'condition', EdgeCategory.Data);
            v.pushInEdge(this._conditionEdge);
        }
    }

    get trueNext(): BlockBeginVertex | undefined {
        return this._trueEdge?.target as BlockBeginVertex | undefined;
    }

    set trueNext(v: BlockBeginVertex | undefined) {
        if (this._trueEdge) {
            this._trueEdge.target.removeInEdge(this._trueEdge);
            this._trueEdge = undefined;
        }
        if (v) {
            this._trueEdge = new Edge(this, v, 'true', EdgeCategory.Control);
            v.pushInEdge(this._trueEdge);
        }
    }

    get falseNext(): BlockBeginVertex | undefined {
        return this._falseEdge?.target as BlockBeginVertex | undefined;
    }

    set falseNext(v: BlockBeginVertex | undefined) {
        if (this._falseEdge) {
            this._falseEdge.target.removeInEdge(this._falseEdge);
            this._falseEdge = undefined;
        }
        if (v) {
            this._falseEdge = new Edge(this, v, 'false', EdgeCategory.Control);
            v.pushInEdge(this._falseEdge);
        }
    }

    get merge(): MergeVertex | undefined {
        return this._inEdges.filter((edge) => edge.source instanceof MergeVertex && edge.category == EdgeCategory.Association).map((edge) => edge.source as MergeVertex)[0];
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitBranchVertex(this);
    }
}


export class MergeVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Merge; }

    private _branchEdge?: Edge;

    constructor(branch?: BranchVertex, next?: NonInitialControlVertex) {
        super(next);
        this.branch = branch;
    }

    public get phiVertices(): Array<PhiVertex> {
        return this.inEdges.filter((edge) => edge.source instanceof PhiVertex).map((edge) => edge.source as PhiVertex);
    }

    public get branch(): BranchVertex | undefined {
        return this._branchEdge?.target as BranchVertex | undefined;
    }

    public set branch(v: BranchVertex | undefined) {
        if (this._branchEdge) {
            this._branchEdge.target.removeInEdge(this._branchEdge);
            this._branchEdge = undefined;
        }
        if (v) {
            this._branchEdge = new Edge(this, v, 'branch', EdgeCategory.Association);
            v.pushInEdge(this._branchEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._branchEdge) {
            out.push(this._branchEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitMergeVertex(this);
    }
}
