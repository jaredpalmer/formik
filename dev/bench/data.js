window.BENCHMARK_DATA = {
  "lastUpdate": 1687288877761,
  "repoUrl": "https://github.com/jaredpalmer/formik",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "name": "jaredpalmer",
            "username": "jaredpalmer"
          },
          "committer": {
            "name": "jaredpalmer",
            "username": "jaredpalmer"
          },
          "id": "8e900fbf8c253fe0c11822986031a16637c6c910",
          "message": "feat: add benchmarking",
          "timestamp": "2023-06-20T16:43:19Z",
          "url": "https://github.com/jaredpalmer/formik/pull/3831/commits/8e900fbf8c253fe0c11822986031a16637c6c910"
        },
        "date": 1687288875431,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "formik (simple example)",
            "value": 11713,
            "range": "±2.98%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "react hook form (simple example)",
            "value": 10280,
            "range": "±3.68%",
            "unit": "ops/sec",
            "extra": "82 samples"
          }
        ]
      }
    ]
  }
}