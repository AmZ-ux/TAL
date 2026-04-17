'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SUPPORT_PHONE_RAW = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '5511999999999';
const SUPPORT_PHONE = SUPPORT_PHONE_RAW.replace(/\D/g, '');

const quickMessages = [
  { id: 'payment', label: 'Payment question', text: 'Hello, I need help with a payment question.' },
  { id: 'receipt', label: 'Receipt question', text: 'Hello, I need help with my uploaded receipt.' },
  { id: 'general', label: 'General question', text: 'Hello, I have a general question.' },
];

const faqItems = [
  {
    question: 'How do I send my payment receipt?',
    answer: 'Open Home and tap "Upload receipt". Then choose your file and send it.',
  },
  {
    question: 'When does my status change to paid?',
    answer: 'After the team checks and approves your receipt, the status changes to paid.',
  },
  {
    question: 'What if my fee is overdue?',
    answer: 'Please contact support on WhatsApp so we can help you quickly.',
  },
];

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
}

export default function PassengerSupportPage() {
  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Support</h1>
        <p className='text-sm text-muted-foreground'>Need help? Choose a quick option below.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Contact support</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-muted-foreground'>Fastest channel: WhatsApp</p>
          <Link
            href={buildWhatsAppLink('Hello, I need support.')}
            target='_blank'
            rel='noreferrer'
            className={cn(buttonVariants({ variant: 'default' }), 'w-full sm:w-auto')}
          >
            <MessageCircle className='h-4 w-4' />
            Open WhatsApp
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Quick messages</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-2'>
          {quickMessages.map((message) => (
            <Link
              key={message.id}
              href={buildWhatsAppLink(message.text)}
              target='_blank'
              rel='noreferrer'
              className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
            >
              {message.label}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>FAQ</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {faqItems.map((item) => (
            <div key={item.question} className='rounded-lg border bg-muted/30 p-3 text-sm'>
              <p className='font-medium'>{item.question}</p>
              <p className='mt-1 text-muted-foreground'>{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
