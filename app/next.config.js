module.exports = {
    webpack: (config) => {
        // Note: we provide webpack above so you should not `require` it
        // Perform customizations to webpack config
        if (process.env.FORMIK_REDUCER_REFS) {
            config.resolve.alias['formik'] = '@formik/reducer-refs';
        }

        // Important: return the modified config
        return config;
    },
}
