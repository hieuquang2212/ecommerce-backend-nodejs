"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require("../auth/auth.utils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
    1 - check mail in dbs
    2 - match password
    3 - create AT vs RT and save
    4 - generate tokens
    5 - get data return login
  */
  static handleRefreshToken = async (refreshToken) => {
    /* check this token used */
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
    if (foundToken) {
      // decode xem may la thanh nao
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
      // xoa tat ca token 
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened !! Pls relogin');
    }

    // NO, qua ngon
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError('Shop not registered');

    // verify token
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
    console.log('[2]--', { userId, email });
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop not registered');

    // create 1 cap moi
    const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey);

    // update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken // da duoc su dung de lay token moi
      }
    })

    return {
      user: { userId, email },
      tokens
    }
  }

  static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken}) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened !! Pls relogin');
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registed');

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop not registered');

    // create 1 cap moi
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);

    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken // da duoc su dung de lay token moi
      }
    })

    return {
      user,
      tokens
    }
  }

  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    console.log({ foundShop});
    if (!foundShop) throw new BadRequestError('Shop not registered');

    // 2.
    const match = bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailureError('Authentication error');

    // 3.
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    // 4. generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey, 
      publicKey,
      userId
    });
 
    return {
        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
        tokens
    }

  }

  static signUp = async ({ name, email, password }) => {
    // try {
      // step1: check email exists??
      const holderShop = await shopModel
        .findOne({
          email,
        })
        .lean();

      if (holderShop) {
        throw new BadRequestError('Error: Shop already registered');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // created privateKey, publicKey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   },
        //   privateKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   }
        // });
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        // Public key CryptoGraphy

        console.log({ privateKey, publicKey }); // save collection KeyStore

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        });

        if (!keyStore) {
          // return {
          //   code: 'xxxx',
          //   message: 'keyStore error'
          // }
          throw new BadRequestError('Error: KeyStore error');
        }

        // console.log(`publicKeyString::`, publicKeyString);
        // const publicKeyObject = crypto.createPublicKey(publicKeyString);

        // console.log(`publicKeyObject::`, publicKeyObject);

        // created token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
        console.log(`Created Token Success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
      }

      return {
        code: 200,
        metadata: null
      }
    // } 
    // catch (error) {
    //   console.error(error);
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };

  static logout = async ({ keyStore }) => {
    const delKey = await KeyTokenService.removeKeyId(keyStore._id);
    return delKey;
  }
}

module.exports = AccessService;
