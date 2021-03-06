var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
var https = require('https');
var rp = require('request-promise');
var Promise = require("bluebird");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

const CATurl = "http://10.0.0.10";
const status = {
    "00": {
        code: "00",
        desc: "Success"
    },
    "01": {
        code: "01",
        desc: "Cannot find the given TeamID"
    },
    "02": {
        code: "02",
        desc: "Cannot find the requested data"
    }
};
var pressure = require("../controllers/PressureController.js");
var temperature = require("../controllers/TemperatureController.js");
var humidity = require("../controllers/HumidityController.js");
var gyroscope = require("../controllers/GyroscopeController.js");
var accelerometer = require("../controllers/AccelerometerController.js");
var magnetometer = require("../controllers/MagnetometerController.js");
var din1 = require("../controllers/Din1Controller.js");
var predictedData = require("../controllers/PredictedDataController.js");

var dataFetcher = (team, res) => {

    var myRequests = [];
    myRequests.push(rp(CATurl + "/api/temperature/" + team + "/3"));
    myRequests.push(rp(CATurl + "/api/accelerometer/" + team + "/3"));
    myRequests.push(rp(CATurl + "/api/din1/"+team+"/3"));
    // =============================== Fake Data Test ==============================================
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/todos"));
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/albums"));
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/photos"));
    Promise.all(myRequests).then(function(arrayOfHtml){

        let temparature_data = arrayOfHtml[0]? JSON.parse(arrayOfHtml[0]).data: null;
        let accelerometer_data = arrayOfHtml[1]? JSON.parse(arrayOfHtml[1]).data: null;
        let din1_data = arrayOfHtml[2]? JSON.parse(arrayOfHtml[2]).data: null;
        let result = ({
            "id": team,
            "temparature": temparature_data,
            "accelerometer": accelerometer_data,
            "din1": din1_data
        });

        // =============================== Fake Data Test ==============================================
        // let temparature_data = arrayOfHtml[0]? JSON.parse(arrayOfHtml[0]): null;
        // let accelerometer_data = arrayOfHtml[1]? JSON.parse(arrayOfHtml[1]): null;
        // let din1_data = arrayOfHtml[2]? JSON.parse(arrayOfHtml[2]): null;
        // console.log(temparature_data.length);
        // console.log(accelerometer_data.length);
        // console.log(din1_data.length);
        //
        // let result = ({
        //     "id": team,
        //     "temparature": [{sensID: 1, val: 5, date: 'day1'},{sensID: 2, val: 6, date: 'dayy'}],
        //     "accelerometer": [{sensID: 5, val_x: 1, val_y: 2, val_z: 3, date: 'Date'}],
        //     "din1": [{sensID: 2, val: 6, date: 'dayy'}, {sensID: 1, val: 5, date: 'day1'}]
        // });


        res.render('team', {
            title: 'Team ' + team,
            result: result
        });
    }).catch(function (err) {
        console.log("Error" + err);
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('hapi_home', { title: 'Express'});
});

router.get('/hookworms', function(req, res, next) {
    res.render('hapi_home', { title: 'hookworms' });
});


router.get('/teams/all/', function(req, res, next) {
    var data_list = [];
    var myRequests = [];
    var nodes_list = [5, 7, 9];
    nodes_list.forEach(function(device_node){
        myRequests.push(rp(CATurl + "/api/temperature/" + device_node + "/3"));
        myRequests.push(rp(CATurl + "/api/accelerometer/" + device_node + "/3"));
        myRequests.push(rp(CATurl + "/api/din1/"+device_node+"/3"));
    // =============================== Fake Data Test ==============================================
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/todos"));
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/albums"));
    //     myRequests.push(rp("https://jsonplaceholder.typicode.com/photos"));
    });
    Promise.all(myRequests).then(function (arrayOfData){
        console.log("myRequests.length = " + myRequests.length);
        var result_data_list = [];
        for(let i = 0; i<myRequests.length; i += 3){
            console.log("TEAM {" + nodes_list[(i)/3] + "}");
            let temparature_data = arrayOfData[i]? JSON.parse(arrayOfData[i]).data: null;
            let accelerometer_data = arrayOfData[i+1]? JSON.parse(arrayOfData[i+1]).data: null;
            let din1_data = arrayOfData[i+2]? JSON.parse(arrayOfData[i+2]).data: null;

            result_data_list.push({
                "id": nodes_list[(i)/3],
                "temparature": temparature_data,
                "accelerometer": accelerometer_data,
                "din1": din1_data
            });

            // =============================== Fake Data Test ==============================================
            // let temparature_data = arrayOfData[i]? JSON.parse(arrayOfData[i]): null;
            // let accelerometer_data = arrayOfData[i+1]? JSON.parse(arrayOfData[i+1]): null;
            // let din1_data = arrayOfData[i+2]? JSON.parse(arrayOfData[i+2]): null;
            // console.log(temparature_data.length);
            // console.log(accelerometer_data.length);
            // console.log(din1_data.length);
            // result_data_list.push({
            //     "id": nodes_list[(i)/3],
            //     "temparature": [{sensID: 1, val: 5, date: 'day1'},{sensID: 2, val: 6, date: 'dayy'}],
            //     "accelerometer": [{sensID: 5, val_x: 1, val_y: 2, val_z: 3, date: 'Date'}],
            //     "din1": [{sensID: 2, val: 6, date: 'dayy'}, {sensID: 1, val: 5, date: 'day1'}]
            // })
        }
        console.log("result_data_list");
        console.log(result_data_list);
        res.render('teams', {
            title: 'All Teams',
            result: {
                teams: result_data_list
            }
        });
    });
});

router.get('/teams/:teamID/', function(req, res, next) {
    dataFetcher(req.params.teamID, res);
});

router.get('/showresponse', function(req, res, next) {
    res.locals.TEAM_ID = null;
    res.locals.LAT = null;
    res.locals.LONG = null;
    res.render('showresponse1', {title: "Show POST Response"});
});

router.post('/showresponse', function(req, res, next) {
    res.render('showresponse2', {
        title: "Show POST Response",
        TEAM_ID: req.body.TEAM_ID,
        LAT: req.body.LAT,
        LONG: req.body.LONG
    });
});

router.get('/pressure', function(req, res, next) {
    res.locals.datetime = null;
    pressure.list(req, res);
});
router.post('/pressure', function(req, res, next) {
    pressure.list(req, res);
});

router.get('/temperature', function(req, res, next) {
    res.locals.datetime_start = null;
    res.locals.datetime_stop = null;
    temperature.list(req, res);
});
router.post('/temperature', function(req, res, next) {
    console.log("POST")
    temperature.list(req, res);
});

router.get('/humidity', function(req, res, next) {
    res.locals.datetime = null;
    humidity.list(req, res);
});
router.post('/humidity', function(req, res, next) {
    humidity.list(req, res);
});

router.get('/gyroscope', function(req, res, next) {
    res.locals.datetime = null;
    gyroscope.list(req, res);
});
router.post('/gyroscope', function(req, res, next) {
    gyroscope.list(req, res);
});

router.get('/accelerometer', function(req, res, next) {
    res.locals.datetime_start = null;
    res.locals.datetime_stop = null;
    accelerometer.list(req, res);
});
router.post('/accelerometer', function(req, res, next) {
    accelerometer.list(req, res);
});

router.get('/magnetometer', function(req, res, next) {
    res.locals.datetime = null;
    magnetometer.list(req, res);
});
router.post('/magnetometer', function(req, res, next) {
    magnetometer.list(req, res);
});

router.get('/din1', function(req, res, next) {
    res.locals.datetime_start = null;
    res.locals.datetime_stop = null;
    din1.list(req, res);
});
router.post('/din1', function(req, res, next) {
    din1.list(req, res);
});


router.get('/predicted', function(req, res, next) {
    predictedData.list(req, res);
});

router.get('/sendpredicted', function(req, res, next) {
    res.locals.team_id = null;
    res.locals.description = null;
    res.render('predicted_data')
});
router.post('/sendpredicted', function(req, res, next) {
    //Add to DB
    let data = {team_id: req.body.team_id, description: req.body.description}
    predictedData.save(data)
    res.send("Data Accepted" + JSON.stringify(data));
});

module.exports = router;
