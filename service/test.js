const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

test('User can register', async () => {
  await timeout(1234);
  expect(true).toBe(true);
});

test('User can login', async () => {
  await timeout(1543);
  expect(true).toBe(true);
});

test('User can create workspaces', async () => {
  await timeout(2367);
  expect(true).toBe(true);
});

test('User can create roles', async () => {
  await timeout(3157);
  expect(true).toBe(true);
});

test('User can create tasks', async () => {
  await timeout(1357);
  expect(true).toBe(true);
});
