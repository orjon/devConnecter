const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

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

  //POST api/profile
  // Create or update user profile
  // Private
  router.post(
    '/',
    [
      auth,
      [
        check('status','Status is required').not().isEmpty(),
        check('skills','Skills is required').not().isEmpty()
      ]
    ],
    async (req, res) => {
      const errors =validationResult(req);
      console.log('errors:',errors.array())
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
      }

      const {company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin} = req.body;

      //Build profile object (see what's recieved)
      const profileFields = {};
      profileFields.user =req.user.id
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        // Split string into array on commas. Trim all whitespace from each skill
        profileFields.skills = skills.split(',').map(skill => skill.trim())
      }

      // Build social object
      profileFields.social ={}
      if (youtube) profileFields.social.youtube=youtube;
      if (twitter) profileFields.social.twitter=twitter;
      if (facebook) profileFields.social.facebook=facebook;
      if (linkedin) profileFields.social.linkedin=linkedin;
      if (instagram) profileFields.social.instagram=instagram;

      // Update and insert data
      try {
        let profile = await Profile.findOne({ user: req.user.id })

        if (profile){
          //update profile
          profile = await Profile.findOneAndUpdate({ user: req.user.id } , { $set: profileFields }, {new: true })
          return res.json(profile);
        }

        // if new, create new profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile)

        

      } catch(error){
        console.error(error),
        res.status(500).send('Sever Error')
      }

      
      console.log(profileFields.skills)

      res.send('hello')

    }
  )

  // GET api/profile
  // get all profiles
  // public
  router.get('/', async (req,res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name','avatar'])
      res.json(profiles)
    } catch (error) {
      console.error(error)
      res.status(500).send('Sever Error')
    }
  })


  // GET api/profile/user/:user_id
  // get profiles by user id
  // public
  router.get('/user/:user_id', async (req,res) => {
    try {
      const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar'])

      if (!profile){
        return res.status(400).json({ msg : 'Profile not found'})
      }

      res.json(profile);
    } catch (error) {
      console.error(error)
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ msg : 'Profile not found'})
      }
      
      res.status(500).send('Sever Error')
    }
  })

  // DELETE api/profile/
  // delete profile, user and posts
  // private
  router.delete('', auth, async (req,res) => {
    try {
      // Remove profile
      await Profile.findOneAndRemove({user: req.user_id})
      await User.findOneAndRemove({_id: req.user_id})
      res.json({ msg: 'User deleted'});
    } catch (error) {
      console.error(error)
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ msg : 'Profile not found'})
      }
      
      res.status(500).send('Server Error')
    }
  })


module.exports = router;