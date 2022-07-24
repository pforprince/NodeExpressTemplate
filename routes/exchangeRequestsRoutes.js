const {
  getActiveExchangeRequests,
  addExchangeRequest,
} = require("../controllers/exchangeRequestsController");

const router = require("express").Router();

router.use(require("../middlewares/Authenticated"));

router.get("/requests", getActiveExchangeRequests);
router.post("/place", addExchangeRequest);

module.exports = router;
