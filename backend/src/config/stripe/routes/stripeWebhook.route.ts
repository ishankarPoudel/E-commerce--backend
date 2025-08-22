import { Router, raw } from "express";
import Stripe from "stripe";

const router = Router();

router.post(
  "/webhooks/stripe",
  raw({ type: "application/json" }),
  async (req, res) => {
    const whsig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
  }
);
