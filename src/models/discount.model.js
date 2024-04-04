'use strict'

'use strict'

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_TYPE = "Discount";
const COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
const discountSchema = new Schema({
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: 'fixed_amount' }, // percentage
    discount_value: { type: Number, required: true }, // 10.000, 10
    discount_code: { type: String, required: true }, // ma giam gia
    discount_start_date: { type: Date, required: true }, // ngay bat dau
    discount_end_date: { type: Date, required: true }, // ngay ket thuc
    discount_max_uses: { type: Number, required: true }, // so luong discount duoc ap dung
    discount_uses_count: { type: Number, requried: true }, // so disount da su dung
    discount_users_used: { type: Array, default: [] },// ai su dung
    discount_max_uses_per_users: { type: Number, required: true }, // so luong cho phep to da moi user
    discount_min_order_value: { type: Number, required: true, default: 0 },
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: { type: String, requried: true, enum: ['all', 'specific'] },
    discount_product_ids: { type: Array, default: [] } // so san pham duoc ap dung
},
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = model(DOCUMENT_TYPE, discountSchema);