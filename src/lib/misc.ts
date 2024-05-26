export function delay(ms: number) {
    return new Promise<void>(resolve =>
        setTimeout(() => {
            resolve();
        }, ms));
}


export function distinct<T>(...d: Array<T>): T[] {
    return [...new Set<T>(d)];
}
