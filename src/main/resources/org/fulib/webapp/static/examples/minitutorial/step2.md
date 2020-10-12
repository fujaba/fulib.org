# Mini tutorial step 2.

> To derive method behavior, we will go through multiple 
> examples that show how the desired method should deal 
> with different situations. For each situation we will identify 
> the conditions that trigger the specific behavior. 
> Fulib.org then collects all these condition action rules and 
> generates our method. 

> As example let us plan our shoping trip.
> We prepare a shoping list with a fixed budget. 
> We shall then add items to the shoping list 
> until the budget exceeded. Further items will be ignored. 

There is a shoping-list with budget 30.00.
There are shopping-Items with name meat, bread, and coal
and with price 22.00, 10.00, and 10.00. 
Shoping-list has items meat and bread. 

We call add-item with list shoping-list and with item coal. 
As price of coal is less than budget of shoping-list,
add-item adds coal to items of list
and add-item removes price of coal from budget of list. 
