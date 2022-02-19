const { App } = require('@slack/bolt');
require('dotenv').config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command(`/${process.env.SLASH_COMMAND}`, async({ command, ack, respond }) => {
  console.log('-- slash command --');

  await ack();
  
  let spaceSplited = command.text.split(' ');
  let to = spaceSplited.shift();

  // 伝言に含まれるプライベートチャンネルIDを置換
  let message = spaceSplited.join(' ').replace(/&lt;(.*)\|&gt;/, '<$1>');
  
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
        text: `<@${command.user_id}> さんがcall/huddleしたいようです。伝言を預かっています。「${message}」とのことです。ご対応おねがいします！`,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `<@${command.user_id}> さんがcall/huddleしたいようです。<#${command.channel_id}>から伝言を預かっています。「${message}」とのことです。ご対応おねがいします！`,
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "OK,ちょっとまってね :+1:",
                            "emoji": true
                        },
                        "value": "ok",
                        "action_id": "havetime_bot_reply"
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "ごめん, あとで :pray:",
                            "emoji": true
                        },
                        "value": "sorry",
                        "action_id": "havetime_bot_reply"
                    }
                ]
            }
        ]
      })
    }
    catch (error) {
      console.log(error);
    }
  }
});

app.action('havetime_bot_reply', async({ ack, say, body }) => {
    console.log('-- reply --');
    await ack();
    await say('返答しておきます！');

    let reply_to = body.message.text.match(/<(.+)>/)[1];
    if(body.actions[0].value === 'ok') {
      const result = await app.client.chat.postMessage({
        token: app.token,
        channel: reply_to,
        text: `<@${body.user.id}> さんがから返事がありました。「OK,ちょっとまってね！:+1:」とのことです！`,
      });
    }
    else if (body.actions[0].value === 'sorry') {
      const result = await app.client.chat.postMessage({
        token: app.token,
        channel: reply_to,
        text: `<@${body.user.id}> さんがから返事がありました。「ごめん,あとで:pray:」とのことです！`,
      });
    }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
