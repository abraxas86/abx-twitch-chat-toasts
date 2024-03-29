(async () => {
    try {
        // Custom config reader function:
        const { readConfigFile } = require('./readConfig.js');

        // Twurple libraries:
        const { RefreshingAuthProvider } = require('@twurple/auth');
        const { ChatClient } = require('@twurple/chat');
        const { ApiClient } = require('@twurple/api');

        // Socket Server:
        const { Server } = require('socket.io');
        const http = require('http');
        const cors = require('cors');

        // Web Server:
        const express = require('express');
        const path = require('path');
        const app = express();

        // Set up view engine
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));

        app.use(cors());

        console.log("Setting config data...");
        const config = await readConfigFile('botinfo.txt');

	console.log("Setting browser config data...");
        const browserConfig = setBrowserConfig(config)
	
	console.log("Getting channels...");
        const channels = config.channels.split(',');

        app.get('/', async (req, res) => {
        try {
            res.render('index', { config: escape(JSON.stringify(browserConfig)) });
        } catch (error) {
            console.error('Error setting config data:', error);
            res.status(500).send('Internal Server Error');
        }
    });

        // Main app:
        async function main() {
            try {
                //initiate webserver:
                console.log("Starting web server...");
                app.use(express.static('./'));
                app.listen(config['http-port'], config.server, () => {
                    console.log(`Web server running on ${config.server}:${config['http-port']}`);
                });

                // API Token handling:
                console.log("Authorizing...");
                const authProvider = new RefreshingAuthProvider({
                    clientId: config.client_id,
                    clientSecret: config.client_secret
                });

                await authProvider.addUserForToken({
                    accessToken: config.access_token,
                    refreshToken: config.refresh_token
                }, ['chat']);

                const client = new ChatClient({ authProvider, channels: channels });
                console.log("Connecting to Twitch...");
                await client.connect();
                console.log("Connected to Twitch!");

                const apiClient = new ApiClient({ authProvider }); // Initialize the API client

                // Initialize HTTP server
                const server = http.createServer();
                const io = new Server(server, {
                    cors: {
                        origin: 'http://192.168.10.11:9002' // Allow requests from any origin
                    }
                });

                server.listen(config['socket-port'], config.server, () => {
                    console.log(`Socket.IO server listening on ${config.server}:${config['socket-port']}\n\n`);
                });

                io.on('connection', (socket) => {
                    console.log('A client has connected');
                });

                function sendPacket(packet) {
                    io.emit('toastify', packet); // Emit the packet to all connected clients
                }

                
                client.onMessage(async (channel, username, message, msgObject) => {
                    console.log(`(${channel}) [${username}]: ${message}`);

                    const rawObjectData = msgObject._raw.split(';');
                    const msgRaw = {};

                    for (const part of rawObjectData) {
                        const [key, value] = part.split('=');
                        msgRaw[key] = value;
                    }

                    const toastify = {
                        username: msgRaw['display-name'],
                        colour: msgRaw.color,
                        message: msgObject.text,
                        emotes: msgRaw.emotes
                    };

                    // Get user's avatar and add to object
                    const user = await apiClient.users.getUserByName(username);
                    if (user) {
                        toastify.profilePictureUrl = user.profilePictureUrl;
                    }

                    const toastPacket = JSON.stringify(toastify);
                    sendPacket(toastPacket); // Send the packet using the sendPacket function
                });

            } catch (error) {
                if (error instanceof TwitchError) {
                    console.error('Error connecting to Twitch:', error);
                } else {
                    console.error('Unknown error occurred:', error);
                }
            }
        }

        class TwitchError extends Error {
            constructor(message) {
                super(message);
                this.name = 'TwitchError';
            }
        }

        class AuthenticationError extends Error {
            constructor(message) {
                super(message);
                this.name = 'AuthenticationError';
            }
        }

        main();

    } catch (error) {
        console.error('Error:', error);
    }
})();

function setBrowserConfig(configData) {
        let error = false;

        // Ensure default values are set if necessary
        if (configData.toastDelay === '' || configData.toastDelay === undefined) {
            configData.toastDelay = 0;
        }

        const invalidNumberMessage = "please ensure value is numeric.";

        // Validate numeric variables
        if (isNaN(parseInt(configData['socket-port'], 10))) {
            console.warn(`Error with socket-port value. ${invalidNumberMessage}`);
            error = true;
        }

        if (isNaN(parseInt(configData.maxToasts, 10))) {
            console.warn(`Error with maxToast value. ${invalidNumberMessage}`);
            error = true;
        }

        if (isNaN(parseInt(configData.toastDelay, 10))) {
            console.warn(`Error with toastDelay value. ${invalidNumberMessage}`);
            error = true
        }

        if (error){
            console.warn('Errors detected.  Please review, correct, and re-run.');
            return; //quit on errors found
        }

        // Construct browser configuration object
        const createBrowserConfig = {
            server: configData.server || "",
            port: configData['socket-port'] || "",
            maxToasts: configData.maxToast || 5,
            toastDelay: configData.toastDelay || 0
        };

        // Emit configuration data to the server
        return createBrowserConfig;
    }