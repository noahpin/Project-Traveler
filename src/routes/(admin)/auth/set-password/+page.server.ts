import { redirect } from '@sveltejs/kit'

import type { Actions } from './$types'

export const actions: Actions = {
  updatePassword: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const password = formData.get('password') as string
    const { data, error } = await supabase.auth.updateUser({ password: password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/admin')
    }
  },
}