const { ExchangeRequests } = require("../models/ExchangeRequests");
const { handleAsync } = require("../shared/handleAsync");

const addExchangeRequest = handleAsync(async (req, res) => {
  const { rate, currency, paymentMethod, minAmount, maxAmount } = req.body;

  if (!rate || !currency || !paymentMethod) {
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
  const requests = await ExchangeRequests.find().populate(
    "userId",
    "email name -_id"
  );

  if (requests)
    return res.status(200).json({ message: "Success", data: requests });

  return res.status(400).json({ message: "Invalid request", data: [] });
});

// const loginUser= handleAsync(async (req, res)=>{})
// const loginUser= handleAsync(async (req, res)=>{})

module.exports = { getActiveExchangeRequests, addExchangeRequest };
