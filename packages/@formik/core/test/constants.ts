import { FormikConfig } from "../src";
import { noop } from "./testHelpers";

export interface TestFormValues {
  name: string;
  email: string;
}

export const testProps: FormikConfig<TestFormValues> = {
  initialValues: {
    name: "johnrom",
    email: "test@johnrom.com",
  },
  onSubmit: noop
}
