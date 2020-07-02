const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// import Profile and User models
const Profile = require('../../models/Profile');
const User = require('../../models/User');



//@router GET api/profile/me
// get current user profile
// access: private
router.get('/me',auth, async (req,res) => {
  try {
    // Find matching profile.
    const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

    // if no profile return 400 error.
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user'})
    }

    // otherwise send profile
    res.json(profile);

  } catch(error){
    console.error(error.message);
    res.status(500).send('Server Error')
  }
});

// res.send('Profile route'));

module.exports = router;