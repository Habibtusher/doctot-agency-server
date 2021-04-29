const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avdod.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();


app.use(bodyParser.json());
app.use(cors());


// app.use(express.static('doctors'));
// app.use(fileUpload())

const port = process.env.PORT || 5000;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointment");
    const doctorCollection = client.db("doctorsPortal").collection("allDoctors");
    app.post("/addAppointment", (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post("/appointmentsByDate", (req, res) => {
        const date = req.body;
        const email = req.body.email;
       doctorCollection.find({ email:email })
        .toArray((err, doctors) => {
            const filter = { date: date.date }
           if(doctors.length === 0){
            filter.email = email;
           }         
            appointmentCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents)
            })                   
        })

       
    })

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addADoctor', (req, res) => {

        const newDoctor = req.body;
        console.log(newDoctor);
        doctorCollection.insertOne(newDoctor)
        .then(result => {
          console.log('in',result.insertedCount);
          res.send(result.insertedCount > 0 )
        })
    })
    
    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

})



app.get('/', (req, res) => {
    res.send('love')
})

app.listen(port);

