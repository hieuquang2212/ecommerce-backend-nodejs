"use strict";

const ProductServiceV2 = require("../services/product.service.xxx");

const { SuccessResponse } = require('../core/success.response');


class ProductController {
  creareProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: 'Get token success!',
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    // }).send(res);

    // v2 fixed
    //const { type, payload } =
    // new SuccessResponse({
    //   message: 'Create new Product success !',
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId
    //   })
    // }).send(res);

    new SuccessResponse({
        message: 'Create new Product success !',
        metadata: await ProductServiceV2.createProduct(req.body.product_type, {
          ...req.body,
          product_shop: req.user.userId
        })
      }).send(res);
  }

  // QUERY
  /**
   * @desc Get All ẻDrafts for shop
   * @param {Number} limit
   * @param {Number} skip 
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list draft success!',
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Published success!',
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'UnPublished success!',
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list published success!',
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  }
  
  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list search success',
      metadata: await ProductServiceV2.getListSearchProduct(req.params)
    }).send(res);
  }

getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list all products success',
      metadata: await ProductServiceV2.findAllProducts(req.query)
    }).send(res);
  }

findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get product by id success',
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id
      })
    }).send(res);
  }
  // END QUERY //
}

module.exports = new ProductController();
