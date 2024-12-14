const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Define default categories
const DEFAULT_CATEGORIES = [
  // Income categories
  {
    name: 'Salary',
    type: 'INCOME',
    icon: 'Briefcase',
    isDefault: true,
  },
  {
    name: 'Freelance',
    type: 'INCOME',
    icon: 'Wallet',
    isDefault: true,
  },
  {
    name: 'Investments',
    type: 'INCOME',
    icon: 'PiggyBank',
    isDefault: true,
  },

  // Expense categories
  {
    name: 'Rent',
    type: 'EXPENSE',
    icon: 'Home',
    isDefault: true,
  },
  {
    name: 'Groceries',
    type: 'EXPENSE',
    icon: 'ShoppingBag',
    isDefault: true,
  },
  {
    name: 'Utilities',
    type: 'EXPENSE',
    icon: 'Building2',
    isDefault: true,
  },
  {
    name: 'Transportation',
    type: 'EXPENSE',
    icon: 'Car',
    isDefault: true,
  },
  {
    name: 'Healthcare',
    type: 'EXPENSE',
    icon: 'Heart',
    isDefault: true,
  },
  {
    name: 'Education',
    type: 'EXPENSE',
    icon: 'GraduationCap',
    isDefault: true,
  },
  {
    name: 'Entertainment',
    type: 'EXPENSE',
    icon: 'Pizza',
    isDefault: true,
  },
  {
    name: 'Fitness',
    type: 'EXPENSE',
    icon: 'Dumbbell',
    isDefault: true,
  },
  {
    name: 'Shopping',
    type: 'EXPENSE',
    icon: 'CreditCard',
    isDefault: true,
  },
]

async function main() {
  console.log('🌱 Starting seeding...')

  // Create default categories
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: {
        name: category.name,
        type: category.type,
        icon: category.icon,
        isDefault: true,
      },
    })
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding the database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
