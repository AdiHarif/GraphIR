
import * as fs from 'fs/promises'

import * as gviz from 'ts-graphviz'

import { Graph } from '../graph.js'
import { VertexCategory } from '../vertex.js'
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

function irToModel(graph: Graph): gviz.Digraph {
    const digraph = new gviz.Digraph()

    graph.vertices.forEach((v, id) => {
        digraph.createNode(
            String(id),
            {
                label: `${id} | ${v.label}`,
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

export function exportIrToDot(graph: Graph, outDir: string) {
    const outString: string =  gviz.toDot(irToModel(graph))
    fs.writeFile(`${outDir}/graph.dot`, outString);
}
