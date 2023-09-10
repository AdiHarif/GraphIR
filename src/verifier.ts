
import assert from 'assert';

import { Graph } from './graph';
import { VertexVisitor } from './vertex/vertex_visitor';
import * as vertex from './vertex/vertex';
import * as edge from './edge';

class VertexVerifier implements VertexVisitor<boolean> {

    private static verifyNonterminalControlVertex(v: vertex.NonTerminalControlVertex): boolean {
        return v.next !== undefined;
    }

    visitLiteralVertex(v: vertex.LiteralVertex): boolean {
        return true;
    }

    visitSymbolVertex(v: vertex.SymbolVertex): boolean{
        return v.name !== undefined && v.startVertex !== undefined;
    }

    visitParameterVertex(v: vertex.ParameterVertex): boolean {
        return v.position !== undefined;
    }

    visitPrefixUnaryOperationVertex(v: vertex.PrefixUnaryOperationVertex): boolean {
        return v.operator !== undefined && v.operand !== undefined;
    }

    visitPostfixUnaryOperationVertex(v: vertex.PostfixUnaryOperationVertex): boolean {
        return v.operator !== undefined && v.operand !== undefined;
    }

    visitBinaryOperationVertex(v: vertex.BinaryOperationVertex): boolean {
        return v.operator !== undefined && v.left !== undefined && v.right !== undefined;
    }

    visitPhiVertex(v: vertex.PhiVertex): boolean {
        return v.merge !== undefined && v.outEdges.some(e => e instanceof edge.PhiEdge);
    }

    visitBlockBeginVertex(v: vertex.BlockBeginVertex): boolean {
        return v.next !== undefined && v.previous instanceof vertex.BranchVertex;
    }

    visitBlockEndVertex(v: vertex.BlockEndVertex): boolean {
        return v.next instanceof vertex.MergeVertex && v.previous !== undefined;
    }

    visitPassVertex(v: vertex.PassVertex): boolean {
        return true;
    }

    visitStartVertex(v: vertex.StartVertex): boolean {
        return true;
    }

    visitReturnVertex(v: vertex.ReturnVertex): boolean {
        return true;
    }

    visitBranchVertex(v: vertex.BranchVertex): boolean {
        return v.condition !== undefined
            && v.trueNext !== undefined
            && v.falseNext !== undefined;
    }

    visitMergeVertex(v: vertex.MergeVertex): boolean {
        return v.branch !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitAllocationVertex(v: vertex.AllocationVertex): boolean {
        return VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitStoreVertex(v: vertex.StoreVertex): boolean {
        return v.object !== undefined
            && v.property !== undefined
            && v.value !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitLoadVertex(v: vertex.LoadVertex): boolean {
        return v.object !== undefined
            && v.property !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitCallVertex(v: vertex.CallVertex): boolean {
        return v.callee !== undefined
            && v.args !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

}

const vertexVerifier = new VertexVerifier();

export function verifyGraph(graph: Graph): boolean {
    if (graph.getStartVertex() === undefined) {
        return false;
    }

    for (const v of graph.vertices) {
        assert(v.id !== undefined);
        if (!v.accept(vertexVerifier)) {
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