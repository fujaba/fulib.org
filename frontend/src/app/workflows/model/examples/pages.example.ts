export const pagesExample =
  '- workflow: Pages\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Register\n' +
  '    - text: Please register yourself\n' +
  '    - input: E-Mail\n' +
  '    - input: Username\n' +
  '    - password: Password\n' +
  '    - password: Repeat Password\n' +
  '    - button: Register\n' +
  '      targetPage: RegisterFilled\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: RegisterFilled\n' +
  '    - text: Please register yourself\n' +
  '    - input: E-Mail\n' +
  '      fill: test@test.com\n' +
  '    - input: Username\n' +
  '      fill: Carli\n' +
  '    - password: Password\n' +
  '      fill: 1234\n' +
  '    - password: Repeat Password\n' +
  '      fill: 1234\n' +
  '    - button: Register\n' +
  '      targetPage: Login\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Login\n' +
  '    - text: Welcome back\n' +
  '    - input: Username/E-Mail\n' +
  '    - password: Password\n' +
  '    - button: Login\n' +
  '      targetPage: LoginFilled\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: LoginFilled\n' +
  '    - text: Welcome back\n' +
  '    - input: Username/E-Mail\n' +
  '      fill: Carli\n' +
  '    - password: Password\n' +
  '      fill: 1234\n' +
  '    - button: Login\n' +
  '      targetPage: Overview1\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Overview1\n' +
  '    - text: Your current Purchases\n' +
  '    - button: Add Purchase\n' +
  '      targetPage: AddPurchase1\n' +
  '    - button: Logout\n' +
  '      targetPage: Logout\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: AddPurchase1\n' +
  '    - text: New Purchase\n' +
  '    - input: Item\n' +
  '    - input: Amount\n' +
  '    - button: Buy\n' +
  '      targetPage: AddPurchase1Filled\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: AddPurchase1Filled\n' +
  '    - text: New Purchase\n' +
  '    - input: Item\n' +
  '      fill: T-Shirt\n' +
  '    - input: Amount\n' +
  '      fill: 100\n' +
  '    - button: Buy\n' +
  '      targetPage: Overview2\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Overview2\n' +
  '    - text: Your current Purchases\n' +
  '    - text: T-Shirt x100\n' +
  '    - button: Add Purchase\n' +
  '      targetPage: AddPurchase2\n' +
  '    - button: Logout\n' +
  '      targetPage: Logout\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: AddPurchase2\n' +
  '    - text: New Purchase\n' +
  '    - input: Item\n' +
  '    - input: Amount\n' +
  '    - button: Buy\n' +
  '      targetPage: AddPurchase2Filled\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: AddPurchase2Filled\n' +
  '    - text: New Purchase\n' +
  '    - input: Item\n' +
  '      fill: Jeans\n' +
  '    - input: Amount\n' +
  '      fill: 50\n' +
  '    - button: Buy\n' +
  '      targetPage: Overview3\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Overview3\n' +
  '    - text: Your current Purchases\n' +
  '    - text: T-Shirt x100\n' +
  '    - text: Jeans x50\n' +
  '    - button: Add Purchase\n' +
  '    - button: Logout\n' +
  '      targetPage: Logout\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Logout\n' +
  '    - text: See you soon\n' +
  '    - button: Back to login\n' +
  '      targetPage: Login\n' +
  '\n';
