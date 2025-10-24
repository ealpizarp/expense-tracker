import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { categoryName: 'asc' }
      })
      
      // Transform to match the expected format
      const formattedCategories = categories.map(cat => ({
        id: cat.categoryId,
        name: cat.categoryName
      }))
      
      res.status(200).json(formattedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      res.status(500).json({ error: 'Failed to fetch categories' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body
      
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' })
      }

      const category = await prisma.category.create({
        data: { categoryName: name }
      })
      
      res.status(201).json({
        id: category.categoryId,
        name: category.categoryName
      })
    } catch (error) {
      console.error('Error creating category:', error)
      res.status(500).json({ error: 'Failed to create category' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
