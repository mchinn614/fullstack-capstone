# recycle-app

https://recycle-app.herokuapp.com/

## Summary
This app enables users to track the recyclability of their purchases.

Users will log in to their profile, add items to the purchase history by UPC (barcode), and check the that materials for these items are accurate. Once the user adds all their purchases, they can view a summary of the recyclability of their purchases

## How to use the app

#### Landing Page
Log in or create account to start tracking your purchases
![login](public/images/Login.JPG)

#### Profile
View a history of all user purchases. Delete as appropriate. View a pie chart of the percentage of recyclable items from your puchase history. For now, the recyclabilty of the materials are based on the guidance from Recology in San Francisco, CA.
![profile](public/images/Profile.JPG)

#### Add Item
Add items based on UPC. 
![AddItem](public/images/AddItem.JPG)

Add the materials that are disposed off from this item OR up/down vote the current materials based on your perception of accuracy. Repeate process as needed.
![AddMaterial](public/images/Vote-AddMaterial.JPG)

## Technology Used
The recycle-app uses jQuery, javascript, HTML, and CSS. The app was created using nodejs and API was created using Express. The data is persisted using Atlas (mongoDB).  https://api.upcitemdb.com API is used to relate UPCs to items. 

## API
The app uses the following API endpoint. All HTTP requests must use Bearer Authorization with a JSON Web Token.  Note that all Id parameters refer to the uniqueid assigned by the Mongodb database.
API URL: https://recycle-app.herokuapp.com/api

### GET Endpoints

#### /materials
returns all materials in database

#### /upc/*upc*
path param as upc. Returns item object

#### /item/*itemId*
path param is unique database id for given item. Get unique id using /upc/*upc* endpoint. Returns item object

#### /voteCount
send materialId=*materialId*&itemId=*itemId* as query params. Returns current up/down vote count for item/material combination

#### /userVote
send materialId=*materialId*&itemId=*itemId*&userId=*userId* as query params. Returns the user's up/down vote for a given item/material combination


#### /purchase/*userId*
Send userId as path param. Returns the purchase history for that user.

### POST endpoints

#### /purchase
Send {userId:*userId*,itemId:*itemId*} in body as json to register the purchase of an item to that user

#### /addMaterialtoItem
Send {materialId:*materialId*,itemId:*itemId*} in body as json to register the a material to a given item

#### /vote
Send {userId:*userId*,itemId:*itemId*,vote:*vote*,materialId:*materialId*} in body to register user vote for a given item/material combination. Vote can be 1 for an up vote or -1 for a downvote. This endpoint will also edit the current vote of the user if a vote already exists.

### DELETE endpoints

#### /purchase
Send {itemId:*itemId*,userId:*userId*} in body to delete an item from the given users profile.

## Future Plans
In the future, new materials can be added to the database. Recycling guidance for other cities will be added 
