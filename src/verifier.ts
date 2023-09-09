
import assert from 'assert';

import { Graph } from './graph';
import { VertexVisitor } from './vertex_visitor';
import * as vertex from './vertex';
import * as edge from './edge';

class VertexVerifier implements VertexVisitor<boolean> {

    private static verifyNonterminalControlVertex(vertex: vertex.NonTerminalControlVertex): boolean {
        return vertex.next !== undefined;
    }

    visitLiteralVertex(vertex: vertex.LiteralVertex): boolean {
        return true;
    }

    visitSymbolVertex(vertex: vertex.SymbolVertex): boolean{
        return vertex.name !== undefined && vertex.startVertex !== undefined;
    }

    visitParameterVertex(vertex: vertex.ParameterVertex): boolean {
        return vertex.position !== undefined;
    }

    visitPrefixUnaryOperationVertex(vertex: vertex.PrefixUnaryOperationVertex): boolean {
        return vertex.operator !== undefined && vertex.operand !== undefined;
    }

    visitPostfixUnaryOperationVertex(vertex: vertex.PostfixUnaryOperationVertex): boolean {
        return vertex.operator !== undefined && vertex.operand !== undefined;
    }

    visitBinaryOperationVertex(vertex: vertex.BinaryOperationVertex): boolean {
        return vertex.operator !== undefined && vertex.left !== undefined && vertex.right !== undefined;
    }

    visitPhiVertex(vertex: vertex.PhiVertex): boolean {
        return vertex.merge !== undefined && vertex.outEdges.some(e => e instanceof edge.PhiEdge);
    }

    visitStartVertex(vertex: vertex.StartVertex): boolean {
        return true;
    }

    visitPassVertex(vertex: vertex.PassVertex): boolean {
        return true;
    }

    visitReturnVertex(vertex: vertex.ReturnVertex): boolean {
        return true;
    }

    visitBranchVertex(vertex: vertex.BranchVertex): boolean {
        return vertex.condition !== undefined
            && vertex.trueNext !== undefined
            && vertex.falseNext !== undefined;
    }

    visitMergeVertex(vertex: vertex.MergeVertex): boolean {
        return vertex.branch !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(vertex);
    }

    visitAllocationVertex(vertex: vertex.AllocationVertex): boolean {
        return VertexVerifier.verifyNonterminalControlVertex(vertex);
    }

    visitStoreVertex(vertex: vertex.StoreVertex): boolean {
        return vertex.object !== undefined
            && vertex.property !== undefined
            && vertex.value !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(vertex);
    }

    visitLoadVertex(vertex: vertex.LoadVertex): boolean {
        return vertex.object !== undefined
            && vertex.property !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(vertex);
    }

    visitCallVertex(vertex: vertex.CallVertex): boolean {
        return vertex.callee !== undefined
            && vertex.args !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(vertex);
    }

}

const vertexVerifier = new VertexVerifier();

export function verifyGraph(graph: Graph): boolean {
    if (graph.getStartVertex() === undefined) {
        return false;
    }

    for (const vertex of graph.vertices) {
        assert(vertex.id !== undefined);
        if (!vertex.accept(vertexVerifier)) {
            return false;
        }
    }

    for (const subgraph of graph.subgraphs) {
        if (!verifyGraph(subgraph)) {
            return false;
        }
    }

    return true;
}