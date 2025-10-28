import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Gift, Zap } from "lucide-react";
import { useAuthModal } from "@/contexts/AuthModalContext";

const PromoBanner = () => {
    const { setIsOpen, setInitialTab } = useAuthModal();

    const handleSignUp = () => {
        setInitialTab('signup');
        setIsOpen(true);
    }

    return (
        <section className="py-12 sm:py-24">
            <Card className="bg-primary border-0 p-8 md:p-12 rounded-2xl">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="flex justify-center md:justify-start">
                        <div className="flex -space-x-4">
                            <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center"><Gift className="w-12 h-12 text-primary-foreground" /></div>
                            <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center"><Zap className="w-12 h-12 text-primary-foreground" /></div>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-primary-foreground">Don't Just Swap — Earn</h2>
                        <p className="text-primary-foreground/80 mt-2">Sign up today, get discounted fees and up to 0.4% USDT cashback</p>
                        <Button variant="secondary" className="mt-6" onClick={handleSignUp}>
                            Sign Up <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </Card>
        </section>
    )
}

export default PromoBanner;
