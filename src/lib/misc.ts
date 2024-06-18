export function delay(ms: number) {
    return new Promise<void>(resolve =>
        setTimeout(() => {
            resolve();
        }, ms));
}


export function distinct<T>(...d: Array<T>): T[] {
    return [...new Set<T>(d)];
}

export function distinctBy<T, TKey>(f: (d: T) => TKey, ...d: Array<T>): T[] {
    const set = new Set<TKey>(d.map(f));
    return [...set].map(x => d.filter(y => f(y) == x)[0]);
}


export function highlight(text: string, before: string, after: string, highlights: (readonly [number, number])[]) {
    highlights.sort(([a], [b]) => a - b);

    for (let index = highlights.length - 1; index >= 0; index--) {
        const [start, end] = highlights[index];
        text = splice(text, start, end, `${before}${text.slice(start, end)}${after}`);
    }
    return text;
}
export function splice(text: string, start: number, end: number, newSubStr: string) {
    return text.slice(0, start) + newSubStr + text.slice(end);
}
