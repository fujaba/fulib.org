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

## Controller

Stock-man has storage Store24. 


## Prototype

### builder

We call find-board on stock-man with board-id "b42". 
Find-board takes a board from boards of storage of stock-man 
and as id of board is board-id, find-board answers with board.
(Otherwise,) Find-board creates the Board new-board. 
Find-board writes board-id into id of new-board. 
Find-board adds new-board to boards of storage of stock-man. 
Find-board answers with new-board. 

We call find-product on stock-man with product-name "SDM book". 
Find-product takes a product from products of storage of stock-man
and as name of product is product-name, find-product answers with product.

We call find-product on stock-man with product-name "DB book". 
(As find-product cannot find DB book)
find-product creates the product new-product.   
Find-product writes product-name into name of new-product.
Find-product adds new-product to products of storage of stock-man.
Find-product answers with new-product. 

![Store24](find-product.svg)

### gui methods

We call login on stock-man.
Login creates a page with id login-screen 
and with description "Login | button Scan | button Log".
Login writes login-screen into content of stock-man.
Login creates content with id login-in, password-in, login-button-in
and with description "input user?", "input password?", "button login".
Login adds login-in, password-in, login-button-in to content of login-screen. 
Login writes "runLogin login-in password-in scan" into action of login-button-in.

We call run-login on stock-man with login-name "Albert" and with password "secret". 
Run-login writes login-name into description of stock-man. 
Run-login writes login-name into user of stock-man. 

We call scan on stock-man.
Scan creates content with id location-in, product-code-in, items-in, scan-button 
and with description 
  "input location bar code",
  "input product bar code?", 
  "input number of items?",
  "button Done".
Scan writes "runScan location-in product-code-in items-in log" into action of scan-button.   
Scan creates a page with id scan-screen 
and with description "button Login | Scan | button Log"
and with content location-in, product-code-in, items-in, scan-button.
Scan writes scan-screen into content of stock-man.

We call run-scan on stock-man with location b45, with product-code "RE book", with items 42.
Run-scan calls find-board with board-id location.
Run-scan writes the answer into my-board.
Run-scan calls find-product with product-name product-code. 
Run-scan writes the answer into my-product.
Run-scan writes items into items of my-product.
Run-scan adds my-product to products of my-board.  

![Store24](run-scan.svg)

We call log on stock-man.
Log creates a page with id log-screen 
and with description "button Login | button Scan | Log". 
Log takes a product from products of storage of stock-man
and log creates the content new-content 
and log writes name of product into id of new-content
and log adds new-content to content of log-screen
and log creates the Element name-elem 
and log writes name of product into text of name-elem
and log adds name-elem to elements of new-content
and log creates the Element items-elem 
and log writes items of product into text of items-elem
and log adds items-elem to elements of new-content
and as board of product is not empty,
log creates the Element board-elem 
and log writes id of board of product into text of board-elem
and log adds board-elem to elements of new-content.  
Log writes log-screen into content of stock-man. 


We call init on stock-man.
Init creates the Storage theStore and init writes "Store24" into name of theStore.
Init writes theStore into storage of stock-man.
Init writes "stock-man" into id of stock-man.
Init writes "Stock Manager" into description of stock-man. 
Init calls login.

## Run it on heroku. 

// so far manually: https://fulib-warehouse.herokuapp.com/
