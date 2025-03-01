const { Client, GatewayIntentBits, Collection, MessageFlags, ActivityType } = require("discord.js");
const fs = require("fs");
require("dotenv").config();
const { buttonSelect } = require("./events/pollButtons")
const { helpMenu } = require("./events/helpMenu")

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load commands dynamically
bot.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.data.name, command);
}

// Register slash commands on startup
bot.once("ready", async () => {
    console.log(`✅ Logged in as ${bot.user.tag}`);
    bot.user.setActivity('new polls being created', { type: ActivityType.Watching }); // You can change type to Listening, Playing, Competing, Streaming
    /*const guildCount = await bot.shard.fetchClientValues("guilds.cache.size");
    const totalGuilds = guildCount.reduce((acc, count) => acc + count, 0);
    console.log(`✅ Bot is running in ${totalGuilds} servers across ${bot.shard.count} shards.`);*/

    try {
        await bot.application.commands.set(bot.commands.map(cmd => cmd.data));
        console.log("✅ Slash commands registered successfully!");
    } catch (error) {
        console.error("❌ Failed to register commands:", error);
    }
});

// Handle commands
bot.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {

        const command = bot.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, bot);
        } catch (error) {
            console.error(`❌ Error executing command ${interaction.commandName}:`, error);
            await interaction.reply({ content: "⚠️ An error occurred while executing the command.", flags: MessageFlags.Ephemeral });
        }
    } else if (interaction.isStringSelectMenu()) {
        helpMenu(interaction)
    } else if (interaction.isButton){
        buttonSelect(interaction)
    }
});

bot.login(process.env.TOKEN);