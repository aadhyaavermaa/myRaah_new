export type Role = 'student' | 'mentor' | 'facilitator' | 'employer'
export type User = { name: string; email: string; role: Role; details?: Record<string, string> }
export type Career = { title: string; category: string; description: string; skills: string[]; path: string }
export type Milestone = { title: string; detail: string; done: boolean }
export type Opportunity = { title: string; category: string; provider: string; detail: string; deadline: string; demo: boolean }
