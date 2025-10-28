import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

type FaqItem = { id: string; order: number; question: string; answer: string; };

const SkeletonFaq = () => (
  <div className="border-b border-border/50 py-6">
    <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
  </div>
);

export default function Faq() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState<string | undefined>('item-0');
  const config = useAppConfig();

  const faqImageUrl = config?.faq_image_url || "https://www.pngall.com/wp-content/uploads/5/Cat-Anime-Girl-PNG.png";

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchFaqs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('order', { ascending: true })
        .abortSignal(signal);

      if (error) {
        if (error.code !== '20') { // '20' is AbortError
            toast.error('Could not load FAQs.');
            console.error("Could not load FAQs.", error);
        }
      } else if (data) {
        setFaqItems(data as FaqItem[]);
      }
      setLoading(false);
    };
    fetchFaqs();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section id="faq" className="py-12 sm:py-24">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="max-w-xl"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase font-display">
            {config?.faq_title || 'Frequently'}{' '}
            <span className="text-primary">{config?.faq_subtitle || 'Asked Questions'}</span>
          </h2>
          
          <Accordion type="single" collapsible className="w-full mt-8" value={openItem} onValueChange={setOpenItem}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonFaq key={i} />)
            ) : (
              faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={item.id} className="border-b border-border/50">
                  <AccordionTrigger className="text-left text-base hover:no-underline py-6 group">
                    <div className="flex flex-1 items-start gap-4">
                        <span className="text-sm font-semibold text-muted-foreground pt-1">{String(index + 1).padStart(2, '0')}</span>
                        <span className="flex-1 font-medium text-foreground">{item.question}</span>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted group-data-[state=open]:bg-primary ml-4 transition-colors">
                        {openItem === `item-${index}` ? <Minus className="h-4 w-4 text-primary-foreground" /> : <Plus className="h-4 w-4 text-primary" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pb-6 pl-12">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </motion.div>

        <motion.div 
          className="hidden md:flex justify-center items-end h-full"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img 
            src={faqImageUrl}
            alt="FAQ character" 
            className="max-h-[600px] object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
