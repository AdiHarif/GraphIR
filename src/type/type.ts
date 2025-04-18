
import { TypeVisitor } from "./type_visitor.js";

export abstract class Type {
    abstract accept<T>(visitor: TypeVisitor<T>): T;
}

export class VoidType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitVoidType(this);
    }
}

export class UnknownType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitUnknownType(this);
    }
}

export class UndefinedType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitUndefinedType(this);
    }
}

export class NullType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitNullType(this);
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

export class StaticStringType extends Type {
    constructor(public length: number) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitStaticStringType(this);
    }
}

export class DynamicStringType extends Type {
    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitDynamicStringType(this);
    }
}

export class UnionType extends Type {
    constructor(public types: Array<Type>) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitUnionType(this);
    }
}

export class UserDefinedType extends Type {
    constructor(public name: string) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitUserDefinedType(this);
    }
}

export class ObjectType extends Type {
    constructor(public elementType: Type) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitObjectType(this);
    }
}
