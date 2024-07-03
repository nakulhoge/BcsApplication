const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UsersSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: Number,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role:{
    type:String,
    default:null,
  },
  otp: {
    type: String,
  },
});

// jwt token
UsersSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        name: this.name,
        email: this.email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;
