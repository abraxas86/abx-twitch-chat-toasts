// Used to read config file and load values
async function readConfigFile(filename) {
    return fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error reading config file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            // Split the data into lines and filter out comments
            const lines = data.split('\n').filter(line => !line.startsWith('//') && !/^\s*$/.test(line));

            // Parse the contents of the .txt file    
            const config = {};
            lines.forEach(line => {
                const [key, value] = line.split(':').map(part => part.trim());
                config[key] = value;
                console.log(`Read config: ${key}`);
            });
            console.log();
            return config;
        })
        .catch(error => {
            console.error('Error reading config file:', error);
            throw error;
        });
}

export { readConfigFile };
