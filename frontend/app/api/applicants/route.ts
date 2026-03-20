import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('captain_applicants')
            .insert([body])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('captain_applicants')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('captain_applicants')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
