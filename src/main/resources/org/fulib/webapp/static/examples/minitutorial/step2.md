# Mini tutorial step 2.

// To derive method behavior, we will go through multiple 
// examples that show how the desired method should deal 
// with different situations. For each situation we will identify 
// the conditions that trigger the specific behavior. 
// Fulib.org then collects all these condition action rules and 
// generates our method. 

// As example let us plan our shoping trip.
// We prepare a shoping list with a fixed budget. 
// We shall then add items to the shoping list 
// until the budget exceeded. Further items will be ignored. 

There is a shoping-list with budget 30.00.
There are shopping-Items with name meat, bread, and coal
and with price 22.00, 10.00, and 10.00. 

We call add-item with list shoping-list and with item meat. 
As price of meat is less than budget of shoping list,
add-item adds meat to items of list
and add-item removes price of meat from budget of list
and add-item answers with OK. 
