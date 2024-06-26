'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '7 days'
        });

        //

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify::`, err);
            } else {
                console.log(`decode verify::`, decode);
            }
        });

        return { accessToken, refreshToken }

    } catch (error) {

    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1 - Check userUd missing ??
        2 - Get accessToken
        3 - verifyToken
        4 - check user in bds
        5 - check keyStore with this userID
        6 - OK all => return next() 
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    console.log({ userId });
    if (!userId) throw new AuthFailureError('Invalid Request');

    // 2
    const keyStore = await findByUserId(userId);
    console.log({ keyStore });
    if (!keyStore) throw new NotFoundError('Not found KeyStore');

    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    console.log({ accessToken });
    if (!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
        1 - Check userUd missing ??
        2 - Get accessToken
        3 - verifyToken
        4 - check user in bds
        5 - check keyStore with this userID
        6 - OK all => return next() 
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    console.log({ userId });
    if (!userId) throw new AuthFailureError('Invalid Request');

    // 2
    const keyStore = await findByUserId(userId);
    console.log({ keyStore });
    if (!keyStore) throw new NotFoundError('Not found KeyStore');

    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            console.log({ refreshToken }, JWT.verify(refreshToken, keyStore.privateKey));
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            console.log({ decodeUser });
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }

    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    console.log({ accessToken });
    if (!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});


const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}