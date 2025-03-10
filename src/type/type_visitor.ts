
import {
    VoidType,
    UnknownType,
    UndefinedType,
    NullType,
    OptionType,
    NumberType,
    IntegerType,
    FloatType,
    FunctionType,
    StaticStringType,
    DynamicStringType,
    UnionType,
    UserDefinedType,
    ObjectType
} from './type.js'

import {
    StaticArrayType,
    DynamicArrayType
} from './array_type.js'

export interface TypeVisitor<T> {
    visitVoidType(type: VoidType): T;
    visitUnknownType(type: UnknownType): T;
    visitUndefinedType(type: UndefinedType): T;
    visitNullType(type: NullType): T;
    visitOptionType(type: OptionType): T;
    visitNumberType(type: NumberType): T;
    visitIntegerType(type: IntegerType): T;
    visitFloatType(type: FloatType): T;
    visitFunctionType(type: FunctionType): T;
    visitStaticStringType(type: StaticStringType): T;
    visitDynamicStringType(type: DynamicStringType): T;
    visitUnionType(type: UnionType): T;
    visitUserDefinedType(type: UserDefinedType): T;
    visitObjectType(type: ObjectType): T;
    visitStaticArrayType(type: StaticArrayType): T;
    visitDynamicArrayType(type: DynamicArrayType): T;
}
