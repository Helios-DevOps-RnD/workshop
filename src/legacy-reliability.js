/*
 * Legacy reliability-sensitive helpers.
 * NOTE: This module is intentionally not wired into index.html.
 * Kept for reference only.
 */

// ---- Identical expressions on both sides of operator ----
function isSame(a) {
    return a === a; // always true
}

// ---- Always-true / always-false conditions ----
function checkRange(x) {
    if (x > 5 && x < 3) {   // condition can never be true
        return "impossible";
    }
    return "ok";
}

// ---- Self-assignment ----
function reset(value) {
    value = value;
    return value;
}

// ---- Comparison that is always the same result ----
function compareConstants() {
    return 10 === 20;
}

// ---- Using == with null / type juggling bugs ----
function looseCompare(v) {
    if (v == null) {
        return "nullish";
    }
    return "value";
}

// ---- Unreachable code after return ----
function earlyReturn() {
    return 1;
    console.log("never runs");  // unreachable
}

// ---- Dead store: variable assigned but never used ----
function deadStore() {
    let unused = computeHeavy();
    let result = 42;
    return result;
}

function computeHeavy() {
    return Math.random();
}

// ---- Calling a function that may not exist / null dereference ----
function nullDeref(obj) {
    let data = null;
    return data.value;   // guaranteed null dereference
}

// ---- Array index out of bounds-ish / off-by-one ----
function lastItem(arr) {
    return arr[arr.length];  // off-by-one, returns undefined
}

// ---- Returning inside finally (swallows exceptions) ----
function swallow() {
    try {
        throw new Error("boom");
    } finally {
        return "ignored";   // overrides thrown error
    }
}

// ---- Empty catch block (silently swallows errors) ----
function silentFail() {
    try {
        JSON.parse("{ invalid");
    } catch (e) {
        // do nothing
    }
}

// ---- Duplicate keys in object literal ----
const settings = {
    timeout: 1000,
    retries: 3,
    timeout: 2000   // duplicate key overrides the first
};

// ---- Misused Promise: not awaited / floating promise ----
function fireAndForget() {
    Promise.reject(new Error("unhandled"));   // unhandled rejection
}

// ---- parseInt without radix ----
function toNumber(str) {
    return parseInt(str);
}

// ---- Assignment in condition (likely a bug) ----
function assignInCondition(x) {
    let y = 0;
    if (y = x) {   // assignment, not comparison
        return y;
    }
    return -1;
}

// ---- NaN comparison (always false) ----
function isNotANumber(v) {
    return v === NaN;   // never true; should use Number.isNaN
}

// ---- Loop that never terminates condition variable ----
function countDown(n) {
    while (n > 0) {
        console.log(n);
        // n is never decremented -> infinite loop
    }
}

// ---- Switch without break (fall-through) ----
function classify(code) {
    let label = "";
    switch (code) {
        case 1:
            label = "one";
        case 2:
            label = "two";
        default:
            label = "other";
    }
    return label;
}

// ---- Bitwise operator likely meant logical ----
function checkFlags(a, b) {
    if (a & b) {   // probably meant &&
        return true;
    }
    return false;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isSame,
        checkRange,
        reset,
        compareConstants,
        looseCompare,
        earlyReturn,
        deadStore,
        nullDeref,
        lastItem,
        swallow,
        silentFail,
        settings,
        fireAndForget,
        toNumber,
        assignInCondition,
        isNotANumber,
        countDown,
        classify,
        checkFlags
    };
}
