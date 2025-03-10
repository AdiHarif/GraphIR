
import * as fs from 'fs/promises'

import * as gviz from 'ts-graphviz'

import { Graph } from '../graph.js'
import { VertexCategory } from '../vertex/vertex.js'
import { EdgeCategory } from '../edge.js'

const vertexCategoryToShape = new Map<VertexCategory, string>([
    [ VertexCategory.Control, 'diamond' ],
    [ VertexCategory.Data, 'rectangle' ],
    [ VertexCategory.Compound, 'Mdiamond' ],
]);

const edgeCategoryToShape = new Map<EdgeCategory, gviz.ArrowType>([
    [ EdgeCategory.Control, 'normal' ],
    [ EdgeCategory.Data, 'onormal' ],
    [ EdgeCategory.Association, 'vee' ],
]);

let clusterId = 0;
function irToModel(graph: Graph): gviz.Subgraph {
    const currentCluster = clusterId++;
    const digraph = new gviz.Subgraph(`cluster_${currentCluster}`, { style: 'dotted' });

    graph.subgraphs.forEach(subgraph => {
        digraph.addSubgraph(irToModel(subgraph));
    });

    graph.vertices.forEach((v) => {
        digraph.createNode(
            String(v.id),
            {
                label: `${v.id} | ${v.label}`,
                shape: vertexCategoryToShape.get(v.category)
            }
        );

        v.outEdges.forEach(e => {
            digraph.createEdge(
                [ String(e.source.id), String(e.target!.id) ],
                {
                    label: e.label,
                    arrowhead: edgeCategoryToShape.get(e.category),
                    style: e.category == EdgeCategory.Association ? 'dashed' : undefined,
                }
            )
        });
    })

    return digraph
}

export async function exportIrToDot(graph: Graph, outDir: string) {
    const dotGraph = new gviz.Digraph()
    dotGraph.addSubgraph(irToModel(graph));
    const outString: string =  gviz.toDot(dotGraph);
    await fs.writeFile(`${outDir}/graph.dot`, outString);
}
