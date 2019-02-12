import { Tayuya } from './TayuyaClient';
import { PermissionResolvable, Message, Permissions } from 'discord.js';
import { CommandInfo } from '../base/types/CommandInfo';
export abstract class Command {
  private _disabled!: boolean;
  public client!: Tayuya;
  public name!: string;
  public description!: string;
  public usage!: string;
  public aliases!: string[];
  public category!: string;
  public senderPerms!: PermissionResolvable[];
  public clientPerms!: PermissionResolvable[];
  public ownerOnly!: boolean;
  public constructor(info?: CommandInfo){ 
    Object.assign(this, info);
    if(typeof this.aliases === 'undefined') this.aliases = [];
    if(typeof this.senderPerms === 'undefined') this.senderPerms = [];
    if(typeof this.clientPerms === 'undefined') this.clientPerms = [];
    if(typeof this.ownerOnly === 'undefined') this.ownerOnly = false;
    if (!this.name) throw new Error(`A command is missing a name:\n${__filename}`);
		if (!this.description) throw new Error(`A description must be provided for the command: ${this.name}`);
		if (!this.usage) throw new Error(`Usage information must be provided for the command: ${this.name}`);
		if (this.aliases && !Array.isArray(this.aliases))
			throw new TypeError(`Aliases for Command "${this.name}" must be an array of alias strings`);

		if (this.senderPerms && !Array.isArray(this.senderPerms))
			throw new TypeError(`\`senderPerms\` for Command "${this.name}" must be an array`);

		if (this.clientPerms && !Array.isArray(this.clientPerms))
			throw new TypeError(`\`clientPerms\` for Command "${this.name}" must be an array`);

		if (this.senderPerms && this.senderPerms.length)
			this._validatePermissions('callerPermissions', this.senderPerms);

		if (this.clientPerms && this.clientPerms.length)
			this._validatePermissions('clientPermissions', this.clientPerms);

  };
  public async execute(message: Message, args: string[]): Promise <any> {};
  public get disabled(): boolean { return this._disabled; };
  public enable(): void { this._disabled = false; };
  public disable(): void { this._disabled = true; };
  private _validatePermissions(field: string, perms: PermissionResolvable[]): void
	{
		let errString: (i: number, err: any) => string = (i, err) =>
			`Command "${this.name}" permission "${perms[i]}" in ${field}[${i}] is not a valid permission.\n\n${err}`;

		for (const [index, perm] of perms.entries())
			try { Permissions.resolve(perm); }
			catch (err) { throw new TypeError(errString(index, err)); };
	};
};