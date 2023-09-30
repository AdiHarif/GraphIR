
import { Edge } from '../edge.js';
import { DebugInformation } from './debug_information.js';
import { VertexVisitor } from './vertex_visitor.js';

export enum VertexKind {
    Literal = 'Literal',
    Symbol = 'Symbol',
    Parameter = 'Parameter',
    PrefixUnaryOperation = 'PrefixUnaryOperation',
    PostfixUnaryOperation = 'PostfixUnaryOperation',
    BinaryOperation = 'BinaryOperation',
    Phi = 'Phi',
    BlockStart = 'BlockStart',
    BlockEnd = 'BlockEnd',
    Start = 'Start',
    Return = 'Return',
    Branch = 'Branch',
    Merge = 'Merge',
    Pass = 'Pass',
    Allocation = 'Allocation',
    Store = 'Store',
    Load = 'Load',
    Call = 'Call',
}

export enum VertexCategory {
    Data = 'Data',
    Control = 'Control',
    Compound = 'Compound'
}

export interface Vertex {
    readonly id: number;
    readonly kind: VertexKind;
    readonly category: VertexCategory;
    readonly label: string;
    readonly inEdges: Array<Edge>;
    readonly outEdges: Array<Edge>;
    readonly debugInfo: DebugInformation;

    accept<T>(visitor: VertexVisitor<T>): T;

    /*@internal*/
    _inEdges: Array<Edge>;
    /*@internal*/
    pushInEdge(edge: Edge): void;
    /*@internal*/
    removeInEdge(edge: Edge): void;
}


export abstract class VertexBase implements Vertex {
    /*@internal*/
    _inEdges: Array<Edge> = [];

    /*@internal*/
    _id: number = -1;

    get inEdges(): Array<Edge> {
        return [...this._inEdges];
    }

    get outEdges(): Array<Edge> {
        return [];
    }

    get id(): number {
        return this._id;
    }

    abstract kind: VertexKind;
    abstract category: VertexCategory;
    abstract label: string;

    abstract accept<T>(visitor: VertexVisitor<T>): T;

    debugInfo = new DebugInformation();

    /*@internal*/
    pushInEdge(edge: Edge): void {
        this._inEdges.push(edge);
    }

    /*@internal*/
    removeInEdge(edge: Edge): void {
        const index = this._inEdges.indexOf(edge);
        if (index > -1) {
            this._inEdges.splice(index, 1);
        }
    }
}
