const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Schema definitions
    // Mod request
let modRequestSchema = new Schema({
    requester: {
        type: String,
        required: true
    },
    modName: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    requestedDate: {
        type: Date,
        required: false,
        default: Date.now()
    },
    approved: {
        type: Boolean,
        required: false,
        default: false
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    }
});
    // Added mod
let modSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    requester: {
        type: String,
        required: true,
        unique: false
    },
    link: {
        type: String,
        required: true
    },
    approvedDate: {
        type: Date,
        required: false,
        default: Date.now()
    },
    associatedRequest: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ModRequests'
    }
});

// Variable Declarations

let ModRequests;
let Mods;

// Exported functions for handling database queries and connection establishment.

/**
 * 
 * @param {String} connectionString The MongoDB connection URI string.
 * @returns {Promise<null>} A promise which can be resolved to indicate success or failure.
 */
module.exports.connect = (connectionString) => {
    return new Promise((resolve, reject) => {
        let db = Mongoose.createConnection(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        db.on('error', (err) => reject(err));
        db.once('open', () => {

            ModRequests = db.model("ModRequests", modRequestSchema);
            Mods = db.model("Mods", modSchema);

            resolve();

        });
    });
}

// Mod Request Functions
    // POST
module.exports.saveModRequest = (requestData) => {
    return new Promise((resolve, reject) => {
        let newRequest = new ModRequests(requestData);
        newRequest.save(err => {
            if (err) {
                if (err.code == 11000) {
                    reject(`There is already a matching request.`);
                } else {
                    reject(`There was an error saving the request.`);
                }
            }

            resolve(newRequest);
        });
    });
};

// Get - ACTIVE
module.exports.getActiveModRequests = () => {
    return new Promise((resolve, reject) => {
        ModRequests.find({ active: true }).sort('requestedDate').exec().then(requests => {
            resolve(requests);
        }).catch(err => reject(err));
    })
}

// GET - INACTIVE
module.exports.getInactiveModRequests = () => {
    return new Promise((resolve, reject) => {
        ModRequests.find({ active: false }).sort('requestedDate').exec().then(requests => {
            resolve(requests);
        }).catch(err => reject(err));
    })
}

// GET - ALL
module.exports.getAllModRequests = () => {
    return new Promise((resolve, reject) => {
        ModRequests.find({}).sort('requestedDate').exec().then(requests => {
            resolve(requests);
        }).catch(err => reject(err));
    })
}

// GET - BY REQUESTER
module.exports.getModRequestsByRequester = (target, currentlyActive) => {
    return new Promise((resolve, reject) => {
        let filter = { requester: target };
        filter = currentlyActive != null && currentlyActive != undefined ? { ...filter, active: currentlyActive } : filter;

        ModRequests.find(filter).sort('requestedDate').exec().then(requests => {
            resolve(requests);
        }).catch(err => reject(err));
    });
}

// PUT
module.exports.updateModRequest = (target, requestData) => {
    return new Promise((resolve, reject) => {
        ModRequests.updateOne({ _id: target }, { $set: requestData }).exec().then(updatedReq => {
            resolve(updatedReq);
        }).catch(err => reject(err));
    });
}

// DELETE
module.exports.deleteModRequest = (target) => {
    return new Promise((resolve, reject) => {
        ModRequests.deleteOne({ _id: target }).exec().then(() => resolve(`The mod request has been deleted.`)).catch(err => reject(err));
    });
}

// Mod Functions
module.exports.saveMod = modData => {
    return new Promise((resolve, reject) => {
        let newMod = new Mods(modData);
        newMod.save(err => {
            if (err) {
                if (err.code == 11000) {
                    reject(`That mod has already been approved.`);
                } else {
                    reject(`There was an error saving the mod.`);
                }
            }

            resolve(newMod);
        });
    });
}

module.exports.getAllMods = () => {
    return new Promise((resolve, reject) => {
        Mods.find({}).sort('name').exec().then(_mods => resolve(_mods)).catch(err => reject(err));
    })
}