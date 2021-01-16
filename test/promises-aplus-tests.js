var promisesAplusTests = require("promises-aplus-tests");
var Word = require('../index')
var deferred = {}
deferred.promise = new Word((resolve, reject) => {
    deferred.resolve = resolve;
    return deferred.reject = reject
})
var adapter = {
    deferred: function() {
        var defer = {}
        defer.promise = new Word(function(resolve, reject) {
            defer.resolve = resolve;
            return defer.reject = reject
        })
        return defer;
    }
}
promisesAplusTests(adapter, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.log(err);
});