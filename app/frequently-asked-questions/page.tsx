import Link from 'next/link';

export default function FrequentlyAskedQuestionsPage() {
  const faqs = [
    {
      question: 'What services does SpendWise offer?',
      answer:
        'SpendWise offers a range of services including expense tracking, budget planning, financial goal setting, and spending insights to help you manage your finances effectively.',
    },
    {
      question: 'Is my financial data secure with SpendWise?',
      answer:
        'Yes, your financial data is encrypted and protected with bank-level security to ensure your information is safe.',
    },
    {
      question: 'How can I get started with SpendWise?',
      answer:
        'You can get started by signing up on our website. Once registered, you can begin tracking your expenses and setting budgets.',
    },
    {
      question: 'Does SpendWise offer customer support?',
      answer:
        'Absolutely! We provide customer support through email and chat to assist you with any questions or issues you may have.',
    },
    {
      question: 'Can I access SpendWise on my mobile device?',
      answer:
        'Yes, SpendWise is accessible on both desktop and mobile devices, allowing you to manage your finances on the go.',
    },
    {
      question: 'Are there any fees associated with using SpendWise?',
      answer:
        'SpendWise offers a free basic plan, as well as premium plans with additional features for a monthly fee.',
    },
  ];

  console.log('Frequently Asked Questions page rendered');

  return (
    <section className='faq-section py-20 bg-gray-50'>
      <div className='container mx-auto'>
        <Link href='/' className='text-purple-600 mb-4 inline-block'>
          &larr; Back to SpendWise
        </Link>
        <h2 className='text-4xl font-bold text-center mb-8 text-purple-600'>
          Frequently Asked Questions
        </h2>
        <div className='faq-list grid grid-cols-1 md:grid-cols-2 gap-8'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='faq-item bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105'
            >
              <h3 className='font-medium text-lg text-purple-700'>
                {faq.question}
              </h3>
              <p className='text-gray-600 mt-2'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
