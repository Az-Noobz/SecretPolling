const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Sends an invite to our support server!"),
    
    async execute(interaction) {
        await interaction.reply({content: "https://discord.gg/winterstudio", flags: MessageFlags.Ephemeral });
    }
};