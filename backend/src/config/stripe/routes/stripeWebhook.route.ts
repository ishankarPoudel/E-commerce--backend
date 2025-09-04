import { Router, raw } from "express";
import Stripe from "stripe";
import { AppDataSource } from "../../data-source/data-source";
import { OrderEntity } from "../../../entities/order/orders.entity";
import { stripe } from "../stripe.config";
import { CartEntity } from "../../../entities/cart/cart.entity";

import { MailService } from "../../../services/mail/mail.service";

export const stripeWebHook = Router();

stripeWebHook.post(
  "/webhooks/stripe",
  raw({ type: "application/json" }),
  async (req, res) => {
    const whsig = req.headers["stripe-signature"] as string;
    if (!whsig) {
      console.log("No signature found in headers");
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    if (!Buffer.isBuffer(req.body)) {
      console.error(
        "[Webhook] req.body is not a Buffer (check mount order and raw())"
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, whsig, webhookSecret);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            const orderId = paymentIntent.metadata.orderId;
            if (orderId) {
              await AppDataSource.transaction(
                async (transcationalEntityManager) => {
                  const orderRepo =
                    transcationalEntityManager.getRepository(OrderEntity);
                  const cartRepo =
                    transcationalEntityManager.getRepository(CartEntity);

                  const order = await orderRepo.findOne({
                    where: {
                      id: orderId,
                    },
                    relations: ["user"],
                  });
                  if (order) {
                    (order.status = "paid"),
                      (order.stripeChargeId =
                        (paymentIntent.latest_charge as string) ||
                        (null as any));
                    await orderRepo.save(order);
                    await cartRepo.delete({ user: { id: order.user.id } });
                  }
                  if (order?.user?.email) {
                    await new MailService().sendOrderConfirmationEmail(
                      order.user.email,
                      order
                    );
                  }
                }
              );
            }
          }
          break;

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const orderId = paymentIntent.metadata.orderId;
          if (orderId) {
            await AppDataSource.transaction(
              async (transcationalEntityManager) => {
                const orderRepo =
                  transcationalEntityManager.getRepository(OrderEntity);

                const order = await orderRepo.findOne({
                  where: {
                    id: orderId,
                  },
                  relations: ["user"],
                });

                if (order) {
                  (order.status = "failed"),
                    (order.stripeChargeId =
                      (paymentIntent.latest_charge as string) || (null as any));
                  await orderRepo.save(order);
                }
              }
            );
          }
          break;
        }
        default:
          break;
      }
      res.status(200).send("Received");
    } catch (e) {
      res.status(500).send("Webhook Error");
    }
  }
);
