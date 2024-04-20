
export abstract class Type {

}

export class OptionType {
    constructor(public baseType: Type) {}
}

export class NumberType extends Type {
}

export class IntegerType extends NumberType {
    constructor(public width: number) {
        super();
    }
}

export type FloatTypeWidth = 32 | 64;

export class FloatType extends NumberType {
    constructor(public width: FloatTypeWidth) {
        super();
    }
}
