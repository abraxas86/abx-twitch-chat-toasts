const fs = require('fs');

// Used to read config file and load values
async function readConfigFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(new ConfigError(`Error reading config file: ${err.message}`));
                return;
            }
            // Split the data into lines and filter out comments
            const lines = data.split('\n').filter(line => !line.startsWith('//') && !/^\s*$/.test(line));

            // Parse the contents of the .txt file    
            const config = {};
            lines.forEach(line => {
                const [key, value] = line.split(':').map(part => part.trim());
                config[key] = value;
                console.log(`Read config: ${key}`);
            });
            console.log()
            resolve(config);
        });
    });
}

class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}

module.exports = {
    readConfigFile
};
