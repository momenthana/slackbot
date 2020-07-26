import Discord from 'discord.js'
import colors from 'colors'
import fs from 'fs'
import school from './school'
import { embed } from './utils'

const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.token) {
  const discord = new Discord.Client()

  discord.on('ready', () => {
    console.log(colors.green(`Logged in as ${discord.user.tag}!`))
  })

  discord.on('message', async msg => {
    try {
      if (msg.author.bot) return

      const Embed = embed(msg)

      if (msg.content.match(/하나.*(핑|ping)|(핑|ping).*하나/)) {
        Embed.setTitle(msg.content.includes('핑') ? '퐁!' : 'Pong!')
          .fields = [
            { name: 'Discord Server', value: '측정중...', inline: false },
            { name: '지연 시간', value: '측정중...', inline: false }
          ]
        let ping = await msg.channel.send(Embed)
        Embed.fields = [
          { name: 'Discord Server', value: Math.round(discord.ws.ping) + 'ms', inline: false },
          { name: '지연 시간', value: ping.createdTimestamp - msg.createdTimestamp + 'ms', inline: false }
        ]
        ping.edit(Embed)
      } else {
        let info = await school(msg.content, msg.channel.id, 'discord')
        if (info.content || info.fields.length) {
          Embed.setTitle(info.title).setDescription(info.content)
            .fields = info.fields
          await msg.channel.send(Embed)
          info.fields.forEach(e => {
            info.content += `${e.name} ${e.value}\n`
          })
          console.log(colors.green(`Discord ${msg.channel.id}\n${msg.content}\n`), info.title, info.content)
        }
      }
    } catch (error) {
      console.warn(colors.red(`Discord ${msg.channel.id}\n${msg.content}\n`), error)
    }
  })

  const length = messages.activity.length

  setInterval(async () => {
    messages.activity[length] = '서버 ' + discord.guilds.cache.size + '개에서 사용'
    await discord.user.setActivity(messages.activity[Math.floor(Math.random() * messages.activity.length)], {
      type: process.env.twitch ? 'STREAMING' : null,
      url: 'https://www.twitch.tv/' + process.env.twitch
    })
  }, 10000)

  discord.login(process.env.token)
}
