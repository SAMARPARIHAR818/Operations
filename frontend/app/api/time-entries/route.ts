export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const memberId = searchParams.get('member_id')
        const date = searchParams.get('date')
        const supabase = createAdminClient()
        let query = supabase.from('time_entries').select('*').order('date', { ascending: false })
        if (memberId) query = query.eq('member_id', memberId)
        if (date) query = query.eq('date', date)
        const { data, error } = await query.limit(200)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('time_entries').insert([body]).select()
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        const supabase = createAdminClient()
        const { error } = await supabase.from('time_entries').delete().eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
