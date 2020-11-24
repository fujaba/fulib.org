# Mini tutorial step 1.

> Fulib.org supports Scenario Driven Development. 
> The idea of Scenario Driven Development is to first build an 
> object oriented model of a certain situation. Then you turn this into 
> an automatic (JUnit) test that builds this object model and that calls 
> some method to be tested. The called method shall analyse and modify 
> the current situation and it may compute some result value.
> Our test shall then validate that the result value meets our expectation 
> and that the model modifications have been done right. 

> Let's think of a shoping card with several shopping items and we shall 
> compute the total. We start to describe the current situation: 

There is a shoping-card. 
The shoping-card has total 0.00.
There is a shopping-item with name beer and with price 12.00.
There are shopping-Items with name meat, bread, and coal
and with price 22.00, 10.00, and 10.00. 
The shoping-card has items meat, bread, and coal.

> Fulib.org translates this description into Java code that builds
> the described object structure. See the Java Test Code panel to the right 
> (or below).
> The next panel shows a class diagram depicting the used Java classes. 
> With the help of the button below, Fulib.org compiles and runs the 
> generated Java code. 

> The following line asks the generated Java Test Code to generate an object diagram 
> with name before.svg for our shoping-card and its neighbors.
> This is shown in the fourth panel. 

![shoping-card](before.svg)

> Now lets call the method under test: 

We call compute-sum with item-list shoping-card.

> Usually, we implement the method under test manually. 
> However, we may want to outline some simple cases:

Compute-sum writes 0.00 into total of shoping-card. 
Compute-sum takes an item like meat from items of shoping-card
and compute-sum adds 22.00 from price of meat to total of shoping-card. 
(Compute-sum does the same with all other items.)

We expect that total of shoping-card is 42.00.

> An "expect" sentence is used to validate the effects of the method under test. 
> The line above generates the assertEquals test in line 41 of our Java test code. 

> Continue with step 2 of our tutorial for scenario driven method implementation.
