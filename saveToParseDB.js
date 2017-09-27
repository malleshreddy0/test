/**
 * Created by juc on 6/22/2017.
 */
exports.saveUsageTest = function (db, table_name, data, callback) {
    console.log('table_name >> ' + table_name);
    var classUser = db.Object.extend(table_name);//("UsageTest170623");
    var object = new classUser();
    //console.log(object);
    try{
        object.set('distance', data.distance);
    }
    catch(e)
    {
        object.set('distance', data.distance.toString());
    }
    
    object.set('TripLatitude', data.TripLatitude);
    object.set('TripLongitude', data.TripLongitude);
    try{
        object.set('RunTime', data.RunTime);
    }
    catch(e){
        object.set('RunTime', data.RunTime.toString());
    }
    try{
        object.set('TimeDelay', data.TimeDelay);
    }
    catch(e){
        object.set('TimeDelay', data.TimeDelay.toString());
    }
    try{object.set('AvgSpeed', data.AvgSpeed);}
    catch(e){object.set('AvgSpeed', data.AvgSpeed.toString());}
    
    object.set('UserID', data.UserID);
     try{object.set('TopSpeed', data.TopSpeed);}
    catch(e){object.set('TopSpeed', data.TopSpeed.toString());}
    
     try{object.set('IdleTime', data.IdleTime);}
    catch(e){object.set('IdleTime', data.IdleTime.toString());}

     try{object.set('PreviousSpeed', data.PreviousSpeed);}
    catch(e){object.set('PreviousSpeed', data.PreviousSpeed.toString());}

     try{object.set('PreviousTopSpeed', data.PreviousTopSpeed);}
    catch(e){object.set('PreviousTopSpeed', data.PreviousTopSpeed.toString());}

    try{object.set('CurrentSpeed', data.CurrentSpeed);}
    catch(e){object.set('CurrentSpeed', data.CurrentSpeed.toString());}

    try{object.set('Acceleration', data.Acceleration);}
    catch(e){object.set('Acceleration', data.Acceleration.toString());}

    try{object.set('DeAcceleration', data.DeAcceleration);}
    catch(e){object.set('DeAcceleration', data.DeAcceleration.toString());}

    try{object.set('ConituneDrive', data.ConituneDrive);}
    catch(e){object.set('ConituneDrive', data.ConituneDrive.toString());}

    try{
        object.set('Hour', data.Hour);}
    catch(e){
    object.set('Hour', data.Hour.toString());}
 //console.log(data.msgdatatime);
    try{
        object.set('msgDateTime', data.msgDateTime);

    }
    catch(e){
        //object.set('msgDateTime', data.msgDateTime);
    }
      try{
        object.set('Status', data.Status);}
    catch(e){
    object.set('Status', data.Status.toString());}
    try{
    object.set('Min', data.Min);}
    catch(e){
    object.set('Min', data.Min.toString());}

    
    object.set('GPSTime', data.GPSTime);
    object.set('CallBlock', data.CallBlock);
    object.save(null, {
        success: function (object) {
            console.log('============================================================== savesuccess');
            console.log(object);
            
            if (callback)
                callback();
        },
        error: function (object, error) {
            console.log(error);
        }
    });
    };

    //==================================================Tracking===============
//exports.saveUsageTestTracking = function (db, vno, data,trackinginfo, callback) {
function saveUsageTestTracking(db, vno, data, trackinginfo, callback) {

    console.log('---------------------------------------------------------------------------tracking Insert');
    console.log(trackinginfo);
    console.log('table_name >> tracking');
    var classUser = db.Object.extend('tracking');//("UsageTest170623");
    var object = new classUser();
    //console.log(object);
    //--------------------------------------------------------------

    try{object.set('Maxspeed', data.TopSpeed);}
    catch(e){object.set('Maxspeed', data.TopSpeed.toString());}
    object.set('sqnumber',0);
    object.set('UserID', trackinginfo.loginid);
    try {
        object.set('ProductID', trackinginfo.assetid);
    }
    catch (e) { }
    
    try {
        object.set('assetid', parseInt(trackinginfo.Deviceid));
    }
    catch (e) { }
    object.set('Latitude', parseFloat(data.TripLatitude));
    object.set('Longitude', parseFloat(data.TripLongitude));
    try { object.set('Status', data.Status); } catch (e) { object.set('Status', data.Status.toString()); }

    try {
        object.set('simid', parseInt(trackinginfo.simno));
    }
    catch (e) { }
   
    try{object.set('Distance', 0);} catch(e){ object.set('Distance', '0');
    }
    object.set('Fuel',0);
    object.set('Temprature',0);
    object.set('companyid', trackinginfo.organization);//organizationid);

    object.set('Datetime', data.msgDateTime);
    object.set('Voltage',0);
   // object.set('CallBlock', data.CallBlock);

    object.save(null, {
        success: function (object) {
            console.log(object);
            console.log(object.data);
            console.log('------------------------------------------------------------------tracking Insert2');
            //if (callback)
            //    callback();
        },
        error: function (object, error) {
            console.log(error);
        }
    });
    }
//=========================================================================
//var Schema = db.Schema;
//var _tablename = 'tracking';

//var FirstSchema = new Schema(
//    {
//        distance: { type: String },

//        TripLatitudeD: { type: String }
//    }, { collection: _tablename }//'UsageTest170623'}
//);
//var collection = db.model(_tablename, FirstSchema);

exports.deleteTrackingBysimid = function (db, table_name, trackinginfo, _db, vno, saveData, collection) {//, callback
    console.log('-------------------------------------------------------------------------------------------------trackinginfo');
    console.log(trackinginfo);
        //var _simno = parseInt(trackinginfo.simno);
        //collection.remove({ simid: _simno }, function (err, result) {
        //    console.log('Delete Worked');
        //    if (err) {
        //        console.log(err);
        //    }
        //    //if (result.result.ok == 1)
            
        //    console.log('-------------------------------------------------------------------------------------------------Delete');
        //    console.log(result.result);
        //    saveUsageTestTracking(_db, vno, saveData, trackinginfo);
        //    //return result;
        //    //callback(result);
        //});

        saveUsageTestTracking(_db, vno, saveData, trackinginfo);
        console.log('Delete Done 1');
    };
//    exports.getInfoFromUsageTest = function (db,table_name,_simid, callback) {
//    var Schema = db.Schema;
//    var _tablename = 'tracking';
//    //var _tablename = 'materrelation';//UsageTest'+table_name;
//    var FirstSchema = new Schema(
//        {
//            distance: {type: String},
            
//            TripLatitudeD: {type: String}
//        }, {collection: _tablename}//'UsageTest170623'}
//    );
//    var collection = db.model(_tablename, FirstSchema);
//    collection.find({ 'simid': _simid }, function (err, result) {
//        if(err)
//        {
//            console.log(err);
//        }
//        console.log(result);
//        callback(result.length);
//            });
//        //864502032055956
//    //collection.remove({ 'simid': _simid }, function (err, result) {
//    //    //if (err) {
//    //    //    console.log(err);
//    //    //}
//    //    //if (result.result.ok == 1)
//    //    //    console.log('resul OK ');
            
//    //    callback(result);
//    //});
//    console.log('Done');
//};