export default function transformer(file: any, api: any) {
  // j is just a shorthand for the jscodeshift api
  const j = api.jscodeshift;
  const root = j(file.source);
  const done = () => root.toSource();
  const imports = root.find(j.ImportDeclaration, {
    source: { value: 'formik' },
  });

  if (imports.length < 1) {
    return;
  }
  return done();
}
