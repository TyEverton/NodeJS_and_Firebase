const express = require('express')

const app = express()
const admin = require('firebase-admin')
const serviceAccount = require('./config/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

app.use(express.json())

//if a user goes to api/register, my app is then pulling the code from the routes/api/register file and sending that to the user
app.use('/api/register', require('./routes/api/register'))
// app.use('/api/login', require('./routes/api/login'))

app.get('/', (req, res) => {
  res.send('Hello :)')
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Listening on PORT: ${port}`)
})
