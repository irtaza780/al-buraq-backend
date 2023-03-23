require("dotenv").config();
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { text } = require("body-parser");

const createToken = async (user) => {
  try {
    //generate access token
    // console.log("process", process.env.JWT_TOKEN_KEY, process.env.ACCESS_TOKEN_EXPIRY, process.env.JWT_REFRESHTOKEN_KEY)
    const token = jwt.sign({ id: user.id }, process.env.JWT_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    //generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESHTOKEN_KEY
    );

    return {
      accessToken: token,
      refreshToken: refreshToken,
    };
  } catch (err) {
    console.log("error", err);
    return { error: true };
  }
};

const makeCode = async () => {
  try {
    var text = "";
    var possible = "0123456789";
    let notExist = true;
    do {
      for (var i = 0; i < 4; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      let code = await db.users.findOne({
        where: {
          code: text,
        },
        raw: true,
      });
      console.log("resetCode", code);
      console.log("text is ", text);
      if (code === null) {
        console.log("reaching");
        notExist = false;
      }
    } while (notExist);
    if (text) {
      return { found: text };
    } else {
      return { not_found: "no code found." };
    }
  } catch (err) {
    console.log("error", err);
    return { error: true };
  }
};

/********************** ****************************/

exports.registerEmail = async (req, res, next) => {
  try {
    let { firstName, lastName, email, password, image } = req.body;
    if (email) {
      let emailExist = await db.users.findOne({
        where: {
          email: email,
        },
        raw: true,
      });
      password = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SALT));

      if (emailExist) {
        if (emailExist?.isVerified === "1") {
          res.status(409).send({
            success: false,
            message: "This Email is already registered.",
          });
        } else {
          let code = await makeCode();
          if (code?.found) {
            let mailTransporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "irtaza780@gmail.com",
                pass: "ehdzwktzemziywdr",
              },
            });
            let mailDetails = {
              from: "irtaza780@gmail.com",
              to: email,
              subject: "Verification Code Al-Buraq",
              text: "your verification code is " + code?.found,
            };
            mailTransporter.sendMail(mailDetails, (err) => {
              if (err) {
                console.log("There's an error", err);
              } else {
                console.log("email sent");
              }
            });

            let updatedCode = await db.users.update(
              {
                code: code?.found,
              },
              {
                where: {
                  email,
                },
              }
            );
            console.log(
              // "twilioMessage",
              // twilioMessage,
              "updatedCode",
              updatedCode
            );
            if (updatedCode[0] > 0) {
              res.status(200).send({
                success: true,
                message: "Verification Code is Sent on Your Number.",
              });
            } else {
              console.log("try again.");
              res.send({ success: false, message: "try again." });
            }
          } else if (code?.not_found) {
            console.log("no code are available.");
            res.send({
              success: false,
              message: "Could not Send Verification Code. Try Again.",
            });
          } else if (code?.error) {
            console.log("Server Error.");
            res.status(503).send({ success: false, message: "Server Error." });
          } else {
            console.log("Something else.");
          }
        }
      } else {
        let code = await makeCode();
        if (code?.found) {
          // console.log("authenticated", client);

          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "irtaza780@gmail.com",
              pass: "ehdzwktzemziywdr",
            },
          });
          let mailDetails = {
            from: "irtaza780@gmail.com",
            to: email,
            subject: "Verification Code Al-Buraq",
            text: "your verification code is " + code?.found,
          };
          mailTransporter.sendMail(mailDetails, (err) => {
            if (err) {
              console.log("There's an error", err);
            } else {
              console.log("email sent");
            }
          });
          let addedCode = await db.users.create({
            code: code?.found,
            firstName,
            lastName,
            email,
            password,
            image,
          });
          if (addedCode) {
            // console.log("twilioMessage", twilioMessage);
            res.status(200).send({
              success: true,
              message: "Verification Code is Sent on Your Email.",
            });
          } else {
            console.log("try again.");
            res.send({ success: false, message: "try again." });
          }
        } else if (code?.not_found) {
          console.log("no code are available.");
          res.send({
            success: false,
            message: "Could not Send Verification Code. Try Again.",
          });
        } else if (code?.error) {
          console.log("Server Error.");
          res.status(503).send({ success: false, message: "Server Error." });
        } else {
          console.log("Something else.");
        }
      }
    } else {
      res.status(400).send("send a phone number.");
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

//on number register
exports.verifyOtpCode = async (req, res, next) => {
  try {
    // let code = req.body.code;
    // let email =  req.body.email;
    let { code, email } = req?.body;

    if (code && email) {
      let verifiedCode = await db.users.findOne({
        where: {
          // code: code,
          // email: email
          code,
          email,
        },
      });
      if (verifiedCode) {
        await db.users.update(
          {
            isVerified: true,
          },
          { where: { email, code } }
        );
        res.status(200).send({ success: true, message: "Code Verified." });
      } else {
        res
          .status(401)
          .send({ success: false, message: "Code is Not Verified." });
      }
    } else {
      res.status(400).send({ success: false, message: "send proper data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    // let  = req.body.imgUrl;

    let { firstName, lastName, email, password, img, code } = req.body;

    console.log(firstName, lastName, email, password, img, code);

    let hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT)
    );
    if (firstName && lastName && email && password && img && code) {
      let userData = await db.users.update(
        {
          firstName: firstName,
          lastName: lastName,
          password: hashedPassword,
          email: email,
          image: img,
          code: null,
          isVerified: true,
        },
        {
          where: {
            email,
            code,
          },
        }
      );
      if (userData[0] > 0) {
        console.log("userData", userData);
        res
          .status(200)
          .send({ success: true, message: "You Registered Successfully." });
      } else {
        res.send({ success: false, message: "Could Not Register." });
      }
    } else {
      console.log("data is ", req?.body);
      res.status(400).send({ success: false, message: "Send proper data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
    // error handling for unique validation.
    // let errorType = JSON.parse(JSON.stringify(err['errors']?.[0]))
    // if( errorType?.type === "unique violation" ){
    //     return { existed: true, message: "this user already exists." }
    // } else{
    //     console.log("error->", err)
    //     return { error: true, message: "Server Error." }
    // }
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    // const email = req?.body?.email?.trim?.();
    // const password = req?.body?.password?.trim?.();

    let { email, password } = req?.body;
    console.log("in admin login");
    console.log(req.body);
    if (email && password) {
      // let adminData = await admins.findAll();
      // console.log("adminData", adminData);
      let userData = await db.users.findOne({
        where: {
          email: email,
          isDeleted: false,
        },
        raw: true,
      });

      if (userData) {
        let hash = userData?.password;
        let result = bcrypt.compareSync(password, hash);
        console.log("hash", result);
        if (result) {
          console.log("logged in.", userData);
          let tokens = await createToken(userData);
          if (tokens) {
            res.status(200).send({
              success: true,
              data: {
                userId: userData?.id,
                email: userData?.email,
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                email: userData?.email,
                image: userData?.image,
                tokens: tokens,
              },
            });
          } else if (tokens?.error) {
            // res.status(400).send("some error occured.")
            console.log("Server Error.");
            res.status(503).send({ success: false, message: "Server Error." });
          }
        } else {
          res
            .status(400)
            .send({ success: false, message: "Password is Incorrect." });
        }
      } else {
        res
          .status(404)
          .send({ success: false, message: "number does not exist." });
      }
    } else {
      console.log("email or password is missing.");
      res.status(400).send({ success: false, message: "Send proper data." });
      // res.status(400).send("send proper data.")
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    let email = req.body.email;
    if (email) {
      let userData = await db.users.findOne({
        where: {
          email: email,
          isDeleted: false,
          isVerified: true,
        },
        raw: true,
      });
      if (userData) {
        let code = await makeCode();
        if (code?.found) {
          let twilioMessage = await client.messages.create({
            body: "your verification code is " + code?.found,
            to: email,
            from: process.env.TWILIO_NUMBER,
          });
          console.log("twilioMessage", twilioMessage);
          if (twilioMessage) {
            let addedCode = await db.users.update(
              {
                code: code?.found,
              },
              {
                where: {
                  email,
                  isDeleted: false,
                },
              }
            );
            if (addedCode) {
              res.status(200).send({
                success: true,
                message: "Verification Code is Sent on Your Number.",
              });
            } else {
              console.log("Something went wrong.");
              res
                .status(503)
                .send({ success: false, message: "Something went wrong." });
            }
          }
        } else if (code?.error) {
          console.log("Server Error.");
          res.status(503).send({ success: false, message: "Server Error." });
        } else if (code?.not_found) {
          console.log("code not found.");
        }
      } else {
        console.log("this number does not exist.");
        res
          .status(404)
          .send({ success: false, message: "This number is not registered." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send Proper Data." });
      // res.status(400).send("send a phone number.")
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

//on password reset
exports.verifyResetPasswordCode = async (req, res, next) => {
  try {
    let code = req.body.code;
    let email = req.body.email;
    if (code) {
      let verifiedCode = await db.usersTwilioCodes.findOne({
        where: {
          code: code,
        },
      });
      if (verifiedCode) {
        res.status(200).send("code verified.");
      } else {
        res.status(400).send("code is not verified.");
      }
    } else {
      res.status(400).send("send proper data.");
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    let verificationCode = req?.body?.code;
    let email = req.body?.email;
    // let user = await db.users.findOne({
    //   where: {
    //     email: email,
    //     isDeleted: false,
    //   },
    //   raw: true,
    // });

    let password = req?.body?.password?.trim();
    if (verificationCode && email && password) {
      let hashedPassword = bcrypt.hashSync(
        password,
        parseInt(process.env.BCRYPT_SALT)
      );
      console.log("password after hash is", hashedPassword);
      let userData = await db.users.findOne({
        where: {
          code: verificationCode,
          email: email,
          isDeleted: false,
        },
        raw: true,
      });
      console.log("userData", userData);
      if (userData) {
        let updatedRows = await db.users.update(
          {
            password: hashedPassword,
            code: null,
          },
          {
            where: {
              email: userData?.email,
              code: verificationCode,
              isDeleted: false,
            },
          }
        );
        console.log("updatedRows", updatedRows);
        if (updatedRows[0] > 0) {
          res.status(200).send({ success: true, message: "Password Update." });
        } else {
          res.send({ success: false, message: "Could not Reset Password." });
        }
      } else {
        res
          .status(401)
          .send({ success: false, message: "This Code is not Valid." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.resendCode = async (req, res, next) => {
  try {
    let email = req.body.email;
    if (email) {
      let userData = await db.users.findOne({
        where: {
          email: email,
          isDeleted: false,
          isVerified: true,
        },
        raw: true,
      });
      if (userData) {
        let code = await makeCode();
        if (code?.found) {
          let twilioMessage = await client.messages.create({
            body: "your verification code is " + code?.found,
            to: email,
            from: process.env.TWILIO_NUMBER,
          });
          console.log("twilioMessage", twilioMessage);
          if (twilioMessage) {
            let addedCode = await db.users.update(
              {
                code: code?.found,
              },
              {
                where: {
                  email,
                  isDeleted: false,
                },
              }
            );
            if (addedCode) {
              res.status(200).send({
                success: true,
                message: "Verification Code is Sent on Your Number.",
              });
            } else {
              console.log("Something went wrong.");
              res
                .status(503)
                .send({ success: false, message: "Something went wrong." });
            }
          }
        } else if (code?.error) {
          console.log("Server Error.");
          res.status(503).send({ success: false, message: "Server Error." });
        } else if (code?.not_found) {
          console.log("code not found.");
        }
      } else {
        console.log("This Phone Number is not Registered.");
        res
          .status(404)
          .send({ success: false, message: "Phone Number not found." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper data." });
      // res.status(400).send("send a phone number.")
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let userId = req.user_id ?? null;
    let { firstName, lastName, DOB, image, email } = req.body;
    if (firstName && lastName && DOB && image && userId && email) {
      let updatedProfile = await db.users.update(
        {
          firstName,
          lastName,
          DOB,
          image,
          email,
        },
        {
          where: {
            id: userId,
            isDeleted: false,
          },
        }
      );
      console.log("updatedProfile", updatedProfile);
      if (updatedProfile[0] > 0) {
        let profileData = await db.users.findOne({
          where: {
            id: userId,
            isDeleted: false,
          },
          raw: true,
        });
        res
          .status(200)
          .send({ success: true, message: "updated.", data: profileData });
      } else {
        console.log("profile not updated.");
        res.send({ success: false, message: "could not update profile." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.newPassword = async (req, res) => {
  try {
    let password = req.body.password;
    let currentPasswordFromUser = req.body.oldPassword;
    let userId = req.user_id;
    // let hashedOldPassword = bcrypt.hashSync(password);
    let user = await db.users.findOne({
      where: {
        id: userId,
      },
    });
    let currentPassword = user.password;
    const isValidPassword = await bcrypt.compare(
      currentPasswordFromUser,
      currentPassword
    );
    res;
    console.log("is valid", isValidPassword);
    if (!isValidPassword) {
      res.status(400).send({
        success: false,
        message: "Incorrect Current Password",
      });
    } else {
      let id = req.user_id;
      if (password) {
        let hashedPassword = bcrypt.hashSync(
          password,
          parseInt(process.env.BCRYPT_SALT)
        );
        let updatedPassword = await db.users.update(
          {
            password: hashedPassword,
          },
          {
            where: {
              id,
              isDeleted: false,
            },
          }
        );
        console.log("updatedPassword", updatedPassword);
        if (updatedPassword[0] > 0) {
          res.status(200).send({ success: true, message: "Password Update." });
        } else {
          res.send({ success: false, message: "Could not Reset Password." });
        }
      } else {
        console.log("something is missing.");
        res.status(400).send({ success: false, message: "Send Proper Data." });
      }
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Internal Server Error." });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    let email = req.body.email;
    console.log("phone number is ", email);
    await client.messages
      .create({
        body: "Follow the following link to download the app: https://fff.page.link/NLtk",
        to: email,
        from: process.env.TWILIO_NUMBER,
      })
      .then((data) => {
        res.status(200).send({ success: true, data: data });
      })
      .catch((err) => {
        res.status(401).send({
          success: false,
          message: "error sending message",
          data: err,
        });
      });
  } catch (err) {
    console.log("error is ", err);
  }
};
