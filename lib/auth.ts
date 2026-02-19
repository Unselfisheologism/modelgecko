import { getAuth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  const { userId } = getAuth(request)

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export async function getClerkUser(userId: string) {
  const clerk = clerkClient()
  return await clerk.users.getUser(userId)
}

export async function getOrCreateApiUser(userId: string, email: string) {
  let apiUser = await prisma.apiUser.findUnique({
    where: { clerkUserId: userId },
  })

  if (!apiUser) {
    apiUser = await prisma.apiUser.create({
      data: {
        clerkUserId: userId,
        email,
        credits: 1000, // Default free credits
      },
    })
  }

  return apiUser
}
