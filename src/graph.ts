
import { Vertex, VertexBase, StartVertex } from './vertex/vertex.js';

export class Graph {
    public readonly vertices: Array<Vertex> = [];
    private startVertex?: StartVertex;
    public readonly subgraphs: Array<Graph> = [];

    constructor(vertices?: Array<Vertex>, startVertex?: StartVertex, subgraphs?: Array<Graph>) {
        if (vertices !== undefined) {
            this.vertices = vertices;
            this.vertices.forEach((vertex, id) => (vertex as VertexBase)._id = id);
        }

        if (startVertex !== undefined) {
            this.startVertex = startVertex;
        }

        if (subgraphs !== undefined) {
            this.subgraphs = subgraphs;
        }
    }

    public addVertex(vertex: Vertex): void {
        (vertex as VertexBase)._id = this.vertices.length;
        this.vertices.push(vertex); //TODO: check if vertex already exists
    }

    public addSubgraph(subgraph: Graph): void {
        this.subgraphs.push(subgraph); //TODO: check for cycles
    }

    public setStartVertex(vertex: StartVertex): void {
        this.startVertex = vertex;
        this.addVertex(vertex);
    }

    public getStartVertex(): StartVertex {
        return this.startVertex!;
    }
}

export * from './vertex/vertex.js';
export * from './vertex/vertex_visitor.js';
export * from './edge.js';
export * from './output/relations.js';
export * from './output/dot.js';
export * from './verifier.js'
export * from './types.js'
