'use strict'

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_TYPE = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the Mongo model
const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop'
    },
    publicKey: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },
    refreshTokenUsed: {
      type: Array,
      default: []
    },
    refreshToken: { 
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_TYPE, keyTokenSchema);