const express = require('express');
const app =express();
const bodyParser=require('body-parser');
const morgan=require('morgan');
const mongoose=require('mongoose'); //mongodb
const cors=require ('cors');//Import Cors


app.use(cors());
app.options('*',cors())

const authJwt = require('./helpers/jwt');
const errorHandler=require('./helpers/error-handler');

//********************************************************************************************************** */
//------------------Variable ENV-------------------
require('dotenv/config');



//********************************************************************************************************** */
//----------------Midleware------------------------
app.use(bodyParser.json());
app.use (morgan('tiny'));//log
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname+'/public/uploads'));
app.use(errorHandler)


//********************************************************************************************************** */
//---------Déclaration des Routes-------------------------
const productsRouter=require('./routers/products');
const categoriesRouter=require('./routers/categories');
const ordersRouter=require('./routers/orders');
const usersRouter=require('./routers/users');


//********************************************************************************************************** */
//--------API= API_URL de chez le .env-------
const api =process.env.API_URL;
//------Routers----------------
app.use(`${api}/products`,productsRouter);
app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/orders`,ordersRouter);
app.use(`${api}/users`,usersRouter);

//********************************************************************************************************** */
// ---------------Connexion à La base de donné MangoDB------------------
mongoose.connect(process.env.CONNEXION_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName : 'ZineApp' //nom exact de la base de donnée,il est sensible à la casse A != a
})
// -----Si la connexion marche-----------
.then(()=>{
    console.log('Connecté à la BD');
})
// ----Si la connexion ne marche pas -------------
.catch((err)=>{
    console.log (err);
})

//********************************************************************************************************** */
// ----------------------Server connexion & PORT---------------------
//developpement
/*app.listen(3000,()=>{
    
    console.log('Serveur lancé');
})*/
//Production server Hors localhost
var server=app.listen(process.env.PORT || 3000,function(){
    var port =server.address().port;
    console.log('express marche sur le port'+port)
})
//********************************************************************************************************** */
