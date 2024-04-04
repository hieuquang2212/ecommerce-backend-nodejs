'use strict'

const { BadRequestError } = require('../core/error.response');
const { product, clothing, electronic, furniture } = require('../models/product.model');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { findAllDraftsForShop, findAllPublishForShop, publishProductByShop, unPublishProductByShop, searchProductByUser, findAllProducts, findProduct } = require('../models/repositories/product.repo');

// define factory class to create product

class ProductFactory {
    /*
        type: 'Clothing',

    */
    static productRegistry = {};

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];

        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

        return new productClass(payload).createProduct();

        // switch(type) {
        //     case 'Electronic':
        //         return new Electronics(payload).createProduct();
        //     case 'Clothing':
        //         return new Clothing(payload).createProduct();
        //     case 'Furniture':
        //         return new Furnitures(payload).createProduct();
        //     default:  
        //         throw new BadRequestError(`Invalid Product Types ${type}`);
        // }
    }

    // PUT //
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
    // END PUT //

    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        console.log({ product_shop });
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        console.log('publish');
        const query = { product_shop, isPublish: true };
        return await findAllPublishForShop({ query, limit, skip });
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublish: true } }) {
        return await findAllProducts({ limit, sort, filter, page, select: ['product_name', 'product_price', 'product_thumb'] });
    }

    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] });
    }
}

/*
 product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Funiture']},
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: { type: Schema.Types.Mixed, required: true }
*/

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id });
        if (newProduct) {
            // add product_stock in inventory
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }

        return newProduct;
    }
}

// define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        console.log({ newClothing });
        if (!newClothing) throw new BadRequestError('create new clothing error');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('create new product error');

        return newProduct;
    }
}

// class asdd = {
//     asdasdsadsa


//     asdasdasd

//     c
// }

// define sub-class for different product types Electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronic) throw new BadRequestError('create new Electronics error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('create new Electronics error');

        return newProduct;
    }
}

class Furnitures extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurniture) throw new BadRequestError('create new Furnitures error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('create new Furnitures error');

        return newProduct;
    }
}

ProductFactory.registerProductType('Electronic', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furnitures);

module.exports = ProductFactory;