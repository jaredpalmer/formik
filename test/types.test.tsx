import { FormikTouched } from '../src';

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
