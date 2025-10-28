import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FuturisticCard } from '@/components/ui/FuturisticCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyIcon } from '@/lib/currency-icons';
import { toast } from 'sonner';
import { Copy, Check, LogIn, Hash, Plus, MessageSquare, Clock } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Tables } from '@/lib/database.types';

type Exchange = Tables<'exchanges'>;
type PaymentMethod = Tables<'payment_methods'>;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const DiscordMockup = ({ children, sidebarActive }: { children: React.ReactNode, sidebarActive?: string }) => (
    <div className="flex h-64 bg-[#36393f] rounded-lg overflow-hidden border border-border/20">
        <div className="w-16 bg-[#202225] p-2 space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">PX</div>
            <div className="w-10 h-10 rounded-full bg-muted"></div>
        </div>
        <div className="w-48 bg-[#2f3136] p-2 space-y-1">
            <p className="text-xs font-bold text-gray-400 px-2">TEXT CHANNELS</p>
            <div className={`flex items-center gap-1 p-2 rounded ${sidebarActive === 'welcome' ? 'bg-muted/80' : ''}`}><Hash className="h-4 w-4 text-gray-500" /><span className="text-gray-300">welcome</span></div>
            <div className={`flex items-center gap-1 p-2 rounded ${sidebarActive === 'create-ticket' ? 'bg-muted/80' : ''}`}><Hash className="h-4 w-4 text-gray-500" /><span className="text-gray-300">create-ticket</span></div>
            <div className={`flex items-center gap-1 p-2 rounded ${sidebarActive === 'ticket-0123' ? 'bg-muted/80' : ''}`}><Hash className="h-4 w-4 text-gray-500" /><span className="text-gray-300">ticket-0123</span></div>
        </div>
        <div className="flex-1 bg-[#36393f] p-4 flex flex-col">
            {children}
        </div>
    </div>
);

export default function DiscordGuide({ exchange, paymentMethod }: { exchange: Exchange; paymentMethod: PaymentMethod }) {
    const [isIdCopied, setIsIdCopied] = useState(false);
    const [isDetailsCopied, setIsDetailsCopied] = useState(false);
    const appConfig = useAppConfig();

    const handleCopy = (text: string, type: 'details' | 'id') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'details') {
            setIsDetailsCopied(true);
            toast.success('Payment details copied!');
            setTimeout(() => setIsDetailsCopied(false), 2000);
        } else {
            setIsIdCopied(true);
            toast.success('Exchange ID copied!');
            setTimeout(() => setIsIdCopied(false), 2000);
        }
    };

    const guideSteps = [
        { icon: LogIn, title: "Join Our Discord", description: "Click the button below to join our official server.", visual: <Button className="w-full h-12 text-lg"><a href={appConfig?.discordInviteUrl || '#'} target="_blank" rel="noopener noreferrer">Join Server</a></Button>, sidebarActive: 'welcome' },
        { icon: Hash, title: "Find '#create-ticket'", description: "Locate and click on the channel in the list.", visual: <div className="flex items-center justify-center h-full"><p className="text-gray-400">Select '#create-ticket' from the sidebar.</p></div>, sidebarActive: 'create-ticket' },
        { icon: Plus, title: "Create a Ticket", description: "Press the button to open a private, secure channel.", visual: <Button className="w-full h-12 text-lg" variant="secondary"><Plus className="mr-2"/>Create Ticket</Button>, sidebarActive: 'create-ticket' },
        { icon: MessageSquare, title: "Provide Your Exchange ID", description: "Paste your ID and let us know you've paid.", visual: <div className="flex-1 flex items-end"><div className="w-full bg-[#40444b] rounded-lg p-2 text-gray-300 text-sm">Paste your Exchange ID here...</div></div>, sidebarActive: 'ticket-0123' },
        { icon: Clock, title: "Await Confirmation", description: "Our team will verify and process your exchange.", visual: <div className="text-gray-400 text-center flex-1 flex items-center justify-center">Our team will be with you shortly...</div>, sidebarActive: 'ticket-0123' },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto space-y-16">
            <FuturisticCard>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-glow">Finalize Your Exchange</CardTitle>
                    <CardDescription>Send your payment and open a ticket on our Discord server.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-center">Payment Details</h3>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="text-left"><p className="text-sm text-muted-foreground">You send</p><p className="font-bold text-xl">{Number(exchange.send_amount).toFixed(4)} {exchange.from_currency}</p></div>
                            <div className="p-2 bg-background rounded-full"><CurrencyIcon symbol={exchange.from_currency} /></div>
                        </div>
                        <div className="space-y-2 text-center">
                            {paymentMethod.qr_code_url && <div className="flex justify-center p-2 bg-white rounded-lg w-32 h-32 mx-auto box-glow"><img src={paymentMethod.qr_code_url} alt={`${paymentMethod.method} QR Code`} className="w-full h-full object-contain" /></div>}
                            <div className="relative p-3 border rounded-md bg-background">
                                <p className="text-xs text-muted-foreground text-left">{paymentMethod.detail_type}</p>
                                <p className="font-mono text-sm break-all text-left">{paymentMethod.details}</p>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => handleCopy(paymentMethod.details, 'details')}>{isDetailsCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-center">Your Ticket ID</h3>
                        <div className="relative p-4 rounded-lg bg-muted/50 border">
                            <p className="font-mono text-xl break-all text-center">{exchange.exchange_id}</p>
                            <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8" onClick={() => handleCopy(exchange.exchange_id, 'id')}>{isIdCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Copy this ID. You will need it for the Discord ticket.</p>
                    </div>
                </CardContent>
            </FuturisticCard>

            <motion.div className="space-y-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-glow">Completion Guide</h2>
                    <p className="text-muted-foreground mt-2">Follow these steps on Discord after you have sent your payment.</p>
                </div>
                {guideSteps.map((step, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <FuturisticCard>
                            <div className="grid md:grid-cols-[1fr_1.5fr] items-center">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary font-bold">{index + 1}</div>
                                        <h3 className="text-xl font-bold">{step.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground ml-14">{step.description}</p>
                                </div>
                                <div className="bg-muted/30 h-full flex items-center justify-center p-6 rounded-r-xl">
                                    <DiscordMockup sidebarActive={step.sidebarActive}>{step.visual}</DiscordMockup>
                                </div>
                            </div>
                        </FuturisticCard>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
