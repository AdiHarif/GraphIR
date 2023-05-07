
import { Edge, EdgeCategory } from './edge';

export type Value = number | string | boolean
export type Operator = string

export enum VertexCategory {
    Data = 'Data',
    Control = 'Control',
    Compound = 'Compound'
}

export enum VertexKind {
    Literal = 'Literal',
    Symbol = 'Symbol',
    Parameter = 'Parameter',
    PrefixUnaryOperation = 'PrefixUnaryOperation',
    PostfixUnaryOperation = 'PostfixUnaryOperation',
    BinaryOperation = 'BinaryOperation',
    Phi = 'Phi',
    Start = 'Start',
    Pass = 'Pass',
    Return = 'Return',
    Branch = 'Branch',
    Merge = 'Merge',
    Allocation = 'Allocation',
    Store = 'Store',
    Load = 'Load',
    Call = 'Call',
}

export abstract class Vertex {
    /*@internal*/
    private _id: number = -1;

    protected _inEdges: Array<Edge> = [];

    public get inEdges(): Array<Edge> {
        return [...this._inEdges];
    }

    public get outEdges(): Array<Edge> {
        return [];
    }

    public get id(): number {
        return this._id;
    }
    /*@internal*/
    public set id(value: number) {
        this._id = value;
    }

    public abstract kind: VertexKind;
    public abstract category: VertexCategory;
    public abstract label: string;
    public abstract verify(): boolean;
}

export interface DataVertex extends Vertex {
    category: VertexCategory.Data | VertexCategory.Compound;
}

export class LiteralVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Literal; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public value?: Value;

    constructor(value?: Value) {
        super();
        this.value = value;
    }

    public get label(): string {
        return String(this.value);
    }

    public get inEdges(): Array<Edge> {
        return this._inEdges;
    }

    verify(): boolean {
        return this.value !== undefined;
    }
}

export class SymbolVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Symbol; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    private _startEdge: Edge;

    public name?: string;

    constructor(name?: string, startVertex?: StartVertex) {
        super();
        this.name = name;
        this._startEdge = { source: this, target: startVertex, label: 'start', category: EdgeCategory.Association };
    }

    public get startVertex(): StartVertex | undefined {
        return this._startEdge.target as StartVertex | undefined;
    }

    public set startVertex(v: StartVertex | undefined) {
        this._startEdge.target = v;
    }

    public get label(): string {
        return `#${this.name}`;
    }

    public get outEdges(): Array<Edge> {
        return [ this._startEdge ];
    }

    verify(): boolean {
        return this.name !== undefined && this.startVertex !== undefined;
    }
}

export class ParameterVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Parameter; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public position?: number;

    constructor(position?: number) {
        super();
        this.position = position;
    }

    public get label(): string {
        return `Parameter #${this.position}`;
    }

    verify(): boolean {
        return this.position !== undefined;
    }
}

export abstract class UnaryOperationVertex extends Vertex implements DataVertex {
    public abstract get kind(): VertexKind;
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    private _operandEdge: Edge;

    public operator?: Operator;

    constructor(operator?: Operator, operand?: DataVertex) {
        super();
        this.operator = operator;
        this._operandEdge = { source: this, target: operand, label: 'operand', category: EdgeCategory.Data };
    }

    public get operand(): DataVertex | undefined {
        return this._operandEdge.target as DataVertex | undefined;
    }

    public set operand(v: DataVertex | undefined) {
        this._operandEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [ this._operandEdge ];
    }

    verify(): boolean {
        return this.operator !== undefined && this.operand !== undefined;
    }
}

export class PrefixUnaryOperationVertex extends UnaryOperationVertex {
    public get kind() { return VertexKind.PrefixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Prefix)`;
    }
}

export class PostfixUnaryOperationVertex extends UnaryOperationVertex {
    public get kind() { return VertexKind.PostfixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Postfix)`;
    }
}

export class BinaryOperationVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.BinaryOperation; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    private _leftEdge: Edge;
    private _rightEdge: Edge;

    public operator?: Operator;

    constructor(operator?: Operator, left?: DataVertex, right?: DataVertex) {
        super();
        this.operator = operator;
        this._leftEdge = { source: this, target: left, label: 'left', category: EdgeCategory.Data };
        this._rightEdge = { source: this, target: right, label: 'right', category: EdgeCategory.Data };
    }

    public get label(): string {
        return String(this.operator);
    }

    public get left(): DataVertex | undefined {
        return this._leftEdge.target as DataVertex | undefined;
    }

    public set left(v: DataVertex | undefined) {
        this._leftEdge.target = v;
    }

    public get right(): DataVertex | undefined {
        return this._rightEdge.target as DataVertex | undefined;
    }

    public set right(v: DataVertex | undefined) {
        this._rightEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [ this._leftEdge, this._rightEdge ];
    }

    verify(): boolean {
        return this.operator !== undefined && this.left !== undefined && this.right !== undefined;
    }
}

export type PhiOperand = {value: DataVertex, srcBranch: ControlVertex};

export class PhiVertex extends Vertex implements DataVertex {
    //TODO: fit to new edges api.
    public get kind() { return VertexKind.Phi; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public readonly operands: Array<PhiOperand>;
    public merge?: MergeVertex;

    constructor(merge?: MergeVertex, operands?: Array<PhiOperand>) {
        super();
        this.merge = merge;
        if (operands !== undefined) {
            this.operands = operands;
        }
        else {
            this.operands = [];
        }
    }

    public get label(): string {
        return 'Phi';
    }

    addOperand(operand: PhiOperand) {
        this.operands.push(operand);
    }

    public get edges(): Array<Edge> {
        const out: Array<Edge> = this.operands.map((operand) => {
            return { source: this, target: operand.value, label: String(operand.srcBranch.id), category: EdgeCategory.Data }
        });
        out.push({ source: this, target: this.merge, label: 'merge', category: EdgeCategory.Association });
        return out;
    }

    verify(): boolean {
        return this.merge !== undefined && this.operands.length > 1;
    }
}

export abstract class ControlVertex extends Vertex {
    get category(): VertexCategory.Control | VertexCategory.Compound { return VertexCategory.Control; }
    get label(): string { return this.kind; }
}

export abstract class NonTerminalControlVertex extends ControlVertex {
    public abstract get kind(): VertexKind;

    private _nextEdge: Edge;

    constructor(next?: ControlVertex) {
        super();
        this._nextEdge = { source: this, target: next, label: 'next', category: EdgeCategory.Control };
    }

    public get next(): ControlVertex | undefined {
        return this._nextEdge.target as ControlVertex | undefined;
    }

    public set next(v: ControlVertex | undefined) {
        this._nextEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [ this._nextEdge ];
    }

    verify(): boolean {
        return this.next !== undefined;
    }
}

export class StartVertex extends NonTerminalControlVertex {
    public get kind() { return VertexKind.Start; }
}

export class PassVertex extends NonTerminalControlVertex {
    public get kind() { return VertexKind.Pass; }
}

export class ReturnVertex extends ControlVertex {
    public get kind() { return VertexKind.Return; }

    private _valueEdge: Edge;

    constructor(value?: DataVertex) {
        super();
        this._valueEdge = { source: this, target: value, label: 'value', category: EdgeCategory.Data };
    }

    public get value(): DataVertex | undefined {
        return this._valueEdge.target as DataVertex | undefined;
    }

    public set value(v: DataVertex | undefined) {
        this._valueEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [ this._valueEdge ];
    }

    verify(): boolean {
        return true;
    }
}

export class BranchVertex extends ControlVertex {
    public get kind() { return VertexKind.Branch; }

    private _conditionEdge: Edge;
    private _trueEdge: Edge;
    private _falseEdge: Edge;

    constructor(condition?: DataVertex, trueNext?: ControlVertex, falseNext?: ControlVertex) {
        super();
        this._conditionEdge = { source: this, target: condition, label: 'condition', category: EdgeCategory.Data };
        this._trueEdge = { source: this, target: trueNext, label: 'true', category: EdgeCategory.Control };
        this._falseEdge = { source: this, target: falseNext, label: 'false', category: EdgeCategory.Control };
    }

    public get outEdges(): Array<Edge> {
        return [ this._conditionEdge, this._trueEdge, this._falseEdge ];
    }

    public get condition(): DataVertex | undefined {
        return this._conditionEdge.target as DataVertex | undefined;
    }

    public set condition(v: DataVertex | undefined) {
        this._conditionEdge.target = v;
    }

    public get trueNext(): ControlVertex | undefined {
        return this._trueEdge.target as ControlVertex | undefined;
    }

    public set trueNext(v: ControlVertex | undefined) {
        this._trueEdge.target = v;
    }

    public get falseNext(): ControlVertex | undefined {
        return this._falseEdge.target as ControlVertex | undefined;
    }

    public set falseNext(v: ControlVertex | undefined) {
        this._falseEdge.target = v;
    }

    verify(): boolean {
        return this.condition !== undefined && this.trueNext !== undefined && this.falseNext !== undefined;
    }
}

export class MergeVertex extends NonTerminalControlVertex { // ? should add corresponding branch?
    public get kind() { return VertexKind.Merge; }
}

export class AllocationVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Allocation; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    private _constructorEdge: Edge;

    public objectType?: string;

    constructor(objectType?: string, constructorSymbol?: SymbolVertex, next?: ControlVertex) {
        super(next);
        this.objectType = objectType;
        this._constructorEdge = { source: this, target: constructorSymbol, label: 'constructor', category: EdgeCategory.Data };
    }

    public get constructorSymbol(): SymbolVertex | undefined {
        return this._constructorEdge.target as SymbolVertex | undefined;
    }

    public set constructorSymbol(v: SymbolVertex | undefined) {
        this._constructorEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [...super.outEdges, this._constructorEdge];
    }

    verify(): boolean {
        return this.objectType !== undefined && this.constructorSymbol !== undefined && super.verify();
    }
}

export class StoreVertex extends PassVertex {
    public get kind() { return VertexKind.Store; }

    private _objectEdge: Edge;
    private _propertyEdge: Edge;
    private _valueEdge: Edge;

    constructor(object?: DataVertex, property?: DataVertex, value?: DataVertex, next?: ControlVertex) {
        super(next);
        this._objectEdge = { source: this, target: object, label: 'object', category: EdgeCategory.Data };
        this._propertyEdge = { source: this, target: property, label: 'property', category: EdgeCategory.Data };
        this._valueEdge = { source: this, target: value, label: 'value', category: EdgeCategory.Data };
    }

    public get object(): DataVertex | undefined {
        return this._objectEdge.target as DataVertex | undefined;
    }

    public set object(v: DataVertex | undefined) {
        this._objectEdge.target = v;
    }

    public get property(): DataVertex | undefined {
        return this._propertyEdge.target as DataVertex | undefined;
    }

    public set property(v: DataVertex | undefined) {
        this._propertyEdge.target = v;
    }

    public get value(): DataVertex | undefined {
        return this._valueEdge.target as DataVertex | undefined;
    }

    public set value(v: DataVertex | undefined) {
        this._valueEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [...super.outEdges, this._objectEdge, this._propertyEdge, this._valueEdge];
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && this.value !== undefined && super.verify();
    }
}

export class LoadVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Load; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    private _objectEdge: Edge;
    private _propertyEdge: Edge;

    constructor(object?: DataVertex, property?: DataVertex, next?: ControlVertex) {
        super(next);
        this._objectEdge = { source: this, target: object, label: 'object', category: EdgeCategory.Data };
        this._propertyEdge = { source: this, target: property, label: 'property', category: EdgeCategory.Data };
    }

    public get object(): DataVertex | undefined {
        return this._objectEdge.target as DataVertex | undefined;
    }

    public set object(v: DataVertex | undefined) {
        this._objectEdge.target = v;
    }

    public get property(): DataVertex | undefined {
        return this._propertyEdge.target as DataVertex | undefined;
    }

    public set property(v: DataVertex | undefined) {
        this._propertyEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [...super.outEdges, this._objectEdge, this._propertyEdge];
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && super.verify();
    }
}

export class CallVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Call; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    private _calleeEdge: Edge;
    private _argsEdges: Array<Edge>;
    private _callerObjectEdge: Edge;

    constructor(callee?: DataVertex, args?: Array<DataVertex>, callerObject?: DataVertex, next?: ControlVertex) {
        super(next);
        this._calleeEdge = { source: this, target: callee, label: 'callee', category: EdgeCategory.Data };
        if (args !== undefined) {
            this._argsEdges = args.map((arg, i) => ({ source: this, target: arg, label: String(i), category: EdgeCategory.Data }));
        }
        else {
            this._argsEdges = [];
        }

        this._callerObjectEdge = { source: this, target: callerObject, label: 'object', category: EdgeCategory.Data };
    }

    public get callee(): DataVertex | undefined {
        return this._calleeEdge.target as DataVertex | undefined;
    }

    public set callee(v: DataVertex | undefined) {
        this._calleeEdge.target = v;
    }

    public get args(): Array<DataVertex> | undefined {
        return this._argsEdges.map(e => e.target as DataVertex);
    }

    //TODO: add API to add/remove args

    public get callerObject(): DataVertex | undefined {
        return this._callerObjectEdge.target as DataVertex | undefined;
    }

    public set callerObject(v: DataVertex | undefined) {
        this._callerObjectEdge.target = v;
    }

    public get outEdges(): Array<Edge> {
        return [...super.outEdges, this._calleeEdge, ...this._argsEdges, this._callerObjectEdge];
    }

    verify(): boolean {
        return this.callee !== undefined && this.args !== undefined && super.verify();
    }
}
