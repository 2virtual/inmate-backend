const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const referalCodes = require('referral-codes');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body)
   const { user_name,Penitentiary,email, password } = req.body;
   
  if (!user_name || !email || !password || !Penitentiary ) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    user_name,
    Penitentiary,
    email,
    role,
    password: hashedPassword,
      });

  console.log(`register info before saving ${newUser}`);

  try {
    const savedUser = await newUser.save();
    res.status(201).json({
      _id: savedUser._id,
      user_name: savedUser.user_name,
      email: savedUser.email,
      token: generateToken(savedUser._id),
    });
  } catch (error) {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
      
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// Grant access to specific roles
exports.authorize =(...roles)=>{
  return (req,res,next)=>{
    
  }
}

// @desc    Forget password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public

// const forgotPassword = asyncHandler(async (req, res) => {
//   const user = await User.findOne({email:req.body.email})
//   if(!user){
// return  next(new ErrorResponse('There is no user with that email',404))
//   }

//   // Get reset token
// const resetToken=user.getResetPasswordToken()

//   res.status(200).json({
// success:true,
// data:user
//   })
// })

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
 
};
