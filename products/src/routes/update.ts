import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { Product } from './../models/products';

import {
  setCurrentUser,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@jong_ecommerce/common';

const router = express.Router();

router.put(
  '/api/products/:id',
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findOne({ _id: req.params.id });

    if (!product) {
      return next(new NotFoundError());
    }

    // product's owner's id and current user's id
    if (product.userId !== req.currentUser?.id) {
      return next(new NotAuthorizedError());
    }
    let amount, title, price, description;
    amount = req.body.amount === undefined ? product.amount : req.body.amount;
    title = req.body.title === undefined ? product.title : req.body.title;
    price = req.body.price === undefined ? product.price : req.body.price;
    description =
      req.body.description === undefined
        ? product.description
        : req.body.description;

    if (price < 0) return next(new BadRequestError('wrong input'));
    product.set({
      title,
      price,
      description,
      amount,
    });

    await product.save();

    res.status(200).send(product);
  }
);

export { router as updateRouter };
