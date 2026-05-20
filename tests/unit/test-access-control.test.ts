import { isAdmin } from '@/access/is-admin'
import { isAdminOrMitarbeiter } from '@/access/is-admin-or-mitarbeiter'
import { isOwnAnfrage } from '@/access/is-own-anfrage'
import { hasRole, isStaff, staffCanRead, staffCanWrite } from '@/access/role-checks'

// Helper to create mock request objects
function mockReq(rolle?: string, email?: string) {
  if (!rolle) return { user: null } as any
  return {
    user: {
      id: '1',
      email: email || 'test@example.com',
      rolle,
    },
  } as any
}

describe('hasRole', () => {
  it('returns true when user has matching role', () => {
    expect(hasRole({ rolle: 'admin' } as any, ['admin'])).toBe(true)
  })

  it('returns true when user has one of multiple roles', () => {
    expect(hasRole({ rolle: 'mitarbeiter' } as any, ['admin', 'mitarbeiter'])).toBe(true)
  })

  it('returns false when user has non-matching role', () => {
    expect(hasRole({ rolle: 'kunde' } as any, ['admin'])).toBe(false)
  })

  it('returns false for null/undefined user', () => {
    expect(hasRole(null as any, ['admin'])).toBe(false)
    expect(hasRole(undefined as any, ['admin'])).toBe(false)
  })
})

describe('isStaff', () => {
  it('returns true for admin', () => {
    expect(isStaff({ rolle: 'admin' } as any)).toBe(true)
  })

  it('returns true for mitarbeiter', () => {
    expect(isStaff({ rolle: 'mitarbeiter' } as any)).toBe(true)
  })

  it('returns true for viewer', () => {
    expect(isStaff({ rolle: 'viewer' } as any)).toBe(true)
  })

  it('returns false for kunde', () => {
    expect(isStaff({ rolle: 'kunde' } as any)).toBe(false)
  })

  it('returns false for null user', () => {
    expect(isStaff(null as any)).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin({ req: mockReq('admin') })).toBe(true)
  })

  it('returns false for mitarbeiter role', () => {
    expect(isAdmin({ req: mockReq('mitarbeiter') })).toBe(false)
  })

  it('returns false for viewer role', () => {
    expect(isAdmin({ req: mockReq('viewer') })).toBe(false)
  })

  it('returns false for kunde role', () => {
    expect(isAdmin({ req: mockReq('kunde') })).toBe(false)
  })

  it('returns false for unauthenticated', () => {
    expect(isAdmin({ req: mockReq() })).toBe(false)
  })
})

describe('isAdminOrMitarbeiter', () => {
  it('returns true for admin role', () => {
    expect(isAdminOrMitarbeiter({ req: mockReq('admin') })).toBe(true)
  })

  it('returns true for mitarbeiter role', () => {
    expect(isAdminOrMitarbeiter({ req: mockReq('mitarbeiter') })).toBe(true)
  })

  it('returns false for viewer role', () => {
    expect(isAdminOrMitarbeiter({ req: mockReq('viewer') })).toBe(false)
  })

  it('returns false for kunde role', () => {
    expect(isAdminOrMitarbeiter({ req: mockReq('kunde') })).toBe(false)
  })

  it('returns false for unauthenticated', () => {
    expect(isAdminOrMitarbeiter({ req: mockReq() })).toBe(false)
  })
})

describe('isOwnAnfrage', () => {
  it('returns true for admin (sees all)', () => {
    expect(isOwnAnfrage({ req: mockReq('admin') })).toBe(true)
  })

  it('returns true for mitarbeiter (sees all)', () => {
    expect(isOwnAnfrage({ req: mockReq('mitarbeiter') })).toBe(true)
  })

  it('returns true for viewer (sees all)', () => {
    expect(isOwnAnfrage({ req: mockReq('viewer') })).toBe(true)
  })

  it('returns query constraint for kunde', () => {
    const result = isOwnAnfrage({ req: mockReq('kunde', 'kunde@test.de') })
    expect(result).toEqual({
      'kontaktdaten.email': { equals: 'kunde@test.de' },
    })
  })

  it('returns false for unauthenticated', () => {
    expect(isOwnAnfrage({ req: mockReq() })).toBe(false)
  })
})

describe('staffCanRead', () => {
  it('returns true for admin', () => {
    expect(staffCanRead({ req: mockReq('admin') })).toBe(true)
  })

  it('returns true for mitarbeiter', () => {
    expect(staffCanRead({ req: mockReq('mitarbeiter') })).toBe(true)
  })

  it('returns true for viewer', () => {
    expect(staffCanRead({ req: mockReq('viewer') })).toBe(true)
  })

  it('returns false for kunde', () => {
    expect(staffCanRead({ req: mockReq('kunde') })).toBe(false)
  })

  it('returns false for unauthenticated', () => {
    expect(staffCanRead({ req: mockReq() })).toBe(false)
  })
})

describe('staffCanWrite', () => {
  it('returns true for admin', () => {
    expect(staffCanWrite({ req: mockReq('admin') })).toBe(true)
  })

  it('returns true for mitarbeiter', () => {
    expect(staffCanWrite({ req: mockReq('mitarbeiter') })).toBe(true)
  })

  it('returns false for viewer', () => {
    expect(staffCanWrite({ req: mockReq('viewer') })).toBe(false)
  })

  it('returns false for kunde', () => {
    expect(staffCanWrite({ req: mockReq('kunde') })).toBe(false)
  })

  it('returns false for unauthenticated', () => {
    expect(staffCanWrite({ req: mockReq() })).toBe(false)
  })
})
