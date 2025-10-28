import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is the recipient's address and where do I get it?",
        answer: "The recipient's address is the unique identifier of the wallet where you want to receive your exchanged cryptocurrency. You can find this address in your personal crypto wallet (e.g., MetaMask, Trust Wallet, or a hardware wallet). Always double-check the address for accuracy before proceeding."
    },
    {
        question: "Why is my recipient address shown as invalid?",
        answer: "An address might be shown as invalid if it doesn't match the correct format for the selected cryptocurrency (e.g., an Ethereum address starts with '0x'). It could also be due to a typo or if you've pasted an address for a different blockchain network. Ensure you are using the correct address for the correct network."
    },
    {
        question: "How do I get cashback for the exchange?",
        answer: "Cashback is typically offered to registered users as part of our loyalty program. To be eligible, make sure you are signed in to your account before creating an exchange. The cashback amount will be credited to your account after the exchange is successfully completed."
    }
];

export default function ExchangeFaq() {
  return (
    <div>
        <h2 className="text-2xl font-bold text-center mb-6">Do you have any questions?</h2>
        <Accordion type="single" collapsible className="w-full max-w-lg mx-auto">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </div>
  );
}
