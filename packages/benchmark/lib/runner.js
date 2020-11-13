const Benchmark = require('benchmark');
const tests = require('../dist/index').default;

const suite = new Benchmark.Suite('Formik', {
  minSamples: 50,
});

for (const [name, test] of Object.entries(tests)) {
  suite.add(name, test);
}

console.log('-------------------------Benchmarking-------------------------');

suite
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('error', function (error) {
    console.error(error.target.error);
    suite.abort();
  })
  .on('complete', function () {
    const results = Array.from(suite);
  })
  // run async
  .run({ async: true });
