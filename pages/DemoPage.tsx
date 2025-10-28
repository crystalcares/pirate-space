import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="container py-24 text-center flex-grow flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Book a Demo</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Interested in a private demonstration or have specific partnership inquiries? Schedule a call with our team to see how Pirate Exchange can work for you.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-6 text-base font-semibold">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Schedule on Calendly <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              This is a placeholder and does not link to a real scheduling page.
            </p>
            <Button asChild variant="link" className="mt-8">
                <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
