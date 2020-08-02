import School from 'school-kr'
import { help, schedule, search, set } from './commands'
import { dateConvert, load, save } from './utils'

const school = new School()
const define = load('src/define.json')
const messages = load('src/messages.json')
const searches = {}

const meal = async (date: Date, type: string, embed) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1 })

  let rebase = meal[date.getDate()].replace(/[0-9*.]|amp;|\//gi, '')

  if (rebase.includes(`[${type}]`)) {
    const length = rebase.indexOf(`[${type}]`)
    const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
    embed.addField(type, sub.replace(/\[\S*?\]/g, ''), false)
  } else if (type === '급식') {
    ['조식', '중식', '석식'].forEach(e => {
      const length = rebase.indexOf(`[${e}]`)
      const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
      if (sub) {
        embed.addField(e, sub.replace(/\[\S*?\]/g, ''), true)
      }
    })
  }

  if (!embed.fields.length) {
    embed.setDescription(type + '이 없습니다')
  }

  return embed
}

const index = async (type: string, channel: string, text: string, embed) => {
  if (text.includes('하나')) {
    help(text, embed, messages)
    await schedule(text, channel, embed, type, school)
    await search(text, embed, searches, school, define, channel)
    set(text, embed, searches, messages, channel, type, load, save)

    if (text.match(/(아침|조식|점심|중식|저녁|석식|급식)/)) {
      const data = load(`data/${type}.json`)[channel]
      if (!data) {
        return embed.setDescription(messages.unregistered)
      } else {
        const date = dateConvert(text)
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        embed.setTitle(`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`)
        return await meal(date, text.match(/(아침|조식)/) ? '조식' : text.match(/(점심|중식)/) ? '중식' : text.match(/(저녁|석식)/) ? '석식' : '급식', embed)
      }
    }
  }

  return embed
}

export default index
