import { NextResponse } from 'next/server'
import { getInvoiceById } from '@/app/actions/billing'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    const invoice = await getInvoiceById(id)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    return NextResponse.json(invoice)
  } catch (e: unknown) {
    const error = e as Error
    return NextResponse.json(
      { error: error.message || 'Unauthorized access.' },
      { status: 401 }
    )
  }
}
export default GET
