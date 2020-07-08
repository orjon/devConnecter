const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Posts');

//@router GET api/posts
//create a post
//private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ error: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })

      const post = await newPost.save();
      res.json(post)

    } catch (error) {
      console.log('error in: POST api/posts')
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  }
);

// GET api/posts
// Get all posts
// private
router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1})
      res.json(posts)
    } catch (error) {
      console.log('error in: GET api/posts')
      console.error(error.message)
      res.status(500).send('Sever Error')
    }
})


// GET api/posts/:id
// Get a post by id
// private
router.get(
  '/:id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)

      //Check if post exists
      if (!post){
        return res.status(404).json({ msg :'Post not found' })
      }

      res.json(post)

    } catch (error) {
      console.log('error in: GET api/posts/:id')
      console.error(error.message)

      if (error.kind === 'ObjectId'){
        return res.status(404).json({ msg :'Post not found' })
      }
      res.status(500).send('Sever Error')
    }
})

// DELETE api/posts/:id
// Delete a post
// private
router.delete(
  '/:id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)


      //Check if post exists
      if (!post){
        return res.status(404).json({ msg :'Post not found' })
      }

      //Check user is post owner
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized'})
      }

      await post.remove();
      res.json({ msg: 'Post removed'})

    } catch (error) {
      console.log('error in: DELETE api/posts/:id')
      console.error(error.message)
      res.status(500).send('Sever Error')
    }
})

// PUT api/posts/like/:id
// Like a post
// private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    //Check if post has already been liked by user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0 ) {
      return res.status(400).json({ msg: 'Post already liked by this user'})
    }

    post.likes.unshift({ user: req.user.id })

    await post.save()

    res.json(post.likes)

  } catch (error) {
    console.log('error in: PUT api/posts/like/:id')
    console.error(error)
    res.status(500).send('Server Error')
  }

})


module.exports = router;