function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 10); // Gera uma string aleatória
  const domains = ['example.com', 'test.com', 'mail.com']; // Lista de domínios
  const randomDomain = domains[Math.floor(Math.random() * domains.length)]; // Escolhe um domínio aleatório
  return `${randomString}@${randomDomain}`;
}

describe('Entrega 2', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have login screen', async () => {
    await expect(element(by.text('Entrar'))).toBeVisible();
    await expect(element(by.text('Cadastrar'))).toBeVisible();
  });

  it('should show sign up after tap', async () => {
    await element(by.text('Cadastrar')).tap();
    await expect(element(by.text('Registrar'))).toBeVisible();
  });
  it('should show login screen after register', async () => {
    const randomEmail = generateRandomEmail();
    await element(by.text('Cadastrar')).tap();
    await element(by.id('name-input')).typeText(randomEmail);
    await element(by.id('email-input')).typeText(randomEmail);
    await element(by.id('password-input')).typeText('password123');
    await element(by.text('Registrar')).tap();
    setTimeout(3000);
    await expect(element(by.text('Entrar'))).toBeVisible();
  });

  it('should show home screen after login', async () => {
    await element(by.id('email-input')).typeText("jefferson@gmail.com");
    await element(by.id('password-input')).typeText('1');
    await element(by.text('Entrar')).tap();
    setTimeout(3000);
    await expect(element(by.text('Minhas conversas'))).toBeVisible();
  });
});


