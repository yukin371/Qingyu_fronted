import type { BaseEntity, ID } from './core'

// =======================
// Organization
// =======================
export interface Organization extends BaseEntity {
  projectId: ID
  name: string
  type: string
  description?: string
  leaderId?: ID
  baseLocationId?: ID
  motto?: string
  resources?: string
}

export interface OrganizationRelation extends BaseEntity {
  fromOrgId: ID
  toOrgId: ID
  relation: string
  notes?: string
}

// =======================
// Item
// =======================
export interface Item extends BaseEntity {
  projectId: ID
  name: string
  type: string // 'weapon', 'consumable', 'key_item'
  description?: string
  ownerId?: ID
  locationId?: ID
  rarity?: string
  function?: string
}

// =======================
// Concept (Setting)
// =======================
export interface Concept extends BaseEntity {
  projectId: ID
  name: string
  category: string // 'magic', 'biology', 'history'
  content: string
  tags?: string[]
}
