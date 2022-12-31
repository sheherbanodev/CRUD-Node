const express = require("express");
const errorHandler = require("../../middleware/error");
const User = require("../../models/user");
const { generateAuthToken } = require("../../utils/helpers");
const createUserSchema = require("./validationSchema");
//const authHandler=require("../../middleware/auth");

const router = express.Router();

// create a get route

router.get(
  "/",
  errorHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).send(users);
  })
);

// create a get one by id route

router.get(
  "/viewProfile/:userId",
  errorHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });
    const authToken = req.headers.authorization;
    if (authToken !== user.authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(200).send(user);
  })
);
router.put(
  "/editProfile/:userId",
  errorHandler(async (req, res) => {
    const user = await User.findOneAndUpdate({ _id: req.params.userId });

    res.status(200).send(user);
  })
);
router.delete(
  "/editProfile/:userId",
  errorHandler(async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.params.userId });

    res.status(200).send(user);
  })
);

// create a login route

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send({ message: "Invalid Email or Password" });
  }

  if (req.body.password !== user.password) {
    return res.status(400).send({ message: "Invalid Password" });
  }

  const token = generateAuthToken({
    username: user.username,
    email: user.email,
    id: user._id,
  });

  const data = {
    username: user.username,
    email: user.email,
    id: user._id,
  };

  res.status(200).send({ message: "success", token, data });
});

// create a get signup route

router.post("/signup", async (req, res) => {
  const payload = req.body;

  const { error } = User(payload);

  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  let user = new User(payload);
  user = await user.save();
  res.status(200).send({ user });
});

router.post("/", async (req, res) => {
  const payload = req.body;
  const { error } = createUserSchema(payload);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  let user = new User(payload);

  user = await user.save();
  res.status(200).send({ user });
});

module.exports = router;
