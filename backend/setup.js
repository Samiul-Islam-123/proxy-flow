const { spawn } = require('child_process');
const os = require('os');

// Function to install dependencies for each microservice
async function install() {
    const services = ['gateway', 'monitoring', 'simulation'];
    for (let service of services) {
        const command = `npm i`;
        const process = spawn(command, { shell: true, cwd: `services/${service}` });

        process.stdout.on('data', (data) => console.log(`${service}: ${data}`));
        process.stderr.on('data', (data) => console.error(`${service} error: ${data}`));
        process.on('close', (code) => console.log(`${service} installation exited with code ${code}`));
    }
    console.log("Installation completed");
}

// Function to start microservices in separate terminals
async function start(mode) {
    console.log("Microservices starting in " + mode + " mode...");
    const services = ['gateway', 'monitoring', 'simulation'];

    const platform = os.platform();
    const commands = services.map(service => {
        if (platform === 'win32') {
            // For Windows
            return `start cmd.exe /K "cd services\\${service} && npm ${mode === '-DEV' ? 'run dev' : 'start'}"`;
        } else if (platform === 'linux' || platform === 'darwin') {
            // For Linux/macOS (using gnome-terminal or x-terminal-emulator for simplicity)
            return `gnome-terminal -- bash -c "cd services/${service} && npm ${mode === '-DEV' ? 'run dev' : 'start'}; exec bash"`;
        } else {
            console.error('Unsupported platform: ' + platform);
            process.exit(1);
        }
    });

    // Execute the commands to open the terminal
    for (let command of commands) {
        spawn(command, { shell: true, stdio: 'inherit' });
    }

    console.log("All microservices started...");
}

// Main function to parse arguments and trigger the right action
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('-install')) {
        console.log("Installing all services...");
        await install();
    } else if (args.includes('-start')) {
        const modeIndex = args.indexOf('-start') + 1;
        const mode = args[modeIndex] || 'PROD';
        console.log("Starting microservices...");
        await start(mode.toUpperCase());
    } else {
        console.log("Invalid command. Use -install or -start <mode>.");
    }
}

main();
