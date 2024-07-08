const express = require('express')
const app = express()
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const PORT = process.env.PORT || 3001;


app.use(cors());
// app.use(express.json());

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//app.use(cookieParser()); !!!!!!!!!!!!!!!!!!!

//IMPORT ROUTES ---------------------------------------------------------------------------
 const authRoute = require("./routes/auth/auth");
 const usersRoute = require('./routes/user/user');
 const contactsRoute = require('./routes/contacts/contacts'); 
 const productsRoute = require('./routes/products/products'); 
 const ordersRoute = require('./routes/orders/orders'); 




//CONNECTION TO DATABASE
//mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to DATABASE"));

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log(`connected to DATABASE = ${process.env.DB_CONNECT}`)
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  
}







//ROUTE MIDDLEWARE ------------------------------------------------------------------------

 app.use("/api/auth", authRoute);
 app.use('/api/users', usersRoute);
 app.use('/api/contacts', contactsRoute);
 app.use('/api/products', productsRoute);
 app.use('/api/orders', ordersRoute);







app.get('/', function (req, res) {
   // res.redirect('/login');
   res.send(`This is a backend app , CRM CALL CENTER`);
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});