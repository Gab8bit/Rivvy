import { REST, Routes } from 'discord.js';
import { createRequire } from 'module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { clientId, guildId, token } = require('./credentials.json');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

try {
    console.log(`Inizio a ricaricare ${commands.length} comandi (/).`);
    const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
    );
    console.log(`Successo! Ho caricato correttamente ${data.length} comandi (/).`);
} catch (error) {
    console.error(error);
}