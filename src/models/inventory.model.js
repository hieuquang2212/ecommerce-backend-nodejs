'use strict'

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_TYPE = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
    inven_productId: { type: Schema.Types.ObjectId, ref: 'product' },
    inven_location: { type: String, default: 'unknow' },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inven_reservations: { type: Array, default: [] }
    /*
        cardId,
        stock: 1,
        createdOn:
    */
},
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = {
    inventory: model(DOCUMENT_TYPE, inventorySchema)
}