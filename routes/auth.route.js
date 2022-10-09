const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.SERVICEID;

const client = require("twilio")(accountSid, authToken);

let OTP, user;

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, phone, restaurant, address } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same number already exists!" });
    }

    user = new User({
      name,
      phone,
      restaurant,
      address,
    });

    //   let digits = "0123456789";
    //   OTP = "";
    //   for (let i = 0; i < 4; i++) {
    //     OTP += digits[Math.floor(Math.random() * 10)];
    //   }

    //   await client.messages
    //     .create({
    //       body: `Your otp verification for VEcare user ${name} is ${OTP}`,
    //       messagingServiceSid: verifySid,
    //       to: `+91${phone}`,
    //     })
    //     .then(() => res.status(200).json({ msg: "Message Sent" }))
    //     .done();
    // } catch (e) {
    //   res.status(500).json({ error: e.message });
    // }
    await client.verify
      .services(verifySid)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      })
      .then((data) => {
        res.status(200).json({ msg: "Message Sent" });
      })
      .done();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/signup/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // if (otp != OTP) {
    //   return res.status(400).json({ msg: "Incorrect Otp." });
    // }
    // user = await user.save();
    // const token = jwt.sign({ id: user._id }, "passwordKey");
    // res.status(200).json({ token, ...user._doc });
    // OTP = "";

    await client.verify.services(verifySid).verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    });

    user = await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res
      .status(200)
      .json({
        user,
        token,
        msg: "OTP verified successfully and user successfully registered",
      });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

let signinUser;
authRouter.post("/signin", async (req, res) => {
  try {
    const { phone } = req.body;

    signinUser = await User.findOne({ phone });
    if (!signinUser) {
      return res.status(400).json({ msg: "This number does not Exists!!!" });
    }

    // let digits = "0123456789";
    // OTP = "";
    // for (let i = 0; i < 4; i++) {
    //   OTP += digits[Math.floor(Math.random() * 10)];
    // }

    // await client.messages
    //   .create({
    //     body: `Your otp verification for VEcare user ${signinUser.name} is ${OTP}`,
    //     messagingServiceSid: verifySid,
    //     to: `+91${phone}`,
    //   })
    //   .then((message) => res.status(200).json({ msg: "Message Sent" }))
    //   .done();

    await client.verify
      .services(verifySid)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      })
      .then((data) => {
        res.status(200).json({ msg: "Message Sent" });
      })
      .done();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/signin/verify", async (req, res) => {
  try {
    // const { otp } = req.body;
    // if (otp != OTP) {
    //   return res.status(400).json({ msg: "Incorrect Otp." });
    // }
    // const token = jwt.sign({ id: signinUser._id }, "passwordKey");
    // res.status(200).json({ token, ...signinUser._doc });
    // OTP = "";

    const { phone, otp } = req.body;
    await client.verify.services(verifySid).verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    });

    const token = jwt.sign({ id: signinUser._id }, process.env.JWT_SECRET);

    res
      .status(200)
      .json({
        token,
        signinUser,
        msg: "OTP verified successfully and user successfully logged in!",
      });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = authRouter;
