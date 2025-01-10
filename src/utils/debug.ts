
let traceOn:number = 1; // trace by default
let stack:string[] = [];

export function trace(onOff:boolean) {
    const previous = traceOn;
    traceOn += onOff ? 1 : (traceOn ? -1 : 0);
    if (previous == 0 && traceOn == 1)
        console.log("******* TRACE ON ****************")
    if (previous == 1 && traceOn == 0)
        console.log("******* TRACE OFF ****************")
}

export function debug(...args:any[]) {
    if (!traceOn) return;
    console.debug("  ".repeat(stack.length), ...args)
}

export function enter(name:string, ...args:any[]) {
    debug(">".repeat(stack.length + 1) + " " + name + ">".repeat(stack.length + 1) )
    stack.push(name)
    // console.log("# enter", stack.join("/"))
}

export function leave(name?:string) {
    // console.log("# leave", stack.join("/"))
    if (name) {
        const pos = stack.findIndex(x => x == name)
        if (pos == -1) {
            stack = []
        } else {
            stack = stack.slice(0, pos)
        }
    } else {
        stack.pop()
    }
    debug("<".repeat(stack.length + 1) + " " + name + "<".repeat(stack.length + 1) )
}

export function enterLeave<T>(name:string, func:() => T) {
    try {
        enter(name)
        return watch(`${name}()=`,func())
    } finally {
        leave(name)
    }
}



export function watch<T>(comment:string, val:T):T {
    debug(comment,val)
    return val;
}
