const Country = require("../models/Countries");
const Team = require("../models/Teams");
const President = require("../models/Presidents");
const Coach = require("../models/Coaches");
const RunningPointsCompetition = require("../models/RunningPointsCompetitions");
const EliminatoryCompetitons = require("../models/EliminatoryCompetitons");
const Sponsorship = require("../models/Sponsorships");

import { Request, Response } from "express";

import jwt_decode from "jwt-decode";

interface data {
  id: string;
}

export default {
  async create(req: Request, res: Response) {
    const {
      name,
      pictureUrl,
      countryId,
      negociabilityLevel,
      regionalCompetitionId,
      nacionalCompetitionId,
      funds,
      stadium,
    } = req.body;

    try {
      if (await Team.findOne({ name })) {
        return res.status(400).send({ error: "This team already exist" });
      }

      if (!(await Country.findOne({ _id: countryId }))) {
        return res.status(400).send({ error: "This country does not exist" });
      }

      const country = await Country.findOne({ _id: countryId });

      const teamData = {
        name,
        countryId: country.id,
        regionId: country.regionId,
        pictureUrl,
        regionalCompetitionId,
        nacionalCompetitionId,
        negociabilityLevel,
        funds: {
          total: funds,
          payroll: 0,
        },
        stadium,
      };

      const team = await Team.create(teamData);

      const nacionalCompetition = await RunningPointsCompetition.findOne({
        _id: nacionalCompetitionId,
      });

      if (!nacionalCompetition) {
        return res.status(400).send({ error: "This competition id is ivalid" });
      }

      nacionalCompetition.teams.push({ name: team.name, teamId: team._id });

      await nacionalCompetition.save();

      // if (regionalCompetitionId !== "") {
      //   const RegionalCompetition = await EliminatoryCompetitons.findOne({
      //     _id: regionalCompetitionId,
      //   });

      //   if (!RegionalCompetition) {
      //     return res
      //       .status(400)
      //       .send({ error: "This competition id is invalid." });
      //   }

      //   RegionalCompetition.teams.push({ name: team.name, teamId: team._id });

      //   await RegionalCompetition.save();
      // }

      return res.status(201).send({ team });
    } catch (err) {
      return res.status(400).send({ erro: "Failed to create " + err });
    }
  },

  async fireCoach(req: Request, res: Response) {
    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      if (!president) {
        return res.status(400).send({ error: "President id is invalid" });
      }

      if (president.teamId === undefined) {
        return res.status(400).send({ error: "President dont have a team" });
      }

      const team = await Team.findOne({ _id: president.teamId });

      if (!team) {
        return res.status(400).send({ error: "Team id is invalid" });
      }

      if (team.coachId === undefined) {
        return res
          .status(400)
          .send({ error: "This team not have a coach to fire" });
      }

      const coach = await Coach.findOne({ _id: team.coachId });

      if (coach.activeContract.terminationFine) {
        team.funds.total =
          team.funds.total - coach.activeContract.terminationFine;
        coach.cash = coach.cash + coach.activeContract.terminationFine;
        team.movements.push({
          description: `Multa recisória do treinador ${coach.username}`,
          value: coach.activeContract.terminationFine,
          type: false,
          date: new Date(),
          coachId: coach._id,
        });
      }

      if (!coach) {
        return res.status(400).send({ error: "Coach id is invalid" });
      }

      team.coachId = undefined;

      coach.teamId = undefined;

      const date = new Date();

      const career = {
        teamId: coach.activeContract.teamId,
        initialDate: coach.activeContract.initialDate,
        finalDate: date,
      };

      coach.career.push(career);

      coach.activeContract = undefined;

      await coach.save();
      await team.save();

      return res.status(200).send({ message: "Coach leave of the team" });
    } catch (err) {
      return res.status(400).send({ error: "Error: " + err });
    }
  },

  async getTeams(req: Request, res: Response) {
    const { leagueId } = req.params;

    try {
      const league = await RunningPointsCompetition.findOne({ _id: leagueId });

      if (!league) {
        return res.status(400).send({ error: "This country does not exist" });
      }

      const teams = await Team.find({ nacionalCompetitionId: leagueId })
        .select("-countryId")
        .select("-regionId")
        .select("-regionalCompetitionId")
        .select("-nacionalCompetitionId")
        .select("-salaryAmount")
        .select("-transferFunds")
        .select("-tenders")
        .select("-__v");

      if (!teams) {
        return res.status(400).send({ error: "Not have a team" });
      }

      return res.status(200).send({ teams });
    } catch (err) {
      return res.status(400).send({ error: "failed to get" + err });
    }
  },

  async getTeam(req: Request, res: Response) {
    const teamData = {
      _id: "",
      name: "",
      pictureUrl: "",
      countryPictureUrl: "",
      president: {
        _id: "",
        name: "",
        countryPictureUrl: ""
      },
      coach: {
        _id: "",
        name: "",
        countryPictureUrl: ""
      },
      players: [],
      interestedCoaches: [],
      sponsorship: {
        name: "",
        pictureUrl: "",
      },
      stadium: {
        _id: "",
        name: "",
        capacityLevel: 0,
        city: "",
      },
      nacionalCompetition: {
        _id: "",
        name: "",
        pictureUrl: "",
        state: "",
      },
      regionalCompetition: {
        _id: "",
        name: "",
        pictureUrl: "",
        state: "",
      },
    };

    const { teamId } = req.params;

    try {
      const team = await Team.findOne({ _id: teamId }).populate([
        "regionalCompetitionId",
        "nacionalCompetitionId",
        "coachId",
        "presidentId",
        "players",
        "sponsorshipId",
        "countryId"
      ]);

      if (!team) {
        return res.status(400).send({ error: "team not found" });
      }

      teamData._id = team._id;
      teamData.name = team.name;
      teamData.pictureUrl = team.pictureUrl;
      teamData.players = team.players;
      teamData.nacionalCompetition._id = team.nacionalCompetitionId._id;
      teamData.nacionalCompetition.name = team.nacionalCompetitionId.name;
      teamData.nacionalCompetition.pictureUrl =
        team.nacionalCompetitionId.pictureUrl;
      teamData.regionalCompetition._id = team.regionalCompetitionId._id;
      teamData.regionalCompetition.name = team.regionalCompetitionId.name;
      teamData.regionalCompetition.pictureUrl =
        team.regionalCompetitionId.pictureUrl;
      teamData.interestedCoaches = team.interestedCoaches;
      teamData.stadium = team.stadium;
      teamData.countryPictureUrl = team.countryId.pictureUrl;

      if (team.sponsorshipId) {
        teamData.sponsorship.name = team.sponsorshipId.name;
        teamData.sponsorship.pictureUrl = team.sponsorshipId.pictureUrl;
      }

      if (team.presidentId) {
        const president = await President.findOne({ _id: team.presidentId}).populate(["countryId"])

        teamData.president.name = team.presidentId.username;
        teamData.president._id = team.presidentId._id;
        teamData.president.countryPictureUrl = president.countryId.pictureUrl;
      }

      if (team.coachId) {
        const coach = await Coach.findOne({ _id: team.coachId}).populate(["countryId"])

        teamData.coach.name = team.coachId.username;
        teamData.coach._id = team.coachId._id;
        teamData.coach.countryPictureUrl = coach.countryId.pictureUrl;
      }

      return res.status(200).send({ teamData });
    } catch (err) {
      return res.status(400).send({ error: "failed to get" + err });
    }
  },

  async getSponsorships(req: Request, res: Response) {
    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      if (!president) {
        return res.status(400).send({ error: "President id is invalid" });
      }

      if (president.teamId === undefined) {
        return res.status(400).send({ error: "President dont have a team" });
      }

      const team = await Team.findOne({ _id: president.teamId });

      if (!team) {
        return res.status(400).send({ error: "Team id is invalid" });
      }

      let haveSponsorship = false

      if (team.sponsorshipId) {
        const sponsorships = await Sponsorship.findOne({
          _id: team.sponsorshipId,
        });

        haveSponsorship = true

        return res.status(200).send({ haveSponsorship, sponsorships });
      } else {
        const sponsorships = await Sponsorship.find({
          level: team.negociabilityLevel,
        });

        return res.status(200).send({ haveSponsorship, sponsorships });
      }
    } catch (err) {
      return res.status(400).send({ error: "Error" + err });
    }
  },

  async selectSponsorship(req: Request, res: Response) {
    const { sponsorshipId } = req.body;

    const { authorization } = req.headers;

    const tokenSplited = authorization.split(" ");

    const token = tokenSplited[1];

    const data: data = jwt_decode(token);

    const { id } = data;

    try {
      const president = await President.findOne({ userId: id });

      if (!president) {
        return res.status(400).send({ error: "President id is invalid" });
      }

      if (president.teamId === undefined) {
        return res.status(400).send({ error: "President dont have a team" });
      }

      const team = await Team.findOne({ _id: president.teamId });

      if (!team) {
        return res.status(400).send({ error: "Team id is invalid" });
      }

      if (!sponsorshipId) {
        return res.status(400).send({ error: "SponsorshipId is required" });
      }

      const sponsorship = await Sponsorship.findOne({ _id: sponsorshipId });

      if (!sponsorship) {
        return res.status(400).send({ error: "SponsorshipId is invalid" });
      }

      if (team.sponsorshipId) {
        return res
          .status(400)
          .send({ error: "Team already has a sponsorship" });
      }

      team.sponsorshipId = sponsorshipId;

      await team.save();

      return res.status(200).send({ team });
    } catch (err) {
      return res.status(400).send({ error: "Error" + err });
    }
  },
};
