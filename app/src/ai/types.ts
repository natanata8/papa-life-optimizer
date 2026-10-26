import type { SceneId, ToneAnswer } from '@/domain/types.ts'

export type ConsultRequest = {
  consultationId: string
  entry: string
  scene: SceneId | null
  answers: string[]
  userText: string
  today: string
  sceneDate: string
  family: {
    kidsLabel: string
    kidsCount: number
    work: string | null
    home: string | null
    partner: string
    car: string | null
    offPartner: string | null
    support: string[]
    pstate: string | null
  }
  scheduleText: string
  todayText: string
  memory: string[]
  events: { date: string; time: string; title: string; kind: string }[]
  taskHints: { id: string; title: string; why?: string; steps?: string[]; frequency?: string }[]
  flags: {
    ensokuNextDay: boolean
    gomiAround: boolean
  }
}

export interface ConsultClient {
  consult(request: ConsultRequest): Promise<ToneAnswer>
}

export type { ToneAnswer }
