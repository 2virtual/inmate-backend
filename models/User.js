const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  user_name: {
    type: String,
    required: true,
  },
  Penitentiary: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      Default: Date.now,
    },
 
  role: {
    type: String,
    enum: ['user', 'editor'],
  },
});

//Encrypt password using bycrypt
UserSchema.pre('save', async function (next) {
  if(!this.isModified('password')){
next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');
  //Hex token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('users', UserSchema, 'úsers');

module.exports = User;
