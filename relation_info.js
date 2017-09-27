/**
 * Created by juc on 6/22/2017.
 */

exports.getInfoFromRelation = function (db, callback) {
    var Schema = db.Schema;
    var FirstSchema = new Schema(
        {
            AssetID: {type: String},
            _created_at: {type: Date},
            _updated_at: {type: Date},
            DeviceID: {type: String},
            simnumber: {type: String},
            loginid: {type: String},
            organization: {type: String},
            status: {type: String},
            DriverID: {type: String}
        }, {collection: 'masterrelation'}
    );
    var collection = db.model('masterrelation', FirstSchema);
    collection.find({}, function(err, result) {
        callback(result);
    });
};