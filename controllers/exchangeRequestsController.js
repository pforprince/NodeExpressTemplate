const { ExchangeRequests } = require("../models/ExchangeRequests");
const { handleAsync } = require("../shared/handleAsync");

const addExchangeRequest = handleAsync(async (req, res) => {
  const { rate, currency, paymentMethod, minAmount, maxAmount, action } =
    req.body;

  if (
    !rate ||
    !currency ||
    !paymentMethod ||
    !action ||
    !minAmount ||
    !maxAmount
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required", data: [] });
  }

  const request = new ExchangeRequests({
    userId: req.user._id,
    rate,
    currency,
    minAmount,
    maxAmount,
    action,
    paymentMethod,
    startTime: Date.now(),
    endTime: Date.now() + 2 * 60 * 60 * 1000,
  });

  const savedRequest = await request.save();
  if (savedRequest)
    return res.status(200).json({ message: "Success", data: [] });

  return res.status(400).json({ message: "Invalid request", data: [] });
});

const getActiveExchangeRequests = handleAsync(async (req, res) => {
  const { action, currency } = req.query;

  var query = ExchangeRequests.find({ userId: { $ne: req.user._id } });

  if (action) {
    query = query.find({ action });
  }

  if (currency) {
    query = query.find({ currency });
  }

  const requests = await query
    .populate("userId", "email name")
    .sort("-createdAt");

  if (requests)
    return res.status(200).json({ message: "Success", data: requests });
  return res.status(400).json({ message: "Invalid request", data: [] });
});

// const loginUser= handleAsync(async (req, res)=>{})
// const loginUser= handleAsync(async (req, res)=>{})

module.exports = { getActiveExchangeRequests, addExchangeRequest };

// heroku git:clone exchange-code
