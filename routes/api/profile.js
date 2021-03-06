const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();

const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// GET api/profile/me
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
    } catch (error) {
      console.log('error in: GET api/profile/me')
      console.error(error.message);
      res.status(500).send('Server Error')
    }
    
  });

  // POST api/profile
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

      } catch (error){
        console.log('error in: POST api/profile')
        console.error(error.message),
        res.status(500).send('Sever Error')
      }

    }
  )

  // GET api/profile
  // get ALL profiles
  // public
  router.get('/', async (req,res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name','avatar'])
      res.json(profiles)
    } catch (error) {
      console.log('error in: GET api/profile/user/:user_id')
      console.error(error.message)
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
      console.log('error in: GET api/profile/user/:user_id')
      console.error(error.message)
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ msg : 'Profile not found'})
      }
      
      res.status(500).send('Sever Error')
    }
  })

  // DELETE api/profile/
  // delete profile, user and posts
  // private
  router.delete('/', auth, async (req,res) => {
    try {
      //Remove user posts
      await Post.deleteMany({ user: req.user.id})
      // Remove profile
      await Profile.findOneAndRemove({ user: req.user.id });
      // Remove User
      await User.findOneAndRemove({ _id: req.user.id });
      res.json({ msg: 'User deleted'});
    } catch (error) {
      console.log('error in: DELETE api/profile/')
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  })

  // PUT api/profile/experience
  // add profileexperience
  // private
  router.put(
    '/experience',
    [
      auth,
      [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
      ]
    ],
    async (req,res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body

      const newExp = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        // Push to front of array (most recent first)
        profile.experience.unshift(newExp)

        await profile.save();
        res.json(profile);

      } catch (error) {
        console.log('error in: PUT api/profile/experience')
        console.error(error.message)
        res.status(500).send('Server Error')
      }
    }
  )

  // DELETE api/profile/experience/:exp_id
  // remove  experience from profile
  // private
  router.delete('/experience/:exp_id', auth, async (req,res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // get index to remove
      const removeIndex = profile.experience
        .map(experience => experience.id)
        .indexOf(req.params.exp_id)

      profile.experience.splice(removeIndex, 1);

      await profile.save()
      res.json(profile);

    } catch (error) {
      console.log('error in: DELETE api/profile/experience/:exp_id')
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  })




  // PUT api/profile/education
  // add profile education
  // private
  router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
      ]
    ],
    async (req,res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body

      const newEdu = {
        school: school,
        degree: degree,
        fieldofstudy: fieldofstudy,
        from: from,
        to: to,
        current: current,
        description: description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        // Push to front of array (most recent first)
        profile.education.unshift(newEdu)
        await profile.save();
        res.json(profile);

      } catch (error) {
        console.log('error in: PUT api/profile/education')
        console.error(error.message)
        res.status(500).send('Server Error')
      }
    }
  )

  // DELETE api/profile/education/:edu_id
  // remove  education from profile
  // private
  router.delete('/education/:edu_id', auth, async (req,res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // get index to remove
      const removeIndex = profile.education
        .map(education => education.id)
        .indexOf(req.params.edu_id)

      profile.education.splice(removeIndex, 1);

      await profile.save()
      res.json(profile);

    } catch (error) {
      console.log('error in: DELETE api/profile/education/:edu_id')
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  })

  // GET api/profile/github/:username
  // get user repos from github
  // public
  router.get('/github/:username', (req, res) => {
    try {
      const options = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
        // uri: `https://api.github.com/users/orjon/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers: { 'user-agent': 'node.js'}
      }
      request(options, (error, response, body) => {
        if (error) console.error(error);
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: 'No github profile found'})
        }
        res.json(JSON.parse(body))
      })
    } catch (error) {
      console.log('error in: GET api/profile/github/:username')
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  })


module.exports = router;