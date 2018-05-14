export const APILINKS: {
  title: string;
  to: string;
  links: {
    [name: string]:
      | string
      | {
          to: string;
          links: {
            [name: string]: string;
          };
        };
  };
}[] = [
  {
    title: 'Examples',
    to: '#',
    links: {
      Basic: '/examples/basic',
      'Sync Validation': '/examples/sync-validation',
      'Async Validation': '/examples/async-validation',
      'Schema Validation': '/examples/schema-validation',
      'Custom Inputs': '/examples/custom-inputs',
      Arrays: '/examples/arrays',
      'Multi-step / Wizard': '/examples/multi-step',
      // 'Prepopulated Data': '#',
      // 'Lifecycle Methods': '#',
      // 'Class Component': '#',
      // 'Without Context': '#',
      // 'Without Render Callbacks': '#',
    },
  },
  {
    title: 'Guides',
    to: '#',
    links: {
      Basics: '/docs/basics',
      Philosophy: '/docs/philosophy',
      // Testing: '#',
      // Performance: '#',
      // 'Formik vs. Redux-Form': '#',
      // TypeScript: '#',
    },
  },

  {
    title: 'Blueprints',
    to: '#',
    links: {
      'Draft.js': '#',
      'React-Select': '#',
      'React-Color': '#',
      'React-Autocomplete': '#',
      'React-Autosuggest': '#',
      'React-Dates': '#',
      Rheostat: '#',
    },
  },
  {
    title: 'API Reference',
    to: '/docs/api',
    links: {
      '<Field />': {
        to: '/docs/api#field',
        links: {
          'Field render methods': '/docs/api#field-render',
          'Field props': '#',
          component: '#',
          'name: string': '#',
          'id: string': '#',
        },
      },
      '<Form />': {
        to: '#',
        links: {
          'Form props': '#',
        },
      },
      '<Formik />': {
        to: '#',
        links: {
          'Formik render methods': '#',
          'Formik props': '#',
          component: '#',
          render: '#',
        },
      },
      FormikFactory: {
        to: '#',
        links: {
          Options: '#',
          'Injected props': '#',
        },
      },
      '<Debug />': {
        to: '#',
        links: {},
      },
      '<Error />': {
        to: '#',
        links: {},
      },
    },
  },
];
