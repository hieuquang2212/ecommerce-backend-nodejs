'use strict'

const { product, electronic, clothing, furniture } = require('../../models/product.model');
const { Types } = require('mongoose');
const { getSelectData, getUnSelectData } = require('../../utils/index');

const findAllDraftsForShop = async ({ query, limit = 50, skip }) => {
    console.log({ query});
    return await queryProduct(query, limit, skip);
}

const findAllPublishForShop = async ({ query, limit = 50, skip }) => {
    return await queryProduct(query, limit, skip);
}

const searchProductByUser = async ({ keySearch }) => {
    console.log({ keySearch });
    const regexSearch = new RegExp(keySearch);
    const results = await product.find({
        isPublish: true,
        $text: { $search: regexSearch }
    }, { score: { $meta: 'textScore' }})
    .sort({ score: { $meta: 'textScore'}})
    .lean();
    
    console.log({ results });
    return results;
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop:  new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;
    foundShop.isDraft = false;
    foundShop.isPublish = true;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop:  new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;
    foundShop.isDraft = true;
    foundShop.isPublish = false;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1};
    const products = await product.find(filter)
                    .sort(sortBy)
                    .skip(skip)
                    .limit(limit)
                    .select(getSelectData(select))
                    .lean()

    return products;
}

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(getUnSelectData(unSelect));
}

const queryProduct = async (query, limit, skip) => {
    console.log({ query });
    return await product.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: - 1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct
}
