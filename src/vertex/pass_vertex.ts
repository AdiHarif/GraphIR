
import ts from 'typescript';

import { Vertex, VertexCategory, VertexKind } from './vertex.js';
import { NonTerminalControlVertex, NonInitialControlVertex } from './control_vertex.js';
import { DataVertex, StaticSymbolVertex } from './data_vertex.js';
import { VertexVisitor } from './vertex_visitor.js';
import { Edge, EdgeCategory } from '../edge.js';
import { Type } from '../module_exports.js';

export class PassVertex extends NonTerminalControlVertex implements NonInitialControlVertex {
    get kind() { return VertexKind.Pass; }

    private _previous?: NonTerminalControlVertex = undefined;

    public get previous(): NonTerminalControlVertex | undefined {
        return this._previous;
    }

    /*@internal*/
    public set previous(vertex: NonTerminalControlVertex | undefined) {
        this._previous = vertex;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitPassVertex(this);
    }
}


export abstract class CompoundVertex extends PassVertex implements DataVertex {
    get category() { return VertexCategory.Compound; }

    public verifiedType?: Type;

    readonly declaredType: ts.Type;

    constructor(type: ts.Type, next?: NonInitialControlVertex) {
        super(next);
        this.declaredType = type;
    }
}


export class AllocationVertex extends CompoundVertex {
    get kind() { return VertexKind.Allocation; }

    private _callee?: Edge;
    private _argsEdges: Array<Edge> = [];

    constructor(type: ts.Type, callee?: DataVertex, args?: Array<DataVertex>, next?: NonInitialControlVertex) {
        super(type, next);
        this.callee = callee;
        args?.forEach(arg => this.pushArg(arg));
    }

    public get callee(): DataVertex | undefined {
        return this._callee?.target as DataVertex | undefined;
    }

    public set callee(v: DataVertex | undefined) {
        if (this._callee) {
            this._callee.target.removeInEdge(this._callee);
            this._callee = undefined;
        }
        if (v) {
            this._callee = new Edge(this, v, 'callee', EdgeCategory.Data);
            v.pushInEdge(this._callee);
        }
    }

    public get args(): Array<DataVertex> | undefined {
        return this._argsEdges.map(e => e.target as DataVertex);
    }

    public pushArg(arg: DataVertex) {
        const e = new Edge(this, arg, String(this._argsEdges.length), EdgeCategory.Data);
        this._argsEdges.push(e);
        arg.pushInEdge(e);
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._callee) {
            out.push(this._callee);
        }
        this._argsEdges.forEach(e => out.push(e));
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitAllocationVertex(this);
    }
}

export class StoreVertex extends PassVertex {
    get kind() { return VertexKind.Store; }

    private _objectEdge?: Edge;
    private _propertyEdge?: Edge;
    private _valueEdge?: Edge;

    constructor(object?: DataVertex, property?: DataVertex, value?: DataVertex, next?: NonInitialControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
        this.value = value;
    }

    public get object(): DataVertex | undefined {
        return this._objectEdge?.target as DataVertex | undefined;
    }

    public set object(v: DataVertex | undefined) {
        if (this._objectEdge) {
            (this._objectEdge.target as Vertex).removeInEdge(this._objectEdge);
            this._objectEdge = undefined;
        }
        if (v) {
            this._objectEdge = new Edge(this, v, 'object', EdgeCategory.Data);
            v.pushInEdge(this._objectEdge);
        }
    }

    public get property(): DataVertex | undefined {
        return this._propertyEdge?.target as DataVertex | undefined;
    }

    public set property(v: DataVertex | undefined) {
        if (this._propertyEdge) {
            (this._propertyEdge.target as Vertex).removeInEdge(this._propertyEdge);
            this._propertyEdge = undefined;
        }
        if (v) {
            this._propertyEdge = new Edge(this, v, 'property', EdgeCategory.Data);
            v.pushInEdge(this._propertyEdge);
        }
    }

    public get value(): DataVertex | undefined {
        return this._valueEdge?.target as DataVertex | undefined;
    }

    public set value(v: DataVertex | undefined) {
        if (this._valueEdge) {
            (this._valueEdge.target as Vertex).removeInEdge(this._valueEdge);
            this._valueEdge = undefined;
        }
        if (v) {
            this._valueEdge = new Edge(this, v, 'value', EdgeCategory.Data);
            v.pushInEdge(this._valueEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._objectEdge) {
            out.push(this._objectEdge);
        }
        if (this._propertyEdge) {
            out.push(this._propertyEdge);
        }
        if (this._valueEdge) {
            out.push(this._valueEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitStoreVertex(this);
    }
}


export class LoadVertex extends CompoundVertex {
    public get kind() { return VertexKind.Load; }

    private _objectEdge?: Edge;
    private _propertyEdge?: Edge;

    constructor(type: ts.Type, object?: DataVertex, property?: DataVertex, next?: NonInitialControlVertex) {
        super(type, next);
        this.object = object;
        this.property = property;
    }

    public get object(): DataVertex | undefined {
        return this._objectEdge?.target as DataVertex | undefined;
    }

    public set object(v: DataVertex | undefined) {
        if (this._objectEdge) {
            (this._objectEdge.target as Vertex).removeInEdge(this._objectEdge);
            this._objectEdge = undefined;
        }
        if (v) {
            this._objectEdge = new Edge(this, v, 'object', EdgeCategory.Data);
            v.pushInEdge(this._objectEdge);
        }
    }

    public get property(): DataVertex | undefined {
        return this._propertyEdge?.target as DataVertex | undefined;
    }

    public set property(v: DataVertex | undefined) {
        if (this._propertyEdge) {
            (this._propertyEdge.target as Vertex).removeInEdge(this._propertyEdge);
            this._propertyEdge = undefined;
        }
        if (v) {
            this._propertyEdge = new Edge(this, v, 'property', EdgeCategory.Data);
            v.pushInEdge(this._propertyEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._objectEdge) {
            out.push(this._objectEdge);
        }
        if (this._propertyEdge) {
            out.push(this._propertyEdge);
        }
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitLoadVertex(this);
    }
}


export class CallVertex extends CompoundVertex {
    public get kind() { return VertexKind.Call; }

    private _calleeEdge?: Edge;
    private _argsEdges: Array<Edge> = [];
    private _callerObjectEdge?: Edge;

    constructor(type: ts.Type, callee?: DataVertex, args?: Array<DataVertex>, callerObject?: DataVertex, next?: NonInitialControlVertex) {
        super(type, next);
        this.callee = callee;
        args?.forEach(arg => this.pushArg(arg));
        this.callerObject = callerObject;
    }

    public get callee(): DataVertex | undefined {
        return this._calleeEdge?.target as DataVertex | undefined;
    }

    public set callee(v: DataVertex | undefined) {
        if (this._calleeEdge) {
            (this._calleeEdge.target as Vertex).removeInEdge(this._calleeEdge);
            this._calleeEdge = undefined;
        }
        if (v) {
            this._calleeEdge = new Edge(this, v, 'callee', EdgeCategory.Data);
            v.pushInEdge(this._calleeEdge);
        }
    }

    public get args(): Array<DataVertex> | undefined {
        return this._argsEdges.map(e => e.target as DataVertex);
    }

    public pushArg(arg: DataVertex) {
        const e = new Edge(this, arg, String(this._argsEdges.length), EdgeCategory.Data);
        this._argsEdges.push(e);
        arg.pushInEdge(e);
    }

    public unshiftArg(arg: DataVertex) {
        const e = new Edge(this, arg, "0", EdgeCategory.Data);
        this._argsEdges.unshift(e);
        this._argsEdges.forEach((e, i) => e.label = String(i));
        arg.pushInEdge(e);
    }

    public setArg(index: number, arg: DataVertex) {
        if (index < 0 || index >= this._argsEdges.length) {
            throw new Error('Index out of bounds');
        }
        const old = this._argsEdges[index];
        old.target.removeInEdge(old);
        this._argsEdges[index] = new Edge(this, arg, String(index), EdgeCategory.Data);
        arg.pushInEdge(this._argsEdges[index]);
    }

    public get callerObject(): DataVertex | undefined {
        return this._callerObjectEdge?.target as DataVertex | undefined;
    }

    public set callerObject(v: DataVertex | undefined) {
        if (this._callerObjectEdge) {
            (this._callerObjectEdge.target as Vertex).removeInEdge(this._callerObjectEdge);
            this._callerObjectEdge = undefined;
        }
        if (v) {
            this._callerObjectEdge = new Edge(this, v, 'callerObject', EdgeCategory.Data);
            v.pushInEdge(this._callerObjectEdge);
        }
    }

    public get outEdges(): Array<Edge> {
        const out = super.outEdges;
        if (this._calleeEdge) {
            out.push(this._calleeEdge);
        }
        if (this._callerObjectEdge) {
            out.push(this._callerObjectEdge);
        }
        this._argsEdges.forEach(e => out.push(e));
        return out;
    }

    accept<T>(visitor: VertexVisitor<T>): T {
        return visitor.visitCallVertex(this);
    }
}
