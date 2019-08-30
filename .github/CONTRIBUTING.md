# Contributing to Formik

1. Fork this repository to your own GitHub account and then clone it to your local device.
2. Install the dependencies: `yarn install`
3. Run `yarn link` to link the local repo to NPM
4. Link Formik's React to local repo `cd node_modules/react && yarn link`
5. Run `yarn start` to build and watch for code changes
6. Run `yarn test` to start Jest
7. Then npm link this repo inside any other project on your local dev with `yarn link formik && yarn link react`
8. Then you can use your local version of Formik within your project
