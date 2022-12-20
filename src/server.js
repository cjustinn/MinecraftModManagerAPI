// Package imports.
const Express = require('express');
const Cors = require('cors');
const Dotenv = require('dotenv');

// App configuration
const App = Express();
App.use(Cors());
App.use(Express.json());

Dotenv.config();

// Routes
App.get("/", (req, res) => {
    res.status(200).json({ status: "running" })
});

    // Mod Requests
App.get("/mod-requests/active", (req, res) => {
    Database.getActiveModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all active mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no active mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

App.get("/mod-requests/inactive", (req, res) => {
    Database.getInactiveModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all inactive mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no inactive mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

App.get("/mod-requests/all", (req, res) => {
    Database.getAllModRequests().then(requests => {
        if (requests.length > 0) {
            res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved all mod requests.` });
        } else {
            res.status(400).json({ success: true, _data: requests, message: `There are currently no mod requests.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err}));
});

App.get("/mod-requests/by-requester", (req, res) => {
    const { target, active } = req.query;

    if (!target) { res.status(400).json({ success: false, message: `You must provide a target requester.` }); }
    
    Database.getModRequestsByRequester(target, active).then(requests => {
        if (requests.length > 0) { res.status(200).json({ success: true, _data: requests, message: `Successfully retrieved ${active != undefined && active != null ? (active ? 'active ' : 'inactive ') : 'all '}mod requests from ${target}` }); }
        else {
            res.status(400).json({ success: true, _data: requests, message: `${target} ${active != null && active != undefined ? (active ? "has no active mod requests." : "has no inactive mod requests.") : "hasn't submitted any mod requests."}` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err }));
});

App.post("/mod-requests/add", (req, res) => {
    const { modData } = req.body;
    
    if (!modData) { res.status(400).json({ success: false, message: `You must provide mod data!` }); }

    Database.saveModRequest(modData).then(mod => {
        res.status(201).json({ success: true, _data: mod, message: `You have successfully submitted your mod request!` });
    }).catch(err => res.status(500).json({ success: false, message: `There was a problem requesting the mod. Please try again!` }));
});

App.put("/mod-requests/update", (req, res) => {
    const { target, requestData } = req.body;

    if (!target || !requestData) {
        res.status(400).json({ success: false, message: `You must provide both a target (ObjectId) and updated data.` });
    }

    Database.updateModRequest(target, requestData).then(r => {
        res.status(200).json({ success: true, _data: r, message: `The mod request has been updated successfully.` });
    }).catch(err => res.status(500).json({ success: false, message: err }));
})

App.post("/mods/add", (req, res) => {
    const { modData } = req.body;

    if (!modData) { res.status(400).json({ success: false, message: `You must provide mod data to be saved!` }) }

    Database.saveMod(modData).then(r => {
        res.status(201).json({ success: true, _data: r, message: `The mod has been saved successfully.` })
    }).catch(err => res.status(500).json({ success: false, message: err }));
})

App.get("/mods/all", (req, res) => {
    Database.getAllMods().then(r => {
        if (r.length > 0) {
            res.status(200).json({ success: true, _data: r, message: `Successfully retrieved all approved mods.`})
        } else {
            res.status(400).json({ success: true, _data: r, message: `There are currently no approved mods.` });
        }
    }).catch(err => res.status(500).json({ success: false, message: err }))
})

// Server start-up
const PORT = process.env.PORT || 8080;
var databaseURL = process.env.MONGO_URL;

const Database = require('./Database');

Database.connect(databaseURL).then(() => {
    App.listen(PORT, '0.0.0.0', () => {
        console.log(`The API server is now listening on port ${PORT}`);
    });
}).catch(err => {
    console.log(`Could not start the API server...\n\n${err}`);
})