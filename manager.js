

//var cron = require('node-cron');
var mongoose = require('mongoose');
var request = require('request');
var soap = require('soap');
var moment = require('moment');
var _Parse = require('parse/node');

var dotNetUrl = 'http://www.tcop.in/itransws/Service.asmx?WSDL';
//var dotNetUrl = 'http://Www.tcop.in/syncws/service.asmx';

var getRelationController = require('./relation_info');
var saveParsDBController = require('./saveToParseDB');

var relatinInfo = null;
var days = 1;

_Parse.initialize("NNqrRLsWeUwa4EzwkxSBgALNFIkPoAwANLaUtYtR", "qS9rO8kMADcgtg8zdOfwiP8KwgPyHei8bCyROfTR");

_Parse.serverURL = 'https://parseapi.back4app.com';

var dbOptions = {
    user: 'admin',
    pass: 'KwjfIFLtR3D8HikF3ZSdt1He'
};

mongoose.connect('mongodb://mongodb7.back4app.com:27017/193b77d4ac3b4201afb35ee64c6ec10b', dbOptions, function (err) {
    if (err)
        throw err;
    getRelationController.getInfoFromRelation(mongoose, function (result) {
        relatinInfo = result;
        var a = moment();
        a.subtract({ hours: 23 * days, minutes: 59 * days, seconds: 59 * days });
        var startTime = a.startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        var b = moment();
        var endTime = b.endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        console.log(startTime);
        console.log(endTime);

        for (var i = 0; i < relatinInfo.length; i++) {
            var params = {
                vno: relatinInfo[i].DeviceID,
                //vno1:relatinInfo[i].DeviceID,
                d1: startTime,//'2017-09-29T00:00:00',
                d2: endTime
            };
            //startTime,

            var trackinginfo = {
                loginid: relatinInfo[i].loginid,
                assetid: relatinInfo[i].AssetID,
                organization: relatinInfo[i].organization,
                organizationid: relatinInfo[i].organizationid,
                simno: relatinInfo[i].simnumber,
                Deviceid: relatinInfo[i].DeviceID,
                Productid: relatinInfo[i].AssetID
            }
            //console.log(params);
            if (relatinInfo[i].DeviceID != undefined)
                getDataFromDotNetApi(params, 0, trackinginfo);
        }
    });

    function getDataFromDotNetApi(params, index, trackinginfo) {

        soap.createClient(dotNetUrl, function (err, client) {
            console.log(params);
            //console.log("retrive",client.describe().Service.ServiceSoap.getDataDeviceDT);
            if (client != undefined)
                client.getDataDeviceDT(params, function (err, result) {
                    console.log(result.getDataDeviceDTResult);
                    if (err == null) {
                        //console.dir(result.getDataDeviceDTResult.diffgram.NewDataSet.Table.id);
                        if (result.getDataDeviceDTResult.diffgram != null) {
                            var responseData = result.getDataDeviceDTResult.diffgram.NewDataSet.Table;
                            //console.log(responseData.length);
                            console.log('================================responseData');
                            //console.log(responseData);
                            saveUsageTestTable(responseData, index, params.vno, trackinginfo);

                            //update tracking table.
                            if (responseData.length > 0)
                                updateTrackingTable(responseData[responseData.length - 1], params.vno, trackinginfo);// Send last record
                            else
                                updateTrackingTable(responseData, params.vno, trackinginfo); // if only one record inside responseData.
                        }
                    }
                });

        });
    }

    var totalDistance = 0;
    var prevSpeed = 0;
    var prevTopSpeed = 0;
    var avgSpeed = 0;
    var topSpeed = 0;
    var minSpeed = 0;

    var acce = 0;
    var deacce = 0;
    var continuDrive = 0;
    var runningTime = 0;
    var dailyDistance = 0;
    var idleTime = 0;
    var last = null;



    function saveUsageTestTable(data, r_index, vno, trackinginfo) {
        console.log('saveUsageTestTable[' + r_index + ']');
        var imeiNo = vno;//'867290028253796';
        var uId = 'mallesh.reddy@itransglobal.com';
        var Iteration = true;
        var deviceData;
        if (data.length == undefined)// if only one record in data collection.
        {
            deviceData = data;
            Iteration = false;
        }
        else {
            deviceData = data[r_index];
            Iteration = true;

        }

        console.log('deviceData=============================');
        //console.log(deviceData);
        //console.log('data.length  :>> ' + data.length);
        //console.log(r_index);

        var distance = 0;
        var speed = 0;
        var time = 0;

        if (last != null) {
            var sDate = moment(last.msgDateTime);
            var eDate = moment(deviceData.msgDateTime);
            time = moment.duration(eDate.diff(sDate)).asSeconds();
            distance = getDistanceFromLatLonInKm(last.Latitude, last.Longitude, deviceData.Latitude, deviceData.Longitude);
            speed = distance / time;
            speed = speed * 18 / 5;
            // console.log(speed);
        }

        if (distance == 0) {
            dailyDistance = 0;
        } else {
            dailyDistance += distance / 1000;
        }

        if (speed > 2 && totalDistance > 0.5) {
            runningTime += time;
        }

        if (speed - prevSpeed > 5) {
            acce++;
        } else if (speed - prevSpeed < -5) {
            deacce++;
        } else {
            continuDrive++;
        }

        if (speed < 3) {
            idleTime += time;
        }

        if (topSpeed < speed)
            topSpeed = speed;

        if (minSpeed > speed)
            minSpeed = speed;

        avgSpeed = minSpeed + (topSpeed - minSpeed) / 2;

        var seconds = runningTime;
        var thour = seconds / 3600;
        var tmin = (seconds % 3600) / 60;


        var driveTime = tmin / 60 + thour;
        var avg = dailyDistance / driveTime;

        var tableName = "UsageTest" + vno;// deviceData.assetMobileNumber;
        var b = moment();
        var msgDateTime = new Date(deviceData.msgDateTime);
        //console.log(msgDateTime);

        var status = deviceData.deviceStatus;

        if (deviceData.deviceStatus == 'A')
            status = 'I'
        else if (deviceData.deviceStatus == 'B')
            status = 'S';
        else if (deviceData.deviceStatus == 'P')
            status = 'M';




        var saveData = {
            distance: dailyDistance,
            TripLatitude: deviceData.Latitude,
            TripLongitude: deviceData.Longitude,
            RunTime: runningTime,
            TimeDelay: time,
            AvgSpeed: avg,
            UserID: uId,
            TopSpeed: topSpeed,
            IdleTime: idleTime,
            PreviousSpeed: prevSpeed,
            PreviousTopSpeed: prevTopSpeed,
            CurrentSpeed: speed,
            Acceleration: acce,
            DeAcceleration: deacce,
            ConituneDrive: continuDrive,
            msgDateTime: msgDateTime,
            Status: status,
            Hour: thour,
            Min: tmin,
            GPSTime: '0',
            CallBlock: 'false'
        };

        totalDistance += distance / 1000;
        prevSpeed = speed;
        last = deviceData;
        var tableName2 = "usagealert" + vno;
        saveParsDBController.saveUsageTest(_Parse, tableName2, saveData, function (err, result) {
        });
        saveParsDBController.saveUsageTest(_Parse, tableName, saveData, function (err, result) {
            //console.log(err);
            console.log('=======================================================result ================')
            if (r_index < data.length - 1) {
                console.log(vno);
                saveUsageTestTable(data, (r_index + 1), vno, trackinginfo);
            } else {
                //console.log('else');
                dailyDistance = 0
            }
        });

    }
    var Schema = mongoose.Schema;
    var _tablename = 'tracking';

    var FirstSchema = new Schema(
        {
            distance: { type: String },

            TripLatitudeD: { type: String }
        }, { collection: _tablename }//'UsageTest170623'}
    );
    var collection = mongoose.model(_tablename, FirstSchema);

    function updateTrackingTable(data, vno, trackinginfo) {

        var imeiNo = vno;//'867290028253796';
        var uId = 'mallesh.reddy@itransglobal.com';
        var Iteration = true;
        var deviceData = data;


        var distance = 0;
        var speed = 0;
        var time = 0;

        if (last != null) {
            var sDate = moment(last.msgDateTime);
            var eDate = moment(deviceData.msgDateTime);
            time = moment.duration(eDate.diff(sDate)).asSeconds();
            distance = getDistanceFromLatLonInKm(last.Latitude, last.Longitude, deviceData.Latitude, deviceData.Longitude);
            speed = distance / time;
            speed = speed * 18 / 5;
            // console.log(speed);
        }

        if (distance == 0) {
            dailyDistance = 0;
        } else {
            dailyDistance += distance / 1000;
        }

        if (speed > 2 && totalDistance > 0.5) {
            runningTime += time;
        }

        if (speed - prevSpeed > 5) {
            acce++;
        } else if (speed - prevSpeed < -5) {
            deacce++;
        } else {
            continuDrive++;
        }

        if (speed < 3) {
            idleTime += time;
        }

        if (topSpeed < speed)
            topSpeed = speed;

        if (minSpeed > speed)
            minSpeed = speed;

        avgSpeed = minSpeed + (topSpeed - minSpeed) / 2;

        var seconds = runningTime;
        var thour = seconds / 3600;
        var tmin = (seconds % 3600) / 60;


        var driveTime = tmin / 60 + thour;
        var avg = dailyDistance / driveTime;

        var tableName = "UsageTest" + vno;// deviceData.assetMobileNumber;
        var b = moment();
        var msgDateTime = new Date(deviceData.msgDateTime);
        //console.log(msgDateTime);

        var status = deviceData.deviceStatus;

        if (deviceData.deviceStatus == 'A')
            status = 'I'
        else if (deviceData.deviceStatus == 'B')
            status = 'S';
        else if (deviceData.deviceStatus == 'P')
            status = 'M';




        var saveData = {
            distance: dailyDistance,
            TripLatitude: deviceData.Latitude,
            TripLongitude: deviceData.Longitude,
            RunTime: runningTime,
            TimeDelay: time,
            AvgSpeed: avg,
            UserID: uId,
            TopSpeed: topSpeed,
            IdleTime: idleTime,
            PreviousSpeed: prevSpeed,
            PreviousTopSpeed: prevTopSpeed,
            CurrentSpeed: speed,
            Acceleration: acce,
            DeAcceleration: deacce,
            ConituneDrive: continuDrive,
            msgDateTime: msgDateTime,
            Status: status,
            Hour: thour,
            Min: tmin,
            GPSTime: '0',
            CallBlock: 'false'
        };

        totalDistance += distance / 1000;
        prevSpeed = speed;
        last = deviceData;
        //console.log(saveData);
        //console.log('=======================================================');
        //cron.schedule('*/1 * * * *', function(){

        var _tablename = 'tracking';//'864502031944796';
        saveParsDBController.deleteTrackingBysimid(mongoose, 'tracking', trackinginfo, _Parse, vno, saveData, collection);
    }
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c * 1000; // Distance in m
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

});
