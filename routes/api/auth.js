const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config =require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User')

//@router POST api/auth
// authentic user and get token
// access: public

router.post(
  '/',
  [
    check('email', 'Please use a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
async (req,res) => {
  const errors =validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()})
  }

  const { email, password } = req.body;

  try {

    let user = await User.findOne({ email : email })

    // Check user exists
    if (!user){
      return res.status(400).json({ errors: [ { msg: 'Invalid credentials (user)'}]})
    }

    // chekcs password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
      return res.status(400).json({ errors: [ { msg: 'Invalid credentials (password)'}]})
    }


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


//@router GET api/auth
// 
router.get('/', auth, async (req,res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user)
  } catch(error) {
    console.error(error.message);
    res.status(500).send('Server Error')
  }
});

module.exports = router;