# Secret Polling Bot

Secret Polling is a Discord bot that allows you to create anonymous polls with ease. Users can vote without revealing their identity, ensuring fair and unbiased results.

🚀 Features
- 🔒 100% Anonymous Voting – No usernames are stored with votes.
- 📊 Button-Based Polls – Users vote with interactive buttons, not reactions.
⏳ Poll Expiration – Automatically close polls after a set time.
- 🔄 Vote Switching – Users can change their vote without needing to remove it first.
- 📜 Poll Analytics – View poll results and engagement easily.
- 🛠️ Customization Options – Set vote limits, poll visibility, and more.

## 📌 Commands

Creating a Poll
```
/poll create title:"Best Movie?" description:"Vote now!" option1:"Inception" option2:"Titanic"
```
If no options are provided, the poll defaults to Yes/No.

**Managing Polls**
```
/poll list – View active polls.
```
```
/poll delete poll-id:<ID> – Delete a poll.
```
```
/poll analytics poll-id:<ID> – View poll results.
```

**Customization (Coming Soon!)**

/poll settings – Modify poll visibility, expiration, and more.

## 🔧 Setup
- Invite the Bot to Your Server (if applicable)
- Ensure It Has Permissions (Embed Links, Manage Messages, Use Slash Commands).
- Use /poll create to Start Polling!

**💡 Example Usage**
Simple Yes/No Poll:
```
/poll create title:"Do you like pizza?"
```
**Multi-Option Poll:**
```
/poll create title:"Best Game?" option1:"Minecraft" option2:"Fortnite" option3:"Apex Legends"
```

**🤝 Contributing**

- Pull requests are welcome! If you have feature requests or bug reports, open an issue.

**🛠️ Technologies Used**
- Node.js
- Discord.js v14
- MongoDB (for poll storage)

**📜 License**

- This project is licensed under the MIT License.

📞 Support

Need help? Open an issue or contact the developer!

🚀 Start polling now with Secret Polling!

