import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import usePageTitle from '../hooks/usePageTitle';

const FAQS = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'We offer free shipping across India. Orders typically take 5-7 business days to reach you. For remote locations, it may take up to 10 business days.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. We are working on expanding our shipping to international locations soon.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order is shipped, you will receive a tracking number via email. You can also check your order status in the "My Orders" section of your account.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'Currently, we only accept Cash on Delivery (COD). We are working on adding more payment options including UPI, cards, and net banking.'
      }
    ]
  },
  {
    category: 'Products & Quality',
    questions: [
      {
        question: 'Are your products really handmade?',
        answer: 'Yes, absolutely! All our products are handcrafted by skilled artisans across India using traditional techniques passed down through generations.'
      },
      {
        question: 'How do you ensure product quality?',
        answer: 'Each product undergoes rigorous quality checks before shipping. We work directly with artisans and visit production centers regularly to maintain our quality standards.'
      },
      {
        question: 'Are your products eco-friendly?',
        answer: 'Yes, sustainability is at the core of our mission. We use natural, organic materials and eco-friendly production processes wherever possible.'
      },
      {
        question: 'Do you have size guides for clothing?',
        answer: 'Yes, each clothing item has a detailed size guide. Our products are designed to have a comfortable, relaxed fit inspired by traditional Indian wear.'
      }
    ]
  },
  {
    category: 'Returns & Exchanges',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy for unused items in original condition. Due to the handmade nature of our products, we carefully review each return request.'
      },
      {
        question: 'How do I return an item?',
        answer: 'Contact our customer service team within 7 days of delivery. We will guide you through the return process and arrange pickup if the return is approved.'
      },
      {
        question: 'Do you offer exchanges?',
        answer: 'Yes, we offer exchanges for size or color variations subject to availability. Exchange requests must be made within 7 days of delivery.'
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'For defective or incorrect items, we cover return shipping. For other returns, customers are responsible for return shipping costs.'
      }
    ]
  },
  {
    category: 'Account & Support',
    questions: [
      {
        question: 'Do I need an account to place an order?',
        answer: 'Yes, you need to create an account to place orders. This helps us provide better service and allows you to track your orders easily.'
      },
      {
        question: 'How can I contact customer support?',
        answer: 'You can reach us via email at hello@houseofhomegrown.com or call us at +91 98765 43210 during business hours (Mon-Fri, 9 AM - 6 PM IST).'
      },
      {
        question: 'Can I cancel my order?',
        answer: 'Orders can be cancelled within 2 hours of placement. After that, the order goes into processing and cannot be cancelled. Please contact us immediately if you need to cancel.'
      },
      {
        question: 'How do I update my account information?',
        answer: 'Currently, account information updates need to be done by contacting our customer service. We are working on adding self-service options to your account dashboard.'
      }
    ]
  }
];

const FAQ = () => {
  usePageTitle('FAQ');
  return (
    <ContentPage title="Frequently asked questions" crumb="FAQ" description="Find answers to common questions about our products, orders, and policies.">
      <div className="space-y-12">
        {FAQS.map((group) => (
          <section key={group.category} aria-labelledby={`faq-${group.category}`}>
            <h2 id={`faq-${group.category}`} className="text-2xl">{group.category}</h2>
            <Accordion type="single" collapsible className="mt-3 border-t border-border">
              {group.questions.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="max-w-[68ch]">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <p className="mt-14 rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">
        Can't find what you need? <Link to="/contact" className="font-semibold text-primary underline underline-offset-4">Contact customer care</Link>.
      </p>
    </ContentPage>
  );
};

export default FAQ;
