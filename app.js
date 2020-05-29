var express = require('express');
var path = require('path');
var mysql = require('mysql');
var dotenv = require('dotenv');
var cookieParser = require('cookie-parser')


dotenv.config({path:'./.env'});


var app = express();

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    port:process.env.DATABASE_PORT,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
})



var publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));
// parse url-encoded bodies ( as sent by HTML forms )
app.use(express.urlencoded({extended:false}))

// parse json bodies ( as sent by API clients)
app.use(express.json());
app.use(cookieParser());
app.set('view engine','hbs')
db.connect((error)=>{
    if (error) {
        console.log(error);
    }else{
        console.log('MYSQL Connected...')
    }
})


//define routes

app.use('/',require('./routes/pages'));
app.use('/auth', require('./routes/auth'))





app.listen(5000,()=>{
    console.log('server started on port 5000')
})