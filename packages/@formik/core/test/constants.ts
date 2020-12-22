import { FormikConfig } from "../src";
import { noop } from "./testHelpers";

export interface TestFormValues {
  name: string;
  email: string;
}

export const testProps: FormikConfig<TestFormValues> = {
  initialValues: {
    name: 'jared',
    email: 'hello@reason.nyc',
  },
  onSubmit: noop
}
