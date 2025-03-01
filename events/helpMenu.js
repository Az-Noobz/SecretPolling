const { EmbedBuilder, MessageFlags } = require('discord.js');

async function helpMenu(interaction) {
    let embed;
    switch (interaction.values[0]) {
        case "hiw":
            embed = new EmbedBuilder()
                .setColor("#143306")
                .setTitle("📊 How Secret Polling Works")
                .setDescription(
                    "Secret Polling is a **fully anonymous** voting system designed for Discord. " +
                    "When you participate in a poll, your identity remains completely hidden. " +
                    "This ensures **fair, unbiased, and pressure-free voting** in your community.\n\n" +
                    "**🔹 How it Works:**\n" +
                    "• Polls are created with `/poll create`.\n" +
                    "• Users vote using buttons – **no usernames are recorded**.\n" +
                    "• Votes are securely stored and only accessible to poll administrators.\n\n" +
                    "✅ **Safe & Secure** | 🎭 **100% Anonymous** | 📊 **Instant Results**"
                )
                .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            break;

        case "setup":
            embed = new EmbedBuilder()
                .setColor("#143306")
                .setTitle("⚙️ Setting Up a Poll")
                .setDescription(
                    "Creating a poll is simple and intuitive! Follow these steps:\n\n" +
                    "**🛠️ Step 1:** Use the following command to start a poll:\n" +
                    "```/poll create title:'Best Movie?' description:'Vote now!'```\n\n" +
                    "**🎯 Step 2:** Users can vote by clicking on the buttons under the poll message.\n" +
                    "**📊 Step 3:** You can view results anytime using `/poll analytics` (if you have permission).\n\n" +
                    "✨ **Pro Tip:** If no options are provided, the poll defaults to **Yes/No voting!**"
                )
                .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            break;

        case "storage":
            embed = new EmbedBuilder()
                .setColor("#143306")
                .setTitle("🔏 Terms of Service & Privacy Policy")
                .setDescription(
                    "🔹 Secret Polling is committed to **privacy and security**. We do not track, log, or share personal data.\n\n" +
                    "**🔒 What We Store:**\n" +
                    "• **Poll Data** – Titles, descriptions, and options.\n" +
                    "• **Votes** – Anonymous selections (no usernames), but we do collect discord IDs.\n\n" +
                    "**🚫 What We DON’T Store:**\n" +
                    "• ❌ Usernames linked to votes.\n" +
                    "• ❌ Private messages or server logs.\n\n" +
                    "📜 Read our full [Terms of Service](https://docs.google.com/document/d/10Y9MkAUTp0dglXcpBIUtSgrfkbLvldByMWYCTQFgq68)\n" +
                    "🔒 View our [Privacy Policy](https://docs.google.com/document/d/10Y9MkAUTp0dglXcpBIUtSgrfkbLvldByMWYCTQFgq68)"
                )
                .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            break;

        default:
            return;
    }

    interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

module.exports = { helpMenu };