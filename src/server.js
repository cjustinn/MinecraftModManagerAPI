    // Package imports.
const Express = require('express');
const Cors = require('cors');
const Dotenv = require('dotenv');

    // App configuration
const App = Express();
App.use(Cors());
App.use(Express.json());

Dotenv.config();

    // Route definitions
// Generic root route.
App.get("/", (req, res) => {
    res.status(200).json({ status: "running" })
});

// MOD REQUESTS - GET - ACTIVE
App.get("/mod-requests/active", (req, res) => {
    Database.getActiveModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all active mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no active mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

// MOD REQUESTS - GET - INACTIVE
App.get("/mod-requests/inactive", (req, res) => {
    Database.getInactiveModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all inactive mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no inactive mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

// MOD REQUESTS - GET - ALL
App.get("/mod-requests/all", (req, res) => {
    Database.getAllModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

// MOD REQUESTS - GET - BY REQUESTER
App.get("/mod-requests/by-requester", (req, res) => {
    const { target, active } = req.query;

    if (!target) { res.status(400).json({ success: false, message: `You must provide a target requester.` }); }
    else {

        Database.getModRequestsByRequester(target, active).then(requests => {
            if (requests.length > 0) { res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved ${active != undefined && active != null ? (active ? 'active ' : 'inactive ') : 'all '}mod requests from ${target}` }); }
            else {
                res.status(400).json({ success: true, _data: requests, message: `${target} ${active != null && active != undefined ? (active ? "has no active mod requests." : "has no inactive mod requests.") : "hasn't submitted any mod requests."}` });
            }
        }).catch(err => res.status(500).json({ success: false, message: err }));
        
    }
});

// MOD REQUESTS - POST (Save)
App.post("/mod-requests/add", (req, res) => {
    const { modData } = req.body;
    
    if (!modData) { res.status(400).json({ success: false, message: `You must provide mod data!` }); }
    else {

        Database.saveModRequest(modData).then(mod => {
            res.status(201).json({ success: true, _data: mod, message: `You have successfully submitted your mod request!` });
        }).catch(err => res.status(500).json({ success: false, message: `There was a problem requesting the mod. Please try again!` }));

    }
});

// MOD REQUESTS - PUT (Update)
App.put("/mod-requests/update", (req, res) => {
    const { target, requestData } = req.body;

    if (!target || !requestData) { res.status(400).json({ success: false, message: `You must provide both a target (ObjectId) and updated data.` }); }
    else {

        Database.updateModRequest(target, requestData).then(r => {
            res.status(200).json({ success: true, _data: r, message: `The mod request has been updated successfully.` });
        }).catch(err => res.status(500).json({ success: false, message: err }));

    }
})

// MODS - POST (Save)
App.post("/mods/add", (req, res) => {
    const { modData } = req.body;

    if (!modData) { res.status(400).json({ success: false, message: `You must provide mod data to be saved!` }) }
    else {

        Database.saveMod(modData).then(r => {
            res.status(201).json({ success: true, _data: r, message: `The mod has been saved successfully.` })
        }).catch(err => res.status(500).json({ success: false, message: err }));

    }
})

// MODS - GET - ALL
App.get("/mods/all", (req, res) => {
    Database.getAllMods().then(r => {
        if (r.length > 0) {
            res.status(200).json({ success: true, _data: r, message: `Successfully retrieved all approved mods.`})
        } else {
            res.status(400).json({ success: true, _data: r, message: `There are currently no approved mods.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err }))
})

// MODS - GET - BY NAME
App.get("/mods/search", (req, res) => {
    const { target } = req.query;

    if (!target) { res.status(400).json({ success: false, message: `You must provide a search query as the target value.` }); }
    else {

        Database.getModsByName(target).then(mods => {
            if (mods.length > 0) {
                res.status(200).json({ success: true, _data: mods, message: `Successfully retrieved all mods which matched the search query.` });
            } else {
                res.status(400).json({ success: true, _data: [], message: `There are no mods which match the search query.` });
            }
        }).catch(err => res.status(500).json({ success: false, message: err }));

    }
})

// Server start-up
// The server should use either the port number provided by environment variable, or 8080 if one isn't provided.
const PORT = process.env.PORT || 8080;

// Get the connection string from the environment variables to connect to the database.
var databaseURL = process.env.MONGO_URL;

// All functions defined in ./Database.js which are exported can now be used through this 'Database' variable below.
const Database = require('./Database');

// Pass the connection string to the connect function from the ./Database.js file.
Database.connect(databaseURL).then(() => {
    // Get the Express server to start listening on the provided port, and address '0.0.0.0' (for Railway), if the connection to the Mongo database was successful.
    App.listen(PORT, '0.0.0.0', () => {
        console.log(`The API server is now listening on port ${PORT}`);
    });
}).catch(err => {
    // Log the error string in console if something stops the connection to the database from being made.
    console.log(`Could not start the API server...\n\n${err}`);
})