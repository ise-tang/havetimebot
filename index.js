const { App } = require('@slack/bolt');
require('dotenv').config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command(`/${process.env.SLASH_COMMAND}`, async({ command, ack, respond }) => {
  await ack();
  
  let spaceSplited = command.text.split(' ');
  let to = spaceSplited.shift();
  let message = spaceSplited.join(' ');
  
  console.log(`to: ${to}`);

  if (to.match(/^<.*>/) === null) {
      await respond('声掛け先の指定をお願いします :pray:')
  }
  else if (message.length === 0) {
    await respond(`伝言の入力をお願いします :pray:`);
  }
  else {
    await respond(`${to} さんに伝言と声掛けしてきますね！`);
    
    let dmId = to.match(/@(.+)\|/)[1];
    
    try {
      const result = await app.client.chat.postMessage({
        token: app.token,
        channel: dmId,
        text: `<@${command.user_id}> さんがcall/huddleしたいようです。伝言を預かっています。「${message}」とのことです。ご対応おねがいします！`
      })
    }
    catch (error) {
      console.log(error);
    }
  }
});


// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
