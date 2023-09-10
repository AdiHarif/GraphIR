
export type Value = number | string | boolean | null | undefined
export type Operator = string

export enum BinaryOperation {
    Add = '+',
    Sub = '-',
    Mul = '*',
    Div = '/',
    Mod = '%',
    Assign = '=',
    LessThan = '<',
    GreaterThan = '>',
    LessThanEqual = '<=',
    GreaterThanEqual = '>=',
    EqualEqual = '==',
    NotEqual = '!=',
    EqualEqualEqual = '===',
    NotEqualEqual = '!==',
    And = '&&',
    Or = '||',
    LeftShift = '<<',
    ArithmeticRightShift = '>>',
    LogicalRightShift = '>>>'
}

export enum UnaryOperation {
    Plus = '+',
    Minus = '-',
    Not = '!'
}
