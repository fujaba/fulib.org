# Scenario Italiy delivers Shoes.

## Model

There is the Warehouse51.
There are PalettePlace with id p23x42 and p24x42 and p25x42
and with row 42
and with column 23 and 24 and 25.
Warehouse51 has places p23x42 and p24x42 and p25x42.

There is the WarehouseService WHService with theWarehouse Warehouse51.

## Forklift App

There is a ForkliftDriver with name Alice.

![WHService, Alice](step01.svg)

There is a ForkLifterApp with id ForkLiftGuide and with description "Fork Lift Guide".
There is a Page with id addSupplyPage and with description "New Supply | button Tasks".
ForkLiftGuide has content addSupplyPage.
There is a Content with id lotId and with description "input lot id?".
There is a Content with id productName and with description "input product?".
There is a Content with id lotSize and with description "input lot size?".
There is a Content with id addLotToStoreButton and with description "button add".
AddSupplyPage has content lotId, productName, lotSize, addLotToStoreButton.
![ForkLiftGuide](step03.html)


We write lot1 into value of lotId.
We write "Cloud Sneakers" into value of productName.
We write "20" into value of lotSize.
![ForkLiftGuide](step04.html)

## Adding a Lot

// Alice calls action on addLotToStoreButton.
We call addToStock on WHService
    with id          "lot1",
    with size        20,
    with productId   "CloudSneakers",
and with productName "Cloud Sneakers"
and with newPlace p23x42.

## AddToStock

AddToStock creates a Lot lot
    with id      "lot1" from id,
and with lotSize 20     from size
and with place p23x42   from newPlace.

AddToStock calls buildProduct
    with id   "CloudSneakers"  from productId,
and with name "Cloud Sneakers" from productName.

## BuildProduct

// As WHService has no "Cloud Sneakers" in name of products of theWarehouse,
BuildProduct creates a WarehouseProduct product
    with id   "CloudSneakers" from id,
and with name "Cloud Sneakers" from name.

BuildProduct adds the product to the products of theWarehouse of the WHService.
BuildProduct answers with the product.

## AddToStock

AddToStock writes the product into WarehouseProduct of lot.
AddToStock answers with the lot.
![WHService, Alice](step05.svg)


## Task page

There is a Page with id tasksPage and with description "button New Supply | Tasks".
There is a Content with id lot1Line and with description "lot1 | Cloud Sneakers | 20 | p23x42 | button Done".
We write lot1Line into content of tasksPage.
We write tasksPage into content of ForkLiftGuide.
![ForkLiftGuide](step06.html)

## Second Lot

We write "lot2" into value of lotId.
We write "Ground Boots" into value of productName.
We write addSupplyPage into content of ForkLiftGuide.
![ForkLiftGuide](step07.html)

We call addToStock on WHService
    with id          "lot2",
    with size        20,
    with productId   "GroundBoots",
and with productName "Ground Boots"
and with newPlace p23x42.
![WHService, Alice](step09.svg)



There is a Content with id lot2Line and with description "lot2 | Ground Boots | 20 | p24x42 | button Done".
We write lot2Line into content of tasksPage.
We write tasksPage into content of ForkLiftGuide.
![ForkLiftGuide](step10.html)

![WHService, Alice](step09.tables.html)

![ForkLiftGuide](step00.mockup.html)
