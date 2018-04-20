import { FormikTouched, FormikErrors } from '../src';

describe('Formik Types', () => {
  describe('FormikTouched', () => {
    type Values = {
      id: string;
      social: {
        facebook: string;
      };
    };

    it('it should infer nested object structure of touched property from Values', () => {
      const touched: FormikTouched<Values> = {
        id: true,
        social: { facebook: true },
      };
      // type touched = {
      //    id?: boolean | undefined;
      //    social?: {
      //        facebook?: boolean | undefined;
      //    } | undefined;
      // }
      const id: boolean | undefined = touched.id;
      expect(id).toBe(true);
      const facebook: boolean | undefined = touched.social!.facebook;
      expect(facebook).toBe(true);
    });

    it('it should infer nested object structure of error property from Values', () => {
      const errors: FormikErrors<Values> = {
        id: 'error',
        social: { facebook: 'error' },
      };
      // type touched = {
      //    id?: {} | undefined;
      //    social?: {
      //        facebook?: {} | undefined;
      //    } | undefined;
      // }
      const id: {} | undefined = errors.id;
      expect(id).toBe('error');
      const facebook: {} | undefined = errors.social!.facebook;
      expect(facebook).toBe('error');
    });
  });
});
