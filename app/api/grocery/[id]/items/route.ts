import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

// ---- Shared helper: confirm the list exists and the user is in its group ----
async function getListAndAuthorize(listId: string, userId: string | null) {
  const list = await prisma.groceryList.findUnique({ where: { id: listId } });
  if (!list) return { error: NextResponse.json({ error: "List not found" }, { status: 404 }) };

  if (userId) {
    const membership = await prisma.userGroups.findFirst({
      where: { groupId: list.groupId, userId },
    });
    if (!membership) {
      return { error: NextResponse.json({ error: "Not a member of this group" }, { status: 403 }) };
    }
  }

  return { list };
}

// ---- Shared helper: pull the signed-in user's id from the session cookie ----
async function requireUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  const token = (await cookies()).get('session')?.value
  if (!token) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) }
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return { error: NextResponse.json({ error: 'Session expired' }, { status: 401 }) }
  }

  return { userId: payload.userId }
}

// GET /api/grocery/[id]/items — list all items on a grocery list
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const auth = await requireUserId()
  if ('error' in auth) return auth.error

  const { list, error } = await getListAndAuthorize(id, auth.userId);
  if (error) return error;

  const items = await prisma.groceryItem.findMany({
    where: { listId: list!.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items);
}

// POST /api/grocery/[id]/items — add a new item to the list
// Body: { name: string, quantity: number, price?: number, assignedId?: string }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const auth = await requireUserId()
  if ('error' in auth) return auth.error

  const { list, error } = await getListAndAuthorize(id, auth.userId);
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (body.quantity === undefined || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "quantity is required" }, { status: 400 });
  }

  const item = await prisma.groceryItem.create({
    data: {
      listId: list!.id,
      name: body.name,
      quantity: body.quantity,
      price: body.price ?? 0,
      isCompleted: false,
      addedById: auth.userId,
      assignedId: body.assignedId ?? auth.userId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}