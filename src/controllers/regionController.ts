const Region = require("../models/Regions");
const EliminatoryCompetition = require("../models/EliminatoryCompetitons");

import { Request, Response } from "express";

export default {
  async create(req: Request, res: Response) {
    const {
      name,
      mainRegionalCompetitionName,
      secondaryRegionalCompetitionName,
      secondaryRegionalCompetitionPictureUrl,
      mainRegionalCompetitionnumberOfTeams,
      secondaryRegionalCompetitionnumberOfTeams,
      mainRegionalCompetitionPictureUrl,
    } = req.body;
    const regionData = { name };
    const mainRegionalCompetitionData = {
      name: mainRegionalCompetitionName,
      numberOfTeams: mainRegionalCompetitionnumberOfTeams,
      pictureUrl: mainRegionalCompetitionPictureUrl,
      regionId: "",
    };
    const secondaryRegionalCompetitionData = {
      name: secondaryRegionalCompetitionName,
      numberOfTeams: secondaryRegionalCompetitionnumberOfTeams,
      pictureUrl: secondaryRegionalCompetitionPictureUrl,
      regionId: "",
    };

    try {
      if (await Region.findOne({ name })) {
        return res.status(400).send({ error: "This region already exists" });
      }

      if (await Region.findOne({ mainRegionalCompetitionName })) {
        return res
          .status(400)
          .send({ error: "This competition already exist" });
      }

      if (await Region.findOne({ secondaryRegionalCompetitionName })) {
        return res
          .status(400)
          .send({ error: "This competition already exist" });
      }

      await Region.create(regionData);

      const region = await Region.findOne({ name: regionData.name });

      mainRegionalCompetitionData.regionId = region._id;
      secondaryRegionalCompetitionData.regionId = region._id;

      const mainRegionalCompetition = await EliminatoryCompetition.create(
        mainRegionalCompetitionData
      );
      const secondaryRegionalCompetition = await EliminatoryCompetition.create(
        secondaryRegionalCompetitionData
      );

      region.mainRegionalCompetitionId = mainRegionalCompetition._id;
      region.secondaryRegionalCompetitionId = secondaryRegionalCompetition._id;

      const data = await region.save();

      return res.status(201).send({ data });
    } catch (err) {
      return res.status(400).send({ error: "failed to create" + err });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const Regions = await Region.find();

      return res.status(200).send({ Regions });
    } catch (err) {
      return res.status(400).send({ error: "Failed to get" + err });
    }
  },
};
