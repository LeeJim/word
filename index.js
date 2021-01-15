(function () {
    var $rejected = 0;
    var $resolved = 1;
    var $pending = 2;

    var Word = function (executor) {
        let self = this;
        executor(function onFullfilled(val) {
            return settlePromise(self, $resolved, val);
        }, function onRejected(reason) {
            return settlePromise(self, $rejected, reason);
        });
    };

    Word.prototype.then = function (onFullfilled, onRejected) {
        // 2.2.6
        return addHandler(this, new Word(function() {}), onFullfilled, onRejected);
    };

    Word.prototype._status = $pending;
    Word.prototype._value = '';
    Word.prototype.handlers = [];

    function settlePromise(p, status, value) {
        if (p._status !== $pending) return;

        p._status = status;
        p._value = value;

        var len = p.handlers.length;
        var i = 0;

        while (i++ < len) {
            invokeHandler(p, p.handlers[i]);
        }

        return p;
    }

    function addHandler(p1, p2, onFullfilled, onRejected) {
        // 2.2.1 Both onFulfilled and onRejected are optional arguments
        if (typeof onFullfilled === 'function') {
            p2._onFullfilled = onFullfilled;
        }

        if (typeof onRejected === 'function') {
            p2._onRejected = onRejected;
        }

        if (p1._status === $pending) {
            p1.handlers.push(p2);
        } else {
            invokeHandler(p1, p2);
        }
        
        // 2.2.7
        return p2;
    }

    function invokeHandler(p1, p2) {
        // 2.2.4
        return setTimeout(function() {
            var x, handler = p1._status ? p2._onFullfilled : p2._onRejected;

            // 2.2.7.3
            // 2.2.7.4
            if (handler === undefined) {
                settlePromise(p2, p1._status, p1._value);
                return;
            }

            try {
                // 2.2.5
                x = handler(p1._value);
            } catch(e) {
                // 2.2.7.2
                settlePromise(p2, $rejected, e);
                return;
            }

            // 2.2.7.1
            resolving(p2, x);
        });
    }

    function resolving(p, x) {
        var xthen;

        if (p === x && x) {
            settlePromise(p, $rejected, new TypeError('promise circle chain'));
            return;
        }

        if (x != null && (typeof x === 'function' || typeof x === 'object')) {
            try {
                // 2.3.3.1
                xthen = x.then;
            } catch(e) {
                // 2.3.3.2
                settlePromise(p, $rejected, e);
                return;
            }
            if (typeof xthen === 'function') {
                // 2.3.3.3
                resolvingThen(xthen, x);
            } else {
                // 2.3.3.4
                settlePromise(p, $resolved, x);
            }
        } else {
            // 2.3.4
            settlePromise(p, $resolved, x);
        }
    }

    function resolvingThen(handler, x) {
        var called = false;

        try {
            handler.call(x, function onFulfilled(y) {
                if (called) return;
                called = true;

                resolving(x, y);
            }, function onRejected(r) {
                if (called) return;
                called = true;

                settlePromise(x, $rejected, r);
            });
        } catch(e) { // 2.3.3.3.4
            if (called) return;
            settlePromise(x, $rejected, e);
        }
    }

    try {
        module.exports = Word;
    } catch (e) {
        window.Word = Word;
    }
}());