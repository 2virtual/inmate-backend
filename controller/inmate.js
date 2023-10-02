const path = require('path');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse.js');
const asyncHandler = require('../middleware/async.js');
const User = require('../models/User.js');
const Inmate = require('../models/Inmates.js');
const GenerateCode = require('../utils/generateCode.js');
const toId = mongoose.Types.ObjectId;

// @desc Create new inmate with logged in id
//@routes /api/v1/inmate/create/:id
//@acess Private
exports.createNewInmate = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  console.log(req.params.id);
  const _id = req.params.id;
const {
    inmate_name,
    date_of_birth,
    gender,
    offence_category,
    socialSecurityNumber,
    raceEthnicity,
    nationality,
    homeAddress,
    contactInformation,
    height,
    weight,
    eye_color,
    hair_color,
    distinguishingMarks,
    disabilities,
    bookingDateTime,
    bookingNumber,
    bookingOfficer,
    arrestingAgency,
    arrestingOfficer,
    reasonForArrest,
    arrestDate,
    arrestLocation,
    arrestJurisdiction,
    personalItems,
  } = req.body;

  try {
    console.log('request from front =>', req.body);
    const pool = await User.findOne({ _id });

    console.log('pool content =>', pool);

    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Generate unique number for new inmate
    const d = new Date();
    const year = d.getFullYear();
    const { Penitentiary, user_name} = pool;
    const inmate_number = `${Penitentiary.slice(0, 3)}-${year.toString().slice(-2)}-${GenerateCode(3)}`;
    // const inmate_number = `${Penitentiary.slice(0, 3)}-${year}-${GenerateCode(3)}`;

    const inmate = new Inmate({
      inmate_name,
      Penitentiary,
      offence_category,
      reg_officer: user_name,
      inmate_number,
      date_of_birth,
      gender,
      social_security: socialSecurityNumber,
      ethnicity: raceEthnicity,
      nationality,
      home_address: homeAddress,
      contact_information: contactInformation,
      height,
      weight,
      eye_color: eye_color,
      hair_color: hair_color,
      scar: distinguishingMarks,
      disability: disabilities,
      bookingDate: bookingDateTime,
      booking_officer: bookingOfficer,
      arresting_officer: arrestingOfficer,
      booking_time: bookingDateTime,
      arresting_agency: arrestingAgency,
      arrest_location: arrestLocation,
      arrestDate,
      verdict: reasonForArrest,
      belongings: personalItems,
    });

    console.log('inmate before save:', inmate);
    await inmate.save();

    console.log('Added inmate successfully!');
    res.send(inmate);
  } catch (err) {
    console.log(err);
    // res.status(500).json({ error: 'Internal server error' });
    next(new ErrorResponse('Cannot create inmate'));
  }
});



// exports.createNewInmate = asyncHandler(async (req, res, next) => {
//   console.log(req.body);
//   console.log(req.params.id);
//   const _id = req.params.id;
//   const {
//     inmate_name,
//     reg_officer,
//     arrest_officer,
//     offence_category,
//     gender,
//     date_of_birth,
//     ethnicity,
//     social_security,
//     phone_number,
//     height,
//     weight,
//     eye_color,
//     hair_color,
//     scar,
//     medical_condition,
//     disability,
//     inmate_number,
//     id_number,
//     bookingDate,
//     booking_officer,
//     arrest_oficer,
//     booking_time,
//     arresting_agency,
//     arrest_location,
//     arrest_time,
//     arrestDate,
//     verdict,
//     sentencing_court,
//     belongings,
//     ImagePath,
//     fingerprint,
//     endDate,
//     isActive,
//   } = req.body;

//   try {
//     console.log('request from front =>', req.body);
//     const pool = await User.findOne({ _id });

//     console.log('pool content=>', pool);

//     if (!pool) {
//       return res.status(404).json({ error: 'Pool not found' });
//     }

//     // Generate unique number for new inmate
//     // const d = new Date();
//     // const year = d.getFullYear();
//     // const { Penitentiary, email } = pool;
//     // const InmateCoded = `${Penitentiary.slice(0, 3)}-${year}-${GenerateCode(
//     //   3
//     // )}`;

//     const inmateDetails = new Inmate({
//       inmate_name: inmate_name,
//       Penitentiary: Penitentiary,
//       reg_officer: email,
//     //  inmate_number: InmateCoded,
//       offence_category: offence_category,
//       date_of_birth: date_of_birth,
//       ethnicity: ethnicity,
//       social_security: social_security,
//       phone_number: phone_number,
//       height: height,
//       weight: weight,
//       eye_color: eye_color,
//       hair_color: hair_color,
//       scar: scar,
//       medical_condition: medical_condition,
//       disability: disability,
//       bookingDate: bookingDate,
//       booking_officer: booking_officer,
//       arrest_officer: arrest_officer,
//       booking_time: booking_time,
//       arresting_agency: arresting_agency,
//       arrest_location: arrest_location,
//       arrest_time: arrest_time,
//       arrestDate: arrestDate,
//       verdict: verdict,
//       id_number: id_number,
//       sentencing_court: sentencing_court,
//       belongings: belongings,
//       ImagePath: ImagePath,
//       fingerprint: fingerprint,
//       endDate: endDate,
//       isActive: isActive,
//     });

//     // console.log(`pool before save ${inmate}`);
//     await inmateDetails.save();

//     console.log('added inmate successfully!');
//     res.send(inmateDetails);
//   } catch (err) {
//     console.log(err);
//     // res.status(500).json({ error: 'Internal server error' });
//     next(new ErrorResponse('cannot create inmate'));
//   }
// });

//@desc Get all inmate by user email
//@routes Get/api/v1/inmate/all
//@acess Public
exports.getAllInmate = asyncHandler(async (req, res, next) => {
  try {
    const facility_name = req.body.facility_name;
    const inmates = await Inmate.find({ facility_name });
    res.json(inmates);
  } catch (err) {
    console.log(err);
    next(new ErrorResponse('cannot retrieve all inmate', 404));
  }
});

//@desc Get one Inmate
//@routes Get/api/inmate/:num
//@acess  Private
exports.getOneInmate = asyncHandler(async (req, res, next) => {
  try {
    const _id = req.params.id;
    const InmateDetail = await Inmate.findOne({ _id });

    if (!InmateDetail) {
      const error = new ErrorResponse('Inmate not found', 404);
      throw error;
    }

    res.json(InmateDetail);
  } catch (error) {
    next(error);
  }
});
//@desc Update one Inmate
//@routes Get/api/v1/update/inmate/:num
//@acess  Private
exports.updateInmate = asyncHandler(async (req, res, next) => {
  console.log(req.body)
  console.log(req.params._id);
 const  _id = req.params.id
  try {
   
    const Id = await Inmate.findOne({ _id });

    if (!Id) {
      return next(
        new ErrorResponse(
          `No inmate with the inmate number of ${req.params._id}`
        ),
        404
      );
    }

    const inmateDetail = await Inmate.findOneAndUpdate(
      { _id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: inmateDetail,
    });
  } catch (error) {
    next(new ErrorResponse('Internal server error', 500));
  }
});

// @desc Delete inmates
// @route DELETE /api/v1/inmate/delete/:id
// @access Private
exports.deleteInmate = asyncHandler(async (req, res, next) => {
  const _id=req.params.id
  try {
    console.log('delete id =>', req.params.id);
    const inmate = await Inmate.findOne({_id });

    if (!inmate) {
      return next(
        new ErrorResponse(
          `No inmate with the inmate number of ${req.params.id}`
        ),
        404
      );
    }

    await Inmate.findOneAndDelete({ _id });

    res.status(200).json({
      success: true,
      message: 'Inmate deleted successfully',
    });
  } catch (error) {
    next(new ErrorResponse('Internal server error', 500));
  }
});
