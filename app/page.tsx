import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Navigation */}
      <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-16 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-1'>
              <div className='rounded-full bg-white p-1 dark:bg-black'>
                <div className='h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500' />
              </div>
            </div>
            <span className='text-xl font-bold'>SpendWise</span>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex gap-6'>
            <Link href='#' className='text-sm font-medium hover:text-primary'>
              Home
            </Link>
            <Link
              href='#features'
              className='text-sm font-medium hover:text-primary'
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='text-sm font-medium hover:text-primary'
            >
              Pricing
            </Link>
            <Link
              href='#contact'
              className='text-sm font-medium hover:text-primary'
            >
              Contact
            </Link>
            <Link
              href='/frequently-asked-questions'
              className='text-muted-foreground hover:text-foreground'
            >
              FAQ
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <Button variant='ghost' size='icon' className='md:hidden'>
            <Menu className='h-6 w-6' />
            <span className='sr-only'>Toggle menu</span>
          </Button>

          {/* CTA Button */}
          <div className='hidden md:block'>
            <Button
              className='bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
              asChild
            >
              <Link href='/login'>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative overflow-hidden py-20 md:py-32'>
          <div className='absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' />
          <div className='absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]' />

          <div className='container relative'>
            <div className='grid gap-10 lg:grid-cols-2 lg:gap-20'>
              <div className='flex flex-col justify-center space-y-8'>
                <div className='space-y-6'>
                  <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent'>
                    Take control of your finances today
                  </h1>
                  <p className='max-w-[600px] text-muted-foreground md:text-xl'>
                    SpendWise helps you track expenses, set budgets, and achieve
                    your financial goals with intuitive tools and insightful
                    analytics.
                  </p>
                </div>

                <div className='flex flex-col gap-4 sm:flex-row'>
                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                    asChild
                  >
                    <Link href='/login'>
                      Get Started
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Link>
                  </Button>
                  <Button size='lg' variant='outline' asChild>
                    <Link href='#features'>What we offer</Link>
                  </Button>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='flex -space-x-2'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='inline-block h-8 w-8 overflow-hidden rounded-full border-2 border-background'
                      >
                        <Image
                          src={`/customers/user${i}.svg`}
                          alt={`User ${i}`}
                          width={32}
                          height={32}
                          className='h-full w-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                  <div className='text-muted-foreground'>
                    <span className='font-medium text-foreground'>2,000+</span>{' '}
                    happy customers
                  </div>
                </div>
              </div>

              <div className='relative flex items-center justify-center lg:justify-end'>
                <div className='relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-lg border bg-background shadow-xl sm:h-[450px] lg:h-[550px]'>
                  <Image
                    src='/images/financial-dashboard.svg'
                    alt='Product screenshot'
                    fill
                    className='object-cover'
                    priority
                  />
                </div>

                <div className='absolute -bottom-4 -left-4 h-24 w-64 rounded-lg border bg-background p-4 shadow-lg md:-left-8'>
                  <div className='flex items-center gap-4'>
                    <div className='rounded-full bg-green-100 p-2 dark:bg-green-900'>
                      <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>
                        Budget goal reached!
                      </p>
                      <p className='text-xs text-muted-foreground'>Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className='border-y bg-muted/40 py-10'>
          <div className='container'>
            <p className='mb-6 text-center text-sm font-medium text-muted-foreground'>
              Trusted by the world's most innovative teams
            </p>
            <div className='grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className='flex items-center justify-center'>
                  <Image
                    src={`/logos/brand${i}.svg`}
                    alt={`Brand ${i}`}
                    width={120}
                    height={40}
                    className='opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0'
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='py-20'>
          <div className='container'>
            <div className='mx-auto mb-16 max-w-2xl text-center'>
              <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
                Powerful features to help you save
              </h2>
              <p className='text-muted-foreground'>
                Our platform provides everything you need to manage your
                finances effectively.
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {[
                {
                  title: 'Expense Tracking',
                  description:
                    'Easily log and categorize your expenses to see where your money is going.',
                  icon: '📊',
                },
                {
                  title: 'Budget Planning',
                  description:
                    'Set monthly budgets for different categories and track your progress.',
                  icon: '💰',
                },
                {
                  title: 'Financial Goals',
                  description:
                    'Define savings goals and monitor your progress toward achieving them.',
                  icon: '🎯',
                },
                {
                  title: 'Spending Insights',
                  description:
                    'Get personalized insights about your spending habits and patterns.',
                  icon: '📈',
                },
                {
                  title: 'Bill Reminders',
                  description:
                    'Never miss a payment with automated bill reminders and notifications.',
                  icon: '🔔',
                },
                {
                  title: 'Secure Data',
                  description:
                    'Your financial data is encrypted and protected with bank-level security.',
                  icon: '🔒',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className='group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md'
                >
                  <div className='mb-4 text-3xl'>{feature.icon}</div>
                  <h3 className='mb-2 text-xl font-medium'>{feature.title}</h3>
                  <p className='text-muted-foreground'>{feature.description}</p>
                  <div className='mt-4 flex items-center text-sm font-medium text-primary'>
                    What we offer
                    <ChevronRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id='pricing' className='py-20'>
          <div className='container'>
            <div className='mx-auto mb-16 max-w-2xl text-center'>
              <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
                Simple, transparent pricing
              </h2>
              <p className='text-muted-foreground'>
                Choose the plan that's right for you and start saving today.
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {[
                {
                  name: 'Basic',
                  price: '$0',
                  description:
                    'Perfect for individuals just starting their financial journey.',
                  features: [
                    'Expense tracking',
                    'Basic budgeting',
                    'Community support',
                    '1GB storage',
                  ],
                  cta: 'Get Started',
                  popular: false,
                },
                {
                  name: 'Premium',
                  price: '$9.99',
                  description:
                    'Ideal for individuals serious about financial management.',
                  features: [
                    'Unlimited expense tracking',
                    'Advanced budgeting tools',
                    'Priority support',
                    '10GB storage',
                    'Financial goal setting',
                    'Spending insights',
                  ],
                  cta: 'Get Started',
                  popular: true,
                },
                {
                  name: 'Family',
                  price: '$19.99',
                  description: 'For households managing finances together.',
                  features: [
                    'Everything in Premium',
                    'Up to 5 user accounts',
                    'Shared budgets',
                    '100GB storage',
                    'Bill splitting',
                    'Financial advisor access',
                    'Custom categories',
                  ],
                  cta: 'Contact Sales',
                  popular: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-lg border ${
                    plan.popular
                      ? 'border-primary shadow-lg'
                      : 'bg-background shadow-sm'
                  } p-6`}
                >
                  {plan.popular && (
                    <div className='absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-center text-xs font-medium text-primary-foreground'>
                      Popular
                    </div>
                  )}
                  <div className='mb-6'>
                    <h3 className='text-xl font-medium'>{plan.name}</h3>
                    <div className='mt-2 flex items-baseline'>
                      <span className='text-3xl font-bold'>{plan.price}</span>
                      <span className='ml-1 text-muted-foreground'>/month</span>
                    </div>
                    <p className='mt-2 text-sm text-muted-foreground'>
                      {plan.description}
                    </p>
                  </div>
                  <ul className='mb-6 space-y-2'>
                    {plan.features.map((feature, j) => (
                      <li key={j} className='flex items-center'>
                        <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                        <span className='text-sm'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href='/login'>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='relative overflow-hidden py-20'>
          <div className='absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40' />

          <div className='container relative'>
            <div className='mx-auto max-w-3xl text-center'>
              <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
                Ready to take control of your finances?
              </h2>
              <p className='mb-8 text-muted-foreground'>
                Join thousands of users who are already using SpendWise to
                manage their money more effectively.
              </p>
              <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                  asChild
                >
                  <Link href='/login'>
                    Get Started Now
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
                <Button size='lg' variant='outline' asChild>
                  <Link href='/dashboard/demo'>Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section id='contact' className='border-t py-20'>
          <div className='container'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
                Stay up to date
              </h2>
              <p className='mb-8 text-muted-foreground'>
                Get the latest tips and updates on managing your finances.
              </p>
              <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-80'
                />
                <Button>Subscribe</Button>
              </div>
              <p className='mt-4 text-xs text-muted-foreground'>
                By subscribing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t py-12'>
        <div className='container'>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            <div>
              <div className='flex items-center gap-2'>
                <div className='rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-1'>
                  <div className='rounded-full bg-white p-1 dark:bg-black'>
                    <div className='h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500' />
                  </div>
                </div>
                <span className='text-xl font-bold'>SpendWise</span>
              </div>
              <p className='mt-4 text-sm text-muted-foreground'>
                Helping you make smarter financial decisions and achieve your
                money goals.
              </p>
            </div>

            <div>
              <h3 className='mb-4 text-sm font-medium'>Product</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    href='#features'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href='#pricing'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href='/frequently-asked-questions'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='mb-4 text-sm font-medium'>Company</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href='#contact'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='mb-4 text-sm font-medium'>Legal</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-12 border-t pt-8 text-center text-sm text-muted-foreground'>
            <p>© {new Date().getFullYear()} SpendWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
