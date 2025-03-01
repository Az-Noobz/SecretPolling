const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with ping latency!"),

    async execute(interaction, client) {
        await interaction.reply({ content: '🏓 Pinging...', flags: MessageFlags.Ephemeral });
        const sent = await interaction.fetchReply();
        const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong! Latency: **${roundTripLatency}ms** | API Latency: **${Math.round(client.ws.ping)}ms**`);
    }
}