# HTML-based GUIs

> fulib supports some simple HTML-based GUIs.
> The basic type is a UI element.
> A UI that represents a complete page just needs an id.

There is a UI with id loginPage.

> A UI that represents a line within that page needs an id, a description and a parent.

There is a UI with id title and with description "login page" and with parent loginPage.

> To generate the HTML file gui01.html and a screenshot guiO1.html.png (for the loginPage) write:

![loginPage](gui01.html.png)

> A simple description like "login page" becomes a label, i.e. a text centered in a line.
> To create an input field, use a description like "input <name> <prompt text>".

There is a UI with id inputField and with description "input userName name?" and with parent loginPage.

> "userName" is the key that will allow you to read and write the text within that input field.

![loginPage](gui02.html.png)

> Finally, there is a description like "button ok gui04.html" that creates a button
> with text "ok" and on click loads "gui04.html".

There is a UI with id button and with description "button ok gui04.html" and with parent loginPage.

![loginPage](gui03.html.png)

> Let us have gui04.html

There is a UI with id helloPage.
There is a UI with id greetings and with description "hello world" and with parent helloPage.
There is a UI with id backButton and with description "button back gui05.html" and with parent helloPage.

![helloPage](gui04.html.png)

> A page may have parameters which are key value pairs.
> If the key refers to an input field, we write the value into that field.

There is a parameter with key userName and with value Bob.
LoginPage has parameters userName.

> Let us also change the target of our ok button.

Button has description "button ok gui06.html".

> You may also have multiple elements in one line if you separate them with "|":

Button has description "button ok gui06.html | or | button restart gui03.html".

![loginPage](gui05.html.png)

> To see the object structure of our login page write:

![loginPage](loginPage.png)

> Accordingly, lets change our helloPage:

Greetings has description "hello Bob".

![helloPage](gui06.html.png)

> Overall you may create a sequence of pages that serve as a small slide show or mockup for your application.
