const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite InterServer to your server!"),
    
    async execute(interaction) {
        await interaction.reply({content: "https://discord.com/oauth2/authorize?client_id=961425145916964864", flags: MessageFlags.Ephemeral});
    }
};