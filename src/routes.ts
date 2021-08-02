import { Router } from "express";
import UserController from "./controllers/userController";
import PresidentController from "./controllers/presidentController";
import CoachController from "./controllers/coachController";
import RegionController from "./controllers/regionController";
import CountryController from "./controllers/countryController";
import TeamController from "./controllers/teamController";
import TendersController from "./controllers/tendersController";
import PlayerController from "./controllers/playerController";
import teamController from "./controllers/teamController";
import tendersController from "./controllers/tendersController";
import sponsorshipController from "./controllers/sponsorshipController";

const authMiddleware = require("./middlewares/auth");
const adminMiddleware = require("./middlewares/admin");

const routes = Router();

routes.post("/register", UserController.create);
routes.post("/login", UserController.login);

routes.post("/create/region", adminMiddleware, RegionController.create);
routes.get("/getregions", RegionController.getAll);

routes.post("/create/country", adminMiddleware, CountryController.create);
routes.get("/regioncountries/:regionId", CountryController.getCountries);
routes.get("/countryleagues/:countryId", CountryController.getLeagues);
routes.get("/countries", CountryController.getCountriesList);

routes.post("/create/player", adminMiddleware, PlayerController.create);

routes.post("/create/team", adminMiddleware, TeamController.create);
routes.get("/leagueteams/:leagueId", TeamController.getTeams);
routes.get("/teaminfo/:teamId", teamController.getTeam);

routes.post(
  "/create/sponsorship",
  adminMiddleware,
  sponsorshipController.create
);
routes.get("/getsponsorships", authMiddleware, teamController.getSponsorships);
routes.post(
  "/selectsponsorship",
  authMiddleware,
  teamController.selectSponsorship
);

routes.post("/showinterest", authMiddleware, CoachController.showInterest);
routes.post("/removeinterest", authMiddleware, CoachController.removeInterest);

routes.post("/send/tenders/team", authMiddleware, TendersController.teamSend);
routes.post(
  "/counteroffer/tenders/coach/:tenderId",
  authMiddleware,
  TendersController.coachCounteroffer
);
routes.post(
  "/action/tender/coach/:acceptOrCancel/:tenderId",
  authMiddleware,
  TendersController.coachAction
);
routes.post(
  "/counteroffer/tenders/team/:tenderId",
  authMiddleware,
  TendersController.teamCounteroffer
);
routes.post(
  "/action/tender/team/:acceptOrCancel/:tenderId",
  authMiddleware,
  TendersController.teamAction
);
routes.get("/getalltenders", authMiddleware, tendersController.getAllTenders);

routes.post("/team/firecoach", authMiddleware, TeamController.fireCoach);
routes.post("/coach/leaveteam", authMiddleware, CoachController.leaveTeam);

routes.post("/forgot-password", UserController.forgotPassword);
routes.post("/reset-password", UserController.resetPassword);

routes.get("/getuser", authMiddleware, UserController.getUser)

routes.post("/create/coach", authMiddleware, CoachController.create);
routes.get(
  "/coaches/:onlyInterested/:countryId/:coachName",
  authMiddleware,
  CoachController.getCoaches
);
routes.post(
  "/coach/editdescription",
  authMiddleware,
  CoachController.editDescription
);
routes.get("/getcoach/:coachId", CoachController.getCoach);

routes.get(
  "/getprofile/:professionId",
  authMiddleware,
  UserController.getUserProfile
);

routes.post("/create/president", authMiddleware, PresidentController.create);
routes.get(
  "/show/userPresident",
  authMiddleware,
  PresidentController.getPresident
);
routes.post(
  "/president/editdescription",
  authMiddleware,
  PresidentController.editDescription
);

routes.post(
  "/jointeam/president",
  authMiddleware,
  PresidentController.joinTeam
);
routes.post(
  "/leaveteam/president",
  authMiddleware,
  PresidentController.leaveTeam
);

export default routes;
