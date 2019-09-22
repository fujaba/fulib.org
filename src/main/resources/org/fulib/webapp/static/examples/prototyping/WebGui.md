# Stock-manager. 

## Basic elements. 

There is a storage with name Store24. 

There are products with name SDM book, Java book, Veltins bottle
and with items 1, 1, 24. 

There are boards with id b42 and b43.

Store24 has boards and is store of b42 and b43.
Store24 has products and is store of SDM book, Java book, Veltins bottle.
B42 has products and is board of SDM book, Java book.
B43 has products Veltins Bottle.

![Store24](objects.svg)

## GUI mockups

### Building blocks. 

There is a Stock-App with id stock-man 
and with description "Stock Manager".

There is a Page with id login-page 
and with description "Login | button Scan | button Log".
Stock-man has content login-page.

There are contents with id name-in, pass-in
and with description "input name?", "input password?".
There is a content with id login-button and with description "button login"
and with action "login pal-in product-in items-in Scan".
Login-page has content name-in, pass-in, login-button.

There are elements with id product-code, product-name, product-items, product-board, del-button and 
with text "book-4004", "Story Driven Modeling", "1", "b42", "button Del". 
Del-button has action "del-log-entry".
There is a content with id log-line1 and with elements product-code, product-name, product-items, product-board, del-button.

### Login screen

![stock-man](gui.svg)

![stock-man](stock01.html)

We write Albert into value of name-in. 

![stock-man](stock02.html)

We write secret into value of pass-in. 

![stock-man](stock03.html)

We call login on Store24 with name value of name-in and with passwd value of pass-in. 
Login creates a user and
Login writes name into name of user and 
Login writes passwd into passwd of user and 
Login writes user into user of Store24. 

![Store24](user.svg)


We write "Albert Stock Manager" into description of stock-man.
There is a Page with id scan-page 
and with description "button Login | Scan | button Log".
There is a content with id barcode-in and with description "input barcode?".
There is a content with id submit-button and with description "button submit"
and with action "do-scan barcode-in Log".
Scan-page has content barcode-in and submit-button. 
We write scan-page into content of stock-man. 

![stock-man](stock04.html)


![stock-man](stock01-04.mockup.html)
