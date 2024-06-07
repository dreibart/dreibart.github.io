import * as luxon from 'luxon';
import { base64 } from 'rfc4648';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

type sympolData = ({
    type: 'string' | 'number' | 'date-only' | 'date-time' | 'bytes' | 'null'
} | {
    type: 'object'
    properties: Record<string, sympolData>
} | {
    type: 'one-off'
    select: readonly sympolData[]
} | {
    type: 'enum'
    values: readonly string[]
} | {
    type: 'array'
    valueType: sympolData;
} | {
    type: 'record'
    valueType: sympolData;
} | {
    type: 'tuple'
    valueTypes: readonly sympolData[];
}) & {
    optional?: boolean
}

type ApiData = {
    query?: sympolData & {
        type: 'object';
        optional?: false;
        properties: Record<string, sympolData & { type: 'string' | 'number' }>
    };
    body?: sympolData & {
        type: 'object';
    },
    result: sympolData[];
};
const errorSymbol = {
    type: 'object', properties: {
        type: { type: 'enum', values: ['error'] },
        description: { type: 'string' },
    }
} as const satisfies sympolData;
const api = {
    '/character': {
        'GET': {
            result: [{
                type: 'object',
                properties: {
                    type: {
                        type: 'enum',
                        values: ['characterList']
                    },
                    characters: {
                        type: 'array',
                        valueType: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                name: { type: 'string' },
                                type: { type: 'string' },
                                world: { type: 'string' },
                                "attribute-points": {
                                    type: 'object',
                                    properties: {
                                        "used": { type: 'number' },
                                        "available": { type: 'number' },
                                    }
                                },
                                "skill-points": {
                                    type: 'object',
                                    properties: {
                                        "used": { type: 'number' },
                                        "available": { type: 'number' },
                                    }
                                },
                            }
                        }
                    }
                }
            }]
        }
    },

    '/shootSkill/request': {
        'GET': {
            query: {
                type: 'object',
                properties: {
                    character: { type: 'number' }
                }
            },
            result: [
                {
                    type: 'object',
                    properties: {
                        type: { type: 'enum', values: ['skill'] },
                        name: { type: 'string' },
                        "gezielter Schuss": {
                            type: 'object', properties: {
                                skillNumber: { type: 'number' },
                                skillName: { type: 'string' },
                                baseValue: { type: 'number' },
                                modifiedValue: { type: 'number' },
                                value: { type: 'number' },
                            }
                        },
                        "nomaler Schuss": {
                            type: 'object', properties: {
                                skillNumber: { type: 'number' },
                                skillName: { type: 'string' },
                                baseValue: { type: 'number' },
                                modifiedValue: { type: 'number' },
                                value: { type: 'number' },
                            }
                        },
                    }
                }
            ]
        }
    },

    '/character/{id:number}/neu': {
        'GET': {
            result: [{
                type: 'object',
                properties: {
                    "type": { type: 'enum', values: ['character'] },
                    "id": { type: 'number' },
                    "name": { type: 'number' },
                    "world": {
                        type: 'object',
                        properties: {
                            "id": { type: 'number' },
                            "name": { type: 'string' },
                        }
                    },
                    "category": { "type": 'string' },
                    "age": { "type": 'number' },
                    "gender": {
                        "type": 'enum',
                        values: ['male', 'female', 'other']
                    },
                    "size": { type: "number" },
                    "weight": { type: "number" },
                    "alignment": { type: "string" },
                    "race": {
                        type: 'object',
                        properties: {
                            "id": { type: 'number' },
                            "name": { type: 'string' },
                        }
                    },
                    "impediment": { type: 'number' },
                    "magic-resistance": {
                        type: 'object',
                        properties: {
                            "current": { type: 'number' },
                            "maximum": { type: 'number' },
                        }
                    },
                    "passive-defense": {
                        type: 'object',
                        properties: {
                            "current": { type: 'number' },
                            "maximum": { type: 'number' },
                        }
                    },
                    "pools": {
                        type: 'object',
                        properties: {
                            "fatique": { type: 'number' },
                            "conzentration": { type: 'number' },
                            "nana": { type: 'number' },
                            "contact": { type: 'number' },
                        }
                    },
                    "points": {
                        type: 'object',
                        "properties": {
                            attrbute: {
                                type: 'object',
                                properties: {
                                    used: { type: 'number' },
                                    available: { type: 'number' },
                                }
                            },
                            skill: {
                                type: 'object',
                                properties: {
                                    used: { type: 'number' },
                                    available: { type: 'number' },
                                }
                            }
                        }
                    }
                }
            }]
        }

    },
    '/character/{id:number}': {
        'GET': {
            result: [
                {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'enum',
                            values: ['character']
                        },
                        content: {
                            type: 'object',
                            properties: {
                                'characterNumber': { type: 'number' },
                                'characterName': { type: 'string' },
                                'characterAge': { type: 'number' },
                                'characterGender': { type: 'number' },
                                'characterMind': { type: 'string' },
                                'characterPicture': { type: 'string' },
                                'characterSize': { type: 'number' },
                                'characterType': { type: 'string' },
                                'characterWeight': { type: 'number' },
                                'creator': { type: 'number' },
                                'lookingForGroup': { type: 'number' },
                                'race': { type: 'string' },
                                'visibility': { type: 'number' },
                                'world': { type: 'string' },
                            }
                        }
                    },
                },
            ]
        }
    },

    '/character/{id:number}/notes': {
        'GET': {
            result: [{
                type: 'object',
                properties: {
                    type: {
                        type: 'enum',
                        values: ['notes']
                    },
                    notes: {
                        type: 'array',
                        valueType: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                text: { type: 'string' },
                                created: { type: 'date-time' },
                                image: {
                                    type: 'number',
                                    optional: true,
                                }
                            }
                        }
                    }
                }
            }]
        },
        'PATCH': {
            body: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    title: { type: 'string' },
                    image: {
                        type: 'bytes',
                        optional: true,
                    }
                }
            },
            result: [{
                type: 'object',
                properties: {
                    type: { type: 'enum', values: ['note'] },
                    id: { type: 'number' },
                    text: { type: 'string' },
                    created: { type: 'date-time' },
                    image: {
                        type: 'number',
                        optional: true,
                    }
                }
            }]
        }
    },
    '/character/{id:number}/notes/{note_id:number}': {
        'DELETE': {
            result: [{
                type: 'enum',
                values: ['succsess']
            }]
        },
        "PATCH": {
            body: {
                type: 'object',
                properties: {
                    text: {
                        type: 'one-off',
                        select: [
                            { type: 'string' },
                            { type: 'null' },
                        ],
                        optional: true,
                    },
                    image: {
                        type: 'one-off',
                        select: [
                            { type: 'bytes' },
                            { type: 'null' },
                        ],
                        optional: true,
                    }
                }
            },
            result: [{
                type: 'object',
                properties: {
                    type: { type: 'enum', values: ['note'] },
                    id: { type: 'number' },
                    text: { type: 'string' },
                    created: { type: 'date-time' },
                    image: {
                        type: 'number',
                        optional: true,
                    }
                }
            }]
        }
    },
} as const satisfies Record<string, Partial<Record<typeof methods[number], ApiData>>>;


type ResultTypeArray<T> = T extends readonly [infer head, ...infer rest]
    ? ResultType<head> | ResultTypeArray<rest>
    : T extends readonly []
    ? never
    : never;
;



type ResultType<T> =
    T extends sympolData
    ? (T["optional"] extends true ? undefined : never) | (T['type'] extends 'string'
        ? string
        : T['type'] extends 'number'
        ? number
        : T['type'] extends 'date-only'
        ? luxon.DateTime
        : T['type'] extends 'date-time'
        ? luxon.DateTime
        : T['type'] extends 'bytes'
        ? Uint8Array
        : T['type'] extends 'null'
        ? null
        : T extends { type: 'enum' }
        ? T['values'][number]
        : T extends { type: 'one-off' }
        ? { [k in keyof T['select']]: ResultType<T['select'][k]> }[number]
        : T extends { type: 'tuple' }
        ? { [k in keyof T['valueTypes']]: ResultType<T['valueTypes'][k]> }
        : T extends { type: 'array' }
        ? ResultType<T['valueType']>[]
        : T extends { type: 'object' }
        ? {
            [p in keyof T['properties']]: ResultType<T['properties'][p]>
        }
        : never

    )
    : never;




export type Pathes = keyof typeof api;
export type Method<TPath extends Pathes> = keyof typeof api[TPath] extends string ? keyof typeof api[TPath] : never;
export type Test<TPath extends Pathes, TMethod extends Method<TPath>> = keyof typeof api[TPath][TMethod];

export type Result<TPath extends Pathes, TMethod extends Method<TPath>> =
    typeof api[TPath][TMethod] extends { 'result': infer K }
    ? K extends readonly unknown[]
    ? ResultTypeArray<K>
    : ResultType<K>
    : never;


type QueryParams<TPath extends Pathes, TMethod extends Method<TPath>> =
    typeof api[TPath][TMethod] extends { 'query': infer K }
    ? ResultType<K>
    : {};

type BodyParams<TPath extends Pathes, TMethod extends Method<TPath>> =
    typeof api[TPath][TMethod] extends { 'body': infer K }
    ? ResultType<K>
    : {};



type RoutParams<TPath extends Pathes, Route extends string = TPath> =
    Route extends `${infer current}/${infer rests}`
    ? RoutParameter<TPath, current> & RoutParams<TPath, rests>
    : RoutParameter<TPath, Route>

type RoutParameter<TPath extends Pathes, S extends string> = S extends `{${infer text}}`
    ? (text extends `${infer name}:${infer type}`
        ? { [P in name]: GetTypeForRoute<type> }
        : { [P in text]: string })
    : {};


type GetTypeForRoute<Name extends string> =
    Name extends 'string'
    ? string
    : Name extends 'number'
    ? number
    : `ERROR ${Name}`
    ;

type EmptyToVoid<T> = T extends Record<any, never>
    ? [] :
    [T];



type UndefinedKeys<Input> = {
    [K in keyof Input as undefined extends Input[K] ? K : never]?: Input[K]
}

type UndefinableToOptional<Input> = Omit<Input, keyof UndefinedKeys<Input>> & UndefinedKeys<Input>


type TypeErrorType = {
    path: string[],
    actual: unknown,
} & ({
    type: 'to many tuple elements' | 'missing property' | 'missing tuple element' | 'wrong type',
    expected: sympolData | undefined,
    actual: unknown,
} | {
    type: 'invalid datetime'
    reason: string,
    actual: luxon.DateTime<false>,
});

class TypeError {

    private readonly _errors: TypeErrorType[];

    constructor(...errors: TypeErrorType[]) {
        this._errors = errors;
    }


    public get errors(): TypeErrorType[] {
        return this._errors;
    }


    /**
     * withErrors
     */
    public withErrors(...errors: TypeErrorType[]) {
        return new TypeError(...this._errors, ...errors);
    }
}

function check<TSymbol extends sympolData>(symbol: TSymbol, obj: unknown): obj is ResultType<TSymbol> {
    try {
        assert(symbol, obj);
        return true;
    } catch (error) {
        if (error instanceof TypeError) {
            return false;
        }
        throw error;
    }
}



function fromJsonObject<TSymbol extends sympolData>(symbol: TSymbol, obj: unknown, path: string[] = []): ResultType<TSymbol> {
    if (symbol.optional == true && obj === undefined) {
        return undefined!;
    }
    if (symbol.type == 'null' && (obj === null)) {
        return null!;
    }

    if (symbol.type == 'string' && (typeof obj == 'string')) {
        return obj as ResultType<TSymbol>;
    }
    if (symbol.type == 'number' && typeof obj == 'number') {
        return obj as ResultType<TSymbol>;
    }
    if (symbol.type == 'enum' && symbol.values.includes(obj as string)) {
        return obj as ResultType<TSymbol>;
    }

    if (symbol.type == 'date-time' && typeof obj == 'string' && luxon.DateTime.fromISO(obj as string).isValid) {
        return luxon.DateTime.fromISO(obj as string) as ResultType<TSymbol>;
    }

    if (symbol.type == 'date-only' && typeof obj == 'string' && luxon.DateTime.fromISO(obj as string).isValid) {
        return luxon.DateTime.fromISO(obj as string) as ResultType<TSymbol>;
    }

    if (symbol.type == 'bytes' && typeof obj == 'string') {
        return base64.parse(obj) as ResultType<TSymbol>;
    }

    if (symbol.type == 'one-off') {
        const resultsUnfiltert = symbol.select.map(symbol => {
            try {
                return fromJsonObject(symbol, obj, [...path]);
            } catch (error) {
                if (error instanceof TypeError) {
                    return error;
                }
                throw error;
            }
        });

        const errors = resultsUnfiltert.filter((x): x is TypeError => x instanceof TypeError);
        const valids = resultsUnfiltert.filter((x): x is ResultType<TSymbol> => !(x instanceof TypeError));
        if (valids.length > 0) {
            if (valids.length > 1) {
                console.warn("Parsing mas ambigious");
            }
            return valids[0];
        }
        throw errors.reduce((p, c) => p.withErrors(...c.errors), new TypeError());
    }
    if (symbol.type == 'object' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = Object.fromEntries(Object.entries(symbol.properties).map(([key, property]) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return [key, fromJsonObject(property, value, [...path, key])] as const;
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                    return [key, null!];
                } else {
                    throw error;
                }
            }
        }));
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result as ResultType<TSymbol>;
    }
    if (symbol.type == 'record' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = Object.fromEntries(Object.keys(obj).map((key) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return [key, fromJsonObject(symbol.valueType, value, [...path, key])] as const;
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                    return [key, !null] as const;
                } else {
                    throw error;
                }
            }
        }));
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result as ResultType<TSymbol>;
    }
    if (symbol.type == 'array' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = obj.map((element, i) => {
            try {
                return fromJsonObject(symbol.valueType, element, [...path, `[${i}]`]);
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                } else {
                    throw error;
                }
            }
        });
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result as ResultType<TSymbol>;
    }
    if (symbol.type == 'tuple' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        if (obj.length > symbol.valueTypes.length) {
            lengthErrors = lengthErrors.withErrors(...Array.from({ length: obj.length - symbol.valueTypes.length }).map((_, i) => ({
                type: 'to many tuple elements',
                expected: undefined,
                actual: obj[i + symbol.valueTypes.length],
                path: [...path, `[${i + symbol.valueTypes.length}]`],
            } satisfies TypeErrorType)));
        }

        const result = symbol.valueTypes.map((prop, i) => {
            const v = obj[i];
            if (v == undefined) {
                lengthErrors = lengthErrors.withErrors({
                    type: 'missing tuple element',
                    actual: undefined,
                    expected: prop,
                    path: [...path, `[${i}]`]
                });
            } else {
                try {
                    return fromJsonObject(prop, v, [...path, `[${i}]`]);

                } catch (error) {
                    if (error instanceof TypeError) {
                        lengthErrors = lengthErrors.withErrors(...error.errors);
                    } else {
                        throw error;
                    }
                }
            }
        });

        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result as ResultType<TSymbol>;
    }
    throw new TypeError({
        type: 'wrong type',
        expected: symbol,
        actual: obj,
        path: [...path],
    });
}

function toJsonObject<TSymbol extends sympolData>(symbol: TSymbol, obj: ResultType<TSymbol>, path: string[] = []): string | number | object {
    if (symbol.optional == true && obj === undefined) {
        return undefined!;
    }
    if (symbol.type == 'null' && (obj === null)) {
        return null!;
    }

    if (symbol.type == 'string' && (typeof obj == 'string')) {
        return obj;
    }
    if (symbol.type == 'number' && typeof obj == 'number') {
        return obj;
    }
    if (symbol.type == 'enum' && typeof obj == 'string' && symbol.values.includes(obj as string)) {
        return obj;
    }

    if (symbol.type == 'date-time' && luxon.DateTime.isDateTime(obj)) {
        if (obj.isValid) {
            return obj.toISO();
        } else {

            throw new TypeError({
                type: 'invalid datetime',
                actual: obj,
                path: [...path],
                reason: obj.invalidReason
            });
        }
    }

    if (symbol.type == 'date-only' && luxon.DateTime.isDateTime(obj)) {
        if (obj.isValid) {
            return obj.toISODate();
        } else {
            throw new TypeError({
                type: 'invalid datetime',
                actual: obj,
                path: [...path],
                reason: obj.invalidReason
            });
        }
    }

    if (symbol.type == 'bytes' && obj instanceof Uint8Array) {
        return base64.stringify(obj);
    }

    if (symbol.type == 'one-off') {
        const resultsUnfiltert = symbol.select.map(symbol => {
            try {
                return toJsonObject(symbol, obj, [...path]);
            } catch (error) {
                if (error instanceof TypeError) {
                    return error;
                }
                throw error;
            }
        });

        const errors = resultsUnfiltert.filter((x): x is TypeError => x instanceof TypeError);
        const valids = resultsUnfiltert.filter((x): x is string | number | object => !(x instanceof TypeError));
        if (valids.length > 0) {
            if (valids.length > 1) {
                console.warn("Parsing mas ambigious");
            }
            return valids[0];
        }
        throw errors.reduce((p, c) => p.withErrors(...c.errors), new TypeError());
    }
    if (symbol.type == 'object' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = Object.fromEntries(Object.entries(symbol.properties).map(([key, property]) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return [key, toJsonObject(property, value, [...path, key])] as const;
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                    return [key, null!];
                } else {
                    throw error;
                }
            }
        }));
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result;
    }
    if (symbol.type == 'record' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = Object.fromEntries(Object.keys(obj).map((key) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return [key, toJsonObject(symbol.valueType, value, [...path, key])] as const;
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                    return [key, !null] as const;
                } else {
                    throw error;
                }
            }
        }));
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result;
    }
    if (symbol.type == 'array' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        const result = obj.map((element, i) => {
            try {
                return toJsonObject(symbol.valueType, element, [...path, `[${i}]`]);
            } catch (error) {
                if (error instanceof TypeError) {
                    lengthErrors = lengthErrors.withErrors(...error.errors);
                } else {
                    throw error;
                }
            }
        });
        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result;
    }
    if (symbol.type == 'tuple' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        if (obj.length > symbol.valueTypes.length) {
            lengthErrors = lengthErrors.withErrors(...Array.from({ length: obj.length - symbol.valueTypes.length }).map((_, i) => ({
                type: 'to many tuple elements',
                expected: undefined,
                actual: obj[i + symbol.valueTypes.length],
                path: [...path, `[${i + symbol.valueTypes.length}]`],
            } satisfies TypeErrorType)));
        }

        const result = symbol.valueTypes.map((prop, i) => {
            const v = obj[i];
            if (v == undefined) {
                lengthErrors = lengthErrors.withErrors({
                    type: 'missing tuple element',
                    actual: undefined,
                    expected: prop,
                    path: [...path, `[${i}]`]
                });
            } else {
                try {
                    return toJsonObject(prop, v, [...path, `[${i}]`]);

                } catch (error) {
                    if (error instanceof TypeError) {
                        lengthErrors = lengthErrors.withErrors(...error.errors);
                    } else {
                        throw error;
                    }
                }
            }
        });

        if (lengthErrors.errors.length > 0) {
            throw lengthErrors;
        }
        return result;
    }
    throw new TypeError({
        type: 'wrong type',
        expected: symbol,
        actual: obj,
        path: [...path],
    });
}
// function assert<TSymbol extends sympolData>(symbol: TSymbol, obj: unknown, path: string[] = []): ResultType<TSymbol> {
//     if (symbol.optional == true && obj === undefined) {
//         return undefined!;
//     }
//     if (symbol.type == 'null' && (obj === null)) {
//         return null!;
//     }

//     if (symbol.type == 'string' && (typeof obj == 'string')) {
//         return obj as ResultType<TSymbol>;
//     }
//     if (symbol.type == 'number' && typeof obj == 'number') {
//         return obj as ResultType<TSymbol>;
//     }
//     if (symbol.type == 'enum' && symbol.values.includes(obj as string)) {
//         return obj as ResultType<TSymbol>;
//     }

//     if (symbol.type == 'date-time' && typeof obj == 'string' && luxon.DateTime.fromISO(obj as string).isValid) {
//         return luxon.DateTime.fromISO(obj as string) as ResultType<TSymbol>;
//     }

//     if (symbol.type == 'date-only' && typeof obj == 'string' && luxon.DateTime.fromISO(obj as string).isValid) {
//         return luxon.DateTime.fromISO(obj as string) as ResultType<TSymbol>;
//     }

//     if (symbol.type == 'bytes' && typeof obj == 'string') {
//         return base64.parse(obj) as ResultType<TSymbol>;
//     }

//     if (symbol.type == 'one-off') {
//         const resultsUnfiltert = symbol.select.map(symbol => {
//             try {
//                 return assert(symbol, obj, [...path]);
//             } catch (error) {
//                 if (error instanceof TypeError) {
//                     return error;
//                 }
//                 throw error;
//             }
//         });

//         const errors = resultsUnfiltert.filter((x): x is TypeError => x instanceof TypeError);
//         const valids = resultsUnfiltert.filter((x): x is ResultType<TSymbol> => !(x instanceof TypeError));
//         if (valids.length > 0) {
//             if (valids.length > 1) {
//                 console.warn("Parsing mas ambigious");
//             }
//             return valids[0];
//         }
//         throw errors.reduce((p, c) => p.withErrors(...c.errors), new TypeError());
//     }
//     if (symbol.type == 'object' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
//         let lengthErrors: TypeError = new TypeError();
//         const result = Object.fromEntries(Object.entries(symbol.properties).map(([key, property]) => {
//             try {
//                 const value = (obj as Record<string, unknown>)[key];
//                 return [key, assert(property, value, [...path, key])] as const;
//             } catch (error) {
//                 if (error instanceof TypeError) {
//                     lengthErrors = lengthErrors.withErrors(...error.errors);
//                     return [key, null!];
//                 } else {
//                     throw error;
//                 }
//             }
//         }));
//         if (lengthErrors.errors.length > 0) {
//             throw lengthErrors;
//         }
//         return result as ResultType<TSymbol>;
//     }
//     if (symbol.type == 'record' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
//         let lengthErrors: TypeError = new TypeError();
//         const result = Object.fromEntries(Object.keys(obj).map((key) => {
//             try {
//                 const value = (obj as Record<string, unknown>)[key];
//                 return [key, assert(symbol.valueType, value, [...path, key])] as const;
//             } catch (error) {
//                 if (error instanceof TypeError) {
//                     lengthErrors = lengthErrors.withErrors(...error.errors);
//                     return [key, !null] as const;
//                 } else {
//                     throw error;
//                 }
//             }
//         }));
//         if (lengthErrors.errors.length > 0) {
//             throw lengthErrors;
//         }
//         return result as ResultType<TSymbol>;
//     }
//     if (symbol.type == 'array' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
//         let lengthErrors: TypeError = new TypeError();
//         const result = obj.map((element, i) => {
//             try {
//                 return assert(symbol.valueType, element, [...path, `[${i}]`]);
//             } catch (error) {
//                 if (error instanceof TypeError) {
//                     lengthErrors = lengthErrors.withErrors(...error.errors);
//                 } else {
//                     throw error;
//                 }
//             }
//         });
//         if (lengthErrors.errors.length > 0) {
//             throw lengthErrors;
//         }
//         return result as ResultType<TSymbol>;
//     }
//     if (symbol.type == 'tuple' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
//         let lengthErrors: TypeError = new TypeError();
//         if (obj.length > symbol.valueTypes.length) {
//             lengthErrors = lengthErrors.withErrors(...Array.from({ length: obj.length - symbol.valueTypes.length }).map((_, i) => ({
//                 type: 'to many tuple elements',
//                 expected: undefined,
//                 actual: obj[i + symbol.valueTypes.length],
//                 path: [...path, `[${i + symbol.valueTypes.length}]`],
//             } satisfies TypeErrorType)));
//         }

//         const result = symbol.valueTypes.map((prop, i) => {
//             const v = obj[i];
//             if (v == undefined) {
//                 lengthErrors = lengthErrors.withErrors({
//                     type: 'missing tuple element',
//                     actual: undefined,
//                     expected: prop,
//                     path: [...path, `[${i}]`]
//                 });
//             } else {
//                 try {
//                     return assert(prop, v, [...path, `[${i}]`]);

//                 } catch (error) {
//                     if (error instanceof TypeError) {
//                         lengthErrors = lengthErrors.withErrors(...error.errors);
//                     } else {
//                         throw error;
//                     }
//                 }
//             }
//         });

//         if (lengthErrors.errors.length > 0) {
//             throw lengthErrors;
//         }
//         return result as ResultType<TSymbol>;
//     }
//     throw new TypeError({
//         type: 'wrong type',
//         expected: symbol,
//         actual: obj,
//         path: [...path],
//     });
// }
let isBlocking = false;
const listener: ((e: { isBlocking: boolean }) => void)[] = [];
export function OnBlockingChanged(ev: (e: { isBlocking: boolean }) => void) {
    listener.push(ev);
    ev({ isBlocking });
}

function setIsBlocking(params: boolean) {
    if (isBlocking != params) {
        isBlocking = params;
        listener.forEach(l => l({ isBlocking }));
    }
}

let blockingPromisde: {
    set: () => void,
    promise: Promise<void>
};

function initBlockingPromise() {
    let set: () => void = undefined!;
    const p = new Promise<void>((resolve) => {
        set = resolve;
    });
    blockingPromisde = {
        promise: p,
        set,
    };
}
initBlockingPromise();
export function retryBlocking() {
    blockingPromisde.set();
    initBlockingPromise();
}

let tokenPromise: undefined | Promise<string>;
export async function requestFromBackend<TPath extends Pathes, TMethod extends Method<TPath>>(path: TPath, method: TMethod, ...params: EmptyToVoid<UndefinableToOptional<RoutParams<TPath> & QueryParams<TPath, TMethod> & BodyParams<TPath, TMethod>>>): Promise<{
    success: true,
    result: Result<TPath, TMethod>
} |
{
    success: false,
    error: ResultType<typeof errorSymbol>
}> {
    const parameters = params[0] as Record<string, unknown>;
    const currentData = api[path][method] as ApiData;
    const matchs = [...path.matchAll(
        /\{(?<key>[^{:]+)(:(?<type>[^{]+))?\}/g
    )];


    const routParameters = matchs.map(m => {
        const key = m.groups!['key'];
        const type = m.groups?.['type'] ?? 'string';
        return { key, type, sequence: m[0] };
    });
    let request: string = path;
    for (const { key, type, sequence } of routParameters) {
        const data = parameters[key];
        const symbol = type.includes('|')
            ? { type: 'enum', values: type.split('|') } as const
            : type == 'string' || type == 'number'
                ? { type } as const
                : null satisfies sympolData | null;
        if (symbol == null) {
            throw new Error(`Unknown TYPE ${type} for rout parameter`);
        }
        const transformed = toJsonObject(symbol, data as any);
        // if (!assert(symbol, data)) {
        //     throw new Error(`Vaule ${JSON.stringify(data)} dose not satisfy type ${JSON.stringify(symbol)} for part ${key}`);
        // }
        request = request.replace(sequence, transformed.toString());
    }
    if (currentData.query) {
        let first = true;
        for (const key in currentData.query.properties) {
            if (Object.prototype.hasOwnProperty.call(currentData.query.properties, key)) {
                const { type, optional } = currentData.query.properties[key];
                const value = parameters[key];
                if (!optional && value == undefined) {
                    throw new Error(`missing parameter ${key}`);
                }
                if (typeof value !== type) {
                    throw new Error(`parameter ${key} as wrong type. Expected ${type} was ${typeof parameters[key]}`);
                }

                if (first) {
                    request += `?${key}=${encodeURIComponent(value as string)}`;
                    first = false;
                } else {
                    request += `&${key}=${encodeURIComponent(value as string)}`;
                }
            }
        }
    }
    let body: string | undefined = undefined;
    if (currentData.body) {
        const r = {} as Record<string, unknown>
        let first = true;
        for (const key in currentData.body.properties) {
            if (Object.prototype.hasOwnProperty.call(currentData.body.properties, key)) {
                const symbol = currentData.body.properties[key];
                const value = parameters[key];


                r[key] = toJsonObject(symbol, value as any);


            }
        }
        body = JSON.stringify(r);
    }


    request = "https://dreibart.de/rpgdb/restAPI.php" + request;


    let token = window.localStorage.getItem('token');
    if (token == null) {
        // todo : get token
        // eslint-disable-next-line no-async-promise-executor
        const promise = tokenPromise = tokenPromise ?? new Promise<string>(async (resolve, reject) => {
            const location = new URL(window.location.toString());
            location.search = '';
            let dialog = window.open(`https://dreibart.de/rpgdb/apiLogin.php?target=${encodeURIComponent(location.toString())}`, '_blank', 'toolbar=0,menubar=0');
            while (dialog == null) {
                setIsBlocking(true);
                console.log('is blocking');
                await blockingPromisde.promise;
                dialog = window.open(`https://dreibart.de/rpgdb/apiLogin.php?target=${encodeURIComponent(location.toString())}`, '_blank', 'toolbar=0,menubar=0');

            }
            setIsBlocking(false);
            const timer = setInterval(function () {
                if (dialog.closed) {
                    clearInterval(timer);
                    const token = window.localStorage.getItem('token');
                    if (token == null) {
                        reject('Authentication Window closed');
                    } else {
                        resolve(token);
                    }
                    tokenPromise = undefined;
                }
            }, 1000);
        });
        token = await promise;
    }

    const headers = body != undefined
        ? new Headers({
            "Content-Type": "application/json",
            "Content-Length": JSON.stringify(body).length.toString(),
            "X-Auth-Token": token
        })
        : new Headers({
            'X-Auth-Token': token
        });
    const response = await fetch(request, {
        method: method,
        headers,
        body
    });

    if (response.status == 401) {
        window.localStorage.removeItem('token');
        return await requestFromBackend(path, method, ...params);
    }

    if (!response.ok) {
        throw new Error(`Request Faild with ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    const results = currentData.result.map(r => {
        try {

            if (r.type == 'enum' || r.type == 'string') {
                return text;
            } else if (r.type == 'number') {
                return parseFloat(text);
            } else {
                const json = JSON.parse(text);
                const transformed = fromJsonObject(r, json);
                return transformed;
                // if (assert(r, json)) {
                //     return json;
                // } else {
                //     return new Error('assert should throw instead of returning false');
                // }
            }
        } catch (error) {
            return error;
        }
    });
    const resultsWithoutErrors = results.filter(x => !(x instanceof TypeError) && !(x instanceof Error));

    if (resultsWithoutErrors.length == 0) {

        try {
            const json = JSON.parse(text);
            const transformed = fromJsonObject(errorSymbol, json);
            return {
                success: false,
                error: transformed
            };

        } catch (error) {

        }

        const errors = results.filter((x): x is TypeError => x instanceof TypeError);
        if (errors.length > 0) {
            throw errors;
        }

        throw results;
    }
    if (resultsWithoutErrors.length > 1) {
        console.warn(`Result ${text} was ambigious`);
    }
    return {
        success: true,
        result:
            resultsWithoutErrors[0] as any
    };
}