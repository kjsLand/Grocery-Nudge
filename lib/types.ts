export type User = {
  id: string
  email: string
  passwordHash: string
  phone: string
  createdAt: string
}

export type Group = {
  id: string
  title: string
  group_leader: string
  members: Array<string>
}

export type Invite = {
  id: string
  group_id: string
  number: string
  invitedBy: string
  status: 'pending' | 'accepted'
  createdAt: string
}