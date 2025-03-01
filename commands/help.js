const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a help embed to nagivate the bot!"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#143306")
            .setTitle("📖 Secret Polling Help Center")
            .setDescription("Select an option from the menu below to get started!")
            .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu')
            .setPlaceholder('🔽 Choose a category...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('How It Works')
                    .setDescription('Learn how Secret Polling operates')
                    .setValue('hiw')
                    .setEmoji('📊'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Setup Guide')
                    .setDescription('Learn how to create and manage polls')
                    .setValue('setup')
                    .setEmoji('⚙️'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('ToS & Privacy Policy')
                    .setDescription('Read our terms and privacy policy')
                    .setValue('storage')
                    .setEmoji('🔏')
            );

        const buttons = new ActionRowBuilder().addComponents(selectMenu);
        interaction.reply({ embeds: [embed], components: [buttons], flags: MessageFlags.Ephemeral });
    }
};