import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('party_details')
      .select('*')
      .eq('id', 1)
      .single()
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message })
    return res.status(200).json(data || {})
  }

  if (req.method === 'POST') {
    const details = req.body
    // upsert row with id=1 (single config row)
    const { data, error } = await supabase
      .from('party_details')
      .upsert({ id: 1, ...details })
      .select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data[0])
  }

  res.status(405).json({ error: 'Method not allowed' })
}
