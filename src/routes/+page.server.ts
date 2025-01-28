import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: countries, error } = await supabase.from('countries').select('name').limit(5).order('name')
  return { countries: countries ?? [], error }
}