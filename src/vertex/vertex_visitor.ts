
import {
    LiteralVertex,
    StaticSymbolVertex,
    ParameterVertex,
    PrefixUnaryOperationVertex,
    PostfixUnaryOperationVertex,
    BinaryOperationVertex,
    PhiVertex
} from './data_vertex.js';

import {
    NonTerminalControlVertex,
    BlockBeginVertex,
    BlockEndVertex,
    BranchVertex,
    MergeVertex,
    StartVertex,
    ReturnVertex
} from './control_vertex.js';

import {
    PassVertex,
    AllocationVertex,
    StoreVertex,
    LoadVertex,
    CallVertex
} from './pass_vertex.js';


export interface VertexVisitor<T> {
    visitLiteralVertex(vertex: LiteralVertex): T;
    visitStaticSymbolVertex(vertex: StaticSymbolVertex): T;
    visitParameterVertex(vertex: ParameterVertex): T;
    visitPrefixUnaryOperationVertex(vertex: PrefixUnaryOperationVertex): T;
    visitPostfixUnaryOperationVertex(vertex: PostfixUnaryOperationVertex): T;
    visitBinaryOperationVertex(vertex: BinaryOperationVertex): T;
    visitPhiVertex(vertex: PhiVertex): T;
    visitBlockBeginVertex(vertex: BlockBeginVertex): T;
    visitBlockEndVertex(vertex: BlockEndVertex): T;
    visitStartVertex(vertex: StartVertex): T;
    visitReturnVertex(vertex: ReturnVertex): T;
    visitBranchVertex(vertex: BranchVertex): T;
    visitMergeVertex(vertex: MergeVertex): T;
    visitPassVertex(vertex: PassVertex): T;
    visitAllocationVertex(vertex: AllocationVertex): T;
    visitStoreVertex(vertex: StoreVertex): T;
    visitLoadVertex(vertex: LoadVertex): T;
    visitCallVertex(vertex: CallVertex): T;
}
