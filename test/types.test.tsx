import { FormikTouched, FormikErrors } from '../src';
import React, { Fragment, ReactNode } from 'react';

describe('Formik Types', () => {
  type Values = { id: string; social: { facebook: string } };

  describe('FormikTouched', () => {
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
  });

  describe('FormikErrors', () => {
    it('it should infer nested object structure of error property from Values', () => {
      const errors: FormikErrors<Values> = {
        id: 'error',
        social: { facebook: 'error' },
      };
      // type errors = {
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

    it('it should optionally support non-string types as error messages (for i18n support)', () => {
      const errors: FormikErrors<Values, ReactNode> = {
        id: <Fragment>error</Fragment>,
      };
      const id: ReactNode = errors.id;
      expect(React.isValidElement(id)).toBeTruthy();
    });
  });
});
