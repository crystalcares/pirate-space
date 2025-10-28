import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { type CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Tables } from '@/lib/database.types';
import Autoplay from "embla-carousel-autoplay";
import { toast } from 'sonner';

type Testimonial = Tables<'testimonials'>;

const StarRating = ({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 transition-colors ${
            index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
          }`}
        />
      ))}
    </div>
  );
};

const SkeletonCard = () => (
    <div className="p-1 h-full">
        <Card className="h-full bg-card/50 backdrop-blur-lg border border-border shadow-lg relative overflow-hidden">
            <CardContent className="flex flex-col justify-between h-full p-6 space-y-6 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-md"></div>
                <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-5 w-28 bg-muted rounded"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default function Testimonials() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const config = useAppConfig();
    const autoplayPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        
        const fetchTestimonials = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('order', { ascending: true })
                .abortSignal(signal);

            if (error) {
                if (error.code !== '20') { // '20' is AbortError
                    toast.error('Could not load testimonials.');
                    console.error('Could not load testimonials.', error);
                }
            } else if (data) {
                setTestimonials(data);
            }
            setLoading(false);
        };
        fetchTestimonials();

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    if (!loading && testimonials.length === 0) {
        return null;
    }

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

    return (
        <section id="testimonials" className="py-12 sm:py-24">
            <div className="container">
                <Carousel
                    setApi={setApi}
                    plugins={[autoplayPlugin.current]}
                    className="w-full"
                    onMouseEnter={autoplayPlugin.current.stop}
                    onMouseLeave={autoplayPlugin.current.reset}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <motion.div
                        className="flex flex-col sm:flex-row justify-between items-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display">
                                {config?.testimonials_title || 'What Our Clients Say'}
                            </h2>
                            <p className="mt-2 text-lg text-foreground/80 max-w-xl">
                                {config?.testimonials_subtitle || 'Hear from traders who trust our platform.'}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 mt-4 sm:mt-0">
                            <CarouselPrevious className="relative translate-y-0 left-0 right-0 top-0" />
                            <CarouselNext className="relative translate-y-0 left-0 right-0 top-0" />
                        </div>
                    </motion.div>

                    <CarouselContent className="-ml-4">
                        {loading ? (
                            Array.from({length: 3}).map((_, i) => (
                                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <SkeletonCard />
                                </CarouselItem>
                            ))
                        ) : (
                            testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1 h-full">
                                        <Card className="h-full flex flex-col bg-card/50 backdrop-blur-xl border shadow-lg relative overflow-hidden group">
                                            <CardContent className="flex flex-col flex-grow p-6 space-y-6 z-10">
                                                <Quote className="w-8 h-8 text-primary/80" />
                                                <p className="text-foreground/80 flex-grow text-base">"{testimonial.content}"</p>
                                                <div className="space-y-4 pt-4 border-t">
                                                    <StarRating rating={testimonial.rating} />
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={testimonial.avatar_url || ''} alt={testimonial.author || 'Anonymous'} />
                                                            <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{testimonial.author || 'Anonymous'}</p>
                                                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))
                        )}
                    </CarouselContent>
                    
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: count }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${current === index ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
