
import * as ts from 'typescript';

import { Vertex, VertexBase } from './vertex/vertex.js';
import { StartVertex } from './vertex/control_vertex.js';
import * as irType from './type/type.js';
export class Graph {
    public readonly vertices: Array<Vertex> = [];
    private startVertex?: StartVertex;
    public readonly subgraphs: Array<Graph> = [];

    public declaredType?: ts.Type;
    public verifiedType?: irType.Type;

    public jsDocTags: { [key: string]: string } = {};

    constructor(vertices?: Array<Vertex>, startVertex?: StartVertex, subgraphs?: Array<Graph>) {
        if (vertices !== undefined) {
            this.vertices = vertices;
        }

        if (startVertex !== undefined) {
            this.startVertex = startVertex;
        }

        if (subgraphs !== undefined) {
            this.subgraphs = subgraphs;
        }

        this.reEnumerate(0);
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

    private reEnumerate(start_index: number): number {
        let index = start_index;
        this.vertices.forEach(vertex => {
            (vertex as VertexBase)._id = index++;
        });
        this.subgraphs.forEach(subgraph => {
            index = subgraph.reEnumerate(index);
        });
        return index;
    }
}
