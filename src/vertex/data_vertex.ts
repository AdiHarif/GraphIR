
import ts from 'typescript';
import * as irType from '../type/type.js';


import { Vertex, VertexBase, VertexKind, VertexCategory } from './vertex.js';
import { StartVertex, ControlVertex, MergeVertex } from './control_vertex.js';
import { VertexVisitor } from './vertex_visitor.js';
import { Edge, PhiEdge, EdgeCategory } from '../edge.js';

export type Value = number | string | boolean | null | undefined
export type Operator = string

export abstract class DataVertex extends VertexBase {
    get category() { return VertexCategory.Data; }

    public verifiedType?: irType.Type;

    constructor(readonly declaredType: ts.Type) {
        super();
    }
}

export class LiteralVertex extends DataVertex {
    get kind() { return VertexKind.Literal; }

    constructor(readonly value: Value, type: ts.Type) {
        super(type);
    }

    public get label(): string {
        return String(this.value);
    }

    public get inEdges(): Array<Edge> {
        return this._inEdges;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitLiteralVertex(this);
    }
}

export class StaticSymbolVertex extends DataVertex {
    get kind() { return VertexKind.Symbol; }

    private _startEdge?: Edge;
    private _parameterEdges: Array<Edge> = [];

    constructor(readonly name: string, type: ts.Type, startVertex?: StartVertex, parameters?: Array<ParameterVertex>) {
        super(type);
        this.startVertex = startVertex;
        if (parameters !== undefined) {
            parameters.forEach((parameter) => this.addParameter(parameter));
        }
    }

    public get startVertex(): StartVertex | undefined {
        return this._startEdge?.target as StartVertex | undefined;
    }

    public set startVertex(v: StartVertex | undefined) {
        if (this._startEdge) {
            (this._startEdge.target as VertexBase).removeInEdge(this._startEdge);
            this._startEdge = undefined;
        }
        if (v) {
            this._startEdge = new Edge(this, v, 'start', EdgeCategory.Association);
            v.pushInEdge(this._startEdge);
        }
    }

    public get label(): string {
        return `#${this.name}`;
    }

    public addParameter(parameter: ParameterVertex) {
        this._parameterEdges.push(new Edge(this, parameter, String(this._parameterEdges.length), EdgeCategory.Association));
    }

    public get parameters(): Array<ParameterVertex> {
        return this._parameterEdges.map(edge => edge.target as ParameterVertex);
    }


    public get outEdges(): Array<Edge> {
        if (this._startEdge) {
            return [ this._startEdge, ...this._parameterEdges ];
        }
        else {
            return [];
        }
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitStaticSymbolVertex(this);
    }
}

export class ParameterVertex extends DataVertex {
    get kind() { return VertexKind.Parameter; }

    constructor(readonly position: number, type: ts.Type) {
        super(type);
    }

    public get label(): string {
        return `Parameter #${this.position}`;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitParameterVertex(this);
    }
}

export abstract class UnaryOperationVertex extends DataVertex {

    private _operandEdge?: Edge;

    constructor(readonly operator: Operator, type: ts.Type, operand?: DataVertex) {
        super(type);
        this.operand = operand;
    }

    public get operand(): DataVertex | undefined {
        return this._operandEdge?.target as DataVertex | undefined;
    }

    public set operand(v: DataVertex | undefined) {
        if (this._operandEdge) {
            (this._operandEdge.target as VertexBase).removeInEdge(this._operandEdge);
            this._operandEdge = undefined;
        }
        if (v) {
            this._operandEdge = new Edge(this, v, 'operand', EdgeCategory.Data);
            v.pushInEdge(this._operandEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = [];
        if (this._operandEdge) {
            out.push(this._operandEdge);
        }
        return out;
    }
}

export class PrefixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PrefixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Prefix)`;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitPrefixUnaryOperationVertex(this);
    }
}

export class PostfixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PostfixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Postfix)`;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitPostfixUnaryOperationVertex(this);
    }
}

export class BinaryOperationVertex extends DataVertex {
    get kind() { return VertexKind.BinaryOperation; }

    private _leftEdge?: Edge;
    private _rightEdge?: Edge;

    constructor(readonly operator: Operator, type: ts.Type, left?: DataVertex, right?: DataVertex) {
        super(type);
        this.left = left;
        this.right = right;
    }

    public get label(): string {
        return String(this.operator);
    }

    public get left(): DataVertex | undefined {
        return this._leftEdge?.target as DataVertex | undefined;
    }

    public set left(v: DataVertex | undefined) {
        if (this._leftEdge) {
            (this._leftEdge.target as VertexBase).removeInEdge(this._leftEdge);
            this._leftEdge = undefined;
        }
        if (v) {
            this._leftEdge = new Edge(this, v, 'left', EdgeCategory.Data);
            v.pushInEdge(this._leftEdge);
        }
    }

    public get right(): DataVertex | undefined {
        return this._rightEdge?.target as DataVertex | undefined;
    }

    public set right(v: DataVertex | undefined) {
        if (this._rightEdge) {
            (this._rightEdge.target as VertexBase).removeInEdge(this._rightEdge);
            this._rightEdge = undefined;
        }
        if (v) {
            this._rightEdge = new Edge(this, v, 'right', EdgeCategory.Data);
            v.pushInEdge(this._rightEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = [];
        if (this._leftEdge) {
            out.push(this._leftEdge);
        }
        if (this._rightEdge) {
            out.push(this._rightEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitBinaryOperationVertex(this);
    }
}

export type PhiOperand = {value: DataVertex, srcBranch: ControlVertex};

export class PhiVertex extends DataVertex {
    get kind() { return VertexKind.Phi; }

    private _operandEdges: Array<PhiEdge> = [];
    private _mergeEdge?: Edge;

    constructor(type: ts.Type ,merge?: MergeVertex, operands?: Array<PhiOperand>) {
        super(type);
        this.merge = merge;
        if (operands !== undefined) {
            operands.forEach((operand) => this.addOperand(operand));
        }
    }

    public get merge(): MergeVertex | undefined {
        return this._mergeEdge?.target as MergeVertex | undefined;
    }

    public set merge(v: MergeVertex | undefined) {
        if (this._mergeEdge) {
            (this._mergeEdge.target as VertexBase).removeInEdge(this._mergeEdge);
            this._mergeEdge = undefined;
        }
        if (v) {
            this._mergeEdge = new Edge(this, v, 'merge', EdgeCategory.Association);
            v.pushInEdge(this._mergeEdge);
        }
    }

    public get label(): string {
        return 'Phi';
    }

    addOperand(operand: PhiOperand) {
        this._operandEdges.push(new PhiEdge(this, operand.value, operand.srcBranch, EdgeCategory.Data));

    }

    public get operands(): Array<PhiOperand> {
        return this._operandEdges.map(edge =>
            ({ value: edge.target as DataVertex, srcBranch: edge.srcBranch })
        );
    }

    public get outEdges(): Array<Edge> {
        const out: Array<Edge> = [...this._operandEdges];
        if (this._mergeEdge) {
            out.push(this._mergeEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitPhiVertex(this);
    }
}
