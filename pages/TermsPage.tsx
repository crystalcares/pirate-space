import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container py-12">
        <Card className="max-w-4xl mx-auto bg-card/70 border-border/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>Last updated: January 1, 2025</p>
            <p>Welcome to Pirate Exchange. These terms and conditions outline the rules and regulations for the use of Pirate Exchange's Website.</p>
            
            <h3 className="text-xl font-semibold text-foreground pt-4">1. Acceptance of Terms</h3>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Pirate Exchange if you do not agree to take all of the terms and conditions stated on this page. By creating an account, you agree to be bound by these Terms.</p>
            
            <h3 className="text-xl font-semibold text-foreground pt-4">2. Services</h3>
            <p>Pirate Exchange provides a platform for peer-to-peer (P2P) exchange of digital assets. All transactions are conducted on our Discord server through a verified ticket system. We act as a facilitator and do not hold user funds. We are not responsible for any loss of funds during a transaction.</p>

            <h3 className="text-xl font-semibold text-foreground pt-4">3. User Accounts</h3>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

            <h3 className="text-xl font-semibold text-foreground pt-4">4. Limitation of Liability</h3>
            <p>In no event shall Pirate Exchange, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
            <Button asChild variant="link">
                <Link to="/">← Back to Home</Link>
            </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
