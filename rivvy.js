import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { createRequire } from 'module';
import { now } from './utils/time.js';

console.log(`[${now()} INFO] bootstrap: Loading modules...`);

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix JSON import
const require = createRequire(import.meta.url);
const { token } = require('./credentials.json');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
]});

export default { client };

client.commands = new Collection();

// Carica comandi
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(filePath)).default;
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
		console.log(`[${now()} INFO] commands-bootstrap: Successfully loaded ${command.data.name}`);
    } else {
        console.error(`[${now()} ERROR] commands-bootstrap: Command in ${filePath} is missing required "data" or "execute" property!`);
    }
}

// Carica eventi
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = (await import(filePath)).default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
	console.log(`[${now()} INFO] events-bootstrap: Successfully loaded ${event.name}`);
}

// Activity status
function activitybot(){
    client.user.setPresence({
        activities: [{ name: `${client.guilds.cache.size} server | /help`, type: ActivityType.Competing }],
        status: 'online',
    });
    setTimeout(activitybot, 300000);
}

client.on('clientReady', () => {
    activitybot();
});

console.log(`[${now()} INFO] bootstrap: Connecting to Discord...`);
client.login(token);