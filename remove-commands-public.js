import { REST, Routes } from 'discord.js';
import credentials from './credentials.json' assert { type: 'json' };
const { clientId, guildId, token } = credentials;

const rest = new REST({ version: '10' }).setToken(token);

// for guild-based commands
rest
	.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);
// for global commands
rest
	.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);