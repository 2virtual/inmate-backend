const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const referalCodes = require('referral-codes');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc  Register new user
// @route   POST /api/users
// @access  Public
const registerUserV2 = asyncHandler(async (req, res) => {
  const { user_name, Penitentiary, email, password } = req.body;

  // Create user
  const user = await User.create({
    user_name,
    Penitentiary,
    email,
    password,
  
  });

  // Create Token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    data: user,
  });
});

// @desc  Login new user
// @route   POST /api/users
// @access  Public
const loginV2 = asyncHandler(async (req, res,next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('invalid credentials', 401));
  }

  // Check if password matches
  const isMtached = await user.matchPassword(password);
  if (!isMtached) {
    return next(new ErrorResponse('invalid credentials', 401));
  }

  // Create Token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    data: user,
  });
});


// Get token from model create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Generate token
  const token = user.getSignedJwtToken();

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() +   24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Set secure flag for HTTPS only in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Send the token as a cookie
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      data: user,
    });
};


// @desc  Forget password
// @route  POST /api/v1/auth/forgotPassword
// @access  Public

const fogotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  // console.log(resetToken);
  await user.save({
    validateBeforeSave: false,
  });

  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/authV2/resetpassword/${resetToken}`;
  const message = `Please click the following link to reset your password: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc  reset password
// @route  PUT /api/v1/authv2/resetPassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire : {$gt : Date.now()}
  });

  if(!user){
    return next(new ErrorResponse('invalid token', 400));

  }

  //set new password
  user.password=req.body.password,
  user.resetPasswordToken=undefined,
  user.resetPasswordExpire=undefined,
  await user.save();
  sendTokenResponse(user,200,res)
});

const updateDetails = asyncHandler(async (req, res, next) => {
const fieldsToUpdate={
  name:req.body.name,
  email:req.body.email
}
const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
  new:true,
  runValidators:true
})
res.status(200).json({
  success: true,
   data: user,
});
})


module.exports = {
  registerUserV2,
  loginV2,
  fogotPassword,
  resetPassword,
  updateDetails
};
