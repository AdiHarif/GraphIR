
import * as csv_writer from 'csv-writer'
import { Graph } from '../graph'

export async function exportIrToRelations(graph: Graph, dir: string) {
    const verticesPath = `${dir}/vertices.facts`
    const verticesWriter = csv_writer.createArrayCsvWriter({path: verticesPath})
    const edgesPath = `${dir}/edges.facts`
    const edgesWriter = csv_writer.createArrayCsvWriter({path: edgesPath})

    const vertices: Array<Array<any>> = [];
    const edges: Array<Array<any>> = [];

    graph.vertices.forEach(v => {
        vertices.push([ v.id, v.kind, v.category, v.label ]);
        edges.push(...v.outEdges.map(e=> [ e.source.id, e.target!.id, e.category, e.label ]));
    })
    await Promise.all([
        await verticesWriter.writeRecords(vertices),
        await edgesWriter.writeRecords(edges)
    ]);



}
