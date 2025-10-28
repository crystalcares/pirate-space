import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container py-12">
        <Card className="max-w-4xl mx-auto bg-card/70 border-border/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>Last updated: January 1, 2025</p>
            <p>Your privacy is important to us. It is Pirate Exchange's policy to respect your privacy regarding any information we may collect from you across our website and other sites we own and operate.</p>
            
            <h3 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h3>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used. The only personal information we collect is your email address and username for authentication purposes.</p>
            
            <h3 className="text-xl font-semibold text-foreground pt-4">2. Use of Information</h3>
            <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the service, specifically for user authentication and account management. We may also use your email to communicate directly with you, such as to send you verification emails or important service-related notices.</p>

            <h3 className="text-xl font-semibold text-foreground pt-4">3. Data Storage</h3>
            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

            <h3 className="text-xl font-semibold text-foreground pt-4">4. Links to Other Sites</h3>
            <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
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
