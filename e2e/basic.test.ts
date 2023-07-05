import { test, expect } from '@playwright/test';

test('should validate before submit', async ({ page }) => {
  await page.goto('/basic');

  // Submit the form
  await page.click('button[type=submit]');

  // Check that all fields are touched and error messages work
  expect(await page.textContent('input[name="firstName"] + p')).toContain(
    'Required'
  );
  expect(await page.textContent('input[name="lastName"] + p')).toContain(
    'Required'
  );
  expect(await page.textContent('input[name="email"] + p')).toContain(
    'Required'
  );

  expect(await page.textContent('#renderCounter')).toContain('0');
});

test('should validate show errors on change and blur', async ({ page }) => {
  await page.goto('/sign-in');

  await page.fill('input[name="username"]', 'john');
  await page.locator('input[name="username"]').blur();
  expect(
    await page.locator('input[name="username"] + p').textContent.length
  ).toEqual(1);

  await page.fill('input[name="password"]', '123');
  await page.locator('input[name="password"]').blur();
  expect(
    await page.locator('input[name="password"] + p').textContent.length
  ).toEqual(1);

  expect(await page.textContent('#error-log')).toContain('[]');
});

test('should validate show errors on blur only', async ({ page }) => {
  await page.goto('/sign-in?validateOnMount=false&validateOnChange=false');

  await page.fill('input[name="username"]', 'john');
  await page.locator('input[name="username"]').blur();
  expect(
    await page.locator('input[name="username"] + p').textContent.length
  ).toEqual(1);

  await page.fill('input[name="password"]', '123');
  await page.locator('input[name="password"]').blur();
  expect(
    await page.locator('input[name="password"] + p').textContent.length
  ).toEqual(1);

  expect(await page.textContent('#error-log')).toContain(
    JSON.stringify(
      [
        // It will quickly flash after `password` blur because `yup` schema
        // validation is async.
        { name: 'password', value: '123', error: 'Required' },
      ],
      null,
      2
    )
  );
});

test('should validate autofill', async ({ page }) => {
  // React overrides `input.value` setters, so we have to call
  // native input setter
  // See: https://stackoverflow.com/a/46012210/1709679
  const setInputValue = async (selector, value) => {
    await page.$eval(selector, (el, value) => (el.value = value), value);
    await page.dispatchEvent(selector, 'change');
  };

  await page.goto('/sign-in');

  await setInputValue('input[name="username"]', '123');
  await setInputValue('input[name="password"]', '123');

  const buttonIsDisabled = await page.$eval(
    'button',
    button => button.disabled
  );
  expect(buttonIsDisabled).toBe(false);
});
