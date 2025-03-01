const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const connectDB = require("../utils/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create and manage polls')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Create a new poll.")
                .addStringOption(option =>
                    option.setName("poll-title")
                        .setDescription("Set the title of the poll.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("poll-description")
                        .setDescription("Set a the description of the poll.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("option1")
                        .setDescription("First poll option.")
                )
                .addStringOption(option =>
                    option.setName("option2")
                        .setDescription("Second poll option.")
                )
                .addStringOption(option =>
                    option.setName("option3")
                        .setDescription("Third poll option.")
                )
                .addStringOption(option =>
                    option.setName("option4")
                        .setDescription("Fourth poll option.")
                )
                .addStringOption(option =>
                    option.setName("option5")
                        .setDescription("Fifth poll option.")
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('analytics')
                .setDescription('View the anaytics of a poll.')
                .addStringOption(option =>
                    option.setName("poll-id")
                        .setDescription("The message ID of the poll.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Delete a poll from the server.')
                .addStringOption(option =>
                    option.setName("poll-id")
                        .setDescription("The message ID of the poll.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Lists all the poll IDs within the server.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand == "create") {
            const db = await connectDB();
            const pollsCollection = db.collection("polls");

            let pollTitle = interaction.options.getString("poll-title");
            let pollDes = interaction.options.getString("poll-description");
            let guildId = interaction.guildId;

            // ✅ Check existing polls in the server (Max 3 polls)
            const activePolls = await pollsCollection.countDocuments({ guildId });
            if (activePolls >= 30n) {
                return interaction.reply({ content: "❌ **This server already has 3 active polls. Please delete one before creating a new one.**", flags: MessageFlags.Ephemeral });
            }

            // ✅ Generate Poll Buttons
            const embed = new EmbedBuilder()
                .setColor("143306")
                .setTitle(pollTitle)
                .setDescription(pollDes)
                .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            let pollOptions = [];
            // Now, extract options from the subcommand
            const optionInputs = interaction.options.data.find(opt => opt.name === subcommand)?.options || [];
            if (optionInputs.length === 2) {
                pollOptions = [
                    new ButtonBuilder().setCustomId("poll_1").setLabel("Yes").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("poll_2").setLabel("No").setStyle(ButtonStyle.Secondary),
                ];
            } else {
                for (let i = 2; i < optionInputs.length; i++) {
                    pollOptions.push(
                        new ButtonBuilder().setCustomId(`poll_${i - 1}`).setLabel(optionInputs[i].value).setStyle(ButtonStyle.Secondary)
                    );
                }
            }

            const actionButtons = [];
            for (let i = 0; i < pollOptions.length; i += 5) {
                actionButtons.push(new ActionRowBuilder().addComponents(pollOptions.slice(i, i + 5)));
            }

            const controlButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("removevote").setLabel("Remove Vote").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("getresults").setLabel("View Score").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("endpoll").setLabel("End Poll").setStyle(ButtonStyle.Danger)
            );

            // ✅ Send Poll Embed & Buttons
            await interaction.reply({ embeds: [embed], components: [...actionButtons, controlButtons] });
            let pollMessage = await interaction.fetchReply();

            // ✅ Store Poll Data in MongoDB
            let extractedOptions = optionInputs.slice(2).map(opt => opt.value);
            if (extractedOptions.length === 0) {
                extractedOptions = ["Yes", "No"]; // Default Yes/No if no options provided
            }
            await pollsCollection.insertOne({
                guildId,
                pollId: pollMessage.id,
                title: pollTitle,
                description: pollDes,
                options: extractedOptions,
                votes: [],
                createdAt: new Date(),
            });

            console.log(`✅ New poll created in Guild ${guildId} with ID ${pollMessage.id}`);
        } else if (subcommand == "delete") {
            const db = await connectDB();
            const pollsCollection = db.collection("polls");

            let pollId = interaction.options.getString("poll-id");
            if (!pollId) {
                return interaction.reply({ content: "❌ **You must provide a valid poll ID.**", flags: MessageFlags.Ephemeral });
            }

            // ✅ Check if the poll exists
            const pollData = await pollsCollection.findOne({ pollId });
            if (!pollData) {
                return interaction.reply({ content: "❌ **Poll not found. Please check the ID and try again.**", flags: MessageFlags.Ephemeral });
            }

            // ✅ Delete the poll from MongoDB
            await pollsCollection.deleteOne({ pollId });

            // ✅ Attempt to delete the poll message from Discord
            try {
                const pollMessage = await interaction.channel.messages.fetch(pollId);
                if (pollMessage) await pollMessage.delete();
            } catch (error) {
                console.warn(`⚠️ Unable to delete poll message in Discord (Poll ID: ${pollId})`);
            }

            interaction.reply({ content: `🚫 **Poll \`${pollId}\` has been deleted successfully.**`, flags: MessageFlags.Ephemeral });
        } else if (subcommand == "list") {
            const db = await connectDB();
            const pollsCollection = db.collection("polls");

            let guildId = interaction.guildId;

            // ✅ Fetch active polls for the server
            const activePolls = await pollsCollection.find({ guildId }).toArray();
            const pollCount = activePolls.length;

            let pollList = activePolls.map(poll => `• **${poll.title}** (ID: \`${poll.pollId}\`)`).join("\n");

            // ✅ Handle no active polls
            if (pollCount === 0) {
                pollList = "*No active polls in this server.*";
            }

            // ✅ Create Embed Message
            const embed = new EmbedBuilder()
                .setColor("143306")
                .setTitle("📊 Active Polls")
                .setDescription(`${pollList}\n\n(${pollCount}/3 active polls)`)
                .setFooter({ text: "Secret Polling#4645", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } else if (subcommand == "analytics") {
            const db = await connectDB();
            const pollsCollection = db.collection("polls");

            const pollId = interaction.options.getString("poll-id");
            const pollData = await pollsCollection.findOne({ pollId });

            if (!pollData) {
                return interaction.reply({
                    content: "❌ **Poll not found. Please enter a valid Poll ID.**",
                    ephemeral: true
                });
            }

            // Ensure votes and options exist
            const votesArray = Array.isArray(pollData.votes) ? pollData.votes : [];
            const optionsArray = Array.isArray(pollData.options) ? pollData.options : [];

            const totalVotes = votesArray.length;
            const uniqueVoters = [...new Set(votesArray.map(vote => vote.userId))].length;
            const pollCreationDate = new Date(pollData.createdAt);
            const timeSinceCreation = Math.floor((Date.now() - pollCreationDate) / (1000 * 60 * 60 * 24)); // Days

            // Engagement Rate Calculation
            const engagementRate = ((uniqueVoters / (pollData.eligibleVoters || 1)) * 100).toFixed(2);

            // Count votes per option
            let results = {};
            optionsArray.forEach(option => (results[option] = 0));
            votesArray.forEach(vote => results[vote.option]++);

            // Format the results for the embed
            const resultsText = Object.entries(results)
                .map(([option, count]) => `**${option}:** ${count} votes`)
                .join("\n") || "No votes yet.";

            if (!resultsText || resultsText.trim() === "") {
                resultsText = "📭 **No votes have been cast yet!**";
            }

            // Create Analytics Embed
            const analyticsEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle(`📊 Poll Analytics: ${pollData.title}`)
                .setDescription(`**Detailed insights for this poll.**`)
                .addFields(
                    { name: "🗳️ Total Votes", value: `${totalVotes}`, inline: true },
                    { name: "👥 Unique Voters", value: `${uniqueVoters}`, inline: true },
                    { name: "📊 Engagement Rate", value: `${engagementRate}%`, inline: true },
                    { name: "📅 Days Since Creation", value: `${timeSinceCreation} days`, inline: true },
                    { name: "📌 Poll Options & Votes", value: resultsText, inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [analyticsEmbed], flags: MessageFlags.Ephemeral });
        }
    },
};