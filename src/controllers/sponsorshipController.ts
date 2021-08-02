const Sponsorship = require("../models/Sponsorships");

import { Request, Response } from "express";

export default {
  async create(req: Request, res: Response) {
    const { name, type, value, pictureUrl, level } = req.body;

    try {
      if (!name) {
        return res.status(400).send({ error: "Property name is undefined." });
      }

      if (!type) {
        return res.status(400).send({ error: "Property type is undefined." });
      }

      if (type !== "ticket" && type !== "performance") {
        return res.status(400).send({ error: "Property type is undefined." });
      }

      if (!value) {
        return res.status(400).send({ error: "Property value is undefined." });
      }

      if (!pictureUrl) {
        return res
          .status(400)
          .send({ error: "Property pictureUrl is undefined." });
      }

      if (!level) {
        return res.status(400).send({ error: "Property level is undefined." });
      }

      if (level > 20 || level < 0) {
        return res.status(400).send({ error: "Property level is invalid." });
      }

      if (await Sponsorship.findOne({ name })) {
        return res
          .status(400)
          .send({ error: "This sponsorship already exists." });
      }

      const sponsorshipData = {
        name,
        type,
        value,
        level,
        pictureUrl,
      };

      const sponorship = await Sponsorship.create(sponsorshipData);

      return res.status(200).send(sponorship);
    } catch (err) {
      return res.status(400).send({ error: "failed to create" + err });
    }
  },
};
