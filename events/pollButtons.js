const connectDB = require("../utils/database");
const { PermissionFlagsBits, MessageFlags } = require('discord.js');

async function buttonSelect(interaction) {

    try {
        const db = await connectDB();
        const pollsCollection = db.collection("polls");

        const userId = interaction.user.id;
        const pollId = interaction.message.id;
        const buttonId = interaction.customId; // Button clicked

        // ✅ Retrieve Poll Data
        const pollData = await pollsCollection.findOne({ pollId });

        if (!pollData) {
            return interaction.reply({ content: "❌ **This poll no longer exists.**", flags: MessageFlags.Ephemeral });
        }

        let votes = pollData.votes || [];
        if (!pollData.options || pollData.options.length === 0) {
            return interaction.reply({ content: "❌ **This poll has no available options.**", flags: MessageFlags.Ephemeral });
        }

        const lastVote = votes.find(vote => vote.userId === userId);
        if (lastVote && Date.now() - lastVote.timestamp < 3000) {
            return interaction.reply({
                content: "⏳ **Please wait a few seconds before changing your vote!**",
                flags: MessageFlags.Ephemeral
            });
        }

        let options = pollData.options;

        // ✅ Handle Special Buttons: Remove Vote, Get Results, End Poll
        if (["removevote", "getresults", "endpoll"].includes(buttonId)) {
            switch (buttonId) {
                case "removevote":
                    if (!votes.find(vote => vote.userId === userId)) {
                        return interaction.reply({ content: "⚠️ **You haven't voted in this poll yet!**", flags: MessageFlags.Ephemeral });
                    }

                    // ✅ Remove user's vote
                    votes = votes.filter(vote => vote.userId !== userId);
                    await pollsCollection.updateOne({ pollId }, { $set: { votes } });

                    return interaction.reply({ content: "✅ **Your vote has been removed!**", flags: MessageFlags.Ephemeral });

                case "getresults":
                    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        return interaction.reply({ content: "❌ **Only users with `Manage Server` permissions can perform this action.**", flags: MessageFlags.Ephemeral });
                    }

                    // ✅ Calculate Results
                    let results = {};
                    options.forEach(option => results[option] = 0);
                    votes.forEach(vote => results[vote.option]++);

                    let resultsText = Object.entries(results)
                        .map(([option, count]) => `**${option}:** \`${count} votes\``)
                        .join("\n");

                    if (!resultsText) resultsText = "📭 **No votes have been cast yet!**";

                    return interaction.reply({
                        content: `📊 **Poll Results:**\n${resultsText}`,
                        flags: MessageFlags.Ephemeral
                    });

                case "endpoll":
                    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        return interaction.reply({ content: "❌ **Only users with `Manage Server` permissions can end polls.**", flags: MessageFlags.Ephemeral });
                    }

                    await pollsCollection.deleteOne({ pollId });
                    return interaction.reply({ content: "🚫 **This poll has been ended.**", flags: MessageFlags.Ephemeral });
            }
            return;
        }

        // ✅ Handle Vote Processing
        const optionIndex = parseInt(buttonId.replace('poll_', ''), 10);
        if (optionIndex < 1 || optionIndex > options.length) {
            return interaction.reply({ content: "❌ **Invalid vote option. Please try again.**", flags: MessageFlags.Ephemeral });
        }

        const selectedOption = options[optionIndex - 1]; // ✅ Ensures correct indexing

        // ✅ Check if the user has already voted
        const existingVote = votes.find(vote => vote.userId === userId);
        let voteMessage;

        if (existingVote) {
            // ✅ Remove the previous vote (switching votes)
            votes = votes.filter(vote => vote.userId !== userId);
            voteMessage = `✅ **Your vote has been switched to \`${selectedOption}\`!**`;
        } else {
            // ✅ First-time voting
            voteMessage = `✅ **Your vote for \`${selectedOption}\` has been recorded!**`;
        }

        // ✅ Log Vote for Analytics
        votes.push({ userId, option: selectedOption, timestamp: Date.now() });
        await pollsCollection.updateOne({ pollId }, { $set: { votes } });

        // ✅ Send response with correct message
        await interaction.reply({
            content: voteMessage,
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error("❌ Error processing poll action:", error);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: "❌ **An error occurred while processing your action. Please try again later.**" });
        } else {
            await interaction.reply({ content: "❌ **An error occurred while processing your action. Please try again later.**", ephemeral: true });
        }
    }

}
module.exports = { buttonSelect }