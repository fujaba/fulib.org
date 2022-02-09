export const msExample =
  `- workflow: smooth case

- user: Peter Picker

- page:
    - pageName: Warehouse overview
    - text: Warehouse Home
    - button: Store Tasks
    - button: Pick Tasks


- page:
    - pageName: Warehouse store tasks
    - text: Warehouse palettes
    - button: add
    - text: empty


- page:
    - pageName: Warehouse add palette
    - text: Store new palette
    - input: barcode
    - input: product
    - input: amount
    - input: location
    - button: ok


- service: Warehouse

- data: Palette p1
  barcode: b001
  product: red_shoes
  product.back: "[palettes]"
  amount: 10
  location: shelf_42

- data: WHProduct wPro1
  itemName: red_shoes
  amount: 10

- event: product stored
  barcode: b001
  product: red_shoes
  amount: 10

- service: MicroShop

- data: MSProduct mPro1
  itemName: red_shoes
  amount: 10
  state: in stock

- page:
    - pageName: Warehouse store tasks
    - text: Warehouse palettes
    - button: add
    - text: b001, 10 red_shoes, shelf_42

- page:
    - pageName: Warehouse add palette
    - text: Store new palette
    - input: barcode
    - input: product
    - input: amount
    - input: location
    - button: ok

- service: Warehouse

- data: Palette p2
  barcode: b002
  product: red_shoes
  amount: 8
  location: shelf_23

- data: WHProduct wPro2
  itemName: red_shoes
  amount: 18

- event: product stored
  barcode: b002
  product: red_shoes
  amount: 8

- service: MicroShop

- data: MSProduct mPro2
  itemName: red_shoes
  amount: 18
  state: in stock

- page:
    - pageName: Warehouse overview
    - text: Warehouse palettes
    - button: add
    - text: b002, red_shoes, shelf_23
    - text: b001, red_shoes, shelf_42

- page:
    - pageName: Warehouse add palette
    - text: Store new palette
    - input: barcode
    - input: product
    - input: amount
    - input: location
    - button: ok

- service: Warehouse

- data: Palette p3
  barcode: b003
  product: blue_jeans
  amount: 6
  location: shelf_1337

- data: WHProduct wPro3
  itemName: blue_jeans
  amount: 6

- event: product stored
  barcode: b003
  product: blue_jeans
  amount: 6

- service: MicroShop

- data: MSProduct mPro3
  itemName: blue_jeans
  state: in stock
  amount: 6

- page:
    - pageName: Warehouse overview
    - text: Warehouse palettes
    - button: add
    - text: b003, blue_jeans, shelf_1337
    - text: b002, red_shoes, shelf_23
    - text: b001, red_shoes, shelf_42

- user: Sabine Sales

- page:
    - pageName: MicroShop offers
    - text: Offers overview
    - button: add
    - text: no offers yet

- page:
    - pageName: MicroShop add offer
    - text: make new offer
    - input: product
    - input: price
    - button: ok

- service: MicroShop

- data: MSProduct mpro4
  itemName: red_shoes
  price: 42

- event: product offered
  itemName: red_shoes
  price: 42

- page:
    - pageName: MicroShop offers
    - text: Offers overview
    - button: add
    - text: red_shoes, 42

- page:
    - pageName: MicroShop add offer
    - text: make new offer
    - input: product
    - input: price
    - button: ok

- service: MicroShop

- data: MSProduct mpro4
  itemName: blue_jeans
  price: 63

- event: product offered
  itemName: blue_jeans
  price: 63

- page:
    - pageName: MicroShop offers
    - text: Offers overview
    - button: add
    - text: red_shoes, 42
    - text: blue_jeans, 63


- user: Carli_Customer

- page:
    - pageName: MicroShop offers
    - text: Welcome to our micro shop
    - text: We have
    - text: red_shoes for 42
    - text: blue_jeans for 63
    - button: order

- page:
    - pageName: MicroShop buy
    - text: Welcome to our micro shop
    - input: product
    - input: customer
    - input: address
    - button: buy

- service: MicroShop

- data: Order o1
  code: o0925_1
  product: red_shoes
  product.back: "[orders]"
  customer: Carli_Customer
  customer.back: "[orders]"
  address: Wonderland 1
  state: new order

- data: Customer carli
  itemName: Carli_Customer

- data: MSProduct mPro5
  itemName: red_shoes
  amount: 17

- event: product ordered
  code: o0925_1
  product: red_shoes
  customer: Carli_Customer
  address: Wonderland 1

- service: Warehouse

- data: PickTask pt1
  code: pt_o0925_1
  product: red_shoes
  product.back: "[pickTasks]"
  shelf: "[shelf_42, shelf_23]"
  customer: Carli_Customer
  address: Wonderland 1
  state: picking

- event: Pick task created
  code: pt_o0925_1
  order: o0925_1

- service: MicroShop

- data: Order o2
  code: o0925_1
  state: picking


- page:
    - pageName: MicroShop Carli overview
    - text: Welcome Carli
    - text: Your orders are
    - text: red_shoes for 42, picking
    - button: order


- user: Peter Picker

- page:
    - pageName: Warehouse pick tasks
    - text: Pick tasks overview
    - button: pt_o0925_1, red_shoes, shelf_42, shelf_23

- page:
    - pageName: Warehouse pick one
    - text: Pick one
    - input: task
    - input: shelf
    - button: done

- service: Warehouse

- data: PickTask pt2
  code: pt_o0925_1
  from: shelf_42
  palette: b001
  palette.back: "[pickTasks]"
  state: shipping

- data: Palette p5
  barcode: b001
  amount: 9

- data: WHProduct wPro6
  itemName: red_shoes
  amount: 17

- event: order picked
  order: o0925_1

- service: MicroShop

- data: Order o3
  code: o0925_1
  state: shipping

- page:
    - pageName: Warehouse pick tasks
    - text: Pick tasks overview
    - text: no tasks, have a break


- user: Dora Delivery

- page:
    - pageName: Warehouse delivery tasks
    - text: Delivery tasks overview
    - button: red_shoes, Wonderland 1

- page:
    - pageName: Warehouse deliver
    - text: Delivering
    - input: order
    - button: done

- service: MicroShop

- data: Order o2
  code: o0925_1
  state: delivered

- event: order delivered
  order: o0925_1

- page:
    - pageName: Warehouse delivery tasks
    - text: Delivery tasks overview
    - text: everything delivered, you are a hero


- workflow: out of stock

- user: Carli_Customer

- event: product ordered
  itemName: PS5

- event: order rejected
  message: out of stock

`;
