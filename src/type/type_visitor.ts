
import {
    OptionType,
    NumberType,
    IntegerType,
    FloatType,
    FunctionType
} from './type.js'

export interface TypeVisitor<T> {
    visitOptionType(type: OptionType): T;
    visitNumberType(type: NumberType): T;
    visitIntegerType(type: IntegerType): T;
    visitFloatType(type: FloatType): T;
    visitFunctionType(type: FunctionType): T;
}
