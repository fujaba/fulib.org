export const msExample =
  '- workflow: smooth case\n' +
  '\n' +
  '- user: Peter Picker\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse overview\n' +
  '    - text: Warehouse Home\n' +
  '    - button: Store Tasks\n' +
  '    - button: Pick Tasks\n' +
  '\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse store tasks\n' +
  '    - text: Warehouse palettes\n' +
  '    - button: add\n' +
  '    - text: empty\n' +
  '\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse add palette\n' +
  '    - text: Store new palette\n' +
  '    - input: barcode\n' +
  '    - input: product\n' +
  '    - input: amount\n' +
  '    - input: location\n' +
  '    - button: ok\n' +
  '\n' +
  '\n' +
  '- service: Warehouse\n' +
  '\n' +
  '- data: Palette p1\n' +
  '  barcode: b001\n' +
  '  product: red_shoes\n' +
  '  product.back: "[palettes]"\n' +
  '  amount: 10\n' +
  '  location: shelf_42\n' +
  '\n' +
  '- data: WHProduct wPro1\n' +
  '  itemName: red_shoes\n' +
  '  amount: 10\n' +
  '\n' +
  '- event: product stored\n' +
  '  barcode: b001\n' +
  '  product: red_shoes\n' +
  '  amount: 10\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: MSProduct mPro1\n' +
  '  itemName: red_shoes\n' +
  '  amount: 10\n' +
  '  state: in stock\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse store tasks\n' +
  '    - text: Warehouse palettes\n' +
  '    - button: add\n' +
  '    - text: b001, 10 red_shoes, shelf_42\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse add palette\n' +
  '    - text: Store new palette\n' +
  '    - input: barcode\n' +
  '    - input: product\n' +
  '    - input: amount\n' +
  '    - input: location\n' +
  '    - button: ok\n' +
  '\n' +
  '- service: Warehouse\n' +
  '\n' +
  '- data: Palette p2\n' +
  '  barcode: b002\n' +
  '  product: red_shoes\n' +
  '  amount: 8\n' +
  '  location: shelf_23\n' +
  '\n' +
  '- data: WHProduct wPro2\n' +
  '  itemName: red_shoes\n' +
  '  amount: 18\n' +
  '\n' +
  '- event: product stored\n' +
  '  barcode: b002\n' +
  '  product: red_shoes\n' +
  '  amount: 8\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: MSProduct mPro2\n' +
  '  itemName: red_shoes\n' +
  '  amount: 18\n' +
  '  state: in stock\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse overview\n' +
  '    - text: Warehouse palettes\n' +
  '    - button: add\n' +
  '    - text: b002, red_shoes, shelf_23\n' +
  '    - text: b001, red_shoes, shelf_42\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse add palette\n' +
  '    - text: Store new palette\n' +
  '    - input: barcode\n' +
  '    - input: product\n' +
  '    - input: amount\n' +
  '    - input: location\n' +
  '    - button: ok\n' +
  '\n' +
  '- service: Warehouse\n' +
  '\n' +
  '- data: Palette p3\n' +
  '  barcode: b003\n' +
  '  product: blue_jeans\n' +
  '  amount: 6\n' +
  '  location: shelf_1337\n' +
  '\n' +
  '- data: WHProduct wPro3\n' +
  '  itemName: blue_jeans\n' +
  '  amount: 6\n' +
  '\n' +
  '- event: product stored\n' +
  '  barcode: b003\n' +
  '  product: blue_jeans\n' +
  '  amount: 6\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: MSProduct mPro3\n' +
  '  itemName: blue_jeans\n' +
  '  state: in stock\n' +
  '  amount: 6\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse overview\n' +
  '    - text: Warehouse palettes\n' +
  '    - button: add\n' +
  '    - text: b003, blue_jeans, shelf_1337\n' +
  '    - text: b002, red_shoes, shelf_23\n' +
  '    - text: b001, red_shoes, shelf_42\n' +
  '\n' +
  '- user: Sabine Sales\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop offers\n' +
  '    - text: Offers overview\n' +
  '    - button: add\n' +
  '    - text: no offers yet\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop add offer\n' +
  '    - text: make new offer\n' +
  '    - input: product\n' +
  '    - input: price\n' +
  '    - button: ok\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: MSProduct mpro4\n' +
  '  itemName: red_shoes\n' +
  '  price: 42\n' +
  '\n' +
  '- event: product offered\n' +
  '  itemName: red_shoes\n' +
  '  price: 42\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop offers\n' +
  '    - text: Offers overview\n' +
  '    - button: add\n' +
  '    - text: red_shoes, 42\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop add offer\n' +
  '    - text: make new offer\n' +
  '    - input: product\n' +
  '    - input: price\n' +
  '    - button: ok\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: MSProduct mpro4\n' +
  '  itemName: blue_jeans\n' +
  '  price: 63\n' +
  '\n' +
  '- event: product offered\n' +
  '  itemName: blue_jeans\n' +
  '  price: 63\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop offers\n' +
  '    - text: Offers overview\n' +
  '    - button: add\n' +
  '    - text: red_shoes, 42\n' +
  '    - text: blue_jeans, 63\n' +
  '\n' +
  '\n' +
  '- user: Carli_Customer\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop offers\n' +
  '    - text: Welcome to our micro shop\n' +
  '    - text: We have\n' +
  '    - text: red_shoes for 42\n' +
  '    - text: blue_jeans for 63\n' +
  '    - button: order\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop buy\n' +
  '    - text: Welcome to our micro shop\n' +
  '    - input: product\n' +
  '    - input: customer\n' +
  '    - input: address\n' +
  '    - button: buy\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: Order o1\n' +
  '  code: o0925_1\n' +
  '  product: red_shoes\n' +
  '  product.back: "[orders]"\n' +
  '  customer: Carli_Customer\n' +
  '  customer.back: "[orders]"\n' +
  '  address: Wonderland 1\n' +
  '  state: new order\n' +
  '\n' +
  '- data: Customer carli\n' +
  '  itemName: Carli_Customer\n' +
  '\n' +
  '- data: MSProduct mPro5\n' +
  '  itemName: red_shoes\n' +
  '  amount: 17\n' +
  '\n' +
  '- event: product ordered\n' +
  '  code: o0925_1\n' +
  '  product: red_shoes\n' +
  '  customer: Carli_Customer\n' +
  '  address: Wonderland 1\n' +
  '\n' +
  '- service: Warehouse\n' +
  '\n' +
  '- data: PickTask pt1\n' +
  '  code: pt_o0925_1\n' +
  '  product: red_shoes\n' +
  '  product.back: "[pickTasks]"\n' +
  '  shelf: "[shelf_42, shelf_23]"\n' +
  '  customer: Carli_Customer\n' +
  '  address: Wonderland 1\n' +
  '  state: picking\n' +
  '\n' +
  '- event: Pick task created\n' +
  '  code: pt_o0925_1\n' +
  '  order: o0925_1\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: Order o2\n' +
  '  code: o0925_1\n' +
  '  state: picking\n' +
  '\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: MicroShop Carli overview\n' +
  '    - text: Welcome Carli\n' +
  '    - text: Your orders are\n' +
  '    - text: red_shoes for 42, picking\n' +
  '    - button: order\n' +
  '\n' +
  '\n' +
  '- user: Peter Picker\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse pick tasks\n' +
  '    - text: Pick tasks overview\n' +
  '    - button: pt_o0925_1, red_shoes, shelf_42, shelf_23\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse pick one\n' +
  '    - text: Pick one\n' +
  '    - input: task\n' +
  '    - input: shelf\n' +
  '    - button: done\n' +
  '\n' +
  '- service: Warehouse\n' +
  '\n' +
  '- data: PickTask pt2\n' +
  '  code: pt_o0925_1\n' +
  '  from: shelf_42\n' +
  '  palette: b001\n' +
  '  palette.back: "[pickTasks]"\n' +
  '  state: shipping\n' +
  '\n' +
  '- data: Palette p5\n' +
  '  barcode: b001\n' +
  '  amount: 9\n' +
  '\n' +
  '- data: WHProduct wPro6\n' +
  '  itemName: red_shoes\n' +
  '  amount: 17\n' +
  '\n' +
  '- event: order picked\n' +
  '  order: o0925_1\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: Order o3\n' +
  '  code: o0925_1\n' +
  '  state: shipping\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse pick tasks\n' +
  '    - text: Pick tasks overview\n' +
  '    - text: no tasks, have a break\n' +
  '\n' +
  '\n' +
  '- user: Dora Delivery\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse delivery tasks\n' +
  '    - text: Delivery tasks overview\n' +
  '    - button: red_shoes, Wonderland 1\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse deliver\n' +
  '    - text: Delivering\n' +
  '    - input: order\n' +
  '    - button: done\n' +
  '\n' +
  '- service: MicroShop\n' +
  '\n' +
  '- data: Order o2\n' +
  '  code: o0925_1\n' +
  '  state: delivered\n' +
  '\n' +
  '- event: order delivered\n' +
  '  order: o0925_1\n' +
  '\n' +
  '- page:\n' +
  '    - pageName: Warehouse delivery tasks\n' +
  '    - text: Delivery tasks overview\n' +
  '    - text: everything delivered, you are a hero\n' +
  '\n' +
  '\n' +
  '- workflow: out of stock\n' +
  '\n' +
  '- user: Carli_Customer\n' +
  '\n' +
  '- event: product ordered\n' +
  '  itemName: PS5\n' +
  '\n' +
  '- event: order rejected\n' +
  '  message: out of stock\n' +
  '\n';
