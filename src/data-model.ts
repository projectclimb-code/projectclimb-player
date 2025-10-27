export interface Hold {
  id: string
  type: 'start' | 'finish' | 'normal'
}

export interface HoldActive {
  id: string
  type: 'start' | 'finish' | 'normal'
  status: 'untouched' | 'grabbed' | 'failed' | 'completed' | 'released'
}

// route will be saved in DB as a saved route
export interface Route {
  holds: Hold[]
}

// when route is opened ClimbAttempt is created
export interface ClimbAttempt {
  holds: HoldActive[]
  startTime: number
  endTime?: number
  status: 'waiting' | 'started' | 'completed' | 'failed'
}

export interface State {
  currentRoute?: Route
  currentClimbAttempt?: ClimbAttempt
  pose?: any
  state: 'idle' | 'route' | 'climb'
}

export const INITIAL_STATE: State = {
  state: 'idle',
}
