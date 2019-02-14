import { Event } from '../structures/Event';
import { Tayuya } from '../structures/TayuyaClient';

module.exports = class ReadyEvent extends Event {
    constructor() { super({ name: 'ready' }); };
    async execute(client: Tayuya) { 
        console.log(`Logged in as ${client.user.tag}...`); 
        try{ client.ensurePlaying(); }
        catch(e) {};
    };
};