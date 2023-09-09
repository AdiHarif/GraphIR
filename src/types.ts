
export type Value = number | string | boolean
export type Operator = string

export enum VertexCategory {
    Data = 'Data',
    Control = 'Control',
    Compound = 'Compound'
}

export enum VertexKind {
    Literal = 'Literal',
    Symbol = 'Symbol',
    Parameter = 'Parameter',
    PrefixUnaryOperation = 'PrefixUnaryOperation',
    PostfixUnaryOperation = 'PostfixUnaryOperation',
    BinaryOperation = 'BinaryOperation',
    Phi = 'Phi',
    Start = 'Start',
    Pass = 'Pass',
    Return = 'Return',
    Branch = 'Branch',
    Merge = 'Merge',
    Allocation = 'Allocation',
    Store = 'Store',
    Load = 'Load',
    Call = 'Call',
}

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
