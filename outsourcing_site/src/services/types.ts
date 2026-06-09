export type FreelancerService = {
  id: string
  freelancer_id: string
  title: string
  description: string
  category: string
  skills: string[]
  price: string
  delivery_days: number
  thumbnail_url: string | null
  is_active: boolean
  inserted_at: string | null
  freelancer?: { id: string; name: string; email: string }
}
