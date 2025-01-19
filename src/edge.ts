
import { Vertex } from './vertex/vertex.js';
import { ControlVertex } from './vertex/control_vertex.js';


export enum EdgeCategory {
    Data = 'Data',
    Control = 'Control',
    Association = 'Association',
}

export class Edge {

    constructor(
        readonly source: Vertex,
        public target: Vertex,
        private _label: string,
        readonly category: EdgeCategory) {
    }

    public get label(): string {
        return this._label;
    }

    public set label(v: string) {
        this._label = v;
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
