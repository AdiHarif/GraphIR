
import { Vertex } from './vertex/base_vertex.js';
import { ControlVertex } from './vertex.js';


export enum EdgeCategory {
    Data = 'Data',
    Control = 'Control',
    Association = 'Association',
}

export class Edge {

    constructor(
        readonly source: Vertex,
        readonly target: Vertex,
        private _label: string,
        readonly category: EdgeCategory) {
    }

    public get label(): string {
        return this._label;
    }
}

export class PhiEdge extends Edge {

    constructor(source: Vertex, target: Vertex, readonly srcBranch: ControlVertex, category: EdgeCategory) {
        super(source, target, '', category);
    }

    public get label(): string {
        return String(this.srcBranch?.id);
    }
}
