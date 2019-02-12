import { Event } from '../structures/Event';
import { Tayuya } from '../structures/TayuyaClient';
import { Guild } from 'discord.js';
const Queue = require('../base/models/Queue');

module.exports = class ReadyEvent extends Event {
    constructor() { super({ name: 'guildCreate' }); };
    async execute(client: Tayuya, guild: Guild) {
        await new Queue({ guild: guild.id, songs: [] }).save();
    };
};