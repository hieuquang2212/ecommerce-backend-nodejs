"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require('../core/success.response');


class AccessController {
  handleRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: 'Get token success!',
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    // }).send(res);

    // v2 fixed
    new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    }).send(res);
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout success!',
      metadata: await AccessService.logout({ keyStore: req.keyStore })
    }).send(res);
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res);
  }

  signUp = async (req, res, next) => {
    // try {
      new CREATED({
        message: 'Registered OK!',
        metadata: await AccessService.signUp(req.body),
        options: {
          limit: 10
        }
      }).send(res);
      //return res.status(201).json(await AccessService.signUp(req.body));
    // } catch (error) {
    //   next(error);
    // }
  };

}

module.exports = new AccessController();
