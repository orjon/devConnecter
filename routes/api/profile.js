const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//GET api/profile/me
// Get current users profile
// Private
router.get(
  '/me',
  auth,
  async (req,res) => {
    try {
      const profile = await Profile.findOne({user : req.user.id}).populate('user',['name','avatar']);

      if (!profile){
        return res.status(400).json({ msg : 'No profile for this user'})
      }

      res.json(profile)
    }catch(error){
      console.error(error);
      res.ststus(500).send('Server Error')
    }
    
  });

module.exports = router;