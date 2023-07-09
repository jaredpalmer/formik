import { FormikErrors, FormikProps, FormikTouched } from '../src';

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

  it('FormikProps', () => {
    type Values = {
      user: { 
        lastName: string; 
        firstName: string; 
        10: string;
      };
      action: 'testing';
    };
    type Props = FormikProps<Values>;
    
    function expectType<T>(_: T) {
      expect(true).toBe(true);
    }

    // @ts-expect-error
    expectType<Parameters<Props['getFieldHelpers']>[0]>('unexpected');
      
    // @ts-expect-error
    expectType<Parameters<Props['getFieldMeta']>[0]>('randomText');

    // @ts-expect-error
    expectType<Parameters<Props['getFieldProps']>[0]>('');

    // @ts-expect-error
    expectType<Parameters<Props['setFieldValue']>[0]>('ucer');

    // @ts-expect-error
    expectType<Parameters<Props['setFieldError']>[0]>('firstName');

    // @ts-expect-error
    expectType<Parameters<Props['setFieldTouched']>[0]>('action10');

    expectType<Parameters<Props['getFieldHelpers']>[0]>('user');
    expectType<Parameters<Props['getFieldMeta']>[0]>('action');
    expectType<Parameters<Props['getFieldProps']>[0]>('user.firstName');
    expectType<Parameters<Props['setFieldValue']>[0]>('user.lastName');
    expectType<Parameters<Props['setFieldError']>[0]>('user.10');
    expectType<Parameters<Props['setFieldTouched']>[0]>('action');
  })
});
