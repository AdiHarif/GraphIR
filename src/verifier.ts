
import assert from 'assert';

import { Graph } from './graph.js';
import { VertexVisitor } from './vertex/vertex_visitor.js';

import {
    LiteralVertex,
    StaticSymbolVertex,
    ParameterVertex,
    PrefixUnaryOperationVertex,
    PostfixUnaryOperationVertex,
    BinaryOperationVertex,
    PhiVertex
} from './vertex/data_vertex.js';

import {
    NonTerminalControlVertex,
    BlockBeginVertex,
    BlockEndVertex,
    BranchVertex,
    MergeVertex,
    StartVertex,
    ReturnVertex,
    ThrowVertex
} from './vertex/control_vertex.js';

import {
    PassVertex,
    AllocationVertex,
    StoreVertex,
    LoadVertex,
    CallVertex
} from './vertex/pass_vertex.js';

import * as edge from './edge.js';

class VertexVerifier implements VertexVisitor<boolean> {

    private static verifyNonterminalControlVertex(v: NonTerminalControlVertex): boolean {
        return v.next !== undefined;
    }

    visitLiteralVertex(v: LiteralVertex): boolean {
        return true;
    }

    visitStaticSymbolVertex(v: StaticSymbolVertex): boolean{
        return v.name !== undefined && v.startVertex !== undefined;
    }

    visitParameterVertex(v: ParameterVertex): boolean {
        return v.position !== undefined;
    }

    visitPrefixUnaryOperationVertex(v: PrefixUnaryOperationVertex): boolean {
        return v.operator !== undefined && v.operand !== undefined;
    }

    visitPostfixUnaryOperationVertex(v: PostfixUnaryOperationVertex): boolean {
        return v.operator !== undefined && v.operand !== undefined;
    }

    visitBinaryOperationVertex(v: BinaryOperationVertex): boolean {
        return v.operator !== undefined && v.left !== undefined && v.right !== undefined;
    }

    visitPhiVertex(v: PhiVertex): boolean {
        return v.merge !== undefined && v.outEdges.some(e => e instanceof edge.PhiEdge);
    }

    visitBlockBeginVertex(v: BlockBeginVertex): boolean {
        return v.next !== undefined && v.previous instanceof BranchVertex;
    }

    visitBlockEndVertex(v: BlockEndVertex): boolean {
        return v.next instanceof MergeVertex && v.previous !== undefined;
    }

    visitPassVertex(v: PassVertex): boolean {
        return true;
    }

    visitStartVertex(v: StartVertex): boolean {
        return true;
    }

    visitReturnVertex(v: ReturnVertex): boolean {
        return true;
    }

    visitThrowVertex(v: ThrowVertex): boolean {
        return v.value !== undefined;
    }

    visitBranchVertex(v: BranchVertex): boolean {
        return v.condition !== undefined
            && v.trueNext !== undefined
            && v.falseNext !== undefined;
    }

    visitMergeVertex(v: MergeVertex): boolean {
        return v.branch !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitAllocationVertex(v: AllocationVertex): boolean {
        return VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitStoreVertex(v: StoreVertex): boolean {
        return v.object !== undefined
            && v.property !== undefined
            && v.value !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitLoadVertex(v: LoadVertex): boolean {
        return v.object !== undefined
            && v.property !== undefined
            && VertexVerifier.verifyNonterminalControlVertex(v);
    }

    visitCallVertex(v: CallVertex): boolean {
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