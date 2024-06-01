

const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

type sympolData = ({
    type: 'string' | 'number'
} | {
    type: 'object'
    properties: Record<string, sympolData>
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
    result: sympolData[];
};
const errorSymbol = {
    type: 'object', properties: {
        typ: { type: 'enum', values: ['error'] },
        description: { type: 'string' },
    }
} as const satisfies sympolData;
const api = {
    '/character/list': {
        'GET': {
            result: [{
                type: 'object',
                properties: {
                    typ: {
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
                        typ: { type: 'enum', values: ['skill'] },
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

    '/character/{id:number}': {
        'GET': {
            result: [errorSymbol,
                {
                    type: 'object',
                    properties: {
                        typ: {
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
    }
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
        : T extends { type: 'enum' }
        ? T['values'][number]
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
    type: 'to many tuple elements' | 'missing property' | 'missing tuple element' | 'wrong type',
    expected: sympolData | undefined,
    actual: unknown,
    path: string[],
};

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
function assert<TSymbol extends sympolData>(symbol: TSymbol, obj: unknown, path: string[] = []): obj is ResultType<TSymbol> {
    if (symbol.optional == true && (obj === undefined || obj === null)) {
        return true;
    }
    if (symbol.type == 'string' && (typeof obj == 'string')) {
        return true;
    }
    if (symbol.type == 'number' && typeof obj == 'number') {
        return true;
    }
    if (symbol.type == 'enum' && symbol.values.includes(obj as string)) {
        return true;
    }
    if (symbol.type == 'object' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        Object.entries(symbol.properties).forEach(([key, property]) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return assert(property, value, [...path, key]);
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
        return true;
    }
    if (symbol.type == 'record' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        Object.keys(obj).forEach((key) => {
            try {
                const value = (obj as Record<string, unknown>)[key];
                return assert(symbol.valueType, value, [...path, key]);
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
        return true;
    }
    if (symbol.type == 'array' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        let lengthErrors: TypeError = new TypeError();
        obj.forEach((element, i) => {
            try {
                return assert(symbol.valueType, element, [...path, `[${i}]`]);
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
        return true;
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

        symbol.valueTypes.forEach((prop, i) => {
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
                    return assert(prop, v, [...path, `[${i}]`]);

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
        return true;
    }
    throw new TypeError({
        type: 'wrong type',
        expected: symbol,
        actual: obj,
        path: [...path],
    });
}
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
export async function requestFromBackend<TPath extends Pathes, TMethod extends Method<TPath>>(path: TPath, method: TMethod, ...params: EmptyToVoid<UndefinableToOptional<RoutParams<TPath> & QueryParams<TPath, TMethod>>>): Promise<Result<TPath, TMethod>> {
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
        const symbol: sympolData | null = type.includes('|')
            ? { type: 'enum', values: type.split('|') }
            : type == 'string'
                ? { type }
                : null;
        if (symbol == null) {
            throw new Error(`Unknown TYPE ${type} for rout parameter`);
        }
        if (!assert(symbol, data)) {
            throw new Error(`Vaule ${JSON.stringify(data)} dose not satisfy type ${JSON.stringify(symbol)} for part ${key}`);
        }
        request = request.replace(sequence, data.toString());
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

    const response = await fetch(request, {
        method: method,
        headers: {
            'X-Auth-Token': token
        }
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
                if (assert(r, json)) {
                    return json;
                } else {
                    return new Error('assert should throw instead of returning false');
                }
            }
        } catch (error) {
            return error;
        }
    });
    const resultsWithoutErrors = results.filter(x => !(x instanceof TypeError));
    if (resultsWithoutErrors.length == 0) {

        const errors = results.filter((x): x is TypeError => x instanceof TypeError);
        if (errors.length > 0) {
            throw errors;
        }

        throw new Error(`Response could not be parsed to expected types.\n\tResponse: ${text}\n\t${currentData.result.map(x => "Expected: " + JSON.stringify(x)).join('\n\t')}`);
    }
    if (results.length > 1) {
        console.warn(`Result ${text} was ambigious`);
    }
    return results[0] as any;
}