
import * as vertex from "./vertex.js";

export interface VertexVisitor<T> {
    visitLiteralVertex(vertex: vertex.LiteralVertex): T;
    visitSymbolVertex(vertex: vertex.SymbolVertex): T;
    visitParameterVertex(vertex: vertex.ParameterVertex): T;
    visitPrefixUnaryOperationVertex(vertex: vertex.PrefixUnaryOperationVertex): T;
    visitPostfixUnaryOperationVertex(vertex: vertex.PostfixUnaryOperationVertex): T;
    visitBinaryOperationVertex(vertex: vertex.BinaryOperationVertex): T;
    visitPhiVertex(vertex: vertex.PhiVertex): T;
    visitBlockBeginVertex(vertex: vertex.BlockBeginVertex): T;
    visitBlockEndVertex(vertex: vertex.BlockEndVertex): T;
    visitStartVertex(vertex: vertex.StartVertex): T;
    visitReturnVertex(vertex: vertex.ReturnVertex): T;
    visitBranchVertex(vertex: vertex.BranchVertex): T;
    visitMergeVertex(vertex: vertex.MergeVertex): T;
    visitPassVertex(vertex: vertex.PassVertex): T;
    visitAllocationVertex(vertex: vertex.AllocationVertex): T;
    visitStoreVertex(vertex: vertex.StoreVertex): T;
    visitLoadVertex(vertex: vertex.LoadVertex): T;
    visitCallVertex(vertex: vertex.CallVertex): T;
}
