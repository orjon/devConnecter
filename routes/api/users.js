const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config =require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User')

//@router POST api/users
// Register user
// 
router.post('/', [
  check('name', 'Name is required')
    .not()
    .isEmpty(),
  check('email', 'Please use a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({min: 6})
],
async (req,res) => {
  console.log('-- NEW POST --------')
  console.log('req body:', req.body)
  const errors =validationResult(req);
  console.log('errors:',errors.array())
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()})
  }

  const { name, email, password } = req.body;

  try {

    let user = await User.findOne({ email : email })

    // Check user exists
    if (user){
      return res.status(400).json({ errors: [ { msg: 'User already exists '}]})
    }

    // get gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // create user
    user = new User({
      name,
      email,
      avatar,
      password
    })

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt)

    // save user
    await user.save();

    // return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn: 360000},
      (error, token) => {
        if(error) throw error;
        res.json({ token })
      }
    )


  } catch(error) {
    console.error(error.message);
    res.status(500).sent('Server error.')
  }


});

module.exports = router;
