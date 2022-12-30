const express = require('express')
//because i imported express, it allows me to create different API routes
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
// generatePassword is being used to generate user ID's
const generatePassword = require('password-generator')

const admin = require('firebase-admin')
const db = admin.firestore()

router.get('/', (req, res) => {
  res.send('register page')
})

//the checks below check the following fields and alert users if the rules are not followed
router.post(
  '/',
  [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Email is not in the correct format').isEmail(),
    check('password', 'Password must be more than 5 characters.').isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // checks for errors (rules for name, email and password being broken)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).js({ errors: errors.array() })
    }

    const { name, email, password } = req.body
    try {
      // calling DB collection 'users'
      const userRef = db.collection('users')

      //checking the DB to see if the users input email matches emails existing inside of the DB collection
      let user = await userRef.where('email', '==', email).get()

      // console.log(user)

      // if the input email is found, the user is sent the error below
      if (!user.empty) {
        return res.status(400).json({ errors: 'This email is already in use.' })
      }

      // if the input email is not found in the DB, an ID is then generated
      const id = generatePassword(6, false)

      const salt = await bcrypt.genSalt(10)

      // hash is used to encrypt users password - using bcrypt which is a package. it changes users password to random characters (length of 10)

      const hashedPassword = await bcrypt.hash(password, salt)

      // users information is being saved, the (doc) is for documentation, where users information is being stored under their ID
      await db.collection('users').doc(id).set({
        id,
        name,
        email,
        password: hashedPassword,
      })

      const payload = {
        user: {
          id,
          name,
        },
      }

      jwt.sign(
        payload,
        config.get('jwtpass'),
        { expiresIn: 4000 },
        // token contains user information (id and name)
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (error) {
      res.status(500).send(error.json)
    }
  }
)

module.exports = router
