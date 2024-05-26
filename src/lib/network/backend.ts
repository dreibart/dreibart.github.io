


const symbolString = Symbol('string');
const symbolNumber = Symbol('number');
const symbolStringOptional = Symbol('string?');
const symbolNumberOptional = Symbol('number?');

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

const api = {
    '/character': {
        'GET': {
            result: [{
                type: 'string'
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
                        typ: { type: 'enum', values: ['skill'] }
                    }
                }
            ]
        }
    },

    '/character/{id:number}': {
        'GET': {
            result: [{
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
                        }
                    }
                },
            }, {
                type: 'object',
                properties: {
                    'typ': { type: 'enum', values: ['error'] },
                    description: { type: 'string' },
                }
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


function check<TSymbol extends sympolData>(symbol: TSymbol, obj: unknown): obj is ResultType<TSymbol> {
    if (symbol.optional == true && obj === undefined) {
        return true;
    }
    if (symbol.type == 'string' && typeof obj == 'string') {
        return true;
    }
    if (symbol.type == 'number' && typeof obj == 'number') {
        return true;
    }
    if (symbol.type == 'enum' && symbol.values.includes(obj as string)) {
        return true;
    }
    if (symbol.type == 'object' && typeof obj == 'object' && obj !== null && !Array.isArray(obj)) {
        return Object.entries(symbol.properties).every(([key, property]) => {
            const value = (obj as Record<string, unknown>)[key];
            return check(property, value);
        });
    }
    if (symbol.type == 'array' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        return obj.every((element) => {
            return check(symbol.valueType, element);
        });
    }
    if (symbol.type == 'tuple' && typeof obj == 'object' && obj !== null && Array.isArray(obj)) {
        if (obj.length > symbol.valueTypes.length) {
            return false;
        }

        symbol.valueTypes.every((prop, i) => {
            const v = obj[i];
            return check(prop, v);
        });
    }
    return false;
}


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
            : type == 'string' || type == 'number'
                ? { type }
                : null;
        if (symbol == null) {
            throw new Error(`Unknown TYPE ${type} for rout parameter`);
        }
        if (!check(symbol, data)) {
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
        const promise = new Promise<string>((resolve, reject) => {
            const location = new URL(window.location.toString());
            location.search = '';
            const dialog = window.open(`https://dreibart.de/rpgdb/apiLogin.php?target=${encodeURIComponent(location.toString())}`, '_blank', 'toolbar=0,menubar=0');
            if (dialog == null) {
                reject('No Window');
                return;
            }
            const timer = setInterval(function () {
                if (dialog.closed) {
                    clearInterval(timer);
                    const token = window.localStorage.getItem('token');
                    if (token == null) {
                        reject('closed');
                    } else {
                        resolve(token);
                    }
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
        const token = window.localStorage.removeItem('token');
        return await requestFromBackend(path, method, ...params);
    }

    if (!response.ok) {
        throw new Error(`Request Faild with ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    const error = Symbol('error');
    const results = currentData.result.map(r => {
        try {

            if (r.type == 'enum' || r.type == 'string') {
                return text;
            } else if (r.type == 'number') {
                return parseFloat(text);
            } else {
                const json = JSON.parse(text);
                if (check(r, json)) {
                    return json;
                } else {
                    return error;
                }
            }
        } catch {
            return error;
        }
    }).filter(x => x !== error);
    if (results.length == 0) {
        throw new Error(`Response could not be parsed to expected types.\n\tResponse: ${text}\n\t${currentData.result.map(x => "Expected: " + JSON.stringify(x)).join('\n\t')}`);
    }
    if (results.length > 1) {
        console.warn(`Result ${text} was ambigious`);
    }
    return results[0] as any;
}