export class Uptime {
  name: string
  description: string
  msg: any
  embed: any
  constructor({ msg, embed }) {
    this.name = "Ping"
    this.description = ""
    this.msg = msg
    this.embed = embed
  }

  async discord() {
    const msg = this.msg
    const embed = this.embed

    let uptime = process.uptime()
    let sec = Math.floor(uptime % 60)
    let min = Math.floor((uptime / 60) % 60)
    let hour = Math.floor((uptime / 60 / 60) % 24)
    let day = Math.floor(uptime / 60 / 60 / 24)

    embed
      .setTitle("Uptime!")
      .setDescription(
        `${day ? day + "일" : ""} ${hour ? hour + "시간" : ""} ${
          min ? min + "분" : ""
        } ${sec}초`
      )
    msg.channel.send(embed)
  }
}
