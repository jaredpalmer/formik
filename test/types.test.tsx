import { FormikTouched } from '../src';

// const Form: React.SFC<FormikProps<Values>> = ({
//   values,
//   touched,
//   handleSubmit,
//   handleChange,
//   handleBlur,
//   status,
//   errors,
//   isSubmitting,
// }) => {
//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         onChange={handleChange}
//         onBlur={handleBlur}
//         value={values.name}
//         name="name"
//       />
//       {touched.name && errors.name && <div id="feedback">{errors.name}</div>}
//       {isSubmitting && <div id="submitting">Submitting</div>}
//       {status &&
//         !!status.myStatusMessage && (
//           <div id="statusMessage">{status.myStatusMessage}</div>
//         )}
//       <button type="submit">Submit</button>
//     </form>
//   );
// };

describe('Formik Types', () => {
  describe('FormikTouched', () => {
    type Values = {
      id: string;
      social: {
        facebook: string;
      };
    };

    it('it should correctly infer type of touched property from Values', async () => {
      const touched: FormikTouched<Values> = {};
      // type touched = {
      //    id?: boolean | undefined;
      //    social?: {
      //        facebook?: boolean | undefined;
      //    } | undefined;
      // }
      const id: boolean | undefined = touched.id;
      expect(id).toBeUndefined();
      const social: { facebook?: boolean | undefined } | undefined =
        touched.social;
      expect(social).toBeUndefined();
    });
  });
});
