
import { TypeVisitor } from "./type_visitor.js";

export abstract class Type {
    abstract accept<T>(visitor: TypeVisitor<T>): T;
}

export class UnknownType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitUnknownType(this);
    }
}

export class OptionType extends Type {
    constructor(public baseType: Type) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitOptionType(this);
    }
}

export class NumberType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitNumberType(this);
    }
}

export class IntegerType extends NumberType {
    constructor(public width: number) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitIntegerType(this);
    }
}

export type FloatTypeWidth = 32 | 64;

export class FloatType extends NumberType {
    constructor(public width: FloatTypeWidth) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitFloatType(this);
    }
}

export class FunctionType extends Type {
    constructor(public returnType: Type, public parameterTypes: Array<Type>) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitFunctionType(this);
    }
}
