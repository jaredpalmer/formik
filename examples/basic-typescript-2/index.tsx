import { useFormik } from 'formik';
import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';

const App = () => {
  const formik = useFormik({
    initialValues: {
      name: {
        first: '',
        last: '',
      },
      email: '',
    },
    onSubmit(_values, _helpers) {}
  });

  React.useEffect(() => {
    formik.setFieldValue('name.first', 'john');
  }, []);
  
  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={formik.handleSubmit}>
          <label>
          First Name
          <input name="user.first" placeholder="John" />
          </label>

          <label>
            Last Name
            <input name="name.last" placeholder="Doe" />
          </label>

          <label>
            Email
            <input
              name="email"
              placeholder="john@acme.com"
              type="email"
            />
          </label>

          <button type="submit">Submit</button>
        </form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
