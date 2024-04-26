
import { Type } from './type.js';
import { TypeVisitor } from './type_visitor.js';

export class StaticArrayType extends Type {
    constructor(public elementType: Type, public length: number) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitStaticArrayType(this);
    }
}

export class DynamicArrayType extends Type {
    constructor(public elementType: Type) {
        super();
    }

    accept<T>(visitor: TypeVisitor<T>): T {
        return visitor.visitDynamicArrayType(this);
    }
}
