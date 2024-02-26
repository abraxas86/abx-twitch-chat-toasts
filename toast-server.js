// Custom config reader function:
const { readConfigFile } = require('./readConfig.js');

// Twurple libraries:
const { RefreshingAuthProvider } = require('@twurple/auth');
const { ChatClient } = require('@twurple/chat');
const { ApiClient } = require('@twurple/api'); // Import HelixUserApi

// Main app:
async function main() {
    try {
        console.log("Setting config data...");
        const config = await readConfigFile('botinfo.txt');
        const channels = config.channels.split(',');

        // API Token handling:
        console.log("Authorizing...\n");
        const authProvider = new RefreshingAuthProvider({
            clientId: config.client_id,
            clientSecret: config.client_secret
        });

        await authProvider.addUserForToken({
            accessToken: config.access_token,
            refreshToken: config.refresh_token
        }, ['chat']);

        const client = new ChatClient({ authProvider, channels: channels });
        console.log("Connecting...\n");
        await client.connect();
        console.log("Connected!\n\n");

        const apiClient = new ApiClient({ authProvider }); // Initialize the API client

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
        });

        // Proceed with the rest of your program here

    } catch (error) {
        if (error instanceof ConfigError) {
            console.error('Error reading config file:', error);
        } else if (error instanceof TwitchError) {
            console.error('Error connecting to Twitch:', error);
        } else {
            console.error('Unknown error occurred:', error);
        }
    }
}

main();

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

    /*

    // Create a new instance of ChatClient
    const client = new ChatClient({ authProvider, channels: ['abraxas86'] });


    // Attempt to connect to Twitch
    client.connect();

    // Listen for successful connection
    client.on('connected', () => {
        console.log("Successfully connected to Twitch");
    });

    // Listen for raw messages for debug purposes
    client.on('rawMessage', (message) => {
        console.log("Received raw message:", message);
    });

    // Listen to chat messages
    client.on('message', (channel, user, message) => {
        // Extract information from chat messages
        const chatter = user.displayName;
        const msg = message;
        const color = user.color;
        const profilePicUrl = user.profilePictureUrl;

        // Log the information
        console.log(`Chatter: ${chatter}`);
        console.log(`Message: ${msg}`);
        console.log(`Color: ${color}`);
        console.log(`Profile Picture URL: ${profilePicUrl}`);
    });
});
*/