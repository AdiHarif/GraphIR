
import * as csv_writer from 'csv-writer'
import { Graph } from '../graph.js'

import { VertexKind } from '../vertex/vertex.js'
import { LiteralVertex, ParameterVertex, StaticSymbolVertex } from '../module_exports.js';

export async function writeRecordsToFiles(graph: Graph, verticesWriter: any, edgesWriter: any) {

    const vertices: Array<Array<any>> = [];
    const edges: Array<Array<any>> = [];

    graph.vertices.forEach(v => {
        let value: string;
        switch (v.kind) {
            case VertexKind.Literal:
                value = String((v as LiteralVertex).value);
                if (typeof (v as LiteralVertex).value === 'string') {
                    value = `"${value}"`;
                }
                break;
            case VertexKind.Symbol:
                value = (v as StaticSymbolVertex).name;
                break;
            case VertexKind.Parameter:
                value = String((v as ParameterVertex).position);
                break;
            default:
                value = v.label;
                break;
        }
        vertices.push([ v.id, v.kind, v.category, value ]);
        v.outEdges.map(e=> [ e.source.id, e.target!.id, e.category, e.label ]).forEach(e => edges.push(e));
    })

    await Promise.all([
        await verticesWriter.writeRecords(vertices),
        await edgesWriter.writeRecords(edges)
    ]);

    for (const subgraph of graph.subgraphs)  {
        await writeRecordsToFiles(subgraph, verticesWriter, edgesWriter);
    }
}


export async function exportIrToRelations(graph: Graph, dir: string) {
    const verticesPath = `${dir}/vertices.csv`
    const verticesWriter = csv_writer.createArrayCsvWriter({path: verticesPath, fieldDelimiter: ';'})
    const edgesPath = `${dir}/edges.csv`
    const edgesWriter = csv_writer.createArrayCsvWriter({path: edgesPath, fieldDelimiter: ';'})
    await writeRecordsToFiles(graph, verticesWriter, edgesWriter);
}
