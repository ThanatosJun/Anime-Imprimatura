const express = require('express');
const mongoose = require('mongoose');
const app = express(); // assign to app
const port = 3000;

let connectStatus = false;

// Connect to MongoDB
async function connectMongoDB(){
    try{
        await mongoose.connect('mongodb+srv://piggg123:CEKMRvtKYwJfE@team18.5j1v5i4.mongodb.net/?retryWrites=true&w=majority&appName=team18')
        console.log('Connect to MongoDB. ')
        connectStatus = true;
    }catch(error){
        console.log(error)
    }
}
connectMongoDB()

// temporarilly save data
const data = [];

// middleware, 
app.use(express.json());

app.use((req, res, next) => {
    if(connectStatus){
        next();
    }else{
        res.status(503).send({
            status: false,
            message: 'Server is not ready. '
        });
    }
})

// define userSchema
const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    }, 
    gmail: {
        type: String,
        required: true,
    }, 
    password: {
        type: String,
        required: true,
    },
    personalGallery: Blob
});
//define userModel
const User = mongoose.model('User', userSchema);

app.get('/user', (req, res) => {
    res.send(data);
});

app.post('/user', (req, res) => {
    const {id} = req.body;

    data.push({
        id: new id, 
        gmail: cacheBody.gmail,
        password: cacheBody.password,
        personalGallery: cacheBody.personalGallery,
    });

    res.send(data);
});

//post
app.post('/user', async(req, res) => {
    const {id} = req.body;

    const user = new User({
        id: new id,
        gmail,
        password,
        personalGallery,
    });

    await user.save();
    res.send({
        status: true,
        message: 'Create user successfully. ',
    });
});

// find
app.get('/user', async(req, res) => {
    const user = await User.find();
    res.send({
        status: true,
        data: user,
    });
});

app.listen(3000)